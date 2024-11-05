const express = require("express");
const Messages = require("../models/messages");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

// Get chats for a specific user
router.get("/getChat/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const chat = await Messages.findOne({ user_id: id });

    // Return an empty array if no chat is found
    if (!chat) {
      return res.json([]);
    }

    // Return the existing messages
    res.json(chat.messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/updateChats/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const newMessages = req.body;
  
  try {
    // Find the existing chat document for the user
    const chat = await Messages.findOne({ user_id: id });

    // If no chat is found, create a new document for the user
    if (!chat) {
      const initialMessages = Array.isArray(newMessages) ? newMessages : []; // Ensure newMessages is an array
      const newChat = new Messages({ user_id: id, messages: initialMessages });
      await newChat.save();
      return res.json({
        message: "Chat created and message added successfully",
        chats: newChat.messages,
      });
    }

    chat.messages = Array.isArray(newMessages) ? newMessages : []; // Ensure newMessages is an array
    
    await chat.save();
    res.json({ message: "Chat updated successfully", chats: chat.messages });
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
