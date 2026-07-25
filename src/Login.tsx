import React, { useState, useContext, FormEvent } from 'react';
import { AuthContext } from './AuthContext';

const Login: React.FC = () => {
  const { setIsLoggedIn } = useContext(AuthContext);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'success' | 'failure' | ''>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const loginData = {
      email,
      password,
    };

    try {
      const response = await fetch('http://localhost:5002/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        setIsLoggedIn(true);
        setStatusMessage('Login successful! TEST FROM TSX');
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
        className={`${statusMessage ? '' : 'hidden'} ${
          statusType === 'success'
            ? 'bg-green-100 text-green-700 p-2 rounded'
            : 'bg-red-100 text-red-700 p-2 rounded'
        }`}
      >
        {statusMessage}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group flex justify-start ml-4 mt-4">
          <label></label>
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
};

export default Login;