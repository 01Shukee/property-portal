const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Who and what
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please specify the tenant']
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Please specify the property']
  },
  // Updated unit field to be optional
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: false, // Changed from required: true to false
    default: null
  },
  
  // Payment details
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: 0
  },
  
  // Payment type
  paymentType: {
    type: String,
    enum: ['rent', 'deposit', 'maintenance', 'utilities', 'other'],
    default: 'rent'
  },
  
  // Payment period (for rent)
  paymentPeriod: {
    month: Number,
    year: Number
  },
  
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Flutterwave integration
  flutterwaveReference: {
    type: String,
    unique: true,
    sparse: true // Allows null values
  },
  flutterwaveTransactionId: String,
  
  // Payment method - UPDATED to include 'flutterwave'
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'ussd', 'mobile_money', 'cash', 'other', 'flutterwave'],
    default: 'card'
  },
  
  // Transaction details
  paidAt: Date,
  
  // Description/Notes
  description: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  
  // Receipt
  receiptNumber: {
    type: String,
    unique: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate receipt number before saving
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.receiptNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.receiptNumber = `RCP-${year}${month}-${random}`;
  }
  next();
});

// Index for faster queries
paymentSchema.index({ tenant: 1, status: 1 });
paymentSchema.index({ property: 1, status: 1 });
paymentSchema.index({ unit: 1, status: 1 });
paymentSchema.index({ flutterwaveReference: 1 });

module.exports = mongoose.model('Payment', paymentSchema);