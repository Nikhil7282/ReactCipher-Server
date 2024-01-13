require("dotenv").config();
const Port = process.env.PORT || 8000;

const cors = require("cors");
const express = require("express");
const passwordRouter = require("./Routes/passwordRoutes");
const userRouter = require("./Routes/userRoutes");
const db = require("./helpers/dbConfig");
const cookieParser = require("cookie-parser");
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
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
