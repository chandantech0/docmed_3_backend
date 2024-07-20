var sec;
const setSecureKey = (secureKey) => {
    sec = secureKey;
  };
  
  const GetSecureKey = () => {
    return sec;
  };

  module.exports = {
    setSecureKey,
    GetSecureKey
  };