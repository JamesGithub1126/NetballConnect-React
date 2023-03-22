import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Breadcrumb, Table, Pagination, Tooltip, List } from 'antd';
import moment from 'moment';
import AppConstants from '../../../themes/appConstants';
import DashboardLayout from '../../../pages/dashboardLayout';
import InnerHorizontalMenu from '../../../pages/innerHorizontalMenu';
import Loader from '../../../customComponents/loader';
import './submissions.css';
import {
  initRegistrationFormSubmissionsAction,
  getRegistrationFormSubmissionsAction,
} from '../../../store/actions/userAction/userAction';
import SearchView from './searchView'

const { Content } = Layout;

const columns = [
  {
    title: AppConstants.date,
    dataIndex: 'createdOn',
    key: 'createdOn',
    render: createdOn => (
      <span className="inbox-time-text">{moment(createdOn).format('DD/MM/YYYY')}</span>
    ),
  },
  {
    title: AppConstants.user,
    dataIndex: 'user',
    key: 'user',
    render: (col, record) => (
      <div>
        <div>User ID: {record.userId}</div>
        <div>{record.firstName} {record.lastName}</div>
        <div>{record.mobileNumber}</div>
        <div>{record.email}</div>
      </div>
    )
  },
  {
    title: AppConstants.receiptNo,
    dataIndex: 'receiptId',
    key: 'receiptId',
  },
  {
    title: AppConstants.paymentGateway,
    dataIndex: 'paymentType',
    key: 'paymentType',
    render: (col, record) => {
      let status = record.status? record.status : record.paymentStatus;
      if (status) {
        status = (status === 'success' || status === 'succeeded') ? 'success' : status;
      }
      let statusStyles = (status === 'failed') ? 'paymentstatus-failed' : 'paymentstatus-success';
      const getBullet = () => {
        if (record.transfers?.length > 0) {
          return (
            <List
              itemLayout="horizontal"
              dataSource={record.transfers}
              renderItem={item => (
                <List.Item>{item.description}</List.Item>
              )}
            />
          )
        }
        return '';
      }
      return (
        <div className='payment-gateway'>
          <div>{record.registrationUniqueKey}</div>
          <Tooltip title={record.description}>
            <div>{AppConstants.charge}: {record.stripeSourceTransaction}</div>
          </Tooltip>
          <div className='paymentstatus-container'>
            <Tooltip title={getBullet()} overlayStyle={{maxWidth: '500px'}}>
              <div>{AppConstants.transfers}: {record.transfers?.length ?? 0}</div>
            </Tooltip>
            { status && (
              <Tooltip title={record.errorMessage ?? ''}>
                <div className={statusStyles}>{status}</div>
              </Tooltip>
            )}
          </div>
        </div>
      )
    }
  },
];

const RegistrationFormSubmissions = () => {
  const dispatch = useDispatch();
  const userState = useSelector(state => state.UserState);

  useEffect(() => {
    return () => {
      dispatch(initRegistrationFormSubmissionsAction());
    }
  }, [dispatch])
  
  const handleTablePagination = (page, size) => {
    const offset = (page - 1) * size;
    const limit = size;
    
    const searchValues = userState.formSubmissionSearch;
    dispatch(getRegistrationFormSubmissionsAction({
      ...searchValues,
      offset,
      limit,
    }));
  }

  const headerView = () => {
    return (
      <div className="comp-player-grades-header-view-design">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.registrationFormSubmissions}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </div>
    );
  };

  const contentView =() => {
    const {
      formSubmissionsPage,
      formSubmissionsPageSize,
      formSubmissionsTotalCount
    } = userState;

    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={userState.formSubmissionsList}
            loading={userState.onLoad}
            pagination={false}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            showSizeChanger
            current={formSubmissionsPage}
            defaultCurrent={formSubmissionsPage}
            defaultPageSize={formSubmissionsPageSize}
            total={formSubmissionsTotalCount}
            onChange={handleTablePagination}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fluid-width default-bg">
      <DashboardLayout menuHeading={AppConstants.user} menuName={AppConstants.user} />
      <InnerHorizontalMenu menu="user" userSelectedKey="7" />
      <Layout>
        {headerView()}
        <Content>
          <Loader visible={userState.onLoad} />
          <SearchView />
          { contentView() }
        </Content>
      </Layout>
    </div>
  );
};

export default RegistrationFormSubmissions;
