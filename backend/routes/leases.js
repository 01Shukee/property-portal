const express = require('express');
const router = express.Router();
const Lease = require('../models/Lease');
const Property = require('../models/Property');
const Unit = require('../models/Unit');
const { protect, authorize } = require('../middleware/auth');
const { updatePropertyStatus } = require('../utils/propertyStatus');

/**
 * @route   GET /api/leases
 * @desc    Get leases (filtered by role)
 * @access  Private
 */
router.get('/', protect, async (req, res, next) => {
  try {
    let filter = {};
    
    if (req.user.role === 'tenant') {
      filter.tenant = req.user._id;
    } 
    else if (req.user.role === 'property_manager') {
      const properties = await Property.find({ propertyManager: req.user._id }).select('_id');
      const propertyIds = properties.map(p => p._id);
      filter.property = { $in: propertyIds };
    }
    else if (req.user.role === 'homeowner') {
      const properties = await Property.find({ homeowner: req.user._id }).select('_id');
      const propertyIds = properties.map(p => p._id);
      filter.property = { $in: propertyIds };
    }
    
    const leases = await Lease.find(filter)
      .populate('property', 'address city state')
      .populate('tenant', 'name email phone')
      .populate('unit', 'unitNumber unitType')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: leases.length,
      leases
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/leases/:id
 * @desc    Get single lease
 * @access  Private
 */
router.get('/:id', protect, async (req, res, next) => {
  try {
    const lease = await Lease.findById(req.params.id)
      .populate('property', 'address city state homeowner propertyManager')
      .populate('tenant', 'name email phone address')
      .populate('unit', 'unitNumber unitType bedrooms bathrooms monthlyRent');
    
    if (!lease) {
      return res.status(404).json({
        success: false,
        message: 'Lease not found'
      });
    }
    
    const hasAccess = 
      lease.tenant._id.toString() === req.user._id.toString() ||
      lease.property.homeowner?.toString() === req.user._id.toString() ||
      lease.property.propertyManager?.toString() === req.user._id.toString();
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this lease'
      });
    }
    
    res.status(200).json({
      success: true,
      lease
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/leases/property/:propertyId/tenants
 * @desc    Get all tenants for a property (current and past)
 * @access  Private
 */
router.get('/property/:propertyId/tenants', protect, async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId)
      .populate('homeowner')
      .populate('propertyManager');
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const hasAccess = 
      property.homeowner?._id.toString() === req.user._id.toString() ||
      property.propertyManager?._id.toString() === req.user._id.toString() ||
      req.user.role === 'tenant';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const leases = await Lease.find({ property: propertyId })
      .populate('tenant', 'name email phone')
      .populate('unit', 'unitNumber unitType')
      .sort('-startDate');
    
    res.status(200).json({
      success: true,
      count: leases.length,
      leases
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/leases/:id/terminate
 * @desc    Terminate lease (Property Manager, Homeowner)
 * @access  Private
 */
router.put('/:id/terminate', protect, authorize('property_manager', 'homeowner'), async (req, res, next) => {
  try {
    const { terminationReason } = req.body;

    let lease = await Lease.findById(req.params.id)
      .populate('property')
      .populate('unit');
    
    if (!lease) {
      return res.status(404).json({
        success: false,
        message: 'Lease not found'
      });
    }
    
    const property = await Property.findById(lease.property._id);
    
    const hasAccess = 
      property.propertyManager?.toString() === req.user._id.toString() ||
      property.homeowner?.toString() === req.user._id.toString();
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    lease.status = 'terminated';
    lease.terminatedAt = new Date();
    lease.terminationReason = terminationReason;
    await lease.save();
    
    await Unit.findByIdAndUpdate(lease.unit._id, {
      status: 'vacant',
      currentTenant: null,
      currentLease: null
    });
    
    // This now correctly uses the function imported from /utils/propertyStatus
    await updatePropertyStatus(property._id);
    
    await lease.populate('tenant', 'name email phone');
    await lease.populate('unit', 'unitNumber unitType');

    res.status(200).json({
      success: true,
      message: 'Lease terminated successfully',
      lease
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;