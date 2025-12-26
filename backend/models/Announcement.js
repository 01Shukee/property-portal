const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  // Who created the announcement
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Title and content
  title: {
    type: String,
    required: [true, 'Please provide announcement title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Please provide announcement message'],
    trim: true
  },
  
  // Which properties this announcement is for
  targetProperties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  
  // Announcement type
  type: {
    type: String,
    enum: ['general', 'maintenance', 'payment', 'urgent'],
    default: 'general'
  },
  
  // Track who has read it
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
announcementSchema.index({ createdBy: 1, createdAt: -1 });
announcementSchema.index({ targetProperties: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);