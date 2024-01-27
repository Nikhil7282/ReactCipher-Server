const express = require("express");
const router = express.Router();
const db = require("../helpers/dbConfig");
const jwt = require("jsonwebtoken");
const { hashPassword, compare } = require("../helpers/auth");
const {
  verifyJwt,
  verifyToken,
  createAccessToken,
  createRefreshToken,
} = require("../utils/tokenManager");

router.get("/", async (req, res) => {
  try {
    const [result] = await db.query("SELECT * from users");
    console.log(result);
    return res.send(result);
  } catch (error) {
    return console.log(error);
  }
});

router.post("/signUp", async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const [result] = await db.query("Select * from users where `username`= ?", [
      username,
    ]);
    if (result.length !== 0 && result[0].username === username) {
      return res.status(400).json({ msg: "Username already used" });
    }
    if (result.length === 0) {
      try {
        const hashedPassword = await hashPassword(password);
        const insertResult = await db.query(
          "INSERT INTO users (username,password,email) VALUES (?,?,?)",
          [username, hashedPassword, email]
        );
        console.log("Inserted:", insertResult);
        res.clearCookie("access-token", {
          path: "/",
          domain: "localhost",
          httpOnly: true,
          signed: true,
        });
        return res.status(200).json({ msg: "User Signed Up" });
      } catch (err) {
        return res.status(400).json({ msg: "Error", error: err });
      }
    }
  } catch (err) {
    return res.status(500).json({ msg: "Internal Error", error: err });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ msg: "All fields are required" });
  }
  try {
    const [result] = await db.query(`SELECT * from users WHERE username=(?)`, [
      username,
    ]);
    if (result.length === 0) {
      return res.status(400).json({ msg: "User not found" });
    }
    const check = await compare(password, result[0].password);
    if (check) {
      const accessToken = await createAccessToken(
        result[0].id,
        result[0].username,
        result[0].email
      );
      const refreshToken = await createRefreshToken(result[0].username);
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 42 * 60 * 60 * 100,
      });
      return res.json({
        msg: "Login successful",
        user: {
          userId: result[0].id,
          username: result[0].username,
          userEmail: result[0].email,
        },
        accessToken,
      });
    }
    return res.status(404).json({ msg: "Invalid Credentials" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal Error", error: err });
  }
});

router.get("/refreshToken", async (req, res) => {
  const cookies = req.cookies;
  if (!cookies) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const refreshToken = cookies.jwt;
  jwt.verify(
    refreshToken,
    process.env.Refresh_Token_Secret,
    async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const [user] = await db.query("Select * from users where username=(?)", [
        decoded.username,
      ]);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const accessToken = await createAccessToken(
        user[0].id,
        user[0].username,
        user[0].email
      );
      return res
        .status(200)
        .json({ msg: "Token Refreshed", user: user[0], accessToken });
    }
  );
});

router.get("/verifyUser", verifyToken, async (req, res) => {
  try {
    const [user] = await db.query("Select * from users where id=(?)", [
      res.locals.jwtData.id,
    ]);
    if (!user) {
      return res.status(401).send("User not registered or Token malfunctioned");
    }
    return res.status(201).json({ message: "Success", user: user[0] });
  } catch (error) {
    return res.status(200).json({ message: "Error", cause: error });
  }
});

router.post("/logout", verifyJwt, async (req, res, next) => {
  const cookies = req.cookies;
  // console.log("cookies:", cookies);
  if (!cookies.jwt) {
    return res.sendStatus(204);
  }
  res.clearCookie("jwt", { httpOnly: true, secure: true, sameSite: "none" });
  return res.status(200).json({ message: "Cookie Cleared" });
});
module.exports = router;
