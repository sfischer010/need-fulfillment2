import React, { useState } from 'react';
import Home from './Home';
import NeedsMap from './NeedsMap';
import Register from './Register';
import './tailwind.css';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'NeedsMap':
        return <NeedsMap />;
        case 'Register':
          return <Register />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="App">
      <nav>
      <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#2f3d51" />
        <text x="50%" y="40%" class="text text-top">Need</text>
        <text x="50%" y="70%" class="text text-bottom">Fulfillment</text>
      </svg>
        <ul>
          <li onClick={() => setCurrentPage('home')}>Home</li>
          <li onClick={() => setCurrentPage('NeedsMap')}>Needs Map</li>
          <li onClick={() => setCurrentPage('Register')}>Register</li>
          <li onClick={() => setCurrentPage('Login')}>Login</li>
        </ul>
      </nav>
      {renderPage()}
    </div>
  );
}

export default App;
