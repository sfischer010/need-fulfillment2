const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: 'stephanief0101',
  host: 'localhost',
  database: 'NeedFulfillment',
  password: 'Telescope0202',
  port: 5432,
});

/*const jsonData = require(path.join(__dirname, 'needData.json'));

// Route to fetch need points from JSON
app.get('/api/get-need-points', async (req, res) => {
  try {
    res.json(jsonData);
  } catch (error) {
    console.error('Error fetching needs data from JSON:', error);
    res.status(500).json({ error: 'Failed to fetch need data from JSON' });
  }
});*/

// Route to fetch need points from the database
app.get('/api/get-need-data', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT U.U_FirstName || ' ' || U.U_LastName AS name, N.N_Title AS need, UN.UN_GeoLocation
      FROM UN_UserNeedsLnk UN
      JOIN U_Users U ON UN.U_ID = U.U_ID
      JOIN N_Needs N ON UN.N_ID = N.N_ID
      WHERE UN.UN_Fulfilled = FALSE;
    `);

    // Convert the result to GeoJSON format
    const geoJson = {
      type: 'FeatureCollection',
      features: result.rows.map(row => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: row.un_geolocation.split(',').reverse().map(Number),
        },
        properties: {
          name: row.name,
          need: row.need,
        },
      })),
    };

    res.json(geoJson);
  } catch (error) {
    console.error('Error fetching needs data from the database:', error);
    res.status(500).json({ error: 'Failed to fetch need data from the database' });
  }
});

// Route to handle user registration
app.post('/api/register', async (req, res) => {
  const { U_FirstName, U_LastName, U_City, U_State, U_Zip, U_HasNeedsNow, U_RegistrationDate, U_Active } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO U_Users (U_FirstName, U_LastName, U_City, U_State, U_Zip, U_HasNeedsNow, U_RegistrationDate, U_Active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING U_ID;
    `, [U_FirstName, U_LastName, U_City, U_State, U_Zip, U_HasNeedsNow, U_RegistrationDate, U_Active]);

    const newUserId = result.rows[0].u_id;
    res.json({ success: true, userId: newUserId });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Default route for testing
app.get('/', (req, res) => {
  console.log('Test endpoint hit');
  res.send('Test!');
});
