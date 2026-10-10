const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?/',
};

// Cryptographically secure random password generator (crypto.getRandomValues)
export function generatePassword(
  length = 16,
  { lower = true, upper = true, numbers = true, symbols = true } = {}
) {
  let pool = '';
  if (lower) pool += SETS.lower;
  if (upper) pool += SETS.upper;
  if (numbers) pool += SETS.numbers;
  if (symbols) pool += SETS.symbols;
  if (!pool) pool = SETS.lower;

  const buf = new Uint32Array(length);
  crypto.getRandomValues(buf);
  return Array.from(buf, (n) => pool[n % pool.length]).join('');
}

// Rough password strength heuristic (0 – 7)
export function strengthScore(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (password.length >= 20) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export function strengthInfo(password) {
  const score = strengthScore(password);
  if (score <= 2) return { label: 'Weak', className: 'weak', width: '20%' };
  if (score <= 4) return { label: 'Fair', className: 'fair', width: '45%' };
  if (score <= 5) return { label: 'Good', className: 'good', width: '65%' };
  return { label: 'Strong', className: 'strong', width: '90%' };
}
