const crypto = require('crypto');

const generateRandomSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

module.exports = {
  generateRandomSecret
};