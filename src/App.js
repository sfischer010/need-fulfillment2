/*
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import NeedsMap from './NeedsMap';
import Register from './Register';
import Login from './Login';
import PostNeed from './PostNeed';
import Messages from './Messages';
import SendMessage from './SendMessage';
import './tailwind.css';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the user is logged in
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/check-login');
        if (!response.ok) {
          throw new Error('Failed to check login status');
        }
        const data = await response.json();
        setIsLoggedIn(data.loggedIn);
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5002/logout');
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#2f3d51" />
            <text x="50%" y="40%" className="text text-top">Need</text>
            <text x="50%" y="70%" className="text text-bottom">Fulfillment</text>
          </svg>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/needs-map">Needs Map</a>
            </li>
            <li>
              <a href="/register">Register</a>
            </li>
            {isLoggedIn ? (
              <li onClick={handleLogout}>Logout</li>
            ) : (
              <li>
                <a href="/login">Login</a>
              </li>
            )}
            <li>
              <a href="/post-need">Post Need</a>
            </li>
            <li>
              <a href="/messages">Messages</a>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/needs-map" element={<NeedsMap />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/post-need" element={<PostNeed />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/send-message/:recipientId" element={<SendMessage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

*/

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import NeedsMap from './NeedsMap';
import Register from './Register';
import Login from './Login';
import PostNeed from './PostNeed';
import Messages from './Messages';
import SendMessage from './SendMessage';
import './tailwind.css';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the user is logged in
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/check-login');
        if (!response.ok) {
          throw new Error('Failed to check login status');
        }
        const data = await response.json();
        setIsLoggedIn(data.loggedIn);
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5002/logout');
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#2f3d51" />
            <text x="50%" y="40%" className="text text-top">Need</text>
            <text x="50%" y="70%" className="text text-bottom">Fulfillment</text>
          </svg>
          <ul>
            <li className="clickable-li">
              <Link to="/">Home</Link>
            </li>
            {isLoggedIn ? (
              <li className="clickable-li" onClick={handleLogout}>Logout</li>
            ) : (
              <li className="clickable-li">
                <Link to="/login">Login</Link>
              </li>
            )}
            <li className="clickable-li">
              <Link to="/register">Register</Link>
            </li>
            {isLoggedIn && (
            <>
              <li className="clickable-li">
                <Link to="/needs-map">Needs Map</Link>
              </li>
              <li className="clickable-li">
                <Link to="/post-need">Post Need</Link>
              </li>
              <li className="clickable-li">
                <Link to="/my-needs">My Needs</Link>
              </li>
              <li className="clickable-li">
                <Link to="/messages">Messages</Link>
              </li>
            </>
            )}
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/needs-map" element={<NeedsMap />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/post-need" element={<PostNeed />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/send-message/:recipientId" element={<SendMessage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
