// Smoke test: verifies crypto round-trip and the Express app wiring
// without requiring a MongoDB connection. Run with: npm run smoke
require('dotenv').config();
const assert = require('assert');
const http = require('http');
const app = require('../index');
const { encrypt, decrypt } = require('../utils/crypto');

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('Crypto round-trip');
check('encrypt → decrypt returns the original plaintext', () => {
  const secret = 'MyS3cr3tP@ssw0rd!';
  assert.strictEqual(decrypt(encrypt(secret)), secret);
});
check('ciphertext does not contain the plaintext', () => {
  const secret = 'hunter2';
  assert.ok(!encrypt(secret).includes(secret));
});
check('two encryptions of the same value differ (random IV)', () => {
  assert.notStrictEqual(encrypt('same'), encrypt('same'));
});
check('tampered ciphertext fails to decrypt', () => {
  const ct = encrypt('tamper-me');
  const [iv, tag, data] = ct.split(':');
  const flipped = data.startsWith('a') ? 'b' + data.slice(1) : 'a' + data.slice(1);
  assert.strictEqual(decrypt(`${iv}:${tag}:${flipped}`), '');
});

console.log('HTTP layer');
const server = http.createServer(app);
server.listen(0, async () => {
  const port = server.address().port;
  const get = (path) =>
    new Promise((resolve, reject) => {
      http
        .get({ port, path }, (res) => {
          let body = '';
          res.on('data', (c) => (body += c));
          res.on('end', () => resolve({ status: res.statusCode, body }));
        })
        .on('error', reject);
    });

  try {
    const health = await get('/api/health');
    check('GET /api/health returns 200 with status ok', () => {
      assert.strictEqual(health.status, 200);
      assert.ok(JSON.parse(health.body).status === 'ok');
    });

    const noAuth = await get('/api/passwords');
    check('GET /api/passwords without token returns 401', () => {
      assert.strictEqual(noAuth.status, 401);
    });

    const badRoute = await get('/api/does-not-exist');
    check('unknown route returns 404', () => {
      assert.strictEqual(badRoute.status, 404);
    });
  } finally {
    server.close();
    console.log(passed > 0 && !process.exitCode ? `\nAll ${passed} checks passed.` : '\nSome checks failed.');
  }
});
