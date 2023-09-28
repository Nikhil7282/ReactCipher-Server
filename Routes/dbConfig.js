const mySql=require('mysql2')
const db=mySql.createConnection({
        user:'root',
        host: 'localhost',
        password: 'root123',
        database:'password_manager'
    })
    db.connect((err)=>{
        if(err){
            return console.log(err);
        }
        console.log("Connect to MySQL server");
    })
    // console.log(db);
module.exports=db