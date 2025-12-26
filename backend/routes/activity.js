const express = require('express');
const router = express.Router();
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Announcement = require('../models/Announcement');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/activity/:propertyId
 * @desc    Get activity feed for a property (announcements + maintenance)
 * @access  Private
 */
router.get('/:propertyId', protect, async (req, res, next) => {
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
      req.user.role === 'tenant'; // Tenants can see their property's feed

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this property\'s activity'
      });
    }

    // Get announcements for this property
    const announcements = await Announcement.find({
      targetProperties: propertyId
    })
      .populate('createdBy', 'name role')
      .sort('-createdAt')
      .lean();

    // Get maintenance requests (all active + resolved in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const maintenance = await MaintenanceRequest.find({
      property: propertyId,
      $or: [
        { status: { $ne: 'resolved' } }, // All non-resolved
        { status: 'resolved', resolvedAt: { $gte: sevenDaysAgo } } // Resolved in last 7 days
      ]
    })
      .populate('tenant', 'name')
      .sort('-createdAt')
      .lean();

    // Combine and sort by date
    const activities = [
      ...announcements.map(a => ({
        ...a,
        activityType: 'announcement',
        activityDate: a.createdAt
      })),
      ...maintenance.map(m => ({
        ...m,
        activityType: 'maintenance',
        activityDate: m.resolvedAt || m.createdAt
      }))
    ].sort((a, b) => new Date(b.activityDate) - new Date(a.activityDate));

    res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;