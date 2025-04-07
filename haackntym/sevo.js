// dashboardController.js
const { Order, Chat, Cart, User } = require('./models');
const mongoose = require('mongoose');

class DashboardController {
    constructor() {
        this.initialized = false;
    }

    async initialize() {
        try {
            await this.fetchOrders();
            await this.fetchChats();
            await this.fetchCartUpdates();
            await this.generateAnalytics();
            this.setupRealTimeUpdates();
            this.initialized = true;
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
        }
    }

    async fetchOrders() {
        try {
            const orders = await Order.find().populate('userId').exec();
            console.log('Orders:', orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    }

    async fetchChats() {
        try {
            const chats = await Chat.find().populate('userId').exec();
            console.log('Chats:', chats);
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    }

    async fetchCartUpdates() {
        try {
            const carts = await Cart.find().populate('userId').exec();
            console.log('Cart Updates:', carts);
        } catch (error) {
            console.error('Error fetching cart updates:', error);
        }
    }

    async generateAnalytics() {
        try {
            const totalRevenue = await this.calculateRevenue();
            console.log('Total Revenue:', totalRevenue);
            const userCount = await this.calculateUserMetrics();
            console.log('User Count:', userCount);
        } catch (error) {
            console.error('Error generating analytics:', error);
        }
    }

    async calculateRevenue() {
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

    async calculateUserMetrics() {
        try {
            const users = await User.find();
            return users.length;  // Simple user count
        } catch (error) {
            console.error('Error calculating user metrics:', error);
            return 0;
        }
    }

    async setupRealTimeUpdates() {
        // Set up real-time update interval for metrics
        setInterval(() => {
            this.fetchOrders();
            this.fetchChats();
            this.fetchCartUpdates();
            this.generateAnalytics();
        }, 30000);  // Fetch every 30 seconds
    }
}

const dashboardController = new DashboardController();
dashboardController.initialize();
