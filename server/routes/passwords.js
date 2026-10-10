const express = require('express');
const PasswordEntry = require('../models/PasswordEntry');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/crypto');

const router = express.Router();

// All credential routes require a valid JWT
router.use(authenticate);

// Admin-only system statistics (demonstrates role-based access control)
router.get('/admin/stats', authorize('admin'), async (req, res, next) => {
  try {
    const [users, entries] = await Promise.all([
      User.countDocuments(),
      PasswordEntry.countDocuments(),
    ]);
    res.json({ users, entries });
  } catch (err) {
    next(err);
  }
});

// GET /api/passwords?search=term — list the authenticated user's credentials
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { user: req.user._id };
    if (search && search.trim()) {
      const re = new RegExp(search.trim(), 'i'); // case-insensitive
      filter.$or = [{ website: re }, { username: re }];
    }
    const entries = await PasswordEntry.find(filter).sort({ updatedAt: -1 }).lean();
    const data = entries.map((e) => ({
      id: e._id,
      website: e.website,
      username: e.username,
      password: decrypt(e.password), // decrypted only on the way out
      notes: e.notes || '',
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));
    res.json({ count: data.length, data });
  } catch (err) {
    next(err);
  }
});

// POST /api/passwords — create a new credential (password encrypted before storage)
router.post('/', async (req, res, next) => {
  try {
    const { website, username, password, notes } = req.body || {};
    if (!website || !username || !password) {
      return res.status(400).json({ message: 'Website, username and password are required' });
    }
    const entry = await PasswordEntry.create({
      user: req.user._id,
      website: String(website).trim(),
      username: String(username).trim(),
      password: encrypt(password),
      notes: String(notes || '').trim(),
    });
    res.status(201).json({
      id: entry._id,
      website: entry.website,
      username: entry.username,
      password: '••••••••',
      notes: entry.notes,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/passwords/:id — fetch one credential (owned by the caller)
router.get('/:id', async (req, res, next) => {
  try {
    const entry = await PasswordEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({
      id: entry._id,
      website: entry.website,
      username: entry.username,
      password: decrypt(entry.password),
      notes: entry.notes || '',
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/passwords/:id — update a credential
router.put('/:id', async (req, res, next) => {
  try {
    const { website, username, password, notes } = req.body || {};
    const entry = await PasswordEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    if (website !== undefined) entry.website = String(website).trim();
    if (username !== undefined) entry.username = String(username).trim();
    if (password !== undefined && password !== '') entry.password = encrypt(password);
    if (notes !== undefined) entry.notes = String(notes).trim();

    await entry.save();
    res.json({ message: 'Entry updated', id: entry._id });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/passwords/:id — delete a credential
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await PasswordEntry.deleteOne({ _id: req.params.id, user: req.user._id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
