const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];

    if (!authHeader) {
      return res.status(401).send({ message: "No Token Provided", success: false });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    if (!token) {
      return res.status(401).send({ message: "Token Missing or Malformed", success: false });
    }

    const secret = process.env.JWT_SECRET || "healthhub_default_secret_key_2026";

    jwt.verify(token, secret, (err, decode) => {
      if (err) {
        return res.status(401).send({
          message: "Authentication Failed: Invalid or Expired Token",
          success: false,
        });
      }

      if (!req.body) {
        req.body = {};
      }

      req.userId = decode.id;
      req.user = decode;
      req.body.userId = decode.id;
      next();
    });
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).send({
      message: "Auth Failed",
      success: false,
    });
  }
};
