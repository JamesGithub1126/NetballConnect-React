import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Breadcrumb, Table, Select, Pagination, Input, Button, Menu } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { isEmptyArray } from 'formik';

import AppConstants from 'themes/appConstants';
import AppImages from 'themes/appImages';
import { getOrganisationData } from 'util/sessionStorage';
import { setYearRefId, getOnlyYearListAction } from 'store/actions/appAction';
import {
  getCommonRefData,
  getGenderAction,
  registrationPaymentStatusAction,
} from 'store/actions/commonAction/commonAction';
import { getAffiliateToOrganisationAction } from 'store/actions/userAction/userAction';
import {
  getTeamRegistrationsAction,
  exportTeamRegistrationAction,
  setTeamRegistrationTableListPageSizeAction,
  setTeamRegistrationTableListPageNumberAction,
} from 'store/actions/registrationAction/registration';
import { getAllCompetitionAction } from 'store/actions/registrationAction/registrationDashboardAction';
import { endUserRegDashboardListAction } from 'store/actions/registrationAction/endUserRegistrationAction';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';
import moment from 'moment';
import history from '../../util/history';
import { RegistrationStatus } from '../../enums/registrationEnums';
import './product.scss';
import { ROLE } from 'util/enums';

const { Content } = Layout;
const { Option } = Select;
const { SubMenu } = Menu;

let this_Obj = null;

const listeners = key => ({
  onClick: () => tableSort(key),
});

function tableSort(key) {
  let sortBy = key;
  let sortOrder = null;
  if (this_Obj.state.sortBy !== key) {
    sortOrder = 'ASC';
  } else if (this_Obj.state.sortBy === key && this_Obj.state.sortOrder === 'ASC') {
    sortOrder = 'DESC';
  } else if (this_Obj.state.sortBy === key && this_Obj.state.sortOrder === 'DESC') {
    sortBy = sortOrder = null;
  }

  this_Obj.setState({ sortBy, sortOrder });
  this_Obj.props.getTeamRegistrationsAction(this_Obj.state.filter, sortBy, sortOrder);
}

const columns = [
  {
    title: AppConstants.teamName,
    dataIndex: 'teamName',
    key: 'teamName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (teamName, record) => (
      <NavLink
        to={{
          pathname: '/registration',
          state: { teamName: record.teamName, teamId: record.teamId },
        }}
      >
        <span className="input-heading-add-another pt-0">{teamName}</span>
      </NavLink>
    ),
  },

  {
    title: AppConstants.organisation,
    dataIndex: 'organisationName',
    key: 'organisationName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },

  {
    title: AppConstants.division,
    key: 'divisionName',
    dataIndex: 'divisionName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },

  {
    title: AppConstants.product,
    key: 'productName',
    dataIndex: 'productName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },

  {
    title: AppConstants.registeredBy,
    dataIndex: 'registeredBy',
    key: 'registeredBy',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (registeredBy, record) => (
      <NavLink to={{ pathname: '/userPersonal', state: { userId: record.userId } }}>
        <span className="input-heading-add-another pt-0">{registeredBy}</span>
      </NavLink>
    ),
  },

  {
    title: AppConstants.registrationDate,
    key: 'registrationDate',
    dataIndex: 'registrationDate',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: registrationDate => (
      <div>{registrationDate != null ? moment(registrationDate).format('DD/MM/YYYY') : ''}</div>
    ),
  },

  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
    // filterDropdown: true,
    // filterIcon: () => (
    //     <div className="mt-10">
    //         <Tooltip>
    //             <span>{AppConstants.statusContextMsg}</span>
    //         </Tooltip>
    //     </div>
    // ),
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.numberOfRegisteredPlayers,
    key: 'registeredPlayers',
    dataIndex: 'registeredUsers',
  },

  {
    title: AppConstants.paymentMethod,
    key: 'paymentMethod',
    dataIndex: 'paymentMethod',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: paymentMethod => <div>{paymentMethod}</div>,
  },

  {
    title: AppConstants.action,
    key: 'action',
    dataIndex: 'status',
    render: (status, record) =>
      status != 'De-Registered' && status != RegistrationStatus.CancelledRegistration ? (
        <Menu
          className="action-triple-dot-submenu"
          theme="light"
          mode="horizontal"
          style={{ lineHeight: '25px' }}
        >
          <SubMenu
            key="sub"
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
            <Menu.Item
              key="1"
              onClick={() =>
                history.push('/deregistration', {
                  regData: record,
                  sourceFrom: AppConstants.teamRegistration,
                  fromTeamDashboard: true,
                })
              }
            >
              <span>{AppConstants.registrationChange}</span>
            </Menu.Item>
          </SubMenu>
        </Menu>
      ) : null,
  },
];

class TeamRegistrations extends Component {
  constructor(props) {
    super(props);

    this.state = {
      organisationUniqueKey: getOrganisationData()
        ? getOrganisationData().organisationUniqueKey
        : null,
      yearRefId: null,
      competitionUniqueKey: '-1',
      filterOrganisation: -1,
      paymentMethod: -1,
      competitionId: '',
      divisionId: -1,
      searchText: '',
      sortBy: null,
      sortOrder: null,
      membershipProductUniqueKey: '-1',
      roleId: -1,
    };

    this_Obj = this;
  }

  async componentDidMount() {
    let yearId = this.props.appState.yearRefId;
    const { teamRegListAction } = this.props.registrationState;

    this.referenceCalls(this.state.organisationUniqueKey);

    this.setState({
      searchText: '',
    });
    let page = 1;
    let sortBy = this.state.sortBy;
    let sortOrder = this.state.sortOrder;
    if (teamRegListAction) {
      let offset = teamRegListAction.payload.paging.offset;
      sortBy = teamRegListAction.sortBy;
      sortOrder = teamRegListAction.sortOrder;
      let {
        competitionUniqueKey,
        filterOrganisation,
        searchText,
        divisionId,
        membershipProductUniqueKey,
      } = teamRegListAction.payload;
      let yearRefId = JSON.parse(yearId);
      await this.setState({
        sortBy,
        sortOrder,
        competitionUniqueKey,
        filterOrganisation,
        searchText,
        divisionId,
        yearRefId,
        membershipProductUniqueKey,
        paymentMethod: -1,
        roleId: -1,
      });
      let { teamRegistrationTableListPageSize } = this.props.registrationState;
      teamRegistrationTableListPageSize = teamRegistrationTableListPageSize
        ? teamRegistrationTableListPageSize
        : 10;
      page = Math.floor(offset / teamRegistrationTableListPageSize) + 1;

      this.handleRegTableList(page);
    } else {
      this.setState({ yearRefId: JSON.parse(yearId) });
      this.handleRegTableList(1);
    }
  }

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setTeamRegistrationTableListPageSizeAction(pageSize);
  };

  handleRegTableList = async page => {
    await this.props.setTeamRegistrationTableListPageNumberAction(page);
    const {
      organisationUniqueKey,
      // yearRefId,
      competitionUniqueKey,
      filterOrganisation,
      searchText,
      divisionId,
      sortBy,
      sortOrder,
      membershipProductUniqueKey,
      paymentMethod,
      roleId,
    } = this.state;
    let yearRefId =
      this.props.appState.yearRefId !== -1 && this.state.yearRefId != -1
        ? this.props.appState.yearRefId
        : -1;
    let { teamRegistrationTableListPageSize } = this.props.registrationState;
    teamRegistrationTableListPageSize = teamRegistrationTableListPageSize
      ? teamRegistrationTableListPageSize
      : 10;
    const filter = {
      organisationUniqueKey,
      yearRefId,
      competitionUniqueKey,
      filterOrganisation,
      searchText,
      divisionId,
      membershipProductUniqueKey,
      paymentMethod,
      roleId,
      paging: {
        limit: teamRegistrationTableListPageSize,
        offset: page ? teamRegistrationTableListPageSize * (page - 1) : 0,
      },
    };

    this.props.getTeamRegistrationsAction(filter, sortBy, sortOrder);

    this.setState({ filter });
  };

  exportTeamRegistration = () => {
    const obj = {
      organisationUniqueKey: this.state.organisationUniqueKey,
      yearRefId: this.state.yearRefId,
      competitionUniqueKey: this.state.competitionUniqueKey,
      filterOrganisation: this.state.filterOrganisation,
      searchText: this.state.searchText,
      divisionId: this.state.divisionId,
      membershipProductUniqueKey: this.state.membershipProductUniqueKey,
      paymentMethod: this.state.paymentMethod,
      sortBy: this.state.sortBy,
      sortOrder: this.state.sortOrder,
    };
    this.props.exportTeamRegistrationAction(obj);

    this.setState({
      load: true,
    });
  };

  referenceCalls = organisationId => {
    this.props.getAffiliateToOrganisationAction(organisationId);
    this.props.getOnlyYearListAction();
  };

  onChangeDropDownValue = async (value, key) => {
    if (key === 'yearRefId') {
      await this.setState({ yearRefId: value });
      if (value != -1) {
        this.props.setYearRefId(value);
      }
      this.handleRegTableList(1);
    } else if (key === 'competitionId') {
      await this.setState({ competitionUniqueKey: value });
      this.handleRegTableList(1);
    } else if (key === 'filterOrganisation') {
      await this.setState({ filterOrganisation: value });
      this.handleRegTableList(1);
    } else if (key === 'divisionId') {
      await this.setState({ divisionId: value });
      this.handleRegTableList(1);
    } else if (key === 'membershipProductUniqueKey') {
      await this.setState({ membershipProductUniqueKey: value });
      this.handleRegTableList(1);
    } else if (key === 'paymentMethod') {
      await this.setState({ paymentMethod: value });
      this.handleRegTableList(1);
    } else if (key === 'roleId') {
      await this.setState({ roleId: value });
      this.handleRegTableList(1);
    }
  };

  onKeyEnterSearchText = async e => {
    const code = e.keyCode || e.which;
    if (code === 13) {
      //13 is the enter keycode
      this.handleRegTableList(1);
    }
  };

  onChangeSearchText = async e => {
    const value = e.target.value;

    await this.setState({ searchText: e.target.value });

    if (!value) {
      this.handleRegTableList(1);
    }
  };

  onClickSearchIcon = async () => {
    this.handleRegTableList(1);
  };

  headerView = () => (
    // <div className="comp-player-grades-header-view-design">
    //     <div className="row">
    //         <div className="col-lg-4 col-md-12 d-flex align-items-center">
    //             <Breadcrumb separator=" > ">
    //                 <Breadcrumb.Item className="breadcrumb-add">
    //                     {AppConstants.teamRegistrations}
    //                 </Breadcrumb.Item>
    //             </Breadcrumb>
    //         </div>
    //         <div className="col-sm d-flex align-items-center justify-content-end margin-top-24-mobile">
    //             <div className="comp-product-search-inp-width">
    //                 <Input
    //                     className="product-reg-search-input"
    //                     onChange={this.onChangeSearchText}
    //                     placeholder="Search..."
    //                     onKeyPress={this.onKeyEnterSearchText}
    //                     prefix={
    //                         <SearchOutlined
    //                             style={{ color: "rgba(0,0,0,.25)", height: 16, width: 16 }}
    //                             onClick={this.onClickSearchIcon}
    //                         />
    //                     }
    //                     allowClear
    //                 />
    //             </div>
    //         </div>
    //         <div className="col-sm-1 d-flex align-items-center justify-content-end mr-3">
    //             <Button className="primary-add-comp-form" type="primary">
    //                 <div className="row">
    //                     <div className="col-sm">
    //                         <img
    //                             src={AppImages.export}
    //                             alt=""
    //                             className="export-image"
    //                         />
    //                         {AppConstants.export}
    //                     </div>
    //                 </div>
    //             </Button>
    //         </div>
    //     </div>
    // </div>
    <div className="comp-player-grades-header-drop-down-view">
      <div className="fluid-width">
        <div className="row">
          <div className="col-sm-4">
            <div className="com-year-select-heading-view pb-3">
              <Breadcrumb separator=" > ">
                <Breadcrumb.Item className="breadcrumb-add">
                  {AppConstants.teamRegistrations}
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>
          <div className="col-sm" />
          <div className="d-flex align-items-center" style={{ marginRight: 25 }}>
            <div className="comp-product-search-inp-width pb-3">
              <Input
                className="product-reg-search-input"
                onChange={this.onChangeSearchText}
                placeholder="Search..."
                onKeyPress={this.onKeyEnterSearchText}
                value={this.state.searchText}
                prefix={
                  <SearchOutlined
                    style={{ color: 'rgba(0,0,0,.25)', height: 16, width: 16 }}
                    onClick={this.onClickSearchIcon}
                  />
                }
                allowClear
              />
            </div>
          </div>
          <div className="d-flex align-items-center" style={{ marginRight: '1%' }}>
            <div className="d-flex flex-row-reverse button-with-search pb-3">
              <Button
                type="primary"
                className="primary-add-comp-form"
                onClick={this.exportTeamRegistration}
                style={{ marginRight: 20 }}
              >
                <div className="row">
                  <div className="col-sm">
                    <img src={AppImages.export} alt="" className="export-image" />
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

  dropdownView = () => {
    let affiliateToData = this.props.userState.affiliateTo;
    let uniqueValues = [];
    // let paymentStatus = [
    //     { id: 1, description: "Pending Competition Fee" },
    //     { id: 2, description: "Pending Membership Fee" },
    //     { id: 3, description: "Pending Registration Fee" },
    //     { id: 4, description: "Registered" },
    // ];

    if (affiliateToData.affiliatedTo !== undefined) {
      let obj = {
        organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
        name: getOrganisationData() ? getOrganisationData().name : null,
      };
      uniqueValues.push(obj);
      let arr = [
        ...new Map(affiliateToData.affiliatedTo.map(obj => [obj['organisationId'], obj])).values(),
      ];
      if (isEmptyArray) {
        uniqueValues = [...uniqueValues, ...arr];
      }
    }

    const competitions = this.props.registrationState.teamRegistrationTableData.competitionsList;
    const divisions = this.props.registrationState.teamRegistrationTableData.divisionList;
    const products = this.props.registrationState.teamRegistrationTableData.membershipProductList;
    const paymentMethods = this.props.registrationState.teamRegistrationTableData.paymentMethods;
    const roles = this.props.registrationState.teamRegistrationTableData.roles;
    const localUserRoles = [
      { key: -1, displayText: 'All' },
      { key: ROLE.PLAYERCANDIDATE, displayText: AppConstants.players },
      { key: ROLE.UMPIRE, displayText: AppConstants.umpires },
      { key: ROLE.COACH, displayText: AppConstants.coach },
      { key: ROLE.MANAGER, displayText: AppConstants.managerHeading },
      { key: ROLE.TeamRegistrationAdmin, displayText: AppConstants.teamAdmins },
    ];

    return (
      <div className="comp-player-grades-header-view-design">
        <div className="fluid-width" style={{ marginRight: 55 }}>
          <div className="row reg-filter-row">
            <div className="reg-col col-lg-3 col-md-5">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.year}</div>
                <Select
                  name="yearRefId"
                  className="year-select reg-filter-select"
                  onChange={yearRefId => this.onChangeDropDownValue(yearRefId, 'yearRefId')}
                  value={this.state.yearRefId}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {this.props.appState.yearList.map(item => (
                    <Option key={'year_' + item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="reg-col col-lg-3 col-md-7">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.competition}</div>
                <Select
                  showSearch
                  optionFilterProp="children"
                  className="year-select reg-filter-select1"
                  onChange={competitionId =>
                    this.onChangeDropDownValue(competitionId, 'competitionId')
                  }
                  value={this.state.competitionUniqueKey}
                >
                  <Option key={-1} value="-1">
                    {AppConstants.all}
                  </Option>
                  {(competitions || []).map(item => (
                    <Option
                      key={'competition_' + item.competitionUniqueKey}
                      value={item.competitionUniqueKey}
                    >
                      {item.competitionName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="reg-col col-lg-3 col-md-5">
              <div className="reg-filter-col-cont" style={{ marginRight: '30px' }}>
                <div className="year-select-heading">{AppConstants.organisation}</div>
                <Select
                  showSearch
                  optionFilterProp="children"
                  className="year-select reg-filter-select"
                  onChange={e => this.onChangeDropDownValue(e, 'filterOrganisation')}
                  value={this.state.filterOrganisation}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {(uniqueValues || []).map(org => (
                    <Option key={'organisation_' + org.organisationId} value={org.organisationId}>
                      {org.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="reg-col col-lg-3 col-md-7">
              <div className="reg-filter-col-cont" style={{ marginRight: '30px' }}>
                <div className="year-select-heading">{AppConstants.division}</div>
                <Select
                  className="year-select reg-filter-select"
                  onChange={e => this.onChangeDropDownValue(e, 'divisionId')}
                  value={this.state.divisionId}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {(divisions || []).map(g => (
                    <Option key={'division_' + g.divisionId} value={g.divisionId}>
                      {g.divisionName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="reg-col col-lg-3 col-md-7">
              <div className="reg-filter-col-cont" style={{ marginRight: '30px' }}>
                <div className="year-select-heading">{AppConstants.product}</div>
                <Select
                  className="year-select reg-filter-select"
                  onChange={e => this.onChangeDropDownValue(e, 'membershipProductUniqueKey')}
                  value={this.state.membershipProductUniqueKey}
                >
                  <Option key={-1} value="-1">
                    {AppConstants.all}
                  </Option>
                  {(products || []).map(g => (
                    <Option
                      key={'status_' + g.membershipProductUniqueKey}
                      value={g.membershipProductUniqueKey}
                    >
                      {g.productName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="reg-col col-lg-3 col-md-7">
              <div className="reg-filter-col-cont" style={{ marginRight: '30px' }}>
                <div className="year-select-heading">{AppConstants.paymentMethod}</div>
                <Select
                  className="year-select reg-filter-select"
                  onChange={e => this.onChangeDropDownValue(e, 'paymentMethod')}
                  value={this.state.paymentMethod}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {(paymentMethods || []).map(paymentMethod => (
                    <Option key={'paymentMethod_' + paymentMethod.id} value={paymentMethod.NAME}>
                      {paymentMethod.DESCRIPTION}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="reg-col col-lg-3 col-md-7">
              <div className="reg-filter-col-cont" style={{ marginRight: '30px' }}>
                <div className="year-select-heading">
                  {AppConstants.filterNumberOfRegisteredPlayersByRole}
                </div>
                <Select
                  className="year-select reg-filter-select"
                  onChange={e => this.onChangeDropDownValue(e, 'roleId')}
                  value={this.state.roleId}
                >
                  {(localUserRoles || []).map(item => (
                    <Option key={item.key} value={item.key}>
                      {item.displayText}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  contentView = () => {
    const { teamRegistrationTableData, teamRegistrationTableListPageSize, onLoad } =
      this.props.registrationState;
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view table-competition">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={teamRegistrationTableData.teamRegistrations}
            pagination={false}
            loading={onLoad === true && true}
          />
        </div>

        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            showSizeChanger
            current={teamRegistrationTableData.page.currentPage}
            defaultCurrent={teamRegistrationTableData.page.currentPage}
            defaultPageSize={teamRegistrationTableListPageSize}
            total={teamRegistrationTableData.page.totalCount}
            onChange={this.handleRegTableList}
            onShowSizeChange={this.handleShowSizeChange}
          />
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.registration}
          menuName={AppConstants.registration}
        />

        <InnerHorizontalMenu menu="registration" regSelectedKey="10" />

        <Layout>
          {this.headerView()}

          <Content>
            {this.dropdownView()}
            {this.contentView()}
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      endUserRegDashboardListAction,
      getAffiliateToOrganisationAction,
      getCommonRefData,
      getGenderAction,
      setYearRefId,
      getOnlyYearListAction,
      getAllCompetitionAction,
      registrationPaymentStatusAction,
      getTeamRegistrationsAction,
      exportTeamRegistrationAction,
      setTeamRegistrationTableListPageSizeAction,
      setTeamRegistrationTableListPageNumberAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    userRegistrationState: state.EndUserRegistrationState,
    userState: state.UserState,
    commonReducerState: state.CommonReducerState,
    appState: state.AppState,
    registrationDashboardState: state.RegistrationDashboardState,
    registrationState: state.RegistrationState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamRegistrations);
