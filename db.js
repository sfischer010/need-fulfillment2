const { Pool } = require('pg');

const pool = new Pool({
  user: 'stephanief0101',
  host: 'localhost',
  database: 'NeedFulfillment',
  password: 'Telescope0202',
  port: 5432,
});

module.exports = pool;
