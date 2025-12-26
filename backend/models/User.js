const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true
  },
  
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  role: {
    type: String,
    enum: {
      values: ['property_manager', 'homeowner', 'tenant'],
      message: 'Role must be property_manager, homeowner, or tenant'
    },
    required: [true, 'Please specify user role']
  },
  
  address: {
    type: String,
    trim: true
  },
  
  // ADD THESE FIELDS FOR INVITATION SYSTEM
  invitationToken: String,
  invitationExpires: Date,
  
  pendingInvitation: {
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit'
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    moveInDate: Date,
    leaseDuration: Number
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    address: this.address,
    isActive: this.isActive,
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;