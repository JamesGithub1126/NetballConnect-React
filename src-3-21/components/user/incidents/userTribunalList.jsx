import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Pagination } from 'antd';
import moment from 'moment';
import AppConstants from '../../../themes/appConstants';
import { liveScoreGetTribunalsAction } from '../../../store/actions/userAction/userAction';
import TribunalModal from '../modal/tribunalModal';

const tableSort = (a, b, key) => {
  const stringA = JSON.stringify(a[key]);
  const stringB = JSON.stringify(b[key]);
  return stringA.localeCompare(stringB);
};

const UserTribunalList = ({ userId }) => {
  const dispatch = useDispatch();
  const { penaltyTypeList } = useSelector(state => state.CommonReducerState);
  const userState = useSelector(state => state.UserState);
  const { tribunalsData } = userState;
  const [selectedTribunal, setSelectedTribunal] = useState(null);

  const findPenaltyName = useCallback(
    refId => {
      return penaltyTypeList?.find(it => it.id === refId)?.description;
    },
    [penaltyTypeList],
  );

  const updatedTribunals = useMemo(() => {
    return tribunalsData.map(item => {
      return {
        ...item,
        outcome1: findPenaltyName(item.penaltyTypeRefId),
        outcome2: findPenaltyName(item.penalty2TypeRefId),
        suspendedPenalty: findPenaltyName(item.suspendedPenaltyTypeRefId),
      };
    });
  }, [tribunalsData, findPenaltyName]);

  const handleTribunalsTableList = useCallback(
    page => {
      const filter = {
        userId,
        limit: 10,
        offset: page ? 10 * (page - 1) : 0,
      };
      dispatch(liveScoreGetTribunalsAction(filter, penaltyTypeList));
    },
    [dispatch, userId, penaltyTypeList],
  );

  useEffect(() => {
    handleTribunalsTableList(1);
  }, []);

  const columnsTribunal = [
    {
      title: AppConstants.tribunalHearingDate,
      key: 'hearingDate',
      sorter: (a, b) => tableSort(a, b, 'hearingDate'),
      render: row => (
        <span
          onClick={() => setSelectedTribunal(row)}
          className="desc-text-style side-bar-profile-data theme-color pointer"
        >
          {row.hearingDate != null ? moment(row.hearingDate).format('DD/MM/YYYY') : ''}
        </span>
      ),
    },
    {
      title: `${AppConstants.tribunalOutcome} #1`,
      dataIndex: 'outcome1',
      key: 'outcome1',
      sorter: (a, b) => tableSort(a, b, 'outcome1'),
    },
    {
      title: `${AppConstants.tribunalOutcome} #2`,
      dataIndex: 'outcome2',
      key: 'outcome2',
      sorter: (a, b) => tableSort(a, b, 'outcome2'),
    },
    {
      title: AppConstants.suspendedPenalty,
      dataIndex: 'suspendedPenalty',
      key: 'suspendedPenalty',
      sorter: (a, b) => tableSort(a, b, 'suspendedPenalty'),
    },
  ];

  return (
    <>
      <div className="comp-dash-table-view mt-2 default-bg">
        <div className="user-module-row-heading">{AppConstants.tribunals}</div>
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columnsTribunal}
            dataSource={updatedTribunals}
            pagination={false}
            loading={userState.tribunalsDataLoad}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination pb-3"
            current={userState.tribunalsCurrentPage}
            total={userState.tribunalsTotalCount}
            onChange={page => handleTribunalsTableList(page)}
            showSizeChanger={false}
          />
        </div>
      </div>
      {!!selectedTribunal && (
        <TribunalModal
          tribunal={selectedTribunal}
          showModal={!!selectedTribunal}
          setShowModal={() => setSelectedTribunal(null)}
        />
      )}
    </>
  );
};

export default UserTribunalList;
