import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Tasks from './components/Tasks';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="container mx-auto p-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="mb-4 p-2 bg-blue-500 text-white rounded"
          >
            {darkMode ? 'Jasny tryb' : 'Ciemny tryb'}
          </button>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Tasks />} />
            </Routes>
          </Router>
        </div>
      </div>
    </div>
  );
};

export default App;