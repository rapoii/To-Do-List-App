/**
 * API Wrapper for Google Sheets Backend
 */

const API_CONFIG = {
    URL: 'https://script.google.com/macros/s/AKfycbzu8wwwINiStWdRRqF4AmywazKV8qRv4tZMQO_zC4rNToKc9wkT77geguWV3aP0lbaSxQ/exec'
};

const API = {
    // Generic fetch wrapper
    async request(data = null) {
        const options = {
            method: 'POST', // Google Apps Script Web App mostly allows POST for complex data or GET for simple retrieval
            // For simple GET we usually just hit the URL, but if we want to send body we need POST
            // The provided backend code handles GET (doGet) and POST (doPost)
        };

        let url = API_CONFIG.URL;

        // If data is provided, it's a POST request (Create, Update, Delete)
        if (data) {
            options.body = JSON.stringify(data);
            // 'no-cors' needed? 
            // Ideally we want to read response. Apps Script requires specific headers or simple text output. 
            // The backend logic provided uses ContentService.createTextOutput(JSON.stringify(data)).setMimeType(JSON)
            // This usually supports CORS if deployed correctly as 'Anyone'.
            // We will try standard fetch first.
            options.headers = {
                'Content-Type': 'text/plain;charset=utf-8', // Apps Script sometimes fussy with application/json
            };
        } else {
            // It's a GET request
            options.method = 'GET';
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    },

    // 1. GET ALL
    async fetchTodos() {
        return this.request(); // GET
    },

    // 2. CREATE
    async createTodo(todo) {
        return this.request({
            action: 'create',
            ...todo
        });
    },

    // 3. UPDATE
    async updateTodo(id, updates) {
        return this.request({
            action: 'update',
            id: id,
            ...updates
        });
    },

    // 4. DELETE
    async deleteTodo(id) {
        return this.request({
            action: 'delete',
            id: id
        });
    },

    // 5. DELETE MULTIPLE
    async deleteMultipleTodos(ids) {
        return this.request({
            action: 'deleteMultiple',
            ids: ids
        });
    }
};

// UI Helpers for API
const UIManager = {
    loadingOverlay: document.getElementById('loadingOverlay'),

    showLoading(show = true) {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = show ? 'flex' : 'none';
        } else {
            // Try to find it again in case it was added later
            this.loadingOverlay = document.getElementById('loadingOverlay');
            if (this.loadingOverlay) {
                this.loadingOverlay.style.display = show ? 'flex' : 'none';
            }
        }
    }
};
