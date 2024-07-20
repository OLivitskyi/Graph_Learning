import React from 'react';
import { ApolloProvider, gql, useQuery } from '@apollo/client';
import { client } from '../utils/graphql';
import Graphs from './../components/Graphs/Graphs';
import './MainPage.css';

interface User {
  id: number;
  login: string;
  email: string;
}

const GET_USER_INFO = gql`
  query GetUserInfo {
    user {
      id
      login
      email
    }
  }
`;

const MainPageContent: React.FC = () => {
  const { loading, error, data } = useQuery<{ user: User[] }>(GET_USER_INFO);

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error('GraphQL error:', error);  // Debugging line
    return <p>Error: {error.message}</p>;
  }

  console.log('GraphQL data:', data);  // Debugging line

  const user = data?.user[0]; // Access the first user in the array

  return (
    <div className="main-page">
      <h1>Welcome, {user?.login}</h1>
      <p>User ID: {user?.id}</p>
      <p>Email: {user?.email}</p>
      <Graphs />
    </div>
  );
};

const MainPage: React.FC<{ token: string }> = ({ token }) => {
  return (
    <ApolloProvider client={client}>
      <MainPageContent />
    </ApolloProvider>
  );
};

export default MainPage;
