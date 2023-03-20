import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Layout, Breadcrumb, Button, Table, Select, Pagination, Input, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import AppUniqueId from 'themes/appUniqueId';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { liveScoreTeamAttendanceListAction } from '../../store/actions/LiveScoreAction/liveScoreTeamAttendanceAction';
import { getLiveScoreCompetition, getOrganisationData } from '../../util/sessionStorage';
import { liveScore_formateDateTime } from '../../themes/dateformate';
import history from '../../util/history';
import { isArrayNotEmpty } from '../../util/helpers';
import { exportFilesAction } from '../../store/actions/appAction';
import { getLiveScoreDivisionList } from '../../store/actions/LiveScoreAction/liveScoreDivisionAction';
import { liveScoreRoundListAction } from '../../store/actions/LiveScoreAction/liveScoreRoundAction';
import ValidationConstants from '../../themes/validationConstant';
import { isBasketball } from './liveScoreSettings/liveScoreSettingsUtils';

const { Content } = Layout;
const { Option } = Select;
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
  let { limit, offset, competitionId, searchText, selectStatus } = this_Obj.state;
  const body = {
    paging: {
      limit: limit,
      offset: offset,
    },
    search: searchText,
    sortBy,
    sortOrder,
  };
  this_Obj.props.liveScoreTeamAttendanceListAction(
    competitionId,
    body,
    selectStatus,
    this_Obj.state.selectedDivision === 'All' ? '' : this_Obj.state.selectedDivision,
    this_Obj.state.selectedRound === 'All' ? '' : this_Obj.state.selectedRound,
    this_Obj.state.liveScoreCompIsParent,
    this_Obj.state.compOrgId,
  );
}

const columns = [
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'matchId',
    key: 'matchId',
    sorter: true,
    onHeaderCell: () => listeners('matchId'),
    render: matchId => (
      <NavLink
        to={{
          pathname: '/matchDayMatchDetails',
          state: { matchId: matchId, umpireKey: null },
        }}
      >
        <span data-testid={AppUniqueId.MATCH_ID + matchId} className="input-heading-add-another pt-0">{matchId}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.startTime,
    dataIndex: 'startTime',
    key: 'startTime',
    sorter: true,
    onHeaderCell: () => listeners('startTime'),
    render: teamName => <span>{liveScore_formateDateTime(teamName)}</span>,
  },
  {
    title: AppConstants.team,
    dataIndex: 'playerTeamName',
    key: 'playerTeamName',
    sorter: true,
    onHeaderCell: () => listeners('team'),
    render: playerTeamName => <span>{playerTeamName}</span>,
  },
  {
    title: AppConstants.userId,
    dataIndex: 'userId',
    key: 'userId',
  },
  {
    title: AppConstants.playerId,
    dataIndex: 'playerId',
    key: 'playerId',
    sorter: true,
    onHeaderCell: () => listeners('playerId'),
  },
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'firstName',
    sorter: true,
    onHeaderCell: () => listeners('firstName'),
    render: (firstName, record) => (
      <span
        className="input-heading-add-another pt-0"
        data-testid={AppUniqueId.PLAYER_NAME + firstName}
        onClick={() => this_Obj.checkUserId(record)}
      >
        {firstName}
      </span>
    ),
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'lastName',
    key: 'lastName',
    sorter: true,
    onHeaderCell: () => listeners('lastName'),
    render: (lastName, record) => (
      <span className="input-heading-add-another pt-0" onClick={() => this_Obj.checkUserId(record)}>
        {lastName}
      </span>
    ),
  },
  {
    title: AppConstants.division,
    dataIndex: 'divisionGradeName',
    key: 'divisionGradeName',
    sorter: true,
    onHeaderCell: () => listeners('division'),
  },
  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
    sorter: true,
    onHeaderCell: () => listeners('status'),
  },
  {
    title: AppConstants.position,
    dataIndex: 'positionName',
    key: 'positionName',
    sorter: true,
    onHeaderCell: () => listeners('position'),
  },
];

const borrowedColumns = [
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'matchId',
    key: 'matchId',
    sorter: true,
    onHeaderCell: () => listeners('matchId'),
    render: matchId => (
      <NavLink
        to={{
          pathname: '/matchDayMatchDetails',
          state: { matchId: matchId, umpireKey: null },
        }}
      >
        <span className="input-heading-add-another pt-0">{matchId}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.startTime,
    dataIndex: 'startTime',
    key: 'startTime',
    sorter: true,
    onHeaderCell: () => listeners('startTime'),
    render: teamName => <span>{liveScore_formateDateTime(teamName)}</span>,
  },
  {
    title: AppConstants.team,
    dataIndex: 'playerTeamName',
    key: 'playerTeamName',
    sorter: true,
    onHeaderCell: () => listeners('playerTeamName'),
    render: playerTeamName => <span>{playerTeamName}</span>,
  },
  {
    title: AppConstants.borrowingTeam,
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    onHeaderCell: () => listeners('name'),
    render: name => <span>{name}</span>,
  },
  {
    title: AppConstants.userId,
    dataIndex: 'userId',
    key: 'userId',
  },
  {
    title: AppConstants.playerId,
    dataIndex: 'playerId',
    key: 'playerId',
    sorter: true,
    onHeaderCell: () => listeners('playerId'),
  },
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'firstName',
    sorter: true,
    onHeaderCell: () => listeners('firstName'),
    render: (firstName, record) => (
      <span className="input-heading-add-another pt-0" onClick={() => this_Obj.checkUserId(record)}>
        {firstName}
      </span>
    ),
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'lastName',
    key: 'lastName',
    sorter: true,
    onHeaderCell: () => listeners('lastName'),
    render: (lastName, record) => (
      <span className="input-heading-add-another pt-0" onClick={() => this_Obj.checkUserId(record)}>
        {lastName}
      </span>
    ),
  },
  {
    title: AppConstants.division,
    dataIndex: 'divisionName',
    key: 'divisionName',
    sorter: true,
    onHeaderCell: () => listeners('division'),
  },
  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
    sorter: true,
    onHeaderCell: () => listeners('status'),
  },
  {
    title: AppConstants.position,
    dataIndex: 'positionName',
    key: 'positionName',
    sorter: true,
    onHeaderCell: () => listeners('position'),
  },
];

if (isBasketball) {
  borrowedColumns.splice(-1, 1);
  columns.splice(-1, 1);
}

class LiveScoreTeamAttendance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: '2020',
      teamSelection: 'WSA 1',
      selectStatus: 'All',
      competitionId: null,
      searchText: '',
      selectedDivision: 'All',
      selectedRound: 'All',
      divisionLoad: false,
      offset: 0,
      limit: 10,
      roundLoad: false,
      sortBy: null,
      sortOrder: null,
      compOrgId: 0,
      liveScoreCompIsParent: false,
    };
    this_Obj = this;
  }

  // componentDidMount
  async componentDidMount() {
    let { teamAttendanceListActionObject } = this.props.liveScoreTeamAttendanceState;
    if (getLiveScoreCompetition()) {
      const { id, competitionOrganisation, organisationId } = JSON.parse(getLiveScoreCompetition());
      const orgItem = await getOrganisationData();
      const userOrganisationId = orgItem ? orgItem.organisationId : 0;
      let liveScoreCompIsParent = userOrganisationId === organisationId;
      let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
      if (teamAttendanceListActionObject) {
        let body = teamAttendanceListActionObject.body;
        let searchText = body.search;
        let selectedDivision = teamAttendanceListActionObject.divisionId
          ? teamAttendanceListActionObject.divisionId
          : 'All';
        let selectedRound = teamAttendanceListActionObject.roundId
          ? teamAttendanceListActionObject.roundId
          : 'All';
        let sortBy = body.sortBy;
        let sortOrder = body.sortOrder;
        let selectStatus = teamAttendanceListActionObject.select_status;
        await this.setState({
          searchText,
          selectedDivision,
          selectedRound,
          sortBy,
          sortOrder,
          selectStatus,
        });
      }
      await this.setState({
        competitionId: id,
        divisionLoad: true,
        compOrgId,
        liveScoreCompIsParent,
      });
      if (id !== null) {
        this.props.getLiveScoreDivisionList(
          id,
          undefined,
          undefined,
          undefined,
          liveScoreCompIsParent,
          compOrgId,
        );
      } else {
        history.pushState('/matchDayCompetitions');
      }
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  componentDidUpdate(nextProps) {
    // let { teamAttendanceListActionObject } = this.props.liveScoreTeamAttendanceState
    // let page = teamAttendanceListActionObject ? Math.floor(teamAttendanceListActionObject.body.paging.offset / 10) + 1 : 0;
    let roundList = this.props.liveScoreTeamAttendanceState.roundList;
    if (nextProps.liveScoreTeamAttendanceState !== this.props.liveScoreTeamAttendanceState) {
      if (
        this.props.liveScoreTeamAttendanceState.onDivisionLoad === false &&
        this.state.divisionLoad === true
      ) {
        this.props.liveScoreRoundListAction(
          this.state.competitionId,
          this.state.selectedDivision == 'All' ? '' : this.state.selectedDivision,
          this.state.liveScoreCompIsParent,
          this.state.compOrgId,
        );
        this.setState({ divisionLoad: false, roundLoad: true });
      }
    }
    if (nextProps.roundList !== roundList) {
      if (
        this.props.liveScoreTeamAttendanceState.roundLoad === false &&
        this.state.roundLoad === true
      ) {
        this.handleTablePagination(1);
        this.setState({ roundLoad: false });
      }
    }
  }

  handleTablePagination = (page, roundName) => {
    // let { teamAttendanceListActionObject } = this.props.liveScoreTeamAttendanceState
    let roundSelect = roundName ? roundName : this.state.selectedRound;
    let offset = page ? 10 * (page - 1) : 0;
    this.setState({ offset });
    let { searchText, sortBy, sortOrder } = this.state;
    const paginationBody = {
      paging: {
        limit: 10,
        offset: offset,
      },
      search: searchText,
      sortBy,
      sortOrder,
    };
    let { id } = JSON.parse(getLiveScoreCompetition());
    if (id !== null) {
      if (this.state.selectStatus === 'All') {
        this.props.liveScoreTeamAttendanceListAction(
          id,
          paginationBody,
          this.state.selectStatus,
          this.state.selectedDivision === 'All' ? '' : this.state.selectedDivision,
          roundSelect === 'All' ? '' : roundSelect,
          this.state.liveScoreCompIsParent,
          this.state.compOrgId,
        );
      } else {
        this.props.liveScoreTeamAttendanceListAction(
          id,
          paginationBody,
          this.state.selectStatus,
          this.state.selectedDivision === 'All' ? '' : this.state.selectedDivision,
          roundSelect === 'All' ? '' : roundSelect,
          this.state.liveScoreCompIsParent,
          this.state.compOrgId,
        );
      }
    } else {
      history.pushState('/');
    }
  };

  onChangeStatus = status => {
    let { searchText, sortBy, sortOrder } = this.state;
    this.setState({ selectStatus: status });
    const paginationBody = {
      paging: {
        limit: 10,
        offset: 0,
      },
      search: searchText,
      sortBy,
      sortOrder,
    };
    let { id } = JSON.parse(getLiveScoreCompetition());
    if (status === 'All') {
      this.props.liveScoreTeamAttendanceListAction(
        id,
        paginationBody,
        status,
        this.state.selectedDivision === 'All' ? '' : this.state.selectedDivision,
        this.state.selectedRound === 'All' ? '' : this.state.selectedRound,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
      );
    } else {
      this.props.liveScoreTeamAttendanceListAction(
        id,
        paginationBody,
        status,
        this.state.selectedDivision === 'All' ? '' : this.state.selectedDivision,
        this.state.selectedRound === 'All' ? '' : this.state.selectedRound,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
      );
    }
  };

  onExport = () => {
    let url;
    if (this.state.liveScoreCompIsParent !== true) {
      if (this.state.selectStatus === 'All') {
        url =
          AppConstants.teamAttendanceExport +
          this.state.competitionId +
          `&competitionOrganisationId=${this.state.compOrgId}`;
      } else {
        url =
          AppConstants.teamAttendanceExport +
          this.state.competitionId +
          `&status=${this.state.selectStatus}&competitionOrganisationId=${this.state.compOrgId}`;
      }
    } else {
      if (this.state.selectStatus === 'All') {
        url = AppConstants.teamAttendanceExport + this.state.competitionId;
      } else {
        url =
          AppConstants.teamAttendanceExport +
          this.state.competitionId +
          `&status=${this.state.selectStatus}`;
      }
    }

    this.props.exportFilesAction(url);
  };

  // on change search text
  onChangeSearchText = e => {
    let { sortBy, sortOrder } = this.state;
    const { id } = JSON.parse(getLiveScoreCompetition());
    this.setState({ searchText: e.target.value, offset: 0 });
    if (e.target.value === null || e.target.value === '') {
      const body = {
        paging: {
          limit: 10,
          offset: 0,
        },
        search: e.target.value,
        sortBy,
        sortOrder,
      };
      this.props.liveScoreTeamAttendanceListAction(
        id,
        body,
        this.state.selectStatus,
        this.state.selectedDivision === 'All' ? '' : this.state.selectedDivision,
        this.state.selectedRound === 'All' ? '' : this.state.selectedRound,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
      );
    }
  };

  // search key
  onKeyEnterSearchText = e => {
    this.setState({ offset: 0 });
    let { sortBy, sortOrder } = this.state;
    var code = e.keyCode || e.which;
    const { id } = JSON.parse(getLiveScoreCompetition());
    if (code === 13) {
      // 13 is the enter keycode
      const body = {
        paging: {
          limit: 10,
          offset: 0,
        },
        search: e.target.value,
        sortBy,
        sortOrder,
      };

      this.props.liveScoreTeamAttendanceListAction(
        id,
        body,
        this.state.selectStatus,
        this.state.selectedDivision === 'All' ? '' : this.state.selectedDivision,
        this.state.selectedRound === 'All' ? '' : this.state.selectedRound,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
      );
    }
  };

  checkUserId(record) {
    if (record.userId == null) {
      message.config({ duration: 1.5, maxCount: 1 });
      message.warn(ValidationConstants.playerMessage);
    } else {
      history.push('/userPersonal', {
        userId: record.userId,
        screenKey: 'livescore',
        screen: '/matchDayPlayerList',
      });
    }
  }

  // on click of search icon
  onClickSearchIcon = () => {
    this.setState({ offset: 0 });
    let { searchText, sortBy, sortOrder } = this.state;
    const { id } = JSON.parse(getLiveScoreCompetition());
    if (searchText === null || searchText === '') {
    } else {
      const body = {
        paging: {
          limit: 10,
          offset: 0,
        },
        search: searchText,
        sortBy,
        sortOrder,
      };
      this.props.liveScoreTeamAttendanceListAction(
        id,
        body,
        this.state.selectStatus,
        this.state.selectedDivision === 'All' ? '' : this.state.selectedDivision,
        this.state.selectedRound === 'All' ? '' : this.state.selectedRound,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
      );
    }
  };

  headerView = () => {
    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="row">
          <div className="col-sm" style={{ alignSelf: 'center' }}>
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.teamAttendance}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="col-sm d-flex flex-row align-items-center justify-content-end">
            <div className="row">
              <div className="col-sm">
                <Select
                  className="year-select reg-filter-select1 d-flex justify-content-end"
                  style={{ minWidth: 140 }}
                  onChange={this.onChangeStatus}
                  value={this.state.selectStatus}
                >
                  <Option value="All">All</Option>
                  <Option value="Borrowed">Borrowed Player</Option>
                  <Option value="Did Not Play">Did Not Play</Option>
                  <Option value="Played">Played</Option>
                </Select>
              </div>
              <div className="col-sm d-flex">
                <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-end align-self-center justify-content-end">
                  <Button onClick={this.onExport} className="primary-add-comp-form" type="primary">
                    <div className="row">
                      <div className="col-sm">
                        <img
                          src={AppImages.export}
                          alt=""
                          height="12"
                          width="12"
                          style={{ marginRight: 5 }}
                        />
                        {AppConstants.export}
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* search box */}
        {/* <div className="col-sm pt-3 ml-3 d-flex justify-content-end">
                    <div className="comp-product-search-inp-width">
                        <Input
                            className="product-reg-search-input"
                            onChange={this.onChangeSearchText}
                            placeholder="Search..."
                            onKeyPress={this.onKeyEnterSearchText}
                            prefix={
                                <SearchOutlined
                                    style={{ color: "rgba(0,0,0,.25)", height: 16, width: 16 }}
                                    onClick={this.onClickSearchIcon}
                                />
                            }
                            allowClear
                        />
                    </div>
                </div> */}
      </div>
    );
  };

  onChangeDivision = division => {
    this.props.liveScoreRoundListAction(
      this.state.competitionId,
      division == 'All' ? '' : division,
      this.state.liveScoreCompIsParent,
      this.state.compOrgId,
    );
    this.setState({ selectedDivision: division, selectedRound: AppConstants.all, roundLoad: true });
  };

  onChangeRound = roundName => {
    this.handleTablePagination(0, roundName);
    this.setState({ selectedRound: roundName });
  };

  dropdownView = () => {
    let { divisionList, roundList } = this.props.liveScoreTeamAttendanceState;
    let divisionListArr = isArrayNotEmpty(divisionList) ? divisionList : [];
    let roundListArr = isArrayNotEmpty(roundList) ? roundList : [];
    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="row">
          <div className="col-sm">
            <div className="reg-filter-col-cont pb-3">
              <span className="year-select-heading">{AppConstants.division}:</span>
              <Select
                className="year-select reg-filter-select1 ml-2"
                style={{ minWidth: 160 }}
                onChange={divisionId => this.onChangeDivision(divisionId)}
                value={this.state.selectedDivision}
              >
                <Option value="All">All</Option>
                {divisionListArr.map(item => (
                  <Option key={'division_' + item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="col-sm">
            <div className="reg-filter-col-cont pb-3">
              <span className="year-select-heading">{AppConstants.round}:</span>
              <Select
                className="year-select reg-filter-select1 ml-2"
                style={{ minWidth: 160 }}
                onChange={roundName => this.onChangeRound(roundName)}
                value={this.state.selectedRound}
              >
                <Option value="All">All</Option>
                {roundListArr.map(item => (
                  <Option key={'round_' + item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="col-sm d-flex justify-content-end align-items-center">
            <div className="comp-product-search-inp-width pb-3">
              <Input
                className="product-reg-search-input"
                onChange={this.onChangeSearchText}
                placeholder="Search..."
                data-testid={AppUniqueId.SEARCH_INPUT}
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
        </div>
      </div>
    );
  };

  contentView = () => {
    const {
      teamAttendanceResult,
      teamAttendancePage,
      teamAttendanceTotalCount,
    } = this.props.liveScoreTeamAttendanceState;
    let dataSource = isArrayNotEmpty(teamAttendanceResult) ? teamAttendanceResult : [];
    let total = teamAttendanceTotalCount;
    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={this.props.liveScoreTeamAttendanceState.onLoad === true && true}
            className="home-dashboard-table"
            columns={this.state.selectStatus === 'Borrowed' ? borrowedColumns : columns}
            dataSource={dataSource}
            pagination={false}
            rowKey={record => 'teamAttendance' + record.matchId}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            current={teamAttendancePage}
            total={total}
            // onChange={this.handleTablePagination(page, this.state.selectedRound)}
            onChange={page => this.handleTablePagination(page, this.state.selectedRound)}
            showSizeChanger={false}
          />
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />

        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="14" />

        <Layout>
          {this.headerView()}
          {this.dropdownView()}
          <Content>{this.contentView()}</Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      liveScoreTeamAttendanceListAction,
      exportFilesAction,
      getLiveScoreDivisionList,
      liveScoreRoundListAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreTeamAttendanceState: state.LiveScoreTeamAttendanceState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreTeamAttendance);
