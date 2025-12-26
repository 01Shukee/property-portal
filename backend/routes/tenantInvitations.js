const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Unit = require('../models/Unit');
const Property = require('../models/Property');
const Lease = require('../models/Lease');
const crypto = require('crypto');
const { protect, authorize } = require('../middleware/auth');
const { updatePropertyStatus } = require('../utils/propertyStatus');
const { sendTenantInvitationEmail } = require('../services/emailService'); // ADDED

/**
 * @route   POST /api/tenant-invitations/invite/:unitId
 * @desc    Property Manager invites tenant to specific unit
 * @access  Private (Property Manager only)
 */
router.post('/invite/:unitId', protect, authorize('property_manager'), async (req, res, next) => {
  try {
    const { name, email, phone, moveInDate, leaseDuration } = req.body;
    const { unitId } = req.params;

    // Verify unit exists and is vacant
    const unit = await Unit.findById(unitId).populate('property');
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    if (unit.status !== 'vacant') {
      return res.status(400).json({
        success: false,
        message: 'This unit is not available'
      });
    }

    // Verify PM owns the property
    const property = await Property.findById(unit.property._id);
    if (property.propertyManager.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if user exists
    let tenant = await User.findOne({ email });
    let isExistingTenant = !!tenant;

    if (!tenant) {
      // Create new tenant account
      const tempPassword = crypto.randomBytes(16).toString('hex');
      
      tenant = await User.create({
        name,
        email,
        phone,
        role: 'tenant',
        password: tempPassword,
        isActive: false
      });
    } else {
      // Verify existing user is a tenant
      if (tenant.role !== 'tenant') {
        return res.status(400).json({
          success: false,
          message: 'This email is already registered with a different role'
        });
      }

      // Check if tenant already has an active lease
      const existingLease = await Lease.findOne({
        tenant: tenant._id,
        status: 'active'
      });

      if (existingLease) {
        return res.status(400).json({
          success: false,
          message: 'This tenant already has an active lease'
        });
      }

      // Check if tenant already has a pending invitation
      if (tenant.invitationToken && tenant.invitationExpires > Date.now()) {
        return res.status(400).json({
          success: false,
          message: 'This tenant already has a pending invitation'
        });
      }
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    tenant.invitationToken = invitationToken;
    tenant.invitationExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    
    // Store invitation details
    tenant.pendingInvitation = {
      unit: unitId,
      property: property._id,
      moveInDate,
      leaseDuration
    };
    
    await tenant.save();

    // ONLY mark unit as reserved AFTER everything succeeds
    unit.status = 'reserved';
    await unit.save();

    // Update property status
    await updatePropertyStatus(property._id);

    // Generate invitation link
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-tenant-invitation/${invitationToken}`;

    // Send email notification
    try {
      await sendTenantInvitationEmail(tenant, unit, property, invitationLink);
      console.log(`✅ Invitation email sent to ${tenant.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send invitation email:', emailError);
      // Don't fail the request if email fails - invitation was created successfully
    }

    res.status(201).json({
      success: true,
      message: 'Tenant invitation sent successfully',
      invitationLink,
      isExistingTenant
    });
  } catch (error) {
    // If any error occurs, the unit stays vacant (transaction safety)
    console.error('Error sending invitation:', error);
    next(error);
  }
});

/**
 * @route   GET /api/tenant-invitations/verify/:token
 * @desc    Verify tenant invitation token
 * @access  Public
 */
router.get('/verify/:token', async (req, res, next) => {
  try {
    const tenant = await User.findOne({
      invitationToken: req.params.token,
      invitationExpires: { $gt: Date.now() },
      role: 'tenant'
    }).select('name email pendingInvitation');

    if (!tenant) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired invitation token'
      });
    }

    // Get unit and property details
    const unit = await Unit.findById(tenant.pendingInvitation.unit)
      .populate('property', 'address city state');

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    res.status(200).json({
      success: true,
      tenant: {
        name: tenant.name,
        email: tenant.email
      },
      unit: {
        unitNumber: unit.unitNumber,
        unitType: unit.unitType,
        rentAmount: unit.rentAmount
      },
      property: {
        address: unit.property.address,
        city: unit.property.city,
        state: unit.property.state
      },
      invitation: {
        moveInDate: tenant.pendingInvitation.moveInDate,
        leaseDuration: tenant.pendingInvitation.leaseDuration
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/tenant-invitations/accept/:token
 * @desc    Tenant accepts invitation and sets password
 * @access  Public
 */
router.post('/accept/:token', async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Find tenant by token
    const tenant = await User.findOne({
      invitationToken: req.params.token,
      invitationExpires: { $gt: Date.now() },
      role: 'tenant'
    });

    if (!tenant) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired invitation token'
      });
    }

    // Get unit details
    const unit = await Unit.findById(tenant.pendingInvitation.unit);
    
    if (!unit || unit.status !== 'reserved') {
      return res.status(400).json({
        success: false,
        message: 'Unit is no longer available'
      });
    }

    // Calculate lease dates
    const startDate = new Date(tenant.pendingInvitation.moveInDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + tenant.pendingInvitation.leaseDuration);

    const monthlyRent = unit.rentAmount / 12;

    // Create lease
    const lease = await Lease.create({
      tenant: tenant._id,
      property: tenant.pendingInvitation.property,
      unit: unit._id,
      startDate,
      endDate,
      monthlyRent,
      securityDeposit: monthlyRent * 2,
      leaseDuration: tenant.pendingInvitation.leaseDuration,
      status: 'active'
    });

    // Update unit
    unit.status = 'occupied';
    unit.currentTenant = tenant._id;
    unit.currentLease = lease._id;
    await unit.save();

    // Update property status
    await updatePropertyStatus(tenant.pendingInvitation.property);

    // Update tenant
    tenant.password = password;
    tenant.isActive = true;
    tenant.invitationToken = undefined;
    tenant.invitationExpires = undefined;
    tenant.pendingInvitation = undefined;
    await tenant.save();

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully. You can now login.'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;