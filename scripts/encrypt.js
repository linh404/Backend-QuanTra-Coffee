const crypto = require('crypto');

const ENCRYPTION_KEY = '5v8y/B?E(H+MbQeThWmZq4t6w9z$C&F)';
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

const apiKey = 'AIzaSyDdJPwkspFx6ZB5K9LmT-EhqT0ueAwZNI8';
const encrypted = encrypt(apiKey);
console.log('Encrypted GEMINI_API_KEY:', encrypted);