const mongoose = require('mongoose');

const fuelSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    date: { type: Date, required: true, default: Date.now },
    odometer: { type: Number, required: true },
    liters: { type: Number, required: true }, // Liters or kWh for EVs
    pricePerLiter: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    fullTank: { type: Boolean, default: true },
    station: { type: String, default: '' },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fuel', fuelSchema);
