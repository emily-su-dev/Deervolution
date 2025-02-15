const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Add this function to detect Python command
async function getPythonCommand() {
    // Order from most specific to most general
    const commands = [
        'python3',
        'python',
        'py -3',    // Windows Python Launcher (Python 3)
        'py',       // Windows Python Launcher
        'python3.exe',
        'python.exe'
    ];
    
    for (const cmd of commands) {
        try {
            await new Promise((resolve, reject) => {
                // Use shell: true for Windows to handle 'py -3' properly
                const process = spawn(cmd, ['--version'], { shell: true });
                process.on('close', (code) => code === 0 ? resolve() : reject());
                process.on('error', reject);
            });
            return cmd;
        } catch (err) {
            continue;
        }
    }
    throw new Error('No Python interpreter found. Please install Python.');
}

const app = express();
const PORT = 8000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send({ message: 'Express server is running!' });
});

app.post('/analyze-image', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
    }

    const tempFilePath = path.join('temp', `${Date.now()}.jpg`);
    
    try {
        const pythonCommand = await getPythonCommand();
        await fs.mkdir('temp', { recursive: true });
        await fs.writeFile(tempFilePath, req.file.buffer);

        const analyzeImage = () => {
            return new Promise((resolve, reject) => {
                const pythonProcess = spawn(pythonCommand, ['analyze.py'], {
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
