const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    garageBusinessName: { type: String, required: true },
    partName: { type: String, required: true }, // e.g. "10W-30 Synthetic Scooter Oil 800ml"
    category: { type: String, default: 'Fluids & Lubricants' }, // Engine Oil, Tyres, Brakes, Transmission, Electrical, Filters
    partNumber: { type: String, default: '' },
    quantity: { type: Number, required: true, default: 0 },
    minStockLevel: { type: Number, default: 5 }, // Triggers "Low Stock" alert when quantity <= minStockLevel
    unitPrice: { type: Number, default: 0 }, // Selling price per unit (₹)
    costPrice: { type: Number, default: 0 }, // Purchase cost price (₹)
    supplier: { type: String, default: '' },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
