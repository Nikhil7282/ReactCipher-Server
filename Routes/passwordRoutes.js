const express = require("express");
const { encrypt, decrypt } = require("../helpers/EncryptionHandler");
const router = express.Router();
const { verifyJwt } = require("../utils/tokenManager");
const db = require("../helpers/dbConfig");
// console.log(db);

router.post("/addPassword", verifyJwt, async (req, res) => {
  const { password, title } = req.body;
  const encryptedPassword = encrypt(password);
  const { userId } = res.locals.jwtData;
  try {
    const result = await db.query(
      "INSERT INTO passwords (password,title,iv,userid) VALUES (?,?,?,?)",
      [encryptedPassword.password, title, encryptedPassword.iv, userId]
    );
    // console.log(result);
    res.status(200).json({ msg: "Success" });
  } catch (err) {
    console.log(err);
  }
});

router.post("/decryptPassword", (req, res) => {
  try {
    const decryptedPassword = decrypt(req.body);
    console.log(decryptedPassword);
    return res.status(200).json({ msg: "Success", data: decryptedPassword });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal Error" });
  }
});

router.get("/userPasswords", verifyJwt, async (req, res) => {
  const { email } = res.locals.jwtData;
  // console.log(res.locals.jwtData);
  const [userid] = await db.query("select id from users where email=(?)", [
    email,
  ]);
  // console.log(userid);
  try {
    if (!userid) {
      return res.status(401).json({ msg: "Invalid user" });
    }
    const [result] = await db.query(
      "Select * from passwords where userid=(?)",
      [userid[0].id]
    );
    res.status(200).json({ msg: "Success", data: result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Error" });
  }
});

router.delete("/deletePassword", verifyJwt, async (req, res) => {
  const { passwordId } = req.body;
  // console.log("ID: " + passwordId);
  try {
    const [password] = await db.query("select * from passwords where id=(?)", [
      passwordId,
    ]);
    // console.log("Password", password);
    if (!password[0]) {
      return res.status(404).json({ msg: "Password not found" });
    }
    const deleteRes = await db.query("delete from passwords where id=(?)", [
      passwordId,
    ]);
    // console.log("Delete:", deleteRes);
    res.status(200).json({ msg: "Deleted SuccessFully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Error" });
  }
});

router.get("/getAllPasswords", async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM passwords");
    res.status(200).json({ msg: "Success", data: result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal Error" });
  }
});

module.exports = router;
