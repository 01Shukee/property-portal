const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Property = require('../models/Property');
const User = require('../models/User');
const Lease = require('../models/Lease');
const { protect, authorize } = require('../middleware/auth');
const { initializePayment, verifyPayment } = require('../utils/flutterwave');
const crypto = require('crypto');
const { sendPaymentSuccessNotification } = require('../services/emailService');
const axios = require('axios');

/**
 * @route   GET /api/payments/test-flutterwave
 * @desc    Test Flutterwave connection
 * @access  Private
 */
router.get('/test-flutterwave', protect, async (req, res) => {
  try {
    console.log('🧪 Testing Flutterwave...');
    console.log('🔑 API Key:', process.env.FLUTTERWAVE_SECRET_KEY ? 'EXISTS' : 'MISSING');
    
    const testPayload = {
      tx_ref: 'TEST-' + Date.now(),
      amount: 1000,
      currency: 'NGN',
      redirect_url: 'https://example.com',
      customer: {
        email: 'test@example.com',
        name: 'Test User'
      }
    };

    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      testPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Flutterwave response:', response.data);

    res.json({
      success: true,
      message: 'Flutterwave is working!',
      data: response.data
    });
  } catch (error) {
    console.error('❌ Flutterwave test failed:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      message: 'Flutterwave test failed',
      error: error.response?.data || error.message
    });
  }
});

/**
 * @route   GET /api/payments
 * @desc    Get payments (filtered by role)
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
    
    const payments = await Payment.find(filter)
      .populate('property', 'address city state rentAmount')
      .populate('tenant', 'name email phone')
      .populate('unit', 'unitNumber unitType')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/payments/:id
 * @desc    Get single payment
 * @access  Private
 */
router.get('/:id', protect, async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('property', 'address city state rentAmount homeowner propertyManager')
      .populate('tenant', 'name email phone')
      .populate('unit', 'unitNumber unitType');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    const hasAccess = 
      payment.tenant._id.toString() === req.user._id.toString() ||
      payment.property.homeowner?.toString() === req.user._id.toString() ||
      payment.property.propertyManager?.toString() === req.user._id.toString();
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }
    
    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/payments/initiate
 * @desc    Initiate payment with Flutterwave (auto-fills unit from tenant's lease)
 * @access  Private (Tenant only)
 */
router.post('/initiate', protect, authorize('tenant'), async (req, res, next) => {
  try {
    console.log('💳 Payment initiation started');
    console.log('👤 User:', req.user.email);
    console.log('📦 Request body:', req.body);

    const { amount, paymentType, paymentFor } = req.body;

    // Get tenant's active lease to find their unit
    const lease = await Lease.findOne({
      tenant: req.user._id,
      status: 'active'
    }).populate('property').populate('unit');

    console.log('📋 Found lease:', lease ? 'YES' : 'NO');
    if (lease) {
      console.log('🏠 Property:', lease.property?.address);
      console.log('🚪 Unit:', lease.unit?.unitNumber || 'No unit assigned');
      console.log('💰 Monthly Rent:', lease.monthlyRent);
    }

    if (!lease) {
      console.log('❌ No active lease found');
      return res.status(404).json({
        success: false,
        message: 'No active lease found'
      });
    }

    // Validate payment amount based on lease
    const monthlyRent = lease.monthlyRent;
    const sixMonthRent = monthlyRent * 6;
    const oneYearRent = monthlyRent * 12;

    console.log('💵 Amount validation:');
    console.log('   Requested:', amount);
    console.log('   6 months:', sixMonthRent);
    console.log('   1 year:', oneYearRent);

    // Only allow 6 months or 1 year payments
    if (amount !== sixMonthRent && amount !== oneYearRent) {
      console.log('❌ Amount validation failed');
      return res.status(400).json({
        success: false,
        message: `Invalid amount. Please pay either ₦${sixMonthRent.toLocaleString()} (6 months) or ₦${oneYearRent.toLocaleString()} (1 year)`
      });
    }

    console.log('✅ Amount validated');

    // Create payment record with unit automatically (handle missing unit)
    const payment = await Payment.create({
      tenant: req.user._id,
      property: lease.property._id,
      unit: lease.unit?._id || null, // ✅ Handle leases without units
      amount,
      paymentType: paymentType || 'rent',
      paymentFor: paymentFor || 'rent',
      paymentMethod: 'flutterwave',
      status: 'pending'
    });

    console.log('✅ Payment record created:', payment._id);

    // Generate transaction reference
    const txRef = `TXN-${Date.now()}-${payment._id}`;
    payment.transactionId = txRef;
    await payment.save();

    console.log('✅ Transaction ID:', txRef);

    // Flutterwave payment link
    const flutterwavePayload = {
      tx_ref: txRef,
      amount: amount,
      currency: 'NGN',
      redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-callback`,
      payment_options: 'card,banktransfer,ussd',
      customer: {
        email: req.user.email,
        name: req.user.name,
        phonenumber: req.user.phone || ''
      },
      customizations: {
        title: 'PropertyHub Rent Payment',
        description: `Rent payment for ${lease.property.address}${lease.unit ? ' - Unit ' + lease.unit.unitNumber : ''}`, // ✅ Handle missing unit
        logo: ''
      },
      meta: {
        paymentId: payment._id.toString(),
        propertyId: lease.property._id.toString(),
        unitId: lease.unit?._id.toString() || null // ✅ Handle missing unit
      }
    };

    console.log('📤 Sending to Flutterwave...');
    console.log('🔑 Flutterwave Key exists?', !!process.env.FLUTTERWAVE_SECRET_KEY);

    // Get Flutterwave payment link
    const flutterwaveResponse = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      flutterwavePayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Flutterwave response received');
    console.log('🔗 Payment link:', flutterwaveResponse.data.data.link);

    res.status(200).json({
      success: true,
      paymentUrl: flutterwaveResponse.data.data.link,
      payment
    });
  } catch (error) {
    console.error('❌ Payment initiation error:', error.message);
    console.error('❌ Error details:', error.response?.data || error);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to initiate payment',
      error: error.response?.data || error.message
    });
  }
});

/**
 * @route   POST /api/payments/initialize
 * @desc    Initialize payment (Legacy - allows manual property selection)
 * @access  Private (Tenants)
 */
router.post('/initialize', protect, authorize('tenant'), async (req, res, next) => {
  try {
    const { propertyId, amount, paymentType, description } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const reference = `FLW-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const payment = await Payment.create({
      tenant: req.user._id,
      property: propertyId,
      amount,
      paymentType: paymentType || 'rent',
      description,
      status: 'pending',
      flutterwaveReference: reference,
      paymentPeriod: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      }
    });

    const flutterwaveResponse = await initializePayment(
      req.user.email,
      amount,
      reference,
      req.user.name,
      {
        tenant_name: req.user.name,
        property_address: property.address,
        payment_id: payment._id.toString()
      }
    );

    if (!flutterwaveResponse.success) {
      await payment.deleteOne();
      return res.status(400).json({
        success: false,
        message: flutterwaveResponse.message || 'Failed to initialize payment'
      });
    }

    payment.flutterwaveTransactionId = flutterwaveResponse.data.id;
    await payment.save();

    await payment.populate('property', 'address city state');
    await payment.populate('tenant', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Payment initialized successfully',
      payment,
      paymentLink: flutterwaveResponse.data.link
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/payments/verify/:transactionId
 * @desc    Verify payment with Flutterwave
 * @access  Private
 */
router.post('/verify/:transactionId', protect, async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ flutterwaveTransactionId: transactionId })
      .populate('property', 'address city state')
      .populate('tenant', 'name email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const verificationResponse = await verifyPayment(transactionId);

    if (!verificationResponse.success) {
      return res.status(400).json({
        success: false,
        message: verificationResponse.message || 'Payment verification failed'
      });
    }

    const { status, amount, created_at, payment_type } = verificationResponse.data;

    if (status === 'successful') {
      payment.status = 'successful';
      payment.paidAt = new Date(created_at);
      payment.paymentMethod = payment_type || 'card';
      await payment.save();

      try {
        const tenantUser = await User.findById(payment.tenant._id);
        await sendPaymentSuccessNotification(
          tenantUser,
          payment,
          payment.property
        );
      } catch (emailError) {
        console.error('Failed to send payment notification:', emailError);
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        payment
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      res.status(400).json({
        success: false,
        message: 'Payment was not successful'
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/payments/stats/summary
 * @desc    Get payment statistics
 * @access  Private (Property Manager, Homeowner)
 */
router.get('/stats/summary', protect, authorize('property_manager', 'homeowner'), async (req, res, next) => {
  try {
    let filter = {};
    
    if (req.user.role === 'property_manager') {
      const properties = await Property.find({ propertyManager: req.user._id }).select('_id');
      const propertyIds = properties.map(p => p._id);
      filter.property = { $in: propertyIds };
    } else if (req.user.role === 'homeowner') {
      const properties = await Property.find({ homeowner: req.user._id }).select('_id');
      const propertyIds = properties.map(p => p._id);
      filter.property = { $in: propertyIds };
    }

    const totalPayments = await Payment.countDocuments({ ...filter, status: 'successful' });
    
    const amountResult = await Payment.aggregate([
      { $match: { ...filter, status: 'successful' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = amountResult.length > 0 ? amountResult[0].total : 0;

    const pendingPayments = await Payment.countDocuments({ ...filter, status: 'pending' });

    const thisMonth = new Date();
    const thisMonthPayments = await Payment.aggregate([
      { 
        $match: { 
          ...filter, 
          status: 'successful',
          'paymentPeriod.month': thisMonth.getMonth() + 1,
          'paymentPeriod.year': thisMonth.getFullYear()
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const thisMonthAmount = thisMonthPayments.length > 0 ? thisMonthPayments[0].total : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalPayments,
        totalAmount,
        pendingPayments,
        thisMonthAmount
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;