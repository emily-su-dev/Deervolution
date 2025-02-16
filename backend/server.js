const supabase = require('./supabaseClient.js');

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { Pool } = require("pg");

const app = express();
const PORT = 8000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

// Set up PostgreSQL connection
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
  });

app.get('/', (req, res) => {
    res.send({ message: 'Express server is running!' });
});


app.post('/analyze-image', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
    }

    const tempFilePath = path.join('temp', `${Date.now()}.jpg`);

    try {
        await fs.mkdir('temp', { recursive: true });
        await fs.writeFile(tempFilePath, req.file.buffer);

        // Create a Promise to handle the Python process
        const analyzeImage = () => {
            return new Promise((resolve, reject) => {
                const pythonProcess = spawn('python3', ['analyze.py'], {
                    env: { ...process.env, IMAGE_PATH: tempFilePath }
                });

                let result = '';
                let error = '';

                pythonProcess.stdout.on('data', (data) => {
                    result += data.toString();
                });

                pythonProcess.stderr.on('data', (data) => {
                    error += data.toString();
                });

                pythonProcess.on('close', (code) => {
                    if (code !== 0) {
                        reject(new Error(`Process exited with code ${code}: ${error}`));
                    } else {
                        resolve(result.trim());
                    }
                });

                pythonProcess.on('error', reject);
            });
        };

        const result = await analyzeImage();
        await fs.unlink(tempFilePath);
        res.json({ result });

    } catch (error) {
        console.error('Error:', error);
        try {
            await fs.unlink(tempFilePath);
        } catch (err) {
            console.error('Error deleting temporary file:', err);
        }
        res.status(500).json({ error: error.message || 'Server error' });
    }
});


app.post('/increment', async (req, res) => {
    const { result, address, time, userid } = req.body;

    // Validate the 'result' field
    const validAnimals = ['Deer', 'Canada Goose', 'Raccoon', 'Squirrel', 'Sparrow'];
    if (!result || !validAnimals.includes(result)) {
        return res.status(400).send('Invalid animal type');
    }

    // Parse the timestamp into ISO format
    const formattedTime = new Date(time.replace(", ", " ").replace("a.m.", "AM").replace("p.m.", "PM")).toISOString();

    try {
        // Increment the animal count
        const accountClient = await pool.connect();
        try {
            await accountClient.query('BEGIN');
            const query = `
                UPDATE accountdatabase
                SET "${result}" = COALESCE("${result}", 0) + 1
                WHERE userid = $1
                RETURNING *;
            `;
            await accountClient.query(query, [userid]);
            await accountClient.query('COMMIT');
        } finally {
            accountClient.release();
        }

        // Update recentfindings table
        const [latitude, longitude] = address.split(',').map(coord => coord.trim());
        const findingsClient = await pool.connect();
        try {
            await findingsClient.query('BEGIN');
            const query = `
                INSERT INTO recentfindings (datetime, animal, userid, latitude, longitude)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
            `;
            await findingsClient.query(query, [formattedTime, result, userid, latitude, longitude]);
            await findingsClient.query('COMMIT');
        } finally {
            findingsClient.release();
        }

        return res.status(200).send(`Successfully incremented ${result} for user ${userid}.`);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send(`Unexpected error: ${error.message}`);
    }
});

// Endpoint to get the recent findings for all users in the past hour
app.get('/recent-findings', async (req, res) => {
    const findingsClient = await pool.connect();
    try {
        const query = `
            SELECT 
                datetime, 
                animal, 
                userid, 
                CAST(latitude AS DECIMAL(10,8)) as latitude, 
                CAST(longitude AS DECIMAL(11,8)) as longitude
            FROM recentfindings
            WHERE datetime > NOW() - INTERVAL '1 hour'
            ORDER BY datetime DESC;
        `;
        const result = await findingsClient.query(query);
        const parsedRows = result.rows.map(row => ({
            ...row,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude)
        }));
        res.json(parsedRows);
    } finally {
        findingsClient.release();
    }
});


app.get('/data', async (req, res) => {
  try {
    const { fetchData } = require('./supabaseService');
    const data = await fetchData();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
