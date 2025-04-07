class ChatController {
    constructor() {
        this.chatHistory = [];
        this.messageQueue = [];
        this.init();
    }

    init() {
        this.form = document.getElementById('chatForm');
        this.input = document.getElementById('query');
        this.responseDiv = document.getElementById('chatResponse');
        this.bindEvents();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        const query = this.input.value.trim();
        if (!query) return;

        try {
            this.setLoading(true);
            const response = await this.sendMessage(query);
            this.updateChat(query, response);
            this.input.value = '';
        } catch (error) {
            this.handleError(error);
        } finally {
            this.setLoading(false);
        }
    }

    async sendMessage(query) {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, context: this.chatHistory })
        });

        if (!response.ok) throw new Error('API request failed');
        return response.json();
    }

    updateChat(query, response) {
        const messageHtml = `
            <div class="message user">${query}</div>
            <div class="message ai">${response.response}</div>
        `;
        this.responseDiv.insertAdjacentHTML('beforeend', messageHtml);
        this.chatHistory.push({ query, response: response.response });
    }

    setLoading(isLoading) {
        this.form.querySelector('button').disabled = isLoading;
        if (isLoading) {
            this.responseDiv.insertAdjacentHTML('beforeend', '<div class="loading">Processing...</div>');
        } else {
            const loading = this.responseDiv.querySelector('.loading');
            if (loading) loading.remove();
        }
    }

    handleError(error) {
        console.error('Chat error:', error);
        this.responseDiv.insertAdjacentHTML('beforeend', 
            '<div class="error">Failed to get response. Please try again.</div>'
        );
    }
}

// Initialize chat
new ChatController();
