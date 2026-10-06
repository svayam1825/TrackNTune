const express = require('express');
const router = express.Router();
const store = require('../store');

// GET services for a vehicle
router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const services = await store.getServicesForVehicle(req.params.vehicleId);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add service entry
router.post('/', async (req, res) => {
  try {
    const service = await store.createService(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update service entry
router.put('/:id', async (req, res) => {
  try {
    const service = await store.updateService(req.params.id, req.body);
    if (!service) return res.status(404).json({ error: 'Service entry not found' });
    res.json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE service entry
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await store.deleteService(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Service entry not found' });
    res.json({ message: 'Service entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
