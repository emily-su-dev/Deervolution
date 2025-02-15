require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send({ message: 'Express server is running!' });
});

// Define an endpoint (GET request to "/api/users")
app.get('/api/users', (req, res) => {
    const users = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ];  
    res.json(users);
  });
  

app.post('/api/users', (req, res) => {
    const newUser = req.body;
    res.status(201).json({
        message: 'User created successfully',
        user: newUser
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
