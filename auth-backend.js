// Required dependencies:
// npm install express bcryptjs jsonwebtoken cors dotenv

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory user store (replace with database in production)
const users = [];
const events = []; 

// Environment variables (store in .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const PORT = process.env.PORT || 3001;

// User registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = {
      id: users.length + 1,
      email,
      password: hashedPassword
    };

    users.push(user);

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Protected route example
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};


// Add events endpoint
app.get('/api/events', authenticateToken, (req, res) => {
  res.json(events);
});

// Add Event endpoint
app.post('/api/add_event', authenticateToken, (req, res) => {
  const { title, category, date, description, organizer } = req.body;

  // Check for missing fields
  if (!title || !category || !date || !description || !organizer) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Create a new event object
  const newEvent = {
    id: events.length + 1, // Simple ID generation
    title,
    category,
    date,
    description,
    organizer,
    createdAt: new Date(),
  };

  // Store the event in memory (replace with a database operation)
  events.push(newEvent);

  res.status(201).json({
    message: 'Event added successfully',
    event: newEvent,
  });
});


// Endpoint to edit an event
app.put('/api/edit_event/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, category, date, description, organizer } = req.body;

  // Find the event by id
  const eventIndex = events.findIndex(event => event.id === parseInt(id));

  if (eventIndex === -1) {
    return res.status(404).json({ message: 'Event not found' });
  }

  // Update the event
  events[eventIndex] = {
    id: events[eventIndex].id, // keep the same id
    title: title || events[eventIndex].title,
    category: category || events[eventIndex].category,
    date: date || events[eventIndex].date,
    description: description || events[eventIndex].description,
    organizer: organizer || events[eventIndex].organizer,
  };

  res.json({ message: 'Event updated successfully', event: events[eventIndex] });
});

// Endpoint to delete an event
app.delete('/api/delete_event/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Find the event by id
  const eventIndex = events.findIndex(event => event.id === parseInt(id));

  if (eventIndex === -1) {
    return res.status(404).json({ message: 'Event not found' });
  }

  // Remove the event from the array
  events.splice(eventIndex, 1);

  res.json({ message: 'Event deleted successfully' });
});


// Example protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected data', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
