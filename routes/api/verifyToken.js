const express = require('express');
const router = express.Router();    

router.post('/', (req, res) => {
    const token = req.body.token;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
  
    try {
      // Verify the token using the secret or public key
      const decoded = jwt.verify(token, WP_JWT_SECRET);
  
      // Token is valid
      return res.status(200).json({ message: 'Token is valid', decoded });
    } catch (err) {
      // Token is invalid or expired
      return res.status(401).json({ error: 'Invalid token' });
    }
  });

module.exports = router;