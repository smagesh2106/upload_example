const jwt = require("jsonwebtoken");
const audit = require("../lib/audit");
const blacklist = require("../lib/token_blacklist").blacklist;

const config = process.env;

class AuthMiddleware {
  static verifyToken = async (req, res, next) => {
    const token = req.headers.authorization || req.headers.Authorization;
    if (!token) {
      return res.status(403).send("A token is required for authentication");
    }
    try {
      let tok = token.split(/\s+/);
      if (tok.length != 2) {
        return res.status(401).send("Invalid Token");
      }
      let decoded_token = jwt.decode(tok[1], { complete: true });
      if ((await blacklist.get(decoded_token.header.kid)) != undefined) {
        return res.status(401).send("Invalid Token, blacklisted.");
      }

      const decoded = await jwt.verify(tok[1], config.TOKEN_KEY);
      if (decoded.type !== "id_token") {
        return res.status(401).send("Invalid Token");
      }
      req.user = decoded;
      req.kid = decoded_token.header.kid;
      //console.log(req.user)
      audit.info(
        req.method +
        ",  User :" +
        decoded.user_id +
        ",  :" +
        req.originalUrl +
        ",  Body :" +
        JSON.stringify(req.body)
      );
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }
    return next();
  };

  static verifyRefreshToken = async (req, res, next) => {
    const token = req.headers.authorization || req.headers.Authorization;
    if (!token) {
      return res.status(403).send("A token is required for authentication");
    }
    try {
      let tok = token.split(/\s+/);
      if (tok.length != 2) {
        return res.status(401).send("Invalid Token");
      }
      let decoded_token = jwt.decode(tok[1], { complete: true });
      if ((await blacklist.get(decoded_token.header.kid)) != undefined) {
        return res.status(401).send("Invalid Token, blacklisted.");
      }
      const decoded = await jwt.verify(tok[1], config.TOKEN_KEY);
      if (decoded.type != "refresh_token") {
        return res.status(401).send("Invalid Token");
      }
      req.user = decoded;
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }
    return next();
  };

  static verifyPermissions = (allowedPermission) => {
    return async (req, res, next) => {
      try {
        if (!req.user.permissions || req.user.permissions.length === 0) {
          return res.status(401).send("User not authorized.");
        }
        console.log('req.user.permissions ====>', req.user.permissions)
        console.log('allowedPermission ===>', allowedPermission)
        //check if user has the requried permission or if user is 'super admin'
        if (
          req.user.permissions.includes(allowedPermission) ||
          req.user.permissions.includes("super-admin")
        ) {
          return next();
        }
        return res.status(403).send("User not authorized");
      } catch (err) {
        console.log(err)
        return res.status(403).send("User not authorized");
      }
    };
  };
}

module.exports = { AuthMiddleware };
