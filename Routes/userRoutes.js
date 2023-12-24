const express = require("express");
const router = express.Router();
const db = require("../dbConfig");
const util = require("util");
const { hashPassword, compare } = require("../auth");

router.get("/", async (req,res) => {
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
    const [result]=await db.query(
      `SELECT * from users WHERE username=(?)`,
      [username])
      if (result.length === 0) {
        return res.status(400).json({ msg: "User not found" });
      }
      const check = await compare(password, result[0].password);
      if (check) {
        return res.status(200).json({ msg: "Login Successful" });
      }
      return res.status(404).json({ msg: "Invalid Credentials" });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Error", error: err });
  }
  });

module.exports = router;
