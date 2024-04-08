const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + "?sslmode=require", 
})
try {
  pool.connect();
} catch (err) {
  console.log(err);
}

module.exports = pool;


