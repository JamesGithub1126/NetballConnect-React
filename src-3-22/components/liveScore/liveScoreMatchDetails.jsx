import React, { Component, createRef } from 'react';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect, batch } from 'react-redux';
import {
  Layout,
  Button,
  Table,
  Modal,
  Checkbox,
  Tooltip,
  Select,
  Spin,
  AutoComplete,
  Switch,
  Space,
  Popover,
} from 'antd';

import AppUniqueId from 'themes/appUniqueId';
import {
  liveScoreDeleteMatch,
  liveScoreGetMatchDetailInitiate,
  changePlayerLineUpAction,
  liveScoreAddLiveStreamAction,
} from '../../store/actions/LiveScoreAction/liveScoreMatchAction';
import {
  liveScorePlayerListSearchAction,
  liveScoreUpdatePlayerSearchResult,
} from '../../store/actions/LiveScoreAction/liveScorePlayerAction';
import {
  liveScoreExportGameAttendanceAction,
  liveScoreGameAttendanceListAction,
} from '../../store/actions/LiveScoreAction/liveScoreGameAttendanceAction';
import {
  liveScorePlayerMinuteTrackingListAction,
  liveScorePlayerMinuteRecordAction,
  liveScoreUpdatePlayerMinuteRecordAction,
} from '../../store/actions/LiveScoreAction/liveScorePlayerMinuteTrackingAction';
import {
  liveScorePlayerActionsLoadAction,
  liveScoreUpdatePlayerScoreAction,
  liveScoreUpdateMatchScoreAction,
  liveScorePlayerScoreInitializeAction,
} from '../../store/actions/LiveScoreAction/liveScorePlayerMatchScoreAction';
import {
  liveScoreCompBestPlayerPointListAction,
  liveScoreCompBestPlayerPointUpdateAction,
  liveScoreCompBestPlayerPointSaveAction,
} from '../../store/actions/LiveScoreAction/liveScoreCompetitionAction';
import { getLiveScoreDivisionList } from '../../store/actions/LiveScoreAction/liveScoreDivisionAction';
import { liveScoreRoundListAction } from '../../store/actions/LiveScoreAction/liveScoreRoundAction';
import { isArrayNotEmpty, isNotNullAndUndefined } from '../../util/helpers';
import {
  checkIsMultiPeriod,
  getLiveScoreCompetition,
  getUmpireCompetitionData,
} from '../../util/sessionStorage';
import {
  getLiveScoreGamePositionsList,
  getLiveScoreGameStatsList,
} from '../../store/actions/LiveScoreAction/liveScoreGamePositionAction';
import { getLiveScoreSettingInitiate } from 'store/actions/LiveScoreAction/LiveScoreSettingAction';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import Loader from '../../customComponents/loader';
import history from '../../util/history';
import ValidationConstants from '../../themes/validationConstant';
import InputWithHead from '../../customComponents/InputWithHead';
import MatchPlayerPoints from './matchPlayerPoints/matchPlayerPoints';
import MatchStatistics from './matchStatistics/matchStatistics';
import { getUserRoleId, checkLivScoreCompIsParent } from 'util/permissions';
import { umpireStatusColor } from 'util/umpireHelper';
import { BFSettingType, FLAVOUR } from 'util/enums';
import './liveScore.css';
import RegenerateLadderPointsModal from '../../customComponents/RegenerateLadderPointsModal';
import { SPORT } from '../../util/enums';
import { GameStats, MatchStatus, MatchStatusRefId, SpecialPeriod } from 'enums/enums';
import { AttendanceType, PlayerLSStatus } from '../../enums/enums';
import * as _ from 'lodash';
import { getPlayedPositions, isAttentionDisabled } from './matchStatistics/statisticsUtils';
import { isBasketball, isFootball, isNetball } from './liveScoreSettings/liveScoreSettingsUtils';
import moment from 'moment';
import { getScoreText } from 'store/objectModel/getMatchTeamListObject';

const { Content } = Layout;
const { confirm } = Modal;
const { Option } = Select;
const isMultiPeriod = checkIsMultiPeriod();

const unknownVisibleByDefault = isBasketball || isFootball;
// function to sort table column
function tableSort(a, b, key) {
  let stringA = JSON.stringify(a[key]);
  let stringB = JSON.stringify(b[key]);

  return stringA.localeCompare(stringB);
}

const getAttendanceTypeTxt = attendanceTypeId => {
  if (attendanceTypeId === AttendanceType.Suspended) {
    return AppConstants.suspended;
  } else if (attendanceTypeId === AttendanceType.Played) {
    return AppConstants.played;
  } else if (attendanceTypeId === AttendanceType.Borrowed) {
    return AppConstants.borrowed;
  } else {
    return AppConstants.notPlayed;
  }
};

const getPlayerStatusText = statusRefId => {
  if (statusRefId === PlayerLSStatus.livescoreManual) {
    return AppConstants.livescoreManual;
  } else if (statusRefId === PlayerLSStatus.Registered) {
    return AppConstants.registered;
  } else if (statusRefId === PlayerLSStatus.DeRegistered) {
    return AppConstants.deRegisteredOrTransferred;
  } else if (statusRefId === PlayerLSStatus.CompetitionManual) {
    return AppConstants.competitionManual;
  } else if (statusRefId === PlayerLSStatus.Cancelled) {
    return AppConstants.cancelledReg;
  } else if (statusRefId === PlayerLSStatus.ExpiredSingleGame) {
    return AppConstants.expiredSingleGame;
  } else if (statusRefId === PlayerLSStatus.NoActiveMembership) {
    return AppConstants.moved;
  } else if (statusRefId === PlayerLSStatus.Failed) {
    return AppConstants.failedReg;
  } else {
    return 'N/A';
  }
};

let this_ = null;

const columns = [
  {
    title: AppConstants.profilePic,
    dataIndex: 'photoUrl',
    key: 'photoUrl',
    sorter: (a, b) => tableSort(a, b, 'photoUrl'),
    render: photoUrl =>
      photoUrl ? (
        <img className="user-image" src={photoUrl} alt="" height="70" width="70" />
      ) : (
        <span>{'No Image'}</span>
      ),
  },
  {
    title: AppConstants.name,
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => tableSort(a, b, 'name'),
    render: (name, record) => {
      const { suspended } = record;

      return (
        <span>
          <span className={suspended ? 'suspended-suffix' : ''}>{name}</span>
        </span>
      );
    },
  },
  {
    title: AppConstants.status,
    dataIndex: 'statusRef',
    key: 'statusRef',
    sorter: (a, b) => tableSort(a, b, 'statusRef'),
  },
  {
    title: AppConstants.attendance,
    dataIndex: 'attendanceTypeId',
    key: 'attendanceTypeId',
    sorter: (a, b) => tableSort(a, b, 'attendanceTypeId'),
    render: (attendanceTypeId, record) => {
      return (
        <span>
          <span className="">{getAttendanceTypeTxt(attendanceTypeId)}</span>
        </span>
      );
    },
  },
  {
    title: AppConstants.playedAttendance,
    dataIndex: 'attendance',
    key: 'attendance',
    sorter: (a, b) => tableSort(a, b, 'attendance'),
    render: (attendance, record) => (
      <span className="d-flex justify-content-center w-50">
        <img
          className="dot-image"
          // src={attendance && attendance.isPlaying === true ? AppImages.greenDot : AppImages.greyDot}
          src={!!Number(record.played) ? AppImages.greenDot : AppImages.greyDot}
          alt=""
          width="12"
          height="12"
        />
      </span>
    ),
  },
];

let getColumnsTeam1 = teamId => {
  return [
    {
      title: AppConstants.profilePic,
      dataIndex: 'photoUrl',
      key: 'photoUrl',
      sorter: (a, b) => tableSort(a, b, 'photoUrl'),
      render: photoUrl =>
        photoUrl ? (
          <img className="user-image" src={photoUrl} alt="" height="70" width="70" />
        ) : (
          <span>{'No Image'}</span>
        ),
    },
    {
      title: AppConstants.name,
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => tableSort(a, b, 'name'),
      render: (name, record) => {
        const { suspended } = record;

        return (
          <span>
            <span className={suspended ? 'suspended-suffix' : ''}>{name}</span>
          </span>
        );
      },
    },
    {
      title: AppConstants.status,
      dataIndex: 'statusRef',
      key: 'statusRef',
    },
    {
      title: AppConstants.team,
      dataIndex: 'team',
      key: 'team',
      sorter: (a, b) => tableSort(a, b, 'team'),
      render: (team, record) => (team ? team : 'Borrowed'),
    },
    {
      title: AppConstants.playingAttended,
      dataIndex: 'attended',
      key: 'attended',
      sorter: (a, b) => tableSort(a, b, 'attended'),
      render: (team, record, index) => {
        return (
          <Checkbox
            // className={record.lineup && record.lineup.playing ? 'checkbox-green-color-outline mt-1' : 'single-checkbox mt-1'}
            className={'checkbox-green-color-outline mt-1'}
            // checked={record.attendance && record.attendance.isPlaying}
            defaultChecked={!!Number(record.played) ? true : false}
            onChange={e =>
              this_.playingView(record, teamId, e.target.checked, index, 'team1Players')
            }
          />
        );
      },
    },
  ];
};
let getColumnsTeam2 = teamId => {
  return [
    {
      title: AppConstants.profilePic,
      dataIndex: 'photoUrl',
      key: 'photoUrl',
      sorter: (a, b) => tableSort(a, b, 'photoUrl'),
      render: photoUrl =>
        photoUrl ? (
          <img className="user-image" src={photoUrl} alt="" height="70" width="70" />
        ) : (
          <span>{'No Image'}</span>
        ),
    },
    {
      title: AppConstants.name,
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => tableSort(a, b, 'name'),
      render: (name, record) => {
        const { suspended } = record;

        return (
          <span>
            <span className={suspended ? 'suspended-suffix' : ''}>{name}</span>
          </span>
        );
      },
    },
    {
      title: AppConstants.status,
      dataIndex: 'statusRef',
      key: 'statusRef',
    },
    {
      title: AppConstants.team,
      dataIndex: 'team',
      key: 'team',
      sorter: (a, b) => tableSort(a, b, 'team'),
      render: (team, record) => (team ? team : 'Borrowed'),
    },
    {
      title: AppConstants.playingAttended,
      dataIndex: 'attended',
      key: 'attended',
      sorter: (a, b) => tableSort(a, b, 'attended'),
      render: (attended, record, index) => (
        // <Checkbox
        //     className={record.lineup && record.lineup.playing ? "checkbox-green-color-outline mt-1" : 'single-checkbox mt-1'}
        //     checked={record.attendance && record.attendance.isPlaying}
        //     onChange={(e) => this_.playingView(record, e.target.checked, index, 'team2Players')}
        // />

        <Checkbox
          className={'checkbox-green-color-outline mt-1'}
          defaultChecked={!!Number(record.played) ? true : false}
          onChange={e => this_.playingView(record, teamId, e.target.checked, index, 'team2Players')}
        />
      ),
    },
  ];
};

class LiveScoreMatchDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      team1: 'WSA 1',
      team2: 'WSA 2',
      matchId: this.props.location.state ? this.props.location.state.matchId : null,
      key: this.props.location.state
        ? this.props.location.state.key
          ? this.props.location.state.key
          : null
        : null,
      umpireKey: this.props.location
        ? this.props.location.state
          ? this.props.location.state.umpireKey
          : null
        : null,
      scoringType: null,
      isLineUp: 0,
      toolTipVisible: false,
      screenName: props.location.state
        ? props.location.state.screenName
          ? props.location.state.screenName
          : null
        : null,
      competitionId: null,
      visible: false,
      liveStreamLink: null,
      addPlayerModal: '',
      teamAttendance: false,
      bestAndFairest: false,
      loadAttendanceData: true,
      gameAttendanceList: [],
      team1Attendance: [],
      team2Attendance: [],
      borrowedTeam1Players: [],
      borrowedTeam2Players: [],
      totalTeam1Players: [],
      totalTeam2Players: [],
      loadTrackingData: true,
      minutesTrackingData: [],
      periodDuration: null,
      playedCheckBox: false,
      userRoleId: getUserRoleId(),
      liveScoreCompIsParent: false,
      userRole: null,
      isCompetitionOrganisationId: false,
      borrowedPlayerValue: '',
      playerId: null,
      loadPlayerActions: false,
      isResultsLocked: this.props.location.state
        ? this.props.location.state.isResultsLocked
        : false,
      showRegenLadderPointsModal: false,
      canRegenLadderPoints: true,
      match: null,
      initialTeam1Score: null,
      initialTeam2Score: null,
    };
    this.umpireScore_View = this.umpireScore_View.bind(this);
    this.team_View = this.team_View.bind(this);
    this.bestPlayerAwardPointSettingView = this.bestPlayerAwardPointSettingView.bind(this);
    this.prevTeamAttendance = React.createRef();
    this.prevTeamAttendance.current = false;
    this_ = this;
  }

  componentDidMount() {
    this.props.liveScoreUpdatePlayerSearchResult(null, 'clear');
    this.setLivScoreCompIsParent();
    let isMatchId = this.props.location.state ? this.props.location.state.matchId : null;
    let isLineUpEnable = null;
    this.props.getLiveScoreGamePositionsList(SPORT[process.env.REACT_APP_FLAVOUR]);
    this.props.getLiveScoreGameStatsList(SPORT[process.env.REACT_APP_FLAVOUR]);
    const match = this.props.liveScoreMatchState.matchDetails
      ? this.props.liveScoreMatchState.matchDetails.match
      : null;
    let periodDuration = null;
    if (match) {
      if (match.type === 'FOUR_QUARTERS') {
        periodDuration = (match.matchDuration * 60) / 4;
        this.setState({ periodDuration });
      } else {
        periodDuration = (match.matchDuration * 60) / 2;
        this.setState({ periodDuration });
      }
    }

    if (this.state.matchId) {
      this.props.liveScoreGameAttendanceListAction(this.state.matchId);
      this.props.liveScorePlayerMinuteTrackingListAction(this.state.matchId);
    } else {
      history.push('/matchDayMatches');
    }

    let competitionId = 0;

    if (this.state.umpireKey === 'umpire') {
      let umpireCompStr = getUmpireCompetitionData();
      if (umpireCompStr) {
        if (isMatchId) {
          let umpireComp = JSON.parse(umpireCompStr);
          isLineUpEnable = umpireComp.lineupSelectionEnabled;
          competitionId = umpireComp.id;
          this.setState({ competitionId });
        } else {
          history.push('/matchDayMatches');
        }
      } else {
        history.push('/matchDayCompetitions');
      }
    } else {
      if (getLiveScoreCompetition()) {
        if (isMatchId) {
          const { lineupSelectionEnabled, id } = JSON.parse(getLiveScoreCompetition());
          isLineUpEnable = lineupSelectionEnabled;
          competitionId = id;
          this.setState({ competitionId });
        } else {
          history.push('/matchDayMatches');
        }
      } else {
        history.push('/matchDayCompetitions');
      }
    }

    if (
      process.env.REACT_APP_FLAVOUR === FLAVOUR.Basketball ||
      process.env.REACT_APP_FLAVOUR === FLAVOUR.Football
    ) {
      this.setState({ isLineUp: 1 });
      this.props.liveScoreGetMatchDetailInitiate(this.props.location.state.matchId, 1);
    } else if (this.props.location.state) {
      if (isLineUpEnable === 1 || isLineUpEnable === true) {
        this.setState({ isLineUp: 1 });
        this.props.liveScoreGetMatchDetailInitiate(this.props.location.state.matchId, 1);
      } else {
        this.setState({ isLineUp: 0 });
        this.props.liveScoreGetMatchDetailInitiate(this.props.location.state.matchId, 0);
      }
    }

    // For case of check in toggle switch and borrow button

    const competition = this.getCompetition();
    if (!competition) {
      history.push('/matchDayCompetitions');
    }
    let userRole = this.state.userRoleId === 11 ? true : false;
    let isCompetitionOrganisationId = false;

    let team1_CompetitionOrganisationId = match ? match.team1.competitionOrganisationId : null;
    let competitionOrganisationId = competition?.competitionOrganisation?.id;

    if (team1_CompetitionOrganisationId === competitionOrganisationId) {
      isCompetitionOrganisationId = false;
    } else {
      isCompetitionOrganisationId = true;
    }
    this.setState({
      userRole,
      isCompetitionOrganisationId,
    });

    // Get live score settings for B&F player points.
    this.props.getLiveScoreSettingInitiate(competitionId);
  }

  componentDidUpdate(prevProps, prevState) {
    let { isLineUp, matchId } = this.state;
    if (
      this.props.liveScorePlayerMinuteTrackingState.onSave !==
      prevProps.liveScorePlayerMinuteTrackingState.onSave
    ) {
      if (!this.props.liveScorePlayerMinuteTrackingState.onSave) {
        //update match details when stats are saved
      }
    }

    if (!prevState.bestAndFairest && this.state.bestAndFairest) {
      const match = this.props.liveScoreMatchState?.matchDetails?.match;
      if (match) {
        const teamIds = [match.team1Id, match.team2Id];
        this.props.liveScoreCompBestPlayerPointListAction({
          matchId: this.state.matchId,
          teamIds,
        });
      }
    }

    if (this.props.liveScoreMatchState !== prevProps.liveScoreMatchState) {
      const { team1Players, team2Players, matchDetails } = this.props.liveScoreMatchState;

      const match = matchDetails?.match ? matchDetails.match : null;

      if (match && match !== this.state.match) {
        const competition = this.getCompetition();
        let competitionOrganisationId = competition?.competitionOrganisation?.id;

        this.props.getLiveScoreDivisionList(
          this.state.competitionId,
          undefined,
          undefined,
          undefined,
          this.state.liveScoreCompIsParent,
          competitionOrganisationId,
        );

        this.props.liveScoreRoundListAction(
          this.state.competitionId,
          match.divisionId,
          this.state.liveScoreCompIsParent,
          competitionOrganisationId,
        );
      }

      const team1Attendance = this.getAttendance(team1Players);
      const team2Attendance = this.getAttendance(team2Players);

      if (this.state.team1Attendance.length === 0 && this.state.team2Attendance.length === 0) {
        this.setState({
          match: match,
          team1Id: match ? match.team1Id : null,
          team2Id: match ? match.team2Id : null,
          team1Attendance,
          team2Attendance,
          totalTeam1Players: team1Players.concat(this.state.borrowedTeam1Players),
          totalTeam2Players: team2Players.concat(this.state.borrowedTeam2Players),
        });
      } else {
        this.setState({
          match: match,
          team1Id: match ? match.team1Id : null,
          team2Id: match ? match.team2Id : null,
          totalTeam1Players: team1Players.concat(this.state.borrowedTeam1Players),
          totalTeam2Players: team2Players.concat(this.state.borrowedTeam2Players),
        });
      }
    }

    if (this.props.liveScoreGameAttendanceState !== prevProps.liveScoreGameAttendanceState) {
      const gameAttendanceList = this.props.liveScoreGameAttendanceState.gameAttendanceList;
      if (gameAttendanceList && this.state.loadAttendanceData) {
        this.setState({ gameAttendanceList });
        this.setState({ loadAttendanceData: false });
      }
    }

    if (
      this.props.liveScorePlayerMinuteTrackingState.trackingList !==
      prevProps.liveScorePlayerMinuteTrackingState.trackingList
    ) {
      const trackingList = this.props.liveScorePlayerMinuteTrackingState.trackingList || [];
      if (trackingList.length > 0 && this.state.loadTrackingData) {
        this.setState({ minutesTrackingData: trackingList });
        this.setState({ loadTrackingData: false });
      }
    }

    if (
      this.props.liveScorePlayerMinuteTrackingState.savedTracks !==
      prevProps.liveScorePlayerMinuteTrackingState.savedTracks
    ) {
      const match = this.props.liveScoreMatchState.matchDetails?.match;
      if (match) {
        const teamIds = [match.team1?.id, match.team2?.id].filter(i => !!i);
        batch(() => {
          this.props.liveScoreGameAttendanceListAction(this.state.matchId);
          this.props.liveScorePlayerMinuteTrackingListAction(this.state.matchId);
          this.props.liveScoreGetMatchDetailInitiate(matchId, isLineUp ? 1 : 0);
          this.props.liveScorePlayerActionsLoadAction(this.state.matchId, teamIds);
        });
      }
    }

    if (!this.state.loadPlayerActions) {
      const match = this.props.liveScoreMatchState.matchDetails?.match;
      if (match) {
        this.setState({ loadPlayerActions: true });
        const teamIds = [match.team1?.id, match.team2?.id].filter(i => !!i);
        this.props.liveScorePlayerActionsLoadAction(this.state.matchId, teamIds);
      }
    } else {
      //this.updateActionsForOtherPeriods();
    }

    //Update match scores if player actions and contributors are changed, or on match scores toggle.
    if (
      (!!this.state.teamAttendance &&
        this.props.liveScorePlayerActionState.playerActions !==
          prevProps.liveScorePlayerActionState.playerActions) ||
      this.prevTeamAttendance.current !== this.state.teamAttendance
    ) {
      this.prevTeamAttendance.current = this.state.teamAttendance;
      this.props.liveScoreUpdateMatchScoreAction({
        actions: this.props.liveScorePlayerActionState.playerActions,
        teamAttendance: this.state.teamAttendance,
      });
    }
    if (
      this.props.liveScoreMatchState.matchDataLoad !==
        prevProps.liveScoreMatchState.matchDataLoad &&
      this.props.liveScoreMatchState.matchDataLoad === false
    ) {
      const { team1Players, team2Players } = this.props.liveScoreMatchState;
      const team1Attendance = this.getAttendance(team1Players);
      const team2Attendance = this.getAttendance(team2Players);

      this.setState({
        team1Attendance,
        team2Attendance,
        totalTeam1Players: team1Players,
        totalTeam2Players: team2Players,
        borrowedTeam1Players: [],
        borrowedTeam2Players: [],
      });
    }
  }

  componentWillUnmount() {
    this.props.liveScorePlayerScoreInitializeAction();
  }

  updateActionsForOtherPeriods = () => {
    if (process.env.REACT_APP_FLAVOUR !== FLAVOUR.Netball) {
      return;
    }

    const competition = this.getCompetition();
    if (!competition) {
      return;
    }

    const attendanceRecord = competition.attendanceRecordingPeriod; // Attendance Recording Period
    if (attendanceRecord === 'MATCH') {
      const { playerActions } = this.props.liveScorePlayerActionState;
      playerActions && this.props.liveScoreUpdatePlayerScoreAction();
    }
  };

  getCompetition = () => {
    if (this.state.umpireKey === 'umpire') {
      if (getUmpireCompetitionData()) {
        return JSON.parse(getUmpireCompetitionData());
      }
    } else {
      if (getLiveScoreCompetition()) {
        return JSON.parse(getLiveScoreCompetition());
      }
    }
    return null;
  };

  setLivScoreCompIsParent = () => {
    const liveScoreCompIsParent = checkLivScoreCompIsParent();
    this.setState({ liveScoreCompIsParent });
  };

  getPlayerAttendance = (player, borrowed = false) => {
    let attendance = [];

    if (player) {
      attendance = Array(4)
        .fill(null)
        .map((_, index) => ({
          teamId: player?.teamId,
          matchId: this.state.matchId,
          playerId: player?.playerId,
          positionId: player?.lineup?.positionId,
          isBorrowed: borrowed,
          isPlaying: true,
          verifiedBy: null,
          mnbPushed: false,
          period: index + 1,
        }));
    }

    return attendance;
  };

  getAttendanceValue = (playerId, period, field) => {
    const attendance = this.state.gameAttendanceList.find(
      att => att.playerId === playerId && att.period === period,
    );
    if (attendance && attendance[field]) {
      return attendance[field];
    }
    return null;
  };

  getAttendance = players => {
    let attendance = [];

    if (players && players.length > 0) {
      players.forEach(player => {
        attendance = attendance.concat(this.getPlayerAttendance(player));
      });
    }

    return attendance;
  };

  setMinuteTrackingData = (teamId, playerId, period, value) => {
    const trackingData = this.state.minutesTrackingData || [];

    const trackingDataIndex =
      trackingData.length > 0
        ? trackingData.findIndex(data => data.playerId === playerId && data.period === period)
        : -1;
    if (trackingDataIndex > -1) {
      trackingData[trackingDataIndex] = {
        ...trackingData[trackingDataIndex],
        duration: value,
      };
    } else {
      trackingData.push({
        matchId: this.state.matchId,
        teamId,
        playerId,
        period,
        duration: value,
      });
    }

    this.setState({
      minutesTrackingData: trackingData,
    });
  };

  getMinuteTrackingData = (teamId, playerId, period) => {
    const trackingList = this.props.liveScorePlayerMinuteTrackingState.trackingList;
    const trackingData =
      trackingList.length > 0
        ? trackingList.find(data => data.playerId === playerId && data.period === period)
        : null;

    return trackingData?.duration || 0;
  };

  exportAttendance = (team, teamId) => {
    const teamAttendance =
      team === 'team1' ? this.state.team1Attendance : this.state.team2Attendance;
    const filteredAttendance = teamAttendance.filter(att => !!att?.positionId);

    if (this.state.minutesTrackingData.length > 0) {
      const { playerActions } = this.props.liveScorePlayerActionState;
      this.props.liveScorePlayerMinuteRecordAction(playerActions, this.state.minutesTrackingData);
    }

    if (filteredAttendance.length === 0) {
      return;
    }

    this.props.liveScoreExportGameAttendanceAction(this.state.matchId, teamId, filteredAttendance);
  };

  playingView(record, teamId, value, index, key) {
    this.props.changePlayerLineUpAction({
      record,
      borrowed: record.teamId !== teamId,
      value,
      matchId: this.state.matchId,
      competitionId: this.state.competitionId,
      teamId: teamId,
      index,
      key,
    });
  }

  onChange = e => {
    this.setState({
      value: e.target.value,
    });
  };

  deleteMatch = matchId => {
    this.props.liveScoreDeleteMatch(matchId);
    // this.setState({ deleteLoading: true })
  };

  showDeleteConfirm = matchId => {
    this_ = this;
    confirm({
      title: AppConstants.matchDeleteConfirm,
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk() {
        this_.deleteMatch(matchId);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  // method to show modal view after click
  showModal = livestreamURL => {
    this.setState({
      visible: true,
      liveStreamLink: livestreamURL,
    });
  };

  // method to hide modal view after ok click
  handleOk = e => {
    this.setState({
      visible: false,
    });
  };

  refreshPage = () => {
    window.location.reload();
  };

  // method to hide modal view after click on cancel button
  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  getReceivingBFPointsRefName = refId => {
    const { references } = this.props.liveScoreSetting;
    return references.ReceivingBFPoints?.find(it => it.id === refId)?.name;
  };

  getAwardWhichTeamRefName = refId => {
    const { references } = this.props.liveScoreSetting;
    return references.AwardWhichTeam?.find(it => it.id === refId)?.name;
  };

  getPreferenceSetByRefName = refId => {
    const { references } = this.props.liveScoreSetting;
    return references.PreferenceSetBy?.find(it => it.id === refId)?.name;
  };

  getBFSwitchDisabled = () => {
    return (
      this.getBFViewMode(BFSettingType.MEDIA_REPORT) === 0 &&
      this.getBFViewMode(BFSettingType.VOTED_AWARD) === 0 &&
      this.getBFViewMode(BFSettingType.ORGANISATION_AWARD) === 0
    );
  };

  getBFViewMode = settingType => {
    const { matchDetails } = this.props.liveScoreMatchState;
    if (!matchDetails || !matchDetails.match) {
      return false;
    }
    const match = matchDetails.match;
    if (!match) {
      return false;
    }

    let competition = null;
    if (this.state.umpireKey === 'umpire') {
      if (getUmpireCompetitionData()) {
        competition = JSON.parse(getUmpireCompetitionData());
      } else {
        history.push('/matchDayCompetitions');
      }
    } else {
      if (getLiveScoreCompetition()) {
        competition = JSON.parse(getLiveScoreCompetition());
      } else {
        history.push('/matchDayCompetitions');
      }
    }
    const competitionOrganisationId = competition?.competitionOrganisation?.id;

    const { bestAndFairestSettings } = this.props.liveScoreSetting;
    let mediaReport = bestAndFairestSettings.find(i => i.bestAndFairestTypeRefId === settingType);
    if (settingType === BFSettingType.ORGANISATION_AWARD) {
      mediaReport = bestAndFairestSettings.find(
        i =>
          i.bestAndFairestTypeRefId === settingType &&
          i.competitionOrganisationId === competitionOrganisationId,
      );
    }
    if (!mediaReport) {
      return 0;
    }

    const receivingBFPointsRefName = this.getReceivingBFPointsRefName(
      mediaReport.receivingBFPointsRefId,
    );
    const awardWhichTeamRefName = this.getAwardWhichTeamRefName(mediaReport.awardWhichTeamRefId);
    const preferenceSetByRefName = this.getPreferenceSetByRefName(mediaReport.preferenceSetByRefId);

    //It is Competition organiser.
    if (this.state.liveScoreCompIsParent) {
      if (receivingBFPointsRefName === 'team') {
        //Player(s) from each Team
        return 2; // 2 columns
      } else {
        return 1; // 1 column - with players from both teams
      }
    } else {
      // Affiliate
      if (receivingBFPointsRefName === 'team') {
        //Player(s) from each Team
        if (preferenceSetByRefName === 'competition_organiser_to_set') {
          return 0;
        }
        if (awardWhichTeamRefName === 'both') {
          if (competitionOrganisationId === match.team1.competitionOrganisationId) {
            return 2; // 2 columns
          }
        } else {
          if (competitionOrganisationId === match.team1.competitionOrganisationId) {
            return 11;
          }
          if (competitionOrganisationId === match.team2.competitionOrganisationId) {
            return 12;
          }
        }
      } else {
        //Player(s) from the match
        if (preferenceSetByRefName === 'competition_organiser_to_set') {
          return 0;
        }
        if (awardWhichTeamRefName === 'both') {
          if (competitionOrganisationId === match.team1.competitionOrganisationId) {
            return 1; // 1 column
          }
        }
      }
    }

    return 0;
  };

  // view for breadcrumb
  headerView = () => {
    const competition = this.getCompetition();
    const isForActionLog =
      (competition &&
        ['PERIOD', 'MINUTE'].includes(competition.attendanceRecordingPeriod) &&
        (isBasketball || isFootball)) ||
      (competition.recordGoalAttempts === true && competition.positionTracking === false) ||
      competition.scoringType === 'PREMIER_NETBALL';
    const match = this.props.liveScoreMatchState.matchDetails
      ? this.props.liveScoreMatchState.matchDetails.match
      : null;
    const matchDetails = this.props.liveScoreMatchState.matchDetails
      ? this.props.liveScoreMatchState.matchDetails
      : null;

    let isMatchStatus = match && match.matchStatus === 'ENDED';
    const { liveScoreCompIsParent, userRole, isCompetitionOrganisationId } = this.state;
    const { matchId, competitionId, teamAttendance } = this.state;

    let divisionName = '';
    let roundName = '';
    let startTime = '';
    if (match) {
      const division = this.props.liveScoreMatchState.divisionList?.find(
        d => d.id === match.divisionId,
      );
      const round = this.props.liveScoreMatchState.roundList?.find(r => r.id === match.roundId);
      divisionName = division ? division.name : '';
      roundName = round ? round.name : '';
      startTime = moment(match.startTime).format('DD/MM/YYYY HH:mm');
    }

    return (
      <div className="p-4">
        <div className="d-flex justify-content-between flex-wrap">
          <div className="mb-4">
            <div className="col-sm d-flex align-content-center">
              <span className="form-heading pb-0">{match ? match.team1.name : ''}</span>
              <span className="input-heading-add-another pt-2 pl-1 pr-1"> vs </span>
              <span className="form-heading pb-0">{match ? match.team2.name : ''}</span>
            </div>
            <div className="row pl-4">
              <div className="col-sm" style={{ minWidth: '160px' }}>
                <span className="year-select-heading">{'#' + this.state.matchId}</span>
              </div>
              <div className="col-sm" style={{ minWidth: '160px' }}>
                <span className="year-select-heading">{divisionName}</span>
              </div>
            </div>
            <div className="row pl-4">
              <div className="col-sm" style={{ minWidth: '160px' }}>
                <span className="year-select-heading">{startTime}</span>
              </div>
              <div className="col-sm" style={{ minWidth: '160px' }}>
                <span className="year-select-heading">{roundName}</span>
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-end">
            <Space className="d-flex flex-wrap">
              <Space className="d-flex flex-wrap">
                <div className="d-flex align-items-center year-select-heading">
                  <Popover
                    content={`please use '+ ${AppConstants.editActionLog}'`}
                    trigger={isForActionLog ? 'hover' : ''}
                  >
                    <Switch
                      className="mr-3 mb-2"
                      checked={teamAttendance}
                      onChange={checked => this.handleAttendanceView(checked)}
                      disabled={isForActionLog || !this.isAllowEnterScore()}
                      data-testid={AppUniqueId.STATISTICS_SWITCH}
                    />
                  </Popover>
                  {AppConstants.statistics}
                </div>
                <div className="d-flex align-items-center year-select-heading">
                  <Switch
                    className="mr-3 mb-2"
                    checked={this.state.bestAndFairest}
                    onChange={checked => this.setState({ bestAndFairest: checked })}
                    disabled={this.getBFSwitchDisabled()}
                  />
                  {AppConstants.bestAndFairest}
                </div>
              </Space>
              <Space className="d-flex flex-wrap">
                {false && (
                  <div className="d-flex flex-row align-items-center ">
                    <NavLink
                      to={{
                        pathname: `${process.env.REACT_APP_URL_WEB_USER_REGISTRATION}/refereeReport`,
                        search: `?matchId=${matchId}&token=${localStorage.token}&userId=${localStorage.userId}&competitionId=${competitionId}`,
                      }}
                      target="_blank"
                    >
                      <Button
                        disabled={userRole}
                        className="primary-add-comp-form mb-2"
                        type="primary"
                      >
                        + {AppConstants.addSendoffReport}
                      </Button>
                    </NavLink>
                  </div>
                )}
                {liveScoreCompIsParent && (
                  <div className="d-flex flex-row align-items-center justify-content-end">
                    <NavLink
                      to={{
                        pathname: '/matchDayAddIncident',
                        state: {
                          isEdit: false,
                          matchId: this.state.matchId,
                          matchDetails: matchDetails,
                          umpireKey: this.state.umpireKey,
                          screenName: this.state.screenName,
                        },
                      }}
                    >
                      <Button
                        disabled={userRole}
                        className="primary-add-comp-form mb-2"
                        type="primary"
                      >
                        + {AppConstants.addIncident}
                      </Button>
                    </NavLink>
                  </div>
                )}
                {liveScoreCompIsParent && (
                  <div className="d-flex flex-row align-items-center justify-content-end mb-2">
                    <Button
                      onClick={() => this.showModal(match.livestreamURL)}
                      className="primary-add-comp-form"
                      type="primary"
                      disabled={userRole}
                    >
                      + {AppConstants.addLiveStream}
                    </Button>
                  </div>
                )}
                {liveScoreCompIsParent && (
                  <div className="d-flex flex-row align-items-center justify-content-end">
                    <NavLink
                      to={{
                        pathname: '/matchDayEditActionLog',
                        state: {
                          matchId: match ? match.id : null,
                        },
                      }}
                    >
                      <Button
                        disabled={userRole}
                        className="primary-add-comp-form mb-2"
                        type="primary"
                      >
                        + {AppConstants.editActionLog}
                      </Button>
                    </NavLink>
                  </div>
                )}
                {liveScoreCompIsParent && (
                  <div className="d-flex flex-row align-items-center justify-content-end">
                    <NavLink
                      to={{
                        pathname: '/matchDayAddMatch',
                        state: {
                          isEdit: true,
                          matchId: this.state.matchId,
                          key: this.state.key,
                          umpireKey: this.state.umpireKey,
                          screenName: this.state.screenName,
                        },
                      }}
                    >
                      <Button
                        disabled={userRole}
                        className="primary-add-comp-form mb-2"
                        type="primary"
                      >
                        + {AppConstants.edit}
                      </Button>
                    </NavLink>
                  </div>
                )}
                {liveScoreCompIsParent && (
                  <div className="d-flex flex-row align-items-center justify-content-end">
                    <Tooltip
                      className="h-100"
                      onMouseEnter={() =>
                        this.setState({
                          toolTipVisible: !!isMatchStatus,
                        })
                      }
                      onMouseLeave={() => this.setState({ toolTipVisible: false })}
                      visible={this.state.toolTipVisible}
                      title={ValidationConstants.matchDeleteMsg}
                    >
                      <Button
                        className={
                          isMatchStatus ? 'disable-button-style' : 'primary-add-comp-form' + ' mb-2'
                        }
                        type="primary"
                        disabled={isMatchStatus || userRole}
                        htmlType="submit"
                        data-testid={AppUniqueId.DELETE_MATCH_BUTTON}
                        onClick={() => this.showDeleteConfirm(this.state.matchId)}
                      >
                        {AppConstants.delete}
                      </Button>
                    </Tooltip>
                  </div>
                )}
              </Space>
            </Space>
          </div>
        </div>
      </div>
    );
  };

  //  Umpire & Score details
  umpireScore_View = () => {
    const match = this.props.liveScoreMatchState.matchDetails
      ? this.props.liveScoreMatchState.matchDetails.match
      : null;
    const umpires = this.props.liveScoreMatchState.matchDetails
      ? this.props.liveScoreMatchState.matchDetails.umpires
      : null;

    const {
      initialTeam1Score,
      initialTeam2Score,
      initialHasPenalty,
      initialTeam1PenaltyScore,
      initialTeam2PenaltyScore,
    } = this.props.liveScoreMatchState;

    const initalScores = {
      initialTeam1Score,
      initialTeam2Score,
      initialHasPenalty,
      initialTeam1PenaltyScore,
      initialTeam2PenaltyScore,
    };

    const hasSameScore =
      match?.team1Score === initialTeam1Score &&
      match?.team2Score === initialTeam2Score &&
      match?.team1PenaltyScore === initialTeam1PenaltyScore &&
      match?.team2PenaltyScore === initialTeam2PenaltyScore;

    const { teamAttendance } = this.state;
    const { recordGoalAttempts } = this.getCompetition();
    const hasGameStats = recordGoalAttempts || isBasketball;
    let UmpireData = isArrayNotEmpty(umpires) ? umpires : [];

    let scoreType = '';
    if (this.state.umpireKey === 'umpire') {
      if (getUmpireCompetitionData()) {
        scoreType = getUmpireCompetitionData().scoringType;
      } else {
        history.push('/matchDayCompetitions');
      }
    } else {
      const { scoringType } = JSON.parse(getLiveScoreCompetition());
      scoreType = scoringType;
    }

    return (
      <div className="row mt-4 mr-0 ml-0 pr-4 pl-4">
        <div className="col-sm-12 col-md-6 col-lg-3 mt-3">
          <div className="match-score-detail">
            <span className="event-time-start-text">{AppConstants.umpireName}</span>
          </div>
          <div className="d-flex align-content-center flex-column">
            {UmpireData.map((item, index) => (
              <span
                key={`umpire_${index}`}
                style={{ color: umpireStatusColor(item) }}
                className="desc-text-style side-bar-profile-data pt-2"
              >
                {`${AppConstants.umpireAbbreviated}${index + 1}`}: {item.umpireName}
              </span>
            ))}
          </div>
        </div>
        <div className="col-sm-12 col-md-6 col-lg-3 mt-3">
          <div className="match-score-detail">
            <span className="event-time-start-text">{AppConstants.umpireClubName}</span>
          </div>
          <div className="d-flex align-content-center flex-column">
            {UmpireData.map((item, index) => (
              <div key={`umpire_club_data_${index}`}>
                {isArrayNotEmpty(item.competitionOrganisations) &&
                  item.competitionOrganisations.map((item, index) => (
                    <span key={`umpire_club_${index}`} className="inbox-name-text pt-2">
                      {item.name}
                    </span>
                  ))}
              </div>
            ))}
          </div>
          <div className="d-flex align-content-center">
            {UmpireData.map((item, index) => (
              <span key={`umpire_data_${index}`} className="inbox-name-text pt-2">
                {item.umpire2Club && item.umpire2Club.name}
              </span>
            ))}
          </div>
        </div>
        <div className="col-sm-12 col-md-6 col-lg-3 mt-3">
          <div className="match-score-detail">
            <span className="event-time-start-text">{AppConstants.scorerName}</span>
          </div>
          <div className="d-flex align-content-center">
            <span className="inbox-name-text pt-2">
              {!!match?.scorer1 ? match.scorer1.firstName + ' ' + match.scorer1.lastName : ''}
            </span>
          </div>
        </div>
        <div className="col-sm-12 col-md-6 col-lg-3 mt-3">
          <div className="match-score-detail">
            <span className="event-time-start-text">{AppConstants.score}</span>
          </div>
          <div className="d-flex align-content-center">
            <span className="inbox-name-text">
              {match
                ? this.setMatchStatus(match, initalScores) +
                  (teamAttendance && hasGameStats ? ` (${AppConstants.matchScores})` : '')
                : ''}
            </span>
          </div>
          {teamAttendance && hasGameStats ? (
            <div className="d-flex align-content-center">
              <span className={`${!hasSameScore ? 'warning-msg' : ''} inbox-name-text pt-2`}>
                {match
                  ? this.setMatchStatus(match) + ` (${AppConstants.goalsEnteredOnScreen})`
                  : ''}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  isAllowEnterScore = () => {
    if (this.state.liveScoreCompIsParent) {
      return true;
    } else {
      const { allowAffiliatesEnterScore } = this.props.liveScoreSetting;
      const { isResultsLocked } = this.state;

      if (isResultsLocked) {
        return false;
      }

      if (!allowAffiliatesEnterScore) {
        return false;
      }

      const { matchDetails } = this.props.liveScoreMatchState;
      if (!matchDetails || !matchDetails.match) {
        return false;
      }

      const competition = this.getCompetition();
      if (!competition) {
        return false;
      }
      const competitionOrganisationId = competition?.competitionOrganisation?.id;
      return competitionOrganisationId === matchDetails.match.team1?.competitionOrganisationId;
    }
  };

  /*getPlayer = (playerId) => {
    const { team1Players, team2Players } = this.props.liveScoreMatchState;
    const team1PlayersData = team1Players.concat(this.state.borrowedTeam1Players);
    const team2PlayersData = team2Players.concat(this.state.borrowedTeam2Players);

    const player = team1PlayersData.find(p => p.playerId === playerId);
    if (player) {
      return player;
    }
    return team2PlayersData.find(p => p.playerId === playerId);
  }*/

  teamPlayersStatus = (data, team, teamId, name) => {
    const competition = this.getCompetition();
    if (!competition) {
      history.push('/matchDayCompetitions');
    }

    const { matchId } = this.state;
    const match = this.props.liveScoreMatchState.matchDetails
      ? this.props.liveScoreMatchState.matchDetails.match
      : null;

    let playersData = data;
    const { playerActions } = this.props.liveScorePlayerActionState;
    const unknownActions = playerActions.filter(
      action =>
        action.teamId === teamId &&
        ![GameStats.shirtNumber, GameStats.Jersey, GameStats.TotalPoints].includes(
          action.gameStatId,
        ) &&
        (action.contributors === null ||
          action.contributors.length <= 0 ||
          action.contributors.find(c => !c.pmtId && !c.newRecNum)),
    );
    if ((unknownActions && unknownActions.length > 0) || unknownVisibleByDefault) {
      const unknownPlayerIdx = playersData.findIndex(player => player.playerId === 0);
      if (unknownPlayerIdx === -1) {
        playersData.push({
          name: AppConstants.unassignedPlayerOrTeam,
          playerId: 0,
          teamId: teamId,
        });
      } else if (unknownPlayerIdx < playersData.length - 1) {
        //move unknown player to end of the list
        playersData.push(playersData.splice(unknownPlayerIdx, 1)[0]);
      }
    }
    return (
      <MatchStatistics
        params={{
          competition,
          match,
          matchId,
          team,
          teamId,
        }}
        showPlayerStatus
        dataSource={playersData}
      />
    );
  };

  getPositionArray(playerId, period) {
    let { trackResultData } = this.props.liveScorePlayerMinuteTrackingState;
    return trackResultData
      .filter(x => x.playerId === playerId && x.period === period)
      .map(x => x.positionId);
  }

  getPositionIndex(playerId, period) {
    let { trackResultData } = this.props.liveScorePlayerMinuteTrackingState;
    return trackResultData
      .filter(x => x.playerId === playerId && x.period === period)
      .map(x => ({
        positionId: x.positionId,
        id: x.id,
        newRecNum: x.newRecNum,
      }));
  }

  handleAttendanceView = (visible, team) => {
    this.setState({
      teamAttendance: visible,
    });
  };

  // Team details
  team_View = () => {
    const match = this.props.liveScoreMatchState.matchDetails
      ? this.props.liveScoreMatchState.matchDetails.match
      : null;
    //const { team1Players, team2Players } = this.props.liveScoreMatchState;
    const team1PlayersData = this.state.totalTeam1Players; //team1Players.concat(this.state.borrowedTeam1Players);
    const team2PlayersData = this.state.totalTeam2Players; //team2Players.concat(this.state.borrowedTeam2Players);
    const team1Id = match?.team1?.id;
    const team2Id = match?.team2?.id;
    const { teamAttendance } = this.state;

    return (
      <div className="row mt-5 ml-0 mr-0 mb-5">
        <div
          className={`${
            this.state.teamAttendance ? 'col-12' : 'col-6 col-md-6 col-sm-12'
          } d-flex align-content-center flex-column`}
        >
          <div className="d-flex flex-column align-items-center justify-content-center">
            <img
              className="user-image"
              src={match ? match.team1.logoUrl : ''}
              alt=""
              height="80"
              width="80"
            />
            <span className="live-score-profile-user-name match-details-team-name">
              {match ? match.team1.name : ''}
            </span>
            <span className="year-select-heading">{AppConstants.homeTeam}</span>
          </div>

          <div className="mt-2">
            <div className="row text-view pl-4 pr-4">
              <div className="col-sm d-flex align-items-center">
                <span className="home-dash-left-text">{AppConstants.players}</span>
              </div>
              {teamAttendance && (
                <div className="col-sm text-right align-items-center">
                  <Button
                    className="primary-add-comp-form"
                    type="primary"
                    data-testid={AppUniqueId.BORROW_PLAYER_TEAM1}
                    onClick={() => this.handleAddPlayerModal('team1')}
                    disabled={!this.isAllowEnterScore()}
                  >
                    + {AppConstants.borrowPlayer}
                  </Button>
                </div>
              )}
            </div>
            <div>
              {this.state.teamAttendance && (
                <div className="col-12">
                  {this.teamPlayersStatus(
                    team1PlayersData,
                    'team1',
                    match?.team1?.id,
                    match?.team1?.name,
                  )}
                </div>
              )}
              {!this.state.teamAttendance && (
                <div className="col-12">
                  <Table
                    className="home-dashboard-table pt-2"
                    columns={this.state.isLineUp === 1 ? getColumnsTeam1(team1Id) : columns}
                    dataSource={team1PlayersData.filter(p => !(p.playerId === 0))}
                    pagination={false}
                    scroll={{ x: '100%' }}
                    rowKey={record => 'team1' + record.playerId}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className={`${
            this.state.teamAttendance ? 'col-12 mt-5' : 'col-6 col-md-6 col-sm-12'
          } d-flex align-content-center flex-column`}
        >
          <div className="d-flex flex-column align-items-center justify-content-center">
            <img
              className="user-image"
              src={match ? match.team2.logoUrl : ''}
              alt=""
              height="80"
              width="80"
            />
            <span className="live-score-profile-user-name match-details-team-name">
              {match ? match.team2.name : ''}
            </span>
            <span className="year-select-heading">{AppConstants.awayTeam}</span>
          </div>

          <div className="mt-2">
            <div className="row text-view pl-4 pr-4">
              <div className="col-sm d-flex align-items-center">
                <span className="home-dash-left-text">{AppConstants.players}</span>
              </div>
              {teamAttendance && (
                <div className="col-sm text-right align-items-center">
                  <Button
                    className="primary-add-comp-form"
                    type="primary"
                    data-testid={AppUniqueId.BORROW_PLAYER_TEAM2}
                    onClick={() => this.handleAddPlayerModal('team2')}
                    disabled={!this.isAllowEnterScore()}
                  >
                    + {AppConstants.borrowPlayer}
                  </Button>
                </div>
              )}
            </div>
            <div>
              {this.state.teamAttendance ? (
                <div className="col-12">
                  {this.teamPlayersStatus(
                    team2PlayersData,
                    'team2',
                    match?.team2?.id,
                    match?.team2?.name,
                  )}
                </div>
              ) : (
                <div className="col-12">
                  <Table
                    className="home-dashboard-table pt-2"
                    columns={this.state.isLineUp === 1 ? getColumnsTeam2(team2Id) : columns}
                    dataSource={team2PlayersData.filter(p => !(p.playerId === 0))}
                    pagination={false}
                    scroll={{ x: '100%' }}
                    rowKey={record => 'team2' + record.playerId}
                  />
                </div>
              )}
            </div>
          </div>
          {this.footerView('team2', match?.team2?.id)}
        </div>
      </div>
    );
  };

  handleSubmit = () => {
    const teamIds = Array.from(
      new Set(this.props.liveScoreMatchState.bestPlayerPoints.map(it => it.teamId)),
    );
    this.props.liveScoreCompBestPlayerPointSaveAction({
      matchId: this.state.matchId,
      teamIds: teamIds,
      points: this.props.liveScoreMatchState.bestPlayerPoints,
    });
  };

  bestPlayerAwardPointSettingView = () => {
    return (
      <div>
        <MatchPlayerPoints
          matchId={this.state.matchId}
          liveScoreCompIsParent={this.state.liveScoreCompIsParent}
          viewMode={this.getBFViewMode(BFSettingType.MEDIA_REPORT)}
          typeRefId={BFSettingType.MEDIA_REPORT}
          title={AppConstants.bestAndFairestPoints}
          borrowedTeam1Players={this.state.borrowedTeam1Players}
          borrowedTeam2Players={this.state.borrowedTeam2Players}
        ></MatchPlayerPoints>
        <MatchPlayerPoints
          matchId={this.state.matchId}
          liveScoreCompIsParent={this.state.liveScoreCompIsParent}
          viewMode={this.getBFViewMode(BFSettingType.VOTED_AWARD)}
          typeRefId={BFSettingType.VOTED_AWARD}
          title={AppConstants.votedAwardBestAndFairest}
          borrowedTeam1Players={this.state.borrowedTeam1Players}
          borrowedTeam2Players={this.state.borrowedTeam2Players}
        ></MatchPlayerPoints>
        {!this.state.liveScoreCompIsParent && (
          <div>
            <MatchPlayerPoints
              matchId={this.state.matchId}
              liveScoreCompIsParent={this.state.liveScoreCompIsParent}
              viewMode={this.getBFViewMode(BFSettingType.ORGANISATION_AWARD)}
              typeRefId={BFSettingType.ORGANISATION_AWARD}
              title={AppConstants.ourOrganisationAwards}
              borrowedTeam1Players={this.state.borrowedTeam1Players}
              borrowedTeam2Players={this.state.borrowedTeam2Players}
            ></MatchPlayerPoints>
          </div>
        )}
        <div className="d-flex justify-content-between px-5">
          <Button
            className="cancelBtnWidth mr-2 mb-3"
            onClick={() => this.setState({ bestAndFairest: false })}
            type="cancel-button"
          >
            {AppConstants.cancel}
          </Button>
          <Button
            className="primary-add-comp-form"
            type="primary"
            htmlType="submit"
            onClick={this.handleSubmit}
          >
            {AppConstants.save}
          </Button>
        </div>
        <div style={{ minHeight: '160px' }}></div>
      </div>
    );
  };

  setMatchStatus(match, initalScores) {
    if (match.team1ResultId !== null) {
      if (match.team1ResultId === 4 || match.team1ResultId === 6 || match.team1ResultId === 6) {
        return 'Forfeit';
      } else if (match.team1ResultId === 8 || match.team1ResultId === 9) {
        return 'Abandoned';
      } else if (
        match.matchStatus === MatchStatus.Postponed ||
        match.matchStatusRefId === MatchStatusRefId.Postponed
      ) {
        return 'Postponed';
      } else {
        return getScoreText(match, initalScores);
      }
    } else {
      return getScoreText(match, initalScores);
    }
  }

  onClickFunc() {
    if (this.state.liveStreamLink) {
      let body = {
        id: this.state.matchId,
        competitionId: this.state.competitionId,
        livestreamURL: this.state.liveStreamLink,
      };

      this.props.liveScoreAddLiveStreamAction({ body });
    }

    this.setState({ visible: false, liveStreamLink: '' });
  }

  // modal view
  ModalView() {
    return (
      <Modal
        title={AppConstants.liveStreamlink}
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { display: 'none' } }}
        centered
        footer={null}
      >
        <InputWithHead
          auto_complete="off"
          // heading={AppConstants.liveStreamlink}
          placeholder={AppConstants.liveStreamlink}
          value={this.state.liveStreamLink}
          onChange={e => this.setState({ liveStreamLink: e.target.value })}
        />
        <div
          className="comp-dashboard-botton-view-mobile d-flex justify-content-end"
          style={{ paddingTop: 24 }}
        >
          <Button
            onClick={() => this.onClickFunc()}
            className="primary-add-comp-form"
            type="primary"
          >
            {AppConstants.save}
          </Button>
        </div>
      </Modal>
    );
  }

  handleAddPlayerModal = team => {
    this.setState({ addPlayerModal: team });
  };

  handleAddPlayerCancel = () => {
    this.setState({ addPlayerModal: '', borrowedPlayerValue: '' });
    this.props.liveScoreUpdatePlayerSearchResult(null, 'clear');
  };

  handleAddPlayerOk = () => {
    this.setState({ addPlayerModal: '' });
  };

  handleAddPlayer = playerId => {
    if (playerId) {
      const match = this.props.liveScoreMatchState.matchDetails
        ? this.props.liveScoreMatchState.matchDetails.match
        : null;
      const borrowedPlayer = (this.props.liveScorePlayerState.searchResult || []).find(
        player => player.playerId === playerId,
      );
      const { addPlayerModal } = this.state;
      const teamId = addPlayerModal === 'team1' ? match.team1.id : match.team2.id;
      borrowedPlayer.teamId = teamId;
      const borrowedPlayerAttendance = this.getPlayerAttendance(borrowedPlayer, true);

      const borrowedPlayerData = {
        attendance: null,
        attended: false,
        lineup: null,
        name: `${borrowedPlayer?.firstName || ''} ${borrowedPlayer?.lastName || ''}`,
        photoUrl: borrowedPlayer?.profilePicture,
        playerId: borrowedPlayer?.playerId,
        team: borrowedPlayer?.team?.name,
        teamId,
        isBorrowed: true,
        statusRef: getPlayerStatusText(borrowedPlayer.statusRefId),
      };

      if (this.state.addPlayerModal === 'team1') {
        const { borrowedTeam1Players, team1Attendance } = this.state;
        if (!borrowedTeam1Players.find(player => player.playerId === borrowedPlayerData.playerId)) {
          borrowedTeam1Players.push(borrowedPlayerData);
          team1Attendance.push(...borrowedPlayerAttendance);

          const { team1Players } = this.props.liveScoreMatchState;
          const totalTeam1Players = team1Players.concat(borrowedTeam1Players);

          this.setState({
            borrowedTeam1Players,
            team1Attendance,
            totalTeam1Players,
          });
        }
      } else {
        const { borrowedTeam2Players, team2Attendance } = this.state;
        if (!borrowedTeam2Players.find(player => player.playerId === borrowedPlayerData.playerId)) {
          borrowedTeam2Players.push(borrowedPlayerData);
          team2Attendance.push(...borrowedPlayerAttendance);

          const { team2Players } = this.props.liveScoreMatchState;
          const totalTeam2Players = team2Players.concat(borrowedTeam2Players);

          this.setState({
            borrowedTeam2Players,
            team2Attendance,
            totalTeam2Players,
          });
        }
      }
    }

    this.setState({ addPlayerModal: '' });
  };

  AddPlayerModalView() {
    let playerId = null;
    if (getUmpireCompetitionData() || getLiveScoreCompetition()) {
      const { id: competitionId, organisationId } = this.state.umpireKey
        ? JSON.parse(getUmpireCompetitionData())
        : JSON.parse(getLiveScoreCompetition());
      const { onSearchLoad, searchResult } = this.props.liveScorePlayerState;
      const { team1Players, team2Players } = this.props.liveScoreMatchState;
      const team1PlayersData = team1Players.concat(this.state.borrowedTeam1Players);
      const team2PlayersData = team2Players.concat(this.state.borrowedTeam2Players);
      const { addPlayerModal, borrowedPlayerValue, playerId, matchId } = this.state;
      let competitionOrganisationId =
        this.props.liveScoreMatchState?.matchDetails?.match[addPlayerModal]
          ?.competitionOrganisationId;

      const team1PlayerIds =
        team1PlayersData.length > 0 ? team1PlayersData.map(player => player.playerId) : [];
      const team2PlayerIds =
        team2PlayersData.length > 0 ? team2PlayersData.map(player => player.playerId) : [];

      const searchResultData =
        searchResult.length > 0
          ? searchResult.filter(
              player =>
                team1PlayerIds.indexOf(player.playerId) < 0 &&
                team2PlayerIds.indexOf(player.playerId) < 0,
            )
          : [];

      return (
        <Modal
          title={AppConstants.addPlayer}
          visible={!!this.state.addPlayerModal}
          onOk={this.handleAddPlayerOk}
          onCancel={this.handleAddPlayerCancel}
          cancelButtonProps={{ style: { display: 'none' } }}
          okButtonProps={{ style: { display: 'none' } }}
          centered
          footer={null}
        >
          <AutoComplete
            loading={onSearchLoad}
            className="w-100"
            style={{ height: 56 }}
            placeholder="Add Player"
            data-testid={AppUniqueId.ADD_PLAYER_INPUT}
            value={borrowedPlayerValue}
            onSelect={(item, option) => {
              this.setState({
                playerId: Number(option.key),
                borrowedPlayerValue: option.title,
              });
            }}
            notFoundContent={onSearchLoad === true ? <Spin size="small" /> : null}
            onChange={value => this.setState({ borrowedPlayerValue: value })}
            onSearch={value => {
              if (value) {
                this.props.liveScorePlayerListSearchAction(
                  competitionId,
                  competitionOrganisationId,
                  matchId,
                  value,
                );
              }
            }}
          >
            {searchResultData.length > 0 &&
              searchResultData.map(item =>
                playerId === item.playerId ? (
                  <Option
                    key={item.playerId}
                    value={`${item.firstName} ${item.lastName}(${item.playerId})`}
                    title={`${item.firstName} ${item.lastName}`}
                    className="selected-borrow-player"
                  >
                    {`${item.firstName} ${item.lastName} ${
                      item.phoneNumber ? `- ${item.phoneNumber}` : ``
                    }`}
                  </Option>
                ) : (
                  <Option
                    key={item.playerId}
                    value={`${item.firstName} ${item.lastName}(${item.playerId})`}
                    title={`${item.firstName} ${item.lastName}`}
                    data-testid={`${item.firstName} ${item.lastName}`}
                  >
                    {`${item.firstName} ${item.lastName} ${
                      item.phoneNumber ? `- ${item.phoneNumber}` : ``
                    }`}
                  </Option>
                ),
              )}
          </AutoComplete>
          <div
            className="comp-dashboard-botton-view-mobile d-flex justify-content-end"
            style={{ paddingTop: 24 }}
          >
            <Button
              onClick={() => this.handleAddPlayer(playerId)}
              className="primary-add-comp-form"
              type="primary"
              data-testid={AppUniqueId.ADD_PLAYER_BUTTON}
            >
              {AppConstants.save}
            </Button>
          </div>
        </Modal>
      );
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  getDurationArray(playerId, period) {
    let { trackResultData } = this.props.liveScorePlayerMinuteTrackingState;
    const match = this.props.liveScoreMatchState.matchDetails
      ? this.props.liveScoreMatchState.matchDetails.match
      : null;
    let periodDuration = null;
    if (match.type === 'FOUR_QUARTERS') {
      periodDuration = (match.matchDuration * 60) / 4;
    } else {
      periodDuration = (match.matchDuration * 60) / 2;
    }
    let duration = trackResultData
      .filter(x => x.playerId === playerId && x.period === period)
      .map(x => x.duration);
    let sum = duration.reduce(function (a, b) {
      return a + b;
    }, 0);
    return sum >= periodDuration;
  }

  getPeriodDuration() {
    const match = this.props.liveScoreMatchState.matchDetails
      ? this.props.liveScoreMatchState.matchDetails.match
      : null;
    let periodDuration = 0;
    if (!match) return periodDuration;
    if (match.type === 'FOUR_QUARTERS') {
      return (periodDuration = (match.matchDuration * 60) / 4);
    } else {
      return (periodDuration = (match.matchDuration * 60) / 2);
    }
  }

  /*
  pt -> position tracking enabled
  gtt -> game time tracking enabled
  artm -> minute tracking enabled
  
  1.pt	gtt	artm **TBA
  2.pt	gtt	!artm
  3.pt	!gtt	artm
  4.pt	!gtt	!artm
  5.!pt	gtt	artm
  6.!pt	gtt	!artm
  7.!pt	!gtt	artm
  8.!pt	!gtt	!artm
   */
  updateTrackOnSettings(trackData, pt, gtt, artm) {
    let trackDataLocal = _.cloneDeep(trackData);
    let playerData = trackDataLocal.map(p => {
      return { playerId: p.playerId, period: p.period, teamId: p.teamId };
    });
    playerData = _.uniqWith(playerData, _.isEqual);

    // 2
    //if not saving seconds, set played based on first position (pmt) record
    if (pt && gtt && !artm) {
      for (let p of playerData) {
        let playedPositions = getPlayedPositions(trackDataLocal, p.playerId, p.teamId, p.period);
        if (!playedPositions.length) {
          continue;
        }
        //checkbox uses the first position found for a player
        const position = playedPositions[0];
        let playerTrackData = trackDataLocal.filter(
          t => t.playerId === p.playerId && t.period === p.period,
        );
        for (let d of playerTrackData) {
          d.playedInPeriod = !!position.playedInPeriod;
          d.isPlaying = !!position.playedInPeriod;
          d.playedEndPeriod = !!position.playedInPeriod;
          d.playedFullPeriod = !!position.playedInPeriod;
          d.duration = !!position.playedInPeriod
            ? Math.ceil(this.getPeriodDuration() / Math.max(playedPositions.length, 1))
            : 0;
        }
      }
    }

    //3
    //played fields rely on duration set
    if (pt && !gtt && artm) {
      for (let d of trackDataLocal) {
        let duration = d.duration;
        let played = duration > 0;
        d.playedInPeriod = played;
        d.isPlaying = played;
      }
    }

    //4
    //changes driven by position
    if (pt && !gtt && !artm) {
      //if positionId != 0 then played and duration = periodDuration/num of positions
      //else not played and duration = 0
      for (let p of playerData) {
        let playedPositions = getPlayedPositions(trackDataLocal, p.playerId, p.teamId, p.period);
        if (!playedPositions.length) {
          continue;
        }
        let duration = Math.ceil(this.getPeriodDuration() / Math.max(playedPositions.length, 1));
        let playerTrackData = trackDataLocal.filter(
          t => t.playerId === p.playerId && t.period === p.period,
        );
        for (let d of playerTrackData) {
          d.isPlaying = d.positionId ? true : false;
          d.playedEndPeriod = d.positionId ? true : false;
          d.playedFullPeriod = d.positionId ? true : false;
          d.duration = d.positionId ? duration : 0;
        }
      }
    }

    //5,6,7,8
    if (!pt) {
      let filteredTrack = [];
      //only save the first pmt record for each player
      for (let d of playerData) {
        let data = trackDataLocal.find(t => t.playerId === d.playerId && t.period === d.period);
        if (data) {
          filteredTrack.push(data);
        }
      }
      //update positionIds to 0
      if (!artm) {
        filteredTrack.forEach(t => {
          t.positionId = 0;
          //if not tracking seconds, then also update duration to periodDuration
          t.duration = t.playedInPeriod ? this.getPeriodDuration() : 0;
        });
      } else {
        filteredTrack.forEach(t => {
          t.positionId = 0;
        });
      }
      return filteredTrack;
    }
    return trackDataLocal;
  }

  filterByMatch(trackData) {
    let trackDataLocal = _.cloneDeep(trackData);
    const match = this.props.liveScoreMatchState.matchDetails
      ? this.props.liveScoreMatchState.matchDetails.match
      : null;

    trackDataLocal = match
      ? trackDataLocal.filter(record => {
          return record.teamId === match.team1Id || record.teamId === match.team2Id;
        })
      : trackDataLocal;
    return trackDataLocal;
  }

  updateTrackOnDuration(trackData, pt, gtt, artm) {
    let trackDataLocal = _.cloneDeep(trackData);
    const findPlayedFullPeriod = (pt && !gtt && artm) || (!pt && !gtt && artm);

    trackDataLocal.forEach(item => {
      const gttPlayed = !!this.getDurationArray(item.playerId, item.period);
      if (findPlayedFullPeriod) {
        item.playedFullPeriod = gttPlayed;
        item.playedEndPeriod = gttPlayed;
      }
      item.isPlaying = item.duration > 0;
    });

    return trackDataLocal;
  }

  onSavePlayerTrack(trackResultData, saveAsFinal = false) {
    //isDeleted is only used in the web. It is used to remove positions from a player
    let trackData = trackResultData.map(t => _.cloneDeep(t));
    const competition = this.getCompetition();
    const { liveScoreCompIsParent, canRegenLadderPoints, match } = this.state;
    let { playerActions } = this.props.liveScorePlayerActionState;

    if (!competition) {
      history.push('/matchDayCompetitions');
    }
    let pt = !!competition.positionTracking ? true : false; // Position Tracking
    let gtt = !!competition.gameTimeTracking ? true : false; // Game Time Tracking
    let art = competition.attendanceRecordingPeriod; // Attendance Recording Period
    let artm = art && art === 'MINUTE'; //Minute Tracking

    //remove actions and positions that have been cleared
    trackData = trackData.filter(t => !t.isDeleted);

    //need to keep actions with shirt number so we can update in backend
    playerActions = playerActions.filter(
      a =>
        !a.isDeleted &&
        (isNotNullAndUndefined(a.actionCount) ||
          [GameStats.shirtNumber, GameStats.Jersey].includes(a.gameStatId)),
    );

    /**
     * set penalty period
     * penalty period is intially set to 1 in web to make it work with the UI
     * but when saving, we want save it with period = 100
     */
    playerActions.forEach(a => {
      if (a.gameStatId === GameStats.penalty) {
        a.period = SpecialPeriod.Penalty;
      }
    });

    trackData = this.filterByMatch(trackData);
    trackData = this.updateTrackOnSettings(trackData, pt, gtt, artm);
    trackData = this.updateTrackOnDuration(trackData, pt, gtt, artm);

    const payload = {
      playerActions,
      trackingData: trackData,
      isCompOrganiser: liveScoreCompIsParent,
      saveAsFinal,
      canRegenLadderPoints,
    };
    this.setState(
      {
        team1Attendance: [],
        team2Attendance: [],
        borrowedTeam1Players: [],
        borrowedTeam2Players: [],
        totalTeam1Players: [],
        totalTeam2Players: [],
      },
      () => this.props.liveScorePlayerMinuteRecordAction(payload, this.state.matchId),
    );
  }

  scoreChangeWarningModal = (teamNames, oldScore, newScore, saveFn) => {
    let content = AppConstants.scoreChangeWarning.replace(`{{teamNames}}`, teamNames.join(' and '));
    content = content.replaceAll(`{{oldScore}}`, oldScore);
    content = content.replaceAll(`{{newScore}}`, newScore);

    confirm({
      content: content,
      okText: AppConstants.continue,
      okType: AppConstants.primary,
      cancelText: AppConstants.cancel,
      width: 500,
      onOk() {
        saveFn();
      },
    });
  };

  handleSave(trackResultData, saveAsFinal = false) {
    const { match } = this.state;
    const {
      initialTeam1Score,
      initialTeam2Score,
      initialHasPenalty,
      initialTeam1PenaltyScore,
      initialTeam2PenaltyScore,
    } = this.props.liveScoreMatchState;
    let saveFn = saveAsFinal
      ? () => this.handleSaveAsFinal(trackResultData)
      : () => this.onSavePlayerTrack(trackResultData);

    if (
      initialTeam1Score !== match.team1Score ||
      initialTeam2Score !== match.team2Score ||
      initialTeam1PenaltyScore !== match.team1PenaltyScore ||
      initialTeam2PenaltyScore !== match.team2PenaltyScore
    ) {
      let teamNames = [match.team1.name, match.team2.name];

      const initialTeam1PenaltyScoreTxt = `${
        initialHasPenalty ? `(${initialTeam1PenaltyScore})` : ''
      }`;
      const initialTeam2PenaltyScoreText = `${
        initialHasPenalty ? `(${initialTeam2PenaltyScore})` : ''
      }`;
      const team1PenaltyScoreTxt = `${match.hasPenalty ? `(${match.team1PenaltyScore})` : ''}`;
      const team2PenaltyScoreText = `${match.hasPenalty ? `(${match.team2PenaltyScore})` : ''}`;

      let oldScore = `${initialTeam1Score}${initialTeam1PenaltyScoreTxt}:${initialTeam2Score}${initialTeam2PenaltyScoreText} `;
      let newScore = `${match.team1Score}${team1PenaltyScoreTxt}:${match.team2Score}${team2PenaltyScoreText}`;

      this.scoreChangeWarningModal(teamNames, oldScore, newScore, saveFn);
    } else {
      saveFn();
    }
  }

  footerView = (team, teamId) => {
    const { trackResultData } = this.props.liveScorePlayerMinuteTrackingState;

    return (
      <div className="fluid-width paddingBottom56px mt-4">
        {this.state.teamAttendance && (
          <div className="row">
            <div className="col-sm-3">
              <div className="reg-add-save-button ml-3">
                <Button className="cancelBtnWidth" type="cancel-button" onClick={this.refreshPage}>
                  {AppConstants.cancel}
                </Button>
              </div>
            </div>
            <div className="col-sm">
              <div className="comp-buttons-view mr-3">
                <Button
                  onClick={() => this.handleSave(trackResultData, true)}
                  className="publish-button save-draft-text mr-3"
                  htmlType="button"
                  type="primary"
                >
                  {AppConstants.saveScoresAsFinals}
                </Button>
                <Button
                  onClick={() => this.handleSave(trackResultData, false)}
                  className="publish-button save-draft-text mr-0"
                  htmlType="submit"
                  type="primary"
                  data-testid={AppUniqueId.ATTENDANCE_SAVE_BUTTON}
                >
                  {AppConstants.save}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  handleSaveAsFinal = trackResultData => {
    const match = this.props.liveScoreMatchState.matchDetails
      ? this.props.liveScoreMatchState.matchDetails.match
      : null;
    if (match && match.excludeFromLadder) {
      this.setState({
        showRegenLadderPointsModal: true,
        regenLadderPointsModalFn: () => this.onSavePlayerTrack(trackResultData, true),
      });
    } else {
      this.onSavePlayerTrack(trackResultData, true);
    }
  };

  handleRegenLadderModalOk = matches => {
    const { regenLadderPointsModalFn } = this.state;
    this.setState({ canRegenLadderPoints: true, showRegenLadderPointsModal: false }, () => {
      if (regenLadderPointsModalFn) regenLadderPointsModalFn();
    });
  };

  handleRegenLadderModalCancel = matches => {
    const { regenLadderPointsModalFn } = this.state;
    this.setState({ canRegenLadderPoints: false, showRegenLadderPointsModal: false }, () => {
      if (regenLadderPointsModalFn) regenLadderPointsModalFn();
    });
  };

  regenLadderPointsModalView = () => {
    const { showRegenLadderPointsModal } = this.state;
    const { staticMatchData } = this.props.liveScoreMatchState;
    return (
      <RegenerateLadderPointsModal
        visible={showRegenLadderPointsModal}
        onCancel={this.handleRegenLadderModalCancel}
        onOk={this.handleRegenLadderModalOk}
        matches={[staticMatchData]}
      ></RegenerateLadderPointsModal>
    );
  };

  render() {
    const { umpireKey } = this.state;
    let screen =
      this.props.location.state && this.props.location.state.screenName
        ? this.props.location.state.screenName
        : null;
    let liveScoreCompetition = getLiveScoreCompetition();
    let umpireCompetition = getUmpireCompetitionData();
    let isUmpire = umpireKey === 'umpire';
    return (
      <div className="fluid-width default-bg">
        <Loader
          visible={
            // this.props.liveScorePlayerMinuteTrackingState.onLoad ||
            this.props.liveScorePlayerMinuteTrackingState.recordLoad ||
            this.props.liveScoreMatchState.loading
          }
        />

        {umpireKey ? (
          <DashboardLayout menuHeading={AppConstants.umpires} menuName={AppConstants.umpires} />
        ) : (
          <DashboardLayout
            menuHeading={AppConstants.matchDay}
            menuName={AppConstants.liveScores}
            onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
          />
        )}

        {umpireKey ? (
          <InnerHorizontalMenu
            menu={'umpire'}
            umpireSelectedKey={screen === 'umpireList' ? '2' : '1'}
          />
        ) : (
          <InnerHorizontalMenu
            menu="liveScore"
            liveScoreSelectedKey={this.state.screenName === 'incident' ? '17' : '2'}
          />
        )}

        <Loader visible={this.props.liveScoreMatchState.onLoad} />
        <Loader visible={this.props.liveScoreMatchState.exportingReport} />
        <Layout>
          {this.headerView()}

          <Content>
            {this.regenLadderPointsModalView()}
            {(liveScoreCompetition || (umpireCompetition && isUmpire)) && this.umpireScore_View()}
            {(liveScoreCompetition || (umpireCompetition && isUmpire)) && this.team_View()}
            {(liveScoreCompetition || (umpireCompetition && isUmpire)) &&
              this.state.bestAndFairest &&
              this.bestPlayerAwardPointSettingView()}
            {(liveScoreCompetition || (umpireCompetition && isUmpire)) && this.ModalView()}
            {(liveScoreCompetition || (umpireCompetition && isUmpire)) && this.AddPlayerModalView()}
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      liveScoreDeleteMatch,
      liveScoreGetMatchDetailInitiate,
      changePlayerLineUpAction,
      liveScoreAddLiveStreamAction,
      getLiveScoreGamePositionsList,
      getLiveScoreGameStatsList,
      getLiveScoreSettingInitiate,
      liveScorePlayerListSearchAction,
      liveScoreExportGameAttendanceAction,
      liveScoreGameAttendanceListAction,
      liveScorePlayerMinuteTrackingListAction,
      liveScorePlayerMinuteRecordAction,
      liveScoreUpdatePlayerMinuteRecordAction,
      liveScoreUpdatePlayerSearchResult,
      liveScoreCompBestPlayerPointListAction,
      liveScoreCompBestPlayerPointUpdateAction,
      liveScoreCompBestPlayerPointSaveAction,
      liveScorePlayerActionsLoadAction,
      liveScoreUpdatePlayerScoreAction,
      liveScorePlayerScoreInitializeAction,
      liveScoreUpdateMatchScoreAction,
      getLiveScoreDivisionList,
      liveScoreRoundListAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreMatchState: state.LiveScoreMatchState,
    liveScoreGamePositionState: state.liveScoreGamePositionState,
    liveScorePlayerState: state.LiveScorePlayerState,
    liveScoreGameAttendanceState: state.liveScoreGameAttendanceState,
    liveScorePlayerMinuteTrackingState: state.liveScorePlayerMinuteTrackingState,
    liveScorePlayerActionState: state.liveScorePlayerActionState,
    liveScoreSetting: state.LiveScoreSetting,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreMatchDetails);
