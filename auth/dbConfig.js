const mySql=require('mysql')
const dbConnect=async()=>{
    const db=mySql.createConnection({
        user:'root',
        host: 'localhost',
        password: 'root123',
        database:'password_manager'
    })
    return db;
}

module.exports={dbConnect}