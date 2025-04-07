class DashboardController {
    constructor() {
        this.metrics = {
            revenue: null,
            user: null
        };
        this.init();
    }

    async init() {
        this.initCharts();
        await this.fetchMetrics();
        this.setupRealTimeUpdates();
    }

    initCharts() {
        this.metrics.revenue = new Chart(document.getElementById('revenueChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Revenue',
                    data: [],
                    borderColor: '#4a90e2'
                }]
            }
        });

        this.metrics.user = new Chart(document.getElementById('userChart'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Users',
                    data: [],
                    backgroundColor: '#2ecc71'
                }]
            }
        });
    }

    async fetchMetrics() {
        try {
            const response = await fetch('/api/dashboard/metrics');
            const data = await response.json();
            this.updateCharts(data);
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
        }
    }

    updateCharts(data) {
        // Update revenue chart
        const revenueData = this.metrics.revenue.data.datasets[0].data;
        revenueData.push(data.totalRevenue);
        if (revenueData.length > 10) revenueData.shift();
        this.metrics.revenue.update();

        // Update user chart
        const userData = this.metrics.user.data.datasets[0].data;
        userData.push(data.totalOrders);
        if (userData.length > 10) userData.shift();
        this.metrics.user.update();
    }

    setupRealTimeUpdates() {
        setInterval(() => this.fetchMetrics(), 30000);
    }
}

// Initialize dashboard
new DashboardController();
