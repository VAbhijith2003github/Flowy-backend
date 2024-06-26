const express = require("express");
const app = express();
require('dotenv').config();
const port =3001;
const cors = require("cors");
const client = require("./databasepg");
const taskRouter = require("./routes/task");
const userRouter = require("./routes/user");

app.use(express.json());
app.use(cors());
app.use("/api/tasks", taskRouter);
app.use("/api/users", userRouter);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

const start = () => {
  try {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
};

start();
