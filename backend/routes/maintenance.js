const express = require('express');
const router = express.Router();
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Property = require('../models/Property');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const Announcement = require('../models/Announcement');
const { sendMaintenanceRequestNotification, sendMaintenanceResolvedNotification } = require('../services/emailService');
const Lease = require('../models/Lease');

/**
 * @route   GET /api/maintenance
 * @desc    Get maintenance requests (filtered by role)
 * @access  Private
 */
router.get('/', protect, async (req, res, next) => {
  try {
    let filter = {};
    
    // Tenants see only their requests
    if (req.user.role === 'tenant') {
      filter.tenant = req.user._id;
    } 
    // Property managers see requests for properties of their homeowners
    else if (req.user.role === 'property_manager') {
      // Find all homeowners managed by this property manager
      const homeowners = await User.find({ 
        propertyManager: req.user._id,
        role: 'homeowner'
      }).select('_id');
      
      const homeownerIds = homeowners.map(h => h._id);
      
      // Find properties owned by these homeowners
      const properties = await Property.find({ 
        homeowner: { $in: homeownerIds } 
      }).select('_id');
      
      const propertyIds = properties.map(p => p._id);
      filter.property = { $in: propertyIds };
    }
    // Homeowners see requests for their properties
    else if (req.user.role === 'homeowner') {
      const properties = await Property.find({ 
        homeowner: req.user._id 
      }).select('_id');
      
      const propertyIds = properties.map(p => p._id);
      filter.property = { $in: propertyIds };
    }
    
    const requests = await MaintenanceRequest.find(filter)
      .populate('property', 'address city state')
      .populate('tenant', 'name email phone')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/maintenance/:id
 * @desc    Get single maintenance request
 * @access  Private
 */
router.get('/:id', protect, async (req, res, next) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate({
        path: 'property',
        select: 'address city state homeowner',
        populate: {
          path: 'homeowner',
          select: 'name propertyManager'
        }
      })
      .populate('tenant', 'name email phone');
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    // Check access
    const hasAccess = 
      request.tenant._id.toString() === req.user._id.toString() ||
      request.property.homeowner._id.toString() === req.user._id.toString() ||
      (request.property.homeowner.propertyManager && 
       request.property.homeowner.propertyManager.toString() === req.user._id.toString());
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request'
      });
    }
    
    res.status(200).json({
      success: true,
      request
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/maintenance
 * @desc    Create maintenance request
 * @access  Private (Tenants only)
 */
router.post('/', protect, authorize('tenant'), async (req, res, next) => {
  try {
    // Set tenant as current user
    req.body.tenant = req.user._id;
    
    // Verify property exists
    const property = await Property.findById(req.body.property);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    const request = await MaintenanceRequest.create(req.body);
    
    // Populate for response
    await request.populate('property', 'address city state');
    await request.populate('tenant', 'name email phone');
    
    // Get property manager details
    const propertyWithDetails = await Property.findById(req.body.property)
      .populate('propertyManager', 'name email')
      .populate('homeowner', 'name email');

    // Send email notifications
    try {
      // Notify property manager if exists
      if (propertyWithDetails.propertyManager) {
        await sendMaintenanceRequestNotification(
          propertyWithDetails.propertyManager,
          request,
          propertyWithDetails,
          req.user
        );
      }
      
      // Notify homeowner if exists
      if (propertyWithDetails.homeowner) {
        await sendMaintenanceRequestNotification(
          propertyWithDetails.homeowner,
          request,
          propertyWithDetails,
          req.user
        );
      }
    } catch (emailError) {
      console.error('Failed to send maintenance notification:', emailError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Maintenance request submitted successfully',
      request
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/maintenance/:id
 * @desc    Update maintenance request status
 * @access  Private (Property Manager, Homeowner)
 */
router.put('/:id', protect, authorize('property_manager', 'homeowner'), async (req, res, next) => {
  try {
    let request = await MaintenanceRequest.findById(req.params.id)
      .populate('property')
      .populate('tenant', 'name email');
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    // Get property with full details
    const property = await Property.findById(request.property._id)
      .populate('homeowner')
      .populate('propertyManager');
    
    // Check access
    let hasAccess = false;
    
    if (req.user.role === 'property_manager') {
      hasAccess = property.propertyManager._id.toString() === req.user._id.toString();
    } else if (req.user.role === 'homeowner') {
      hasAccess = property.homeowner && property.homeowner._id.toString() === req.user._id.toString();
    }
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }
    
    const oldStatus = request.status;
    
    // If marking as resolved, set resolvedAt and create announcement
    if (req.body.status === 'resolved' && oldStatus !== 'resolved') {
      req.body.resolvedAt = new Date();
      
      // CREATE ANNOUNCEMENT SPECIFICALLY FOR THE TENANT
      try {
        const Announcement = require('../models/Announcement');
        await Announcement.create({
          createdBy: req.user._id,
          title: `✅ Issue Resolved: ${request.title}`,
          message: `Good news! The maintenance issue "${request.title}" has been resolved.\n\n${req.body.resolutionNotes || 'The issue has been fixed and is now complete.'}`,
          targetProperties: [request.property._id],
          type: 'maintenance'
        });
      } catch (err) {
        console.error('Failed to create announcement:', err);
        // Don't fail the request if announcement fails
      }

      // Send email notification to tenant
      try {
        await sendMaintenanceResolvedNotification(
          request.tenant,
          { ...request.toObject(), resolutionNotes: req.body.resolutionNotes },
          request.property
        );
      } catch (emailError) {
        console.error('Failed to send resolution notification:', emailError);
      }
    }
    
    // Update request
    request = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('property', 'address city state')
      .populate('tenant', 'name email phone');
    
    res.status(200).json({
      success: true,
      message: 'Maintenance request updated successfully',
      request
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE route removed - Maintenance requests should not be deleted
 * They should only be marked as resolved/cancelled
 * This preserves history and accountability
 */

// router.delete('/:id', protect, async (req, res, next) => {
//   try {
//     const request = await MaintenanceRequest.findById(req.params.id);
//     
//     if (!request) {
//       return res.status(404).json({
//         success: false,
//         message: 'Maintenance request not found'
//       });
//     }
//     
//     // Only tenant who created can cancel
//     if (request.tenant.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: 'Only the tenant who created this request can cancel it'
//       });
//     }
//     
//     await request.deleteOne();
//     
//     res.status(200).json({
//       success: true,
//       message: 'Maintenance request cancelled successfully'
//     });
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = router;