// manager/src/index.js - full code
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';  // If you have styles

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);