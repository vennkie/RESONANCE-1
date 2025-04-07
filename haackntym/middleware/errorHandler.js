const { Logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    Logger.error(`Error: ${err.message}`);
    console.error(err.stack);

    if (err.type === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;
