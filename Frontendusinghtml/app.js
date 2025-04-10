// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const authSection = document.getElementById('auth-section');
const taskSection = document.getElementById('task-section');
const tabBtns = document.querySelectorAll('.tab-btn');
const loginForm = document.getElementById('login-form-element');
const registerForm = document.getElementById('register-form-element');
const userNameEl = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const taskForm = document.getElementById('task-form');
const taskIdInput = document.getElementById('task-id');
const cancelBtn = document.getElementById('cancel-btn');
const tasksList = document.getElementById('tasks-list');
const statusFilter = document.getElementById('status-filter');

// Auth state
let currentUser = null;
let authToken = localStorage.getItem('token');

// Initialize App
document.addEventListener('DOMContentLoaded', init);

// Event Listeners Setup
function setupEventListeners() {
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.form-container').forEach(f => f.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    // Auth forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);

    // Task management
    taskForm.addEventListener('submit', handleTaskSubmit);
    cancelBtn.addEventListener('click', resetTaskForm);
    statusFilter.addEventListener('change', () => fetchTasks());
}

// Authentication Handlers
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message || 'Login failed');
        
        storeAuthData(data);
        showTaskSection();
        loginForm.reset();
        document.getElementById('login-error').textContent = '';
    } catch (error) {
        document.getElementById('login-error').textContent = error.message;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message || 'Registration failed');
        
        storeAuthData(data);
        showTaskSection();
        registerForm.reset();
        document.getElementById('register-error').textContent = '';
    } catch (error) {
        document.getElementById('register-error').textContent = error.message;
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authToken = null;
    currentUser = null;
    authSection.classList.remove('hidden');
    taskSection.classList.add('hidden');
}

// Task Management Functions
async function handleTaskSubmit(e) {
    e.preventDefault();
    
    const taskId = taskIdInput.value;
    const taskData = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        status: document.getElementById('task-status').value,
        dueDate: document.getElementById('task-due-date').value || null
    };
    
    try {
        const url = taskId ? 
            `${API_BASE_URL}/tasks/${taskId}` : 
            `${API_BASE_URL}/tasks`;
        
        const method = taskId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(taskData)
        });
        
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message || 'Failed to save task');
        
        resetTaskForm();
        fetchTasks();
    } catch (error) {
        alert(error.message);
    }
}

async function fetchTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch tasks');
        
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        alert(error.message);
    }
}

function renderTasks(tasks) {
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksList.classList.add('empty');
        return;
    }
    
    tasksList.classList.remove('empty');
    const currentFilter = statusFilter.value;
    
    tasks
        .filter(task => currentFilter === 'all' || task.status === currentFilter)
        .forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';
            taskEl.setAttribute('data-status', task.status);
            
            const dueDate = task.dueDate ? 
                new Date(task.dueDate).toLocaleDateString() : 
                'No due date';
            
            taskEl.innerHTML = `
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    <div class="task-actions">
                        <button class="action-btn edit-btn" data-id="${task._id}">Edit</button>
                        <button class="action-btn delete-btn" data-id="${task._id}">Delete</button>
                    </div>
                </div>
                <div class="task-content">${task.description || 'No description'}</div>
                <div class="task-meta">
                    <span class="task-status status-${task.status}">${capitalizeFirstLetter(task.status)}</span>
                    <span class="task-due-date">Due: ${dueDate}</span>
                </div>
            `;
            
            tasksList.appendChild(taskEl);
        });
    
    // Add event listeners to buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editTask(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteTask(btn.dataset.id));
    });
}

async function editTask(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch task details');
        
        const task = await response.json();
        
        // Populate form
        taskIdInput.value = task._id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-status').value = task.status;
        
        if (task.dueDate) {
            const date = new Date(task.dueDate);
            document.getElementById('task-due-date').value = date.toISOString().split('T')[0];
        } else {
            document.getElementById('task-due-date').value = '';
        }
        
        cancelBtn.classList.remove('hidden');
    } catch (error) {
        alert(error.message);
    }
}

async function deleteTask(taskId) {
    if (!confirm('Delete this task?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete task');
        }
        
        fetchTasks();
    } catch (error) {
        alert(error.message);
    }
}

// Helper Functions
function init() {
    setupEventListeners();
    
    if (authToken) {
        try {
            currentUser = JSON.parse(localStorage.getItem('user'));
            showTaskSection();
            fetchTasks();
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            authToken = null;
            currentUser = null;
        }
    }
}

function showTaskSection() {
    authSection.classList.add('hidden');
    taskSection.classList.remove('hidden');
    userNameEl.textContent = currentUser.name;
    fetchTasks();
}

function resetTaskForm() {
    taskForm.reset();
    taskIdInput.value = '';
    cancelBtn.classList.add('hidden');
}

function storeAuthData(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    authToken = data.token;
    currentUser = data.user;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}