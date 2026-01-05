/**
 * Utility functions for To-Do List App
 */

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Format date to Indonesian format (e.g., "Minggu, 5 Januari 2025")
function formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// Escape HTML to prevent XSS (if inserting simple text manually)
// Note: We'll mostly use textContent for safety, but good to have.
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
