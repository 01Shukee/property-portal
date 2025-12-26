const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');
const Property = require('../models/Property');
const Lease = require('../models/Lease');
const { protect, authorize } = require('../middleware/auth');
const { updatePropertyStatus } = require('../utils/propertyStatus');

/**
 * @route   GET /api/units/property/:propertyId
 * @desc    Get all units for a property
 * @access  Private
 */
router.get('/property/:propertyId', protect, async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    // Verify property exists and user has access
    const property = await Property.findById(propertyId)
      .populate('homeowner')
      .populate('propertyManager');
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check access
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

    // Get all units for this property
    const units = await Unit.find({ property: propertyId })
      .populate('currentTenant', 'name email phone')
      .populate('currentLease')
      .sort('unitNumber');
    
    res.status(200).json({
      success: true,
      count: units.length,
      units
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/units/:id
 * @desc    Get single unit
 * @access  Private
 */
router.get('/:id', protect, async (req, res, next) => {
  try {
    const unit = await Unit.findById(req.params.id)
      .populate('property', 'address city state')
      .populate('currentTenant', 'name email phone')
      .populate('currentLease');
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    res.status(200).json({
      success: true,
      unit
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/units
 * @desc    Create unit (Property Manager only)
 * @access  Private (Property Manager)
 */
router.post('/', protect, authorize('property_manager'), async (req, res, next) => {
  try {
    const { property: propertyId } = req.body;

    // Verify property exists and belongs to PM
    const property = await Property.findOne({
      _id: propertyId,
      propertyManager: req.user._id
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found or not under your management'
      });
    }

    // Check if unit number already exists for this property
    const existingUnit = await Unit.findOne({
      property: propertyId,
      unitNumber: req.body.unitNumber
    });

    if (existingUnit) {
      return res.status(400).json({
        success: false,
        message: 'Unit number already exists for this property'
      });
    }

    // Create unit
    const unit = await Unit.create(req.body);
    await unit.populate('property', 'address city state');

    // Auto-update property status
    await updatePropertyStatus(req.body.property);

    res.status(201).json({
      success: true,
      message: 'Unit created successfully',
      unit
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/units/:id
 * @desc    Update unit (Property Manager only)
 * @access  Private (Property Manager)
 */
router.put('/:id', protect, authorize('property_manager'), async (req, res, next) => {
  try {
    let unit = await Unit.findById(req.params.id).populate('property');
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    // Verify PM has access
    const property = await Property.findById(unit.property._id);
    if (property.propertyManager.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    // Don't allow changing property
    delete req.body.property;
    
    unit = await Unit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('property', 'address city state')
      .populate('currentTenant', 'name email phone');
    
    // Auto-update property status
    await updatePropertyStatus(unit.property._id);
    
    res.status(200).json({
      success: true,
      message: 'Unit updated successfully',
      unit
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/units/:id
 * @desc    Delete unit (Property Manager only)
 * @access  Private (Property Manager)
 */
router.delete('/:id', protect, authorize('property_manager'), async (req, res, next) => {
  try {
    const unit = await Unit.findById(req.params.id).populate('property');
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    // Verify PM has access
    const property = await Property.findById(unit.property._id);
    if (property.propertyManager.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Can't delete if unit is occupied
    if (unit.status === 'occupied') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an occupied unit. Terminate the lease first.'
      });
    }
    
    const propertyId = unit.property._id;
    await unit.deleteOne();
    
    // Auto-update property status
    await updatePropertyStatus(propertyId);
    
    res.status(200).json({
      success: true,
      message: 'Unit deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/units/property/:propertyId/vacant
 * @desc    Get vacant units for a property
 * @access  Private
 */
router.get('/property/:propertyId/vacant', protect, async (req, res, next) => {
  try {
    const units = await Unit.find({
      property: req.params.propertyId,
      status: 'vacant'
    })
      .populate('property', 'address city state')
      .sort('unitNumber');
    
    res.status(200).json({
      success: true,
      count: units.length,
      units
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/units/browse
 * @desc    Get all vacant units for browsing (tenants)
 * @access  Private
 */
router.get('/browse', protect, async (req, res, next) => {
  try {
    // Get all vacant units across all properties
    const units = await Unit.find({ status: 'vacant' })
      .populate({
        path: 'property',
        select: 'address city state propertyType description',
        populate: {
          path: 'propertyManager',
          select: 'name email phone'
        }
      })
      .sort('property address unitNumber');
    
    res.status(200).json({
      success: true,
      count: units.length,
      units
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;