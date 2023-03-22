const JWT = require('jsonwebtoken');

const jwtSecretKey = '9sec_key_Value9';

function jwtEncrypt(data) {
  return JWT.sign(data, jwtSecretKey);
}

function jwtDecrypt(token) {
  return JWT.verify(token, jwtSecretKey);
}

module.exports = {
  JwtEncrypt: jwtEncrypt,
  JwtDecrypt: jwtDecrypt,
};
