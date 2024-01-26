// require("")
const jwt = require("jsonwebtoken");

const createToken = async (id, email) => {
  const payload = { id, email };
  const token = await jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

const createAccessToken = async (userId, username, email) => {
  const payload = { userId, username, email };
  const token = await jwt.sign(payload, process.env.Access_Token_Secret, {
    expiresIn: "60s",
  });
  return token;
};

const createRefreshToken = async (username) => {
  const token = await jwt.sign({ username }, process.env.Refresh_Token_Secret, {
    expiresIn: "1d",
  });
  return token;
};

const verifyToken = async (req, res, next) => {
  const token = req.signedCookies["auth-token"];
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

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  // console.log(authHeader);

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.Access_Token_Secret, async (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = decoded.username;
    next();
  });
};

module.exports = {
  createToken,
  verifyToken,
  createAccessToken,
  createRefreshToken,
  verifyJwt,
};
