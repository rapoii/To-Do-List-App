# Technical Documentation

This document provides a technical overview of the To-Do List application, including its file structure, state management, and backend integration.

## 📂 Project Structure

```
/
├── index.html        # Main HTML entry point
├── css/
│   └── style.css     # Application styles
├── js/
│   ├── app.js        # Main application logic (events, rendering)
│   ├── api.js        # API wrapper for Google Apps Script
│   └── storage.js    # LocalStorage and Cloud sync orchestration
└── README.md         # General project information
```

## 🧠 State Management

The application uses a centralized state object in `js/app.js`:

```javascript
let state = {
    todos: [],          // Array of todo objects
    filter: 'all'       // Current view filter: 'all' | 'active' | 'completed'
};
```

### Data Flow
1.  **Initialization:** Loads data from `LocalStorage` (`Storage.load()`).
2.  **User Action:** User adds/edits/deletes a todo.
3.  **State Update:** The `state` object is updated.
4.  **Render:** The UI is re-rendered based on the new state (`render()`).
5.  **Persistence:**
    -   **Local:** Data is immediately saved to LocalStorage.
    -   **Cloud:** An asynchronous request is sent to the Google Apps Script API to sync changes (Optimistic UI pattern).

## 🔌 API Integration (Google Apps Script)

The backend is built using Google Apps Script, acting as a middleware between the frontend and a Google Sheet.

### Configuration (`js/api.js`)
The API URL is defined in the configuration object:

```javascript
const API_CONFIG = {
    URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
};
```

### Endpoints
The API accepts `POST` requests with a JSON body containing an `action` parameter.

| Action | Parameters | Description |
| :--- | :--- | :--- |
| `create` | `text`, `isCompleted`, `id`, `createdAt` | Create a new todo row in the sheet. |
| `update` | `id`, ...updates | Update an existing todo by ID. |
| `delete` | `id` | Delete a todo row by ID. |
| `deleteMultiple` | `ids` (Array) | Delete multiple rows by their IDs. |
| *GET* | *None* | Fetch all todos (returns JSON array). |

## 🧪 Key Functions

### `js/app.js`
-   `init()`: Bootstraps the application.
-   `render()`: Handles DOM updates based on current state and filter.
-   `handle*()`: Event handlers for user interactions.

### `js/api.js`
-   `API.request(data)`: Generic fetch wrapper handling `POST` vs `GET` logic.
-   `API.fetchTodos()`: Retrieves all data.
-   `API.createTodo()`, `API.updateTodo()`, `API.deleteTodo()`: CRUD references.
