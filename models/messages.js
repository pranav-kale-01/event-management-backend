const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the Message schema
const messageSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  messages: [
    {
      text: {
        type: String,
        required: true
      },
      fromBot: {
        type: Boolean,
        required: true
      }
    }
  ]
}, { timestamps: true });

// Create the Message model
const Message = mongoose.model("Messages", messageSchema);

module.exports = Message;
