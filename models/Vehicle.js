const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema({
  overallHealthScore: { type: Number, default: 90 }, // 0 to 100
  overallStatus: { type: String, default: 'Good' }, // Excellent, Good, Fair, Needs Attention, Critical
  engineStatus: { type: String, default: 'Good' }, // Excellent, Good, Needs Oil, Overhaul Required
  engineOilLevel: { type: String, default: '100%' }, // 100%, 75%, 50%, Low
  engineOilQuality: { type: String, default: 'Fresh' }, // Fresh, Normal, Dark/Dirty
  
  frontTyreSize: { type: String, default: '' },
  rearTyreSize: { type: String, default: '' },
  frontTyreCondition: { type: String, default: 'Good' }, // New, Good, Worn, Replace
  rearTyreCondition: { type: String, default: 'Good' }, // New, Good, Worn, Replace
  frontTyrePressure: { type: Number, default: 28 }, // PSI
  rearTyrePressure: { type: Number, default: 32 }, // PSI
  tyreTreadDepth: { type: String, default: '4.5 mm (Good)' },
  
  brakeCondition: { type: String, default: 'Good' }, // Excellent, Good, Worn, Replace
  brakePadWear: { type: String, default: '80% Remaining' },
  
  batteryStatus: { type: String, default: 'Good (12.6V)' }, // Good, Weak, Replace
  chainOrTransmission: { type: String, default: 'Lubricated & Smooth' },
  lastInspectionDate: { type: Date, default: Date.now },
  inspectionNotes: { type: String, default: '' }
}, { _id: false });

const vehicleSchema = new mongoose.Schema(
  {
    ownerId: { type: String, default: 'guest' },
    type: {
      type: String,
      enum: ['car', 'bike'],
      required: true
    },
    name: { type: String, required: true }, // e.g. "BMW 3 Series" / "Honda Activa 125"
    make: { type: String, default: '' },
    model: { type: String, default: '' },
    year: { type: Number, default: null },
    regNumber: { type: String, default: '' },
    fuelType: { type: String, default: 'Petrol' }, // Petrol / Diesel / Electric / CNG / Hybrid
    currentOdometer: { type: Number, required: true, default: 0 },
    imageUrl: { type: String, default: '' },
    insuranceExpiry: { type: Date, default: null },
    pucExpiry: { type: Date, default: null },
    taxExpiry: { type: Date, default: null },

    defaultIntervalKm: { type: Number, default: 5000 },
    defaultIntervalMonths: { type: Number, default: 6 },
    notes: { type: String, default: '' },

    condition: { type: conditionSchema, default: () => ({}) }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
