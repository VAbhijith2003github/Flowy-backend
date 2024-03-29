const { Client } = require("pg");
const client = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "password",
  database: "tasks",
});

try {
  client.connect();
} catch (err) {
  console.log(err);
}

module.exports = client;

