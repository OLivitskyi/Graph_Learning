import React from 'react';
import './ProgressBar.css';  // Import the CSS file

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
  <div className="progress-bar">
    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
  </div>
);

export default ProgressBar;
