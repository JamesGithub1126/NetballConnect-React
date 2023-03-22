import React, { useEffect, useCallback, useState } from 'react';
import { Layout, Table, Breadcrumb, Pagination, Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import AppImages from 'themes/appImages';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import { getOrganisationData } from '../../util/sessionStorage';
import { ApiSource } from 'util/enums';
import {
  getEmailRecipientsListAction,
  exportEmailRecipientsListAction,
  clearEmailRecipientsListAction,
} from 'store/actions/commonAction/commonAction';
import ActionCard from 'customComponents/ActionCard';

const { Content } = Layout;

const HeaderView = ({ communicationId }) => {
  const dispatch = useDispatch();
  const {emailRecipientsPage: pagination} = useSelector(state => state.CommonReducerState);
  const [searchText, setSearchText] = useState('');

  const fetchEmailRecipients = (searchText) => {
    const payload = {
      communicationId,
      offset: 0,
      limit: pagination.pageSize,
      searchText,
    }
    dispatch(getEmailRecipientsListAction(payload));
  };

  const onKeyEnterSearchText = async e => {
    const code = e.keyCode || e.which;
    if (code === 13) {
      fetchEmailRecipients(searchText);
    }
  };

  const onChangeSearchText = async e => {
    const { value } = e.target;
    setSearchText(value);
    if (!value) {
      fetchEmailRecipients('');
    }
  };

  const onClickSearchIcon = () => {
    fetchEmailRecipients(searchText);
  };

  const exportEmailRecipients = () => {
    dispatch(exportEmailRecipientsListAction({ communicationId }))
  }

  return (
    <div className="comp-player-grades-header-view-design mb-4">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.emailRecipients}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="col-sm search-flex mr-4">
          <div className="row">
            <div className="reg-product-search-inp-width mr-4">
              <Input
                className="product-reg-search-input"
                onChange={onChangeSearchText}
                placeholder="Search..."
                onKeyPress={onKeyEnterSearchText}
                value={searchText}
                prefix={
                  <SearchOutlined
                    style={{ color: 'rgba(0,0,0,.25)', height: 16, width: 16 }}
                    onClick={onClickSearchIcon}
                  />
                }
                allowClear
              />
            </div>
            <div>
              <div className="comp-dashboard-botton-view-mobile">
                <Button
                  type="primary"
                  className="primary-add-comp-form"
                  onClick={exportEmailRecipients}
                >
                  <div className="row">
                    <div className="col-sm">
                      <img className="export-image" src={AppImages.export} alt="" />
                      {AppConstants.export}
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CardView = ({ communicationId }) => {
  const organisationId = getOrganisationData().organisationId;

  return (
    <div className="comp-dash-table-view mt-4 pb-5">
      <div className="row">
        <div className="col-xs-12 col-md-6 col-sm-6 col-lg-6">
          <ActionCard
            apiSource={ApiSource.Common}
            api="getCommunicationQueuedForSending"
            payload={{ organisationId, communicationId }}
            ActionTitle={AppConstants.queuedForSending}
            key={'CommunicationQueuedForSending'}
            ActionSubTitle={'   '}
          />
        </div>
        <div className="col-xs-12 col-md-6 col-sm-6 col-lg-6">
          <ActionCard
            apiSource={ApiSource.Common}
            api="getCommunicationSentEmails"
            payload={{ organisationId, communicationId }}
            ActionTitle={AppConstants.sent}
            key={'CommunicationSentEmails'}
            ActionSubTitle={'   '}
          />
        </div>
      </div>
    </div>
  );
};

const EmailRecipientsView = ({ communicationId }) => {
  const dispatch = useDispatch();
  const { onLoadEmailRecipients, emailRecipientsList, emailRecipientsPage: pagination } = useSelector(
    state => state.CommonReducerState,
  );

  const fetchEmailRecipients = useCallback(currentPage => {
    const payload = {
      communicationId,
      offset: (currentPage - 1) * pagination.pageSize,
      limit: pagination.pageSize,
    };
    dispatch(getEmailRecipientsListAction(payload));
  }, [dispatch]);

  useEffect(() => {
    communicationId && fetchEmailRecipients(1);
  }, [communicationId, fetchEmailRecipients]);

  const columns = [
    {
      title: AppConstants.recipientsFirstName,
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: AppConstants.recipientsLastName,
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: AppConstants.recipientsEmail,
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: AppConstants.status,
      dataIndex: 'status',
      key: 'status',
    },
  ];

  return (
    <div className="comp-dash-table-view mt-4 pb-5">
      <div className="table-responsive home-dash-table-view">
        <Table
          className="home-dashboard-table"
          columns={columns}
          dataSource={emailRecipientsList}
          pagination={false}
          loading={onLoadEmailRecipients}
          rowKey={record => record.communicationTrackId}
        />
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination pb-3"
            current={pagination.currentPage}
            total={pagination.totalCount}
            onChange={page => fetchEmailRecipients(page)}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
};

const EmailRecipientList = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const communicationId = location.state?.communicationId;
  if (!communicationId) {
    history.push('/communicationList');
  }

  useEffect(() => {
    return () => dispatch(clearEmailRecipientsListAction());
  }, []);

  return (
    <div className="fluid-width default-bg">
      <DashboardLayout
        menuHeading={AppConstants.emailRecipients}
        menuName={AppConstants.emailRecipients}
      />
      <InnerHorizontalMenu menu="communication" userSelectedKey="1" />
      <Layout>
        <HeaderView communicationId={communicationId}></HeaderView>
        <Content style={{ paddingBottom: '140px' }}>
          <CardView communicationId={communicationId}></CardView>
          <EmailRecipientsView communicationId={communicationId}></EmailRecipientsView>
        </Content>
      </Layout>
    </div>
  );
};

export default EmailRecipientList;
