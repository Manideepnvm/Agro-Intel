const cacheManager = require('../config/redis');

// Response caching middleware
const cacheResponse = (duration = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator 
        ? keyGenerator(req)
        : `response:${req.method}:${req.originalUrl}:${req.user?.uid || 'anonymous'}`;

      // Try to get cached response
      const cachedResponse = await cacheManager.get(cacheKey);
      
      if (cachedResponse) {
        console.log(`Cache HIT for key: ${cacheKey}`);
        return res.json(cachedResponse);
      }

      console.log(`Cache MISS for key: ${cacheKey}`);

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache the response
      res.json = function(data) {
        // Cache the response data
        cacheManager.set(cacheKey, data, duration).catch(error => {
          console.error('Failed to cache response:', error.message);
        });

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      // Continue without caching if Redis fails
      next();
    }
  };
};

// User profile cache middleware
const cacheUserProfile = async (req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  try {
    const uid = req.user?.uid;
    if (!uid) {
      return next();
    }

    const cachedProfile = await cacheManager.getUserProfile(uid);
    
    if (cachedProfile) {
      console.log(`User profile cache HIT for: ${uid}`);
      return res.json(cachedProfile);
    }

    console.log(`User profile cache MISS for: ${uid}`);

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache the profile
    res.json = function(data) {
      // Cache the user profile
      if (data && !data.error) {
        cacheManager.cacheUserProfile(uid, data, 1800).catch(error => {
          console.error('Failed to cache user profile:', error.message);
        });
      }

      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    console.error('User profile cache middleware error:', error.message);
    next();
  }
};

// Cache invalidation middleware
const invalidateCache = (patterns = []) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;

    const invalidatePatterns = async () => {
      try {
        const uid = req.user?.uid;
        
        for (const pattern of patterns) {
          let finalPattern = pattern;
          
          // Replace placeholders
          if (uid) {
            finalPattern = finalPattern.replace(':uid', uid);
          }
          
          const deletedCount = await cacheManager.flushPattern(finalPattern);
          if (deletedCount > 0) {
            console.log(`Invalidated ${deletedCount} cache entries for pattern: ${finalPattern}`);
          }
        }
      } catch (error) {
        console.error('Cache invalidation error:', error.message);
      }
    };

    // Override response methods to invalidate cache after successful operations
    res.json = function(data) {
      const result = originalJson.call(this, data);
      
      // Only invalidate on successful operations (status 200-299)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidatePatterns();
      }
      
      return result;
    };

    res.send = function(data) {
      const result = originalSend.call(this, data);
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidatePatterns();
      }
      
      return result;
    };

    next();
  };
};

// Session caching middleware
const cacheSession = async (req, res, next) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return next();
    }

    // Try to get cached session
    const cachedSession = await cacheManager.getUserSession(uid);
    
    if (cachedSession) {
      req.cachedSession = cachedSession;
      console.log(`Session cache HIT for: ${uid}`);
    } else {
      console.log(`Session cache MISS for: ${uid}`);
    }

    next();
  } catch (error) {
    console.error('Session cache middleware error:', error.message);
    next();
  }
};

// Database query caching wrapper
const cacheQuery = (model, duration = 600) => {
  return {
    async findOne(query, projection = null) {
      const cacheKey = `query:${model.modelName}:findOne:${JSON.stringify(query)}:${JSON.stringify(projection)}`;
      
      try {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          console.log(`Query cache HIT for: ${cacheKey}`);
          return cached;
        }

        console.log(`Query cache MISS for: ${cacheKey}`);
        const result = await model.findOne(query, projection);
        
        if (result) {
          await cacheManager.set(cacheKey, result, duration);
        }
        
        return result;
      } catch (error) {
        console.error('Query cache error:', error.message);
        return await model.findOne(query, projection);
      }
    },

    async find(query, projection = null, options = {}) {
      const cacheKey = `query:${model.modelName}:find:${JSON.stringify(query)}:${JSON.stringify(projection)}:${JSON.stringify(options)}`;
      
      try {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          console.log(`Query cache HIT for: ${cacheKey}`);
          return cached;
        }

        console.log(`Query cache MISS for: ${cacheKey}`);
        const result = await model.find(query, projection, options);
        
        if (result && result.length > 0) {
          await cacheManager.set(cacheKey, result, duration);
        }
        
        return result;
      } catch (error) {
        console.error('Query cache error:', error.message);
        return await model.find(query, projection, options);
      }
    },

    async countDocuments(query) {
      const cacheKey = `query:${model.modelName}:count:${JSON.stringify(query)}`;
      
      try {
        const cached = await cacheManager.get(cacheKey);
        if (cached !== null) {
          console.log(`Count cache HIT for: ${cacheKey}`);
          return cached;
        }

        console.log(`Count cache MISS for: ${cacheKey}`);
        const result = await model.countDocuments(query);
        
        await cacheManager.set(cacheKey, result, duration);
        
        return result;
      } catch (error) {
        console.error('Count cache error:', error.message);
        return await model.countDocuments(query);
      }
    }
  };
};

// Rate limiting with Redis
const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return async (req, res, next) => {
    try {
      const identifier = req.user?.uid || req.ip;
      const key = `ratelimit:${identifier}`;
      
      const current = await cacheManager.get(key);
      const currentCount = current ? parseInt(current) : 0;
      
      if (currentCount >= maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds.`,
          retryAfter: windowMs / 1000
        });
      }
      
      // Increment counter
      await cacheManager.set(key, currentCount + 1, Math.ceil(windowMs / 1000));
      
      // Add headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - currentCount - 1),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });
      
      next();
    } catch (error) {
      console.error('Rate limiter error:', error.message);
      // Continue without rate limiting if Redis fails
      next();
    }
  };
};

module.exports = {
  cacheResponse,
  cacheUserProfile,
  invalidateCache,
  cacheSession,
  cacheQuery,
  rateLimiter
};