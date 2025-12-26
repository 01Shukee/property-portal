const axios = require('axios');

/**
 * Initialize Flutterwave payment
 */
const initializePayment = async (email, amount, reference, customerName, metadata = {}) => {
  try {
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: reference,
        amount: amount,
        currency: 'NGN',
        redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-callback`,
        customer: {
          email: email,
          name: customerName
        },
        customizations: {
          title: 'PropertyHub Rent Payment',
          description: 'Property Rent Payment',
          logo: 'https://your-logo-url.com/logo.png' // Optional: Add your logo
        },
        meta: metadata
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status === 'success') {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to initialize payment'
      };
    }
  } catch (error) {
    console.error('Flutterwave initialization error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to initialize payment'
    };
  }
};

/**
 * Verify Flutterwave payment
 */
const verifyPayment = async (transactionId) => {
  try {
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );

    if (response.data.status === 'success') {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Payment verification failed'
      };
    }
  } catch (error) {
    console.error('Flutterwave verification error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to verify payment'
    };
  }
};

module.exports = {
  initializePayment,
  verifyPayment
};