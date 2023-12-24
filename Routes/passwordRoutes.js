const express=require('express')
const {encrypt,decrypt}=require('../EncryptionHandler')
const router=express.Router()
const db=require('../dbConfig')
// console.log(db);

router.post("/addPassword",(req,res)=>{
    console.log(req.body);
    const {password,title}=req.body
    const encryptedPassword=encrypt(password)
    db.query("INSERT INTO passwords (password,title,iv) VALUES (?,?,?)",
    [encryptedPassword.password,title,encryptedPassword.iv],
    (err,result)=>{
        if(err){console.log(err);}
        else{res.status(200).json({msg:"Success"})}
    }
    )
})

router.post("/decryptPassword",(req,res)=>{
    // const {password,iv}=req.body
    // console.log(password,iv);
    const decryptedPassword=decrypt(req.body)
    console.log(decryptedPassword);
    res.status(200).json({msg:"Success",data:decryptedPassword})
})
router.get("/getAllPasswords",(req,res)=>{
    db.query("SELECT * FROM passwords",(err,result)=>{
        if(err){console.log(err);}
        else{res.status(200).json({msg:"Success",data:result})}
    })
})

module.exports=router