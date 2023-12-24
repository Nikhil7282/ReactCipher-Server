const express = require("express");
const router = express.Router();
const db = require("./dbConfig");
const util = require("util");
const { hashPassword, compare } = require("../auth");
db.query = util.promisify(db.query);

router.get("/", async (req, res) => {
  try {
    await db.execute("SELECT * from users", (err, result) => {
      // console.log(result);
      return res.send(result);
    });
  } catch (error) {
    return console.log(error);
  }
});

router.post("/signUp", async (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = await hashPassword(password);
  db.execute("Select * from users where `username`= ?", [username], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Internal Error", error: err });
    }
    if (result.length !==0 && result[0].username === username) {
        return res.status(400).json({ msg: "Username already used" });
    }
    if (result.length === 0) {
      db.execute(
        "INSERT INTO users (username,password,email) VALUES (?,?,?)",
        [username, hashedPassword, email],
        (err) => {
          if (err) {
            console.log(err);
            return res.status(400).json({ msg: "Error", error: err });
          }
          return res.status(200).json({ msg: "User Signed Up" });
        }
      );
    }
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  await db.query(
    `SELECT * from users WHERE username=(?)`,
    [username],
    async (err, result) => {
      if (err) {
        return res.status(500).json({ msg: "Internal Error", error: err });
      }
      // console.log(result);
      if (result.length === 0) {
        return res.status(400).json({ msg: "User not found" });
      }
      const check = await compare(password, result[0].password);
      if (check) {
        return res.status(200).json({ msg: "Login Successful" });
      }
      return res.status(404).json({ msg: "Invalid Credentials" });
    }
  );
});

module.exports = router;
