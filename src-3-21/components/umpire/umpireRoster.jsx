import React, { Component } from 'react';
import {
  Layout,
  Button,
  Table,
  Select,
  Menu,
  Pagination,
  message,
  DatePicker,
  Checkbox,
} from 'antd';
import './umpire.css';
import { NavLink } from 'react-router-dom';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isArrayNotEmpty } from '../../util/helpers';
import {
  umpireRosterListAction,
  umpireSimpleRoundListAction,
  umpireRosterOnActionClick,
  setPageSizeAction,
  setPageNumberAction,
} from '../../store/actions/umpireAction/umpirRosterAction';
import { umpireYearChangedAction } from 'store/actions/umpireAction/umpireDashboardAction';
import { umpireCompetitionListAction } from '../../store/actions/umpireAction/umpireCompetetionAction';
import { getAffiliatesListingAction } from 'store/actions/userAction/userAction';
import {
  getUmpireCompetitionData,
  getOrganisationData,
  getGlobalYear,
  setGlobalYear,
  getLiveScoreCompetition,
  setCompDataForAll,
} from '../../util/sessionStorage';
import moment from 'moment';
import { isEqual } from 'lodash';
import ValidationConstants from '../../themes/validationConstant';
import history from '../../util/history';
import { exportFilesAction, getOnlyYearListAction } from '../../store/actions/appAction';
import { checkLivScoreCompIsParent, getCurrentYear } from 'util/permissions';
import Loader from 'customComponents/loader';

const { Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

let this_obj = null;

function tableSort(key) {
  let sortBy = key;
  let sortOrder = null;
  if (this_obj.state.sortBy !== key) {
    sortOrder = 'ASC';
  } else if (this_obj.state.sortBy === key && this_obj.state.sortOrder === 'ASC') {
    sortOrder = 'DESC';
  } else if (this_obj.state.sortBy === key && this_obj.state.sortOrder === 'DESC') {
    sortBy = sortOrder = null;
  }

  this_obj.setState({ sortBy, sortOrder }, () => {
    this_obj.getUmpireRosterList();
  });
}

// listeners for sorting
const listeners = key => ({
  onClick: () => tableSort(key),
});

const columns = [
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'First Name',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (firstName, record) => (
      <span className="input-heading-add-another pt-0" onClick={() => this_obj.checkUserId(record)}>
        {record.user.firstName}
      </span>
    ),
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'lastName',
    key: 'Last Name',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (lastName, record) => (
      <span className="input-heading-add-another pt-0" onClick={() => this_obj.checkUserId(record)}>
        {record.user.lastName}
      </span>
    ),
  },
  {
    title: AppConstants.organisation,
    dataIndex: 'organisation',
    key: 'Organisation',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (user, record) => {
      let organisationArray =
        record.user.userRoleEntities.length > 0 &&
        this_obj.getOrganisationArray(record.user.userRoleEntities, record.roleId);
      return (
        <div>
          {organisationArray.map((item, index) => (
            <span key={`organisationName` + index} className="multi-column-text-aligned">
              {item.linkedCompetitionOrganisation && item.linkedCompetitionOrganisation.name}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'matchId',
    key: 'matchId',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: matchId => {
      return (
        <NavLink
          to={{
            pathname: '/matchDayMatchDetails',
            state: { matchId: matchId, umpireKey: 'umpire', screenName: 'umpireRoster' },
          }}
        >
          <span className="input-heading-add-another pt-0">{matchId}</span>
        </NavLink>
      );
    },
  },
  {
    title: AppConstants.startTime,
    dataIndex: 'startTime',
    key: 'Start Time',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (startTime, record) => (
      <span>{moment(record.match.startTime).format('DD/MM/YYYY HH:mm')}</span>
    ),
  },
  {
    title: AppConstants.role,
    dataIndex: 'roleId',
    key: 'roleId',
    sorter: false,
    render: (roleId, record) => <span>{this_obj.getUmpireRole(roleId)}</span>,
  },
  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.action,
    dataIndex: 'action',
    key: 'action',
    render: (data, record) => {
      let isUmpireApproved = false;
      if (record.matchUmpire) {
        isUmpireApproved = record.matchUmpire.approvedByUserId > 0;
      }
      return (
        <Menu
          className="action-triple-dot-submenu"
          theme="light"
          mode="horizontal"
          style={{ lineHeight: '25px' }}
        >
          <Menu.SubMenu
            key="sub1"
            style={{ borderBottomStyle: 'solid', borderBottom: 0 }}
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
            <Menu.Item key="1" onClick={() => this_obj.onActionPerform(record, 'YES')}>
              <span>{AppConstants.accept}</span>
            </Menu.Item>
            <Menu.Item key="2" onClick={() => this_obj.onActionPerform(record, 'NO')}>
              <span>{AppConstants.declineRoster}</span>
            </Menu.Item>
            {!isUmpireApproved && (
              <Menu.Item key="3" onClick={() => this_obj.onActionPerform(record, 'DELETE')}>
                <span>{AppConstants.unassign}</span>
              </Menu.Item>
            )}
          </Menu.SubMenu>
        </Menu>
      );
    },
  },
];

class UmpireRoster extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yearRefId: getGlobalYear() ? JSON.parse(getGlobalYear()) : null,
      competitionid: null,
      searchText: '',
      selectedComp: null,
      loading: false,
      competitionUniqueKey: null,
      roundId: 'All',
      status: AppConstants.all,
      rosterLoad: false,
      compArray: [],
      offsetData: 0,
      umpireRole: 15,
      sortBy: null,
      sortOrder: null,
      compIsParent: false,
      compOrgId: 0,
      startDate: moment(new Date()).format('YYYY-MM-DD'),
      endDate: moment(new Date()).format('YYYY-MM-DD'),
      filterDates: false,
      affiliateList: [],
    };
    this_obj = this;
  }

  async componentDidMount() {
    const { umpireRosterListActionObject } = this.props.umpireRosterState;
    let sortBy = this.state.sortBy;
    let sortOrder = this.state.sortOrder;
    if (umpireRosterListActionObject) {
      let offsetData = umpireRosterListActionObject.paginationBody.paging.offset;
      sortBy = umpireRosterListActionObject.sortBy;
      sortOrder = umpireRosterListActionObject.sortOrder;
      let status = umpireRosterListActionObject.status;
      let umpireRole = JSON.parse(umpireRosterListActionObject.refRoleId);
      await this.setState({ sortBy, sortOrder, offsetData, status, umpireRole });
    }
    let { organisationId, organisationUniqueKey } = getOrganisationData() || {};
    this.setState({ loading: true });

    const umpireCompetitionData = getUmpireCompetitionData();
    const parsedData = umpireCompetitionData ? JSON.parse(umpireCompetitionData) : {};
    let competitionOrganisation = parsedData ? parsedData.competitionOrganisation : {};
    if (competitionOrganisation && competitionOrganisation.id) {
      this.setState({
        compOrgId: competitionOrganisation.id,
      });
    }
    const compIsParent = checkLivScoreCompIsParent();
    this.setState({ compIsParent });

    this.props.getOnlyYearListAction();
    this.props.umpireCompetitionListAction(null, this.state.yearRefId, organisationId, 'USERS');

    this.props.getAffiliatesListingAction({
      organisationId: organisationUniqueKey,
      affiliatedToOrgId: -1,
      organisationTypeRefId: -1,
      statusRefId: -1,
      paging: { limit: 10000, offset: 0 },
      stateOrganisations: true,
    });
  }

  componentDidUpdate(nextProps) {
    if (!isEqual(nextProps.umpireCompetitionState, this.props.umpireCompetitionState)) {
      if (this.state.loading === true && this.props.umpireCompetitionState.onLoad === false) {
        let compList = isArrayNotEmpty(this.props.umpireCompetitionState.umpireComptitionList)
          ? this.props.umpireCompetitionState.umpireComptitionList
          : [];
        const livescoresCompetition = getLiveScoreCompetition()
          ? JSON.parse(getLiveScoreCompetition())
          : null;
        const organisation = getOrganisationData();
        const organisationId = organisation?.organisationId ?? null;
        const globalYear = Number(getGlobalYear());
        const canUseExistingComp =
          !!livescoresCompetition?.id &&
          !!organisationId &&
          livescoresCompetition.yearRefId === globalYear &&
          [
            livescoresCompetition?.competitionOrganisation?.orgId,
            livescoresCompetition.organisationId,
          ].includes(organisationId);

        let competition = null;

        if (canUseExistingComp) {
          competition = compList.find(c => c.id === livescoresCompetition.id);
        }
        if (!competition) {
          //get the first comp in the list
          competition = compList && compList.length ? compList[0] : null;
        }
        const competitionId = competition?.id ?? null;
        const competitionUniqueKey = competition?.uniqueKey ?? null;

        setCompDataForAll(competition);

        if (competition) {
          const compIsParent = checkLivScoreCompIsParent();
          this.setState({ compIsParent }, () => {
            this.getUmpireRosterList(competitionId);
          });

          this.setState({
            selectedComp: competitionId,
            loading: false,
            competitionUniqueKey: competitionUniqueKey,
            compArray: compList,
          });

          this.props.umpireSimpleRoundListAction(competitionId);
        } else {
          this.setState({ loading: false, selectedComp: null });
        }
      }
    }

    if (nextProps.appState.yearList !== this.props.appState.yearList) {
      if (this.props.appState.yearList.length > 0) {
        const yearRefId = getGlobalYear()
          ? JSON.parse(getGlobalYear())
          : getCurrentYear(this.props.appState.yearList);
        setGlobalYear(yearRefId);
      }
    }

    if (!isEqual(nextProps.umpireRosterState, this.props.umpireRosterState)) {
      if (this.props.umpireRosterState.rosterLoading !== this.state.rosterLoad) {
        this.getUmpireRosterList();
        this.setState({ rosterLoad: false });
      }
    }

    if (nextProps.userState != this.props.userState) {
      if (this.props.userState.onLoad == false) {
        const { affiliateList } = this.props.userState;
        let affiliates = affiliateList || [];
        affiliates.sort(function (a, b) {
          var nameA = a.name; // ignore upper and lowercase
          var nameB = b.name; // ignore upper and lowercase
          if (nameA) {
            nameA = nameA.trimStart();
          }
          if (nameB) {
            nameB = nameB.trimStart();
          }
          if (nameA > nameB) {
            return 1;
          } else if (nameA < nameB) {
            return -1;
          }

          // names must be equal
          return 0;
        });
        this.setState({ affiliateList: affiliates });
      }
    }
  }

  getUmpireRosterList() {
    const { umpireRole } = this.state;
    const roleIds = Array.isArray(umpireRole)
      ? JSON.stringify(umpireRole)
      : JSON.stringify([umpireRole]);

    const { pageSize } = this.props.umpireRosterState;
    const limit = pageSize ? pageSize : 10;
    const offset = this.state.offsetData;
    const paginationBody = {
      paging: { offset, limit },
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      filterDate: this.state.filterDates,
    };

    const { compIsParent, roundId, sortBy, sortOrder } = this.state;
    const payload = {
      competitionID: compIsParent ? this.state.selectedComp : this.state.compOrgId,
      roundName: roundId !== 'All' ? roundId : null,
      status: this.state.status,
      refRoleId: roleIds,
      paginationBody,
      sortBy,
      sortOrder,
      entityType: compIsParent ? 1 : 6,
    };
    this.props.umpireRosterListAction(payload);
  }

  onActionPerform(record, status) {
    let category = this.getUmpireCategory(record.roleId);
    this.props.umpireRosterOnActionClick({
      rosterId: record.id,
      status: status,
      category: category,
    });
    this.setState({ rosterLoad: true });
  }

  checkUserId(record) {
    if (record.userId === null) {
      message.config({ duration: 1.5, maxCount: 1 });
      message.warn(ValidationConstants.umpireMessage);
    } else {
      history.push('/userPersonal', {
        userId: record.userId,
        screenKey: 'umpireRoster',
        screen: '/umpireRoster',
      });
    }
  }

  getOrganisationArray(data, roleId) {
    let orgArray = [];
    if (data.length > 0) {
      for (let i in data) {
        if ((data[i].roleId == roleId) == 19 ? 15 : roleId) {
          orgArray.push(data[i]);
          return orgArray;
        }
      }
    }
    return orgArray;
  }

  //getUmpireCategory
  getUmpireCategory(roleId) {
    if (roleId == 15) {
      return AppConstants.umpiring;
    } else if (roleId == 19) {
      return AppConstants.umpireReserveCat;
    } else if (roleId == 20) {
      return AppConstants.umpireCoachCat;
    }
  }

  //getUmpireRole
  getUmpireRole(roleId) {
    if (roleId == 15) {
      return AppConstants.umpire;
    } else if (roleId == 19) {
      return AppConstants.umpireReserve;
    } else if (roleId == 20) {
      return AppConstants.umpireCoach;
    }
  }

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setPageSizeAction(pageSize);
  };

  /// Handle Page change
  handlePageChange = async page => {
    await this.props.setPageNumberAction(page);

    let { pageSize } = this.props.umpireRosterState;
    pageSize = pageSize ? pageSize : 10;
    let offset = page ? pageSize * (page - 1) : 0;

    this.setState({ offsetData: offset }, () => {
      this.getUmpireRosterList();
    });
  };

  contentView = () => {
    const { umpireRosterList, umpireTotalCount, currentPage, pageSize } =
      this.props.umpireRosterState;
    let umpireListResult = isArrayNotEmpty(umpireRosterList) ? umpireRosterList : [];
    return (
      <div className="comp-dash-table-view mt-0">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={umpireListResult}
            pagination={false}
            rowKey={record => 'umpireListResult' + record.id}
          />
        </div>
        <div className="comp-dashboard-botton-view-mobile">
          <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end"></div>
          <div className="d-flex justify-content-end">
            <Pagination
              className="antd-pagination"
              showSizeChanger
              current={currentPage}
              defaultCurrent={currentPage}
              defaultPageSize={pageSize}
              total={umpireTotalCount}
              onChange={this.handlePageChange}
              onShowSizeChange={this.handleShowSizeChange}
            />
          </div>
        </div>
      </div>
    );
  };

  onChangeComp(competitionId) {
    let competition = null;
    for (let i in this.state.compArray) {
      if (competitionId === this.state.compArray[i].id) {
        competition = this.state.compArray[i];
        break;
      }
    }
    setCompDataForAll(competition);
    if (competitionId) {
      this.props.umpireSimpleRoundListAction(competitionId);
    }

    if (competition) {
      this.setState({ compOrgId: competition.competitionOrganisationId });
    }

    this.setState(
      { selectedComp: competitionId, competitionUniqueKey: competition.uniqueKey, roundId: 'All' },
      () => {
        this.getUmpireRosterList();
      },
    );
  }

  onChangeRound(roundId) {
    this.setState({ roundId }, () => {
      this.getUmpireRosterList();
    });
  }

  onChangeStatus(status) {
    this.setState({ status }, () => {
      this.getUmpireRosterList();
    });
  }

  onChangeRole(umpireRole) {
    this.setState({ umpireRole }, () => {
      this.getUmpireRosterList();
    });
  }

  // on Export
  onExport() {
    const { umpireRole, compIsParent, selectedComp, compOrgId } = this.state;
    const roleId = umpireRole || 15;
    const entityId = compIsParent ? selectedComp : compOrgId;
    const entityTypeId = compIsParent ? 1 : 6;
    const roundId = this.state.roundId !== 'All' ? this.state.roundId : null;
    const url =
      AppConstants.rosterExport +
      `entityId=${entityId}&entityTypeId=${entityTypeId}&roleId=${roleId}&roundName=${roundId}&startDate=${
        this.state.filterDates ? this.state.startDate : null
      }&endDate=${this.state.filterDates ? this.state.endDate : null}`;

    this.props.exportFilesAction(url);
  }

  headerView = () => {
    // let competition = isArrayNotEmpty(this.props.umpireCompetitionState.umpireComptitionList) ? this.props.umpireCompetitionState.umpireComptitionList : []
    let isCompetitionAvailable = this.state.selectedComp ? false : true;
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm pt-1 d-flex align-content-center">
              <span className="form-heading">{AppConstants.umpireRoster}</span>
            </div>

            <div className="col-sm-8 w-100 d-flex flex-row align-items-center justify-content-end">
              <div className="row">
                <div className="col-sm pt-1">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    <Button
                      disabled={isCompetitionAvailable}
                      onClick={() => this.onExport()}
                      className="primary-add-comp-form"
                      type="primary"
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
                {/* <div className="col-sm pt-1">
                                    <div className="comp-dashboard-botton-view-mobile w-100 d-flex justify-content-end flex-row align-items-center">
                                        <NavLink to={{
                                            pathname: `/umpireImport`,
                                            state: { screenName: 'umpireRoster' }
                                        }} className="text-decoration-none">
                                            <Button className="primary-add-comp-form" type="primary">
                                                <div className="row">
                                                    <div className="col-sm">
                                                        <img
                                                            src={AppImages.import}
                                                            alt=""
                                                            className="export-image"
                                                        />
                                                        {AppConstants.import}
                                                    </div>
                                                </div>
                                            </Button>
                                        </NavLink>
                                    </div>
                                </div> */}
              </div>
            </div>
          </div>
          {/* <div className="w-ft mt-5 d-flex">
                        <div className="w-100 d-flex flex-row align-items-center" style={{ marginRight: 50 }}>
                            <span className="year-select-heading">{AppConstants.competition}:</span>
                            <Select
                                className="year-select reg-filter-select1 ml-2"
                                style={{ minWidth: 200 }}
                                onChange={(comp) => this.onChangeComp({ comp })}
                                value={this.state.selectedComp}
                            >
                                {competition.map((item) => (
                                    <Option key={'competition_' + item.id} value={item.id}>{item.longName}</Option>
                                ))}
                            </Select>
                        </div>

                        <div className="w-100 d-flex flex-row align-items-center" style={{ marginRight: 50 }}>
                            <span className="year-select-heading">{AppConstants.status}:</span>
                            <Select
                                className="year-select reg-filter-select1 ml-2"
                                style={{ minWidth: 160 }}
                                onChange={(status) => this.onChangeStatus(status)}
                                value={this.state.status}
                            >
                                <Option value="All">All</Option>
                                <Option value="YES">Accepted</Option>
                                <Option value="NO">Declined</Option>
                                <Option value="NONE">No Response</Option>
                            </Select>
                        </div>
                    </div> */}
        </div>
      </div>
    );
  };

  setYear = yearRefId => {
    setGlobalYear(yearRefId);
    this.setState({ yearRefId, roundId: 'All', loading: true });

    setCompDataForAll(null);
    this.props.umpireYearChangedAction();

    const { organisationId } = getOrganisationData() || {};
    if (organisationId) {
      this.props.umpireCompetitionListAction(null, yearRefId, organisationId, 'USERS');
    }
  };

  onChangeStartDate = date => {
    if (date) {
      let startDate = moment(date[0]).format('YYYY-MM-DD');
      let endDate = moment(date[1]).format('YYYY-MM-DD');
      this.setState(
        {
          startDate,
          endDate,
        },
        () => {
          this.getUmpireRosterList();
        },
      );
    }
  };

  onDateRangeCheck = val => {
    let startDate = moment(new Date()).format('YYYY-MM-DD');
    let endDate = moment(new Date()).format('YYYY-MM-DD');
    this.setState({ filterDates: val, startDate: startDate, endDate: endDate }, () => {
      this.getUmpireRosterList();
    });
  };

  dropdownView = () => {
    let competition = isArrayNotEmpty(this.props.umpireCompetitionState.umpireComptitionList)
      ? this.props.umpireCompetitionState.umpireComptitionList
      : [];

    const { umpireRoundList } = this.props.umpireRosterState;
    const roundList = isArrayNotEmpty(umpireRoundList) ? umpireRoundList : [];

    const { affiliateList } = this.state;
    let affiliates = [];
    let org = getOrganisationData();
    if (org) {
      affiliates.push({ name: org.name, id: org.id });
    }
    const organisations = isArrayNotEmpty(affiliateList) ? affiliateList : affiliates;
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="fluid-width">
          <div className="row reg-filter-row">
            <div className="reg-col ml-0">
              <div className="reg-filter-col-cont" style={{ width: '90%' }}>
                <span className="year-select-heading" style={{ width: '175px' }}>
                  {AppConstants.year}:
                </span>
                <Select
                  className="year-select reg-filter-select-year ml-2"
                  onChange={e => this.setYear(e)}
                  value={this.state.yearRefId}
                >
                  {this.props.appState.yearList.map(item => (
                    <Option key={'year_' + item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            {/* Comp List */}
            <div className="reg-col1 ml-0">
              <div className="reg-filter-col-cont" style={{ width: '90%' }}>
                <span className="year-select-heading" style={{ width: '175px' }}>
                  {AppConstants.competition}:
                </span>
                <Select
                  className="year-select reg-filter-select1"
                  style={{ minWidth: 200 }}
                  onChange={competitionId => this.onChangeComp(competitionId)}
                  value={this.state.selectedComp || ''}
                  loading={this.props.umpireCompetitionState.onLoad}
                >
                  {!this.state.selectedComp && <Option value="">All</Option>}
                  {competition.map(item => (
                    <Option key={'competition_' + item.id} value={item.id}>
                      {item.longName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Round List */}
            <div className="reg-col1 ml-0">
              <div className="reg-filter-col-cont ml-0" style={{ width: '90%' }}>
                <span className="year-select-heading" style={{ width: '127px' }}>
                  {AppConstants.round}:
                </span>
                <Select
                  className="year-select reg-filter-select1"
                  style={{ minWidth: 160 }}
                  onChange={value => this.onChangeRound(value)}
                  value={this.state.roundId}
                >
                  <Option value="All">All</Option>
                  {roundList.map(item => (
                    <Option key={'round_' + item.id} value={item.name}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Venue List */}
            <div className="reg-col1 ml-0">
              <div className="reg-filter-col-cont ml-0" style={{ width: '90%' }}>
                <span className="year-select-heading" style={{ width: '127px' }}>
                  {AppConstants.status}:
                </span>
                <Select
                  className="year-select reg-filter-select1"
                  style={{ minWidth: 160 }}
                  onChange={status => this.onChangeStatus(status)}
                  value={this.state.status}
                >
                  <Option value="All">All</Option>
                  <Option value="YES">Accepted</Option>
                  <Option value="NO">Declined</Option>
                  <Option value="NONE">No Response</Option>
                </Select>
              </div>
            </div>
            {/* umpire role */}
            <div className="reg-col1 ml-0">
              <div className="reg-filter-col-cont ml-4" style={{ width: '90%' }}>
                <span className="year-select-heading" style={{ width: '102px' }}>
                  {AppConstants.role}:
                </span>
                <Select
                  className="year-select reg-filter-select1"
                  style={{ minWidth: 160 }}
                  onChange={umpireRole => this.onChangeRole(umpireRole)}
                  value={this.state.umpireRole}
                >
                  <Option value={15}>{AppConstants.umpire}</Option>
                  <Option value={19}>{AppConstants.umpireReservePref}</Option>
                  <Option value={20}>{AppConstants.umpireCoach}</Option>
                </Select>
              </div>
            </div>
            <div className="reg-col1 ml-0">
              <div className="reg-filter-col-cont ml-4" style={{ width: '90%' }}>
                <RangePicker
                  disabled={
                    this.state.firstTimeCompId == '-1' || this.state.filterDates ? false : true
                  }
                  onChange={date => this.onChangeStartDate(date)}
                  format="DD-MM-YYYY"
                  style={{ width: '100%', minWidth: 180 }}
                  value={[moment(this.state.startDate), moment(this.state.endDate)]}
                />
                <Checkbox
                  className="single-checkbox-radio-style"
                  style={{ minWidth: 150, marginLeft: 8 }}
                  checked={this.state.filterDates}
                  onChange={e => this.onDateRangeCheck(e.target.checked)}
                  disabled={this.state.firstTimeCompId == '-1'}
                  // onChange={e => this.props.add_editcompetitionFeeDeatils(e.target.checked, "associationChecked")}
                >
                  {AppConstants.filterDates}
                </Checkbox>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { onLoad, onLoadRound } = this.props.umpireRosterState;
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.umpires} menuName={AppConstants.umpires} />
        <InnerHorizontalMenu menu="umpire" umpireSelectedKey="3" />
        <Layout>
          {this.headerView()}
          <Content>
            <Loader visible={onLoad || onLoadRound || this.props.umpireCompetitionState.onLoad} />
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
      umpireCompetitionListAction,
      umpireRosterListAction,
      umpireSimpleRoundListAction,
      umpireRosterOnActionClick,
      exportFilesAction,
      setPageSizeAction,
      setPageNumberAction,
      getOnlyYearListAction,
      umpireYearChangedAction,
      getAffiliatesListingAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    umpireRosterState: state.UmpireRosterState,
    umpireCompetitionState: state.UmpireCompetitionState,
    userState: state.UserState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UmpireRoster);
