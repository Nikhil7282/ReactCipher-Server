require("dotenv").config();
const Port = process.env.PORT || 8000;

const cors = require("cors");
const express = require("express");
const passwordRouter = require("./Routes/passwordRoutes");
const userRouter = require("./Routes/userRoutes");
const db = require("./helpers/dbConfig");
const app = express();

app.use(express.json());
app.use(cors());
app.use("/users", userRouter);
app.use("/passwords", passwordRouter);

const start = async () => {
  db.getConnection().then((con) => {
    console.log("Connected to MySQL server");
    con.release();
  });
  app.listen(Port, () => {
    console.log(`Running At ${Port}`);
  });
};
start();
