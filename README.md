# To-Do List App

A modern, responsive To-Do List application built with **Vanilla JavaScript**, **HTML**, and **CSS**. It features persistent data storage using **LocalStorage** and synchronizes with a **Google Sheets** backend via Google Apps Script.

## ✨ Features

- **Create Tasks:** Easily add new tasks to your list.
- **Manage Status:** Mark tasks as active or completed.
- **Edit Tasks:** Double-click on any task to edit its content inline.
- **Delete Tasks:** Remove tasks individually or clear all completed tasks at once.
- **Filtering:** View All, Active, or Completed tasks.
- **Data Persistence:** Tasks are saved locally and synced to the cloud (Google Sheets).
- **Responsive Design:** Works seamlessly on desktop and mobile devices.

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, etc.).
- Internet connection (for Google Sheets sync).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/rapoii/To-Do-List-App.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd To-Do-List-App
    ```
3.  **Open the App:**
    Simply open the `index.html` file in your browser.
    
    *Optional: You can use a local development server like Live Server for VS Code.*

## ⚙️ Configuration

The application is pre-configured to use a specific Google Apps Script deployment for backend storage.

If you wish to use your own Google Sheet:
1.  Open `js/api.js`.
2.  Update the `API_CONFIG.URL` with your own Web App URL.
3.  See [DOCUMENTATION.md](DOCUMENTATION.md) for details on setting up the backend.

## 🛠️ Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Google Apps Script (Serverless), Google Sheets (Database)
- **Deployment:** GitHub Pages (Recommended)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
