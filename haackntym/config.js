module.exports = {
    mongodb: {
        uri: '***Key***',
        options: {
            retryWrites: true,
            w: 'majority'
        }
    },
    llama: {
        apiKey: '***Key***',
        models: {
            chat: 'llama-13b',
            completion: 'llama-7b'
        }
    },
    analytics: {
        id: 'G-Id***',
        region: 'asia-south1'
    },
    storage: {
        bucket: 'marketplace-products',
        region: 'us-east-1'
    }
};
