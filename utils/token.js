const 
  base64    = require("@hexagon/base64-arraybuffer"),
  username  = require("./username"),
  crypto    = require('crypto');

// Generate a one time token for logging in on another device
const validate = (usernameInput, token, tokenValidator) => {
  
  // Try decoding token from base64url
  let tokenDecoded;
  try {
    tokenDecoded = base64.decode(token, true);
  } catch (e) {
    return false;
  }

  // Note time now
  const timeNow = new Date().getTime();

  // Validate
  if (username.clean(usernameInput) !== tokenValidator.username) {
    return false;
  } else if (tokenValidator.expires < timeNow) {  
    return false;
  } else if (base64.encode(tokenValidator.token,true) !== base64.encode(tokenDecoded, true)) {
    return false;
  } else {
    // Success!
    return true;
  }

};

const generate = (usernameInput, expireMs) => {

  if (!expireMs) {
    return false;
  }

  if (!username) {
    return false;
  }
  
  let usernameClean = username.clean(usernameInput);
  if (!usernameClean) {
    return false;
  }

  const 
    token = crypto.randomBytes(32),
    internal = {
      username: usernameClean,
      token,
      expires: new Date().getTime() + expireMs
    };
  
  return internal;
};

// Encode token to base64url format
const encode = (token) => {
  return base64.encode(token, true);
};

module.exports = {
  encode,
  generate,
  validate
};