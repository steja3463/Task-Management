// src/components/tasks/TaskList.js
import React, { useContext, useEffect, useState } from 'react';
import TaskItem from './TaskItem';
import { TaskContext } from '../../context/TaskContext';

const TaskList = () => {
  const taskContext = useContext(TaskContext);
  const { tasks, getTasks, loading } = taskContext;
  
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  
  useEffect(() => {
    getTasks();
    // eslint-disable-next-line
  }, []);
  
  if (tasks.length === 0 && !loading) {
    return (
      <div className="text-center mt-4">
        <h4>No tasks found</h4>
        <p>Add a task to get started!</p>
      </div>
    );
  }
  
  // Filter tasks
  const filterTasks = () => {
    switch (filter) {
      case 'pending':
        return tasks.filter(task => task.status === 'pending');
      case 'in-progress':
        return tasks.filter(task => task.status === 'in-progress');
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
      default:
        return tasks;
    }
  };
  
  // Sort tasks
  const sortTasks = (taskList) => {
    switch (sortBy) {
      case 'title':
        return [...taskList].sort((a, b) => a.title.localeCompare(b.title));
      case 'status':
        return [...taskList].sort((a, b) => a.status.localeCompare(b.status));
      case 'dueDate':
        return [...taskList].sort((a, b) => {
          // Handle tasks without due dates
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
      default:
        return taskList;
    }
  };
  
  const filteredAndSortedTasks = sortTasks(filterTasks());
  
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Your Tasks</h3>
        <div className="d-flex">
          <div className="me-2">
            <select
              className="form-select form-select-sm"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <select
              className="form-select form-select-sm"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="title">Sort by Title</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {filteredAndSortedTasks.map(task => (
            <TaskItem key={task._id} task={task} />
          ))}
        </>
      )}
    </>
  );
};

export default TaskList;