const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
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
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: [true, 'Please specify the unit']
  },
  
  // Move-in details
  moveInDate: {
    type: Date,
    required: [true, 'Please provide desired move-in date']
  },
  leaseDuration: {
    type: Number, // in months
    required: [true, 'Please specify lease duration'],
    enum: [6, 12, 24, 36]
  },
  
  // Tenant information
  employment: {
    status: {
      type: String,
      enum: ['employed', 'self_employed', 'unemployed', 'student', 'retired'],
      required: true
    },
    company: String,
    position: String,
    monthlyIncome: Number
  },
  
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Please provide emergency contact name']
    },
    relationship: String,
    phone: {
      type: String,
      required: [true, 'Please provide emergency contact phone']
    }
  },
  
  previousLandlord: {
    name: String,
    phone: String,
    address: String
  },
  
  numberOfOccupants: {
    type: Number,
    required: [true, 'Please specify number of occupants'],
    min: 1
  },
  
  hasPets: {
    type: Boolean,
    default: false
  },
  petDetails: String,
  
  additionalNotes: String,
  
  // Application status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  
  // Review details
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,
  
  // NEW: Blocklist feature
  blockedFromProperty: {
    type: Boolean,
    default: false
  },
  blockReason: {
    type: String,
    default: ''
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
applicationSchema.index({ tenant: 1, property: 1, status: 1 });
applicationSchema.index({ property: 1, status: 1 });
applicationSchema.index({ unit: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);