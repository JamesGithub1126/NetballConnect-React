import React from 'react';
import { Pagination, Table } from 'antd';
import AppConstants from '../../../../../../themes/appConstants';

const MenuListContent = ({
  data,
  editMenuItem,
  loading,
  handlePageChange,
  pagination,
}) => {
  const getColumns = () => {
    return [
      {
        title: AppConstants.name,
        dataIndex: 'name',
        key: 'name',
        defaultSortOrder: 'ascend',
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (title, record) => (
          <a onClick={() => editMenuItem(record.id)}>
            <span className="input-heading-add-another pt-0">{title}</span>
          </a>
        ),
      },
      {
        title: AppConstants.page,
        dataIndex: 'page',
        key: 'page',
        sorter: (a, b) => {
            const aWebPage = a.web_page.data;
            const bWebPage = b.web_page.data;
            let aLabel = '';
            let bLabel = '';

            if (aWebPage && aWebPage.attributes) aLabel = aWebPage.attributes.title
            if (bWebPage && bWebPage.attributes) bLabel = bWebPage.attributes.title

            return aLabel.localeCompare(bLabel)
        },
      },
      {
        title: AppConstants.parentMenu,
        dataIndex: 'parentMenu',
        key: 'parentMenu',
        sorter: (a, b) => {
            const aParentMenu = a.parent_menu ? a.parent_menu.data : false;
            const bParentMenu = b.parent_menu ? b.parent_menu.data : false;
            let aLabel = '';
            let bLabel = '';

            if (aParentMenu && aParentMenu.attributes) aLabel = aParentMenu.attributes.name
            if (bParentMenu && bParentMenu.attributes) bLabel = bParentMenu.attributes.name

            return aLabel.localeCompare(bLabel)
        },
      },
      {
        title: AppConstants.status,
        dataIndex: 'publishedAt',
        key: 'publishedAt',
        render: publishedAt => (
          <div>{publishedAt ? AppConstants.published : AppConstants.draft}</div>
        ),
      },
    ];
  };

  return (
    <div className="fluid-width page-list mt-10">
      <div className="comp-dash-table-view">
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
            className="antd-pagination pb-3"
            showSizeChanger={pagination.total > 10}
            current={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default MenuListContent;
