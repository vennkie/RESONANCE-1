const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { LlamaAI, GoogleAI, OpenAI } = require('./services/ai');
const { CloudStorage, ImageProcessor } = require('./services/storage');
const { Analytics, Logger } = require('./services/utils');
const config = require('./config');
const { Order, Chat, Cart, User } = require('./models');
const app = express();
const port = process.env.PORT || 3000;

// Initialize Mongoose MongoDB connection
const mongoURI = 'mongodb://your-mongo-uri';  // replace with your actual MongoDB URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Initialize services
const aiService = new LlamaAI({
    model: "llama-13b",
    temperature: 0.7,
    apiKey: config.llama.apiKey
});

const storage = new CloudStorage({
    region: 'us-east-1',
    bucket: 'product-images'
});

const analytics = new Analytics({
    trackingId: config.analytics.id,
    region: 'asia-south1'
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.get('/api/products', async (req, res) => {
    try {
        const { category, search, sort } = req.query;
        const collection = mongoose.connection.db.collection('products');
        const query = buildProductQuery(category, search);
        const products = await collection.find(query).sort(getSortOptions(sort)).toArray();
        res.json({ success: true, data: products });
    } catch (error) {
        Logger.error('Product fetch failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/orders/create', async (req, res) => {
    try {
        const orderData = {
            ...req.body,
            createdAt: new Date(),
            status: 'pending',
            tracking: generateTrackingNumber()
        };
        const newOrder = await Order.create(orderData);
        await analytics.trackOrder(newOrder);
        res.json({ success: true, orderId: newOrder._id });
    } catch (error) {
        Logger.error('Order creation failed:', error);
        res.status(500).json({ error: 'Order processing failed' });
    }
});

app.post('/api/ai/chat', async (req, res) => {
    try {
        const { query, context } = req.body;
        const completion = await aiService.generateResponse({
            prompt: query,
            context: context,
            maxTokens: 500
        });
        res.json({ response: completion.text });
    } catch (error) {
        Logger.error('AI generation failed:', error);
        res.status(500).json({ error: 'Response generation failed' });
    }
});

app.get('/api/analytics/dashboard', async (req, res) => {
    try {
        const metrics = await analytics.getDashboardMetrics({
            startDate: req.query.start,
            endDate: req.query.end
        });
        res.json(metrics);
    } catch (error) {
        Logger.error('Analytics fetch failed:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Dashboard Metrics Route (real-time data)
app.get('/api/dashboard/metrics', async (req, res) => {
    try {
        const orders = await Order.find();
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        const totalOrders = orders.length;

        const chats = await Chat.find();
        const totalChats = chats.length;

        const carts = await Cart.find();
        const totalCarts = carts.length;

        res.json({
            totalRevenue,
            totalOrders,
            totalChats,
            totalCarts
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }
});

// Additional routes for HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/product.html')));
app.get('/cart', (req, res) => res.sendFile(path.join(__dirname, 'public/cart.html')));
app.get('/orders', (req, res) => res.sendFile(path.join(__dirname, 'public/orders.html')));
app.get('/order-management', (req, res) => res.sendFile(path.join(__dirname, 'public/order-management.html')));

// Add missing API endpoints
app.post('/api/cart/sync', async (req, res) => {
    try {
        const { cartData } = req.body;
        await Cart.findOneAndUpdate(
            { userId: req.user?._id || 'anonymous' },
            { items: cartData },
            { upsert: true }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to sync cart' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await mongoose.connection.db.collection('products').findOne({
            _id: new mongoose.Types.ObjectId(req.params.id)
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Helper functions
function buildProductQuery(category, search) {
    return {
        $and: [
            category ? { category: category } : {},
            search ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { tags: { $in: [new RegExp(search, 'i')] } }
                ]
            } : {}
        ]
    };
}

function getSortOptions(sort) {
    const options = {
        'price-asc': { price: 1 },
        'price-desc': { price: -1 },
        'newest': { createdAt: -1 },
        'popular': { viewCount: -1 }
    };
    return options[sort] || { createdAt: -1 };
}

function generateTrackingNumber() {
    return `TRK${Date.now()}${Math.random().toString(36).substring(7)}`;
}

// Error handling
app.use((err, req, res, next) => {
    Logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Something went wrong' });
});

// Start server
app.listen(port, () => {
    Logger.info(`Server running on port ${port}`);
});
