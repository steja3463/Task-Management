// Base URL for API requests
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements - Auth
const authSection = document.getElementById('auth-section');
const tabBtns = document.querySelectorAll('.tab-btn');
const loginForm = document.getElementById('login-form-element');
const registerForm = document.getElementById('register-form-element');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

// DOM Elements - Task Section
const taskSection = document.getElementById('task-section');
const userNameEl = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const taskForm = document.getElementById('task-form');
const taskIdInput = document.getElementById('task-id');
const taskTitleInput = document.getElementById('task-title');
const taskDescriptionInput = document.getElementById('task-description');
const taskStatusInput = document.getElementById('task-status');
const taskDueDateInput = document.getElementById('task-due-date');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.getElementById('cancel-btn');
const tasksList = document.getElementById('tasks-list');
const statusFilter = document.getElementById('status-filter');

// Auth state
let currentUser = null;
let authToken = localStorage.getItem('token');

// Event Listeners
document.addEventListener('DOMContentLoaded', init);

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.form-container').forEach(f => f.classList.remove('active'));
        
        // Add active class to clicked tab
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
    });
});

// Login Form
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        authToken = data.token;
        currentUser = data.user;
        
        // Show task section
        showTaskSection();
        
        // Clear form
        loginForm.reset();
        loginError.textContent = '';
    } catch (error) {
        loginError.textContent = error.message;
    }
});

// Register Form
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        authToken = data.token;
        currentUser = data.user;
        
        // Show task section
        showTaskSection();
        
        // Clear form
        registerForm.reset();
        registerError.textContent = '';
    } catch (error) {
        registerError.textContent = error.message;
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authToken = null;
    currentUser = null;
    
    // Show auth section
    authSection.classList.remove('hidden');
    taskSection.classList.add('hidden');
});

// Task Form
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const taskId = taskIdInput.value;
    const taskData = {
        title: taskTitleInput.value,
        description: taskDescriptionInput.value,
        status: taskStatusInput.value,
        dueDate: taskDueDateInput.value || null
    };
    
    try {
        let response;
        
        if (taskId) {
            // Update existing task
            response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(taskData)
            });
        } else {
            // Create new task
            response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(taskData)
            });
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to save task');
        }
        
        // Reset form
        resetTaskForm();
        
        // Refresh task list
        fetchTasks();
    } catch (error) {
        alert(error.message);
    }
});

// Cancel button
cancelBtn.addEventListener('click', resetTaskForm);

// Status filter
statusFilter.addEventListener('change', () => {
    filterTasks(statusFilter.value);
});

// Helper Functions
async function init() {
    // Check if user is already logged in
    if (authToken) {
        try {
            currentUser = JSON.parse(localStorage.getItem('user'));
            showTaskSection();
            fetchTasks();
        } catch (error) {
            // Token might be invalid, clear and show login
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
    userNameEl.textContent = `Welcome, ${currentUser.name}!`;
    fetchTasks();
}

function resetTaskForm() {
    taskForm.reset();
    taskIdInput.value = '';
    formTitle.textContent = 'Create New Task';
    cancelBtn.classList.add('hidden');
}

async function fetchTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        alert(error.message);
    }
}

function renderTasks(tasks) {
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p class="no-tasks">No tasks found. Create a new task to get started!</p>';
        return;
    }
    
    const currentFilter = statusFilter.value;
    
    tasks.forEach(task => {
        // Apply filter
        if (currentFilter !== 'all' && task.status !== currentFilter) {
            return;
        }
        
        const taskEl = document.createElement('div');
        taskEl.className = 'task-item';
        
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
        
        taskEl.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-actions">
                    <button class="action-btn edit-btn" data-id="${task._id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${task._id}">Delete</button>
                </div>
            </div>
            <div class="task-content">
                ${task.description || 'No description provided'}
            </div>
            <div class="task-meta">
                <span class="task-status status-${task.status}">${task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
                <span class="task-due-date">Due: ${dueDate}</span>
            </div>
        `;
        
        tasksList.appendChild(taskEl);
    });
    
    // Add event listeners to edit and delete buttons
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
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch task details');
        }
        
        const task = await response.json();
        
        // Populate form
        taskIdInput.value = task._id;
        taskTitleInput.value = task.title;
        taskDescriptionInput.value = task.description || '';
        taskStatusInput.value = task.status;
        
        if (task.dueDate) {
            // Format date as YYYY-MM-DD for input
            const date = new Date(task.dueDate);
            const formattedDate = date.toISOString().split('T')[0];
            taskDueDateInput.value = formattedDate;
        } else {
            taskDueDateInput.value = '';
        }
        
        // Update form title and show cancel button
        formTitle.textContent = 'Edit Task';
        cancelBtn.classList.remove('hidden');
        
        // Scroll to form
        taskForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert(error.message);
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete task');
        }
        
        // Refresh task list
        fetchTasks();
    } catch (error) {
        alert(error.message);
    }
}

function filterTasks(status) {
    fetchTasks();
}