import React, { useState } from 'react';
import { Modal, Table } from 'antd';
import AppConstants from '../../themes/appConstants';
import './removePostponeWarningModal.css';
import moment from 'moment';
const columns = [
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'id',
    key: 'id',
    render: (id, _) => <span>{id}</span>,
  },
  {
    title: AppConstants.home,
    dataIndex: 'id',
    key: 'id',
    render: (_, record) => <span>{record?.team1?.name}</span>,
  },
  {
    title: AppConstants.away,
    dataIndex: 'id',
    key: 'id',
    render: (_, record) => <span>{record?.team2?.name}</span>,
  },
  {
    title: AppConstants.round,
    dataIndex: 'id',
    key: 'id',
    render: (_, record) => <span>{record?.round?.name}</span>,
  },
  {
    title: AppConstants.division,
    dataIndex: 'id',
    key: 'id',
    render: (_, record) => <span>{record?.division?.name}</span>,
  },
];

const SINGLE_MATCH_VIEW_WIDTH = 512;
const MULTI_MATCH_VIEW_WIDTH = 1024;

export const RemovePostponeWarningModal = React.memo(
  ({ visible, onOk, onCancel, matches, type }) => {
    const [selection, setSelection] = useState({
      selectedRowKeys: [],
      selectedMatches: [],
    });

    const sortedMatches = [...matches].sort((a, b) => {
      return moment(a.startTime) - moment(b.startTime); //asc
    });
    const isMultiMatchView = type === 'multiple';

    const updateSelection = (selectedRowKeys, selectedRows) => {
      setSelection({
        selectedRowKeys: selectedRowKeys,
        selectedMatches: selectedRows,
      });
    };
    const rowSelection = {
      selectionType: 'checkbox',
      selectedRowKeys: selection.selectedRowKeys,
      onSelectAll: updateSelection,
      onChange: updateSelection,
      getCheckboxProps: record => ({
        name: record.id,
      }),
    };
    const multiMatchView = (
      <>
        <span className="pb-4">{AppConstants.removePostponeWarningModalDescription}</span>
        <br />
        <Table
          size="small"
          className="popup-table mb-5"
          columns={columns}
          dataSource={sortedMatches}
          scroll={{
            y: 500,
          }}
          pagination={false}
          rowSelection={{ ...rowSelection }}
          rowKey={record => record.id + ''}
        />
      </>
    );

    const singleMatchView = <span>{AppConstants.removePostponeWarningModalDescription}</span>;

    const cancel = () => {
      setSelection({
        selectedRowKeys: [],
        selectedMatches: [],
      });
      onCancel([]);
    };
    const confirm = () => {
      matches = [...selection.selectedMatches];
      setSelection({
        selectedRowKeys: [],
        selectedMatches: [],
      });
      onOk(matches);
    };
    return (
      <Modal
        title={AppConstants.removePostponeWarning}
        visible={visible}
        onOk={confirm}
        okText={isMultiMatchView ? AppConstants.confirm : AppConstants.yes}
        cancelText={isMultiMatchView ? AppConstants.cancel : AppConstants.no}
        cancelButtonProps={{ onClick: cancel }}
        closable={false}
        width={isMultiMatchView ? MULTI_MATCH_VIEW_WIDTH : SINGLE_MATCH_VIEW_WIDTH}
      >
        {isMultiMatchView ? multiMatchView : singleMatchView}
      </Modal>
    );
  },
);
