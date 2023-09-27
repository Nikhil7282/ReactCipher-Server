const express=require('express')
const router=express.Router()
const {dbConnect}=require('./dbConfig')
const db=dbConnect()

router.post("/addPassword",(req,res)=>{
    const {password,title}=req.body
    db.query(`INSERT INTO passwords (password,title) VALUES (?,?)`,
    [password,title],
    (err,result)=>{
        if(err){console.log(err);}
        else{res.status(200).json({msg:"Success"})}
    }
    )
})

module.exports=router