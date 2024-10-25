const express = require('express');
const Event = require("../models/event");
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

// Add events endpoint
router.get('/', authenticateToken, async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// Add Event endpoint
router.post('/add_event', authenticateToken, async (req, res) => {
  const { title, category, date, description, organizer } = req.body;

  // Check for missing fields
  if (!title || !category || !date || !description || !organizer) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Create a new event object
  const newEvent = new Event({ title, category, date, description, organizer });
  await newEvent.save();

  res.status(201).json({ message: 'Event added successfully', event: newEvent });
});

// Endpoint to edit an event
router.put('/edit_event/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, category, date, description, organizer } = req.body;

  // Update the event
  const updatedEvent = await Event.findByIdAndUpdate(id, { title, category, date, description, organizer }, { new: true });
  if (!updatedEvent) {
    return res.status(404).json({ message: 'Event not found' });
  }

  res.json({ message: 'Event updated successfully', event: updatedEvent });
});

// Endpoint to delete an event
router.delete('/delete_event/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  const deletedEvent = await Event.findByIdAndDelete(id);
  if (!deletedEvent) {
    return res.status(404).json({ message: 'Event not found' });
  }

  res.json({ message: 'Event deleted successfully' });
});

module.exports = router;
