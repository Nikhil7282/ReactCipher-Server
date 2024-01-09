const express=require('express')
const {encrypt,decrypt}=require('../helpers/EncryptionHandler')
const router=express.Router()
const db=require('../helpers/dbConfig')
// console.log(db);

router.post("/addPassword",async(req,res)=>{
    const {password,title}=req.body
    const encryptedPassword=encrypt(password)
    try {
        const result=await db.query("INSERT INTO passwords (password,title,iv) VALUES (?,?,?)",
    [encryptedPassword.password,title,encryptedPassword.iv])
    // console.log(result);
    res.status(200).json({msg:"Success"})
    } catch (err) {
        console.log(err);
    }
})

router.post("/decryptPassword",(req,res)=>{
    // const {password,iv}=req.body
    // console.log(password,iv);
    try {
        const decryptedPassword=decrypt(req.body)
    console.log(decryptedPassword);
    return res.status(200).json({msg:"Success",data:decryptedPassword})
    } catch (err) {
        console.log(err);
        return res.status(500).json({msg:"Internal Error"})
    }
})
router.get("/getAllPasswords",async(req,res)=>{
    try {
        const [result]=await db.query("SELECT * FROM passwords")
        res.status(200).json({msg:"Success",data:result})
    } catch (err) {
        console.log(err);
    }
})

module.exports=router