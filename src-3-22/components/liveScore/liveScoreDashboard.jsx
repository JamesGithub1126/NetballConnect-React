import React, { Component } from 'react';
import { Layout, Button, Table, message, Pagination, Menu, Modal, Radio } from 'antd';
import './liveScore.css';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { liveScoreMatchListAction } from '../../store/actions/LiveScoreAction/liveScoreMatchAction';
import {
  liveScoreDashboardListAction,
  //liveScorePlayersToPayListAction,
  liveScorePlayersToPayRetryPaymentAction,
  liveScorePlayersToCashReceivedAction,
  setPageSizeAction,
  setPageNumberAction,
  setSingleGamePageSizeAction,
} from '../../store/actions/LiveScoreAction/liveScoreDashboardAction';
import history from '../../util/history';
import {
  // getCompetitionId,
  getLiveScoreCompetition,
  getOrganisationData,
  // getLiveScoreUmpireCompition
} from '../../util/sessionStorage';
import { liveScore_formateDate } from '../../themes/dateformate';
import { liveScore_formateDateTime, liveScore_MatchFormate } from '../../themes/dateformate';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { isArrayNotEmpty, teamListDataCheck } from '../../util/helpers';
import Tooltip from 'react-png-tooltip';
import ValidationConstants from '../../themes/validationConstant';
import { initializeCompData } from '../../store/actions/LiveScoreAction/liveScoreInnerHorizontalAction';
import { checkLivScoreCompIsParent } from 'util/permissions';
import Loader from '../../customComponents/loader';
import { registrationFailedStatusUpdate } from 'store/actions/registrationAction/registrationDashboardAction';
import {
  IncidentPlayerFirstName,
  IncidentPlayerLastName,
} from '../shared/incidents/IncidentPlayerName';
import { MatchStatus, MatchStatusRefId } from 'enums/enums';

const { Content } = Layout;
let this_obj = null;

/////function to sort table column
function tableSort(a, b, key) {
  let stringA = JSON.stringify(a[key]);
  let stringB = JSON.stringify(b[key]);
  return stringA.localeCompare(stringB);
}

function checkSorting(a, b, key) {
  switch (key) {
    case 'venueCourt':
      const venueOneName = getVenueName(a.venueCourt);
      const venueTwoName = getVenueName(b.venueCourt);
      return venueOneName.localeCompare(venueTwoName);

    case 'division':
      return a[key].name.localeCompare(b[key].name);

    case 'score':
      const teamOneScoreString = (a.team1Score, a.team2Score).toString();
      const teamTwoScoreString = (b.team1Score, b.team2Score).toString();
      return teamOneScoreString - teamTwoScoreString;

    default:
      return a[key].length - b[key].length;
  }
}

// function getFirstName(incidentPlayers) {
//     return incidentPlayers ? incidentPlayers[0].player.firstName : ""
// }

// function getLastName(incidentPlayers) {
//     return incidentPlayers ? incidentPlayers[0].player.lastName : ""
// }

function setMatchResult(record) {
  if (record.team1ResultId !== null) {
    if (record.team1ResultId === 4 || record.team1ResultId === 6 || record.team1ResultId === 6) {
      return 'Forfeit';
    } else if (record.team1ResultId === 8 || record.team1ResultId === 9) {
      return 'Abandoned';
    } else if (
      record.matchStatus === MatchStatus.Postponed ||
      record.matchStatusRefId === MatchStatusRefId.Postponed
    ) {
      return 'Postponed';
    } else {
      return record.team1Score + ' : ' + record.team2Score;
    }
  } else {
    return record.team1Score + ' : ' + record.team2Score;
  }
}

function getVenueName(data) {
  let venue_name = '';
  if (data.venue?.shortName) {
    venue_name = data.venue.shortName + ' - ' + data.name;
  } else {
    venue_name = data.venue?.name + ' - ' + data.name;
  }

  return venue_name;
}

function getTeamName(data) {
  if (data.player) {
    if (data.player.team) {
      return data.player.team.name;
    } else {
      return '';
    }
  } else {
    return '';
  }
}

function getAssociationName(data) {
  if (data.player?.team?.linkedCompetitionOrganisation) {
    return data.player.team.linkedCompetitionOrganisation.name;
  } else {
    return '';
  }
}

const columnActiveNews = [
  {
    title: AppConstants.title,
    dataIndex: 'title',
    key: 'title',
    sorter: (a, b) => tableSort(a, b, 'title'),
  },
  {
    title: AppConstants.author,
    dataIndex: 'author',
    key: 'author',
    sorter: (a, b) => tableSort(a, b, 'author'),
  },
  {
    title: AppConstants.expiry,
    dataIndex: 'news_expire_date',
    key: 'news_expire_date',
    sorter: (a, b) => tableSort(a, b, 'news_expire_date'),
    render: news_expire_date => (
      <span>{news_expire_date && liveScore_formateDate(news_expire_date)}</span>
    ),
  },
  {
    title: AppConstants.recipients,
    dataIndex: 'recipients',
    key: 'recipients',
    sorter: (a, b) => tableSort(a, b, 'recipients'),
  },
  {
    title: AppConstants.published,
    dataIndex: 'isActive',
    key: 'isActive',
    sorter: (a, b) => tableSort(a, b, 'isActive'),
    render: isActive => <span>{isActive == 1 ? 'Yes' : 'NO'}</span>,
  },
  {
    title: AppConstants.publishedDate,
    dataIndex: 'published_at',
    key: 'published_at',
    sorter: (a, b) => tableSort(a, b, 'published_at'),
    render: published_at => <span>{published_at && liveScore_formateDate(published_at)}</span>,
  },
  {
    title: AppConstants.notification,
    dataIndex: 'isNotification',
    key: 'isNotification',
    sorter: (a, b) => tableSort(a, b, 'isNotification'),
    render: isNotification => <span>{isNotification == 0 ? 'No' : 'Yes'}</span>,
  },
];

const columnsTodaysMatch = [
  {
    title: <span className="column-width-style">{'Match ID'} </span>,
    dataIndex: 'id',
    key: 'id',
    sorter: (a, b) => tableSort(a, b, 'id'),
    render: id => (
      <NavLink
        to={{
          pathname: '/matchDayMatchDetails',
          state: { matchId: id, key: 'dashboard' },
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
    render: startTime => (
      <span className="column-width-style">{liveScore_formateDateTime(startTime)}</span>
    ),
  },
  {
    title: AppConstants.home,
    dataIndex: 'team1',
    key: 'team1',
    sorter: (a, b) => tableSort(a, b, 'team1'),
    render: (team1, record) =>
      teamListDataCheck(
        team1.id,
        this_obj.state.liveScoreCompIsParent,
        record,
        this_obj.state.compOrgId,
        team1,
      ) ? (
        <NavLink
          to={{
            pathname: '/matchDayTeamView',
            state: { tableRecord: team1, key: 'dashboard' },
          }}
        >
          <span className="input-heading-add-another pt-0">{team1.name}</span>
        </NavLink>
      ) : (
        <span>{team1.name}</span>
      ),
  },
  {
    title: AppConstants.away,
    dataIndex: 'team2',
    key: 'team2',
    sorter: (a, b) => tableSort(a, b, 'team2'),
    render: (team2, record) =>
      teamListDataCheck(
        team2.id,
        this_obj.state.liveScoreCompIsParent,
        record,
        this_obj.state.compOrgId,
        team2,
      ) ? (
        <NavLink
          to={{
            pathname: '/matchDayTeamView',
            state: { tableRecord: team2, key: 'dashboard' },
          }}
        >
          <span className="input-heading-add-another pt-0">{team2.name}</span>
        </NavLink>
      ) : (
        <span>{team2.name}</span>
      ),
  },
  {
    title: AppConstants.venue,
    dataIndex: 'venueCourt',
    key: 'venueCourt',
    sorter: (a, b) => checkSorting(a, b, 'venueCourt'),
    render: venueCourt => <span className="column-width-style">{getVenueName(venueCourt)}</span>,
  },
  {
    title: AppConstants.div,
    dataIndex: 'division',
    key: 'division',
    sorter: (a, b) => checkSorting(a, b, 'division'),
    render: division => <span>{division.name}</span>,
  },
  {
    title: AppConstants.score,
    dataIndex: 'score',
    key: 'score',
    sorter: (a, b) => checkSorting(a, b, 'score'),
    render: (score, records) => (
      <NavLink
        to={{
          pathname: '/matchDayMatchDetails',
          state: { matchId: records.id, key: 'dashboard' },
        }}
      >
        <span className="input-heading-add-another pt-0">{setMatchResult(records)}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.umpire,
    dataIndex: 'umpires',
    key: 'umpires',
    render: (umpires, record) =>
      isArrayNotEmpty(umpires) &&
      umpires.map((item, index) => (
        <span
          key={record.id + index}
          onClick={() => this_obj.umpireName(item)}
          // className="desc-text-style side-bar-profile-data"
          className="multi-column-text-aligned theme-color pointer"
        >
          {item.umpireName}
        </span>
      )),
  },
  {
    title: <span className="column-width-style">Scorer 1</span>,
    dataIndex: 'scorer1Status',
    key: 'scorer1Status',
    render: scorer1Status => (
      <span>
        {scorer1Status ? (scorer1Status.status === 'YES' ? 'Accepted' : 'Not Accepted') : 'Not Set'}
      </span>
    ),
  },
  {
    title: <span className="column-width-style">Player Att. Team A</span>,
    dataIndex: 'teamAttendanceCountA',
    key: 'teamAttendanceCountA',
    render: teamAttendanceCountA => (
      <span>{teamAttendanceCountA > 0 ? 'Complete' : 'Not Complete'}</span>
    ),
  },
  {
    title: <span className="column-width-style">Player Att. Team B</span>,
    dataIndex: 'teamAttendanceCountB',
    key: 'teamAttendanceCountB',
    render: teamAttendanceCountB => (
      <span>{teamAttendanceCountB > 0 ? 'Complete' : 'Not Complete'}</span>
    ),
  },
  {
    title: AppConstants.status,
    dataIndex: 'matchStatus',
    key: 'matchStatus',
    sorter: (a, b) => tableSort(a, b, 'matchStatus'),
    render: (matchStatus, record) => (
      <span>{matchStatus == '0' || matchStatus == null ? 'Not Started' : matchStatus}</span>
    ),
  },
];

const columnsTodaysIncient = [
  {
    title: AppConstants.date,
    dataIndex: 'incidentTime',
    key: 'incidentTime',
    sorter: (a, b) => tableSort(a, b, 'incidentTime'),
    render: (incidentTime, record) => (
      <NavLink
        to={{
          pathname: '/matchDayIncidentView',
          state: { item: record, screenName: 'dashboard' },
        }}
      >
        <span className="input-heading-add-another pt-0">
          {liveScore_MatchFormate(incidentTime)}
        </span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'matchId',
    key: 'matchId',
    sorter: (a, b) => tableSort(a, b, 'matchId'),
  },
  {
    title: AppConstants.firstName,
    key: 'First Name',
    sorter: (a, b) => tableSort(a, b, 'incidentPlayers'),
    render: record => (
      <IncidentPlayerFirstName
        incident={record}
        onClick={userId => this_obj.handleClickPlayerName(userId)}
      ></IncidentPlayerFirstName>
    ),
  },
  {
    title: AppConstants.lastName,
    key: 'Last Name',
    sorter: (a, b) => tableSort(a, b, 'incidentPlayers'),
    render: record => (
      <IncidentPlayerLastName
        incident={record}
        onClick={userId => this_obj.handleClickPlayerName(userId)}
      ></IncidentPlayerLastName>
    ),
  },
  {
    title: AppConstants.organisation,
    key: 'Organisation',
    sorter: (a, b) => tableSort(a, b, 'incidentPlayers'),
    render: record => {
      const { incidentPlayers, incidentTypeId, teamId, match } = record;
      let playerTeam = null;
      if (incidentTypeId === 8 && teamId) {
        if (match.team1.id === teamId) {
          playerTeam = match.team1;
        } else if (match.team2.id === teamId) {
          playerTeam = match.team2;
        }
      }
      return (
        <>
          {isArrayNotEmpty(incidentPlayers) ? (
            incidentPlayers.map(item => (
              <span className="desc-text-style side-bar-profile-data">
                {getAssociationName(item)}
              </span>
            ))
          ) : playerTeam ? (
            <span className="desc-text-style side-bar-profile-data">
              {playerTeam.linkedCompetitionOrganisation?.name}
            </span>
          ) : (
            <></>
          )}
        </>
      );
    },
  },
  {
    title: AppConstants.team,
    key: 'team',
    sorter: (a, b) => tableSort(a, b, 'incidentPlayers'),
    render: record => {
      const { incidentPlayers, incidentTypeId, teamId, match } = record;
      let playerTeam = null;
      if (incidentTypeId === 8 && teamId) {
        if (match.team1.id === teamId) {
          playerTeam = match.team1;
        } else if (match.team2.id === teamId) {
          playerTeam = match.team2;
        }
      }
      return (
        <>
          {isArrayNotEmpty(incidentPlayers) ? (
            incidentPlayers.map(item =>
              item.player ? (
                item.player.team ? (
                  item.player.team.deleted_at ? (
                    <span className="desc-text-style side-bar-profile-data">
                      {' '}
                      {getTeamName(item)}
                    </span>
                  ) : teamListDataCheck(
                      item.player.team.id,
                      this_obj.state.liveScoreCompIsParent,
                      item.player.team,
                      this_obj.state.compOrgId,
                      item.player.team,
                    ) ? (
                    <NavLink
                      to={{
                        pathname: '/matchDayTeamView',
                        state: { tableRecord: record, screenName: 'liveScoreDashboard' },
                      }}
                    >
                      <span className="desc-text-style side-bar-profile-data theme-color pointer">
                        {getTeamName(item)}
                      </span>
                    </NavLink>
                  ) : (
                    <span className="desc-text-style side-bar-profile-data">
                      {' '}
                      {getTeamName(item)}
                    </span>
                  )
                ) : null
              ) : null,
            )
          ) : playerTeam ? (
            <NavLink
              to={{
                pathname: '/matchDayTeamView',
                state: { tableRecord: playerTeam, screenName: 'liveScoreDashboard' },
              }}
            >
              <span className="desc-text-style side-bar-profile-data theme-color pointer">
                {playerTeam.name}
              </span>
            </NavLink>
          ) : (
            <></>
          )}
        </>
      );
    },
  },
  {
    title: AppConstants.description,
    dataIndex: 'description',
    key: 'description',
    sorter: (a, b, description) => tableSort(a, b, 'description'),
  },
];

const columnsPlayersToPay = [
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'firstName',
    sorter: (a, b) => tableSort(a, b, 'firstName'),
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'lastName',
    key: 'lastName',
    sorter: (a, b) => checkSorting(a, b, 'lastName'),
  },
  {
    title: AppConstants.linked,
    dataIndex: 'linked',
    key: 'linked',
    sorter: (a, b) => checkSorting(a, b, 'linked'),
  },
  {
    title: AppConstants.division,
    dataIndex: 'divisionName',
    key: 'divisionName',
    sorter: (a, b) => checkSorting(a, b, 'division'),
  },
  {
    title: AppConstants.grade,
    dataIndex: 'gradeName',
    key: 'gradeName',
    sorter: (a, b) => checkSorting(a, b, 'grade'),
  },
  {
    title: AppConstants.team,
    dataIndex: 'teamName',
    key: 'teamName',
    sorter: (a, b) => checkSorting(a, b, 'team'),
  },
  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
    sorter: (a, b, payReq) => checkSorting(a, b, payReq),
  },
  {
    title: AppConstants.paymentMethod,
    dataIndex: 'paymentMethod',
    key: 'paymentMethod',
    sorter: (a, b, payMethod) => checkSorting(a, b, payMethod),
  },
  {
    title: AppConstants.action,
    dataIndex: 'action',
    key: 'action',
    render: (data, record) => (
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
          <Menu.Item key="1" onClick={() => this_obj.cashReceived(record)}>
            <span>{AppConstants.cashReceived}</span>
          </Menu.Item>
          {(record.processType == 'Instalment' || record.processType == 'Per Match') && (
            <Menu.Item key="2" onClick={() => this_obj.retryPayment(record)}>
              <span>{AppConstants.retryPayment}</span>
            </Menu.Item>
          )}
          {record.processTypeName == 'school_invoice' && (
            <Menu.Item key="3" onClick={() => this_obj.invoiceFailed(record)}>
              <span>{AppConstants.failed}</span>
            </Menu.Item>
          )}
        </Menu.SubMenu>
      </Menu>
    ),
  },
];

class LiveScoreDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      incidents: 'incidents',
      liveScoreCompIsParent: false,
      compOrgId: 0,
      onload: false,
      page: 1,
      retryPaymentLoad: false,
      invoiceFailedLoad: false,
      instalmentRetryModalVisible: false,
      retryPaymentMethod: 1,
      selectedRow: null,
      sortBy: null,
      sortOrder: null,
      limit: 10,
      offset: null,
    };
    this_obj = this;
    this.props.initializeCompData();
  }

  componentDidMount() {
    // let competitionID = getCompetitionId()
    let startDay = this.getStartofDay();
    let currentTime = moment.utc().format();

    if (getLiveScoreCompetition()) {
      const { id, competitionOrganisation } = JSON.parse(getLiveScoreCompetition());
      let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
      const liveScoreCompIsParent = checkLivScoreCompIsParent();
      //this.getPlayersToPayList(1);
      const offset = this.state.offset ? this.state.offset : 0;
      const limit = this.state.limit ? this.state.limit : 0;
      this.props.liveScoreDashboardListAction(
        id,
        startDay,
        currentTime,
        compOrgId,
        liveScoreCompIsParent,
        offset,
        limit,
      );
      this.setState({
        liveScoreCompIsParent,
        compOrgId: compOrgId,
        offset: offset,
        limit: limit,
      });
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  componentDidUpdate(prevProps) {
    // if (getLiveScoreCompetition()) {
    //   const { id, competitionOrganisation } = JSON.parse(getLiveScoreCompetition());
    //   let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
    //   const liveScoreCompIsParent = checkLivScoreCompIsParent();
    //   let dashboardMatchList = this.props.liveScoreDashboardState.dashboardMatchList;
    //   let page = 1;
    //   let sortBy = this.state.sortBy;
    //   let sortOrder = this.state.sortOrder;
    //   if (dashboardMatchList) {
    //     let offset = dashboardMatchList.offset;
    //     let searchText = dashboardMatchList.search;
    //     let selectedRound = dashboardMatchList.roundName ? dashboardMatchList.roundName : 'All';
    //     sortBy = dashboardMatchList.sortBy;
    //     sortOrder = dashboardMatchList.sortOrder;
    //     this.setState({
    //       liveScoreCompIsParent,
    //       compOrgId: compOrgId,
    //       offset,
    //       searchText,
    //       selectedRound,
    //       sortBy,
    //       sortOrder,
    //     });
    //     // let { liveScoreSingleGameListPageSize } = this.props.LiveScoreDashboardState;
    //     // liveScoreSingleGameListPageSize = liveScoreSingleGameListPageSize
    //     //   ? liveScoreSingleGameListPageSize
    //     //   : 10;
    //     // page = Math.floor(offset / liveScoreSingleGameListPageSize) + 1;
    //   }
    //   let offset = this.state.offset;
    //   let limit = this.state.limit;
    //   this.props.liveScoreDashboardListAction(
    //     id,
    //     startDay,
    //     currentTime,
    //     compOrgId,
    //     liveScoreCompIsParent,
    //     sortOrder,
    //     offset,
    //     limit,
    //   );
    // }
    // if (
    //   this.state.onload == true &&
    //   this.props.liveScoreDashboardState.onPlayersToPayLoad == false
    // ) {
    //   this.getPlayersToPayList(this.state.page);
    //   this.setState({ onload: false });
    // }
    // if (
    //   this.state.retryPaymentLoad == true &&
    //   this.props.liveScoreDashboardState.onRetryPaymentLoad == false
    // ) {
    //   if (this.props.liveScoreDashboardState.retryPaymentSuccess) {
    //     message.success(this.props.liveScoreDashboardState.retryPaymentMessage);
    //   }
    //   let retryPaymenDetails = this.props.liveScoreDashboardState.retryPaymenDetails;
    //   if (retryPaymenDetails) {
    //     if (retryPaymenDetails.card || retryPaymenDetails.directDebit) {
    //       let retryPaymentMethod = RetryPaymentType.Card;
    //       if (!retryPaymenDetails.card && retryPaymenDetails.directDebit) {
    //         retryPaymentMethod = RetryPaymentType.DirectDebit;
    //       }
    //       this.setState({
    //         instalmentRetryModalVisible: true,
    //         retryPaymentLoad: false,
    //         retryPaymentMethod,
    //       });
    //       return;
    //     }
    //   }
    //   this.getPlayersToPayList(this.state.page);
    //   this.setState({ retryPaymentLoad: false });
    // }
    // if (
    //   this.state.invoiceFailedLoad == true &&
    //   this.props.registrationDashboardState.onRegStatusUpdateLoad == false
    // ) {
    //   this.getPlayersToPayList(this.state.page);
    //   this.setState({ invoiceFailedLoad: false });
    // }
  }

  // getPlayersToPayList = page => {
  //   const { organisationUniqueKey } = getOrganisationData() || {};
  //   const { uniqueKey } = JSON.parse(getLiveScoreCompetition());
  //   let { liveScorePlayerstoPayListPageSize } = this.props.liveScoreDashboardState;
  //   liveScorePlayerstoPayListPageSize = liveScorePlayerstoPayListPageSize
  //     ? liveScorePlayerstoPayListPageSize
  //     : 10;
  //   let payload = {
  //     competitionId: uniqueKey,
  //     organisationId: organisationUniqueKey,
  //     paging: {
  //       limit: liveScorePlayerstoPayListPageSize,
  //       offset: page ? liveScorePlayerstoPayListPageSize * (page - 1) : 0,
  //     },
  //   };
  //   this.props.liveScorePlayersToPayListAction(payload);
  // };

  handleShowSizeChange = key => async (page, pageSize) => {
    if (key == 'playerToPay') {
      await this.props.setPageSizeAction(pageSize);
      this.handleTablePage(page, key);
    }
  };

  handleTablePage = async (page, key) => {
    if (key == 'playerToPay') {
      await this.props.setPageNumberAction(page);
      this.setState({ onload: true, page: page });
    }
  };

  handleClickPlayerName = userId => {
    history.push('/userPersonal', {
      userId,
      screenKey: 'livescore',
      screen: '/matchDayDashboard',
    });
  };

  handleMatchTableList = (page, pageSize) => {
    let { liveScoreTotalPageSize } = this.props.liveScoreDashboardState;
    const { id, competitionOrganisation } = JSON.parse(getLiveScoreCompetition());
    const liveScoreCompIsParent = checkLivScoreCompIsParent();
    let startDay = this.getStartofDay();
    let currentTime = moment.utc().format();
    let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
    const limit = pageSize ? pageSize : this.state.limit;
    liveScoreTotalPageSize = limit ? limit : 10;
    let offset = page ? liveScoreTotalPageSize * (page - 1) : 0;
    const { from, to } = this.state;
    this.setState({ offset });
    let start = 1;
    this.props.liveScoreDashboardListAction(
      id,
      startDay,
      currentTime,
      compOrgId,
      liveScoreCompIsParent,
      offset,
      limit,
    );
  };

  handleMatchPageChange = (page, pageSize) => {
    this.props.setPageNumberAction(page);
    this.setState({ onload: true, page: page, limit: pageSize });
    this.handleMatchTableList(page, pageSize);
  };

  handleShowSizeChange = async (page, pageSize) => {
    this.props.setSingleGamePageSizeAction(pageSize);
    this.setState({ onload: true, page: page, limit: pageSize });
  };

  umpireName(item) {
    if (item.userId) {
      history.push('/userPersonal', {
        userId: item.userId,
        screenKey: 'livescore',
        screen: '/matchDayDashboard',
      });
    } else {
      message.config({ duration: 1.5, maxCount: 1 });
      message.warn(ValidationConstants.playerMessage);
    }
  }

  getStartofDay() {
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    let a = moment.utc(start).format();
    return a;
  }

  retryPayment = record => {
    const { uniqueKey } = JSON.parse(getLiveScoreCompetition());
    let paidByUserId = isArrayNotEmpty(record.paidByUsers)
      ? record.paidByUsers[0].paidByUserId
      : null;
    let payload = {};
    if (record.processTypeName == 'instalment') {
      payload = {
        processTypeName: record.processTypeName,
        registrationUniqueKey: record.registrationUniqueKey,
        userId: record.userId,
        divisionId: record.divisionId,
        competitionId: uniqueKey,
        paidByUserId: paidByUserId,
        checkCardAvailability: 0,
      };
    } else {
      payload = {
        processTypeName: record.processTypeName,
        registrationUniqueKey: record.registrationUniqueKey,
        userId: record.userId,
        divisionId: record.divisionId,
        competitionId: uniqueKey,
      };
    }
    this.setState({ retryPaymentLoad: true, selectedRow: record });
    this.props.liveScorePlayersToPayRetryPaymentAction(payload);
  };

  cashReceived = record => {
    const { uniqueKey } = JSON.parse(getLiveScoreCompetition());
    const organisationId = getOrganisationData()
      ? getOrganisationData().organisationUniqueKey
      : null;
    let paidByUserId = isArrayNotEmpty(record.paidByUsers)
      ? record.paidByUsers[0].paidByUserId
      : null;
    let payload = {
      processTypeName: record.processTypeName,
      registrationUniqueKey: record.registrationUniqueKey,
      userId: record.userId,
      divisionId: record.divisionId,
      competitionId: uniqueKey,
      paidByUserId: paidByUserId,
      organisationId: organisationId,
      membershipProductMappingId: record.membershipProductMappingId,
    };

    this.setState({ retryPaymentLoad: true });
    this.props.liveScorePlayersToCashReceivedAction(payload);
  };

  invoiceFailed = record => {
    const { uniqueKey } = JSON.parse(getLiveScoreCompetition());
    let payload = {
      registrationUniqueKey: record.registrationUniqueKey,
      userId: record.userId,
      membershipProductMappingId: record.membershipProductMappingId,
      competitionId: uniqueKey,
    };
    this.setState({ invoiceFailedLoad: true });
    this.props.registrationFailedStatusUpdate(payload);
  };

  handleinstalmentRetryModal = key => {
    const { selectedRow } = this.state;
    const { uniqueKey } = JSON.parse(getLiveScoreCompetition());
    let paidByUserId = isArrayNotEmpty(selectedRow.paidByUsers)
      ? selectedRow.paidByUsers[0].paidByUserId
      : null;
    if (key == 'cancel') {
      this.setState({ instalmentRetryModalVisible: false });
    } else if (key == 'yes') {
      let payload = {
        processTypeName: 'instalment',
        registrationUniqueKey: selectedRow.registrationUniqueKey,
        userId: selectedRow.userId,
        divisionId: selectedRow.divisionId,
        competitionId: uniqueKey,
        paidByUserId: paidByUserId,
        checkCardAvailability: this.state.retryPaymentMethod,
      };
      this.props.liveScorePlayersToPayRetryPaymentAction(payload);
      this.setState({ retryPaymentLoad: true, instalmentRetryModalVisible: false });
    }
  };

  ////////participatedView view for competition
  incidenceView = () => {
    const { dashboardIncidentList } = this.props.liveScoreDashboardState;
    return (
      <div className="comp-dash-table-view mt-4">
        {this.incidentHeading()}
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={this.props.liveScoreDashboardState.onLoad}
            className="home-dashboard-table"
            columns={columnsTodaysIncient}
            dataSource={dashboardIncidentList}
            pagination={false}
            rowKey={record => 'dashboardIncidentList' + record.id}
          />
        </div>
      </div>
    );
  };

  instalmentRetryModalView = () => {
    let instalmentRetryDetails = this.props.liveScoreDashboardState.retryPaymenDetails;
    return (
      <Modal
        title={AppConstants.failedInstalmentRetry}
        visible={this.state.instalmentRetryModalVisible}
        onCancel={() => this.handleinstalmentRetryModal('cancel')}
        footer={[
          <Button onClick={() => this.handleinstalmentRetryModal('cancel')}>
            {AppConstants.cancel}
          </Button>,
          <Button
            style={{ backgroundColor: '#ff8237', borderColor: '#ff8237', color: 'white' }}
            onClick={() => this.handleinstalmentRetryModal('yes')}
          >
            {AppConstants.ok}
          </Button>,
        ]}
        centered
      >
        <p style={{ marginLeft: '20px' }}>{AppConstants.instalmentRetryModalTxt}</p>
        <Radio.Group
          className={'reg-competition-radio'}
          value={this.state.retryPaymentMethod}
          onChange={e => this.setState({ retryPaymentMethod: e.target.value })}
        >
          {instalmentRetryDetails?.card && (
            <Radio value={1}>
              {AppConstants.creditCardOnly} {instalmentRetryDetails?.cardNumber}
            </Radio>
          )}
          {instalmentRetryDetails?.directDebit && (
            <Radio value={2}>{AppConstants.directDebit}</Radio>
          )}
        </Radio.Group>
      </Modal>
    );
  };

  // matchHeading = () => {
  //     return (
  //         <div className="row text-view">
  //             <div className="col-sm">
  //                 <span className="home-dash-left-text">{AppConstants.todaysMatch}</span>
  //             </div>
  //             <div className="col-sm text-right">
  //                 <NavLink to={{
  //                     pathname: '/matchDayAddMatch',
  //                     state: { key: 'dashboard' }
  //                 }}>
  //                     <Button className='primary-add-comp-form' type='primary'>+ {AppConstants.addNew}</Button>
  //                 </NavLink>
  //             </div>
  //         </div>
  //     )
  // }

  matchHeading = () => {
    return (
      <div className="row text-view">
        <div className="col-sm d-flex align-items-center">
          <span className="home-dash-left-text">{AppConstants.todaysMatch}</span>
          <div className="mt-n10">
            <Tooltip>
              <span>{AppConstants.todayMatchMsg}</span>
            </Tooltip>
          </div>
        </div>

        {this.state.liveScoreCompIsParent && (
          <div className="col-sm text-right">
            <div className="row">
              <div className="col-sm">
                <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                  <NavLink to="/matchDayBulkChange">
                    <Button className="primary-add-comp-form" type="primary">
                      {AppConstants.bulkMatchChange}
                    </Button>
                  </NavLink>
                </div>
              </div>
              <div className="col-sm">
                <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                  <NavLink
                    to={{
                      pathname: '/matchDayVenueChange',
                      state: { key: 'dashboard' },
                    }}
                  >
                    <Button className="primary-add-comp-form" type="primary">
                      {AppConstants.courtChange}
                    </Button>
                  </NavLink>
                </div>
              </div>
              <div className="col-sm">
                <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                  <NavLink
                    to={{
                      pathname: '/matchDayAddMatch',
                      state: { key: 'dashboard' },
                    }}
                  >
                    <Button className="primary-add-comp-form" type="primary">
                      + {AppConstants.addNew}
                    </Button>
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  ////////ownedView view for competition
  matchView = () => {
    const {
      dashboardMatchList,
      liveScoreSingleGameListPageSize,
      liveScoreSingleGameListPage,
      liveScoreTotalPageSize,
    } = this.props.liveScoreDashboardState;
    let compDetails = getLiveScoreCompetition() ? JSON.parse(getLiveScoreCompetition()) : null;

    return (
      <div className="comp-dash-table-view mt-4">
        {this.matchHeading()}
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={this.props.liveScoreDashboardState.onLoad}
            className="home-dashboard-table"
            columns={columnsTodaysMatch}
            dataSource={dashboardMatchList}
            pagination={false}
            rowKey={record => 'dashboardMatchList' + record.id}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination pb-0"
            showSizeChanger
            current={liveScoreSingleGameListPage}
            defaultCurrent={liveScoreSingleGameListPage}
            defaultPageSize={liveScoreSingleGameListPageSize}
            total={liveScoreTotalPageSize}
            onChange={this.handleMatchPageChange}
            onShowSizeChange={this.handleShowSizeChange}
          />
        </div>
      </div>
    );
  };

  incidentHeading = () => {
    return (
      <div className="row text-view">
        <div className="col-sm mb-3 d-flex align-items-center">
          <span className="home-dash-left-text">{AppConstants.todaysIncidents}</span>
          <div className="mt-n10">
            <Tooltip>
              <span>{AppConstants.todayIncidentMsg}</span>
            </Tooltip>
          </div>
        </div>

        {/* <div className="col-sm text-right">
                    <NavLink to={{
                        pathname: './matchDayAddIncident',
                        state: { key: 'dashboard' }
                    }}>
                        <Button className='primary-add-comp-form' type='primary'>
                            + {AppConstants.addNew}
                        </Button>
                    </NavLink>
                </div> */}
      </div>
    );
  };

  addNewsHeading = () => {
    return (
      <div className="row text-view">
        <div className="col-sm d-flex align-items-center">
          <span className="home-dash-left-text">{AppConstants.activeNews}</span>
          <div className="mt-n10">
            <Tooltip>
              <span>{AppConstants.activeNewsMsg}</span>
            </Tooltip>
          </div>
        </div>
        {this.state.liveScoreCompIsParent && (
          <div className="col-sm text-right">
            <NavLink
              to={{
                pathname: '/matchDayAddNews',
                state: { key: 'dashboard', item: null },
              }}
              className="text-decoration-none"
            >
              <Button className="primary-add-comp-form" type="primary">
                + {AppConstants.addNew}
              </Button>
            </NavLink>
          </div>
        )}
      </div>
    );
  };

  addNewsView = () => {
    const { dashboardNewsList } = this.props.liveScoreDashboardState;
    return (
      <div className="comp-dash-table-view mt-4">
        {this.addNewsHeading()}
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={this.props.liveScoreDashboardState.onLoad}
            className="home-dashboard-table"
            columns={columnActiveNews}
            dataSource={dashboardNewsList}
            pagination={false}
            rowKey={record => 'dashboardNewsList' + record.id}
          />
        </div>
      </div>
    );
  };

  playersToPayHeading = () => {
    return (
      <div className="row text-view">
        <div className="col-sm d-flex align-items-center">
          <span className="home-dash-left-text">{AppConstants.playersToPay}</span>
          <div className="mt-n10">
            <Tooltip>
              <span>{AppConstants.playersToPayMsg}</span>
            </Tooltip>
          </div>
        </div>
        {this.state.liveScoreCompIsParent && (
          <div className="col-sm text-right">
            <NavLink
              to={{
                pathname: '/matchDaySingleGameFee',
                state: { key: 'dashboard', item: null },
              }}
              className="text-decoration-none"
            >
              <Button className="primary-add-comp-form" type="primary">
                {AppConstants.singleGameFees}
              </Button>
            </NavLink>
          </div>
        )}
      </div>
    );
  };

  ////////ownedView view for competition
  playersToPayView = () => {
    const {
      playersToPayList,
      onLoad,
      liveScorePlayerstoPayListTotalCount,
      liveScorePlayerstoPayListPage,
      liveScorePlayerstoPayListPageSize,
    } = this.props.liveScoreDashboardState;
    return (
      <div className="comp-dash-table-view mt-4">
        {this.playersToPayHeading()}
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={onLoad}
            className="home-dashboard-table"
            columns={columnsPlayersToPay}
            dataSource={playersToPayList}
            pagination={false}
            rowKey={record => 'playerTopay' + record.id}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination pb-5"
            showSizeChanger
            current={liveScorePlayerstoPayListPage}
            defaultCurrent={liveScorePlayerstoPayListPage}
            defaultPageSize={liveScorePlayerstoPayListPageSize}
            total={liveScorePlayerstoPayListTotalCount}
            onChange={page => this.handleTablePage(page, 'playerToPay')}
            onShowSizeChange={this.handleShowSizeChange('playerToPay')}
          />
        </div>
      </div>
    );
  };

  // buttons
  btnView = () => {
    return (
      // <div className="footer-view">
      <div className="col-sm pt-4">
        <div className="row">
          <div className=" live-score-edit-match-buttons">
            <Button className="primary-add-comp-form" type="primary">
              {AppConstants.publish}
            </Button>
          </div>
          <div className=" live-score-edit-match-buttons ml-3">
            <Button className="primary-add-comp-form" type="primary">
              {AppConstants.publish_notify}
            </Button>
          </div>
          <div className=" live-score-edit-match-buttons ml-3">
            <Button className="primary-add-comp-form" type="primary">
              {AppConstants.saveAsDraft}
            </Button>
          </div>
        </div>
      </div>
      // </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg" style={{ paddingBottom: 10 }}>
        <Loader
          visible={
            this.props.liveScoreDashboardState.onPlayersToPayLoad ||
            this.props.liveScoreDashboardState.onRetryPaymentLoad
          }
        />
        <DashboardLayout menuHeading={AppConstants.matchDay} menuName={AppConstants.liveScores} />
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="1" />
        <Layout>
          <Content>
            {this.addNewsView()}
            {this.matchView()}
            {/* {this.playersToPayView()} */}
            {this.incidenceView()}
            {/* {this.instalmentRetryModalView()} */}
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      liveScoreDashboardListAction,
      initializeCompData,
      //liveScorePlayersToPayListAction,
      liveScorePlayersToPayRetryPaymentAction,
      liveScorePlayersToCashReceivedAction,
      setPageSizeAction,
      setPageNumberAction,
      registrationFailedStatusUpdate,
      setSingleGamePageSizeAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreDashboardState: state.LiveScoreDashboardState,
    registrationDashboardState: state.RegistrationDashboardState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreDashboard);
