const express = require('express');
const router = express.Router();
const axios = require('axios');
const cacheManager = require('../config/redis');
const { rateLimiter } = require('../middleware/cache');

// Middleware to validate reCAPTCHA token with caching
const validateRecaptcha = async (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'reCAPTCHA token is required'
    });
  }

  try {
    // Check if token is already validated (cache for 1 minute to prevent replay attacks)
    const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
    const cacheKey = `recaptcha:${tokenHash}`;
    
    const cached = await cacheManager.get(cacheKey);
    if (cached !== null) {
      console.log('reCAPTCHA cache HIT');
      if (cached.success) {
        req.recaptchaResult = cached;
        return next();
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid captcha (cached)',
          details: cached['error-codes']
        });
      }
    }

    console.log('reCAPTCHA cache MISS');
    next();
  } catch (error) {
    console.error('reCAPTCHA cache check error:', error);
    next(); // Continue without cache if Redis fails
  }
};

// Apply rate limiting to auth routes (more restrictive)
router.use(rateLimiter(15 * 60 * 1000, 50)); // 50 requests per 15 minutes

router.post('/verify-recaptcha', validateRecaptcha, async (req, res) => {
  try {
    const { token } = req.body;
    
    // If we have cached result, use it
    if (req.recaptchaResult) {
      return res.json(req.recaptchaResult);
    }

    // Verify with Google
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
          remoteip: req.ip
        },
        timeout: 10000 // 10 second timeout
      }
    );

    const result = {
      success: response.data.success,
      timestamp: new Date().toISOString(),
      hostname: response.data.hostname,
      'error-codes': response.data['error-codes'] || []
    };

    // Cache the result for 1 minute
    const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
    const cacheKey = `recaptcha:${tokenHash}`;
    await cacheManager.set(cacheKey, result, 60);

    if (result.success) {
      // Also track successful verifications by IP for analytics
      const ipKey = `recaptcha:ip:${req.ip}:${new Date().getHours()}`;
      const currentCount = await cacheManager.get(ipKey) || 0;
      await cacheManager.set(ipKey, currentCount + 1, 3600); // 1 hour

      res.json({ success: true, timestamp: result.timestamp });
    } else {
      console.warn('reCAPTCHA verification failed:', {
        ip: req.ip,
        errors: result['error-codes'],
        timestamp: result.timestamp
      });

      res.status(400).json({
        success: false,
        message: 'Invalid captcha',
        details: result['error-codes']
      });
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error.message);
    
    // Don't cache failures due to network issues
    res.status(500).json({
      success: false,
      message: 'Verification failed due to server error',
      details: 'Please try again'
    });
  }
});

// Enhanced rate limiting for login attempts
const loginRateLimiter = async (req, res, next) => {
  try {
    const identifier = req.body.email || req.ip;
    const key = `login:attempts:${identifier}`;
    
    const attempts = await cacheManager.get(key) || 0;
    const maxAttempts = 5;
    const windowMs = 15 * 60 * 1000; // 15 minutes
    
    if (attempts >= maxAttempts) {
      const ttl = await cacheManager.client?.ttl(key) || 0;
      return res.status(429).json({
        success: false,
        message: 'Too many login attempts',
        retryAfter: ttl,
        maxAttempts
      });
    }
    
    // Increment attempts counter
    await cacheManager.set(key, attempts + 1, Math.ceil(windowMs / 1000));
    
    next();
  } catch (error) {
    console.error('Login rate limiter error:', error);
    next(); // Continue without rate limiting if Redis fails
  }
};

// Login endpoint with enhanced security
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { email, token } = req.body;
    
    if (!email || !token) {
      return res.status(400).json({
        success: false,
        message: 'Email and token are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Here you would normally verify the token with Firebase Auth
    // For now, we'll simulate a successful login
    
    // Check if user is temporarily blocked
    const blockKey = `user:blocked:${email}`;
    const isBlocked = await cacheManager.get(blockKey);
    
    if (isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Account temporarily suspended. Please contact support.',
        blocked: true
      });
    }

    // Simulate successful login
    const loginSession = {
      email,
      loginTime: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: require('crypto').randomUUID()
    };

    // Cache login session
    const sessionKey = `login:session:${email}`;
    await cacheManager.set(sessionKey, loginSession, 8 * 60 * 60); // 8 hours

    // Clear login attempts on successful login
    const attemptsKey = `login:attempts:${email}`;
    await cacheManager.del(attemptsKey);

    // Log successful login for analytics
    const loginLogKey = `login:log:${new Date().toISOString().split('T')[0]}`;
    const dailyLogins = await cacheManager.get(loginLogKey) || 0;
    await cacheManager.set(loginLogKey, dailyLogins + 1, 24 * 60 * 60); // 24 hours

    res.json({
      success: true,
      message: 'Login successful',
      sessionId: loginSession.sessionId,
      timestamp: loginSession.loginTime
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed due to server error'
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const { email, sessionId } = req.body;
    
    if (email) {
      // Invalidate session
      const sessionKey = `login:session:${email}`;
      await cacheManager.del(sessionKey);
      
      // Invalidate auth cache
      await cacheManager.flushPattern(`auth:*`);
      
      // Invalidate user-specific caches
      await cacheManager.flushPattern(`user:*:${email}*`);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Password reset rate limiting
const passwordResetRateLimiter = async (req, res, next) => {
  try {
    const email = req.body.email;
    const key = `password:reset:${email}`;
    
    const resetAttempts = await cacheManager.get(key) || 0;
    const maxAttempts = 3;
    const windowMs = 60 * 60 * 1000; // 1 hour
    
    if (resetAttempts >= maxAttempts) {
      const ttl = await cacheManager.client?.ttl(key) || 0;
      return res.status(429).json({
        success: false,
        message: 'Too many password reset attempts',
        retryAfter: ttl,
        maxAttempts
      });
    }
    
    // Increment attempts
    await cacheManager.set(key, resetAttempts + 1, Math.ceil(windowMs / 1000));
    
    next();
  } catch (error) {
    console.error('Password reset rate limiter error:', error);
    next();
  }
};

// Password reset endpoint
router.post('/reset-password', passwordResetRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Generate reset token (in production, this would be handled by Firebase Auth)
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetKey = `password:reset:token:${resetToken}`;
    
    // Store reset token with email (valid for 1 hour)
    await cacheManager.set(resetKey, { email, createdAt: new Date().toISOString() }, 3600);

    // In production, you would send this token via email
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'Password reset instructions sent to your email',
      // Remove this in production
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });

  } catch (error) {
    console.error('Password reset error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
});

// Verify reset token
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    const resetKey = `password:reset:token:${token}`;
    const tokenData = await cacheManager.get(resetKey);
    
    if (!tokenData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if token is not too old (additional check)
    const tokenAge = new Date() - new Date(tokenData.createdAt);
    const maxAge = 60 * 60 * 1000; // 1 hour
    
    if (tokenAge > maxAge) {
      await cacheManager.del(resetKey);
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    res.json({
      success: true,
      email: tokenData.email,
      message: 'Reset token is valid'
    });

  } catch (error) {
    console.error('Verify reset token error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
});

// Get auth statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    // Simple admin check - implement proper auth in production
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer admin_')) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [todayLogins, yesterdayLogins] = await Promise.all([
      cacheManager.get(`login:log:${today}`) || 0,
      cacheManager.get(`login:log:${yesterday}`) || 0
    ]);

    const stats = {
      logins: {
        today: todayLogins,
        yesterday: yesterdayLogins,
        change: todayLogins - yesterdayLogins
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Auth stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// Session validation endpoint
router.get('/validate-session', async (req, res) => {
  try {
    const { email, sessionId } = req.query;
    
    if (!email || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Email and session ID are required'
      });
    }

    const sessionKey = `login:session:${email}`;
    const sessionData = await cacheManager.get(sessionKey);
    
    if (!sessionData || sessionData.sessionId !== sessionId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    // Check session age
    const sessionAge = new Date() - new Date(sessionData.loginTime);
    const maxAge = 8 * 60 * 60 * 1000; // 8 hours
    
    if (sessionAge > maxAge) {
      await cacheManager.del(sessionKey);
      return res.status(401).json({
        success: false,
        message: 'Session expired'
      });
    }

    res.json({
      success: true,
      session: {
        email: sessionData.email,
        loginTime: sessionData.loginTime,
        remaining: Math.max(0, maxAge - sessionAge)
      }
    });

  } catch (error) {
    console.error('Session validation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Session validation failed'
    });
  }
});

module.exports = router;