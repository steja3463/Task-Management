// src/context/TaskContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isAuthenticated } = useContext(AuthContext);

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
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
      
      setTasks(tasks.filter(task => task._id !== taskId));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting task');
      throw err;
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