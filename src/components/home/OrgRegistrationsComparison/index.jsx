import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './organisationsList.css';
import { Spin, Switch } from 'antd';
import { LINE_CHART_DATE_RANGES } from '../../../themes/widgetsContants';
import TimeframeDropdown from '../../../customComponents/TimeframeDropdown';
import {
  exportOrganisationChangesAction,
  getRegistrationsGrowthWidgetsAction,
} from '../../../store/actions/commonAction/commonAction';
import { useDispatch, useSelector } from 'react-redux';
import OrganisationGrowthList from './organisationsList';
import AppConstants from '../../../themes/appConstants';

const OrganisationComparison = ({ organisationId, organisationUniqueKey }) => {
  const dispatch = useDispatch();

  const organisationGrowthData = useSelector(
    state => state.CommonReducerState.organisationGrowthWidgets.data,
  );
  const loading = useSelector(state => state.CommonReducerState.organisationGrowthWidgets.loading);

  const [type, setType] = useState('changeTotalValue');
  const [timeframe, setTimeframe] = useState(LINE_CHART_DATE_RANGES.last_7_days.id);

  // Fetch organisation growth widgets data on first page load && on timeframe change
  useEffect(() => {
    dispatch(
      getRegistrationsGrowthWidgetsAction({ organisationId, organisationUniqueKey, timeframe }),
    );
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
      const items = organisationsList.map(org => {
          const changeLabel = type === 'changeTotalValue' ? 'Total Value' : 'Total Count';
          const changeValue = org[type];
          return {
              'Organisation ID': org.organisationId,
              'Organisation Name': org.organisationName,
              [changeLabel]: changeValue
          }
      });

      dispatch(
        exportOrganisationChangesAction(
          {
            items,
          },
          'orgRegistrationsChanges',
        ),
      );
    },
    [dispatch, type],
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
            <div>{AppConstants.registrationsTop5}</div>
            <div>
              <Switch
                checkedChildren="$"
                unCheckedChildren="#"
                defaultChecked
                onChange={val => {
                  setType(val ? 'changeTotalValue' : 'changeTotalCount');
                }}
              />
            </div>
          </div>
          <div className="chart-area">
            {loading ? (
              <div className="chart-card-spinner-wrapper">
                <Spin size="default" />
              </div>
            ) : (
              <OrganisationGrowthList
                organisationsList={organisationGrowthData}
                toggleType={type}
                handleExportOrganisationList={handleDownloadOrgChanges}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganisationComparison;
