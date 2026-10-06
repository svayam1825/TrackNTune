const express = require('express');
const router = express.Router();
const store = require('../store');

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { prompt, vehicleId } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Optional real Gemini API call if API key provided
    if (apiKey) {
      try {
        let vehicleContext = '';
        if (vehicleId) {
          const vehicle = await store.getVehicleById(vehicleId);
          if (vehicle) {
            vehicleContext = `Vehicle Context: Name: ${vehicle.name}, Type: ${vehicle.type}, Make: ${vehicle.make}, Model: ${vehicle.model}, Year: ${vehicle.year}, Odometer: ${vehicle.currentOdometer} km, Condition: ${JSON.stringify(vehicle.condition || {})}.\n`;
          }
        }

        const systemPrompt = `You are TrackNTune AI Mechanic & Automotive Assistant, an expert in motorcycle, scooter, and automobile maintenance, tyre specifications, oil grades, parts details, and garage diagnostic advice. Be clear, technical yet easy to understand, and format output with clean markdown (lists, bold text, bullet points).`;
        const fullPrompt = `${systemPrompt}\n${vehicleContext}User Question: ${prompt}`;

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }]
          })
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return res.json({ response: text });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call error, falling back to internal knowledge engine:', geminiErr.message);
      }
    }

    // Default internal automotive knowledge engine
    const responseText = await store.getAiChatResponse(prompt, vehicleId);
    res.json({ response: responseText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
