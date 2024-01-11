var CryptoJS = require("crypto-js");
var jwt = require("jsonwebtoken");

const key = CryptoJS.PBKDF2(process.env.SECRET_KEY, process.env.SALT, {
  keySize: 128 / 32,
  iterations: 1000,
}).toString();

const jwtToken = (dataEncrypt) => {
  return jwt.sign(dataEncrypt, key, {
    expiresIn: process.env.EXPIRES_IN,
  });
};

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.sendStatus(401);
  } else {
    jwt.verify(token, key, (err, user) => {
      if (err) {
        return res.status(403).json(err);
      } else {
        req.userID = user?.userID;
      }
    });

    next();
  }
};

module.exports = { jwtToken, authenticateToken };
