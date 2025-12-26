const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  // Who and where
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Please specify the property']
  },
  // After property field, add:
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    default: null // Can be null for property-wide issues
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please specify the tenant']
  },
  
  // Issue details
  title: {
    type: String,
    required: [true, 'Please provide issue title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide issue description'],
    trim: true
  },
  category: {
    type: String,
    enum: ['plumbing', 'electrical', 'structural', 'appliance', 'hvac', 'other'],
    required: [true, 'Please specify issue category']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Status and resolution
  status: {
    type: String,
    enum: ['submitted', 'in_progress', 'resolved', 'cancelled'],
    default: 'submitted'
  },
  resolvedAt: {
    type: Date
  },
  resolutionNotes: {
    type: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
maintenanceRequestSchema.index({ property: 1, status: 1 });
maintenanceRequestSchema.index({ tenant: 1, status: 1 });
maintenanceRequestSchema.index({ unit: 1, status: 1 });

// Auto-delete resolved issues older than 7 days
maintenanceRequestSchema.statics.cleanupOldResolved = async function() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  try {
    const result = await this.deleteMany({
      status: 'resolved',
      resolvedAt: { $lt: sevenDaysAgo }
    });
    console.log(`Cleaned up ${result.deletedCount} old resolved maintenance requests`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up old maintenance requests:', error);
    return 0;
  }
};

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);