import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { useQuery, gql } from '@apollo/client';
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

const Graphs: React.FC = () => {
  const { loading: loadingXP, error: errorXP, data: dataXP } = useQuery<{ transaction: Transaction[] }>(GET_XP_DATA);
  const { loading: loadingSkills, error: errorSkills, data: dataSkills } = useQuery<{ result: Result[] }>(GET_SKILLS_DATA);

  useEffect(() => {
    if (dataXP) {
      d3.select('#xpProgression').selectAll('*').remove();

      const lineData = dataXP.transaction.map((d) => ({
        amount: d.amount,
        date: new Date(d.createdAt),
      }));

      const xScale = d3.scaleTime()
        .domain(d3.extent(lineData, (d) => d.date) as [Date, Date])
        .range([0, 480]);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(lineData, (d) => d.amount) as number])
        .range([480, 0]);

      const line = d3.line<{ amount: number; date: Date }>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.amount));

      const svg = d3.select('#xpProgression').append('svg')
        .attr('width', 500)
        .attr('height', 500);

      svg.append('path')
        .datum(lineData)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', line);

      svg.append('g')
        .call(d3.axisLeft(yScale))
        .attr('transform', 'translate(0,0)');

      svg.append('g')
        .call(d3.axisBottom(xScale))
        .attr('transform', 'translate(0,480)');

      svg.append('text')
        .attr('x', 250)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .text('XP Progression Over Time');
    }

    if (dataSkills) {
      d3.select('#bestSkills').selectAll('*').remove();

      const skillsData = dataSkills.result.reduce((acc, curr) => {
        const existingSkill = acc.find(skill => skill.name === curr.object.name);
        if (existingSkill) {
          existingSkill.value += curr.grade;
        } else {
          acc.push({ name: curr.object.name, value: curr.grade });
        }
        return acc;
      }, [] as { name: string, value: number }[]);

      const radarChartOptions = {
        w: 500,
        h: 500,
        maxValue: 5,
        levels: 5,
        roundStrokes: true,
        color: d3.scaleOrdinal(d3.schemeCategory10),
      };

      const allAxis = skillsData.map(d => d.name);
      const total = allAxis.length;
      const radius = Math.min(radarChartOptions.w / 2, radarChartOptions.h / 2);
      const angleSlice = Math.PI * 2 / total;

      const rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, radarChartOptions.maxValue]);

      const svg = d3.select('#bestSkills').append('svg')
        .attr('width', radarChartOptions.w + 100)
        .attr('height', radarChartOptions.h + 100)
        .append('g')
        .attr('transform', `translate(${radarChartOptions.w / 2 + 50},${radarChartOptions.h / 2 + 50})`);

      const radarLine = d3.lineRadial<{ angle: number; value: number }>()
        .curve(d3.curveLinearClosed)
        .radius(d => rScale(d.value))
        .angle((d, i) => i * angleSlice);

      svg.append('path')
        .datum(skillsData.map((d, i) => ({ angle: angleSlice * i, value: d.value })))
        .attr('d', radarLine)
        .attr('fill', 'rgba(0, 123, 255, 0.5)')
        .attr('stroke', '#007bff')
        .attr('stroke-width', 2);

      svg.selectAll('.axisLabel')
        .data(allAxis)
        .enter().append('text')
        .attr('x', (d, i) => rScale(radarChartOptions.maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y', (d, i) => rScale(radarChartOptions.maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .text(d => d)
        .style('font-size', '11px');
    }
  }, [dataXP, dataSkills]);

  if (loadingXP || loadingSkills) return <p>Loading...</p>;
  if (errorXP || errorSkills) return <p>Error: {errorXP?.message || errorSkills?.message}</p>;

  return (
    <>
      <div id="xpProgression"></div>
      <div id="bestSkills"></div>
    </>
  );
};

export default Graphs;
