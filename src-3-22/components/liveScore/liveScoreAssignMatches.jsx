import React, { Component } from 'react';
import { Layout, Table, Breadcrumb, Pagination, Select } from 'antd';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import { NavLink } from 'react-router-dom';
import { liveScore_MatchFormate } from '../../themes/dateformate';
import {
  assignMatchesAction,
  changeAssignStatus,
  unAssignMatcheStatus,
  setLiveScoreAssignMatchListPageSizeAction,
  setLiveScoreAssignMatchListPageNumberAction,
} from '../../store/actions/LiveScoreAction/liveScoreScorerAction';
import { getliveScoreTeams } from '../../store/actions/LiveScoreAction/liveScoreTeamAction';
import { getLiveScoreCompetition, getOrganisationData } from '../../util/sessionStorage';
import AppImages from '../../themes/appImages';
import history from '../../util/history';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isArrayNotEmpty } from '../../util/helpers';
// import { parseTwoDigitYear } from "moment";

const { Content } = Layout;
const { Option } = Select;

var this_obj = null;

/////function to sort table column
function tableSort(a, b, key) {
  let stringA = JSON.stringify(a[key]);
  let stringB = JSON.stringify(b[key]);
  return stringA.localeCompare(stringB);
}

function checkScorerMatch(data) {
  // let scorerID = this_obj.props.location.state ? this_obj.props.location.state.record.id : null
  // if(data && data.id == scorerID){
  if (data) {
    return 'Unassign';
  } else {
    return 'Assign';
  }
}

///columens data
// const columns1 = [
//     {
//         title: AppConstants.tableMatchID,
//         dataIndex: 'id',
//         key: 'id',
//         sorter: (a, b) => tableSort(a, b, "id"),
//         render: (id) => <NavLink to={{
//             pathname: '/matchDayMatchDetails',
//             state: { matchId: id }
//         }}>
//             <span className="input-heading-add-another pt-0">{id}</span>
//         </NavLink>
//     },
//     {
//         title: AppConstants.startTime,
//         dataIndex: 'startTime',
//         key: 'startTime',
//         sorter: (a, b) => tableSort(a, b, "startTime"),
//         render: (startTime) => <span>{startTime ? liveScore_MatchFormate(startTime) : ""}</span>
//     },
//     {
//         title: AppConstants.team1,
//         dataIndex: 'team1',
//         key: 'team1',
//         width: "80%",
//         sorter: (a, b) => tableSort(a, b, "team1"),
//         render: (team1, records, index) => {
//             return (
//                 <div className="row d-flex justify-content-center">
//                     <div className="col-sm-1">
//                         <img
//                             className="dot-image"
//                             src={records.scorer1 ? records.scorer1.rosterStatus ? records.scorer1.rosterStatus = "YES" ? AppImages.greenDot : AppImages.redDot : AppImages.blueDot : AppImages.greyDot}
//                             alt=""
//                             width="12"
//                             height="12"
//                         />
//                     </div>
//                     <div className="col-sm d-flex justify-content-start">
//                         <span style={{ overflowX: "auto" }} className="input-heading-add-another pt-0 column-width-style">{records.team1.name} ({records.scorer1 ? records.scorer1.firstName + " " + records.scorer1.lastName : "Unassigned"})</span>
//                     </div>
//                     <div className="col-sm mr-5 d-flex justify-content-end">
//                         <span style={{ textDecoration: "underline" }} onClick={() => this_obj.onChangeStatus(index, records, "scorer1", "team1", records.scorer1)} className="input-heading-add-another pt-0">{records.scorer1 ? "Unassign" : "Assign"}</span>
//                     </div>
//                 </div>
//             )
//         }
//     }
// ]

const columns2 = [
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'id',
    key: 'id',
    sorter: (a, b) => tableSort(a, b, 'id'),
    render: id => (
      <NavLink
        to={{
          pathname: '/matchDayMatchDetails',
          state: { matchId: id },
        }}
      >
        <span className="input-heading-add-another pt-0">{id}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.startTime,
    dataIndex: 'startTime',
    key: 'startTime',
    sorter: (a, b) => tableSort(a, b, 'startTime'),
    render: startTime => <span>{startTime ? liveScore_MatchFormate(startTime) : ''}</span>,
  },
  {
    title: AppConstants.team1,
    dataIndex: 'team1',
    key: 'team1',
    width: '40%',
    sorter: (a, b) => tableSort(a, b, 'team1'),
    render: (team1, records, index) => {
      return (
        <div className="row d-flex justify-content-center">
          <div className="col-sm-1">
            <img
              className="dot-image"
              src={
                records.scorer1
                  ? records.scorer1.rosterStatus
                    ? (records.scorer1.rosterStatus = 'YES' ? AppImages.greenDot : AppImages.redDot)
                    : AppImages.blueDot
                  : AppImages.greyDot
              }
              alt=""
              width="12"
              height="12"
            />
          </div>
          <div className="col-sm d-flex justify-content-start">
            <span className="pt-0">
              {records.team1.name} (
              {records.scorer1
                ? records.scorer1.firstName + ' ' + records.scorer1.lastName
                : 'Unassigned'}
              )
            </span>
          </div>
          {this_obj.checkToShowAssignText(records.team1) && (
            <div className="col-sm d-flex justify-content-end">
              <span
                style={{ textDecoration: 'underline' }}
                onClick={() =>
                  this_obj.onChangeStatus(index, records, 'scorer1', 'team1', records.scorer1)
                }
                className="input-heading-add-another pt-0"
              >
                {checkScorerMatch(records.scorer1)}
              </span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    title: AppConstants.team2,
    dataIndex: 'team2',
    key: 'team2',
    width: '40%',
    sorter: (a, b) => tableSort(a, b, 'team2'),
    render: (team2, records, index) => {
      return (
        <div className="row d-flex justify-content-center">
          <div className="col-sm-1">
            <img
              className="dot-image"
              src={
                records.scorer2
                  ? records.scorer2.rosterStatus
                    ? (records.scorer2.rosterStatus = 'YES' ? AppImages.greenDot : AppImages.redDot)
                    : AppImages.blueDot
                  : AppImages.greyDot
              }
              alt=""
              width="12"
              height="12"
            />
          </div>
          <div className="col-sm d-flex justify-content-start">
            {this_obj.state.scoring_Type !== 'SINGLE' ? (
              <span className="pt-0">
                {records.team2.name} (
                {records.scorer2
                  ? records.scorer2.firstName + ' ' + records.scorer2.lastName
                  : 'Unassigned'}
                )
              </span>
            ) : (
              <span className="pt-0">{records.team2.name}</span>
            )}
          </div>
          {this_obj.state.scoring_Type !== 'SINGLE' &&
          this_obj.checkToShowAssignText(records.team2) ? (
            <div className="col-sm d-flex justify-content-end">
              <span
                style={{ textDecoration: 'underline' }}
                onClick={() =>
                  this_obj.onChangeStatus(index, records, 'scorer2', 'team2', records.scorer2)
                }
                className="input-heading-add-another pt-0"
              >
                {checkScorerMatch(records.scorer2)}
              </span>
            </div>
          ) : null}
        </div>
      );
    },
  },
  // {
  //     title: '',
  //     dataIndex: 'scorer',
  //     key: 'scorer',
  //     render: (team1, records, index) => {
  //         return <span onClick={() => this.onChangeStatus(index, records)} className="input-heading-add-another pt-0">{records.scorer2 ? "Assign" : "Unassign"}</span>
  //     }
  // }
];

class LiveScoreAssignMatch extends Component {
  constructor(props) {
    super(props);
    if (getLiveScoreCompetition()) {
      const { scoringType } = JSON.parse(getLiveScoreCompetition());
      this.state = {
        filter: '',
        competitionId: 0,
        teamID: null,
        // columns: scoringType === "SINGLE" ? columns1 : columns2,
        columns: columns2,
        lodding: false,
        scoring_Type: scoringType,
        liveScoreCompIsParent: false,
      };
    } else {
      history.push('/matchDayCompetitions');
    }

    this_obj = this;
  }

  async componentDidMount() {
    if (getLiveScoreCompetition()) {
      const { id, competitionOrganisation, organisationId } = JSON.parse(getLiveScoreCompetition());
      const orgItem = await getOrganisationData();
      const userOrganisationId = orgItem ? orgItem.organisationId : 0;
      let liveScoreCompIsParent = userOrganisationId === organisationId;

      let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
      this.setState({ lodding: true, liveScoreCompIsParent });

      if (id !== null) {
        this.props.getliveScoreTeams(id, null, compOrgId);
      } else {
        history.push('/');
      }
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  componentDidUpdate(nextProps) {
    if (nextProps.liveScoreScorerState.teamResult !== this.props.liveScoreScorerState.teamResult) {
      if (this.state.lodding && this.props.liveScoreScorerState.onLoad == false) {
        const { id } = JSON.parse(getLiveScoreCompetition());
        let { assignMatchListPageSize } = this.props.liveScoreScorerState;
        assignMatchListPageSize = assignMatchListPageSize ? assignMatchListPageSize : 10;
        const body = {
          paging: {
            limit: assignMatchListPageSize,
            offset: 0,
          },
        };
        let teamId = this.props.liveScoreScorerState.allTeamData[0].id;
        this.props.assignMatchesAction(id, teamId, body);
        this.setState({ loading: false, teamID: teamId });
      }
    }
  }

  checkToShowAssignText = team => {
    if (!this.state.liveScoreCompIsParent) {
      const { competitionOrganisation } = JSON.parse(getLiveScoreCompetition());
      let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
      if (team.competitionOrganisationId === compOrgId) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  /// on status change
  onChangeStatus(index, data, scorerKey, teamKey, isScorer) {
    let scorerID = this.props.location.state ? this.props.location.state.record.id : null;
    if (!isScorer) {
      this.props.changeAssignStatus(
        index,
        data,
        4,
        this.state.teamID,
        scorerKey,
        teamKey,
        scorerID,
      );
    } else {
      // if(isScorer.id == scorerID){
      this.props.unAssignMatcheStatus(index, isScorer, scorerKey, teamKey, scorerID);
      // }else{
      //     this.props.changeAssignStatus(index, data, 4, this.state.teamID, scorerKey, teamKey,scorerID)
      // }
    }
  }

  /// On change values
  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setLiveScoreAssignMatchListPageSizeAction(pageSize);
    this.handlePagination(page);
  };

  handlePagination = async page => {
    await this.props.setLiveScoreAssignMatchListPageNumberAction(page);
    let { assignMatchListPageSize } = this.props.liveScoreScorerState;
    assignMatchListPageSize = assignMatchListPageSize ? assignMatchListPageSize : 10;
    let offset = page ? assignMatchListPageSize * (page - 1) : 0;
    this.setState({ lodding: true });
    const body = {
      paging: {
        limit: assignMatchListPageSize,
        offset,
      },
      searchText: '',
    };
    const { id } = JSON.parse(getLiveScoreCompetition());
    this.props.assignMatchesAction(id, this.state.teamID, body);
  };

  onChangeTeam(filter) {
    this.setState({ teamID: filter.filter });
    let { assignMatchListPageSize } = this.props.liveScoreScorerState;
    assignMatchListPageSize = assignMatchListPageSize ? assignMatchListPageSize : 10;
    const body = {
      paging: {
        limit: assignMatchListPageSize,
        offset: 0,
      },
      searchText: '',
    };
    const { id } = JSON.parse(getLiveScoreCompetition());
    this.props.assignMatchesAction(id, filter.filter, body);
  }

  headerView = () => {
    let teamData = isArrayNotEmpty(this.props.liveScoreScorerState.allTeamData)
      ? this.props.liveScoreScorerState.allTeamData
      : [];

    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="row">
          <div className="col-sm align-self-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.assignMatches}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <div className="col-sm d-flex flex-row align-items-center justify-content-end">
            <div className="row">
              <Select
                className="year-select d-flex align-items-start"
                // onChange={(selectStatus) => this.setState({ selectStatus })}
                onChange={filter => this.onChangeTeam({ filter })}
                value={this.state.teamID}
              >
                {teamData.map(item => (
                  <Option key={'team_' + item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  ////////tableView view for Game Time list
  tableView = () => {
    const {
      assignMatches,
      assignMatchTotalCount,
      assignMatchListPage,
      assignMatchListPageSize,
      onLoad,
    } = this.props.liveScoreScorerState;

    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={onLoad && true}
            className="home-dashboard-table"
            columns={this.state.columns}
            dataSource={assignMatches}
            pagination={false}
          />
        </div>
        <div className="comp-dashboard-botton-view-mobile">
          <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row justify-content-center">
            <div className="col-sm">
              <div className="reg-add-save-button">
                <span
                  onClick={() => history.push('/matchDayScorerList')}
                  className="input-heading-add-another pointer"
                >
                  {AppConstants.backToScorer}
                </span>
              </div>
            </div>
            <div className="d-flex justify-content-end">
              <Pagination
                className="antd-pagination"
                showSizeChanger
                current={assignMatchListPage}
                defaultCurrent={assignMatchListPage}
                defaultPageSize={assignMatchListPageSize}
                total={assignMatchTotalCount}
                onChange={this.handlePagination}
                onShowSizeChange={this.handleShowSizeChange}
              />
            </div>
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
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="5" />
        <Layout>
          {getLiveScoreCompetition() && this.headerView()}
          <Content>{getLiveScoreCompetition() && this.tableView()}</Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      assignMatchesAction,
      changeAssignStatus,
      getliveScoreTeams,
      unAssignMatcheStatus,
      setLiveScoreAssignMatchListPageSizeAction,
      setLiveScoreAssignMatchListPageNumberAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreScorerState: state.LiveScoreScorerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreAssignMatch);
