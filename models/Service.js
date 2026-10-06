const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    date: { type: Date, required: true, default: Date.now },
    odometer: { type: Number, required: true },
    serviceType: { type: String, required: true }, // e.g. "Oil change"
    category: { type: String, default: 'Maintenance' }, // Maintenance, Repair, Tires, Inspection, Wash, Modification
    cost: { type: Number, default: 0 },
    partsCost: { type: Number, default: 0 },
    laborCost: { type: Number, default: 0 },
    garage: { type: String, default: '' },
    notes: { type: String, default: '' },

    // interval until the NEXT service is due, counted from this entry.
    intervalKm: { type: Number, default: null },
    intervalMonths: { type: Number, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
