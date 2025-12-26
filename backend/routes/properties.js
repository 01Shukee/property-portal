const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/properties
 * @desc    Get properties (filtered by role)
 * @access  Private
 */
router.get('/', protect, async (req, res, next) => {
  try {
    let properties = [];
    
    if (req.user.role === 'property_manager') {
      // Property Manager sees all their properties
      properties = await Property.find({ 
        propertyManager: req.user._id 
      })
        .populate('homeowner', 'name email phone')
        .sort('-createdAt');
    } 
    else if (req.user.role === 'homeowner') {
      // Homeowner sees only properties assigned to them
      properties = await Property.find({ 
        homeowner: req.user._id 
      })
        .populate('propertyManager', 'name email phone')
        .sort('-createdAt');
    }
    else if (req.user.role === 'tenant') {
      // Tenants see vacant properties (for browsing)
      properties = await Property.find({ 
        status: 'vacant' 
      })
        .populate('homeowner', 'name email phone')
        .sort('-createdAt');
    }
    
    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/properties/:id
 * @desc    Get single property
 * @access  Private
 */
router.get('/:id', protect, async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('homeowner', 'name email phone')
      .populate('propertyManager', 'name email phone');
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Check access
    const hasAccess = 
      (property.homeowner && property.homeowner._id.toString() === req.user._id.toString()) ||
      property.propertyManager._id.toString() === req.user._id.toString();
    
    if (!hasAccess && req.user.role !== 'tenant') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this property'
      });
    }
    
    res.status(200).json({
      success: true,
      property
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/properties
 * @desc    Create property (Property Manager only, no homeowner initially)
 * @access  Private (Property Manager only)
 */
router.post('/', protect, authorize('property_manager'), async (req, res, next) => {
  try {
    // Create property without homeowner
    const property = await Property.create({
      ...req.body,
      propertyManager: req.user._id,
      homeowner: null,
      homeownerInvitationStatus: 'none'
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/properties/:id
 * @desc    Update property (Property Manager only)
 * @access  Private (Property Manager only)
 */
router.put('/:id', protect, authorize('property_manager'), async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Verify property manager has access
    if (property.propertyManager.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }
    
    // Don't allow changing propertyManager
    delete req.body.propertyManager;
    
    property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('homeowner', 'name email phone')
      .populate('propertyManager', 'name email phone');
    
    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      property
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/properties/:id
 * @desc    Delete property (Property Manager only)
 * @access  Private (Property Manager only)
 */
router.delete('/:id', protect, authorize('property_manager'), async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Verify property manager has access
    if (property.propertyManager.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }
    
    await property.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;