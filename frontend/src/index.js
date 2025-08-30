import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';       // import your App component
import './index.css';          // optional, can be empty

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />                    {/* render your App instead of <h1> */}
  </React.StrictMode>
);
