const express = require("express");
const router = express.Router();
const client = require("../databasepg");
const jwt = require("jsonwebtoken");

router.get("/", (req, res, next) => {
  const GetAllTasks = async () => {
    try {
      // verify token start
      const authtokenwithbearer = req.headers.authorization;
      if (!authtokenwithbearer) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Token not provided" });
      }
      const authtoken = authtokenwithbearer.split(" ")[1];
      const decoded = await jwt.verify(authtoken, "privatekey");
      if (!decoded) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Token not provided" });
      }
      const user = await client.query(
        "SELECT * FROM users WHERE user_id = $1",
        [decoded.user_id]
      );
      if (user.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      // verify token end

      const allTasks = await client.query(
        "SELECT * FROM tasks WHERE assigned_by = $1 OR assigned_to = $1",
        [decoded.user_id]
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

router.post("/", (req, res, next) => {
  const addtask = async () => {
    // verify token start
    const authtokenwithbearer = req.headers.authorization;
    if (!authtokenwithbearer) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Token not provided" });
    }
    const authtoken = authtokenwithbearer.split(" ")[1];
    const decoded = await jwt.verify(authtoken, "privatekey");
    if (!decoded) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Token not provided" });
    }
    const user = await client.query("SELECT * FROM users WHERE user_id = $1", [
      decoded.user_id,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    // verify token end

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

    const assignee = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [assigned_to]
    );

    if (assignee.rows.length === 0) {
      return res.status(404).json({ error: "Assignee not found" });
    }
    const assigneeId = assignee.rows[0].user_id;
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
          decoded.user_id,
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

router.delete("/:taskId", (req, res, next) => {
  const taskId = req.params.taskId;
  const DeleteTask = async () => {
    try {
      // verify token start
      const authtokenwithbearer = req.headers.authorization;
      if (!authtokenwithbearer) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Token not provided" });
      }
      const authtoken = authtokenwithbearer.split(" ")[1];
      const decoded = await jwt.verify(authtoken, "privatekey");
      if (!decoded) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Token not provided" });
      }
      const user = await client.query(
        "SELECT * FROM users WHERE user_id = $1",
        [decoded.user_id]
      );
      if (user.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      // verify token end
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
    // verify token start
    const authtokenwithbearer = req.headers.authorization;
    if (!authtokenwithbearer) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Token not provided" });
    }
    const authtoken = authtokenwithbearer.split(" ")[1];
    const decoded = await jwt.verify(authtoken, "privatekey");
    if (!decoded) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Token not provided" });
    }
    const user = await client.query("SELECT * FROM users WHERE user_id = $1", [
      decoded.user_id,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    // verify token end
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
    // verify token start
    const authtokenwithbearer = req.headers.authorization;
    if (!authtokenwithbearer) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Token not provided" });
    }
    const authtoken = authtokenwithbearer.split(" ")[1];
    const decoded = await jwt.verify(authtoken, "privatekey");
    if (!decoded) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Token not provided" });
    }
    const user = await client.query("SELECT * FROM users WHERE user_id = $1", [
      decoded.user_id,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    // verify token end
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
