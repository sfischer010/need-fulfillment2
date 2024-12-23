const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const session = require('express-session');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const pgSession = require('connect-pg-simple')(session);
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

const secretKey = crypto.randomBytes(64).toString('hex');

const geocodingClient = mbxGeocoding({ accessToken: 'pk.eyJ1IjoidGVsZXNjb3BlMDEiLCJhIjoiY200N3MyZ3lzMDUyNDJrcHcybnBvcnp0ZSJ9.M2Kzxx3IpkukrYWDbuvygw' });

const pool = new Pool({
  user: 'stephanief0101',
  host: 'localhost',
  database: 'NeedFulfillment',
  password: 'Telescope0202',
  port: 5432,
});

// Use the generated secret key in session setup with PostgreSQL store
app.use(session({
  store: new pgSession({
    pool: pool, // Connection pool
    tableName: 'session' // Table to store sessions
  }),
  secret: secretKey,
  resave: false,
  saveUninitialized: false, // Only save the session if it has been modified
  cookie: { secure: false } // Set to true if using HTTPS
}));
// Test the database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to the database');
  release();
});

app.use(cors());
/*
PRODUCTION:
app.use(cors({
  origin: 'https://need-fulfillment-26482.nodechef.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));*/

app.use(bodyParser.json());


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
app.use((req, res, next) => {
  console.log('Session user:', session.userId);
  next();
});

// Route to fetch need points from the database
app.get('/api/get-need-data', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT U.U_ID as userId, U.U_FirstName || ' ' || U.U_LastName AS name, N.N_Title AS need, UN_Description as details, UN.UN_GeoLocation
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
          userId: row.userid,
          name: row.name,
          need: row.need,
          details: row.details,
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
  const { U_Email, U_Password, U_FirstName, U_LastName, U_City, U_State, U_Zip, U_HasNeedsNow, U_RegistrationDate, U_Active } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO U_Users (U_Email, U_Password, U_FirstName, U_LastName, U_City, U_State, U_Zip, U_HasNeedsNow, U_RegistrationDate, U_Active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING U_ID;
    `, [U_Email, U_Password, U_FirstName, U_LastName, U_City, U_State, U_Zip, U_HasNeedsNow, U_RegistrationDate, U_Active]);

    const newUserId = result.rows[0].u_id;
    res.json({ success: true, userId: newUserId });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.get('/api/geocode', async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const response = await geocodingClient.reverseGeocode({
      query: [parseFloat(longitude), parseFloat(latitude)],
      types: ['place', 'postcode', 'region']
    }).send();

    const results = response.body.features;
    if (results && results.length > 0) {
      const cityFeature = results.find(feature => feature.place_type.includes('place'));
      const stateFeature = results.find(feature => feature.place_type.includes('region'));
      const zipFeature = results.find(feature => feature.place_type.includes('postcode'));

      const city = cityFeature ? cityFeature.text : 'Unknown';
      const state = stateFeature ? stateFeature.text : 'Unknown';
      const zip = zipFeature ? zipFeature.text : 'Unknown';

      return res.json({
        city,
        state,
        zip
      });
    } else {
      return res.status(404).json({ error: 'Location data not found' });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return res.status(500).json({ error: 'Error retrieving geolocation data' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT U_ID, U_Email, U_Password FROM U_Users WHERE U_Email = $1', [email]);
    const user = result.rows[0];
    console.log(user);
    if (user && user.u_password && password) {
      //const match = await bcrypt.compare(password, user.u_password); //TODO: Fix, ensure this is done.
      const match = true;
      if (match) {
        session.userId = user.u_id;
        res.send('Login successful');
      } else {
        res.status(401).send('Invalid email or password');
      }
    } else {
      res.status(401).send('Invalid email or password');
    }
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).send('Internal server error');
  }
});

app.get('/api/check-login', (req, res) => {
  if (session.userId) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.send('Logged out');
});

// Get user's location
app.get('/api/get-user-location', async (req, res) => {
  console.log(session);
  if (!session.userId) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const result = await pool.query('SELECT U_GeoLocation FROM U_Users WHERE U_ID = $1', [session.userId]);
    const user = result.rows[0];

    if (user && user.u_geolocation) {
      const [latitude, longitude] = user.u_geolocation.split(',').map(Number);
      res.json({ latitude, longitude });
    } else {
      res.status(404).send('Location not found');
    }
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).send('Internal server error');
  }
});

app.get('/api/active-needs', async (req, res) => {
  try {
    const result = await pool.query('SELECT N_ID, N_Title FROM N_Needs WHERE N_Active = TRUE');
    res.json(result.rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).send('Internal server error');
  }
});

app.post('/api/post-need', async (req, res) => {
  const { need, description, geoLocation } = req.body;
  try {
    await pool.query('INSERT INTO UN_UserNeedsLnk (U_ID, N_ID, UN_Description, UN_Geolocation, UN_Fulfilled) VALUES ($1, $2, $3, $4, $5)', [session.userId, need, description, geoLocation, false]);
    res.status(201).send('Need posted successfully');
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).send('Internal server error');
  }
});

app.get('/api/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query('SELECT U_FirstName, U_LastName FROM U_Users WHERE U_ID = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }

    const user = result.rows[0];
    res.json({
      firstName: user.u_firstname,
      lastName: user.u_lastname
    });
  } catch (error) {
    console.error('Error fetching user information:', error);
    res.status(500).send('Internal server error');
  }
});

app.post('/api/send-message', async (req, res) => {
  const { recipientId, UN_Message } = req.body;

  if (!session.userId) {
    return res.status(401).send('Unauthorized');
  }

  try {
    // Fetch the recipient user's first name and last name
    const recipientResult = await pool.query('SELECT U_FirstName, U_LastName FROM U_Users WHERE U_ID = $1', [recipientId]);

    if (recipientResult.rows.length === 0) {
      return res.status(404).send('Recipient not found');
    }

    const recipient = recipientResult.rows[0];

    // Insert the new message into UN_Messages table
    await pool.query(
      'INSERT INTO UN_Messages (U_ID, UN_MessageTo, UN_Message, UN_Date, UN_Viewed, UN_IsParent) VALUES ($1, $2, $3, NOW(), $4, $5)',
      [session.userId, recipientId, UN_Message, false, true]
    );

    // Send response with recipient's first name and last name
    res.status(201).json({
      message: 'Message sent successfully',
      recipientFirstName: recipient.u_firstname,
      recipientLastName: recipient.u_lastname,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Internal server error');
  }
});

app.get('/api/messages', async (req, res) => {
  if (!session.userId) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const result = await pool.query(`
      SELECT 
        M.M_MessageID, 
        M.UN_Message, 
        M.UN_Date, 
        M.UN_Viewed, 
        M.UN_ReplyTo,
        M.UN_IsParent,
        U.U_FirstName || ' ' || U.U_LastName AS senderName
      FROM UN_Messages M
      JOIN U_Users U ON M.U_ID = U.U_ID
      WHERE M.UN_MessageTo = $1
      ORDER BY M.UN_Date DESC
    `, [session.userId]);

    console.log(result.rows); // Debug log to check the result
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).send('Server error');
  }
});

app.post('/api/messages/reply', async (req, res) => {
  if (!session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const { message, replyTo } = req.body;

  try {
    // Ensure session.userId is correctly assigned
    const userId = session.userId;

    // Insert the reply message into the database
    await pool.query(`
      INSERT INTO UN_Messages (UN_Message, UN_Date, UN_Viewed, UN_MessageTo, UN_ReplyTo, U_ID, UN_IsParent)
      VALUES ($1, NOW(), false, $2, $3, $4, false)
    `, [message, userId, replyTo, userId]);

    // Fetch updated messages to return to the client
    const result = await pool.query(`
      SELECT 
        M.M_MessageID, 
        M.UN_Message, 
        M.UN_Date, 
        M.UN_Viewed, 
        M.UN_ReplyTo,
        M.UN_IsParent,
        U.U_FirstName || ' ' || U.U_LastName AS senderName
      FROM UN_Messages M
      JOIN U_Users U ON M.U_ID = U.U_ID
      WHERE M.UN_MessageTo = $1
      ORDER BY M.UN_Date DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error inserting reply:', err);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Need Fulfillment app listening at ${port}`);
});

// Default route for testing
app.get('/', (req, res) => {
  console.log('Test endpoint hit');
  res.send('Test!');
});
