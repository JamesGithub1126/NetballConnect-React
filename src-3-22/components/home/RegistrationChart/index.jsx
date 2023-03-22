import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { sum } from 'lodash';
import moment from 'moment';
import ChartCard from '../../../customComponents/ChartCard';
import { Switch } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import {
    currencyFormat,
    formatNumbersSeparator,
} from '../../../util/formatNumbersSeparator';
import AppConstants from '../../../themes/appConstants';
import { useDispatch, useSelector } from 'react-redux';
import { getRegistrationWidgetsAction } from '../../../store/actions/commonAction/commonAction';
import TimeframeDropdown from '../../../customComponents/TimeframeDropdown';
import { LINE_CHART_DATE_RANGES } from '../../../themes/widgetsContants';

const RegistrationChart = ({ organisationId }) => {
  const dispatch = useDispatch();

  const registrationWidget = useSelector(state => state.CommonReducerState.registrationWidgets);
  const [timeframe, setTimeframe] = useState(LINE_CHART_DATE_RANGES.last_7_days.id);
  const [listType, setListType] = useState('totalValue');

  // Fetch registration widgets data on first page load && on timeframe change
  useEffect(() => {
    dispatch(getRegistrationWidgetsAction({ organisationId, timeframe }));
  }, [dispatch, timeframe]);

  // Optimization: useMemo to avoid unnecessary re-renderings of this content
  const getTimeView = useMemo(() => {
    const { description } = LINE_CHART_DATE_RANGES[timeframe];

    return (
      <TimeframeDropdown
        options={Object.values(LINE_CHART_DATE_RANGES)}
        onChange={e => setTimeframe(e.key)}
        value={description}
        optValueAlias="description"
      />
    );
  }, [timeframe]);

  const buildDataCollection = useCallback(() => {
    let chartDataCollection = [];
    const { thisPeriod, lastPeriod } = registrationWidget;
    const lastPeriodLength = thisPeriod[listType].length;

    thisPeriod[listType].forEach((totalValue, index) => {
      let lastPeriodTitle = '';
      let thisPeriodTitle = '';

      if (thisPeriod.hour) thisPeriodTitle = thisPeriod.hour[index] + ':00';
      if (thisPeriod.date) {
        const thisPeriodDate = thisPeriod.date[index];
        thisPeriodTitle = moment(thisPeriodDate).format(LINE_CHART_DATE_RANGES[timeframe].format);
      }

      if (lastPeriod.hour) lastPeriodTitle = lastPeriod.hour[index] + ':00';
      if (lastPeriod.date) {
        const lastPeriodDate = lastPeriod.date[index];
        lastPeriodTitle = moment(lastPeriodDate).format(LINE_CHART_DATE_RANGES[timeframe].format);
      }

      if (timeframe === LINE_CHART_DATE_RANGES.all_time.id && index === lastPeriodLength - 1) {
        lastPeriodTitle = AppConstants.today;
      }
      const v1 = totalValue ? totalValue : '0.00';
      const v2 = lastPeriod[listType][index] ? lastPeriod[listType][index] : '0.00';
      let v1Label = v1;
      let v2Label = v2;

      if (listType === 'totalCount') {
        v1Label = formatNumbersSeparator(v1);
        v2Label = formatNumbersSeparator(v2);
      } else if (listType === 'totalValue') {
        v1Label = currencyFormat(v1);
        v2Label = currencyFormat(v2);
      }

      chartDataCollection.push({
        v1Title: thisPeriodTitle,
        v2Title: lastPeriodTitle,
        v1Label,
        v2Label,
        v1: parseInt(v1),
        v2: parseInt(v2),
      });
    });

    return chartDataCollection;
  }, [registrationWidget, listType, timeframe]);

  const lastPeriodSummary = useCallback(
    period => {
      const decimalValues = sum(registrationWidget[period][listType].map(Number));

      return listType === 'totalValue'
        ? currencyFormat(decimalValues)
        : formatNumbersSeparator(decimalValues);
    },
    [registrationWidget, listType],
  );

  const getTrendOutline = useMemo(() => {
    const { changeTotalCount, changeTotalValue } = registrationWidget;

    if (
      (listType === 'totalValue' && changeTotalValue <= 0) ||
      (listType === 'totalCount' && changeTotalCount <= 0)
    ) {
      return <CaretDownOutlined style={{ color: '#c31515', fontSize: 18 }} />;
    }

    return <CaretUpOutlined style={{ color: '#50c315', fontSize: 18 }} />;
  }, [registrationWidget, listType]);

  const { changeTotalValue, changeTotalCount, loading } = registrationWidget;
  const { lastPeriodDescription } = LINE_CHART_DATE_RANGES[timeframe];

  return (
    <ChartCard
      data={buildDataCollection()}
      loading={loading}
      extra={getTimeView}
      hideChangeAndLastPeriod={timeframe === LINE_CHART_DATE_RANGES.all_time.id}
      toggle={
        <Switch
          checkedChildren="$"
          unCheckedChildren="#"
          defaultChecked
          onChange={val => {
            setListType(val ? 'totalValue' : 'totalCount');
          }}
        />
      }
      title={AppConstants.registration}
      trend={getTrendOutline}
      subvalue={{
        lvalue: lastPeriodSummary('lastPeriod'),
        ltitle: lastPeriodDescription,
        rvalue: listType === 'totalValue' ? changeTotalValue : changeTotalCount,
        rtitle: AppConstants.chartChangeTitle,
      }}
      mainValue={lastPeriodSummary('thisPeriod')}
    />
  );
};

export default RegistrationChart;
