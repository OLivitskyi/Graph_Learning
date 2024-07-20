import React, { useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from './utils/graphql';
import Login from './components/Login/Login';
import MainPage from './components/MainPage';
import Graphs from './components/Graphs/Graphs';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <ApolloProvider client={client}>
      <div className="App">
        <MainPage token={token} />
        <Graphs />
      </div>
    </ApolloProvider>
  );
};

export default App;
