const mongoose = require('mongoose');

const garageRecordSchema = new mongoose.Schema(
  {
    garageOwnerId: { type: String, required: true },
    garageBusinessName: { type: String, required: true },
    
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    vehicleType: { type: String, enum: ['car', 'bike'], default: 'bike' },
    vehicleName: { type: String, required: true }, // e.g. "Honda Activa 125"
    regNumber: { type: String, default: '' },
    odometer: { type: Number, default: 0 },
    
    serviceDate: { type: Date, default: Date.now },
    serviceCategory: { type: String, default: 'General Service' },
    workDone: { type: String, required: true }, // Parts replaced, repairs, oil change, tyre fitment
    partsCost: { type: Number, default: 0 },
    laborCost: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    
    vehicleCondition: { type: String, default: 'Good' }, // Excellent, Good, Fair, Attention Needed
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Completed' },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('GarageRecord', garageRecordSchema);
