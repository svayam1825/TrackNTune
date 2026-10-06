const express = require('express');
const router = express.Router();
const store = require('../store');

// GET /api/garage/records?businessName=...
router.get('/records', async (req, res) => {
  try {
    const businessName = req.query.businessName || '';
    const records = await store.getGarageRecords(businessName);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/garage/records
router.post('/records', async (req, res) => {
  try {
    const record = await store.createGarageRecord(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/garage/records/:id
router.put('/records/:id', async (req, res) => {
  try {
    const updated = await store.updateGarageRecord(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Garage record not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/garage/records/:id
router.delete('/records/:id', async (req, res) => {
  try {
    const deleted = await store.deleteGarageRecord(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Garage record not found' });
    res.json({ message: 'Garage record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== SPARE PARTS INVENTORY ENDPOINTS =====

// GET /api/garage/inventory?businessName=...
router.get('/inventory', async (req, res) => {
  try {
    const businessName = req.query.businessName || '';
    const items = await store.getInventory(businessName);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/garage/inventory
router.post('/inventory', async (req, res) => {
  try {
    const item = await store.createInventoryItem(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/garage/inventory/:id
router.put('/inventory/:id', async (req, res) => {
  try {
    const updated = await store.updateInventoryItem(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Inventory item not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/garage/inventory/:id
router.delete('/inventory/:id', async (req, res) => {
  try {
    const deleted = await store.deleteInventoryItem(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Inventory item not found' });
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
