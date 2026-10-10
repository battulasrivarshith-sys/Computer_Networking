const crypto = require('crypto');

// AES-256-GCM authenticated encryption.
// The 32-byte cipher key is the SHA-256 digest of ENCRYPTION_KEY, so any
// passphrase length works while the effective key is always 256-bit.
const ALGORITHM = 'aes-256-gcm';
const KEY = crypto
  .createHash('sha256')
  .update(String(process.env.ENCRYPTION_KEY || 'default-insecure-key'))
  .digest();

// Ciphertext wire format: "<iv hex>:<auth tag hex>:<ciphertext hex>"
function encrypt(plainText) {
  if (plainText === undefined || plainText === null) return '';
  const iv = crypto.randomBytes(12); // 96-bit IV, recommended for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(String(plainText), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(encryptedText) {
  if (!encryptedText) return '';
  try {
    const [ivHex, authTagHex, encryptedHex] = String(encryptedText).split(':');
    if (!ivHex || !authTagHex || !encryptedHex) return '';
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      KEY,
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed (tampered data or wrong key):', err.message);
    return '';
  }
}

module.exports = { encrypt, decrypt };
