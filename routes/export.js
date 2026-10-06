const express = require('express');
const router = express.Router();
const store = require('../store');

// GET export full log history as CSV
router.get('/csv/:vehicleId', async (req, res) => {
  try {
    const vehicle = await store.getVehicleById(req.params.vehicleId);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    let csvContent = `Vehicle Name,${vehicle.name}\n`;
    csvContent += `Make & Model,${vehicle.make} ${vehicle.model} (${vehicle.year || 'N/A'})\n`;
    csvContent += `Registration,${vehicle.regNumber || 'N/A'}\n`;
    csvContent += `Current Odometer,${vehicle.currentOdometer} km\n`;
    csvContent += `Total Spend,INR ${vehicle.totalSpend}\n\n`;

    // Service History Table
    csvContent += `--- SERVICE HISTORY ---\n`;
    csvContent += `Date,Odometer (km),Service Type,Category,Cost (INR),Garage,Notes\n`;
    (vehicle.services || []).forEach((s) => {
      const d = new Date(s.date).toISOString().split('T')[0];
      csvContent += `"${d}","${s.odometer}","${s.serviceType || ''}","${s.category || ''}","${s.cost || 0}","${s.garage || ''}","${(s.notes || '').replace(/"/g, '""')}"\n`;
    });

    csvContent += `\n--- FUEL LOGS ---\n`;
    csvContent += `Date,Odometer (km),Liters/kWh,Price/Unit (INR),Total Cost (INR),Full Tank,Station,Notes\n`;
    (vehicle.fuelLogs || []).forEach((f) => {
      const d = new Date(f.date).toISOString().split('T')[0];
      csvContent += `"${d}","${f.odometer}","${f.liters}","${f.pricePerLiter}","${f.totalCost}","${f.fullTank ? 'Yes' : 'No'}","${f.station || ''}","${(f.notes || '').replace(/"/g, '""')}"\n`;
    });

    const filename = `${vehicle.name.replace(/[^a-zA-Z0-9]/g, '_')}_Log_Report.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
