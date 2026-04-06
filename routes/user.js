const express = require("express");
const router = express.Router();
const client = require("../databasepg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
require("dotenv").config();

router.post("/signup", (req, res, next) => {
  const AddUser = async () => {
    const { user_id, dateofcreation, email, password } = req.body;

    if (!email || !password || !user_id || !dateofcreation) {
      res.status(400).json({ message: "Please provide email and password" });
      return;
    }

    const encyptedPassword = await bcrypt.hash(password, 10);

    try {
      const newUser = await client.query(
        "INSERT INTO users (user_id, dateofcreation, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
        [user_id, dateofcreation, email, encyptedPassword]
      );

      jwt.sign(
        { user_id },
        process.env.JWT_SECRET,
        { expiresIn: "12h" },
        (err, token) => {
          if (err) {
            console.log(err);
          }
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  };

  AddUser()
    .then(() => next())
    .catch((err) => next(err));
});

router.post("/login", (req, res, next) => {
  const LoginUser = async () => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Please provide email and password" });
      return;
    }

    try {
      const user = await client.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (user.rows.length === 0) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      const validPassword = await bcrypt.compare(
        password,
        user.rows[0].password
      );
      if (!validPassword) {
        res.status(401).json({ message: "Invalid password" });
        return;
      }

      jwt.sign(
        { user_id: user.rows[0].user_id },
        process.env.JWT_SECRET,
        { expiresIn: "12h" },
        (err, token) => {
          if (err) {
            console.log(err);
          }
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  };

  LoginUser()
    .then(() => next())
    .catch((err) => next(err));
});

router.post("/verifyToken", auth, (req, res, next) => {
  res.json({ message: "Token is valid", user: req.user });
});

router.post("/checkuserexits", auth, (req, res, next) => {
  const CheckUserExists = async () => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const user = await client.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (user.rows.length === 0) {
        res.json({ message: "User not found" });
        return;
      }

      res.json({ message: "User found" });
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  };

  CheckUserExists()
    .then(() => next())
    .catch((err) => next(err));
});

router.get("/getuser", auth, (req, res, next) => {
  const GetUser = async () => {
    try {
      const user = await client.query(
        "SELECT email FROM users WHERE user_id = $1",
        [req.user.user_id]
      );

      if (user.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user.rows[0].email);
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  };

  GetUser()
    .then(() => next())
    .catch((err) => next(err));
});

router.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

module.exports = router;
