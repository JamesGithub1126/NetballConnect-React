import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Layout, Breadcrumb, Button, Table, Select, Pagination, Input, message, Menu } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import {
  liveScorePerMatchListAction,
  liveScorePerMatchPayAction,
} from '../../store/actions/LiveScoreAction/liveScoreTeamPerMatchAction';
import { getLiveScoreCompetition, getOrganisationData } from '../../util/sessionStorage';
import { liveScore_formateDateTime } from '../../themes/dateformate';
import history from '../../util/history';
import { isArrayNotEmpty } from '../../util/helpers';
//import { exportFilesAction } from '../../store/actions/appAction';
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
  let { offset, searchText, selectStatus, selectedDivision, selectedRound } = this_Obj.state;
  this_Obj.getPerMatchData(
    offset,
    searchText,
    sortBy,
    sortOrder,
    selectStatus,
    selectedDivision,
    selectedRound,
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
    title: AppConstants.startTime,
    dataIndex: 'startTime',
    key: 'startTime',
    sorter: true,
    onHeaderCell: () => listeners('startTime'),
    render: teamName => <span>{liveScore_formateDateTime(teamName)}</span>,
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
    title: AppConstants.playerId,
    dataIndex: 'playerId',
    key: 'playerId',
    sorter: true,
    onHeaderCell: () => listeners('playerId'),
  },
  {
    title: AppConstants.firstPreferredName,
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
    title: AppConstants.verifiedBy,
    dataIndex: 'verifiedBy',
    key: 'verifiedBy',
    sorter: true,
    onHeaderCell: () => listeners('verifiedBy'),
  },
  {
    title: AppConstants.payer,
    dataIndex: 'paidByUserName',
    key: 'paidByUserName',
    sorter: false,
    onHeaderCell: () => listeners('paidByUserName'),
  },
  {
    title: AppConstants.fees,
    dataIndex: 'fees',
    key: 'fees',
    sorter: true,
    onHeaderCell: () => listeners('fees'),
  },
  {
    title: AppConstants.status,
    dataIndex: 'paidStatus',
    key: 'paidStatus',
    sorter: false,
    onHeaderCell: () => listeners('paidStatus'),
  },
  {
    title: AppConstants.action,
    dataIndex: 'action',
    key: 'action',
    render: (data, record) => {
      return (
        record.paidStatus == 'Payment Due' && (
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
              {
                <Menu.Item key="1" onClick={() => this_Obj.cashReceived(record)}>
                  <span>{AppConstants.cashReceived}</span>
                </Menu.Item>
              }
              {record.subPaymentType === 'card' && (
                <Menu.Item key="2" onClick={() => this_Obj.payFees(record)}>
                  <span>{AppConstants.payFees}</span>
                </Menu.Item>
              )}
            </Menu.SubMenu>
          </Menu>
        )
      );
    },
  },
];

class LiveScoreTeamFeePerMatch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: '2022',
      teamSelection: '',
      selectStatus: 'All',
      page: 1,
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

  async componentDidMount() {
    let { perMatchListActionObject } = this.props.liveScoreTeamPerMatchState;
    if (getLiveScoreCompetition()) {
      const { id, competitionOrganisation, organisationId } = JSON.parse(getLiveScoreCompetition());
      const orgItem = await getOrganisationData();
      const userOrganisationId = orgItem ? orgItem.organisationId : 0;
      let liveScoreCompIsParent = userOrganisationId === organisationId;
      let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
      // if (perMatchListActionObject) {
      //   let payload = perMatchListActionObject.payload;
      //   let searchText = payload.search;
      //   let selectedDivision = payload.divisionId
      //     ? payload.divisionId
      //     : 'All';
      //   let selectedRound = payload.roundId
      //     ? payload.roundId
      //     : 'All';
      //   let sortBy = body.sortBy;
      //   let sortOrder = body.sortOrder;
      //   let selectStatus = payload.select_status;
      //   await this.setState({
      //     searchText,
      //     selectedDivision,
      //     selectedRound,
      //     sortBy,
      //     sortOrder,
      //     selectStatus,
      //   });
      // }
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

  componentDidUpdate(prevProps) {
    let roundList = this.props.liveScoreTeamPerMatchState.roundList;

    if (prevProps.liveScoreTeamPerMatchState !== this.props.liveScoreTeamPerMatchState) {
      if (
        this.props.liveScoreTeamPerMatchState.onDivisionLoad === false &&
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
      if (
        prevProps.liveScoreTeamPerMatchState.onPaymentLoad == true &&
        this.props.liveScoreTeamPerMatchState.onPaymentLoad == false
      ) {
        this.handleTablePagination(this.state.page);
        this.setState({ onPaymentLoad: false });
      }
    }
    if (prevProps.roundList !== roundList) {
      if (
        this.props.liveScoreTeamPerMatchState.roundLoad === false &&
        this.state.roundLoad === true
      ) {
        this.handleTablePagination(1);
        this.setState({ roundLoad: false });
      }
    }
  }
  getPerMatchData = (
    offset,
    searchText,
    sortBy,
    sortOrder,
    selectStatus,
    selectedDivision,
    roundSelect,
  ) => {
    let { id } = JSON.parse(getLiveScoreCompetition());
    const paginationBody = {
      competitionId: id,
      paging: {
        limit: this.state.limit,
        offset: offset,
      },
      searchText: searchText,
      sortBy,
      sortOrder,
      status: selectStatus === 'All' ? '' : selectStatus,
      divisionId: selectedDivision === 'All' ? '' : selectedDivision,
      roundId: roundSelect === 'All' ? '' : roundSelect,
    };

    if (id !== null) {
      this.props.liveScorePerMatchListAction(paginationBody);
    }
  };

  handleTablePagination = (page, limit = this.state.limit, roundName) => {
    let selectedRound = roundName ? roundName : this.state.selectedRound;
    let offset = page ? limit * (page - 1) : 0;
    this.setState({ offset, limit, page }, () => {
      let { searchText, sortBy, sortOrder, selectStatus, selectedDivision } = this.state;
      this.getPerMatchData(
        offset,
        searchText,
        sortBy,
        sortOrder,
        selectStatus,
        selectedDivision,
        selectedRound,
      );
    });
  };

  onChangeStatus = status => {
    let { searchText, sortBy, sortOrder, offset, selectedDivision, selectedRound } = this.state;
    this.setState({ selectStatus: status });
    this.getPerMatchData(
      offset,
      searchText,
      sortBy,
      sortOrder,
      status,
      selectedDivision,
      selectedRound,
    );
  };

  // on change search text
  onChangeSearchText = e => {
    let { sortBy, sortOrder, selectStatus, selectedDivision, selectedRound } = this.state;
    this.setState({ searchText: e.target.value, offset: 0 });
    if (e.target.value === null || e.target.value === '') {
      this.getPerMatchData(
        0,
        e.target.value,
        sortBy,
        sortOrder,
        selectStatus,
        selectedDivision,
        selectedRound,
      );
    }
  };

  // search key
  onKeyEnterSearchText = e => {
    this.setState({ offset: 0 });
    let { sortBy, sortOrder, selectStatus, selectedDivision, selectedRound } = this.state;
    var code = e.keyCode || e.which;
    if (code === 13) {
      // 13 is the enter keycode
      this.getPerMatchData(
        0,
        e.target.value,
        sortBy,
        sortOrder,
        selectStatus,
        selectedDivision,
        selectedRound,
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
    let { searchText, sortBy, sortOrder, selectStatus, selectedDivision, selectedRound } =
      this.state;

    if (searchText === null || searchText === '') {
    } else {
      this.getPerMatchData(
        0,
        searchText,
        sortBy,
        sortOrder,
        selectStatus,
        selectedDivision,
        selectedRound,
      );
    }
  };
  payFees = record => {
    let payload = {
      paymentType: 'card',
      matchId: record.matchId,
      teamId: record.teamId,
      playerIds: [record.playerId],
    };

    this.setState({ onPaymentLoad: true });
    this.props.liveScorePerMatchPayAction(payload);
  };
  cashReceived = record => {
    let payload = {
      paymentType: 'cash',
      isCashReceived: 1,
      matchId: record.matchId,
      teamId: record.teamId,
      playerIds: [record.playerId],
    };
    this.setState({ onPaymentLoad: true });
    this.props.liveScorePerMatchPayAction(payload);
  };
  headerView = () => {
    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="row">
          <div className="col-sm" style={{ alignSelf: 'center' }}>
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.feesPerMatch}
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
                  <Option value="2">{AppConstants.paid}</Option>
                  <Option value="1">{AppConstants.paymentDue}</Option>
                  <Option value="3">{AppConstants.refunded}</Option>
                </Select>
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
    this.handleTablePagination(1, this.state.limit, roundName);
    this.setState({ selectedRound: roundName });
  };

  dropdownView = () => {
    let { divisionList, roundList } = this.props.liveScoreTeamPerMatchState;
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
    const { perMatchResult, perMatchPage, perMatchTotalCount } =
      this.props.liveScoreTeamPerMatchState;
    let dataSource = isArrayNotEmpty(perMatchResult) ? perMatchResult : [];
    let total = perMatchTotalCount;
    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={this.props.liveScoreTeamPerMatchState.onLoad}
            className="home-dashboard-table"
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            rowKey={record => 'teampermatch' + record.matchId + '_' + record.playerId}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            current={perMatchPage}
            total={total}
            onChange={(page, size) => this.handleTablePagination(page, size, this.state.selectedRound)}
            showSizeChanger={true}
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

        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="payments_3" />

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
      liveScorePerMatchListAction,
      liveScorePerMatchPayAction,
      //exportFilesAction,
      getLiveScoreDivisionList,
      liveScoreRoundListAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreTeamPerMatchState: state.liveScoreTeamPerMatchState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreTeamFeePerMatch);
