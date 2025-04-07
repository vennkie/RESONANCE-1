// routes/dashboard.js
const express = require('express');
const { Order, Chat, Cart, User } = require('../models');
const router = express.Router();

// Route to get orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().populate('userId').exec();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Route to get chats
router.get('/chats', async (req, res) => {
    try {
        const chats = await Chat.find().populate('userId').exec();
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
});

// Route to get cart updates
router.get('/carts', async (req, res) => {
    try {
        const carts = await Cart.find().populate('userId').exec();
        res.json(carts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart updates' });
    }
});

// Route to get total revenue
router.get('/revenue', async (req, res) => {
    try {
        const totalRevenue = await calculateRevenue();
        res.json({ totalRevenue });
    } catch (error) {
        res.status(500).json({ error: 'Failed to calculate revenue' });
    }
});

module.exports = router;

// Helper function for revenue calculation
async function calculateRevenue() {
    try {
        const orders = await Order.find();
        let totalRevenue = 0;
        orders.forEach(order => {
            totalRevenue += order.totalAmount;
        });
        return totalRevenue;
    } catch (error) {
        console.error('Error calculating revenue:', error);
        return 0;
    }
}
