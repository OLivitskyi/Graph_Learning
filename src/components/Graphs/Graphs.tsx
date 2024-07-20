import React, { useEffect, useState } from 'react';
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

const GET_PASS_FAIL_DATA = gql`
  query GetPassFailData {
    result {
      grade
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
  const { loading: loadingPassFail, error: errorPassFail, data: dataPassFail } = useQuery<{ result: Result[] }>(GET_PASS_FAIL_DATA);

  useEffect(() => {
    if (dataXP) {
      d3.select('#graph1-svg').selectAll('*').remove();

      const lineData = dataXP.transaction.map((d) => ({
        amount: d.amount / 1024, // Конвертуємо в кілобайти
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

      const svg = d3.select('#graph1-svg').append('svg')
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
      d3.select('#graph2-svg').selectAll('*').remove();

      const skillsData = dataSkills.result.reduce((acc, curr) => {
        const existingSkill = acc.find(skill => skill.name === curr.object.name);
        if (existingSkill) {
          existingSkill.value += curr.grade;
        } else {
          acc.push({ name: curr.object.name, value: curr.grade });
        }
        return acc;
      }, [] as { name: string, value: number }[]).sort((a, b) => b.value - a.value).slice(0, 5);

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

      const svg = d3.select('#graph2-svg').append('svg')
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

    if (dataPassFail) {
      d3.select('#graph3-svg').selectAll('*').remove();

      const passFailData = dataPassFail.result.reduce(
        (acc, { grade }) => {
          if (grade === 1) acc.pass += 1;
          else acc.fail += 1;
          return acc;
        },
        { pass: 0, fail: 0 }
      );

      const pie = d3.pie<number>().value(d => d)([passFailData.pass, passFailData.fail]);
      const arc = d3.arc<d3.PieArcDatum<number>>().innerRadius(0).outerRadius(200);

      const svg = d3.select('#graph3-svg').append('svg')
        .attr('width', 500)
        .attr('height', 500)
        .append('g')
        .attr('transform', 'translate(250,250)');

      svg.selectAll('path')
        .data(pie)
        .enter().append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => (i === 0 ? 'green' : 'red'));

      svg.append('text')
        .attr('x', 0)
        .attr('y', 220)
        .attr('text-anchor', 'middle')
        .text('PASS/FAIL Ratio');
    }
  }, [dataXP, dataSkills, dataPassFail]);

  if (loadingXP || loadingSkills || loadingPassFail) return <p>Loading...</p>;
  if (errorXP || errorSkills || errorPassFail) return <p>Error: {errorXP?.message || errorSkills?.message || errorPassFail?.message}</p>;

  return (
    <>
      <div id="graph1">
        <h2>XP Progression Over Time</h2>
        <div id="graph1-svg"></div>
      </div>
      <div id="graph2">
        <h2>Top 5 Skills</h2>
        <div id="graph2-svg"></div>
      </div>
      <div id="graph3">
        <h2>PASS/FAIL Ratio</h2>
        <div id="graph3-svg"></div>
      </div>
    </>
  );
};

export default Graphs;
