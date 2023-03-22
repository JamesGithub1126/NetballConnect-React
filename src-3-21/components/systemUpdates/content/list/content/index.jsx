import React from 'react';
import { Pagination, Table } from 'antd';
import AppConstants from '../../../../../themes/appConstants';
import moment from 'moment';

const SystemUpdatesListContent = ({ data, pagination, handlePageChange, loading }) => {
  const getColumns = () => {
    return [
      {
        title: AppConstants.date,
        dataIndex: 'publishedAt',
        key: 'publishedAt',
        render: date => <div>{date != null ? moment(date).format('DD/MM/YYYY hh:mm') : ''}</div>,
      },
      {
        title: 'Update Details',
        dataIndex: 'page_details',
        key: 'page_details',
        render: body => <span className="pt-0" dangerouslySetInnerHTML={{__html: body}} />,
      },
      {
        title: AppConstants.helpAndSupport,
        dataIndex: 'title',
        key: 'title',
        render: title => <div>{title}</div>,
      },
    ];
  };

  return (
    <div className="comp-dash-table-view  mt-4 pb-5">
      <div className="table-responsive home-dash-table-view">
        <Table
          className="home-dashboard-table"
          columns={getColumns()}
          rowKey={record => record.date}
          dataSource={data}
          pagination={false}
          loading={loading}
        />
      </div>
      <div className="d-flex justify-content-end">
        <Pagination
          showSizeChanger={pagination.total > 10}
          className="antd-pagination"
          current={pagination.page}
          defaultCurrent={pagination.page}
          defaultPageSize={pagination.pageSize}
          total={pagination.total}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default SystemUpdatesListContent;
