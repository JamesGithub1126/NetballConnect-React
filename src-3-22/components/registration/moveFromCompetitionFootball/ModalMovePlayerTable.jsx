import { Table } from 'antd';
import React from 'react';
import ModalSpan from './ModalSpan';

const ModalMovePlayerTable = ({ playersData }) => {
  const cols = [
    {
      title: 'FA ID',
      dataIndex: 'registrationId',
    },
    {
      title: 'First Name',
      dataIndex: 'firstName',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
    },
    {
      title: 'Member Type',
      dataIndex: 'membershipType',
    },
  ];

  return (
    <div className="p-4">
      <ModalSpan className={'mb-3'}>You are about to move the following members : </ModalSpan>
      <Table columns={cols} dataSource={playersData} size="small" />
    </div>
  );
};

export default ModalMovePlayerTable;
