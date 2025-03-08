import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((username === 'test' && password === '123') || 
        (username === 'user' && password === '123')) {
      if (username === 'test') {
        navigate('/home');
      } else {
        navigate('/artisthome');
      }
    } else {
      alert('Invalid username or password!');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 style={{
          textAlign: 'center',
          color: '#1e3c72',
          marginBottom: '30px',
          fontSize: '2rem',
          fontWeight: 'bold'
        }}>INBS</h2>
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          />
        </div>
        <button 
          type="submit"
          style={{
            marginTop: '10px',
            fontWeight: 'bold',
            letterSpacing: '1px'
          }}
        >
          LOGIN
        </button>
      </form>
    </div>
  );
}

export default Login;