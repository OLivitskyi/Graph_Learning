import React from 'react';
import { useQuery, gql } from '@apollo/client';
import './Profile.css';

const GET_USER_INFO = gql`
  query GetUserInfo {
    user {
      id
      login
      email
      skills {
        name
        level
      }
      xp {
        total
      }
    }
  }
`;

const Profile: React.FC = () => {
  const { loading, error, data } = useQuery(GET_USER_INFO);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { id, login, email, skills, xp } = data.user[0];

  return (
    <div className="profile">
      <h1>Profile</h1>
      <p>ID: {id}</p>
      <p>Login: {login}</p>
      <p>Email: {email}</p>

      <h2>Skills</h2>
      <ul>
        {skills.map((skill: { name: string; level: number }) => (
          <li key={skill.name}>
            {skill.name}: Level {skill.level}
          </li>
        ))}
      </ul>

      <h2>Total XP</h2>
      <p>{xp.total} XP</p>
    </div>
  );
};

export default Profile;
