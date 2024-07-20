import React, { useState } from 'react';
import Login from './components/Login/Login';
import MainPage from './components/MainPage';
import './App.css';

const App: React.FC = () => {
  const [token, setToken] = useState(localStorage.getItem('authToken') || '');

  const handleLogin = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken('');
  };

  return (
    <div className="app">
      {token ? (
        <>
          <button onClick={handleLogout} className="logout-button">Logout</button>
          <MainPage token={token} />
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
