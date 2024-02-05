const mySql = require("mysql2");
const db = mySql
  .createPool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
  .promise();
module.exports = db;
