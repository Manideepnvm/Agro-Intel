const redis = require('redis');

class CacheManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  async connect() {
    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retryStrategy: (times) => {
          if (times > this.maxReconnectAttempts) {
            console.error('Redis: Maximum reconnection attempts exceeded');
            return null;
          }
          const delay = Math.min(times * this.reconnectDelay, 30000); // Max 30 seconds
          console.log(`Redis: Retrying connection in ${delay}ms (attempt ${times})`);
          return delay;
        },
        lazyConnect: true,
        keepAlive: true,
        maxRetriesPerRequest: 3,
        connectTimeout: 10000,
        commandTimeout: 5000
      });

      this.client.on('connect', () => {
        console.log('Redis: Connection established');
        this.reconnectAttempts = 0;
      });

      this.client.on('ready', () => {
        console.log('Redis: Client ready');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        console.error('Redis Error:', error.message);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('Redis: Connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('Redis: Reconnecting...');
        this.reconnectAttempts++;
      });

      await this.client.connect();
      return true;
    } catch (error) {
      console.error('Redis connection failed:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        console.log('Redis: Disconnected gracefully');
      } catch (error) {
        console.error('Redis disconnect error:', error.message);
        this.client.disconnect();
      }
    }
  }

  // Generic cache operations
  async set(key, value, ttl = 3600) {
    if (!this.isConnected) {
      console.warn('Redis not connected, skipping cache set');
      return false;
    }

    try {
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      await this.client.setEx(key, ttl, serializedValue);
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error.message);
      return false;
    }
  }

  async get(key) {
    if (!this.isConnected) {
      console.warn('Redis not connected, skipping cache get');
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (value === null) return null;

      // Try to parse JSON, return as string if fails
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  }

  async del(key) {
    if (!this.isConnected) {
      console.warn('Redis not connected, skipping cache delete');
      return false;
    }

    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error.message);
      return false;
    }
  }

  async exists(key) {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error.message);
      return false;
    }
  }

  async flushPattern(pattern) {
    if (!this.isConnected) return false;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        return keys.length;
      }
      return 0;
    } catch (error) {
      console.error(`Cache flush pattern error for ${pattern}:`, error.message);
      return false;
    }
  }

  // Specialized methods for common use cases
  async cacheUserProfile(uid, userData, ttl = 1800) { // 30 minutes
    const key = `user:profile:${uid}`;
    return await this.set(key, userData, ttl);
  }

  async getUserProfile(uid) {
    const key = `user:profile:${uid}`;
    return await this.get(key);
  }

  async invalidateUserProfile(uid) {
    const key = `user:profile:${uid}`;
    return await this.del(key);
  }

  async cacheUserSession(uid, sessionData, ttl = 7200) { // 2 hours
    const key = `user:session:${uid}`;
    return await this.set(key, sessionData, ttl);
  }

  async getUserSession(uid) {
    const key = `user:session:${uid}`;
    return await this.get(key);
  }

  async invalidateUserSession(uid) {
    const key = `user:session:${uid}`;
    return await this.del(key);
  }

  // Batch operations
  async mget(keys) {
    if (!this.isConnected) return [];

    try {
      const values = await this.client.mGet(keys);
      return values.map(value => {
        if (value === null) return null;
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });
    } catch (error) {
      console.error('Cache mget error:', error.message);
      return new Array(keys.length).fill(null);
    }
  }

  async mset(keyValuePairs, ttl = 3600) {
    if (!this.isConnected) return false;

    try {
      const pipeline = this.client.multi();
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
        pipeline.setEx(key, ttl, serializedValue);
      }
      
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache mset error:', error.message);
      return false;
    }
  }

  // Health check
  async healthCheck() {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error.message);
      return false;
    }
  }

  // Get cache statistics
  async getStats() {
    if (!this.isConnected) return null;

    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');
      
      return {
        memory: info,
        keyspace: keyspace,
        connected: this.isConnected
      };
    } catch (error) {
      console.error('Redis stats error:', error.message);
      return null;
    }
  }
}

// Create and export singleton instance
const cacheManager = new CacheManager();

module.exports = cacheManager;