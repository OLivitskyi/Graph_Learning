import React, { useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from "recharts";
import "./Graphs.css";

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

  const [xpData, setXPData] = useState<{ date: string, xp: number }[]>([]);
  const [skillsData, setSkillsData] = useState<{ name: string, value: number }[]>([]);
  const [projectXPData, setProjectXPData] = useState<{ name: string, value: number }[]>([]);

  useEffect(() => {
    if (dataXP) {
      const formattedXPData = dataXP.transaction.map((d) => ({
        date: new Date(d.createdAt).toLocaleDateString(),
        xp: d.amount / 1000, // Конвертуємо в кілобайти
      }));
      setXPData(formattedXPData);
    }

    if (dataSkills) {
      const aggregatedSkillsData = dataSkills.result.reduce((acc, curr) => {
        const existingSkill = acc.find(skill => skill.name === curr.object.name);
        if (existingSkill) {
          existingSkill.value += curr.grade;
        } else {
          acc.push({ name: curr.object.name, value: curr.grade });
        }
        return acc;
      }, [] as { name: string, value: number }[]).sort((a, b) => b.value - a.value).slice(0, 5);

      setSkillsData(aggregatedSkillsData);
    }

    if (dataProjectXP) {
      const aggregatedProjectXPData = dataProjectXP.transaction.reduce((acc, curr) => {
        const existingProject = acc.find(proj => proj.name === curr.object.name);
        if (existingProject) {
          existingProject.value += curr.amount;
        } else {
          acc.push({ name: curr.object.name, value: curr.amount / 1000 }); // Конвертуємо в кілобайти
        }
        return acc;
      }, [] as { name: string, value: number }[]).sort((a, b) => b.value - a.value).slice(0, 5);

      setProjectXPData(aggregatedProjectXPData);
    }
  }, [dataXP, dataSkills, dataProjectXP]);

  if (loadingXP || loadingSkills || loadingProjectXP) return <p>Loading...</p>;
  if (errorXP || errorSkills || errorProjectXP) return <p>Error: {errorXP?.message || errorSkills?.message || errorProjectXP?.message}</p>;

  return (
    <div className="graphs">
      <div className="graph-container">
        <h3>XP Progression Over Time</h3>
        <LineChart width={600} height={300} data={xpData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="xp" stroke="#8884d8" />
        </LineChart>
      </div>
      <div className="graph-container">
        <h3>Top 5 Skills</h3>
        <RadarChart cx={300} cy={250} outerRadius={150} width={600} height={500} data={skillsData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis />
          <Radar name="Skills" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Legend />
          <Tooltip />
        </RadarChart>
      </div>
      <div className="graph-container">
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
