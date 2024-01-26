const express = require("express");
const router = express.Router();
const db = require("../helpers/dbConfig");
const { hashPassword, compare } = require("../helpers/auth");
const { createToken, verifyToken } = require("../utils/tokenManager");

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
  const hashedPassword = await hashPassword(password);
  try {
    const [result] = await db.query("Select * from users where `username`= ?", [
      username,
    ]);
    if (result.length !== 0 && result[0].username === username) {
      return res.status(400).json({ msg: "Username already used" });
    }
    if (result.length === 0) {
      try {
        const insertResult = await db.query(
          "INSERT INTO users (username,password,email) VALUES (?,?,?)",
          [username, hashedPassword, email]
        );
        console.log("Inserted:", insertResult);
        res.clearCookie("auth-token", {
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
  try {
    const [result] = await db.query(`SELECT * from users WHERE username=(?)`, [
      username,
    ]);
    if (result.length === 0) {
      return res.status(400).json({ msg: "User not found" });
    }
    const check = await compare(password, result[0].password);
    if (check) {
      res.clearCookie("auth-token", {
        path: "/",
        domain: "localhost",
        httpOnly: true,
        signed: true,
      });
      const token = await createToken(result[0].id, result[0].email);
      // console.log(token);
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      res.cookie("auth-token", token, {
        path: "/",
        domain: "localhost",
        expires,
        httpOnly: true,
        signed: true,
      });
      return res.status(200).json({
        msg: "Login Successful",
        name: result[0].username,
        email: result[0].email,
      });
    }
    return res.status(404).json({ msg: "Invalid Credentials" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal Error", error: err });
  }
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

router.get("/userLogout", verifyToken, async (req, res, next) => {
  try {
    const [user] = await db.query("Select * from users where id=(?)", [
      res.locals.jwtData.id,
    ]);
    if (!user) {
      return res.status(401).json({ msg: "Token Malfunction" });
    }
    if (user.id.toString() !== res.locals.jwtData.id) {
      return res.status(401).json({ msg: "Permission didn't match" });
    }
    res.clearCookie(Cookie_Name);
    return res
      .status(201)
      .json({ message: "Success", name: User.name, email: User.email });
  } catch (error) {
    return res.status(500).json({ message: "Error", cause: error });
  }
});
module.exports = router;
