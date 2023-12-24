const mySql=require('mysql2')
const util=require('util')
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
        console.log("Connected to MySQL server");
    })
    db.query=util.promisify(db.query)
    // console.log(db);
module.exports=db