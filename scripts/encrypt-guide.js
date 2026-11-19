/* Encrypts the Wardrobe Detox Guide PDF so it can live in the public repo safely.
   Usage:  GUIDE_KEY="your-secret" node scripts/encrypt-guide.js path/to/guide.pdf
   Output: netlify/functions/assets/guide.enc  (AES-256-GCM: iv | tag | ciphertext)
   The same GUIDE_KEY must be set in Netlify (Site settings, Environment variables). */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const src = process.argv[2], key = process.env.GUIDE_KEY;
if (!src || !key) { console.error('Usage: GUIDE_KEY="secret" node scripts/encrypt-guide.js guide.pdf'); process.exit(1); }
const k = crypto.scryptSync(key, 'hsv-guide-v1', 32);
const iv = crypto.randomBytes(12);
const c = crypto.createCipheriv('aes-256-gcm', k, iv);
const enc = Buffer.concat([c.update(fs.readFileSync(src)), c.final()]);
const out = path.join(__dirname, '..', 'netlify', 'functions', 'assets', 'guide.enc');
fs.writeFileSync(out, Buffer.concat([iv, c.getAuthTag(), enc]));
console.log('Wrote', out, (fs.statSync(out).size / 1e6).toFixed(2) + ' MB');
