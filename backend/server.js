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
app.use(express.static(path.join(__dirname, 'build')));

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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
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
                const pythonProcess = spawn('python', ['analyze.py'], {
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

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

app.get('/profile/:userid', async (req, res) => {
    const { userid } = req.params;
    const profileClient = await pool.connect();

    try {
        const query = `
            SELECT 
                COALESCE("Deer", 0) AS Deer, 
                COALESCE("Canada Goose", 0) AS CanadaGoose, 
                COALESCE("Raccoon", 0) AS Raccoon, 
                COALESCE("Squirrel", 0) AS Squirrel, 
                COALESCE("Sparrow", 0) AS Sparrow
            FROM accountdatabase
            WHERE userid = $1;
        `;
        const result = await profileClient.query(query, [userid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(result.rows[0]);  // Return user animal sighting data
    } catch (error) {
        console.error("Error fetching profile data:", error);
        res.status(500).json({ error: "Failed to fetch profile data" });
    } finally {
        profileClient.release();
    }
});

app.post('/increment', async (req, res) => {
    const { result, address, time, userid } = req.body;

    // Validate the 'result' field
    const validAnimals = ['Deer', 'Canada Goose', 'Raccoon', 'Squirrel', 'Sparrow'];
    if (!result || !validAnimals.includes(result)) {
        return res.status(400).send('Invalid animal type');
    }

    try {
        // Get current coordinates
        const [currentLat, currentLng] = address.split(',').map(coord => parseFloat(coord.trim()));

        // Check if user has made a submission in the last 5 minutes
        const cooldownClient = await pool.connect();
        try {
            const cooldownQuery = `
                SELECT latitude, longitude, datetime
                FROM recentfindings 
                WHERE userid = $1 
                AND datetime > NOW() - INTERVAL '5 minutes'
                ORDER BY datetime DESC
                LIMIT 1;
            `;
            const cooldownResult = await cooldownClient.query(cooldownQuery, [userid]);

            if (cooldownResult.rows.length > 0) {
                const lastPosting = cooldownResult.rows[0];
                const distance = calculateDistance(
                    currentLat, currentLng,
                    parseFloat(lastPosting.latitude),
                    parseFloat(lastPosting.longitude)
                );

                // If user hasn't moved at least 100 meters, enforce cooldown
                if (distance < 100) {
                    return res.status(429).send('Please wait 5 minutes between submissions or move at least 100 meters away.');
                }
            }
        } finally {
            cooldownClient.release();
        }

        // Rest of the existing code remains the same
        const formattedTime = new Date(time.replace(", ", " ").replace("a.m.", "AM").replace("p.m.", "PM")).toISOString();

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
        const findingsClient = await pool.connect();
        try {
            await findingsClient.query('BEGIN');
            const query = `
                INSERT INTO recentfindings (datetime, animal, userid, latitude, longitude)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
            `;
            await findingsClient.query(query, [formattedTime, result, userid, currentLat, currentLng]);
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
                animal as type, 
                CAST(latitude AS DECIMAL(10,8)) as lat, 
                CAST(longitude AS DECIMAL(11,8)) as lng
            FROM recentfindings
            WHERE datetime > NOW() - INTERVAL '1 hour'
            ORDER BY datetime DESC;
        `;
        const result = await findingsClient.query(query);
        const parsedRows = result.rows.map(row => ({
            ...row,
            lat: parseFloat(row.lat),
            lng: parseFloat(row.lng)
        }));
        res.json(parsedRows);
    } finally {
        findingsClient.release();
    }
});

app.get('/leaderboard', async (req, res) => {
    const accountClient = await pool.connect();
    try {
        const query = `
            SELECT 
                au.email,
                (COALESCE("Deer", 0) * 5 + 
                 COALESCE("Canada Goose", 0) * 4 + 
                 COALESCE("Raccoon", 0) * 3 + 
                 COALESCE("Squirrel", 0) * 2 + 
                 COALESCE("Sparrow", 0) * 1) AS totalPoints
            FROM accountdatabase ad
            JOIN auth.users au ON ad.userid = au.id
            ORDER BY totalPoints DESC;
        `;
        
        const result = await accountClient.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ error: "Failed to fetch leaderboard data" });
    } finally {
        accountClient.release();
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
