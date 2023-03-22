import React, { useState, useEffect, useMemo } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import AppConstants from '../../themes/appConstants';
import { Button, Breadcrumb, Layout, notification, Table, Typography } from 'antd';
import DashboardLayout from '../../pages/dashboardLayout';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import { bindActionCreators } from 'redux';
import { useHistory, useLocation } from 'react-router-dom';
import userHttp from '../../store/http/userHttp/userHttp';
import { getMergeSelectedUserDetailsAction } from '../../store/actions/userAction/userAction';

const { Content } = Layout;
const { Text } = Typography;

const HeaderView = () => {
  return (
    <div className="comp-player-grades-header-view-design">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">{AppConstants.mergeUser}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
    </div>
  );
};

const UserDetailView = () => {
  const { mergeSelectedUser: selectedUser, onLoadMergeSelectedUser: loading } = useSelector(
    state => state.UserState,
  );

  const dataSource = useMemo(() => {
    if (loading || !selectedUser) {
      return [];
    }
    return [
      {
        key: selectedUser.userId,
        id: selectedUser.userId,
        name: `${selectedUser.firstName} ${selectedUser.lastName ? selectedUser.lastName : ''}`,
        dob: selectedUser.dateOfBirth || '',
        email: selectedUser.email,
        mobile: selectedUser.mobileNumber,
      },
    ];
  }, [loading, selectedUser]);

  const columns = [
    {
      title: AppConstants.id,
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: AppConstants.name,
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: AppConstants.dateOfBirth,
      dataIndex: 'dob',
      key: 'dob',
      render: value => <span>{value ? moment(value).format('DD/MM/YYYY') : ''}</span>,
    },
    {
      title: AppConstants.emailAdd,
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: AppConstants.contactNumber,
      dataIndex: 'mobile',
      key: 'mobile',
    },
  ];

  return (
    <div className="comp-dash-table-view mt-5">
      <h2>{AppConstants.userToMerge}</h2>
      <div className="table-responsive home-dash-table-view">
        <Table
          className="home-dashboard-table"
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          loading={loading}
          rowKey={record => `${record.id}_${record.key}`}
        />
      </div>
    </div>
  );
};

const MatchesDetailView = () => {
  const history = useHistory();
  const location = useLocation();
  const [userToBeMerged, setUserToBeMerged] = useState(null);
  const {
    mergeSelectedUser: selectedUser,
    mergeMatches,
    onLoadMergeSelectedUser: loading,
  } = useSelector(state => state.UserState);

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setUserToBeMerged(selectedRows);
    },
    getCheckboxProps: record => ({
      name: record.name,
    }),
  };

  const dataSource = useMemo(
    () =>
      mergeMatches.map(user => ({
        key: user.id,
        id: user.id,
        name: `${user.firstName} ${user.lastname ? user.lastname : ''}`,
        dob: user.dateOfBirth,
        email: user.email,
        mobile: user.mobileNumber,
        affiliate: user.affiliates && user.affiliates.length ? user.affiliates.join(', ') : '',
      })),
    [mergeMatches],
  );

  const columns = [
    {
      title: AppConstants.id,
      dataIndex: 'id',
      key: 'key',
    },
    {
      title: AppConstants.name,
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: AppConstants.dateOfBirth,
      dataIndex: 'dob',
      key: 'dob',
      render: value => <span>{value ? moment(value).format('DD/MM/YYYY') : ''}</span>,
    },
    {
      title: AppConstants.emailAdd,
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: AppConstants.contactNumber,
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: AppConstants.affiliate,
      dataIndex: 'affiliate',
      key: 'affiliate',
    },
  ];

  const openDecisionScreen = () => {
    if (!userToBeMerged) {
      const openNotificationWithIcon = type => {
        notification[type]({
          message: AppConstants.unableToContinue,
          description: AppConstants.pleaseSelectUserToMerge,
        });
      };
      return openNotificationWithIcon('error');
    }
    const secondUser = mergeMatches.find(match => match.id === userToBeMerged[0].id);

    const routeState = {
      masterId: selectedUser.userId,
      secondId: secondUser.id,
      returnUrl: location.state?.returnUrl,
    };
    history.push(`/mergeUserDetail`, routeState);
  };

  return (
    <div className="comp-dash-table-view mt-5">
      <h2>{AppConstants.possibleMatches}</h2>
      <Text type="secondary">{AppConstants.possibleMatchesDescription}</Text>
      <div className="table-responsive home-dash-table-view mt-3">
        <Table
          rowSelection={{
            type: 'radio',
            ...rowSelection,
          }}
          className="home-dashboard-table"
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          loading={loading}
          rowKey={record => `${record.id}_${record.key}`}
        />
      </div>
      <div className="d-flex align-items-center justify-content-between mt-4">
        <Button onClick={history.goBack}>{AppConstants.cancel}</Button>
        <Button
          type="primary"
          onClick={() => {
            openDecisionScreen();
          }}
        >
          {AppConstants.next}
        </Button>
      </div>
    </div>
  );
};

function MergeUserMatches() {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const userId = location.state.userId;

  useEffect(() => {
    userId
      ? dispatch(getMergeSelectedUserDetailsAction({ userId }))
      : history.push('/userPersonal');
  }, [userId]);

  return (
    <div className="fluid-width default-bg">
      <DashboardLayout menuHeading={AppConstants.user} menuName={AppConstants.user} />
      <InnerHorizontalMenu menu="user" userSelectedKey="1" />
      <Layout>
        <HeaderView></HeaderView>
        <Content>
          <UserDetailView></UserDetailView>
          <MatchesDetailView></MatchesDetailView>
        </Content>
      </Layout>
    </div>
  );
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

function mapStateToProps(state) {
  return {
    userState: state.UserState,
    appState: state.AppState,
    commonReducerState: state.CommonReducerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MergeUserMatches);
