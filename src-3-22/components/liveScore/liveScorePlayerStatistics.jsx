import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Breadcrumb, Table, Pagination, Select, Button, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import {
  liveScorePlayerStatisticsListAction,
  setPageSizeAction,
  setPageNumberAction,
} from '../../store/actions/LiveScoreAction/liveScoreGoalsAction';
import history from '../../util/history';
import { getLiveScoreCompetition, getOrganisationData } from '../../util/sessionStorage';
import { liveScore_formateDateTime } from '../../themes/dateformate';
import { exportFilesAction } from '../../store/actions/appAction';
import { isArrayNotEmpty } from '../../util/helpers';
import { SPORT } from '../../util/enums';
import { MatchStatus } from '../../enums/enums';
import moment from "moment-timezone";

const { Content } = Layout;
const { Option } = Select;

var this_obj = null;

// listeners for sorting
const listeners = key => ({
  onClick: () => tableSort(key),
});

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

  this_obj.setState({ sortBy, sortOrder });
  let { pageSize } = this_obj.props.liveScoreGoalState;
  pageSize = pageSize ? pageSize : 10;
  let offset = 0;
  this_obj.props.liveScorePlayerStatisticsListAction(
    this_obj.state.competitionId,
    this_obj.state.filter,
    this_obj.state.searchText,
    offset,
    pageSize,
    sortBy,
    sortOrder,
    this_obj.state.liveScoreCompIsParent,
    this_obj.state.compOrgId,
    SPORT[process.env.REACT_APP_FLAVOUR],
  );
}

function matchResultImage(result) {
  if (result == 'FINAL') {
    return AppImages.greenDot;
  } else if (result == 'UNCONFIRMED') {
    return AppImages.purpleDot;
  } else if (result == 'DISPUTE') {
    return AppImages.redDot;
  } else {
    return AppImages.purpleDot;
  }
}

const columns1 = [
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'matchId',
    key: 'matchId',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.date,
    dataIndex: 'startTime',
    key: 'startTime',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('date'),
    render: startTime => <span>{liveScore_formateDateTime(startTime)}</span>,
  },
  {
    title: AppConstants.team,
    dataIndex: 'teamName',
    key: 'teamName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('team'),
  },
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'firstName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (firstName, record) => (
      // <NavLink
      //   to={{
      //     pathname: '/matchDayPlayerView',
      //     state: { tableRecord: record },
      //   }}
      // >
      <span className="input-heading-add-another pt-0">{firstName}</span>
      // </NavLink>
    ),
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'lastName',
    key: 'lastName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (lastName, record) => (
      // <NavLink
      //   to={{
      //     pathname: '/matchDayPlayerView',
      //     state: { tableRecord: record },
      //   }}
      // >
      <span className="input-heading-add-another pt-0">{lastName}</span>
      // </NavLink>
    ),
  },
  {
    title: AppConstants.goalAbbr,
    dataIndex: 'goal',
    key: 'goal',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('goal'),
    render: (score, records, index) => {
      return (
        <div className="d-flex align-items-center">
          {!!records.matchStatus &&
            records.matchStatus.toLowerCase() === MatchStatus.Ended.toLowerCase() && (
              <img
                className="dot-image mr-3"
                src={matchResultImage(records.resultStatus)}
                alt="dot-image"
                width="12"
                height="12"
              />
            )}
          <span className="white-space-nowrap">{records.goal}</span>
        </div>
      );
    },
  },
  {
    title: AppConstants.penaltyAbbr,
    dataIndex: 'penalty',
    key: 'penalty',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('penalty'),
  },
  {
    title: AppConstants.assistAbbr,
    dataIndex: 'assist',
    key: 'assist',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('assist'),
  },
  {
    title: AppConstants.ownGoalAbbr,
    dataIndex: 'own_goal',
    key: 'own_goal',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('ownGoal'),
  },
  {
    title: AppConstants.yellowCardTDAbbr,
    dataIndex: 'yellow_card_TD',
    key: 'yellow_card_TD',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('yellow_card_TD'),
  },
  {
    title: AppConstants.yellowCardAbbr,
    dataIndex: 'yellow_card',
    key: 'yellow_card',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('yellow_card'),
  },
  {
    title: AppConstants.redCardAbbr,
    dataIndex: 'red_card',
    key: 'red_card',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('red_card'),
  },
];

const columns2 = [
  {
    title: AppConstants.team,
    dataIndex: 'teamName',
    key: 'teamName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('team'),
  },
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'firstName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (firstName, record) => (
      // <NavLink
      //   to={{
      //     pathname: '/matchDayPlayerView',
      //     state: { tableRecord: record },
      //   }}
      // >
      <span className="input-heading-add-another pt-0">{firstName}</span>
      // </NavLink>
    ),
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'lastName',
    key: 'lastName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (lastName, record) => (
      // <NavLink
      //   to={{
      //     pathname: '/matchDayPlayerView',
      //     state: { tableRecord: record },
      //   }}
      // >
      <span className="input-heading-add-another pt-0">{lastName}</span>
      // </NavLink>
    ),
  },
  {
    title: AppConstants.goalAbbr,
    dataIndex: 'goal',
    key: 'goal',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('goal'),
  },
  {
    title: AppConstants.penaltyAbbr,
    dataIndex: 'penalty',
    key: 'penalty',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('penalty'),
  },
  {
    title: AppConstants.assistAbbr,
    dataIndex: 'assist',
    key: 'assist',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('assist'),
  },
  {
    title: AppConstants.ownGoalAbbr,
    dataIndex: 'own_goal',
    key: 'own_goal',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('ownGoal'),
  },
  {
    title: AppConstants.yellowCardTDAbbr,
    dataIndex: 'yellow_card_TD',
    key: 'yellow_card_TD',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('yellow_card_TD'),
  },
  {
    title: AppConstants.yellowCardAbbr,
    dataIndex: 'yellow_card',
    key: 'yellow_card',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('yellow_card'),
  },
  {
    title: AppConstants.redCardAbbr,
    dataIndex: 'red_card',
    key: 'red_card',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('red_card'),
  },
];

const enhancedColumns = [
  {
    title: AppConstants.cornerAbbr,
    dataIndex: 'corner',
    key: 'corner',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('corner'),
  },
  {
    title: AppConstants.foulAbbr,
    dataIndex: 'foul',
    key: 'foul',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('foul'),
  },
  {
    title: AppConstants.offsideAbbr,
    dataIndex: 'offside',
    key: 'offside',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('offside'),
  },
  {
    title: AppConstants.onTargetAbbr,
    dataIndex: 'on_target',
    key: 'on_target',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('onTarget'),
  },
  {
    title: AppConstants.offTargetAbbr,
    dataIndex: 'off_target',
    key: 'off_target',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('goals'),
  },
];

const minutesColumn = [
  {
    title: AppConstants.minutesPlayedAbbr,
    dataIndex: 'duration',
    key: 'duration',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('duration'),
  },
];

class LiveScorePlayerStatistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: '2020',
      teamSelection: 'WSA 1',
      selectStatus: 'Select Status',
      filter: 'By Match',
      competitionId: null,
      searchText: '',
      sortBy: null,
      sortOrder: null,
      liveScoreCompIsParent: false,
      compOrgId: 0,
      enhancedStatistics: false,
      attendanceRecordingPeriod: null,
    };
    this_obj = this;
  }

  async componentDidMount() {
    let { livescoreGoalActionObject } = this.props.liveScoreGoalState;
    if (getLiveScoreCompetition()) {
      const {
        id,
        competitionOrganisation,
        organisationId,
        enhancedStatistics,
        attendanceRecordingPeriod,
      } = JSON.parse(getLiveScoreCompetition());
      let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
      const orgItem = await getOrganisationData();
      const userOrganisationId = orgItem ? orgItem.organisationId : 0;
      let liveScoreCompIsParent = userOrganisationId === organisationId;
      this.setState({
        competitionId: id,
        compOrgId,
        liveScoreCompIsParent,
        enhancedStatistics,
        attendanceRecordingPeriod,
      });
      if (id !== null) {
        let offset = 0;
        let { pageSize } = this.props.liveScoreGoalState;
        pageSize = pageSize ? pageSize : 10;
        if (livescoreGoalActionObject) {
          offset = livescoreGoalActionObject.offset;
          let searchText = livescoreGoalActionObject.search;
          let sortBy = livescoreGoalActionObject.sortBy;
          let sortOrder = livescoreGoalActionObject.sortOrder;
          let goalType = livescoreGoalActionObject.goalType;
          await this.setState({ offset, searchText, sortBy, sortOrder, filter: goalType });
          this.props.liveScorePlayerStatisticsListAction(
            id,
            goalType,
            searchText,
            offset,
            pageSize,
            sortBy,
            sortOrder,
            liveScoreCompIsParent,
            compOrgId,
            SPORT[process.env.REACT_APP_FLAVOUR],
          );
        } else {
          this.props.liveScorePlayerStatisticsListAction(
            id,
            this.state.filter,
            this.state.searchText,
            offset,
            pageSize,
            undefined,
            undefined,
            liveScoreCompIsParent,
            compOrgId,
            SPORT[process.env.REACT_APP_FLAVOUR],
          );
        }
      } else {
        history.push('/matchDayCompetitions');
      }
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  onExport = () => {
    let url = '';
    const filter = this.state.filter === 'By Match' ? 'MATCH' : 'ALL';
    if (this.state.liveScoreCompIsParent !== true) {
      url =
        AppConstants.goalExport +
        this.state.competitionId +
        `&aggregate=${filter}&competitionOrganisationId=${this.state.compOrgId}`;
    } else {
      url = AppConstants.goalExport + this.state.competitionId + `&aggregate=${filter}`;
    }

    url += `&timezone=${moment.tz.guess()}&sportRefId=${SPORT[process.env.REACT_APP_FLAVOUR]}`;

    this.props.exportFilesAction(url);
  };

  // on change search text
  onChangeSearchText = e => {
    let { sortBy, sortOrder } = this.state;
    this.setState({ searchText: e.target.value, offset: 0 });
    if (e.target.value === null || e.target.value === '') {
      let offset = 0;
      let { pageSize } = this.props.liveScoreGoalState;
      pageSize = pageSize ? pageSize : 10;
      this.props.liveScorePlayerStatisticsListAction(
        this.state.competitionId,
        this.state.filter,
        e.target.value,
        offset,
        pageSize,
        sortBy,
        sortOrder,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
        SPORT[process.env.REACT_APP_FLAVOUR],
      );
    }
  };

  // search key
  onKeyEnterSearchText = e => {
    this.setState({ offset: 0 });
    var code = e.keyCode || e.which;
    let { sortBy, sortOrder } = this.state;
    if (code === 13) {
      // 13 is the enter keycode
      let offset = 0;
      let { pageSize } = this.props.liveScoreGoalState;
      pageSize = pageSize ? pageSize : 10;
      this.props.liveScorePlayerStatisticsListAction(
        this.state.competitionId,
        this.state.filter,
        e.target.value,
        offset,
        pageSize,
        sortBy,
        sortOrder,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
        SPORT[process.env.REACT_APP_FLAVOUR],
      );
    }
  };

  // on click of search icon
  onClickSearchIcon = () => {
    this.setState({ offset: 0 });
    let { sortBy, sortOrder } = this.state;
    if (this.state.searchText === null || this.state.searchText === '') {
    } else {
      let offset = 0;
      let { pageSize } = this.props.liveScoreGoalState;
      pageSize = pageSize ? pageSize : 10;
      this.props.liveScorePlayerStatisticsListAction(
        this.state.competitionId,
        this.state.filter,
        this.state.searchText,
        offset,
        pageSize,
        sortBy,
        sortOrder,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
        SPORT[process.env.REACT_APP_FLAVOUR],
      );
    }
  };

  onChangeFilter = filter => {
    let { sortBy, sortOrder } = this.state;
    let offset = 0;
    let { pageSize } = this.props.liveScoreGoalState;
    pageSize = pageSize ? pageSize : 10;
    this.props.liveScorePlayerStatisticsListAction(
      this.state.competitionId,
      filter,
      this.state.searchText,
      offset,
      pageSize,
      sortBy,
      sortOrder,
      this.state.liveScoreCompIsParent,
      this.state.compOrgId,
      SPORT[process.env.REACT_APP_FLAVOUR],
    );
    this.setState({ filter });
  };

  headerView = () => {
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="row">
          <div className="col-sm align-self-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.playerStatistics}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="col-sm d-flex flex-row align-items-center justify-content-end">
            <div className="row">
              <div className="col-sm">
                <Select
                  className="year-select reg-filter-select1 d-flex justify-content-end"
                  style={{ minWidth: 100 }}
                  onChange={filter => this.onChangeFilter(filter)}
                  value={this.state.filter}
                >
                  <Option value={AppConstants.ByMatch}>{AppConstants.ByMatch}</Option>
                  <Option value={AppConstants.total}>{AppConstants.total}</Option>
                </Select>
              </div>
              <div className="col-sm d-flex">
                <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-end align-self-center justify-content-end">
                  <Button
                    onClick={() => this.onExport()}
                    className="primary-add-comp-form"
                    type="primary"
                  >
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
        <div className="col-sm pt-3 ml-3 d-flex justify-content-end">
          <div className="comp-product-search-inp-width">
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
    );
  };

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setPageSizeAction(pageSize);
    this.onPageChange(page);
  };

  onPageChange = async page => {
    await this.props.setPageNumberAction(page);
    let { pageSize } = this.props.liveScoreGoalState;
    pageSize = pageSize ? pageSize : 10;
    let offset = page ? pageSize * (page - 1) : 0;
    let { sortBy, sortOrder } = this.state;
    this.props.liveScorePlayerStatisticsListAction(
      this.state.competitionId,
      this.state.filter,
      this.state.searchText,
      offset,
      pageSize,
      sortBy,
      sortOrder,
      this.state.liveScoreCompIsParent,
      this.state.compOrgId,
      SPORT[process.env.REACT_APP_FLAVOUR],
    );
  };

  contentView = () => {
    const { result, totalCount, currentPage, pageSize, onLoad } = this.props.liveScoreGoalState;
    let goalList = isArrayNotEmpty(result) ? result : [];

    let showColumns1 = columns1;
    let showColumns2 = columns2;
    if (this.state.enhancedStatistics) {
      showColumns1 = showColumns1.concat(enhancedColumns);
      showColumns2 = showColumns2.concat(enhancedColumns);
    }
    if (this.state.attendanceRecordingPeriod === 'MINUTE') {
      showColumns1 = showColumns1.concat(minutesColumn);
      showColumns2 = showColumns2.concat(minutesColumn);
    }

    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={onLoad === true && true}
            className="home-dashboard-table"
            columns={this.state.filter === 'By Match' ? showColumns1 : showColumns2}
            dataSource={goalList}
            pagination={false}
            rowKey={(record, index) => 'goalList' + index}
          />
        </div>

        <div className="comp-dashboard-botton-view-mobile">
          <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
            <Pagination
              className="antd-pagination"
              showSizeChanger
              current={currentPage}
              defaultCurrent={currentPage}
              defaultPageSize={pageSize}
              total={totalCount}
              onChange={this.onPageChange}
              onShowSizeChange={this.handleShowSizeChange}
            />
          </div>
        </div>
      </div>
    );
  };

  detailsContainer = (icon, description) => {
    return (
      <div className="pt-2">
        <img src={icon} alt="" width="15" height="15" />
        <span style={{ marginLeft: 10 }}>{description}</span>
      </div>
    );
  };

  footerView() {
    return (
      <div className="comp-player-grades-header-drop-down-view pt-0 mb-3 align-logo">
        <span className="applicable-to-heading pt-0">{AppConstants.matchStatus}</span>
        <div className="reg-competition-radio">
          {this.detailsContainer(AppImages.greenDot, AppConstants.final_description)}
          {this.detailsContainer(AppImages.purpleDot, AppConstants.draft_description)}
          {this.detailsContainer(AppImages.redDot, AppConstants.dispute_description)}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.shootingStats}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey={'26'} />
        <Layout>
          {this.headerView()}
          <Content>{this.contentView()}</Content>
          {this.footerView()}
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      liveScorePlayerStatisticsListAction,
      exportFilesAction,
      setPageSizeAction,
      setPageNumberAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreGoalState: state.LiveScoreGoalState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScorePlayerStatistics);
