/**
 * Main Application Logic
 */

// --- State Management ---
let state = {
    todos: [],
    filter: 'all' // 'all' | 'active' | 'completed'
};

// --- DOM Elements ---
const dom = {
    form: document.getElementById('todoForm'),
    input: document.getElementById('todoInput'),
    list: document.getElementById('todoList'),
    emptyState: document.getElementById('emptyState'),
    itemsCount: document.getElementById('itemsCount'),
    clearBtn: document.getElementById('clearCompletedBtn'),
    currentDate: document.getElementById('currentDate'),
    filterBtns: document.querySelectorAll('.filter-btn')
};

// --- Initialization ---
function init() {
    // Load saved data
    state.todos = Storage.load();

    // Set current date
    dom.currentDate.textContent = formatDate(new Date());

    // Initial render
    render();

    // Event Listeners
    setupEventListeners();

    // Sync with cloud (Optimistic: Load local first, then background sync)
    syncFromCloud();
}

async function syncFromCloud() {
    UIManager.showLoading(true);
    try {
        const cloudTodos = await Storage.fetchFromCloud();
        // Merge strategy: Overwrite local with cloud for simplicity in V1
        // Or better: keep local if newer? For now, Cloud is truth.
        state.todos = cloudTodos;
        Storage.save(state.todos);
        render();
    } catch (error) {
        console.error('Initial sync failed:', error);
        // Keep using local data
    } finally {
        UIManager.showLoading(false);
    }
}

// --- Event Listeners ---
function setupEventListeners() {
    // Add Todo
    dom.form.addEventListener('submit', handleAddTodo);

    // List interactions (Delete, Toggle, Edit) - Event Delegation
    dom.list.addEventListener('click', handleListClick);
    dom.list.addEventListener('dblclick', handleListDoubleClick);
    dom.list.addEventListener('focusout', handleEditFocusOut, true); // Capture phase for focusout
    dom.list.addEventListener('keydown', handleEditKeydown);

    // Filters
    dom.filterBtns.forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });

    // Clear Completed
    dom.clearBtn.addEventListener('click', handleClearCompleted);
}

// --- Handlers ---

function handleAddTodo(e) {
    e.preventDefault();
    const text = dom.input.value.trim();

    if (!text) {
        // Optional: Add shake animation or visual cue for empty input
        dom.input.focus();
        return;
    }

    const newTodo = {
        id: generateId(),
        text: text,
        isCompleted: false,
        createdAt: new Date().toISOString()
    };

    state.todos.unshift(newTodo); // Add to top
    saveAndRender();

    // Optimistic: Sync to cloud in background
    Storage.createInCloud(newTodo).catch(err => console.error(err));

    dom.input.value = '';
    dom.input.focus();
}

function handleListClick(e) {
    const target = e.target;
    const item = target.closest('.task-item');
    if (!item) return;

    const id = item.dataset.id;

    // Delete Button
    if (target.closest('.delete-btn')) {
        deleteTodo(id);
        return;
    }

    // Checkbox toggle
    if (target.classList.contains('task-checkbox')) {
        toggleTodo(id);
    }
}

function handleListDoubleClick(e) {
    const target = e.target;
    // Only allow editing if clicking on task content and not already editing
    if (target.classList.contains('task-content') && !target.isContentEditable) {
        const item = target.closest('.task-item');
        const id = item.dataset.id;
        enableEditMode(item, id);
    }
}

function handleEditKeydown(e) {
    if (!e.target.classList.contains('edit-input')) return;

    if (e.key === 'Enter') {
        e.target.blur(); // Triggers focusout
    } else if (e.key === 'Escape') {
        // Cancel edit
        render(); // Re-render to reset state is easiest
    }
}

function handleEditFocusOut(e) {
    if (!e.target.classList.contains('edit-input')) return;

    const input = e.target;
    const item = input.closest('.task-item');
    const id = item.dataset.id;
    const newText = input.value.trim();

    if (newText) {
        updateTodoText(id, newText);
    } else {
        // If empty, maybe delete? Or just revert? Let's revert for safety or delete if user wants.
        // For now: delete if empty is a common pattern, otherwise revert.
        // Let's delete if empty logic:
        deleteTodo(id);
        // OR revert: render();
    }
}

function handleFilterClick(e) {
    const btn = e.target;
    const filterType = btn.dataset.filter;

    state.filter = filterType;

    // Update UI active state
    dom.filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    render();
}

function handleClearCompleted() {
    // 1. Identify items to delete
    const completedTodos = state.todos.filter(t => t.isCompleted);
    if (completedTodos.length === 0) return;

    const idsToDelete = completedTodos.map(t => t.id);

    // 2. Optimistic UI: Remove from local state immediately
    state.todos = state.todos.filter(todo => !todo.isCompleted);
    saveAndRender();

    // 3. Sync to Cloud
    Storage.deleteMultipleInCloud(idsToDelete).catch(err => console.error(err));
}

// --- Core Actions ---

function deleteTodo(id) {
    // Add exit animation logic here if needed, for now direct delete
    const item = document.querySelector(`.task-item[data-id="${id}"]`);

    // Helper to proceed with delete state
    const proceedDelete = () => {
        state.todos = state.todos.filter(t => t.id !== id);
        saveAndRender();
        // Optimistic: Sync delete
        Storage.deleteInCloud(id).catch(err => console.error(err));
    };

    if (item) {
        // Simple slide out visual
        item.style.transform = 'translateX(100px)';
        item.style.opacity = '0';
        setTimeout(proceedDelete, 300); // Wait for transition
    } else {
        proceedDelete();
    }
}

function toggleTodo(id) {
    const todo = state.todos.find(t => t.id === id);
    if (todo) {
        todo.isCompleted = !todo.isCompleted;
        saveAndRender();
        // Optimistic: Sync update
        Storage.updateInCloud(id, { isCompleted: todo.isCompleted }).catch(err => console.error(err));
    }
}

function updateTodoText(id, text) {
    const todo = state.todos.find(t => t.id === id);
    if (todo) {
        todo.text = text;
        saveAndRender();
        // Optimistic: Sync update
        Storage.updateInCloud(id, { text: todo.text }).catch(err => console.error(err));
    }
}

function enableEditMode(itemElement, id) {
    const todo = state.todos.find(t => t.id === id);
    if (!todo) return;

    const contentDiv = itemElement.querySelector('.task-content');

    // Create input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = todo.text;

    // Replace content
    contentDiv.innerHTML = '';
    contentDiv.appendChild(input);

    input.focus();
}

function saveAndRender() {
    Storage.save(state.todos);
    render();
}

// --- Render Logic ---

function render() {
    const { todos, filter } = state;

    // 1. Filter todos
    let filteredTodos = todos;
    if (filter === 'active') {
        filteredTodos = todos.filter(t => !t.isCompleted);
    } else if (filter === 'completed') {
        filteredTodos = todos.filter(t => t.isCompleted);
    }

    // 2. Render List
    dom.list.innerHTML = '';

    if (filteredTodos.length === 0) {
        dom.emptyState.style.display = 'block';
        if (todos.length > 0) {
            // If we have todos but filter returns none
            dom.emptyState.querySelector('p').textContent =
                filter === 'completed' ? "Belum ada tugas selesai." : "Tidak ada tugas aktif.";
        } else {
            dom.emptyState.querySelector('p').textContent = "Belum ada tugas. Yuk mulai produktif!";
        }
        dom.list.appendChild(dom.emptyState);
    } else {
        dom.emptyState.style.display = 'none';
        filteredTodos.forEach(todo => {
            const item = createTodoElement(todo);
            dom.list.appendChild(item);
        });
    }

    // 3. Update Counts
    const activeCount = todos.filter(t => !t.isCompleted).length;
    dom.itemsCount.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
}

function createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = `task-item ${todo.isCompleted ? 'completed' : ''}`;
    div.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = todo.isCompleted;

    const content = document.createElement('div');
    content.className = 'task-content';
    content.textContent = todo.text;
    content.title = "Double click to edit"; // Tooltip

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

    div.appendChild(checkbox);
    div.appendChild(content);
    div.appendChild(deleteBtn);

    return div;
}

// Start App
init();
