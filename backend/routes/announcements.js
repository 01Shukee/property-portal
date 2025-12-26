const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const Property = require('../models/Property');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/announcements
 * @desc    Get announcements (filtered by role)
 * @access  Private
 */
router.get('/', protect, async (req, res, next) => {
  try {
    let announcements = [];
    
    if (req.user.role === 'property_manager') {
      // Property Manager sees all announcements they created
      announcements = await Announcement.find({ createdBy: req.user._id })
        .populate('targetProperties', 'address city')
        .populate('createdBy', 'name')
        .sort('-createdAt');
    } 
    else if (req.user.role === 'homeowner') {
      // Homeowner sees announcements for their properties
      const properties = await Property.find({ homeowner: req.user._id }).select('_id');
      const propertyIds = properties.map(p => p._id);
      
      announcements = await Announcement.find({ 
        targetProperties: { $in: propertyIds } 
      })
        .populate('targetProperties', 'address city')
        .populate('createdBy', 'name')
        .sort('-createdAt');
    }
    else if (req.user.role === 'tenant') {
      // Tenants see announcements for properties they rent (to be implemented with Lease model)
      // For now, return empty array
      announcements = [];
    }
    
    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/announcements
 * @desc    Create announcement
 * @access  Private (Property Manager, Homeowner)
 */
/**
 * @route   POST /api/announcements
 * @desc    Create announcement
 * @access  Private (Property Manager, Homeowner)
 */
router.post('/', protect, authorize('property_manager', 'homeowner'), async (req, res, next) => {
  try {
    const { title, message, targetProperties, type } = req.body;

    // Verify user has access to target properties
    for (const propertyId of targetProperties) {
      const property = await Property.findById(propertyId)
        .populate('homeowner')
        .populate('propertyManager');
      
      if (!property) {
        return res.status(404).json({
          success: false,
          message: `Property ${propertyId} not found`
        });
      }

      // Check access based on role
      let hasAccess = false;
      
      if (req.user.role === 'property_manager') {
        // Property Manager has access if they manage this property
        hasAccess = property.propertyManager._id.toString() === req.user._id.toString();
      } else if (req.user.role === 'homeowner') {
        // Homeowner has access if they own this property
        hasAccess = property.homeowner && property.homeowner._id.toString() === req.user._id.toString();
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to announce to one or more properties'
        });
      }
    }

    // Create announcement
    const announcement = await Announcement.create({
      createdBy: req.user._id,
      title,
      message,
      targetProperties,
      type: type || 'general'
    });

    await announcement.populate('targetProperties', 'address city');
    await announcement.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/announcements/:id/read
 * @desc    Mark announcement as read
 * @access  Private
 */
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check if already read
    const alreadyRead = announcement.readBy.some(
      r => r.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      announcement.readBy.push({
        user: req.user._id,
        readAt: new Date()
      });
      await announcement.save();
    }

    res.status(200).json({
      success: true,
      message: 'Marked as read'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/announcements/:id
 * @desc    Delete announcement
 * @access  Private (Creator only)
 */
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Only creator can delete
    if (announcement.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this announcement'
      });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;