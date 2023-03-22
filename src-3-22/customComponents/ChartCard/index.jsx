import React from 'react';
import LineReport from './lineReport';
import './index.css';
import { Spin } from 'antd';

const ChartCard = props => {
  const { extra, toggle, title, trend, subvalue = {}, mainValue, data, loading, hideChangeAndLastPeriod } = props;
  const { lvalue, ltitle, rvalue, rtitle } = subvalue;

    return (
    <>
      <div className="chart-card">
        <div className="chart-head">
          <div>{title}</div>
          <div>{extra}</div>
        </div>
        <div className="chart-body">
          <div className="chart-main-value">
            <div>{mainValue}</div>
            <div>{toggle}</div>
          </div>
            {!hideChangeAndLastPeriod ? (
                <div className="chart-sub-body">
                    <div>
                        {ltitle}: <span className="chart-sub-value">{lvalue}</span>
                    </div>
                    <div>
                        {rtitle}: <span className="chart-sub-value">&nbsp;{rvalue}%</span>
                        <span className="trend">{trend}</span>{' '}
                    </div>
                </div>
            ): null}
          <div className="chart-area">
            {loading ? (
              <div className="chart-card-spinner-wrapper">
                <Spin size="default" />
              </div>
            ) : (
              <LineReport chartData={data} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChartCard;
