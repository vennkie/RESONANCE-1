const express = require('express');
const router = express.Router();
const { RateLimiter } = require('../utils/security');
const { RequestValidator } = require('../utils/validation');
const { CacheManager } = require('../utils/cache');

const rateLimiter = new RateLimiter({ maxRequests: 100, windowMs: 900000 });
const cache = new CacheManager({ ttl: 300 });

router.get('/metrics', rateLimiter.check, async (req, res) => {
    try {
        const cacheKey = `metrics_${req.query.timeframe}`;
        const cachedData = await cache.get(cacheKey);
        
        if (cachedData) {   
            return res.json(cachedData);
        }

        const metrics = await generateMetrics(req.query);
        await cache.set(cacheKey, metrics);
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: 'Metrics generation failed' });
    }
});

class RateLimiter {
    constructor({ maxRequests, windowMs }) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();  // Stores request counts per user/IP
    }

    check(req, res, next) {
        const ip = req.ip;
        const currentTime = Date.now();
        
        if (!this.requests.has(ip)) {
            this.requests.set(ip, []);
        }

        const timestamps = this.requests.get(ip);
        const windowStart = currentTime - this.windowMs;
        const validRequests = timestamps.filter(timestamp => timestamp > windowStart);

        if (validRequests.length >= this.maxRequests) {
            return res.status(429).json({ error: 'Too many requests' });
        }

        validRequests.push(currentTime);
        this.requests.set(ip, validRequests);

        next();
    }
}

class CacheManager {
    constructor({ ttl }) {
        this.ttl = ttl * 1000;  // Convert to milliseconds
        this.cache = new Map();
    }

    async get(key) {
        const cachedData = this.cache.get(key);
        if (!cachedData) return null;

        // If the cached data has expired, remove it
        if (Date.now() - cachedData.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        return cachedData.value;
    }

    async set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }
}


module.exports = router;
