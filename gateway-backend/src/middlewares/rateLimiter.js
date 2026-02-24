const redis = require('redis');

let redisClient;

(async () => {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));

  try {
    await redisClient.connect();
    console.log('Redis connected for rate limiting');
  } catch (err) {
    console.error('Could not connect to Redis:', err.message);
  }
})();

module.exports = async (req, res, next) => {
  if (!redisClient || !redisClient.isReady) {
    return next(); // Skip if Redis is down
  }

  try {
    const userId = req.userAuth.user_id;
    const limit = 50; // requests per minute
    const windowInSeconds = 60;
    
    const count = await redisClient.incr(userId);
    if (count === 1) {
      await redisClient.expire(userId, windowInSeconds);
    }
    
    if (count > limit) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    next();
  } catch (err) {
    console.error('Rate limit error:', err);
    next(); // Fail open if Redis has an issue
  }
};
