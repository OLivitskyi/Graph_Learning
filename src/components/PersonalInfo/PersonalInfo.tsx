import React from 'react';
import './PersonalInfo.css';  

interface PersonalInfoProps {
  name: string;
  email: string;
  userId: number;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ name, email, userId }) => (
  <div className="personal-info">
    <h2>{name}</h2>
    <p>Email: {email}</p>
    <p>User ID: {userId}</p>
  </div>
);

export default PersonalInfo;
