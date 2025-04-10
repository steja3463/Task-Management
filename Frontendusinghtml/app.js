// Configuration & DOM elements
const API = 'http://localhost:5000/api';
const $ = id => document.getElementById(id);
const authToken = localStorage.getItem('token');
let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  if (authToken) initUserSession();
});

// Event Listeners
function setupEventListeners() {
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.target));
  });
  
  // Auth
  $('login-form-element').addEventListener('submit', e => handleAuth(e, 'login'));
  $('register-form-element').addEventListener('submit', e => handleAuth(e, 'register'));
  $('logout-btn').addEventListener('click', logout);
  
  // Tasks
  $('task-form').addEventListener('submit', saveTask);
  $('cancel-btn').addEventListener('click', () => {
    $('task-form').reset();
    $('task-id').value = '';
    $('cancel-btn').classList.add('hidden');
  });
  $('status-filter').addEventListener('change', fetchTasks);
}

// Authentication functions
async function handleAuth(e, type) {
  e.preventDefault();
  const formData = {};
  
  if (type === 'login') {
    formData.email = $('login-email').value;
    formData.password = $('login-password').value;
  } else {
    formData.name = $('register-name').value;
    formData.email = $('register-email').value;
    formData.password = $('register-password').value;
  }
  
  try {
    const res = await fetch(`${API}/auth/${type}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(formData)
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `${type} failed`);
    
    // Store auth data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    
    showTaskSection();
    $(`${type}-form-element`).reset();
    $(`${type}-error`).textContent = '';
  } catch (err) {
    $(`${type}-error`).textContent = err.message;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  $('auth-section').classList.remove('hidden');
  $('task-section').classList.add('hidden');
}

// Task management functions
async function saveTask(e) {
  e.preventDefault();
  const taskId = $('task-id').value;
  const task = {
    title: $('task-title').value,
    description: $('task-description').value,
    status: $('task-status').value,
    dueDate: $('task-due-date').value || null
  };
  
  try {
    const url = taskId ? `${API}/tasks/${taskId}` : `${API}/tasks`;
    const method = taskId ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(task)
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    
    $('task-form').reset();
    $('task-id').value = '';
    $('cancel-btn').classList.add('hidden');
    fetchTasks();
  } catch (err) {
    alert(err.message);
  }
}

async function fetchTasks() {
  try {
    const res = await fetch(`${API}/tasks`, {
      headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
    });
    
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    alert(err.message);
  }
}

function renderTasks(tasks) {
  const list = $('tasks-list');
  list.innerHTML = tasks.length ? '' : '<p style="text-align:center;color:#777;padding:1rem">No tasks yet</p>';
  
  const filter = $('status-filter').value;
  
  tasks
    .filter(task => filter === 'all' || task.status === filter)
    .forEach(task => {
      const el = document.createElement('div');
      el.className = 'task-item';
      el.setAttribute('data-status', task.status);
      
      el.innerHTML = `
        <div class="task-header">
          <div class="task-title">${task.title}</div>
          <div class="task-actions">
            <button class="action-btn edit-btn" data-id="${task._id}">Edit</button>
            <button class="action-btn delete-btn" data-id="${task._id}">Delete</button>
          </div>
        </div>
        <div>${task.description || 'No description'}</div>
        <div class="task-meta">
          <span class="task-status status-${task.status}">${task.status[0].toUpperCase() + task.status.slice(1)}</span>
          <span>Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}</span>
        </div>
      `;
      
      list.appendChild(el);
    });
  
  // Action buttons
  document.querySelectorAll('.edit-btn').forEach(btn => 
    btn.addEventListener('click', () => editTask(btn.dataset.id)));
  
  document.querySelectorAll('.delete-btn').forEach(btn => 
    btn.addEventListener('click', () => deleteTask(btn.dataset.id)));
}

async function editTask(id) {
  try {
    const res = await fetch(`${API}/tasks/${id}`, {
      headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
    });
    
    if (!res.ok) throw new Error('Failed to get task');
    const task = await res.json();
    
    $('task-id').value = task._id;
    $('task-title').value = task.title;
    $('task-description').value = task.description || '';
    $('task-status').value = task.status;
    
    if (task.dueDate) {
      $('task-due-date').value = new Date(task.dueDate).toISOString().split('T')[0];
    }
    
    $('cancel-btn').classList.remove('hidden');
  } catch (err) {
    alert(err.message);
  }
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  
  try {
    const res = await fetch(`${API}/tasks/${id}`, {
      method: 'DELETE',
      headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message);
    }
    
    fetchTasks();
  } catch (err) {
    alert(err.message);
  }
}

// Helper functions
function initUserSession() {
  try {
    currentUser = JSON.parse(localStorage.getItem('user'));
    showTaskSection();
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

function showTaskSection() {
  $('auth-section').classList.add('hidden');
  $('task-section').classList.remove('hidden');
  $('user-name').textContent = currentUser.name;
  fetchTasks();
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.form-container').forEach(f => f.classList.remove('active'));
  
  document.querySelector(`[data-target="${tabId}"]`).classList.add('active');
  $(tabId).classList.add('active');
}