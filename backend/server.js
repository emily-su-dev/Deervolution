const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

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
    const { result, address, time } = req.body;
  
    // Validate the 'result' field to make sure it corresponds to a valid animal
    if (!result || !['deers', 'geese', 'racoons', 'squirrels', 'sparrow'].includes(result)) {
      return res.status(400).send('Invalid animal type');
    }
  
    try {
      // The userid should be passed as part of the request
      const { userid } = req.query;
  
      if (!userid) {
        return res.status(400).send('Missing userid');
      }
  
      // Step 1: Increment the corresponding animal column for the given userid in accountdatabase
      const { data: updateData, error: updateError } = await supabase
        .from('accountdatabase') // Replace with your actual table name
        .update({ [result]: supabase.raw(`${result} + 1`) }) // Dynamically increment the column
        .eq('userid', userid);
  
      if (updateError) {
        return res.status(500).send(`Error: ${updateError.message}`);
      }
  
      // Step 2: Add an entry to the user's individual animal history table
      // Sanitize the email to form a valid table name (replace `@` and `.` for SQL compatibility)
      const sanitizedUserid = userid.replace('@', '_').replace('.', '_');
      const userAnimalHistoryTable = `${sanitizedUserid}_animal_history`;
  
      const { data: insertData, error: insertError } = await supabase
        .from(userAnimalHistoryTable) // Use the user's table dynamically
        .insert([
          {
            animal_type: result,
            date_time: time || new Date().toISOString(), // Use provided time or current time
            location: address || 'Unknown', // Use provided address or default 'Unknown'
          },
        ]);

        //Step 3: Add an entry to the recentFindings table 
        
  
      if (insertError) {
        return res.status(500).send(`Error adding to history table: ${insertError.message}`);
      }
  
      // Step 3: Send success message
      res.status(200).send(`Successfully incremented ${result} for user ${userid} and added history entry.`);
    } catch (error) {
      res.status(500).send(`Unexpected error: ${error.message}`);
    }
  });
  

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
