const mongoose = require('mongoose');
const { Logger } = require('../utils/logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        Logger.info(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        Logger.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
