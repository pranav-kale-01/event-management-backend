const express = require("express");
const Event = require("../models/event");
const Feedback = require("../models/feedback");
const Comment = require("../models/comment");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    // Find all events
    const events = await Event.find();

    // For each event, find comments with matching eventId
    const eventsWithComments = await Promise.all(
      events.map(async (event) => {
        const comments = await Comment.find({ eventId: event._id }); // Fetch comments related to this event
        return {
          ...event.toObject(), // Convert event to plain object to modify it
          comments, // Attach comments to event object
        };
      })
    );

    res.json(eventsWithComments);
  } catch (error) {
    console.error("Error fetching events with comments:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Add Event endpoint
router.post("/add_event", authenticateToken, async (req, res) => {
  const { title, category, date, description, organizer } = req.body;

  // Check for missing fields
  if (!title || !category || !date || !description || !organizer) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Create a new event object
  const newEvent = new Event({ title, category, date, description, organizer });
  await newEvent.save();

  res
    .status(201)
    .json({ message: "Event added successfully", event: newEvent });
});

// Endpoint to edit an event
router.put("/edit_event/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    category,
    date,
    description,
    organizer,
    likes,
    comments,
    registrations,
  } = req.body;

  // Update the event
  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    {
      title,
      category,
      date,
      description,
      organizer,
      likes,
      comments,
      registrations,
    },
    { new: true }
  );
  if (!updatedEvent) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.json({ message: "Event updated successfully", event: updatedEvent });
});

// Endpoint to delete an event
router.delete("/delete_event/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  const deletedEvent = await Event.findByIdAndDelete(id);
  if (!deletedEvent) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.json({ message: "Event deleted successfully" });
});

router.post("/submitFeedback", async (req, res) => {
  const { name, email, feedback, rating } = req.body;

  try {
    // Create a new feedback entry
    const newFeedback = new Feedback({
      name,
      email,
      feedback,
      rating,
    });

    // Save to database
    await newFeedback.save();

    res.status(201).json({ message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ message: "Failed to submit feedback." });
  }
});

router.post("/addComment", async (req, res) => {
  const { eventId, text, author, createdAt } = req.body;

  if (!eventId || !text) {
    return res
      .status(400)
      .json({ message: "Event ID and comment text are required." });
  }

  try {
    const newComment = new Comment({
      eventId,
      text,
      author: author || "Anonymous",
      createdAt: createdAt || new Date(),
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error saving comment:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
});

module.exports = router;
