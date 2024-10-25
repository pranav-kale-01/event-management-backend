const express = require('express');
const authenticateToken = require('../middleware/authMiddleware'); // Adjust path if needed

const router = express.Router();

// Example protected route
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected data', user: req.user });
});

module.exports = router;
