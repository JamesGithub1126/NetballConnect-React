import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Modal } from 'antd';
import AppConstants from '../../themes/appConstants';
import {
  getMergedUserListAction,
  resetMergedUserListAction,
  undeleteUserAction,
} from '../../store/actions/userAction/userAction';

const defaultColumns = [
  {
    title: AppConstants.id,
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: AppConstants.name,
    dataIndex: 'name',
    key: 'name',
    render: (name, record) => {
      return <span>{`${record.firstName} ${record.lastName}`}</span>;
    },
  },
  {
    title: AppConstants.email,
    dataIndex: 'email',
    key: 'email',
  },
];

const MergedUserListModal = ({ userId, onCancel }) => {
  const dispatch = useDispatch();
  const [undeleted, setUndeleted] = useState(false);
  const userState = useSelector(state => state.UserState);
  const mergedUserList = userState.mergedUserList;

  useEffect(() => {
    dispatch(getMergedUserListAction(userId));
    return () => {
      dispatch(resetMergedUserListAction(userId));
    }
  }, [userId]);

  const columns = useMemo(() => {
    const undeleteColumn = {
      title: AppConstants.action,
      dataIndex: 'undelete',
      key: 'undelete',
      render: (item, record) => (
        <a>
          <span
            onClick={(e) => handleUndeleteUsers(e, record)}
            className="orange-action-txt"
          >
            {AppConstants.undelete}
          </span>
        </a>
      )
    }
    return [...defaultColumns, undeleteColumn]
  }, [defaultColumns]);

  const handleUndeleteUsers = (e, record) => {
    e.preventDefault();
    setUndeleted(true);
    dispatch(undeleteUserAction(userId, record.id))
  }

  return (
    <Modal
      title={AppConstants.undeleteMergedUser}
      visible={true}
      okText={AppConstants.done}
      onCancel={() => onCancel(undeleted)}
      onOk={() => onCancel(undeleted)}
      width={1000}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <Table
        className="home-dashboard-table"
        columns={columns}
        dataSource={mergedUserList}
        pagination={false}
        loading={userState.onLoadMergedUsers || userState.onLoadUndeleteUsers}
        locale={{ emptyText: AppConstants.noUsersToUndelete }}
      />
    </Modal>
  );
};

export default MergedUserListModal;
