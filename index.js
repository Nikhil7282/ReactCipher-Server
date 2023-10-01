require('dotenv').config()
const Port=process.env.PORT||8000

const cors=require('cors')
const express=require('express')
const {dbConnect} = require('./Routes/dbConfig')
const passwordRouter=require('./Routes/passwordRoutes')
const userRouter=require('./Routes/userRoutes')
const app=express()

app.use(express.json())
app.use(cors())
app.use('/users',userRouter)
app.use('/passwords',passwordRouter)


const start=async()=>{
    app.listen(Port,()=>{
        console.log(`Running At ${Port}`);
    })
}
start()