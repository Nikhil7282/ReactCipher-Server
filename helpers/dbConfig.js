const mySql=require('mysql2')
const db=mySql.createPool({
        user:'root',
        host: 'localhost',
        password: 'root123',
        database:'password_manager'
}).promise()
module.exports=db