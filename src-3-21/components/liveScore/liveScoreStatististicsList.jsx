import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Breadcrumb, Table, Pagination, Select, Button, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import CustomToolTip from 'react-png-tooltip';

import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import {
  liveScoreGoalListAction,
  setPageSizeAction,
  setPageNumberAction,
} from '../../store/actions/LiveScoreAction/liveScoreGoalsAction';
import history from '../../util/history';
import { getLiveScoreCompetition, getOrganisationData } from '../../util/sessionStorage';
import { liveScore_formateDateTime } from '../../themes/dateformate';
import { exportFilesAction } from '../../store/actions/appAction';
import { isArrayNotEmpty } from '../../util/helpers';
import {FLAVOUR, SPORT} from '../../util/enums';
import { getLiveScoreDivisionList } from '../../store/actions/LiveScoreAction/liveScoreDivisionAction';
import { liveScoreRoundListAction } from '../../store/actions/LiveScoreAction/liveScoreRoundAction';
import { TableComponent } from "../common/TableComponent";
import { getLiveScoreSettingInitiate } from "../../store/actions/LiveScoreAction/LiveScoreSettingAction";
import { NavLink } from "react-router-dom";
import moment from 'moment-timezone';

const { Content } = Layout;
const { Option } = Select;

class LiveScoreStatisticsList extends TableComponent {

  getColumnsBySport() {
    const nameCols = [
      this.defaultCell({
        key: 'firstName',
        render: (firstName, record) => (
          <NavLink
            to={{
              pathname: '/userPersonal',
              state: {
                userId: record.userId,
                screenKey: 'livescore',
                screen: this.showFouls() ? '/matchDayFoulsList' : '/matchDayGoalsList',
              },
            }}
          >
            <span className="input-heading-add-another pt-0">{firstName}</span>
          </NavLink>
        ),
      }),
      this.defaultCell({
        key: 'lastName',
        render: (lastName, record) => (
          <NavLink
            to={{
              pathname: '/userPersonal',
              state: {
                userId: record.userId,
                screenKey: 'livescore',
                screen: this.showFouls() ? '/matchDayFoulsList' : '/matchDayGoalsList',
              },
            }}
          >
            <span className="input-heading-add-another pt-0">{lastName}</span>
          </NavLink>
        ),
      })
    ]
    return {
      football: {
        teamCols: [
          this.defaultCell({
            key: 'teamName',
            titleKey: 'team',
            sortableKey: 'team',
          }),
        ],
        userCols: [
          this.defaultCell({
            key: 'playerId',
            sortable: false,
          }),
          ...nameCols,
          this.defaultCell({
            key: 'gamePositionName',
            titleKey: 'position',
            sortableKey: 'position',
          }),
        ],
        matchCols: [
          this.defaultCell({
            key: 'roundName',
            titleKey: 'round',
          }),
          this.defaultCell({
            key: 'matchId',
            titleKey: 'tableMatchID',
          }),
          this.defaultCell({
            key: 'startTime',
            titleKey: 'date',
            sortableKey: 'date',
            render: startTime => <span>{liveScore_formateDateTime(startTime)}</span>,
          }),
        ],
        statsCols: {
          goals: [
            this.defaultCell({
              key: 'goal',
              titleKey: 'goals',
            }),
            this.defaultCell({
              key: 'penalty',
              titleKey: 'goalsPenalties',
            }),
            this.defaultCell({
              key: 'penaltyShootout',
            }),
            this.defaultCell({
              key: 'assist',
              titleKey: 'assists',
            }),
            this.defaultCell({
              key: 'own_goal',
              titleKey: 'ownGoals',
              sortableKey: 'ownGoal',
            }),
          ],
          fouls: this.props.liveScoreSetting?.form?.foulsSettings?.recordOffenceCodes ? [
            this.defaultCell({
              key: 'yellow_card',
              title: 'Yellow Card',
            }),
            this.defaultCell({
              key: 'red_card',
              title: 'Red Card',
            }),
            this.defaultCell({
              key: 'yellow_card_TD',
              title: 'Yellow Card TD',
            }),
            this.defaultCell({
              key: 'yd',
              titleKey: 'YD',
            }),
            this.defaultCell({
              key: 'y1',
              titleKey: 'Y1',
            }),
            this.defaultCell({
              key: 'y2',
              titleKey: 'Y2',
            }),
            this.defaultCell({
              key: 'y3',
              titleKey: 'Y3',
            }),
            this.defaultCell({
              key: 'y4',
              titleKey: 'Y4',
            }),
            this.defaultCell({
              key: 'y5',
              titleKey: 'Y5',
            }),
            this.defaultCell({
              key: 'y6',
              titleKey: 'Y6',
            }),
            this.defaultCell({
              key: 'y7',
              titleKey: 'Y7',
            }),
            this.defaultCell({
              key: 'y8',
              titleKey: 'Y8',
            }),
            this.defaultCell({
              key: 'r1',
              titleKey: 'R1',
            }),
            this.defaultCell({
              key: 'r2',
              titleKey: 'R2',
            }),
            this.defaultCell({
              key: 'r3',
              titleKey: 'R3',
            }),
            this.defaultCell({
              key: 'r4',
              titleKey: 'R4',
            }),
            this.defaultCell({
              key: 'r5',
              titleKey: 'R5',
            }),
            this.defaultCell({
              key: 'r6',
              titleKey: 'R6',
            }),
            this.defaultCell({
              key: 'r7',
              titleKey: 'R7',
            }),
            this.defaultCell({
              key: 'r8',
              titleKey: 'R8',
            }),
          ] : [
            this.defaultCell({
              key: 'yellow_card',
              titleKey: 'yellowCard',
            }),
            this.defaultCell({
              key: 'red_card',
              titleKey: 'redCard',
            }),
            this.defaultCell({
              key: 'yellow_card_TD',
              titleKey: 'yellowCardTD',
            }),
          ],
        },
      },
      netball: {
        teamCols: [
          this.defaultCell({
            key: 'teamName',
            titleKey: 'team',
            sortableKey: 'team',
          }),
        ],
        userCols: [
          this.defaultCell({
            key: 'playerId',
          }),
          ...nameCols,
          this.defaultCell({
            key: 'gamePositionName',
            titleKey: 'position',
            sortableKey: 'position',
          }),
        ],
        matchCols: [
          this.defaultCell({
            key: 'roundName',
            titleKey: 'round',
          }),
          this.defaultCell({
            key: 'matchId',
            titleKey: 'tableMatchID',
          }),
          this.defaultCell({
            key: 'startTime',
            titleKey: 'date',
            sortableKey: 'date',
            render: startTime => <span>{liveScore_formateDateTime(startTime)}</span>,
          }),
        ],
        statsCols: {
          goals: [
            this.defaultCell({
              key: 'goal',
              titleKey: 'goals',
              sortableKey: 'goals',
            }),
            this.defaultCell({
              key: 'miss',
              titleKey: 'misses',
              sortableKey: 'misses',
            }),
            this.defaultCell({
              key: 'penalty_miss',
              titleKey: 'missedPenalties',
            }),
            this.defaultCell({
              key: 'attempts',
              title: (
                <span>
                {AppConstants.attempts}
                  <CustomToolTip>
                  <span>{AppConstants.attemptsAlgorithm}</span>
                </CustomToolTip>
              </span>
              ),
            }),
            this.defaultCell({
              key: 'goal_percent',
              titleKey: 'goalPercent',
              sortableKey: 'goalPercent',
            }),
          ],
          fouls: [],
        },
      },
      basketball: {
        teamCols: [
          this.defaultCell({
            key: 'teamName',
            titleKey: 'team',
            sortableKey: 'team',
          }),
        ],
        userCols: [
          ...nameCols,
        ],
        matchCols: [
          this.defaultCell({
            key: 'roundName',
            titleKey: 'round',
          }),
          this.defaultCell({
            key: 'matchId',
            titleKey: 'tableMatchID',
          }),
          this.defaultCell({
            key: 'startTime',
            titleKey: 'date',
            sortableKey: 'date',
            render: startTime => <span>{liveScore_formateDateTime(startTime)}</span>,
          }),
        ],
        statsCols: {
          goals: [
            this.defaultCell({
              key: 'PTS',
            }),
            this.defaultCell({
              key: 'FG',
            }),
            this.defaultCell({
              key: 'FG%',
            }),
            this.defaultCell({
              key: '2P',
            }),
            this.defaultCell({
              key: '2P%',
            }),
            this.defaultCell({
              key: '3P',
            }),
            this.defaultCell({
              key: '3P%',
            }),
            this.defaultCell({
              key: 'FT',
            }),
            this.defaultCell({
              key: 'FT%',
            }),
          ],
          fouls: [],
        },
      },
    };
  }

  constructor(props) {
    super(props, params => this.fetchStatsList(params));
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
      selectedDivision: 'All',
      selectedRound: 'All',
      divisionLoad: false,
      roundLoad: false,
    };
  }

  groupByMatch() {
    return this.state.filter === 'By Match';
  }

  showFouls() {
    return this.props.show === 'fouls';
  }

  getColumns() {
    const flavour = AppConstants.flavour;
    const columnConfig = this.getColumnsBySport()[flavour];
    return [
      ...(this.groupByMatch() ? columnConfig.matchCols : []),
      ...columnConfig.teamCols,
      ...columnConfig.userCols,
      ...(this.showFouls() ? columnConfig.statsCols.fouls : columnConfig.statsCols.goals),
    ]
  }

  async componentDidMount() {
    let { livescoreGoalActionObject } = this.props.liveScoreGoalState;
    if (getLiveScoreCompetition()) {
      const { id, competitionOrganisation, organisationId } = JSON.parse(getLiveScoreCompetition());
      let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
      const orgItem = await getOrganisationData();
      const userOrganisationId = orgItem ? orgItem.organisationId : 0;
      let liveScoreCompIsParent = userOrganisationId === organisationId;
      this.setState({ competitionId: id, compOrgId, liveScoreCompIsParent, divisionLoad: true });
      if (id !== null) {
        this.props.getLiveScoreDivisionList(
          id,
          undefined,
          undefined,
          undefined,
          liveScoreCompIsParent,
          compOrgId,
        );
        this.props.getLiveScoreSettingInitiate(id);
      } else {
        history.push('/matchDayCompetitions');
      }
    } else {
      history.push('/matchDayCompetitions');
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
        this.onPageChange(1);
        this.setState({ roundLoad: false });
      }
    }
  }

  onExport = () => {
    const selectedStats = this.getSelectedStats();
    const aggregate = this.state.filter === 'By Match' ? 'MATCH' : 'ALL';
    const sportRefId = SPORT[process.env.REACT_APP_FLAVOUR];
    const queryParams = [
      `${this.state.competitionId}`,
      `aggregate=${aggregate}`,
      `divisionId=${this.state.selectedDivision === 'All' ? '' : this.state.selectedDivision}`,
      `roundIds=${this.state.selectedRound === 'All' ? '' : this.state.selectedRound}`,
      `sportRefId=${sportRefId}`,
      `timezone=${moment.tz.guess()}`
    ];
    if (selectedStats && selectedStats.length) {
      selectedStats.forEach(selectedStat => {
        queryParams.push(`selectedStats=${selectedStat}`);
      });
    }

    if (this.state.liveScoreCompIsParent !== true) {
      queryParams.push(`competitionOrganisationId=${this.state.compOrgId}`);
    }
    const url = AppConstants.goalExport + queryParams.join('&');
    this.props.exportFilesAction(url);
  };

  getSelectedStats() {
    const flavour = AppConstants.flavour;
    const columnConfig = this.getColumnsBySport()[flavour];
    let selectedStats = undefined;
    if (flavour === FLAVOUR.Football) {
      selectedStats = this.showFouls() ? columnConfig.statsCols.fouls.map(col => col.key) : columnConfig.statsCols.goals.map(col => col.key);
    }
    return selectedStats;
  }

  fetchStatsList = (params = {}) => {
    let { filter, searchText, offset, pageSize, sortBy, sortOrder } = params;
    if (filter === undefined) {
      filter = this.state.filter;
    }
    if (searchText === undefined) {
      searchText = this.state.searchText || '';
    }
    if (offset === undefined) {
      offset = 0;
    }
    if (pageSize === undefined) {
      pageSize = this.props.liveScoreGoalState.pageSize;
      pageSize = pageSize ? pageSize : 10;
    }
    if (sortBy === undefined) {
      sortBy = this.state.sortBy;
    }
    if (sortOrder === undefined) {
      sortOrder = this.state.sortOrder;
    }

    const selectedStats = this.getSelectedStats();

    this.props.liveScoreGoalListAction({
      selectedStats,
      competitionID: this.state.competitionId,
      goalType: filter,
      search: searchText,
      offset,
      limit: pageSize,
      sortBy,
      sortOrder,
      divisionId: this.state.selectedDivision === 'All' ? '' : this.state.selectedDivision,
      roundId: this.state.selectedRound === 'All' ? '' : this.state.selectedRound,
      isParent: this.state.liveScoreCompIsParent,
      compOrgId: this.state.compOrgId,
      sportRefId: SPORT[process.env.REACT_APP_FLAVOUR],
    });
  }

  // on change search text
  onChangeSearchText = e => {
    this.setState({ searchText: e.target.value, offset: 0 });
    if (e.target.value === null || e.target.value === '') {
      this.fetchStatsList({ searchText: '' });
    }
  };

  // search key
  onKeyEnterSearchText = e => {
    this.setState({ offset: 0 });
    var code = e.keyCode || e.which;
    if (code === 13) {
      this.fetchStatsList({ searchText: e.target.value });
    }
  };

  // on click of search icon
  onClickSearchIcon = () => {
    this.setState({ offset: 0 });
    if (this.state.searchText === null || this.state.searchText === '') {
    } else {
      this.fetchStatsList();
    }
  };

  onChangeFilter = filter => {
    this.fetchStatsList({ filter });
    this.setState({ filter });
  };

  headerView = () => {
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="row">
          <div className="col-sm align-self-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {this.showFouls() ? AppConstants.foulStatistics : AppConstants.goalStatistics}
              </Breadcrumb.Item>
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
    this.onPageChange(1);
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

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setPageSizeAction(pageSize);
  };

  onPageChange = async page => {
    await this.props.setPageNumberAction(page);
    let { pageSize } = this.props.liveScoreGoalState;
    pageSize = pageSize ? pageSize : 10;
    let offset = page ? pageSize * (page - 1) : 0;
    this.fetchStatsList({ offset, pageSize })
  };

  contentView = () => {
    const { result, totalCount, currentPage, pageSize, onLoad, onDivisionLoad, roundLoad } =
      this.props.liveScoreGoalState;
    let goalList = isArrayNotEmpty(result) ? result : [];
    const tableColumns = this.getColumns();
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={onLoad || onDivisionLoad || roundLoad}
            className="home-dashboard-table"
            columns={tableColumns}
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

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.shootingStats}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey={this.showFouls() ? 'matchDayFoulsList' : 'matchDayGoalsList'} />
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
      liveScoreGoalListAction,
      exportFilesAction,
      setPageSizeAction,
      setPageNumberAction,
      getLiveScoreDivisionList,
      getLiveScoreSettingInitiate,
      liveScoreRoundListAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreGoalState: state.LiveScoreGoalState,
    liveScoreSetting: state.LiveScoreSetting,
    liveScoreTeamAttendanceState: state.LiveScoreTeamAttendanceState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreStatisticsList);
