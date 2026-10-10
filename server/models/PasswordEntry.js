const mongoose = require('mongoose');

const passwordEntrySchema = new mongoose.Schema(
  {
    // Every credential belongs to exactly one user (data isolation per account)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    website: { type: String, required: true, trim: true, maxlength: 255 },
    username: { type: String, required: true, trim: true, maxlength: 255 },
    // Stored as AES-256-GCM ciphertext ("iv:authTag:ciphertext"), never plaintext
    password: { type: String, required: true },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true }
);

// Fast per-user search by website or username
passwordEntrySchema.index({ user: 1, website: 1 });
passwordEntrySchema.index({ user: 1, username: 1 });

module.exports = mongoose.model('PasswordEntry', passwordEntrySchema);
