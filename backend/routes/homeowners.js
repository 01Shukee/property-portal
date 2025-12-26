const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const crypto = require('crypto');
const { protect, authorize } = require('../middleware/auth');
const { sendHomeownerInvitation } = require('../services/emailService');

/**
 * @route   POST /api/homeowners/invite/:propertyId
 * @desc    Property Manager invites a homeowner for specific property
 * @access  Private (Property Manager only)
 */
router.post('/invite/:propertyId', protect, authorize('property_manager'), async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    const { propertyId } = req.params;

    // Verify property exists and belongs to this PM
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

    if (property.homeowner) {
      return res.status(400).json({
        success: false,
        message: 'This property already has a homeowner assigned'
      });
    }

    // Check if user with this email already exists
    let homeowner = await User.findOne({ email });
    let isExistingHomeowner = !!homeowner;

    if (!homeowner) {
      // Create new homeowner account
      const tempPassword = crypto.randomBytes(16).toString('hex');
      
      homeowner = await User.create({
        name,
        email,
        phone,
        address,
        role: 'homeowner',
        password: tempPassword,
        isActive: false
      });
    } else {
      // Verify existing user is a homeowner
      if (homeowner.role !== 'homeowner') {
        return res.status(400).json({
          success: false,
          message: 'This email is already registered with a different role'
        });
      }

      // Check if they manage properties under a different PM
      const otherPMProperty = await Property.findOne({ 
        homeowner: homeowner._id,
        propertyManager: { $ne: req.user._id }
      });

      if (otherPMProperty) {
        return res.status(400).json({
          success: false,
          message: 'This homeowner is already managed by another property manager'
        });
      }
    }

    // Assign property to homeowner
    property.homeowner = homeowner._id;
    property.pendingHomeownerName = name;
    property.pendingHomeownerEmail = email;
    property.pendingHomeownerPhone = phone;
    property.pendingHomeownerAddress = address || '';

    // If homeowner already active (existing homeowner), mark as accepted immediately
    if (isExistingHomeowner && homeowner.isActive) {
      property.homeownerInvitationStatus = 'accepted';
      await property.save();

      return res.status(200).json({
        success: true,
        message: 'Property assigned to existing homeowner successfully',
        property: {
          _id: property._id,
          address: property.address,
          city: property.city
        },
        homeowner: {
          name: homeowner.name,
          email: homeowner.email
        },
        isExistingHomeowner: true
      });
    }

    // For new homeowners, send invitation
    property.homeownerInvitationStatus = 'pending';
    await property.save();

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    homeowner.invitationToken = invitationToken;
    homeowner.invitationExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    await homeowner.save();

    // Generate invitation link
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation/${invitationToken}`;

    // Send email notification
    try {
      await sendHomeownerInvitation(
        { name, email },
        invitationLink,
        `${property.address}, ${property.city}`
      );
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Homeowner invitation sent successfully',
      property: {
        _id: property._id,
        address: property.address,
        city: property.city
      },
      invitationLink,
      isExistingHomeowner: false
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/homeowners/accept-invitation/:token
 * @desc    Homeowner accepts invitation and sets password
 * @access  Public
 */
router.post('/accept-invitation/:token', async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Find homeowner by invitation token
    const homeowner = await User.findOne({
      invitationToken: req.params.token,
      invitationExpires: { $gt: Date.now() },
      role: 'homeowner'
    });

    if (!homeowner) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired invitation token'
      });
    }

    // Update homeowner
    homeowner.password = password;
    homeowner.isActive = true;
    homeowner.invitationToken = undefined;
    homeowner.invitationExpires = undefined;
    await homeowner.save();

    // Update property invitation status
    await Property.updateMany(
      { 
        homeowner: homeowner._id,
        homeownerInvitationStatus: 'pending'
      },
      { 
        homeownerInvitationStatus: 'accepted'
      }
    );

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully. You can now login.'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/homeowners/verify-invitation/:token
 * @desc    Verify invitation token is valid
 * @access  Public
 */
router.get('/verify-invitation/:token', async (req, res, next) => {
  try {
    const homeowner = await User.findOne({
      invitationToken: req.params.token,
      invitationExpires: { $gt: Date.now() },
      role: 'homeowner'
    }).select('name email');

    if (!homeowner) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired invitation token'
      });
    }

    // Get the property this invitation is for
    const property = await Property.findOne({
      homeowner: homeowner._id,
      homeownerInvitationStatus: 'pending'
    }).select('address city state');

    res.status(200).json({
      success: true,
      homeowner: {
        name: homeowner.name,
        email: homeowner.email
      },
      property: property ? {
        address: property.address,
        city: property.city,
        state: property.state
      } : null
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;