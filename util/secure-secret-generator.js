const crypto = require('crypto');

const generateRandomSecret = () => {
  // return crypto.randomBytes(64).toString('hex');
  const secretKey = 'this_is_secure_data_for_docmed_hari-om-namah-shivay';
  return secretKey;

};


module.exports = {
  generateRandomSecret
};