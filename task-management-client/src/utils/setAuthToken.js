// src/utils/setAuthToken.js
import axios from 'axios';

const setAuthToken = token => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Token set in headers:', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    console.log('Token removed from headers');
  }
};

export default setAuthToken;