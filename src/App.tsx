import React, { useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from './utils/graphql';
import Login from './components/Login/Login';
import MainPage from './components/MainPage';
import './App.css';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <ApolloProvider client={client}>
      <div className="App">
        <button className="logout-button" onClick={handleLogout}>Logout</button>
        <MainPage token={token} />
      </div>
    </ApolloProvider>
  );
};

export default App;
