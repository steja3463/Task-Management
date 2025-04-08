// src/components/tasks/TaskForm.js
import React, { useState, useContext, useEffect } from 'react';
import { TaskContext } from '../../context/TaskContext';

const TaskForm = () => {
  const taskContext = useContext(TaskContext);
  const { addTask, updateTask, currentTask, clearCurrent, error } = taskContext;

  const [task, setTask] = useState({
    title: '',
    description: '',
    status: 'pending',
    dueDate: ''
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (currentTask !== null) {
      setTask({
        ...currentTask,
        dueDate: currentTask.dueDate ? new Date(currentTask.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      setTask({
        title: '',
        description: '',
        status: 'pending',
        dueDate: ''
      });
    }

    if (error) {
      setFormError(error);
    }
  }, [currentTask, error]);

  const { title, description, status, dueDate } = task;

  const onChange = e => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const onSubmit = e => {
    e.preventDefault();
    setFormError('');

    if (title === '') {
      setFormError('Please enter a title');
      return;
    }

    if (currentTask === null) {
      addTask(task);
    } else {
      updateTask(currentTask._id, task);
    }

    clearAll();
  };

  const clearAll = () => {
    clearCurrent();
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h3 className="card-title text-center">
          {currentTask ? 'Edit Task' : 'Add Task'}
        </h3>
        
        {formError && (
          <div className="alert alert-danger" role="alert">
            {formError}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              placeholder="Task Title"
              value={title}
              onChange={onChange}
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              placeholder="Task Description"
              value={description || ''}
              onChange={onChange}
              rows="3"
            ></textarea>
          </div>
          
          <div className="mb-3">
            <label htmlFor="status" className="form-label">Status</label>
            <select
              className="form-select"
              id="status"
              name="status"
              value={status}
              onChange={onChange}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="dueDate" className="form-label">Due Date</label>
            <input
              type="date"
              className="form-control"
              id="dueDate"
              name="dueDate"
              value={dueDate || ''}
              onChange={onChange}
            />
          </div>
          
          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary">
              {currentTask ? 'Update Task' : 'Add Task'}
            </button>
            
            {currentTask && (
              <button
                type="button"
                className="btn btn-light"
                onClick={clearAll}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;