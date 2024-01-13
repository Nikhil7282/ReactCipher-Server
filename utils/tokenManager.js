const jwt = require("jsonwebtoken");

const createToken = async (id, email) => {
  const payload = { id, email };
  const token = await jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

const verifyToken = async (req, res, next) => {
  // console.log(req.signedCookies);
  const token = req.signedCookies["auth-token"];
  // console.log(token);
  if (!token || token.trim() === "") {
    return res.status(401).json({ message: "Token Not Received" });
  } else {
    try {
      jwt.verify(token, process.env.JWT_SECRET, (err, success) => {
        if (err) {
          console.log("Token Expired");
          return res.status(401).json({ message: "Token Expired" });
        } else {
          console.log("Token verified");
          //   console.log("Success", success);
          res.locals.jwtData = success;
          return next();
        }
      });
    } catch (error) {
      console.log("verifyToken", error);
      return res.status(500).json({ message: "Internal Error" });
    }
  }
};

module.exports = { createToken, verifyToken };
