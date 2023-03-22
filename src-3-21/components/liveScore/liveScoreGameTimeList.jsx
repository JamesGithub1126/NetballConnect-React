import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Button, Table, Breadcrumb, Pagination, Select, Input, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import {
  gameTimeStatisticsListAction,
  setPageSizeAction,
  setPageNumberAction,
} from '../../store/actions/LiveScoreAction/liveScoregameTimeStatisticsAction';
import AppImages from '../../themes/appImages';
import history from '../../util/history';
import { getLiveScoreCompetition, getOrganisationData } from '../../util/sessionStorage';
import { exportFilesAction } from '../../store/actions/appAction';
import { teamListDataCheck } from '../../util/helpers';
import ValidationConstants from '../../themes/validationConstant';
import { gameTimeListFilter } from './liveScoreSettings/constants/liveScoreSettingsConstants';
import { isBasketball } from './liveScoreSettings/liveScoreSettingsUtils';

const { Content } = Layout;
const { Option } = Select;

var this_obj = null;

/// Check play percentage value
function checkPlay(record) {
  let playTimeTeamMatches = JSON.parse(record.playTimeTeamMatches);
  let playTime = record.playTime ? JSON.parse(record.playTime) : 0;

  if (playTimeTeamMatches === 0 || playTimeTeamMatches === null) {
    return '';
  } else {
    let result = 100 * (playTime / playTimeTeamMatches);
    return result.toFixed(2) + '%';
  }
}

//// Check play time
function checkPlayTime(record) {
  if (record.playTime !== null) {
    if (this_obj.state.filter === 'MATCH') {
      if (record.playTime === 0) {
        return record.playTime + ' Games';
      } else if (record.playTime === 1) {
        return record.playTime + ' Game';
      } else {
        return record.playTime + ' Games';
      }
    } else if (this_obj.state.filter === AppConstants.minute) {
      let d = Number(record.playTime);
      var h = Math.floor(d / 3600);
      var m = Math.floor((d % 3600) / 60);
      var s = Math.floor((d % 3600) % 60);

      var hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : '';
      var mDisplay = m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : '';
      var sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '';
      let time_value = hDisplay + mDisplay + sDisplay;

      return time_value;
    } else {
      if (record.playTime === 0) {
        return record.playTime + ' Periods';
      } else if (record.playTime === 1) {
        return record.playTime + ' Period';
      } else {
        return record.playTime + ' Periods';
      }
    }
  }
}

// function checkPlayerId(player) {
//     if (player.mnbPlayerId == "undefined" || player.mnbPlayerId == "") {
//         return player.id
//     } else {
//         return player.mnbPlayerId
//     }
// }

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
  let { gameTimeStatisticsPageSize } = this_obj.props.liveScoreGameTimeStatisticsState;
  gameTimeStatisticsPageSize = gameTimeStatisticsPageSize ? gameTimeStatisticsPageSize : 10;
  this_obj.props.gameTimeStatisticsListAction(
    this_obj.state.competitionId,
    this_obj.state.filter === 'All' ? '' : this_obj.state.filter,
    this_obj.state.offset,
    gameTimeStatisticsPageSize,
    this_obj.state.searchText,
    sortBy,
    sortOrder,
    this_obj.state.liveScoreCompIsParent,
    this_obj.state.compOrgId,
  );
}

const columns = [
  {
    title: AppConstants.userId,
    dataIndex: 'userId',
    key: 'userId',
    render: (userId, record) => {
      return <span>{record.player?.userId}</span>;
    },
  },
  {
    title: AppConstants.playerId,
    dataIndex: 'id',
    key: 'id',
    sorter: true,
    onHeaderCell: () => listeners('id'),
    // render: (player, record) => <NavLink to={{
    //     pathname: '/matchDayPlayerView',
    //     state: { tableRecord: record }
    // }}>
    //     <span className="input-heading-add-another pt-0">{checkPlayerId(player)}</span>
    // </NavLink>
  },
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'firstName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('firstName'),
    render: (firstName, record) => (
      <span className="input-heading-add-another pt-0" onClick={() => this_obj.checkUserId(record)}>
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
      <span className="input-heading-add-another pt-0" onClick={() => this_obj.checkUserId(record)}>
        {lastName}
      </span>
    ),
  },
  {
    title: AppConstants.team,
    dataIndex: 'team',
    key: 'team',
    sorter: true,
    onHeaderCell: () => listeners('team'),
    render: team =>
      teamListDataCheck(
        team.id,
        this_obj.state.liveScoreCompIsParent,
        team,
        this_obj.state.compOrgId,
        team,
      ) ? (
        <NavLink
          to={{
            pathname: '/matchDayTeamView',
            state: { tableRecord: team, screenName: 'fromGameTimeList' },
          }}
        >
          <span className="input-heading-add-another pt-0">{team.name}</span>
        </NavLink>
      ) : (
        <span>{team.name}</span>
      ),
  },
  {
    title: AppConstants.div,
    dataIndex: 'division',
    key: 'division',
    sorter: true,
    onHeaderCell: () => listeners('div'),
    render: division => <span>{division ? division.name : ''}</span>,
  },
  {
    title: AppConstants.playTime,
    dataIndex: 'playTime',
    key: 'playTime',
    sorter: false,
    // onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (playTime, record) => <span>{checkPlayTime(record)}</span>,
  },
  {
    title: AppConstants.playPercent,
    dataIndex: 'playPercent',
    key: 'playPercent',
    sorter: true,
    onHeaderCell: () => listeners('playPercent'),
    render: (playTime, record) => <span>{checkPlay(record)}</span>,
  },
  // {
  //     title: AppConstants.playingUp,
  //     dataIndex: 'playingUp',
  //     key: 'playingUp',
  //     sorter: (a, b) => a.playingUp.length - b.playingUp.length,
  //     render: (playingUp) =>
  //         <span className="input-heading-add-another pt-0" style={{ color: playingUp < '25%' ? 'red' : 'green' }}>{playingUp}</span>
  // },
];

class LiveScoreGameTimeList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectStatus: 'Select Status',
      filter: '',
      competitionId: null,
      searchText: '',
      offset: 0,
      sortBy: null,
      sortOrder: null,
      compOrgId: 0,
      liveScoreCompIsParent: false,
    };
    this_obj = this;
  }

  async componentDidMount() {
    let { gameTimeStatisticsActionObject } = this.props.liveScoreGameTimeStatisticsState;
    if (getLiveScoreCompetition()) {
      const { id, attendanceRecordingPeriod, organisationId, competitionOrganisation } = JSON.parse(
        getLiveScoreCompetition(),
      );

      const orgItem = await getOrganisationData();
      const userOrganisationId = orgItem ? orgItem.organisationId : 0;
      let liveScoreCompIsParent = userOrganisationId === organisationId;
      let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;

      this.setState({
        competitionId: id,
        filter:
          isBasketball && attendanceRecordingPeriod === AppConstants.period
            ? AppConstants.minute
            : attendanceRecordingPeriod,
        liveScoreCompIsParent,
        compOrgId,
      });
      if (id !== null) {
        let { gameTimeStatisticsPageSize } = this.props.liveScoreGameTimeStatisticsState;
        gameTimeStatisticsPageSize = gameTimeStatisticsPageSize ? gameTimeStatisticsPageSize : 10;
        if (gameTimeStatisticsActionObject) {
          let offset = gameTimeStatisticsActionObject.offset;
          let searchText = gameTimeStatisticsActionObject.searchText;
          let sortBy = gameTimeStatisticsActionObject.sortBy;
          let sortOrder = gameTimeStatisticsActionObject.sortOrder;
          let aggregate = gameTimeStatisticsActionObject.aggregate;
          await this.setState({ offset, searchText, sortBy, sortOrder, filter: aggregate });

          this.props.gameTimeStatisticsListAction(
            id,
            aggregate === 'All' ? '' : aggregate,
            offset,
            gameTimeStatisticsPageSize,
            searchText,
            sortBy,
            sortOrder,
            liveScoreCompIsParent,
            compOrgId,
          );
        } else {
          await this.setState({ filter: attendanceRecordingPeriod })
          this.props.gameTimeStatisticsListAction(
            id,
            attendanceRecordingPeriod,
            0,
            gameTimeStatisticsPageSize,
            this.state.searchText,
            undefined,
            undefined,
            liveScoreCompIsParent,
            compOrgId,
          );
        }
      } else {
        history.push('/matchDayCompetitions');
      }
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  checkUserId(record) {
    let userId = record.player ? record.player.userId : null;
    if (userId == null) {
      message.config({ duration: 1.5, maxCount: 1 });
      message.warn(ValidationConstants.playerMessage);
    } else {
      history.push('/userPersonal', {
        userId: userId,
        screenKey: 'livescore',
        screen: '/matchDayPlayerList',
      });
    }
  }

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setPageSizeAction(pageSize);
  };

  handleGameTimeTableList = async (page, competitionId, aggregate) => {
    await this.props.setPageNumberAction(page);
    let { gameTimeStatisticsPageSize } = this.props.liveScoreGameTimeStatisticsState;
    gameTimeStatisticsPageSize = gameTimeStatisticsPageSize ? gameTimeStatisticsPageSize : 10;
    let offset = page ? gameTimeStatisticsPageSize * (page - 1) : 0;
    this.setState({ offset });
    this.props.gameTimeStatisticsListAction(
      competitionId,
      aggregate === 'All' ? '' : aggregate,
      offset,
      gameTimeStatisticsPageSize,
      this.state.searchText,
      this.state.sortBy,
      this.state.sortOrder,
      this.state.liveScoreCompIsParent,
      this.state.compOrgId,
    );
  };

  setFilterValue = data => {
    const { id } = JSON.parse(getLiveScoreCompetition());
    let { gameTimeStatisticsPageSize } = this.props.liveScoreGameTimeStatisticsState;
    gameTimeStatisticsPageSize = gameTimeStatisticsPageSize ? gameTimeStatisticsPageSize : 10;
    let offset = 1 ? gameTimeStatisticsPageSize * (1 - 1) : 0;
    this.setState({ filter: data.filter });
    this.props.gameTimeStatisticsListAction(
      id,
      data.filter === 'All' ? '' : data.filter,
      offset,
      gameTimeStatisticsPageSize,
      this.state.searchText,
      this.state.sortBy,
      this.state.sortOrder,
      this.state.liveScoreCompIsParent,
      this.state.compOrgId,
    );
  };

  onExport = () => {
    let url = '';
    if (!this.state.liveScoreCompIsParent) {
      url =
        AppConstants.gameTimeExport +
        this.state.competitionId +
        `&aggregate=${this.state.filter}&competitionOrganisationId=` +
        this.state.compOrgId;
    } else {
      url =
        AppConstants.gameTimeExport + this.state.competitionId + `&aggregate=${this.state.filter}`;
    }
    this.props.exportFilesAction(url);
  };

  // on change search text
  onChangeSearchText = e => {
    const { id } = JSON.parse(getLiveScoreCompetition());
    this.setState({ searchText: e.target.value, offset: 0 });
    if (e.target.value === null || e.target.value === '') {
      let { gameTimeStatisticsPageSize } = this.props.liveScoreGameTimeStatisticsState;
      gameTimeStatisticsPageSize = gameTimeStatisticsPageSize ? gameTimeStatisticsPageSize : 10;
      this.props.gameTimeStatisticsListAction(
        id,
        this.state.filter === 'All' ? '' : this.state.filter,
        0,
        gameTimeStatisticsPageSize,
        e.target.value,
        this.state.sortBy,
        this.state.sortOrder,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
      );
    }
  };

  // search key
  onKeyEnterSearchText = e => {
    this.setState({ offset: 0 });
    var code = e.keyCode || e.which;
    const { id } = JSON.parse(getLiveScoreCompetition());
    // this.setState({ searchText: e.target.value })
    if (code === 13) {
      // 13 is the enter keycode
      let { gameTimeStatisticsPageSize } = this.props.liveScoreGameTimeStatisticsState;
      gameTimeStatisticsPageSize = gameTimeStatisticsPageSize ? gameTimeStatisticsPageSize : 10;
      this.props.gameTimeStatisticsListAction(
        id,
        this.state.filter === 'All' ? '' : this.state.filter,
        0,
        gameTimeStatisticsPageSize,
        this.state.searchText,
        this.state.sortBy,
        this.state.sortOrder,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
      );
    }
  };

  // on click of search icon
  onClickSearchIcon = () => {
    this.setState({ offset: 0 });
    const { id } = JSON.parse(getLiveScoreCompetition());
    if (this.state.searchText === null || this.state.searchText === '') {
    } else {
      let { gameTimeStatisticsPageSize } = this.props.liveScoreGameTimeStatisticsState;
      gameTimeStatisticsPageSize = gameTimeStatisticsPageSize ? gameTimeStatisticsPageSize : 10;
      this.props.gameTimeStatisticsListAction(
        id,
        this.state.filter === 'All' ? '' : this.state.filter,
        0,
        gameTimeStatisticsPageSize,
        this.state.searchText,
        this.state.sortBy,
        this.state.sortOrder,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
      );
    }
  };

  headerView = () => {
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="row">
          <div className="col-sm align-self-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.gameTimeStatistics}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="col-sm d-flex flex-row align-items-center justify-content-end">
            <div className="row">
              <div className="col-sm">
                <Select
                  className="year-select reg-filter-select1 d-flex justify-content-end"
                  style={{ minWidth: 140 }}
                  // onChange={(selectStatus) => this.setState({ selectStatus })}
                  onChange={filter => this.setFilterValue({ filter })}
                  value={this.state.filter}
                >
                  {/* <Option value="All">All</Option> */}
                  {gameTimeListFilter.map(({ value, text }) => (
                    <Option key={value} value={value}>
                      {text}
                    </Option>
                  ))}
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

  ////////tableView view for Game Time list
  tableView = () => {
    const {
      gameTimeStatisticsListResult,
      gameTimeStatisticsPage,
      gameTimeStatisticsPageSize,
      onLoad,
      gameTimeStatisticstotalCount,
    } = this.props.liveScoreGameTimeStatisticsState;
    // let competitionId = getCompetitionId()
    const { id } = JSON.parse(getLiveScoreCompetition());
    let dataSource = gameTimeStatisticsListResult.stats || [];

    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={onLoad === true && true}
            className="home-dashboard-table"
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            rowKey={(record, index) => 'gameTimes' + record.id + index}
          />
        </div>
        <div className="comp-dashboard-botton-view-mobile">
          <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end" />
          <div className="d-flex justify-content-end">
            <Pagination
              className="antd-pagination"
              showSizeChanger
              current={gameTimeStatisticsPage}
              defaultCurrent={gameTimeStatisticsPage}
              defaultPageSize={gameTimeStatisticsPageSize}
              total={gameTimeStatisticstotalCount}
              onChange={page => this.handleGameTimeTableList(page, id, this.state.filter)}
              onShowSizeChange={this.handleShowSizeChange}
            />
          </div>
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
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey={'15'} />
        <Layout>
          {this.headerView()}
          <Content>{getLiveScoreCompetition() && this.tableView()}</Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      gameTimeStatisticsListAction,
      exportFilesAction,
      setPageSizeAction,
      setPageNumberAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreGameTimeStatisticsState: state.LiveScoreGameTimeStatisticsState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreGameTimeList);
