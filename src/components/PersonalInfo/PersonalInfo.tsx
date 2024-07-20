import React from 'react';
import './PersonalInfo.css';  // Import the CSS file

interface PersonalInfoProps {
  name: string;
  email: string;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ name, email }) => (
  <div className="personal-info">
    <h2>{name}</h2>
    <p>{email}</p>
  </div>
);

export default PersonalInfo;
