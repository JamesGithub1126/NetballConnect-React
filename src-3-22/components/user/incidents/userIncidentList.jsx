import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Table, Pagination } from 'antd';
import AppConstants from '../../../themes/appConstants';
import { getUserModuleIncidentListAction } from '../../../store/actions/userAction/userAction';
import { liveScore_MatchFormate } from '../../../themes/dateformate';

const tableSort = (a, b, key) => {
  const stringA = JSON.stringify(a[key]);
  const stringB = JSON.stringify(b[key]);
  return stringA.localeCompare(stringB);
};

const UserIncidentList = ({ screenKey, ...props }) => {
  const dispatch = useDispatch();
  const userState = useSelector(state => state.UserState);
  const incidentData = userState.userIncidentData;
  const total = userState.incidentTotalCount;

  const handleIncidentTableList = useCallback(
    page => {
      const filter = {
        ...props,
        limit: 10,
        offset: page ? 10 * (page - 1) : 0,
      };
      dispatch(getUserModuleIncidentListAction(filter));
    },
    [dispatch, props],
  );

  useEffect(() => {
    handleIncidentTableList(1);
  }, []);

  const columnsIncident = [
    {
      title: AppConstants.date,
      dataIndex: 'incidentTime',
      key: 'incidentTime',
      sorter: (a, b) => tableSort(a, b, 'incidentTime'),
      render: incidentTime => <span>{liveScore_MatchFormate(incidentTime)}</span>,
    },
    {
      title: AppConstants.tableMatchID,
      dataIndex: 'matchId',
      key: 'matchId',
      sorter: (a, b) => tableSort(a, b, 'matchId'),
    },
    {
      title: AppConstants.playerId,
      dataIndex: 'playerId',
      key: 'incident Players',
      sorter: (a, b) => tableSort(a, b, 'playerId'),
    },
    {
      title: AppConstants.firstName,
      dataIndex: 'firstName',
      key: 'Incident Players First Name',
      sorter: (a, b) => tableSort(a, b, 'firstName'),
    },
    {
      title: AppConstants.lastName,
      dataIndex: 'lastName',
      key: 'Incident Players Last Name',
      sorter: (a, b) => tableSort(a, b, 'lastName'),
    },
    {
      title: AppConstants.team,
      dataIndex: 'teamName',
      key: 'teamName',
      sorter: (a, b) => tableSort(a, b, 'teamName'),
      render: (teamName, record) => (
        <>
          {record.teamDeletedAt ? (
            <span className="desc-text-style side-bar-profile-data">{teamName}</span>
          ) : (
            <NavLink
              to={{
                pathname: '/matchDayTeamView',
                state: {
                  tableRecord: record,
                  screenName: 'userPersonal',
                  screenKey,
                },
              }}
            >
              <span className="desc-text-style side-bar-profile-data theme-color pointer">
                {teamName}
              </span>
            </NavLink>
          )}
        </>
      ),
    },
    {
      title: AppConstants.type,
      dataIndex: 'incidentTypeName',
      key: 'incidentTypeName',
      sorter: (a, b) => a.incidentTypeName.localeCompare(b.incidentTypeName),
    },
  ];

  return (
    <div className="comp-dash-table-view mt-2 default-bg">
      <div className="user-module-row-heading">{AppConstants.incidents}</div>
      <div className="table-responsive home-dash-table-view">
        <Table
          className="home-dashboard-table"
          columns={columnsIncident}
          dataSource={incidentData}
          pagination={false}
          loading={userState.incidentDataLoad}
        />
      </div>
      <div className="d-flex justify-content-end">
        <Pagination
          className="antd-pagination pb-3"
          current={userState.incidentCurrentPage}
          total={total}
          onChange={page => handleIncidentTableList(page)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default UserIncidentList;
