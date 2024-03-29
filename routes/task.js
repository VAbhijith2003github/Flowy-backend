const express = require("express");
const router = express.Router();
const client = require("../databasepg");

router.get("/", (req, res, next) => {
  const GetAllTasks = async () => {
    try {
      const allTasks = await client.query("SELECT * FROM tasks");
      res.json(allTasks.rows);
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  };

  GetAllTasks()
    .then(() => next())
    .catch((err) => next(err));
});

router.post("/", (req, res, next) => {
  const AddTask = async () => {
    const {
      string_id,
      title,
      completed,
      description,
      dateofcreation,
      dueDate,
      dateCompleted,
    } = req.body;

    if (!title || !dueDate) {
      req.status(400).json({ message: "Please provide title and due date" });
      console.log("error");
      return;
    }

    try {
      const newTask = await client.query(
        "INSERT INTO tasks (string_id, title, completed, description, dateofcreation, dueDate, dateCompleted) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [
          string_id,
          title,
          completed,
          description,
          dateofcreation,
          dueDate,
          dateCompleted,
        ]
      );

      res.json(newTask.rows[0]);
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  };

  AddTask()
    .then(() => next())
    .catch((err) => next(err));
});

router.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

module.exports = router;
