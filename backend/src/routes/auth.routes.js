const express = require('express');
const router = express.Router();
const axios = require('axios');

// Middleware to validate reCAPTCHA token
const validateRecaptcha = (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'reCAPTCHA token is required'
    });
  }
  next();
};

router.post('/verify-recaptcha', validateRecaptcha, async (req, res) => {
  try {
    const { token } = req.body;
    
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token
        }
      }
    );

    if (response.data.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid captcha',
        details: response.data['error-codes']
      });
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      details: error.message
    });
  }
});

module.exports = router; 