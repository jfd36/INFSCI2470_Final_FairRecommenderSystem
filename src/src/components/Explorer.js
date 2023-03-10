import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import styled from 'styled-components';

const ExplorerWrapper = styled.div.attrs({
    className: 'explorer_wrapper'
  })`
    // grid-area: e;
  `;

const Explorer = ({
  interactions
}) => {
  const ref = useRef(null);
  const layout = {
    width: 100,
    height: 100
  };

  const xScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, layout.width]);

  useEffect(() => {
    const featureRecData = d3
      .select(ref.current)
      .selectAll('text')
      .data(interactions);

    const featureRec = featureRecData
      .enter()
      .append('rect')
      .attr('class', 'feature_rect')
      .attr('width', d => {
        const datum = d;
        return xScale(datum);
      })
      .attr('width', 25)
      .attr('height', 25)
      .attr('x', 25)
      .attr('y', (d, i) => 30 + i * 30)
      .style('fill', 'mediumpurple');
  }, [ref.current])

  return (
    <ExplorerWrapper>
      <svg width="100%" ref={ref} />
    </ExplorerWrapper>
  );
};

export default Explorer;
  