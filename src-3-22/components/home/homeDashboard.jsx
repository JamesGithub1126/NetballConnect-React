import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Button, Table, Select, Spin, Pagination, Menu, Modal, Checkbox } from 'antd';
import CustomToolTip from 'react-png-tooltip';
import moment from 'moment';
import history from 'util/history';
import {
  getOrganisationData,
  setGlobalYear,
  getGlobalYear,
  getImpersonation,
} from 'util/sessionStorage';
import { getUserRoleId, getCurrentYear } from 'util/permissions';
import { FLAVOUR } from 'util/enums';
import AppConstants from 'themes/appConstants';
import AppImages from 'themes/appImages';
import {
  getOnlyYearListAction,
  getMembershipProductCategoryTypesAction,
} from 'store/actions/appAction';
import {
  getUserCount,
  clearHomeDashboardData,
  setHomeDashboardYear,
  setPageSize,
  setPageNum,
  getActionBoxAction,
  updateActionBoxAction,
  getAffiliateOurOrganisationIdAction,
  getOrganisationSettingsAction,
} from 'store/actions/homeAction/homeAction';
import {
  getUreAction,
  getRoleAction,
  getUserTermsAndConditionsAction,
  saveUserTermsAndConditionsAction,
} from 'store/actions/userAction/userAction';
import DashboardLayout from 'pages/dashboardLayout';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import Loader from 'customComponents/loader';
import { UserRole } from 'util/enums';
import RevenueBox from './revenueBox';
import UsersBox from './usersBox';
import './style.scss';
import { getUserWidgetsAction } from '../../store/actions/commonAction/commonAction';
import ShopPurchasesChart from './ShopPurchasesChart';
import RegistrationChart from './RegistrationChart';
import HomeActionBar from './homeActionBar';
import OrgRegistrationsComparison from './OrgRegistrationsComparison';
import OrgRevenueComparison from './OrgRevenueComparison';

const { Footer, Content } = Layout;
const { Option } = Select;
const { SubMenu } = Menu;
let thisObj = null;

const columnsInbox = [
  {
    title: AppConstants.name,
    dataIndex: 'organisationName',
    key: 'organisationName',
    width: '20%',
    render: organisationName => <span className="inbox-name-text">{organisationName}</span>,
  },
  {
    title: AppConstants.description,
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: AppConstants.time,
    dataIndex: 'createdOn',
    key: 'createdOn',
    width: '15%',
    render: createdOn => (
      <span className="inbox-time-text">{moment(createdOn).format('DD/MM/YYYY HH:mm')}</span>
    ),
  },
  {
    title: AppConstants.action,
    dataIndex: 'isActionRequired',
    key: 'isActionRequired',
    render: (isActionRequired, e) =>
      isActionRequired === 1 && (
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
            <Menu.Item key="1" onClick={() => thisObj.showConfirm(e)}>
              <span>Complete</span>
            </Menu.Item>
          </SubMenu>
        </Menu>
      ),
  },
];

const columnsOwned = [
  {
    title: <div className="home-dash-name-table-title">Name</div>,
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.length - b.name.length,
  },
  {
    title: AppConstants.divisionAge,
    dataIndex: 'divisionAge',
    key: 'divisionAge',
    sorter: (a, b) => a.divisionAge.length - b.divisionAge.length,
  },

  {
    title: AppConstants.teams,
    dataIndex: 'teams',
    key: 'teams',
    sorter: (a, b) => a.teams.length - b.teams.length,
  },
  {
    title: AppConstants.players,
    dataIndex: 'players',
    key: 'players',
    sorter: (a, b) => a.players.length - b.players.length,
  },
  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
    sorter: (a, b) => a.players.length - b.players.length,
  },
  {
    title: AppConstants.edit,
    dataIndex: 'more',
    key: 'more',
    render: () => (
      <span className="d-flex justify-content-center w-50">
        <img className="dot-image" src={AppImages.moreTripleDot} alt="" width="16" height="16" />
      </span>
    ),
  },
];

const dataOwned = [
  {
    key: '1',
    name: '2019 Winter',
    divisionAge: 'AR1, AR2, 16, 15, 14, 13, 12, 11, 10, NetSetGo',
    teams: '200',
    players: '2,009',
    status: 'PTR',
  },
  {
    key: '2',
    name: '2019 Summer',
    divisionAge: 'AR1, AR2, AR3, 16, 14, 12, 11, 10',
    teams: '120',
    players: '12,00',
    status: 'TGF',
  },
  {
    key: '3',
    name: '2019 Spring',
    divisionAge: 'AR1, AR2, 16, 15, 14, 13, 12, 11, 10',
    teams: '100',
    players: '1,003',
    status: 'PTR',
  },
];

const columnsParticipate = [
  {
    title: <div className="home-dash-name-table-title">Name</div>,
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.length - b.name.length,
  },
  {
    title: AppConstants.divisionAge,
    dataIndex: 'divisionAge',
    key: 'divisionAge',
    sorter: (a, b) => a.divisionAge.length - b.divisionAge.length,
  },
  {
    title: AppConstants.teams,
    dataIndex: 'teams',
    key: 'teams',
    sorter: (a, b) => a.teams.length - b.teams.length,
  },
  {
    title: AppConstants.players,
    dataIndex: 'players',
    key: 'players',
    sorter: (a, b) => a.players.length - b.players.length,
  },
  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
    sorter: (a, b) => a.status.length - b.status.length,
  },
  {
    title: AppConstants.edit,
    dataIndex: 'more',
    key: 'more',
    render: () => (
      <span className="d-flex justify-content-center w-50">
        <img className="dot-image" src={AppImages.moreTripleDot} alt="" width="16" height="16" />
      </span>
    ),
  },
];

const dataParticipate = [
  {
    key: '1',
    name: '2019 Winter',
    divisionAge: 'AR1, AR2, 16, 15, 14, 13, 12, 11, 10, NetSetGo',
    teams: '200',
    players: '2,009',
    status: 'PTR',
  },
  {
    key: '2',
    name: '2019 Summer',
    divisionAge: 'AR1, AR2, AR3, 16, 14, 12, 11, 10',
    teams: '120',
    players: '12,00',
    status: 'TGF',
  },
  {
    key: '3',
    name: '2019 Spring',
    divisionAge: 'AR1, AR2, 16, 15, 14, 13, 12, 11, 10',
    teams: '100',
    players: '1,003',
    status: 'PTR',
  },
];

class HomeDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      userCountLoading: false,
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      updateActionBoxLoad: false,
      actions: null,
      orgChange: props.location.state ? props.location.state.orgChange : null,

      userRoleId: getUserRoleId(),
      // isModalVisible: true,
      isTermsConditionsAccepted: false,
      firstLoaded: false,
      hideUserWidgets: props.location.pathname === '/homeDashboard',
    };

    this.actionScrollRef = React.createRef();
    thisObj = this;
  }

  async componentDidMount() {
    this.props.getRoleAction();
    this.props.getUreAction();
    if (this.state.orgChange) {
      window.history.pushState(null, document.title, window.location.href);
      window.addEventListener('popstate', () => {
        window.history.pushState(null, document.title, window.location.href);
      });
    }
    if (getImpersonation() === 'false') {
      this.props.getUserTermsAndConditionsAction();
    }
    if (getGlobalYear()) {
      const yearRefId = getGlobalYear();
      this.props.setHomeDashboardYear(JSON.parse(yearRefId));
    } else if (this.props.homeDashboardState.yearRefId) {
      setGlobalYear(this.props.homeDashboardState.yearRefId);
    }
    // this.props.getOnlyYearListAction(this.props.appState.yearList);
    // this.props.getUserCount(1);
  }

  async componentDidUpdate(nextProps) {
    try {
      const organisationData = getOrganisationData();
      if (
        !!organisationData &&
        !this.props.userState.affiliateOurOrg.logoUrl &&
        !this.state.firstLoaded
      ) {
        const { organisationUniqueKey } = organisationData;
        this.setState({ firstLoaded: true });
        this.props.getAffiliateOurOrganisationIdAction(organisationUniqueKey);
        this.props.getOrganisationSettingsAction({ organisationUniqueKey });
      }
      const { yearList } = this.props.appState;
      const userOrganisation = this.props.userState.getUserOrganisation;
      if (this.state.userCountLoading && !this.props.appState.onLoad) {
        if (yearList.length > 0) {
          const yearRefId = getGlobalYear() ? getGlobalYear() : getCurrentYear(yearList);
          if (this.props.homeDashboardState.userCount == null) {
            // this.props.getUserCount(yearRefId);
            setGlobalYear(yearRefId);
            this.props.setHomeDashboardYear(JSON.parse(yearRefId));
          }

          this.setState({ userCountLoading: false });
        }
      }

      if (this.state.loading && !this.props.userState.onOrgLoad) {
        // if (nextProps.userState.getUserOrganisation !== userOrganisation) {
        if (userOrganisation.length > 0) {
          if (this.props.appState.yearList.length === 0) {
            this.props.getOnlyYearListAction(this.props.appState.yearList);
            this.setState({ userCountLoading: true, loading: false });
          } else {
            const yearRefId = getGlobalYear() ? getGlobalYear() : getCurrentYear(yearList);
            if (this.props.homeDashboardState.userCount == null) {
              // this.props.getUserCount(yearRefId);
              this.setState({ loading: false });
            }
          }
          if (
            this.props.appState.membershipProductCategory.length === 0 &&
            process.env.REACT_APP_FLAVOUR === FLAVOUR.Football
          ) {
            this.props.getMembershipProductCategoryTypesAction();
          }

          if (
            this.props.homeDashboardState.actionBoxList == null ||
            this.state.organisationId == null
          ) {
            const organisationUniqueKey =
              getOrganisationData() == null
                ? userOrganisation[0].organisationUniqueKey
                : getOrganisationData().organisationUniqueKey;
            await this.setState({ organisationId: organisationUniqueKey });
            this.handleActionBoxList(1);
          }
        }
        // }
      }

      if (this.state.updateActionBoxLoad && !this.props.homeDashboardState.onActionBoxLoad) {
        this.setState({ updateActionBoxLoad: false });
        this.handleActionBoxList(1);
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  onYearChange = yearRefId => {
    setGlobalYear(yearRefId);
    this.props.setHomeDashboardYear(yearRefId);
    this.props.clearHomeDashboardData('yearChange');
    this.props.getUserCount(yearRefId);
  };

  handleActionBoxList = pageNum => {
    this.refreshActionBoxList(pageNum);
  };

  handleShowSizeChange = async (pageNum, pageSize) => {
    await this.props.setPageSize(pageSize);
    this.refreshActionBoxList(1);
  };

  refreshActionBoxList = async pageNum => {
    /* await this.props.setPageNum(pageNum);
                                        const payload = {
                                          organisationId: this.state.organisationId,
                                          paging: {
                                            limit: this.props.homeDashboardState.pageSize,
                                            offset: pageNum ? this.props.homeDashboardState.pageSize * (pageNum - 1) : 0,
                                          },
                                        };
                                        this.props.getActionBoxAction(payload); */
  };

  showConfirm = async e => {
    await this.setState({
      modalVisible: true,
      actions: e,
    });
  };

  handleUpdateActionBoxOk = key => {
    if (key === 'ok') {
      this.updateActionBox(this.state.actions);
    }

    this.setState({ modalVisible: false, actions: null });
  };

  updateActionBox = e => {
    const obj = {
      actionsId: e.actionsId,
      actionMasterId: e.actionMasterId,
      userId: e.userId,
    };
    this.props.updateActionBoxAction(obj);
    this.setState({ updateActionBoxLoad: true });
  };

  actionboxHeadingView = () => (
    <div className="row text-view mt-5 pt-2">
      <div className="col-sm">
        <span className="home-dash-left-text">{AppConstants.inbox}</span>
      </div>
      {/* <div className="col-sm text-right">
                <span className='home-dash-right-text'>{AppConstants.viewAll}</span>
            </div> */}
    </div>
  );

  // actionboxView for table
  actionboxView = () => {
    const { actionBoxList, actionBoxPage, actionBoxTotalCount, pageSize } =
      this.props.homeDashboardState;

    return (
      <div>
        {this.actionboxHeadingView()}
        {/* <span className="input-heading">{"This feature is not implemented yet"}</span> */}
        <div className="home-table-view" style={{ boxShadow: 'none', background: 'none' }}>
          <div id={AppConstants.home_table_view} className="table-responsive home-dash-table-view">
            <Table
              className="home-dashboard-table"
              columns={columnsInbox}
              dataSource={(actionBoxList || []).map(actionBox => ({
                ...actionBox,
                key: actionBox.actionsId,
              }))}
              pagination={false}
              showHeader={false}
              loading={this.props.homeDashboardState.onActionBoxLoad === true}
            />
          </div>
          <div className="d-flex justify-content-end">
            <Pagination
              className="antd-pagination action-box-pagination"
              current={actionBoxPage}
              defaultCurrent={actionBoxPage}
              defaultPageSize={pageSize}
              showSizeChanger
              total={actionBoxTotalCount}
              onChange={this.handleActionBoxList}
              onShowSizeChange={this.handleShowSizeChange}
            />
          </div>
        </div>

        <Modal
          className="add-membership-type-modal"
          title={AppConstants.updateAction}
          visible={this.state.modalVisible}
          onOk={() => this.handleUpdateActionBoxOk('ok')}
          onCancel={() => this.handleUpdateActionBoxOk('cancel')}
        >
          <p>{AppConstants.actionBoxConfirmMsg}</p>
        </Modal>
      </div>
    );
  };

  compOverviewHeading = () => {
    const { yearRefId } = this.props.homeDashboardState;
    return (
      <div className="row text-view" style={{ paddingTop: '3%' }}>
        <div className="col-sm d-flex align-items-center">
          <span className="home-dash-left-text">{AppConstants.competitionsOverview}</span>
        </div>
        <div className="col-sm text-right">
          <div
            className="w-100 d-flex flex-row align-items-center justify-content-end"
            style={{ marginLeft: 7 }}
          >
            <span className="year-select-heading" style={{ marginRight: 10 }}>
              {`${AppConstants.year}: `}
            </span>
            <Select
              name="yearRefId"
              className="year-select reg-filter-select-year"
              style={{ width: 90 }}
              onChange={year => this.onYearChange(year)}
              value={yearRefId}
            >
              {this.props.appState.yearList.map(item => (
                <Option key={`year_${item.id}`} value={item.id}>
                  {item.description}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    );
  };

  revenueUserCard = () => {
    let organisationUniqueKey = null;
    let organisationId = null;
    const organisationData = getOrganisationData();

    if (organisationData) {
      organisationUniqueKey = organisationData.organisationUniqueKey;
      organisationId = organisationData.organisationId;
    }

    return (
      <>
        <div className="row text-view" style={{ paddingTop: '3%' }}>
          <div className="col-sm d-flex align-items-center">
            <span className="home-dash-left-text">{AppConstants.overview}</span>
            <CustomToolTip>
              <span>{AppConstants.homeOverviewInfo}</span>
            </CustomToolTip>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-6 col-sm-6 col-lg-6">
            <RevenueBox
              organisationId={organisationId}
              payload={{
                organisationId: organisationUniqueKey,
                isNotReady: !organisationUniqueKey,
              }}
              key={organisationId + 'ActionBoxCount'}
            />
          </div>
          <div className="col-xs-12 col-md-6 col-sm-6 col-lg-6">
            <UsersBox
              organisationId={organisationId}
              key={`regChangeTypeRefId_1_${organisationUniqueKey}`}
            />
          </div>
        </div>
      </>
    );
  };

  chartView = () => {
    let organisationUniqueKey = null;
    let organisationId = null;
    const organisationData = getOrganisationData();

    if (organisationData) {
      organisationUniqueKey = organisationData.organisationUniqueKey;
      organisationId = organisationData.organisationId;
    }

    return (
      <div className="m-top-10">
        <div className="row">
          <div className="col-xs-12 col-md-6 col-sm-6 col-lg-6">
            <RegistrationChart
              organisationId={organisationId}
              key={`regChangeTypeRefId_1_${organisationUniqueKey}`}
            />
          </div>
          <div className="col-xs-12 col-md-6 col-sm-6 col-lg-6">
            <ShopPurchasesChart
              organisationId={organisationId}
              key={`regChangeTypeRefId_1_${organisationUniqueKey}`}
            />
          </div>
        </div>
      </div>
    );
  };

  organisationComparison = () => {
    const organisationData = getOrganisationData();
    const { organisationId, organisationUniqueKey } = organisationData;

    return (
      <div className="m-top-10">
        {organisationId && organisationUniqueKey ? (
          <div className="row">
            <div className="col-xs-12 col-md-6 col-sm-6 col-lg-6">
              <OrgRegistrationsComparison
                organisationId={organisationId}
                organisationUniqueKey={organisationUniqueKey}
              />
            </div>
            <div className="col-xs-12 col-md-6 col-sm-6 col-lg-6">
              <OrgRevenueComparison
                organisationId={organisationId}
                organisationUniqueKey={organisationUniqueKey}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  // competition Overview
  compOverview = () => {
    const {
      userCount,
      registrationCount,
      liveScoreCompetitionCount,
      registrationCompetitionCount,
    } = this.props.homeDashboardState;
    const { userRoleId } = this.state;

    return (
      <div>
        {this.compOverviewHeading()}

        <div className="row">
          <div className="col-xs-12 col-md-6 col-sm-6 col-lg-6 pt-5">
            <div className="home-dash-white-box-view">
              <div className="row">
                <div className="col-sm-2 d-flex align-items-center">
                  <div className="reg-payment-regist-view">
                    <img src={AppImages.activeUserIcon} alt="" height="25" width="25" />
                  </div>
                </div>
                <div className="col-sm-4 d-flex align-items-center justify-content-center">
                  <Spin size="small" spinning={this.props.homeDashboardState.onLoad} />
                  {!this.props.homeDashboardState.onLoad && (
                    <span className="reg-payment-price-text">
                      {userCount !== null && userCount !== '' ? userCount : '-'}
                    </span>
                  )}
                </div>
                <div className="col-sm-4 d-flex align-items-center justify-content-center">
                  <span className="reg-payment-paid-reg-text">{AppConstants.totalUsers}</span>
                </div>
                <div
                  className="col-sm-2 d-flex align-items-center justify-content-end"
                  onClick={() => history.push('/userTextualDashboard')}
                >
                  <div className="view-more-btn pt-0 pointer ml-auto">
                    <i className="fa fa-angle-right" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xs-12 col-md-6 col-sm-6 col-lg-6  pt-5">
            <div className="home-dash-white-box-view">
              <div className="row">
                <div className="col-sm-2 d-flex align-items-center">
                  <div className="reg-payment-regist-view">
                    <img src={AppImages.activeRegist} alt="" height="25" width="25" />
                  </div>
                </div>
                <div className="col-sm-4 d-flex align-items-center justify-content-center">
                  <Spin size="small" spinning={this.props.homeDashboardState.onLoad} />
                  {!this.props.homeDashboardState.onLoad && (
                    <span className="reg-payment-price-text">
                      {registrationCount !== null && registrationCount !== ''
                        ? registrationCount
                        : '-'}
                    </span>
                  )}
                </div>
                <div className="col-sm-4 d-flex align-items-center justify-content-center">
                  <span className="reg-payment-paid-reg-text">
                    {AppConstants.totalRegistrations}
                  </span>
                </div>
                <div
                  className="col-sm-2 d-flex align-items-center justify-content-end"
                  onClick={() => userRoleId == 2 && history.push('/registration')}
                >
                  <div className="view-more-btn pt-0 pointer ml-auto">
                    <i className="fa fa-angle-right" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-6 col-sm-6 col-lg-6  pt-5">
            <div className="home-dash-white-box-view">
              <div className="row">
                <div className="col-sm-2 d-flex align-items-center">
                  <div className="reg-payment-regist-view">
                    <img src={AppImages.activeCompIcon} alt="" height="25" width="25" />
                  </div>
                </div>
                <div className="col-sm-4 d-flex align-items-center justify-content-center">
                  <Spin size="small" spinning={this.props.homeDashboardState.onLoad} />
                  {!this.props.homeDashboardState.onLoad && (
                    <span className="reg-payment-price-text">
                      {registrationCompetitionCount !== null && registrationCompetitionCount !== ''
                        ? registrationCompetitionCount
                        : '-'}
                    </span>
                  )}
                </div>
                <div className="col-sm-4 d-flex align-items-center justify-content-center">
                  <span className="reg-payment-paid-reg-text">
                    {AppConstants.totalCompetitions}
                  </span>
                </div>
                <div
                  className="col-sm-2 d-flex align-items-center justify-content-end"
                  onClick={() => userRoleId == 2 && history.push('/competitionDashboard')}
                >
                  <div className="view-more-btn pt-0 pointer ml-auto">
                    <i className="fa fa-angle-right" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xs-12 col-md-6 col-sm-6 col-lg-6  pt-5">
            <div className="home-dash-white-box-view">
              <div className="row">
                <div className="col-sm-2 d-flex align-items-center">
                  <div className="reg-payment-regist-view">
                    <img src={AppImages.activeLiveScoreIcon} alt="" height="25" width="25" />
                  </div>
                </div>
                <div className="col-sm-4 d-flex align-items-center justify-content-center">
                  <Spin size="small" spinning={this.props.homeDashboardState.onLoad} />
                  {!this.props.homeDashboardState.onLoad && (
                    <span className="reg-payment-price-text">
                      {liveScoreCompetitionCount !== null && liveScoreCompetitionCount !== ''
                        ? liveScoreCompetitionCount
                        : '-'}
                    </span>
                  )}
                </div>
                <div className="col-sm-4 d-flex align-items-center justify-content-center">
                  <span className="reg-payment-paid-reg-text">{AppConstants.matchDayComp}</span>
                </div>
                <div
                  className="col-sm-2 d-flex align-items-center justify-content-end"
                  onClick={() => userRoleId == 2 && history.push('/matchDayCompetitions')}
                >
                  <div className="view-more-btn pt-0 pointer ml-auto">
                    <i className="fa fa-angle-right" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  ownedHeadingView = () => (
    <div className="row text-view">
      <div className="col-sm">
        <span className="home-dash-left-text">{AppConstants.ownedCompetitions}</span>
      </div>
      <div className="col-sm text-right">
        <NavLink to="/registrationCompetitionForm">
          <Button className="primary-add-comp-form" type="primary">
            {`+ ${AppConstants.addNew}`}
          </Button>
        </NavLink>
      </div>
    </div>
  );

  // ownedView view for competition
  ownedView = () => (
    <div>
      {this.ownedHeadingView()}
      <div className="table-responsive home-dash-table-view">
        <Table
          className="home-dashboard-table"
          columns={columnsOwned}
          dataSource={dataOwned}
          pagination={false}
        />
      </div>
    </div>
  );

  participatedHeadingView = () => (
    <div className="row text-view">
      <div className="col-sm mb-3">
        <span className="home-dash-left-text">{AppConstants.participatingInCompetitions}</span>
      </div>
    </div>
  );

  /// /////participatedView view for competition
  participatedView = () => (
    <div>
      {this.participatedHeadingView()}

      <div className="table-responsive home-dash-table-view">
        <Table
          className="home-dashboard-table"
          columns={columnsParticipate}
          dataSource={dataParticipate}
          pagination={false}
        />
      </div>
    </div>
  );

  handleModalOk = payload => {
    this.props.saveUserTermsAndConditionsAction(payload);
  };

  render() {
    const { userTCAcknowledgement } = this.props.userState;
    const { organisationId } = getOrganisationData() || {};
    const isImpersonation = getImpersonation() === 'true';
    let isShowModal =
      userTCAcknowledgement &&
      !isImpersonation &&
      !userTCAcknowledgement.find(item => item === organisationId);
    if (
      (this.state.userRoleId === UserRole.SuperAdmin || this.state.userRoleId === UserRole.Admin) &&
      isShowModal &&
      (!!this.props.userState.affiliateOurOrg.stateTermsAndConditionsFile ||
        !!this.props.userState.affiliateOurOrg.stateTermsAndConditionsLink)
    ) {
      return (
        <Modal
          className="confirmation-modal"
          title="Terms and Conditions"
          visible={true}
          onCancel={() => {}}
          footer={[
            <Button
              key="back"
              disabled={!this.state.isTermsConditionsAccepted}
              onClick={() => {
                this.state.isTermsConditionsAccepted && this.handleModalOk({ organisationId });
              }}
            >
              Continue
            </Button>,
          ]}
        >
          <div className="terms-and-conditions-checkbox">
            <p>Please review the following terms and conditions.</p>
            <a
              target="_blank"
              href={
                this.props.userState.affiliateOurOrg.stateTermsAndConditionsLink ||
                this.props.userState.affiliateOurOrg.stateTermsAndConditionsFile
              }
            >
              Terms and conditions for {this.props.userState.affiliateOurOrg.name}
            </a>
            <a target="_blank" href={AppConstants.termsAndConditionsLinkOfWorldSportAction}>
              Terms and conditions for World Sport Action
            </a>
            <Checkbox
              name="terms-and-conditions"
              onClick={() => {
                this.setState({ isTermsConditionsAccepted: !this.state.isTermsConditionsAccepted });
              }}
            >
              To continue please agree to the updated terms and conditions
            </Checkbox>
          </div>
        </Modal>
      );
    }
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuId={AppConstants.home_page_heading}
          menuHeading={AppConstants.home}
          menuName={AppConstants.home}
        />

        <InnerHorizontalMenu menu="home" userSelectedKey="1" />

        <Layout>
          <Content className="comp-dash-table-view">
            <HomeActionBar />
            {this.revenueUserCard()}
            {this.chartView()}
            {!this.state.hideUserWidgets ? <>{this.organisationComparison()}</> : null}
            {/*   {this.actionboxView()} */}
            {/*{this.compOverview()}*/}
            {/* {this.ownedView()}
                            {this.participatedView()} */}
          </Content>

          <Loader visible={this.props.appState.onLoad} />

          <Footer className="mb-5" />
        </Layout>
      </div>
    );
  }
}

HomeDashboard.propTypes = {
  location: PropTypes.object.isRequired,
  appState: PropTypes.object.isRequired,
  homeDashboardState: PropTypes.object.isRequired,
  userState: PropTypes.object.isRequired,
  getRoleAction: PropTypes.func.isRequired,
  getUreAction: PropTypes.func.isRequired,
  getUserWidgetsAction: PropTypes.func.isRequired,
  getUserCount: PropTypes.func.isRequired,
  getOnlyYearListAction: PropTypes.func.isRequired,
  clearHomeDashboardData: PropTypes.func.isRequired,
  setHomeDashboardYear: PropTypes.func.isRequired,
  getActionBoxAction: PropTypes.func.isRequired,
  updateActionBoxAction: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getRoleAction,
      getUreAction,
      getUserCount,
      getOnlyYearListAction,
      clearHomeDashboardData,
      setHomeDashboardYear,
      setPageSize,
      setPageNum,
      getActionBoxAction,
      updateActionBoxAction,
      getAffiliateOurOrganisationIdAction,
      getOrganisationSettingsAction,
      getUserTermsAndConditionsAction,
      saveUserTermsAndConditionsAction,
      getMembershipProductCategoryTypesAction,
      getUserWidgetsAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    homeDashboardState: state.HomeDashboardState,
    userState: state.UserState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeDashboard);
