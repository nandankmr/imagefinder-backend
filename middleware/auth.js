const jwt = require("jsonwebtoken");
const config = require("config");

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) res.status(401).json({ msg: "You are not authorised" });
  else {
    try {
      const decoded = jwt.verify(token, config.get("jwt_key"));
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ msg: "Token not verified" });
    }
  }
};

module.exports = auth;
