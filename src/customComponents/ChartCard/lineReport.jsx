import React from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AppConstants from '../../themes/common/appConstants';

const LineReport = ({ chartData }) => {
  const renderCustomizedTick = data => props => {
    const { x, y, payload } = props;
    const { index } = payload;
    const firstItem = index === 0;
    const lastItem = index === data.length - 1;
    const dataItem = data[index];

    if (firstItem || lastItem) {
      const textX = index === 0 ? x + 20 : x - 10;

      return (
        <g>
          <circle cx={x} cy={y + 15} r={10} fill="#fff" />
          <text
            x={textX}
            y={y + 22}
            fontSize="smaller"
            className="cat-name"
            textAnchor="middle"
            fill="#46476d"
          >
            {firstItem && dataItem ? dataItem.v1Title : null}
            {lastItem && AppConstants.today}
          </text>
        </g>
      );
    }
    return <></>;
  };

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const [pointData] = payload;
      const { v1Title, v2Title, v1Label, v2Label, v1, v2 } = pointData.payload;
      return (
        <div className="custom-tooltip">
          {v1 > v2 ? (
            <>
              <div>
                {v1Title}: {v1Label}
              </div>
              <div>
                {v2Title}: {v2Label}
              </div>
            </>
          ) : (
            <>
              <div>
                {v2Title}: {v2Label}
              </div>
              <div>
                {v1Title}: {v1Label}
              </div>
            </>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer width={'100%'} height={150}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <XAxis
          tickLine={false}
          axisLine={{ stroke: '#f9faf9', strokeWidth: 2 }}
          tick={renderCustomizedTick(chartData)}
        />
        <Tooltip content={customTooltip} />
        <Line dataKey="v1" stroke="#ff8237" dot={false} activeDot={{ r: 8 }} />
        <Line dataKey="v2" stroke="#ff9835" dot={false} strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineReport;
