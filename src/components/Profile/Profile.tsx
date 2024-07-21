import React from 'react';
import { useQuery, gql } from '@apollo/client';
import './Profile.css';  

const GET_USER_INFO = gql`
  query GetUserInfo {
    user {
      id
      login
      email
    }
  }
`;

const Profile: React.FC = () => {
  const { loading, error, data } = useQuery(GET_USER_INFO);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="profile">
      <h1>Profile</h1>
      <p>ID: {data?.user.id}</p>
      <p>Login: {data?.user.login}</p>
      <p>Email: {data?.user.email}</p>
    </div>
  );
};

export default Profile;
