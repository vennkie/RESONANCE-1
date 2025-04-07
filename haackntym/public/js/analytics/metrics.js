class AnalyticsController {
    constructor() {
        this.cache = new Map();
        this.init();
    }

    async init() {
        await this.fetchAnalytics();
        this.setupAutoRefresh();
    }

    async fetchAnalytics() {
        try {
            const response = await fetch('/api/analytics/dashboard');
            const data = await response.json();
            this.updateMetrics(data);
        } catch (error) {
            console.error('Analytics fetch failed:', error);
        }
    }

    updateMetrics(data) {
        // Update DOM with analytics data
        Object.entries(data).forEach(([key, value]) => {
            const element = document.getElementById(`${key}Metric`);
            if (element) {
                element.textContent = this.formatMetric(key, value);
            }
        });
    }

    formatMetric(key, value) {
        switch(key) {
            case 'revenue':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(value);
            case 'conversion':
                return `${(value * 100).toFixed(2)}%`;
            default:
                return value.toLocaleString();
        }
    }

    setupAutoRefresh() {
        setInterval(() => this.fetchAnalytics(), 60000); // Refresh every minute
    }
}

// Initialize analytics
new AnalyticsController();
