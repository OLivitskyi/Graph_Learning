import React, { useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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

const GET_USERS_XP_DATA = gql`
  query GetUsersXPData {
    user {
      id
      transaction_aggregate {
        aggregate {
          sum {
            amount
          }
        }
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

interface UserXP {
  id: number;
  transaction_aggregate: {
    aggregate: {
      sum: {
        amount: number;
      };
    };
  };
}

const Graphs: React.FC = () => {
  const { loading: loadingXP, error: errorXP, data: dataXP } = useQuery<{
    transaction: Transaction[];
  }>(GET_XP_DATA);
  const { loading: loadingSkills, error: errorSkills, data: dataSkills } = useQuery<{
    result: Result[];
  }>(GET_SKILLS_DATA);
  const { loading: loadingProjectXP, error: errorProjectXP, data: dataProjectXP } = useQuery<{
    transaction: ProjectXP[];
  }>(GET_PROJECT_XP_DATA);
  const { loading: loadingUsersXP, error: errorUsersXP, data: dataUsersXP } = useQuery<{
    user: UserXP[];
  }>(GET_USERS_XP_DATA);

  const [xpData, setXPData] = useState<Transaction[]>([]);
  const [skillsData, setSkillsData] = useState<Result[]>([]);
  const [projectXPData, setProjectXPData] = useState<ProjectXP[]>([]);
  const [usersXPData, setUsersXPData] = useState<{ range: string; count: number }[]>([]);
  const [xpRange, setXpRange] = useState(50);

  useEffect(() => {
    if (dataXP) {
      setXPData(dataXP.transaction);
    }
  }, [dataXP]);

  useEffect(() => {
    if (dataSkills) {
      setSkillsData(dataSkills.result);
    }
  }, [dataSkills]);

  useEffect(() => {
    if (dataProjectXP) {
      setProjectXPData(dataProjectXP.transaction);
    }
  }, [dataProjectXP]);

  useEffect(() => {
    if (dataUsersXP) {
      const ranges: { [key: string]: number } = {};
      dataUsersXP.user.forEach((user) => {
        const xp = user.transaction_aggregate.aggregate.sum.amount / 1000; // Конвертація в кілобайти
        const range = `${Math.floor(xp / xpRange) * xpRange}-${Math.floor(xp / xpRange) * xpRange + xpRange}`;
        if (ranges[range]) {
          ranges[range]++;
        } else {
          ranges[range] = 1;
        }
      });
      setUsersXPData(Object.keys(ranges).map((key) => ({ range: key, count: ranges[key] })));
    }
  }, [dataUsersXP, xpRange]);

  const processedXPData = xpData.map((d) => ({
    amount: d.amount / 1000, // Конвертація в кілобайти
    date: new Date(d.createdAt).toLocaleDateString(),
  }));

  const processedSkillsData = skillsData
    .reduce((acc, curr) => {
      const existingSkill = acc.find((skill) => skill.name === curr.object.name);
      if (existingSkill) {
        existingSkill.value += curr.grade;
      } else {
        acc.push({ name: curr.object.name, value: curr.grade });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const processedProjectXPData = projectXPData
    .reduce((acc, curr) => {
      const existingProject = acc.find((proj) => proj.name === curr.object.name);
      if (existingProject) {
        existingProject.value += curr.amount / 1000; // Конвертація в кілобайти
      } else {
        acc.push({ name: curr.object.name, value: curr.amount / 1000 });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  if (loadingXP || loadingSkills || loadingProjectXP || loadingUsersXP) return <p>Loading...</p>;
  if (errorXP || errorSkills || errorProjectXP || errorUsersXP)
    return <p>Error: {errorXP?.message || errorSkills?.message || errorProjectXP?.message || errorUsersXP?.message}</p>;

  return (
    <div className="graphs">
      <div className="graph">
        <h3>XP Progression Over Time</h3>
        <LineChart width={600} height={300} data={processedXPData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="amount" stroke="#8884d8" />
        </LineChart>
      </div>
      <div className="graph">
        <h3>Best Skills</h3>
        <RadarChart outerRadius={90} width={600} height={300} data={processedSkillsData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis angle={30} domain={[0, 5]} />
          <Radar name="Skills" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Legend />
        </RadarChart>
      </div>
      <div className="graph">
        <h3>Top 5 Projects by XP</h3>
        <BarChart width={600} height={300} data={processedProjectXPData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </div>
      <div className="graph">
        <h3>Distribution of users by XP</h3>
        <div>
          <div>Amount of XP ranges</div>
          <div>
            <input
              min="2"
              max="100"
              type="range"
              value={xpRange}
              onChange={(e) => setXpRange(Number(e.target.value))}
            />
            <output>{xpRange}</output>
          </div>
        </div>
        <BarChart width={600} height={300} data={usersXPData}>
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
};

export default Graphs;
