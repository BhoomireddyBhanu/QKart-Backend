const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { tokenTypes } = require("../config/tokens");

/**
 * Generate jwt token
 * - Payload must contain fields
 * --- "sub": `userId` parameter
 * --- "type": `type` parameter
 *
 * - Token expiration must be set to the value of `expires` parameter
 *
 * @param {ObjectId} userId - Mongo user id
 * @param {Number} expires - Token expiration time in seconds since unix epoch
 * @param {string} type - Access token type eg: Access, Refresh
 * @param {string} [secret] - Secret key to sign the token, defaults to config.jwt.secret
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {

  let payload = {
    "sub":userId,
    "type": type,
    "exp": expires
  }
  // console.log(`${expires}m`)

  var token = jwt.sign(payload, secret);
  return token;

};

/**
 * Generate auth token
 * - Generate jwt token
 * - Token type should be "ACCESS"
 * - Return token and expiry date in required format
 *
 * @param {User} user
 * @returns {Promise<Object>}
 *
 * Example response:
 * "access": {
 *          "token": "eyJhbGciOiJIUzI1NiIs...",
 *          "expires": "2021-01-30T13:51:19.036Z"
 * }
 */
const generateAuthTokens = async (user) => {

  const expires = Math.floor(Date.now() / 1000) + (config.jwt.accessExpirationMinutes * 60)

  var authToken = await generateToken(user._id, expires, tokenTypes.ACCESS);
  var expiryDate = new Date(expires*1000)
  // console.log(expiryDate);
  
  // expiryDate.setMinutes(expiryDate.getMinutes() + config.jwt.accessExpirationMinutes);
  let data = {
    "access":{
      "token": authToken,
      "expires": expiryDate
    }
  }

  return data;

};

module.exports = {
  generateToken,
  generateAuthTokens,
};
