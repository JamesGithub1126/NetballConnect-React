import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LINE_CHART_DATE_RANGES } from '../../../themes/widgetsContants';
import {
  exportOrganisationChangesAction,
  getRevenueGrowthWidgetsAction,
} from '../../../store/actions/commonAction/commonAction';
import TimeframeDropdown from '../../../customComponents/TimeframeDropdown';
import AppConstants from '../../../themes/appConstants';
import { Spin } from 'antd';
import OrganisationGrowthList from '../OrgRegistrationsComparison/organisationsList';

const OrgRevenueComparison = ({ organisationId, organisationUniqueKey }) => {
  const dispatch = useDispatch();

  const organisationGrowthData = useSelector(
    state => state.CommonReducerState.revenueGrowthWidgets.data,
  );
  const loading = useSelector(state => state.CommonReducerState.revenueGrowthWidgets.loading);

  const [timeframe, setTimeframe] = useState(LINE_CHART_DATE_RANGES.last_7_days.id);

  // Fetch organisation growth widgets data on first page load && on timeframe change
  useEffect(() => {
    dispatch(getRevenueGrowthWidgetsAction({ organisationId, organisationUniqueKey, timeframe }));
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

  const handleDownloadOrgChanges = useCallback(
    organisationsList => {
      const items = organisationsList.map(org => ({
        'Organisation ID': org.organisationId,
        'Organisation Name': org.organisationName,
        'Total Paid': org.changeTotalPaid,
      }));

      dispatch(
        exportOrganisationChangesAction(
          {
            items,
          },
          'orgRevenueChanges',
        ),
      );
    },
    [dispatch],
  );

  return (
    <>
      <div className="chart-card">
        <div className="chart-head">
          <div>{AppConstants.organisationChange}</div>
          <div>{getTimeView}</div>
        </div>
        <div className="chart-body">
          <div className="org-growth-name-label">
            <div>{AppConstants.revenueTop5}</div>
          </div>
          <div className="chart-area">
            {loading ? (
              <div className="chart-card-spinner-wrapper">
                <Spin size="default" />
              </div>
            ) : (
              <OrganisationGrowthList
                organisationsList={organisationGrowthData}
                toggleType="changeTotalPaid"
                handleExportOrganisationList={handleDownloadOrgChanges}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrgRevenueComparison;
