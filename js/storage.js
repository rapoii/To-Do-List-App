/**
 * Storage management for To-Do List App
 */

const STORAGE_KEY = 'myday_todos_v1';

const Storage = {
    // Save todos to local storage
    save(todos) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        } catch (error) {
            console.error("Error saving to localStorage:", error);
            alert("Gagal menyimpan data. Pastikan memori browser tidak penuh.");
        }
    },

    // Load todos from local storage
    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error loading from localStorage:", error);
            return [];
        }
    },

    // Clear all todos from local storage
    clear() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error("Error clearing localStorage:", error);
        }
    },

    // --- Cloud Sync Methods ---

    async fetchFromCloud() {
        try {
            const data = await API.fetchTodos();
            console.log('Fetched from cloud:', data);
            return data;
        } catch (error) {
            console.error('Failed to fetch from cloud:', error);
            throw error;
        }
    },

    async createInCloud(todo) {
        try {
            await API.createTodo(todo);
            console.log('Created in cloud:', todo.id);
        } catch (error) {
            console.error('Failed to create in cloud:', error);
            // Optional: Store in 'pending_sync' queue if offline
        }
    },

    async updateInCloud(id, updates) {
        try {
            await API.updateTodo(id, updates);
            console.log('Updated in cloud:', id);
        } catch (error) {
            console.error('Failed to update in cloud:', error);
        }
    },

    async deleteInCloud(id) {
        try {
            await API.deleteTodo(id);
            console.log('Deleted in cloud:', id);
        } catch (error) {
            console.error('Failed to delete in cloud:', error);
        }
    },

    async deleteMultipleInCloud(ids) {
        try {
            await API.deleteMultipleTodos(ids);
            console.log('Deleted multiple in cloud:', ids.length);
        } catch (error) {
            console.error('Failed to delete multiple in cloud:', error);
        }
    }
};
