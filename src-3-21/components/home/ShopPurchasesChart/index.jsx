import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { sum } from 'lodash';
import moment from 'moment';
import ChartCard from '../../../customComponents/ChartCard';
import { Switch } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import { formatNumbersSeparator, currencyFormat } from '../../../util/formatNumbersSeparator';
import AppConstants from '../../../themes/appConstants';
import { useDispatch, useSelector } from 'react-redux';
import { getShopPurchasesWidgetsAction } from '../../../store/actions/commonAction/commonAction';
import TimeframeDropdown from '../../../customComponents/TimeframeDropdown';
import { LINE_CHART_DATE_RANGES } from '../../../themes/widgetsContants';

const ShopPurchasesChart = ({ organisationId }) => {
  const dispatch = useDispatch();

  const shopPurchasesWidget = useSelector(state => state.CommonReducerState.shopPurchasesWidgets);
  const [timeframe, setTimeframe] = useState(LINE_CHART_DATE_RANGES.last_7_days.id);
  const [listType, setListType] = useState('totalSPValue');

  // Fetch shop purchases widgets data on first page load && on timeframe change
  useEffect(() => {
    dispatch(getShopPurchasesWidgetsAction({ organisationId, timeframe }));
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
    const { thisPeriod, lastPeriod } = shopPurchasesWidget;
    const lastPeriodLength = thisPeriod[listType].length;

    thisPeriod[listType].forEach((value, index) => {
      let lastPeriodTitle = '';
      let thisPeriodTitle = '';

      if (thisPeriod.hour) thisPeriodTitle = thisPeriod.hour[index] + ':00';
      if (thisPeriod.date)
        thisPeriodTitle = moment(thisPeriod.date[index]).format(
          LINE_CHART_DATE_RANGES[timeframe].format,
        );

      if (lastPeriod.hour) lastPeriodTitle = lastPeriod.hour[index] + ':00';
      if (lastPeriod.date)
        lastPeriodTitle = moment(lastPeriod.date[index]).format(
          LINE_CHART_DATE_RANGES[timeframe].format,
        );

      if (timeframe === LINE_CHART_DATE_RANGES.all_time.id && index === lastPeriodLength - 1) {
        lastPeriodTitle = lastPeriodTitle = AppConstants.today;
      }

      const v1 = value ? value : '0.00';
      const v2 = lastPeriod[listType][index] ? lastPeriod[listType][index] : '0.00';
      let v1Label = v1;
      let v2Label = v2;

      if (listType === 'totalCount') {
        v1Label = formatNumbersSeparator(v1);
        v2Label = formatNumbersSeparator(v2);
      } else if (listType === 'totalSPValue') {
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
  }, [shopPurchasesWidget, listType, timeframe]);

  const lastPeriodSummary = useCallback(
    period => {
      const decimalValues = sum(shopPurchasesWidget[period][listType].map(Number));

      return listType === 'totalSPValue'
        ? currencyFormat(decimalValues)
        : formatNumbersSeparator(decimalValues);
    },
    [shopPurchasesWidget, listType],
  );

  const getTrendOutline = useMemo(() => {
    const { changeTotalCount, changeTotalValue } = shopPurchasesWidget;

    if (
      (listType === 'totalSPValue' && changeTotalValue <= 0) ||
      (listType === 'totalCount' && changeTotalCount <= 0)
    ) {
      return <CaretDownOutlined style={{ color: '#c31515', fontSize: 18 }} />;
    }

    return <CaretUpOutlined style={{ color: '#50c315', fontSize: 18 }} />;
  }, [shopPurchasesWidget, listType]);

  const { changeTotalCount, changeTotalValue, loading } = shopPurchasesWidget;
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
            setListType(val ? 'totalSPValue' : 'totalCount');
          }}
        />
      }
      title={AppConstants.shopPurchases}
      trend={getTrendOutline}
      subvalue={{
        lvalue: lastPeriodSummary('lastPeriod'),
        ltitle: lastPeriodDescription,
        rvalue: listType === 'totalSPValue' ? changeTotalValue : changeTotalCount,
        rtitle: AppConstants.chartChangeTitle,
      }}
      mainValue={lastPeriodSummary('thisPeriod')}
    />
  );
};

export default ShopPurchasesChart;
