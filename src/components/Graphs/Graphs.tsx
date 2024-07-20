import React, { useEffect, useState } from "react";
import { useQuery, gql } from '@apollo/client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import './Graphs.css';

const GET_XP_DATA = gql`
  query GetXPData {
    transaction(where: { type: { _eq: "xp" } }) {
      amount
      createdAt
    }
  }
`;

const GET_SKILLS_DATA = gql`
  query GetSkillsData {
    result {
      grade
      object {
        name
      }
    }
  }
`;

const GET_PROJECT_XP_DATA = gql`
  query GetProjectXPData {
    transaction(where: { type: { _eq: "xp" } }) {
      amount
      object {
        name
      }
    }
  }
`;

interface Transaction {
  amount: number;
  createdAt: string;
}

interface Result {
  grade: number;
  object: {
    name: string;
  };
}

interface ProjectXP {
  amount: number;
  object: {
    name: string;
  };
}

const Graphs: React.FC = () => {
  const { loading: loadingXP, error: errorXP, data: dataXP } = useQuery<{ transaction: Transaction[] }>(GET_XP_DATA);
  const { loading: loadingSkills, error: errorSkills, data: dataSkills } = useQuery<{ result: Result[] }>(GET_SKILLS_DATA);
  const { loading: loadingProjectXP, error: errorProjectXP, data: dataProjectXP } = useQuery<{ transaction: ProjectXP[] }>(GET_PROJECT_XP_DATA);

  if (loadingXP || loadingSkills || loadingProjectXP) return <p>Loading...</p>;
  if (errorXP || errorSkills || errorProjectXP) return <p>Error: {errorXP?.message || errorSkills?.message || errorProjectXP?.message}</p>;

  const xpData = dataXP ? dataXP.transaction.map(tx => ({
    date: new Date(tx.createdAt).toLocaleDateString(),
    amount: tx.amount,
  })) : [];

  const skillsData = dataSkills ? dataSkills.result.reduce((acc, curr) => {
    const existingSkill = acc.find(skill => skill.name === curr.object.name);
    if (existingSkill) {
      existingSkill.value += curr.grade;
    } else {
      acc.push({ name: curr.object.name, value: curr.grade });
    }
    return acc;
  }, [] as { name: string, value: number }[]).sort((a, b) => b.value - a.value).slice(0, 5) : [];

  const projectXPData = dataProjectXP ? dataProjectXP.transaction.reduce((acc, curr) => {
    const existingProject = acc.find(proj => proj.name === curr.object.name);
    if (existingProject) {
      existingProject.value += curr.amount;
    } else {
      acc.push({ name: curr.object.name, value: curr.amount });
    }
    return acc;
  }, [] as { name: string, value: number }[]).sort((a, b) => b.value - a.value).slice(0, 5) : [];

  return (
    <div className="graphs">
      <div className="graph">
        <h3>XP Progression Over Time</h3>
        <LineChart width={600} height={300} data={xpData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="amount" stroke="#8884d8" />
        </LineChart>
      </div>
      <div className="graph">
        <h3>Top 5 Skills</h3>
        <PieChart width={400} height={400}>
          <Pie dataKey="value" isAnimationActive={false} data={skillsData} cx={200} cy={200} outerRadius={120} fill="#8884d8" label />
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
      <div className="graph">
        <h3>Top 5 Projects by XP</h3>
        <BarChart width={600} height={300} data={projectXPData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
};

export default Graphs;
