import AppConstants from '../../../../../../themes/appConstants';
import moment from 'moment';
import { Pagination, Table } from 'antd';
import React from 'react';

const WebsitePageContentList = ({
  data,
  editPage,
  loading,
  handlePageChange,
  pagination,
}) => {
  const handleEditPage = webPageId => {
    if (editPage) editPage(webPageId);
  };

  const getColumns = () => {
    return [
      {
        title: AppConstants.title,
        dataIndex: 'title',
        key: 'title',
        defaultSortOrder: 'ascend',
        sorter: (a, b) => a.title.localeCompare(b.title),
        render: (title, record) => (
          <a onClick={() => handleEditPage(record.id)}>
            <span className="input-heading-add-another pt-0">{title}</span>
          </a>
        ),
      },
      {
        title: AppConstants.status,
        dataIndex: 'publishedAt',
        key: 'publishedAt',
        render: publishedAt => (
          <div>{publishedAt ? AppConstants.published : AppConstants.draft}</div>
        ),
      },
      {
        title: AppConstants.date,
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        render: date => <div>{date != null ? moment(date).format('DD/MM/YYYY') : ''}</div>,
      },
    ];
  };

  return (
    <div className="comp-dash-table-view  mt-4 pb-5">
      <div className="table-responsive home-dash-table-view">
        <Table
          className="home-dashboard-table"
          columns={getColumns()}
          rowKey={record => record.id}
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
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default WebsitePageContentList;
