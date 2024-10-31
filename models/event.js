const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Event",
  },
  text: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: "Anonymous",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    organizer: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    likes: { type: Number, default: 0, required: true },
    comments: [commentSchema],
    registrations: {type: [String], deafult: [], required: true }
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
