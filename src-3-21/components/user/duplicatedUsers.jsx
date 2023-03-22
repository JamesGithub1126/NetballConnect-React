import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import AppConstants from '../../themes/appConstants';
import AppImages from 'themes/appImages';
import {
  Breadcrumb,
  Checkbox,
  Layout,
  Table,
  Menu,
  Pagination,
  Input,
  Button,
  Typography,
  Divider,
} from 'antd';
import Tooltip from 'react-png-tooltip';
import { SearchOutlined } from '@ant-design/icons';
import DashboardLayout from '../../pages/dashboardLayout';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import { useHistory } from 'react-router-dom';
import {
  getUserDuplicatesListAction,
  exportUserDuplicatesListAction,
  userIgnoreMatchAction,
  clearUserDuplicatesListAction,
  updateUserDuplicatesFilterAction,
} from '../../store/actions/userAction/userAction';
import { getOrganisationData } from '../../util/sessionStorage';

const { Content } = Layout;
const { SubMenu } = Menu;
const { Paragraph } = Typography;

const HeaderView = () => {
  const dispatch = useDispatch();
  const { userDuplicatesPage, userDuplicatesFilter } = useSelector(state => state.UserState);
  const { searchText, showIgnoredMatches } = userDuplicatesFilter;

  const fetchUserDuplicates = (searchText, ignoredMatches = undefined) => {
    if (ignoredMatches === undefined) {
      ignoredMatches = showIgnoredMatches;
    }
    const organisationId = getOrganisationId();
    const payload = {
      organisationId,
      offset: 0,
      limit: userDuplicatesPage.pageSize,
      showIgnoredMatches: ignoredMatches,
      searchText,
    };
    dispatch(getUserDuplicatesListAction(payload));
  };

  const onKeyEnterSearchText = async e => {
    const code = e.keyCode || e.which;
    if (code === 13) {
      fetchUserDuplicates(searchText);
    }
  };

  const onChangeSearchText = async e => {
    const { value } = e.target;
    dispatch(updateUserDuplicatesFilterAction('searchText', value));
    if (!value) {
      fetchUserDuplicates('');
    }
  };

  const onClickSearchIcon = () => {
    fetchUserDuplicates(searchText);
  };

  const onClickShowIgnoredMatches = e => {
    const checked = e.target.checked;
    dispatch(updateUserDuplicatesFilterAction('showIgnoredMatches', checked));
    fetchUserDuplicates(searchText, checked);
  };

  const exportUserDuplicates = () => {
    const organisationId = getOrganisationId();
    dispatch(exportUserDuplicatesListAction({ organisationId, searchText }));
  };

  const getOrganisationId = () => {
    return getOrganisationData() ? getOrganisationData().organisationUniqueKey : null;
  };

  const tooltip = () => (
    <>
      <p>This Duplicate Users Report finds matches overnight based on the following criteria:</p>
      <Paragraph>
        <ul style={{ fontSize: '13px' }}>
          <li>First Name and Mobile Number OR</li>
          <li>Last Name, Date of Birth, Mobile Number OR</li>
          <li>Last Name, Date of Birth, Street 1, Postcode OR</li>
          <li>First Name, Last Name and Linked Organisation</li>
        </ul>
      </Paragraph>
      <Divider></Divider>
      <p>The following functions are available:</p>
      <Paragraph>
        <ul style={{ fontSize: '13px' }}>
          <li>View Latest Matches: view more recent records available for merging</li>
          <li>Merge: review user details and proceed with merge</li>
          <li>Ignore: will remove the potential match from this report</li>
          <li>
            Unignore: will add the potential match back to this report (tick Show Ignored Matches to
            show any matches you have accidentally ignored)
          </li>
        </ul>
      </Paragraph>
    </>
  );

  return (
    <div className="comp-player-grades-header-view-design">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              <div className="d-flex align-items-center">
                <span className="form-heading">{AppConstants.duplicateUsers}</span>
                <div className="mt-n20">
                  <Tooltip>{tooltip()}</Tooltip>
                </div>
              </div>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="col-sm search-flex mr-4">
          <div className="row">
            <div className="mr-4">
              <Checkbox
                className="simple-checkbox"
                checked={showIgnoredMatches}
                onClick={onClickShowIgnoredMatches}
              >
                {AppConstants.showIgnoredMatches}
              </Checkbox>
            </div>
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
            <div className="comp-dashboard-botton-view-mobile">
              <Button
                type="primary"
                className="primary-add-comp-form"
                onClick={exportUserDuplicates}
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
  );
};

const UserDuplicatesView = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const {
    userDuplicatesFilter,
    userDuplicatesList,
    userDuplicatesPage,
    onLoadUserDuplicates,
    onLoadIgnoreMatch,
  } = useSelector(state => state.UserState);
  const { searchText, showIgnoredMatches } = userDuplicatesFilter;

  const fetchUserDuplicates = useCallback(
    (page, pageSize = 10) => {
      const organisationId = getOrganisationData()
        ? getOrganisationData().organisationUniqueKey
        : null;
      const payload = {
        organisationId,
        offset: (page - 1) * pageSize,
        limit: pageSize,
        searchText,
        showIgnoredMatches,
      };
      dispatch(getUserDuplicatesListAction(payload));
    },
    [dispatch, searchText],
  );

  useEffect(() => {
    fetchUserDuplicates(1);
    return () => dispatch(clearUserDuplicatesListAction());
  }, []);

  const ignoreMatch = record => {
    const payload = {
      userId: record.mergeUserId,
      duplicateUserId: record.duplicateUserId,
      unignore: false,
    };
    dispatch(userIgnoreMatchAction(payload));
  };

  const unignoreMatch = record => {
    const payload = {
      userId: record.mergeUserId,
      duplicateUserId: record.duplicateUserId,
      unignore: true,
    };
    dispatch(userIgnoreMatchAction(payload));
  };

  const viewLastestMatches = record => {
    const returnUrl = '/duplicateUsers';
    history.push(`/mergeUserMatches`, { userId: record.userId, returnUrl });
  };

  const mergeUser = record => {
    const returnUrl = '/duplicateUsers';
    const masterId = record.mergeUserId;
    const secondId = record.duplicateUserId;
    history.push(`/mergeUserDetail`, { masterId, secondId, returnUrl });
  };

  const columns = [
    {
      title: AppConstants.userId,
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: AppConstants.possibleMatch,
      dataIndex: 'duplicateUserId',
      key: 'duplicateUserId',
    },
    {
      title: AppConstants.firstName,
      dataIndex: 'firstName',
      key: 'firstName',
      render: (firstName, record) => (
        <NavLink
          to={{
            pathname: '/userPersonal',
            state: {
              userId: record.userId ? record.userId : record.duplicateUserId,
              screenKey: 'livescore',
              screen: '/duplicateUsers',
            },
          }}
        >
          {firstName}
        </NavLink>
      ),
    },
    {
      title: AppConstants.lastName,
      dataIndex: 'lastName',
      key: 'lastName',
      render: (lastName, record) => (
        <NavLink
          to={{
            pathname: '/userPersonal',
            state: {
              userId: record.userId ? record.userId : record.duplicateUserId,
              screenKey: 'livescore',
              screen: '/duplicateUsers',
            },
          }}
        >
          {lastName}
        </NavLink>
      ),
    },
    {
      title: AppConstants.mobileNumber,
      dataIndex: 'mobileNumber',
      key: 'mobileNumber',
    },
    {
      title: AppConstants.email,
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: AppConstants.dob,
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: value => <span>{value ? moment(value).format('DD/MM/YYYY') : ''}</span>,
    },
    {
      title: AppConstants.actions,
      render: (value, record) => (
        <Menu
          className="action-triple-dot-submenu"
          theme="light"
          mode="horizontal"
          style={{ lineHeight: '25px' }}
        >
          <SubMenu
            key="sub1"
            title={
              <img
                className="dot-image"
                src={AppImages.moreTripleDot}
                alt=""
                width="16"
                height="16"
              />
            }
          >
            {!!record.userId ? (
              <Menu.Item key="3" onClick={() => viewLastestMatches(record)}>
                <span>{AppConstants.viewLatestMatches}</span>
              </Menu.Item>
            ) : (
              <>
                {record.isIgnored ? (
                  <Menu.Item key="1" onClick={() => unignoreMatch(record)}>
                    <span>{AppConstants.unignore}</span>
                  </Menu.Item>
                ) : (
                  <Menu.Item key="1" onClick={() => ignoreMatch(record)}>
                    <span>{AppConstants.ignoreMatch}</span>
                  </Menu.Item>
                )}
                <Menu.Item key="2" onClick={() => mergeUser(record)}>
                  <span>{AppConstants.merge}</span>
                </Menu.Item>
              </>
            )}
          </SubMenu>
        </Menu>
      ),
    },
  ];

  return (
    <div className="comp-dash-table-view mt-5">
      <div className="table-responsive home-dash-table-view">
        <Table
          className="home-dashboard-table"
          dataSource={userDuplicatesList ?? []}
          columns={columns}
          pagination={false}
          loading={onLoadUserDuplicates || onLoadIgnoreMatch}
          rowKey={record => `${record.id}_${record.userId}_${record.isMainUser}`}
        />
      </div>
      <div className="d-flex justify-content-end">
        <Pagination
          className="antd-pagination action-box-pagination"
          current={userDuplicatesPage.currentPage}
          defaultCurrent={userDuplicatesPage.currentPage}
          defaultPageSize={userDuplicatesPage.pageSize}
          showSizeChanger
          total={userDuplicatesPage.totalCount}
          onChange={(page, pageSize) => fetchUserDuplicates(page, pageSize)}
        />
      </div>
    </div>
  );
};

const DuplicateUsers = () => {
  return (
    <div className="fluid-width default-bg">
      <DashboardLayout menuHeading={AppConstants.user} menuName={AppConstants.user} />
      <InnerHorizontalMenu menu="user" userSelectedKey="8" />
      <Layout>
        <HeaderView></HeaderView>
        <Content>
          <UserDuplicatesView></UserDuplicatesView>
        </Content>
      </Layout>
    </div>
  );
};

export default DuplicateUsers;
