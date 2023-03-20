import React, { useState, useEffect, useMemo } from 'react';
import { Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import AppConstants from 'themes/appConstants';
import MultiDataCard from 'customComponents/MultiDataCard';
import { useSelector, useDispatch } from 'react-redux';
import { getRevenueWidgetsAction } from '../../store/actions/commonAction/commonAction';
import { REVENUE_DATE_RANGES } from '../../themes/widgetsContants';

const RevenueBox = ({ organisationId }) => {
  const dispatch = useDispatch();

  const revenueWidgets = useSelector(state => state.CommonReducerState.revenueWidgets);
  const [timeframe, setTimeframe] = useState('last_7_days');

  // Fetch revenue widgets data on first page load && on timeframe change
  useEffect(() => {
    dispatch(getRevenueWidgetsAction({ organisationId, timeframe }));
  }, [dispatch, timeframe]);

  // Optimization: useMemo to avoid unnecessary re-renderings of this content
  const getTitleView = useMemo(() => {
    const { description } = REVENUE_DATE_RANGES[timeframe];

    return (
      <>
        {AppConstants.revenue}:&nbsp;&nbsp;
        <span>
          <Dropdown
            trigger={['hover']}
            overlay={
              <Menu onClick={e => setTimeframe(e.key)}>
                {Object.values(REVENUE_DATE_RANGES).map(date => (
                  <Menu.Item key={date.id}>{date.description}</Menu.Item>
                ))}
              </Menu>
            }
          >
            <a className="ant-dropdown-link">
              {' '}
              {description}
              <DownOutlined />
            </a>
          </Dropdown>
        </span>
      </>
    );
  }, [timeframe]);

  let { totalPaid, lastPeriod, thisPeriod, loading } = revenueWidgets;
  let { lastPeriodDescription, thisPeriodDescription } = REVENUE_DATE_RANGES[timeframe];
  let showValues = true;

  // If selected all_time filter - put non-values
  if (timeframe === REVENUE_DATE_RANGES.all_time.id) {
    lastPeriodDescription = '--';
    thisPeriodDescription = '--';
    lastPeriod = '';
    thisPeriod = '';
    showValues = false;
  }

  return (
    <div>
      <MultiDataCard
        api="getActionBoxCount"
        loading={loading}
        payload={{}}
        title={getTitleView}
        leftMeasure={{ value: lastPeriod, title: lastPeriodDescription, prefix: '$' }}
        rightMeasure={{ value: thisPeriod, title: thisPeriodDescription, prefix: '$' }}
        mainValue={{ value: totalPaid, prefix: '$' }}
        showValues={showValues}
      />
    </div>
  );
};

export default RevenueBox;
