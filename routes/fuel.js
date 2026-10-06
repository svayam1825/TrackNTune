const express = require('express');
const router = express.Router();
const store = require('../store');

// GET fuel logs for a vehicle
router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const fuelLogs = await store.getFuelLogsForVehicle(req.params.vehicleId);
    res.json(fuelLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add fuel log
router.post('/', async (req, res) => {
  try {
    const fuelLog = await store.createFuelLog(req.body);
    res.status(201).json(fuelLog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE fuel log
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await store.deleteFuelLog(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Fuel log entry not found' });
    res.json({ message: 'Fuel log entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
