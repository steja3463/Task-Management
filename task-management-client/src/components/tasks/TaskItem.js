// src/components/tasks/TaskItem.js
import React, { useContext } from 'react';
import { TaskContext } from '../../context/TaskContext';

const TaskItem = ({ task }) => {
  const { deleteTask, setCurrent } = useContext(TaskContext);
  
  const { _id, title, description, status, dueDate } = task;
  
  // Get status badge color
  const getStatusBadgeClass = () => {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'in-progress':
        return 'bg-info';
      case 'completed':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };
  
  // Format date
  const formatDate = (date) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString();
  };
  
  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">{title}</h5>
          <span className={`badge ${getStatusBadgeClass()}`}>
            {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        
        {description && (
          <p className="card-text mt-2">{description}</p>
        )}
        
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">Due: {formatDate(dueDate)}</small>
          
          <div>
            <button
              className="btn btn-sm btn-outline-primary me-2"
              onClick={() => setCurrent(task)}
            >
              Edit
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => deleteTask(_id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;