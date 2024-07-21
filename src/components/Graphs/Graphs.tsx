import React, { useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import "./Graphs.css";

const GET_XP_DATA = gql`
  query GetXPData($userId: Int!) {
    transaction(where: { userId: { _eq: $userId }, type: { _eq: "xp" } }) {
      amount
      createdAt
    }
  }
`;

const GET_PROJECT_XP_DATA = gql`
  query GetProjectXPData($userId: Int!) {
    transaction(where: { userId: { _eq: $userId }, type: { _eq: "xp" } }) {
      amount
      object {
        name
      }
    }
  }
`;

const GET_AUDITS_DATA = gql`
  query GetAuditsData($userId: Int!) {
    audit(where: { auditorId: { _eq: $userId } }) {
      grade
    }
  }
`;

interface XPTransaction {
  amount: number;
  createdAt: string;
}

interface ProjectXP {
  amount: number;
  object: {
    name: string;
  };
}

interface Audit {
  grade: number;
}

const Graphs: React.FC<{ userId: number }> = ({ userId }) => {
  const { loading: loadingXP, error: errorXP, data: dataXP } = useQuery<{ transaction: XPTransaction[] }>(GET_XP_DATA, {
    variables: { userId },
  });

  const { loading: loadingProjectXP, error: errorProjectXP, data: dataProjectXP } =
    useQuery<{ transaction: ProjectXP[] }>(GET_PROJECT_XP_DATA, { variables: { userId } });

  const { loading: loadingAudits, error: errorAudits, data: dataAudits } = useQuery<{ audit: Audit[] }>(GET_AUDITS_DATA, {
    variables: { userId },
  });

  const [xpData, setXPData] = useState<XPTransaction[]>([]);
  const [projectXPData, setProjectXPData] = useState<ProjectXP[]>([]);
  const [auditData, setAuditData] = useState<Audit[]>([]);
  const [filteredXPData, setFilteredXPData] = useState<XPTransaction[]>([]);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    if (dataXP) {
      const processedData = dataXP.transaction.map((d) => ({ ...d, amount: d.amount / 1000 }));
      setXPData(processedData);
      setFilteredXPData(processDataByPeriod(processedData, period));
    }
  }, [dataXP, period]);

  useEffect(() => {
    if (dataProjectXP) {
      setProjectXPData(dataProjectXP.transaction.map((d) => ({ ...d, amount: d.amount / 1000 })));
    }
  }, [dataProjectXP]);

  useEffect(() => {
    if (dataAudits) {
      setAuditData(dataAudits.audit);
    }
  }, [dataAudits]);

  const processDataByPeriod = (data: XPTransaction[], period: string) => {
    const now = new Date();
    let filteredData = data;

    if (period !== "all") {
      const periodMonths = parseInt(period, 10);
      const startDate = new Date(now.setMonth(now.getMonth() - periodMonths));
      filteredData = data.filter((d) => new Date(d.createdAt) >= startDate);
    }

    // Сортування даних за датою
    filteredData.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return filteredData;
  };

  const processedProjectXPData = projectXPData.reduce((acc, curr) => {
    const existingProject = acc.find((proj) => proj.name === curr.object.name);
    if (existingProject) {
      existingProject.value += curr.amount;
    } else {
      acc.push({ name: curr.object.name, value: curr.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value).slice(0, 5);

  const doneAmount = auditData.filter((a) => a.grade >= 1).length;
  const receivedAmount = auditData.filter((a) => a.grade < 1).length;
  const ratio = (doneAmount / (receivedAmount || 1)).toFixed(2);

  if (loadingXP || loadingProjectXP || loadingAudits) return <p>Loading...</p>;
  if (errorXP || errorProjectXP || errorAudits) return <p>Error: {errorXP?.message || errorProjectXP?.message || errorAudits?.message}</p>;

  return (
    <div className="graphs-container">
      <div className="graph">
        <h3>XP Progression Over Time</h3>
        <div className="period-selector">
          <label htmlFor="period">Period:</label>
          <select id="period" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="3">Last 3 months</option>
            <option value="6">Last 6 months</option>
            <option value="12">Last 12 months</option>
            <option value="all">All time</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredXPData.map((d) => ({
            ...d,
            date: new Date(d.createdAt).toLocaleDateString(),
          }))}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="graph">
        <h3>Top 5 Projects by XP</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={processedProjectXPData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            <Radar name="XP" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="graph">
        <h3>Audits Ratio</h3>
        <div className="audit-ratio">
          <div className="audit-ratio__bars">
            <div className="audit-ratio__bar audit-ratio__bar--done" style={{ width: `${doneAmount}%` }} />
            <div className="audit-ratio__bar audit-ratio__bar--received" style={{ width: `${receivedAmount}%` }} />
          </div>
          <div className="audit-ratio__info">
            <div className="audit-ratio__info-item">
              <span>Done</span>
              <span>{doneAmount.toFixed(2)} audits</span>
            </div>
            <div className="audit-ratio__info-item">
              <span>Received</span>
              <span>{receivedAmount.toFixed(2)} audits</span>
            </div>
          </div>
          <div className="audit-ratio__result">
            <div className="audit-ratio__result-number">{ratio}</div>
            <div className="audit-ratio__result-label">Best ratio ever!</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Graphs;
