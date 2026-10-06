const express = require('express');
const router = express.Router();
const store = require('../store');

// GET analytics data for a vehicle
router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const analytics = await store.getAnalytics(req.params.vehicleId);
    if (!analytics) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
