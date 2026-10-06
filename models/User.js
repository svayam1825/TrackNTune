const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['personal', 'garage_owner'],
      required: true,
      default: 'personal'
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // Garage Business Owner details (if role === 'garage_owner')
    businessName: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    specialization: { type: String, default: 'Multi-Brand Maintenance & Tuning' },
    city: { type: String, default: 'City' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
