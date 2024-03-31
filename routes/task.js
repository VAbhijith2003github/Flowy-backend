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

router.delete("/:taskId", (req, res, next) => {
  const taskId = req.params.taskId;
  const DeleteTask = async () => {
    try {
      const result = await client.query(
        "DELETE FROM tasks WHERE string_id = $1",
        [taskId]
      );
      res.status(200).json({ message: "Task deleted successfully" });
      return result;
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  };

  DeleteTask()
    .then(() => next())
    .catch((err) => next(err));
});

router.put("/updatecompletestatdb/:taskId", (req, res, next) => {
  const taskId = req.params.taskId;
  const updatecompletionstatus = async () => {
    const { completed, dateCompleted } = req.body;

    try {
      const updatedTask = await client.query(
        "UPDATE tasks SET completed = $1, dateCompleted = $2 WHERE string_id = $3 RETURNING *",
        [completed, dateCompleted, taskId]
      );

      res.json(updatedTask.rows[0]);
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  };

  updatecompletionstatus()
    .then(() => next())
    .catch((err) => next(err));
});

router.put("/edit/:taskId", (req, res, next) => {
  const taskId = req.params.taskId;
  const EditTask = async () => {
    const { title, description, dueDate } = req.body;

    try {
      const updatedTask = await client.query(
        "UPDATE tasks SET title = $1, description = $2, dueDate = $3 WHERE string_id = $4 RETURNING *",
        [title, description, dueDate, taskId]
      );

      res.json(updatedTask.rows[0]);
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  };

  EditTask()
    .then(() => next())
    .catch((err) => next(err));
});

router.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

module.exports = router;
