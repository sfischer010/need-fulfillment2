import React, { useState } from 'react';

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginData = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        setIsLoggedIn(true);
        setStatusMessage('Login successful!');
        setStatusType('success');
      } else {
        setStatusMessage('Invalid email or password.');
        setStatusType('failure');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setStatusMessage('Error logging in.');
      setStatusType('failure');
    }
  };

  return (
    <div className="form-container p-6 space-y-6 text-cyan-950">
      <h2 className="text-2xl font-bold">Login</h2>
      <div
        id="status"
        className={`${statusMessage ? '' : 'hidden'} ${statusType === 'success' ? 'bg-green-100 text-green-700 p-2 rounded' : 'bg-red-100 text-red-700 p-2 rounded'}`}
      >
        {statusMessage}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="form-group flex justify-start ml-4 mt-4">
          <label></label>
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
}

export default Login;
