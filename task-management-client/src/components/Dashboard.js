// src/components/Dashboard.js
import React, { useContext } from 'react';
import TaskForm from './tasks/TaskForm';
import TaskList from './tasks/TaskList';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="row">
      <div className="col-md-4">
        <TaskForm />
      </div>
      <div className="col-md-8">
        <TaskList />
      </div>
    </div>
  );
};

export default Dashboard;