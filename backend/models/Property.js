const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  // Property Details
  address: {
    type: String,
    required: [true, 'Please provide property address'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'Please provide city'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'Please provide state'],
    trim: true
  },
  
  propertyType: {
    type: String,
    enum: ['residential', 'commercial'],
    required: [true, 'Please specify property type']
  },
  
  bedrooms: {
    type: Number,
    min: 0
  },
  bathrooms: {
    type: Number,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  rentAmount: {
    type: Number,
    required: [true, 'Please provide rent amount'],
    min: 0
  },
  
  status: {
    type: String,
    enum: ['vacant', 'occupied', 'maintenance'],
    default: 'vacant'
  },
  
  // NEW: Homeowner (can be null initially, assigned when homeowner accepts invitation)
  homeowner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // NEW: Property Manager who manages this property
  propertyManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Property must have a property manager']
  },
  
  // NEW: Homeowner invitation details
  pendingHomeownerName: String,
  pendingHomeownerEmail: String,
  pendingHomeownerPhone: String,
  pendingHomeownerAddress: String,
  homeownerInvitationStatus: {
    type: String,
    enum: ['none', 'pending', 'accepted'],
    default: 'none'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
propertySchema.index({ homeowner: 1 });
propertySchema.index({ propertyManager: 1 });
propertySchema.index({ status: 1 });

module.exports = mongoose.model('Property', propertySchema);