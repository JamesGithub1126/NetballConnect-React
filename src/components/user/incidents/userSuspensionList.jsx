import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Pagination } from 'antd';
import moment from 'moment';
import AppConstants from '../../../themes/appConstants';
import { SuspenedMatchStatusRefId } from 'enums/enums';
import { liveScoreGetSuspensionsAction } from '../../../store/actions/userAction/userAction';
import SuspensionModal from '../modal/suspensionModal';

const tableSort = (a, b, key) => {
  const stringA = JSON.stringify(a[key]);
  const stringB = JSON.stringify(b[key]);
  return stringA.localeCompare(stringB);
};

const UserSuspensionList = ({ userId }) => {
  const dispatch = useDispatch();
  const { suspensionApplyToList } = useSelector(state => state.CommonReducerState);
  const userState = useSelector(state => state.UserState);
  const [selectedSuspension, setSelectedSuspension] = useState(null);

  const handleSuspensionTableList = useCallback(
    page => {
      const filter = {
        userId,
        limit: 10,
        offset: page ? 10 * (page - 1) : 0,
      };
      dispatch(liveScoreGetSuspensionsAction(filter, suspensionApplyToList));
    },
    [dispatch, userId, suspensionApplyToList],
  );

  useEffect(() => {
    handleSuspensionTableList(1);
  }, []);

  const columnsSuspension = [
    {
      title: AppConstants.dateCreated,
      key: 'created_at',
      sorter: (a, b) => tableSort(a, b, 'created_at'),
      render: row => (
        <span
          onClick={() => setSelectedSuspension(row)}
          className="desc-text-style side-bar-profile-data theme-color pointer"
        >
          {row.created_at != null ? moment(row.created_at).format('DD/MM/YYYY') : ''}
        </span>
      ),
    },
    {
      title: AppConstants.competition,
      key: 'competition',
      render: record => <span>{record?.incident?.competition?.name || ''}</span>,
    },
    {
      title: AppConstants.suspension,
      key: 'suspension',
      render: record => {
        const value = record.suspendedMatches
          ? `${record.suspendedMatches} ${AppConstants.suspendedMatches}`
          : `${dateFormat(record.suspendedFrom)} ~ ${dateFormat(record.suspendedTo)}`;
        return <span>{value}</span>;
      },
    },
    {
      title: AppConstants.matchesServed,
      key: 'matchesServed',
      render: record => {
        const { suspendedMatches, suspendedMatchList } = record;
        if (suspendedMatches) {
          const matches = suspendedMatchList?.filter(
            i => i.servedStatusRefId === SuspenedMatchStatusRefId.ServedYes,
          );
          return <span>{matches ? matches.length : 0}</span>;
        } else {
          return <span>{AppConstants.noValue}</span>;
        }
      },
    },
    {
      title: AppConstants.matchesAllocatedStillServed,
      key: 'matchesAllocatedStillServed',
      render: record => {
        const { suspendedMatches, suspendedMatchList } = record;
        if (suspendedMatches) {
          const matches = suspendedMatchList?.filter(
            i => i.servedStatusRefId === SuspenedMatchStatusRefId.Pending,
          );
          return <span>{matches ? matches.length : 0}</span>;
        } else {
          return <span>{AppConstants.noValue}</span>;
        }
      },
    },
    {
      title: AppConstants.matchesAllocated,
      key: 'matchesAllocated',
      render: record => {
        const { suspendedMatches, suspendedMatchList } = record;
        if (suspendedMatches) {
          const suspended = suspendedMatchList ? suspendedMatchList.length : 0;
          return <span>{suspendedMatches - suspended}</span>;
        } else {
          return <span>{AppConstants.noValue}</span>;
        }
      },
    },
  ];

  const dateFormat = date => {
    return date ? moment(date).format('DD/MM/YYYY') : '';
  };

  return (
    <>
      <div className="comp-dash-table-view mt-2 default-bg">
        <div className="user-module-row-heading">{AppConstants.suspensions}</div>
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columnsSuspension}
            dataSource={userState.suspensionsData}
            pagination={false}
            loading={userState.suspensionsDataLoad}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination pb-3"
            current={userState.suspensionsCurrentPage}
            total={userState.suspensionsTotalCount}
            onChange={page => handleSuspensionTableList(page)}
            showSizeChanger={false}
          />
        </div>
      </div>
      {selectedSuspension && (
        <SuspensionModal
          suspension={selectedSuspension}
          showModal={!!selectedSuspension}
          setShowModal={() => setSelectedSuspension(null)}
        />
      )}
    </>
  );
};

export default UserSuspensionList;
