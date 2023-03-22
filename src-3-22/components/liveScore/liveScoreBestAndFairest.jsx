import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Layout, Breadcrumb, Button, Table, Select, Pagination, Input, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { liveScoreBestPlayerPointListAction } from '../../store/actions/LiveScoreAction/liveScoreBestAndFairestAction';
import {
  getLiveScoreCompetition,
  getOrganisationData,
  setBestOnCourtTypeRefId,
  getBestOnCourtTypeRefId,
} from '../../util/sessionStorage';
import history from '../../util/history';
import { isArrayNotEmpty } from '../../util/helpers';
import { exportFilesAction } from '../../store/actions/appAction';
import { getLiveScoreDivisionList } from '../../store/actions/LiveScoreAction/liveScoreDivisionAction';
import { liveScoreRoundListAction } from '../../store/actions/LiveScoreAction/liveScoreRoundAction';
import ValidationConstants from '../../themes/validationConstant';
import { get } from 'lodash';
import { BFSettingType } from 'util/enums';

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
  let { limit, offset, competitionId, searchText, selectStatus, filter } = this_Obj.state;
  const body = {
    paging: {
      limit: limit,
      offset: offset,
    },
    search: searchText,
    sortBy,
    sortOrder,
    filter,
  };
  this_Obj.props.liveScoreBestPlayerPointListAction(
    competitionId,
    body,
    selectStatus,
    this_Obj.state.selectedDivision === 'All' ? '' : this_Obj.state.selectedDivision,
    this_Obj.state.selectedRound === 'All' ? '' : this_Obj.state.selectedRound,
    this_Obj.state.compOrgId,
    this_Obj.state.typeRefId,
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
        <span className="input-heading-add-another pt-0">{matchId}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.round,
    dataIndex: 'roundName',
    key: 'roundName',
    sorter: true,
    onHeaderCell: () => listeners('roundName'),
    render: roundName => <span>{roundName}</span>,
  },
  {
    title: AppConstants.team,
    dataIndex: 'teamName',
    key: 'teamName',
    sorter: true,
    onHeaderCell: () => listeners('teamName'),
    render: teamName => <span>{teamName}</span>,
  },
  {
    title: AppConstants.organisation,
    dataIndex: 'organisationName',
    key: 'organisationName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
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
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    sorter: true,
    onHeaderCell: () => listeners('total'),
  },
];

const columnsForAll = [
  {
    title: AppConstants.round,
    dataIndex: 'roundName',
    key: 'roundName',
    sorter: true,
    onHeaderCell: () => listeners('roundName'),
    render: roundName => <span>{roundName}</span>,
  },
  {
    title: AppConstants.team,
    dataIndex: 'teamName',
    key: 'teamName',
    sorter: true,
    onHeaderCell: () => listeners('teamName'),
    render: teamName => <span>{teamName}</span>,
  },
  {
    title: AppConstants.organisation,
    dataIndex: 'organisationName',
    key: 'organisationName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
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
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    sorter: true,
    onHeaderCell: () => listeners('total'),
  },
];

class LiveScoreBestAndFairest extends Component {
  constructor(props) {
    super(props);
    let typeRefId = get(props.location, 'typeRefId', null);
    if (!typeRefId) {
      typeRefId = getBestOnCourtTypeRefId() || BFSettingType.MEDIA_REPORT;
    }
    setBestOnCourtTypeRefId(typeRefId);

    this.state = {
      year: '2020',
      selectStatus: 'All',
      competitionId: null,
      searchText: '',
      selectedDivision: 'All',
      selectedRound: 'All',
      divisionLoad: false,
      filter: 'By Match',
      offset: 0,
      limit: 10,
      roundLoad: false,
      sortBy: null,
      sortOrder: null,
      compOrgId: 0,
      liveScoreCompIsParent: false,
      typeRefId,
    };
    this_Obj = this;
  }

  // componentDidMount
  async componentDidMount() {
    const competition = getLiveScoreCompetition();
    if (!competition) {
      history.push('/matchDayCompetitions');
      return;
    }

    const { id: competitionId, competitionOrganisation, organisationId } = JSON.parse(competition);
    const orgItem = await getOrganisationData();
    const userOrganisationId = orgItem ? orgItem.organisationId : 0;

    const liveScoreCompIsParent = userOrganisationId === organisationId;
    const compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
    await this.setState({
      competitionId: competitionId,
      divisionLoad: true,
      compOrgId,
      liveScoreCompIsParent,
    });

    if (competitionId !== null) {
      this.props.getLiveScoreDivisionList(
        competitionId,
        undefined,
        undefined,
        undefined,
        liveScoreCompIsParent,
        compOrgId,
      );
    } else {
      history.pushState('/matchDayCompetitions');
    }
  }

  componentDidUpdate(prevProps) {
    const roundList = this.props.liveScoreTeamAttendanceState.roundList;
    if (prevProps.liveScoreTeamAttendanceState !== this.props.liveScoreTeamAttendanceState) {
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
    if (prevProps.roundList !== roundList) {
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
    let { searchText, sortBy, sortOrder, filter } = this.state;
    const paginationBody = {
      paging: {
        limit: 10,
        offset: offset,
      },
      search: searchText,
      sortBy,
      sortOrder,
      filter,
    };
    let { id } = JSON.parse(getLiveScoreCompetition());
    if (id !== null) {
      if (this.state.selectStatus === 'All') {
        this.props.liveScoreBestPlayerPointListAction(
          id,
          paginationBody,
          this.state.selectStatus,
          this.state.selectedDivision === 'All' ? '' : this.state.selectedDivision,
          roundSelect === 'All' ? '' : roundSelect,
          this.state.compOrgId,
          this.state.typeRefId,
        );
      } else {
        this.props.liveScoreBestPlayerPointListAction(
          id,
          paginationBody,
          this.state.selectStatus,
          this.state.selectedDivision === 'All' ? '' : this.state.selectedDivision,
          roundSelect === 'All' ? '' : roundSelect,
          this.state.compOrgId,
          this.state.typeRefId,
        );
      }
    } else {
      history.pushState('/');
    }
  };

  onExport = () => {
    let url = `${AppConstants.bestAndFairestExport}${this.state.competitionId}&compOrgId=${this.state.compOrgId}&typeRefId=${this.state.typeRefId}`;
    if (this.state.filter === 'By Match') {
      url += `&aggregate=MATCH`;
    } else if (this.state.filter === 'Total') {
      url += `&aggregate=ALL`;
    }

    if (this.state.sortBy && this.state.sortOrder) {
      url += `&sortBy=${this.state.sortBy}&sortOrder=${this.state.sortOrder}`;
    }

    const divisionId = this.state.selectedDivision === 'All' ? '' : this.state.selectedDivision;
    if (divisionId) {
      url += `&divisionId=${divisionId}`;
    }
    const roundName = this.state.selectedRound === 'All' ? '' : this.state.selectedRound;
    if (roundName) {
      url += `&roundName=${roundName}`;
    }

    this.props.exportFilesAction(url);
  };

  // on change search text
  onChangeSearchText = e => {
    let { sortBy, sortOrder, filter } = this.state;
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
        filter,
      };
      this.props.liveScoreBestPlayerPointListAction(
        id,
        body,
        this.state.selectStatus,
        this.state.selectedDivision === 'All' ? '' : this.state.selectedDivision,
        this.state.selectedRound === 'All' ? '' : this.state.selectedRound,
        this.state.compOrgId,
        this.state.typeRefId,
      );
    }
  };

  // search key
  onKeyEnterSearchText = e => {
    this.setState({ offset: 0 });
    let { sortBy, sortOrder, filter } = this.state;
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
        filter,
      };

      this.props.liveScoreBestPlayerPointListAction(
        id,
        body,
        this.state.selectStatus,
        this.state.selectedDivision === 'All' ? '' : this.state.selectedDivision,
        this.state.selectedRound === 'All' ? '' : this.state.selectedRound,
        this.state.compOrgId,
        this.state.typeRefId,
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
    let { searchText, sortBy, sortOrder, filter } = this.state;
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
        filter,
      };
      this.props.liveScoreBestPlayerPointListAction(
        id,
        body,
        this.state.selectStatus,
        this.state.selectedDivision === 'All' ? '' : this.state.selectedDivision,
        this.state.selectedRound === 'All' ? '' : this.state.selectedRound,
        this.state.compOrgId,
        this.state.typeRefId,
      );
    }
  };

  onChangeFilter = filter => {
    let { limit, offset, competitionId, searchText, selectStatus, sortBy, sortOrder } = this.state;
    const body = {
      paging: {
        limit: limit,
        offset: offset,
      },
      search: searchText,
      sortBy,
      sortOrder,
      filter,
    };
    this.props.liveScoreBestPlayerPointListAction(
      competitionId,
      body,
      selectStatus,
      this.state.selectedDivision === 'All' ? '' : this.state.selectedDivision,
      this.state.selectedRound === 'All' ? '' : this.state.selectedRound,
      this.state.compOrgId,
      this.state.typeRefId,
    );
    this.setState({ filter });
  };

  headerView = () => {
    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="row">
          <div className="col-sm" style={{ alignSelf: 'center' }}>
            <Breadcrumb separator=" > ">
              {this.state.typeRefId === BFSettingType.MEDIA_REPORT && (
                <Breadcrumb.Item className="breadcrumb-add">
                  {AppConstants.bestAndFairestPoints}
                </Breadcrumb.Item>
              )}
              {this.state.typeRefId === BFSettingType.VOTED_AWARD && (
                <Breadcrumb.Item className="breadcrumb-add">
                  {AppConstants.votedAwardBestAndFairest}
                </Breadcrumb.Item>
              )}
              {this.state.typeRefId === BFSettingType.ORGANISATION_AWARD && (
                <Breadcrumb.Item className="breadcrumb-add">
                  {AppConstants.ourOrganisationAwards}
                </Breadcrumb.Item>
              )}
            </Breadcrumb>
          </div>
          <div className="col-sm d-flex flex-row align-items-center justify-content-end">
            <div className="row">
              <div className="col-sm">
                <Select
                  className="year-select reg-filter-select1 d-flex justify-content-end"
                  style={{ minWidth: 120 }}
                  onChange={filter => this.onChangeFilter(filter)}
                  value={this.state.filter}
                >
                  <Option value={AppConstants.ByMatch}>{AppConstants.ByMatch}</Option>
                  <Option value={AppConstants.total}>{AppConstants.total}</Option>
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
                  <Option key={'round_' + item.id} value={item.name}>
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
      onLoad,
      onDivisionLoad,
      roundLoad,
      bestPlayerPointResult,
      bestPlayerPointPage,
      bestPlayerPointTotalCount,
    } = this.props.liveScoreTeamAttendanceState;

    let dataSource = isArrayNotEmpty(bestPlayerPointResult) ? bestPlayerPointResult : [];
    let total = bestPlayerPointTotalCount;
    let tableColumns = columns;
    if (this.state.filter !== 'By Match') {
      tableColumns = columnsForAll;
    }
    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={onLoad || onDivisionLoad || roundLoad}
            className="home-dashboard-table"
            columns={tableColumns}
            dataSource={dataSource}
            pagination={false}
            rowKey={record => 'teamAttendance' + record.matchId}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            current={bestPlayerPointPage}
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

        {this.state.typeRefId === BFSettingType.MEDIA_REPORT && (
          <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="bestAndFairest" />
        )}
        {this.state.typeRefId === BFSettingType.VOTED_AWARD && (
          <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="votedAwardBestAndFairest" />
        )}
        {this.state.typeRefId === BFSettingType.ORGANISATION_AWARD && (
          <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="organisationAwards" />
        )}
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
      liveScoreBestPlayerPointListAction,
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

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreBestAndFairest);
