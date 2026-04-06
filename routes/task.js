const express = require("express");
const router = express.Router();
const client = require("../databasepg");
const auth = require("../middleware/auth");

router.get("/", auth, (req, res, next) => {
  const GetAllTasks = async () => {
    try {
      const allTasks = await client.query(
        "SELECT * FROM tasks WHERE assigned_by = $1 OR assigned_to = $1",
        [req.user.user_id]
      );
      res.json(allTasks.rows);
    } catch (err) {
      console.log(err);
      return next(err);
    }
  };

  GetAllTasks()
    .then(() => next())
    .catch((err) => next(err));
});

router.post("/", auth, (req, res, next) => {
  const addtask = async () => {
    const {
      string_id,
      title,
      completed,
      description,
      dateofcreation,
      dueDate,
      dateCompleted,
      assigned_to,
    } = req.body;

    if (!title || !dueDate) {
      return res
        .status(400)
        .json({ message: "Please provide title and due date" });
    }

    let assigneeId = null;
    if (assigned_to) {
      const assignee = await client.query(
        "SELECT * FROM users WHERE email = $1",
        [assigned_to]
      );
      if (assignee.rows.length > 0) {
        assigneeId = assignee.rows[0].user_id;
      }
    }

    try {
      const newTask = await client.query(
        "INSERT INTO tasks (string_id, title, completed, description, dateofcreation, dueDate, dateCompleted, assigned_by, assigned_to) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
        [
          string_id,
          title,
          completed,
          description,
          dateofcreation,
          dueDate,
          dateCompleted,
          req.user.user_id,
          assigneeId,
        ]
      );

      res.json(newTask.rows[0]);
    } catch (err) {
      console.log(err);
      return next(err);
    }
  };
  addtask()
    .then(() => next())
    .catch((err) => next(err));
});

router.delete("/:taskId", auth, (req, res, next) => {
  const taskId = req.params.taskId;
  const DeleteTask = async () => {
    try {
      const result = await client.query(
        "DELETE FROM tasks WHERE string_id = $1 AND (assigned_by = $2 OR assigned_to = $2)",
        [taskId, req.user.user_id]
      );
      if (result.rowCount === 0) {
        return res.status(403).json({ error: "Forbidden: You do not have permission to delete this task" });
      }
      res.status(200).json({ message: "Task deleted successfully" });
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  };

  DeleteTask()
    .then(() => next())
    .catch((err) => next(err));
});

router.put("/updatecompletestatdb/:taskId", auth, (req, res, next) => {
  const taskId = req.params.taskId;
  const updatecompletionstatus = async () => {
    const { completed, dateCompleted } = req.body;

    try {
      const updatedTask = await client.query(
        "UPDATE tasks SET completed = $1, dateCompleted = $2 WHERE string_id = $3 AND (assigned_by = $4 OR assigned_to = $4) RETURNING *",
        [completed, dateCompleted, taskId, req.user.user_id]
      );

      if (updatedTask.rows.length === 0) {
        return res.status(403).json({ error: "Forbidden: You do not have permission to update this task" });
      }

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

router.put("/edit/:taskId", auth, (req, res, next) => {
  const taskId = req.params.taskId;
  const EditTask = async () => {
    const { title, description, dueDate } = req.body;

    try {
      const updatedTask = await client.query(
        "UPDATE tasks SET title = $1, description = $2, dueDate = $3 WHERE string_id = $4 AND (assigned_by = $5 OR assigned_to = $5) RETURNING *",
        [title, description, dueDate, taskId, req.user.user_id]
      );

      if (updatedTask.rows.length === 0) {
        return res.status(403).json({ error: "Forbidden: You do not have permission to edit this task" });
      }

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
