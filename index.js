require('dotenv').config()
const Port=process.env.PORT||8000

const cors=require('cors')
const express=require('express')
const {dbConnect} = require('./auth/dbConfig')
const passwordRouter=require('./Routes/passwordRoutes')
const app=express()

app.use(express.json())
app.use(cors())
// app.use(passwordRouter())



const start=async()=>{
    await dbConnect()
    app.listen(Port,()=>{
        console.log(`Running At ${Port}`);
    })
}
start()