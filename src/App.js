import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from "./AuthContext"; // Import the custom hook from AuthContext
import Home from './Home';
import NeedsMap from './NeedsMap';
import Register from './Register';
import Login from './Login';
import PostNeed from './PostNeed';
import Messages from './Messages';
import MyProfile from './MyProfile';
import SendMessage from './SendMessage';
import './tailwind.css';
import './App.css';

function App() {
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  useEffect(() => {
    // Check if the user is logged in when the application loads
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/check-login');
        if (!response.ok) {
          throw new Error('Failed to check login status');
        }
        const data = await response.json();
        setIsLoggedIn(data.loggedIn); // Update the global login status
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoginStatus();
  }, [setIsLoggedIn]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5002/logout');
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
      setIsLoggedIn(false); // Set logged out state globally
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <nav className="flex items-center justify-between bg-gradient-to-r from-[#2a2937] to-blue-500 p-4 shadow-md">
          <img
            src="logo-need-fulfillment.png"
            alt="Need Fulfillment Logo"
            className="h-24 w-auto"
          />
          <ul>
            <li className="clickable-li">
              <Link to="/">Home</Link>
            </li>
            {isLoggedIn ? (
              <li className="clickable-li" onClick={handleLogout}>
                Logout
              </li>
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
                  <Link to="/my-profile">My Profile</Link>
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
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {isLoggedIn ? (
            <>
              <Route path="/needs-map" element={<NeedsMap />} />
              <Route path="/post-need" element={<PostNeed />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/my-profile" element={<MyProfile />} />
            </>
          ) : (
            <>
              <Route
                path="/needs-map"
                element={<Navigate to="/login" replace />}
              />
              <Route
                path="/post-need"
                element={<Navigate to="/login" replace />}
              />
              <Route
                path="/messages"
                element={<Navigate to="/login" replace />}
              />
              <Route
                path="/my-profile"
                element={<Navigate to="/login" replace />}
              />
            </>
          )}
          <Route
            path="/send-message/:recipientId"
            element={<SendMessage />}
          />
        </Routes>
        <footer className="bg-gray-800 py-4 text-center mt-auto">
          <p className="text-white">
            &copy; {new Date().getFullYear()} Need Fulfillment. All rights reserved.
          </p>
          <p className="text-sm text-gray-200">
            This project is licensed under the GNU General Public License v3.0.
            You may redistribute and modify this software under the terms of the
            license. For full details, visit the{' '}
            <a
              href="https://www.gnu.org/licenses/gpl-3.0.html"
              className="text-blue-400 hover:underline"
            >
              GPL-3.0 License
            </a>.
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );  
}

export default App;