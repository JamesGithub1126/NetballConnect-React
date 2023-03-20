import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Pagination } from 'antd';
import moment from 'moment';
import AppConstants from '../../../themes/appConstants';
import { getUserModuleSuspendedMatchesAction } from '../../../store/actions/userAction/userAction';

const UserSuspendedMatches = (props) => {
  const dispatch = useDispatch();
  const userState = useSelector(state => state.UserState);
  const {
    suspendedMatchesDataLoad,
    suspendedMatchesData,
    suspendedMatchesCurrentPage,
    suspendedMatchesTotalCount,
  } = userState;
  const [loaded, setLoaded] = useState(false);

  const handleSuspendedMatchesTableList = useCallback(
    page => {
      const filter = {
        ...props,
        limit: 10,
        offset: page ? 10 * (page - 1) : 0,
      };
      dispatch(getUserModuleSuspendedMatchesAction(filter));
    },
    [dispatch, props],
  );

  useEffect(() => {
    if (!loaded) {
      setLoaded(true);
      handleSuspendedMatchesTableList(1);
    }
  }, [dispatch, loaded, handleSuspendedMatchesTableList]);

  const columnsSuspendedMatches = [
    {
      title: AppConstants.tableMatchID,
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: AppConstants.date,
      dataIndex: 'startTime',
      key: 'startTime',
      render: startTime => (
        <div>{startTime != null ? moment(startTime).format('DD/MM/YYYY') : ''}</div>
      ),
    },
    {
      title: AppConstants.home,
      dataIndex: 'team1',
      key: 'team1',
      render: team1 => <span>{team1?.name}</span>,
    },
    {
      title: AppConstants.away,
      dataIndex: 'team2',
      key: 'team2',
      render: team2 => <span>{team2?.name}</span>,
    },
    {
      title: AppConstants.status,
      dataIndex: 'matchStatus',
      key: 'matchStatus',
    },
    {
      title: AppConstants.competition,
      dataIndex: 'competition',
      key: 'competition',
      render: competition => <span>{competition?.name}</span>,
    },
    {
      title: AppConstants.affiliate,
      dataIndex: 'competition',
      key: 'competition',
      render: competition => <span>{competition?.organisation?.name}</span>,
    },
  ];

  return (
    <>
      {suspendedMatchesData.length > 0 && (
        <div className="comp-dash-table-view mt-2 default-bg">
          <div className="user-module-row-heading">{AppConstants.matchesSuspendedFrom}</div>
          <div className="table-responsive home-dash-table-view">
            <Table
              className="home-dashboard-table"
              columns={columnsSuspendedMatches}
              dataSource={suspendedMatchesData}
              pagination={false}
              loading={suspendedMatchesDataLoad}
            />
          </div>
          <div className="d-flex justify-content-end">
            <Pagination
              className="antd-pagination pb-3"
              current={suspendedMatchesCurrentPage}
              total={suspendedMatchesTotalCount}
              onChange={page => handleSuspendedMatchesTableList(page)}
              showSizeChanger={false}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default UserSuspendedMatches;
