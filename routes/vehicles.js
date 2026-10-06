const express = require('express');
const router = express.Router();
const store = require('../store');

// GET all vehicles with status
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.type === 'car' || req.query.type === 'bike') {
      filter.type = req.query.type;
    }
    const vehicles = await store.getVehicles(filter);
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET vehicle by ID with status, services & fuel logs
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await store.getVehicleById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create vehicle
router.post('/', async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Vehicle name is required' });
    }
    if (type && !['car', 'bike'].includes(type)) {
      return res.status(400).json({ error: 'Vehicle type must be "car" or "bike"' });
    }

    const vehicle = await store.createVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update vehicle
router.put('/:id', async (req, res) => {
  try {
    const vehicle = await store.updateVehicle(req.params.id, req.body);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update vehicle condition scores & specs
router.put('/:id/condition', async (req, res) => {
  try {
    const updated = await store.updateVehicleCondition(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE vehicle
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await store.deleteVehicle(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
