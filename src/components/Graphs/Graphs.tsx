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
}

const Graphs: React.FC = () => {
  const { loading: loadingXP, error: errorXP, data: dataXP } = useQuery<{ transaction: Transaction[] }>(GET_XP_DATA);
  const { loading: loadingPassFail, error: errorPassFail, data: dataPassFail } = useQuery<{ result: Result[] }>(GET_PASS_FAIL_DATA);

  useEffect(() => {
    if (dataXP) {
      d3.select('#graph1').selectAll('*').remove();
      const barData = dataXP.transaction.map((d) => d.amount);
      const xScaleBar = d3.scaleBand().domain(d3.range(barData.length).map(String)).range([0, 480]).padding(0.1);
      const yScaleBar = d3.scaleLinear().domain([0, d3.max(barData) as number]).range([480, 0]);
      const svg1 = d3.select('#graph1').append('svg').attr('width', 500).attr('height', 500);
      svg1.append('g').attr('fill', 'steelblue').selectAll('rect').data(barData).join('rect')
        .attr('x', (d, i) => xScaleBar(i.toString())!).attr('y', (d) => yScaleBar(d))
        .attr('height', (d) => yScaleBar(0) - yScaleBar(d)).attr('width', xScaleBar.bandwidth());
      svg1.append('g').call(d3.axisLeft(yScaleBar)).attr('transform', 'translate(0,0)');
      svg1.append('g').call(d3.axisBottom(xScaleBar)).attr('transform', 'translate(0,480)');
      svg1.append('text').attr('x', 250).attr('y', 20).attr('text-anchor', 'middle').text('XP Earned Over Time');
    }

    if (dataXP) {
      d3.select('#graph2').selectAll('*').remove();
      const lineData = dataXP.transaction.map((d) => ({ amount: d.amount, date: new Date(d.createdAt) }));
      const xScaleLine = d3.scaleTime().domain(d3.extent(lineData, (d) => d.date) as [Date, Date]).range([0, 480]);
      const yScaleLine = d3.scaleLinear().domain([0, d3.max(lineData, (d) => d.amount) as number]).range([480, 0]);
      const line = d3.line<{ amount: number, date: Date }>().x((d) => xScaleLine(d.date)).y((d) => yScaleLine(d.amount));
      const svg2 = d3.select('#graph2').append('svg').attr('width', 500).attr('height', 500);
      svg2.append('path').datum(lineData).attr('fill', 'none').attr('stroke', 'steelblue').attr('stroke-width', 1.5).attr('d', line);
      svg2.append('g').call(d3.axisLeft(yScaleLine)).attr('transform', 'translate(0,0)');
      svg2.append('g').call(d3.axisBottom(xScaleLine)).attr('transform', 'translate(0,480)');
      svg2.append('text').attr('x', 250).attr('y', 20).attr('text-anchor', 'middle').text('XP Progress Over Time');
    }

    if (dataPassFail) {
      d3.select('#graph3').selectAll('*').remove();
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

      const svg3 = d3.select('#graph3').append('svg').attr('width', 500).attr('height', 500).append('g')
        .attr('transform', 'translate(250,250)');

      svg3.selectAll('path').data(pie).enter().append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => (i === 0 ? 'green' : 'red'));

      svg3.append('text').attr('x', 0).attr('y', -220).attr('text-anchor', 'middle').text('PASS/FAIL Ratio');
    }
  }, [dataXP, dataPassFail]);

  if (loadingXP || loadingPassFail) return <p>Loading...</p>;
  if (errorXP || errorPassFail) return <p>Error: {errorXP?.message || errorPassFail?.message}</p>;

  return (
    <>
      <div id="graph1"></div>
      <div id="graph2"></div>
      <div id="graph3"></div>
    </>
  );
};

export default Graphs;
