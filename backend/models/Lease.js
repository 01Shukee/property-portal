const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema({
  // Parties involved
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
  // NEW: Specific unit within the property
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: [true, 'Please specify the unit']
  },
  
  // Lease details
  startDate: {
    type: Date,
    required: [true, 'Please provide lease start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide lease end date']
  },
  
  // Financial terms
  monthlyRent: {
    type: Number,
    required: [true, 'Please specify monthly rent'],
    min: 0
  },
  securityDeposit: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Lease terms
  leaseDuration: {
    type: Number, // in months
    required: true
  },
  paymentDueDay: {
    type: Number, // day of month (1-31)
    default: 1,
    min: 1,
    max: 31
  },
  
  // Lease status
  status: {
    type: String,
    enum: ['active', 'expired', 'terminated', 'renewed'],
    default: 'active'
  },
  
  // Auto-renewal
  autoRenew: {
    type: Boolean,
    default: false
  },
  
  // Special terms
  specialTerms: String,
  
  // Created from application
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  
  // Termination details
  terminatedAt: Date,
  terminationReason: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
leaseSchema.index({ tenant: 1, status: 1 });
leaseSchema.index({ property: 1, status: 1 });
leaseSchema.index({ unit: 1, status: 1 });
leaseSchema.index({ endDate: 1, status: 1 });

module.exports = mongoose.model('Lease', leaseSchema);