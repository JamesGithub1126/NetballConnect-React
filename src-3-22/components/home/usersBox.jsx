import React, { useEffect, useMemo, useState } from 'react';
import AppConstants from 'themes/appConstants';
import MultiDataCard from 'customComponents/MultiDataCard';
import { useDispatch, useSelector } from 'react-redux';
import TimeframeDropdown from '../../customComponents/TimeframeDropdown';
import { getUserWidgetsAction } from '../../store/actions/commonAction/commonAction';
import { getGlobalYear } from '../../util/sessionStorage';

const CURRENT_YEAR = 4;

const UsersBox = ({ organisationId }) => {
  const dispatch = useDispatch();
  const globalYearRefId = getGlobalYear();

  const userWidgets = useSelector(state => state.CommonReducerState.userWidgets);
  const yearList = useSelector(state => state.AppState.yearList);
  const [yearRefId, setYear] = useState(globalYearRefId || CURRENT_YEAR);

  // Fetch shop purchases widgets data on first page load && on timeframe change
  useEffect(() => {
    dispatch(getUserWidgetsAction({ organisationId, yearRefId }));
  }, [dispatch, yearRefId, organisationId]);

  // Optimization: useMemo to avoid unnecessary re-renderings of this content
  const getTitleView = useMemo(() => {
    let value = AppConstants.yearTitle;
    const selectedYear = yearList.find(y => y.id === parseInt(yearRefId));

    if (selectedYear && selectedYear.name) {
      value = selectedYear.name;
    }

    return (
      <>
        {AppConstants.users}:&nbsp;&nbsp;
        <TimeframeDropdown
          options={yearList}
          onChange={e => setYear(e.key)}
          value={value}
          optValueAlias="name"
        />
      </>
    );
  }, [yearRefId, yearList]);

  return (
    <div>
      <MultiDataCard
        api="getActionBoxCount"
        payload={{}}
        title={getTitleView}
        loading={userWidgets.loading}
        leftMeasure={{
          value: userWidgets.registeredUsers,
          title: AppConstants.userWidgetRegisteredTitle,
        }}
        rightMeasure={{
          value: userWidgets.nonRegisteredUsers,
          title: AppConstants.userWidgetNonRegisteredTitle,
        }}
        mainValue={{ value: userWidgets.totalCount }}
      />
    </div>
  );
};

export default UsersBox;
