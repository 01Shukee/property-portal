const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Property = require('../models/Property');
const Unit = require('../models/Unit');
const Lease = require('../models/Lease');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sendApplicationSubmittedNotification, sendApplicationApprovedNotification } = require('../services/emailService');
const { updatePropertyStatus } = require('../utils/propertyStatus');

/**
 * @route   POST /api/applications
 * @desc    Tenant submits application for a unit
 * @access  Private (Tenant only)
 */
router.post('/', protect, authorize('tenant'), async (req, res, next) => {
  try {
    const { propertyId, unitId } = req.body;

    const property = await Property.findById(propertyId);
    const unit = await Unit.findById(unitId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    if (unit.status !== 'vacant') {
      return res.status(400).json({
        success: false,
        message: 'This unit is not available for rent'
      });
    }

    const existingApplication = await Application.findOne({
      tenant: req.user._id,
      property: propertyId,
      status: { $in: ['pending', 'under_review'] }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending application for this property. Please wait for review.'
      });
    }

    const blockedApplication = await Application.findOne({
      tenant: req.user._id,
      property: propertyId,
      blockedFromProperty: true
    });

    if (blockedApplication) {
      return res.status(403).json({
        success: false,
        message: `You are not allowed to apply to this property. Reason: ${blockedApplication.blockReason || 'Previous application rejected'}`
      });
    }

    const application = await Application.create({
      ...req.body,
      tenant: req.user._id,
      property: propertyId,
      unit: unitId,
      status: 'pending'
    });

    await application.populate('property', 'address city state rentAmount');
    await application.populate('unit', 'unitNumber unitType rentAmount');
    await application.populate('tenant', 'name email phone');

    const propertyWithManager = await Property.findById(propertyId)
      .populate('propertyManager', 'name email');

    try {
      await sendApplicationSubmittedNotification(
        propertyWithManager.propertyManager,
        req.user,
        propertyWithManager
      );
    } catch (emailError) {
      console.error('Failed to send application notification:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/applications
 * @desc    Get applications (filtered by role)
 * @access  Private
 */
router.get('/', protect, async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'tenant') {
      query.tenant = req.user._id;
    } else if (req.user.role === 'property_manager') {
      const properties = await Property.find({ propertyManager: req.user._id }).select('_id');
      const propertyIds = properties.map(p => p._id);
      query.property = { $in: propertyIds };
    } else if (req.user.role === 'homeowner') {
      const properties = await Property.find({ homeowner: req.user._id }).select('_id');
      const propertyIds = properties.map(p => p._id);
      query.property = { $in: propertyIds };
    }

    const applications = await Application.find(query)
      .populate('property', 'address city state')
      .populate('unit', 'unitNumber unitType rentAmount')
      .populate('tenant', 'name email phone')
      .populate('reviewedBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/applications/:id
 * @desc    Get single application
 * @access  Private
 */
router.get('/:id', protect, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('property', 'address city state')
      .populate('unit', 'unitNumber unitType rentAmount')
      .populate('tenant', 'name email phone')
      .populate('reviewedBy', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const property = await Property.findById(application.property._id);
    const hasAccess = 
      application.tenant._id.toString() === req.user._id.toString() ||
      property.propertyManager?.toString() === req.user._id.toString() ||
      property.homeowner?.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/applications/:id/review
 * @desc    Property Manager/Homeowner reviews application
 * @access  Private (Property Manager, Homeowner)
 */
router.put('/:id/review', protect, authorize('property_manager', 'homeowner'), async (req, res, next) => {
  try {
    const { status, reviewNotes, blockTenant, blockReason } = req.body;

    let application = await Application.findById(req.params.id)
      .populate('property')
      .populate('unit')
      .populate('tenant', 'name email phone');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const property = await Property.findById(application.property._id);
    const hasAccess = 
      property.propertyManager?.toString() === req.user._id.toString() ||
      property.homeowner?.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this application'
      });
    }

    application.status = status;
    application.reviewNotes = reviewNotes;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();

    if (status === 'rejected' && blockTenant) {
      application.blockedFromProperty = true;
      application.blockReason = blockReason || 'Application rejected by property manager';
    }

    await application.save();

    if (status === 'approved') {
      const startDate = new Date(application.moveInDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + application.leaseDuration);

      const monthlyRent = application.unit.rentAmount / 12;

      const lease = await Lease.create({
        tenant: application.tenant._id,
        property: application.property._id,
        unit: application.unit._id,
        startDate,
        endDate,
        monthlyRent,
        securityDeposit: monthlyRent * 2,
        leaseDuration: application.leaseDuration,
        status: 'active',
        application: application._id
      });

      const unit = await Unit.findById(application.unit._id);
      unit.status = 'occupied';
      unit.currentTenant = application.tenant._id;
      unit.currentLease = lease._id;
      await unit.save();

      // Using the imported utility function
      await updatePropertyStatus(property._id);

      await Application.updateMany(
        {
          unit: application.unit._id,
          _id: { $ne: application._id },
          status: { $in: ['pending', 'under_review'] }
        },
        {
          status: 'rejected',
          reviewNotes: 'Unit has been leased to another tenant',
          reviewedAt: new Date()
        }
      );

      try {
        const tenantUser = await User.findById(application.tenant._id);
        await sendApplicationApprovedNotification(
          tenantUser,
          property,
          lease
        );
      } catch (emailError) {
        console.error('Failed to send approval notification:', emailError);
      }
    }

    await application.populate('property', 'address city state');
    await application.populate('unit', 'unitNumber unitType rentAmount');
    await application.populate('tenant', 'name email phone');
    await application.populate('reviewedBy', 'name');

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      application
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/applications/:id
 * @desc    Tenant withdraws application
 * @access  Private (Tenant only)
 */
router.delete('/:id', protect, authorize('tenant'), async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }

    if (!['pending', 'under_review'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw this application'
      });
    }

    application.status = 'withdrawn';
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;