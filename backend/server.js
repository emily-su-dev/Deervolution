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

    console.log("result: ", result);
    console.log("address: ", address);
    console.log("time: ", time);
    console.log("userid: ", userid);

    // Validate the 'result' field to make sure it corresponds to a valid animal
    const validAnimals = ['Deer', 'Canada Goose', 'Raccoon', 'Squirrel', 'Sparrow'];
    if (!result || !validAnimals.includes(result)) {
        return res.status(400).send('Invalid animal type');
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const query = `
            UPDATE accountdatabase
            SET "${result}" = COALESCE("${result}", 0) + 1
            WHERE userid = $1
            RETURNING *;
        `;
        await client.query(query, [userid]);
        await client.query('COMMIT');
        res.status(200).send(`Successfully incremented ${result} for user ${userid}.`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error:', error);
        res.status(500).send(`Unexpected error: ${error.message}`);
    } finally {
        client.release();
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
