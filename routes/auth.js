const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../store');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, businessName, phone, address, specialization, city } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await store.registerUser({
      ...req.body,
      password: hashedPassword
    });

    const userObj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete userObj.password;

    const token = jwt.sign(
      { id: userObj._id, email: userObj.email, role: userObj.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: userObj
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userObj = typeof user.toObject === 'function' ? user.toObject() : { ...user };

    // Support both bcrypt hashed password check and legacy plaintext fallback
    let isMatch = false;
    if (userObj.password.startsWith('$2a$') || userObj.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, userObj.password);
    } else {
      isMatch = userObj.password === password;
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    delete userObj.password;

    const token = jwt.sign(
      { id: userObj._id, email: userObj.email, role: userObj.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: userObj
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// GET /api/auth/garages (list of registered garages)
router.get('/garages', async (req, res) => {
  try {
    const garages = await store.getAllGarages();
    res.json(garages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me (Get current authenticated user profile)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await store.findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const userObj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete userObj.password;
    res.json({ user: userObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
