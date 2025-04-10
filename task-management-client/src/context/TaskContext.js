// src/context/TaskContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import setAuthToken from '../utils/setAuthToken';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isAuthenticated } = useContext(AuthContext);

  // Ensure auth token is set before each request
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    }
  }, []);

  // Load tasks when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Get all tasks
  const getTasks = async () => {
    try {
      setLoading(true);
      // Ensure token is set before request
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
      }
      
      const res = await axios.get('http://localhost:5000/api/tasks');
      setTasks(res.data);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching tasks');
      setLoading(false);
    }
  };

  // Add task
  const addTask = async (task) => {
    try {
      // Ensure token is set before request
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
      }
      
      const res = await axios.post('http://localhost:5000/api/tasks', task);
      setTasks([res.data.task, ...tasks]);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding task');
      throw err;
    }
  };

  // Update task
  const updateTask = async (taskId, updatedTask) => {
    try {
      // Ensure token is set before request
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
      }
      
      const res = await axios.put(`http://localhost:5000/api/tasks/${taskId}`, updatedTask);
      
      setTasks(
        tasks.map(task => 
          task._id === taskId ? res.data.task : task
        )
      );
      
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating task');
      throw err;
    }
  };

  // Delete task
  // Delete task - improved error handling
const deleteTask = async (taskId) => {
  try {
    // Ensure token is set before request
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    }
    
    console.log('Attempting to delete task with ID:', taskId);
    
    // Add debugging info to see what's being sent
    const res = await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
    console.log('Delete response:', res.data);
    
    setTasks(tasks.filter(task => task._id !== taskId));
    setError(null);
  } catch (err) {
    console.error('Delete error details:', err.response?.data || err.message);
    setError(err.response?.data?.message || `Error deleting task: ${err.message}`);
    // Don't throw the error so the UI doesn't crash
  }
};

  // Clear current task
  const clearCurrent = () => {
    setCurrentTask(null);
  };

  // Set current task for editing
  const setCurrent = (task) => {
    setCurrentTask(task);
  };

  // Clear errors
  const clearErrors = () => {
    setError(null);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        currentTask,
        loading,
        error,
        getTasks,
        addTask,
        updateTask,
        deleteTask,
        clearCurrent,
        setCurrent,
        clearErrors
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};