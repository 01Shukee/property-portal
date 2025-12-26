const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  // Which property/building this unit belongs to
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Unit must belong to a property']
  },
  
  // Unit identification
  unitNumber: {
    type: String,
    required: [true, 'Please provide unit number'],
    trim: true
  },
  
  // Unit type
  unitType: {
    type: String,
    enum: ['apartment', 'studio', 'warehouse', 'office', 'shop', 'other'],
    required: [true, 'Please specify unit type']
  },
  
  // Layout (optional for non-residential)
  bedrooms: {
    type: Number,
    min: 0,
    default: 0
  },
  bathrooms: {
    type: Number,
    min: 0,
    default: 0
  },
  squareFeet: {
    type: Number,
    min: 0
  },
  
  // Financial
  rentAmount: {
    type: Number,
    required: [true, 'Please provide rent amount'],
    min: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['vacant', 'occupied', 'maintenance', 'reserved'],
    default: 'vacant'
  },
  
  // Current tenant (if occupied)
  currentTenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Current lease (if occupied)
  currentLease: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lease',
    default: null
  },
  
  // Features/Amenities
  features: [{
    type: String
  }],
  
  description: {
    type: String,
    trim: true
  },
  
  // Floor level (for apartments)
  floor: {
    type: Number
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
unitSchema.index({ property: 1, unitNumber: 1 }, { unique: true });
unitSchema.index({ property: 1, status: 1 });
unitSchema.index({ currentTenant: 1 });

module.exports = mongoose.model('Unit', unitSchema);