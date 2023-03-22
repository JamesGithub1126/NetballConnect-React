import moment from 'moment';

import ApiConstants from 'themes/apiConstants';
import {
  isArrayNotEmpty,
  isNotNullAndUndefined,
  isNullOrUndefined,
  isNullOrUndefinedOrEmptyString,
} from 'util/helpers';
import { getMatchListSettings } from 'store/objectModel/getMatchTeamListObject';
import liveScoreMatchModal from 'store/objectModel/liveScoreMatchModal';
import { message } from 'antd';
import AppConstants from 'themes/appConstants';
import { FLAVOUR, RECORDUMPIRETYPE, ROLE } from 'util/enums';
import { GameStats, UmpireSequence, ValueKind } from 'enums/enums';
import {
  getLiveScoreCompetition,
  getRecordUmpireType,
  getUmpireSequenceSettings,
} from 'util/sessionStorage';
import {
  checkSelectedUmpireIsAvailable,
  createUmpireArray,
  setUmpireAvailable,
  populateUmpireStateData,
  updateUmpireSelection,
  resetOtherUmpireSelections,
  updateUmpireData,
  disableSelectedUmpires,
  umpireSearchRoleIds,
  clearUmpireDict,
} from './helpers/matchUmpires';
import { cloneDeep } from 'lodash';
const isBasketball = process.env.REACT_APP_FLAVOUR === FLAVOUR.Basketball;

const object = {
  id: '',
  team1Score: 0,
  team2Score: 0,
  venueId: '',
  competitionId: '',
  divisionId: null,
  team1Id: '',
  team2Id: '',
  startTime: null,
  startdate: '',
  starttime: '',
  type: '',
  matchDuration: '',
  breakDuration: '',
  mainBreakDuration: '',
  extraTimeDuration: '',
  scorerStatus: '',
  mnbMatchId: '',
  mnbPushed: '',
  matchEnded: '',
  matchStatus: '',
  endTime: '',
  team1ResultId: '',
  team2ResultId: '',
  roundId: '',
  originalStartTime: '',
  pauseStartTime: '',
  totalPausedMs: '',
  centrePassStatus: '',
  centrePassWonBy: '',
  umpire1: '',
  umpire2: '',
  umpire3: '',
  umpire4: '',
  resultStatus: '',
  forfietedTeam: null,
  abandoneReason: null,
  isFinals: false,
  isLocked: false,
  extraTimeType: null,
  extraTimeFor: null,
  extraTimeMainBreak: null,
  extraTimeBreak: null,
  extraTimeWinByGoals: null,
  team1: {
    id: '',
    name: '',
    divisionId: '',
    logoUrl: '',
    competitionId: '',
    nameFilter: null,
    clubId: '',
    gameTimeTrackingOverride: '',
    positionTracking: '',
  },
  team2: {
    id: '',
    name: '',
    divisionId: '',
    logoUrl: '',
    competitionId: '',
    nameFilter: '',
    clubId: '',
    gameTimeTrackingOverride: '',
    positionTracking: '',
  },
  venue: {
    id: '',
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    parentId: '',
    parent: {
      id: '',
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      parentId: '',
    },
  },
  division: {
    id: '',
    name: '',
    age: '',
    grade: '',
    competitionId: '',
  },
  competition: {
    id: '',
    name: '',
    longName: '',
    logoUrl: '',
    recordUmpire: '',
    gameTimeTracking: '',
    positionTracking: '',
    uploadScores: '',
    uploadAttendance: '',
    scoringType: '',
    attendanceRecordingType: '',
    timerType: '',
    attendanceRecordingPeriod: '',
    softBuzzerUrl: '',
    hardBuzzerUrl: '',
    recordGoalAttempts: ' ',
    centrePassEnabled: '',
    lineupSelectionTime: '',
    attendanceSelectionTime: '',
    lineupSelectionEnabled: '',
    incidentsEnabled: '',
    location: {
      id: '',
      name: '',
      abbreviation: '',
    },
  },
  round: {
    id: '',
    name: '',
    sequence: '',
    competitionId: '',
    divisionId: '',
  },
  loading: false,
  bestPlayerPoints: null,
  loadMatchTeamOfficials: false,
  matchTeamOfficials: [],
};

const matchObj = {
  id: 0,
  startTime: '',
  divisionId: null,
  type: null,
  competitionId: null,
  mnbMatchId: null,
  team1Id: null,
  team2Id: null,
  venueId: null,
  roundId: null,
  matchDuration: null,
  mainBreakDuration: null,
  breakDuration: null,
  team1Score: 0,
  team2Score: 0,
  hasPenalty: false,
  team1PenaltyScore: null,
  team2PenaltyScore: null,
  umpire1: '',
  umpire2: '',
  umpire3: '',
  umpire4: '',
  resultStatus: '',
  forfietedTeam: null,
  abandoneReason: null,
  isFinals: false,
  isLocked: false,
  extraTimeType: null,
  extraTimeFor: null,
  extraTimeDuration: null,
  extraTimeMainBreak: null,
  extraTimeBreak: null,
  extraTimeWinByGoals: null,
  excludeFromLadder: false,
};

const initialState = {
  onLoad: false,
  error: null,
  result: null,
  status: 0,
  isFetchingMatchList: false,
  liveScoreMatchListData: [],
  liveScoreMatchList: [],
  addEditMatch: object,
  start_date: '',
  start_time: '',
  venueData: null,
  venueIdArray: [],
  liveScoreMatchListPage: 1,
  liveScoreMatchListPageSize: 10,
  liveScoreMatchListTotalCount: 1,
  matchData: matchObj,
  matchLoad: false,
  matchScoresLoad: false,
  matchScoresData: [],
  matchDetails: null,
  start_post_date: null,
  displayTime: '',
  team1Players: [],
  team2Players: [],
  divisionList: [],
  teamResult: [],
  roundList: [],
  clubListData: [],
  courList: [],
  roundLoad: false,
  matchResult: [],
  forfietedTeam: undefined,
  abandoneReason: undefined,
  recordUmpireType: null,
  scorer1: null,
  scorer2: null,
  scorerId_1: null,
  scorerId_2: null,
  umpireSelectionDict: {},
  officialSelectionDict: {},
  otherOfficialSelectionDict: {},
  umpires: [],
  teamLineUpPostObject: null,
  scorerRosterId_1: null,
  scorerRosterId_2: null,
  team1Id: null,
  team2Id: null,
  liveScoreBulkScoreList: [],
  highestSequence: null,
  onUpdateBulkScore: false,
  onLoadMatch: false,
  matchListActionObject: null,
  umpireList: [],
  newUmpireList: [],
  otherOfficialsList: [],
  umpire1SelectedRosterId: null,
  umpire2SelectedRosterId: null,
  umpire3SelectedRosterId: null,
  umpire4SelectedRosterId: null,
  coachList: [],
  availableUmpireCoachList: [],
  staticMatchData: JSON.parse(JSON.stringify(object)),
  umpireReserveId: null,
  umpireCoachId: null,
  accreditation: [],
  updateUmpireFetchCall: false,
  lockedMatch: false,
  reloadAvailableUmpires: false,
  exportingReport: false,
  activateFinals: false,
  finaliseResultLoad: false,
  matchDataLoad: false,
  initialHasPenalty: false,
  initialTeam1PenaltyScore: null,
  initialTeam2PenaltyScore: null,
  umpireLoad: false,
  initialMatchUmpires: [],
  atCourtUmpires: [],
  umpireSearchDict: {},
};

function assignLineups(playerId, lineup, resultList) {
  let list = [];
  if (lineup) {
    for (let [idx, val] of lineup.entries()) {
      let res = resultList.find(x => x.id === val.id);
      if (res) {
        lineup[idx] = val;
        list.push(res.id);
      }
    }
    let remaining = resultList.filter(x => !list.includes(x.id) && x.playerId === playerId);
    for (let r of remaining) {
      lineup.push(r);
    }
  }
}
function setMatchData(data) {
  return {
    id: data.id ? data.id : 0,
    startTime: data.startTime,
    divisionId: data.divisionId,
    type: data.type,
    competitionId: data.competitionId,
    mnbMatchId: data.mnbMatchId,
    team1Id: data.team1Id,
    team2Id: data.team2Id,
    venueId: data.venueCourtId,
    roundId: data.roundId,
    matchDuration: data.matchDuration,
    mainBreakDuration: data.mainBreakDuration,
    breakDuration: data.breakDuration,
    extraTimeDuration: data.extraTimeDuration,
    extraTimeBreak: data.extraTimeBreak,
    extraTimeMainBreak: data.extraTimeMainBreak,
    extraTimeType: data.extraTimeType,
    extraTimeFor: data.extraTimeFor,
    isLocked: data.isLocked,
    team1Score: data.team1Score ? data.team1Score : 0,
    team2Score: data.team2Score ? data.team2Score : 0,
    hasPenalty: !!data.hasPenalty,
    team1PenaltyScore: isNotNullAndUndefined(data.team1PenaltyScore)
      ? data.team1PenaltyScore
      : null,
    team2PenaltyScore: isNotNullAndUndefined(data.team2PenaltyScore)
      ? data.team2PenaltyScore
      : null,
    excludeFromLadder: data.excludeFromLadder,
  };
}

function generateCourtsArray(venuesData) {
  let courtsArray = [];
  for (let i in venuesData) {
    let venueCourtsValue = venuesData[i].venueCourts;
    for (let j in venueCourtsValue) {
      venueCourtsValue[j]['name'] = venuesData[i].venueName + '-' + venueCourtsValue[j].courtNumber;
      courtsArray.push(venueCourtsValue[j]);
    }
  }
  return courtsArray;
}

function getHighestSequence(roundArr) {
  let sequence = [];
  for (let i in roundArr) {
    sequence.push(roundArr[i].sequence);
  }
  return Math.max.apply(null, sequence);
}
// Remove duplicate rounds names
function removeDuplicateValues(array, matchmodel) {
  const path = window.location.pathname;
  if (path === '/matchDayAddMatch' && matchmodel.id) {
    let round = array.find(a => a.id === matchmodel.roundId);
    if (round) array = array.filter(a => a.name !== round.name || a.id === round.id);
  }

  return array.filter(
    (obj, index, self) => index === self.findIndex(el => el['name'] === obj['name']),
  );
}

function updatePenaltyScores(state, action) {
  if (!['team1PenaltyScore', 'team2PenaltyScore'].includes(action.key)) {
    return;
  }
  const otherKey = action.key === 'team1PenaltyScore' ? 'team2PenaltyScore' : 'team1PenaltyScore';
  const score = isNullOrUndefinedOrEmptyString(action.data) ? null : Number(action.data);
  state.addEditMatch[action.key] = score;
  state.matchData[action.key] = score;
  if (score !== null) {
    state.addEditMatch['hasPenalty'] = true;
    state.matchData['hasPenalty'] = true;
  } else if (isNullOrUndefinedOrEmptyString(state.addEditMatch[otherKey])) {
    state.addEditMatch['hasPenalty'] = false;
    state.matchData['hasPenalty'] = false;
  }
}

function liveScoreMatchReducer(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_MATCH_LIST_LOAD:
      return {
        ...state,
        onLoadMatch: true,
        isFetchingMatchList: true,
        liveScoreMatchListData: [],
        matchListActionObject: action,
      };

    case ApiConstants.API_LIVE_SCORE_MATCH_LIST_SUCCESS:
      const result = getMatchListSettings(action.result.matches);
      return {
        ...state,
        onLoadMatch: false,
        isFetchingMatchList: false,
        liveScoreMatchListPage: action.result.page ? action.result.page.currentPage : 1,
        liveScoreMatchListTotalCount: action.result.page ? action.result.page.totalCount : 0,
        status: action.status,
        liveScoreMatchListData: result,
        liveScoreBulkScoreList: result,
        liveScoreMatchList: isArrayNotEmpty(action.result) ? action.result : result,
      };

    case ApiConstants.API_LIVE_SCORE_MATCH_LIST_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_MATCH_LIST_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_ADD_EDIT_MATCH_LOAD:
      return {
        ...state,
        onLoad: true,
        matchLoad: true,
      };
    case ApiConstants.API_LIVE_SCORE_ADD_EDIT_MATCH_SCORES_LOAD:
      return {
        ...state,
        onLoad: true,
        matchScoresLoad: true,
      };

    case ApiConstants.API_LIVE_SCORE_ADD_EDIT_MATCH_SCORES_SUCCESS:
      state.matchScoresLoad = false;
      state.matchScoresData = action.result;
      return {
        ...state,
        onLoad: false,
        error: null,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_ADD_EDIT_MATCH_SCORES_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_ADD_EDIT_MATCH_SCORES_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_ADD_EDIT_MATCH_SUCCESS:
      let data = action.result;
      state.addEditMatch = JSON.parse(JSON.stringify(action.result));
      state.staticMatchData = JSON.parse(JSON.stringify(action.result));
      // state.addEditMatch['extraTimeMainBreak'] = data.extraTimeType === 'FOUR_QUARTERS' ? data.extraTimeMainBreak : data.extraTimeBreak;
      state.addEditMatch['extraTimeMainBreak'] = data.extraTimeMainBreak;
      state.addEditMatch['extraTimeBreak'] = data.extraTimeBreak;
      if (action.result) {
        state.team1Id = action.result.team1Id;
        state.team2Id = action.result.team2Id;
      }
      state.start_date = moment(action.result.startTime).format('DD-MM-YYYY');
      state.start_post_date = moment(action.result.startTime, 'YYYY-MM-DD');
      state.start_time = action.result.startTime;
      state.displayTime = action.result.startTime;
      // let checkSelectedVenue = [data.venueCourt.venueId];
      state.matchData = setMatchData(data);
      state.matchLoad = false;
      return {
        ...state,
        onLoad: false,
        error: null,
        status: action.status,
        recordUmpireType: data.competition.recordUmpireType,
        updateUmpireFetchCall: true,
        initialTeam1Score: data.team1Score ?? 0,
        initialTeam2Score: data.team2Score ?? 0,
        initialHasPenalty: !!data.hasPenalty,
        initialTeam1PenaltyScore: data.team1PenaltyScore ?? null,
        initialTeam2PenaltyScore: data.team2PenaltyScore ?? null,
      };

    case ApiConstants.API_LIVE_SCORE_ADD_EDIT_MATCH_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_ADD_EDIT_MATCH_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_ADD_MATCH:
      state.addEditMatch = object;
      state.matchData = matchObj;
      state.start_date = null;
      state.start_time = null;
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.API_UMPIRE_LIST_SUCCESS: {
      let userData = action.result.userData ? action.result.userData : action.result;
      let umpireArr = createUmpireArray(cloneDeep(userData), state.accreditation);
      //umpire-coaches
      let coachList = umpireArr.filter(u => [ROLE.UMPIRE_COACH].includes(u.roleId));
      //umpires
      let umpireList = umpireArr.filter(u => [ROLE.UMPIRE, ROLE.UMPIRE_RESERVE].includes(u.roleId));

      //disable unavailable umpires
      setUmpireAvailable(umpireList, state.newUmpireList || []);

      return {
        ...state,
        onLoad: false,
        status: action.status,
        coachList,
        umpireList,
      };
    }

    case ApiConstants.API_NEW_UMPIRE_LIST_LOAD: {
      return {
        ...state,
        umpireLoad: true,
      };
    }
    case ApiConstants.API_NEW_UMPIRE_LIST_SUCCESS: {
      let userData = action.result.userData ? action.result.userData : action.result;
      let sequence = action.sequence;
      let umpireArr = createUmpireArray(cloneDeep(userData), state.accreditation);
      const umpireSequenceSetting = getUmpireSequenceSettings() || {};
      const { AnyoneCanBeUmpire } = umpireSequenceSetting;
      if (AnyoneCanBeUmpire) {
        let umpires = umpireArr.filter(u => umpireSearchRoleIds.includes(u.roleId));
        disableSelectedUmpires(umpires, state.umpireSelectionDict, sequence);
        let umpireSearchDict = { ...state.umpireSearchDict, [sequence]: umpires };
        return {
          ...state,
          onLoad: false,
          umpireLoad: false,
          status: action.status,
          reloadAvailableUmpires: false,
          umpireSearchDict,
        };
      }

      let newUmpireList = umpireArr.filter(u =>
        [ROLE.UMPIRE, ROLE.UMPIRE_RESERVE].includes(u.roleId),
      );
      let umpireList = state.umpireList || [];
      setUmpireAvailable(umpireList, newUmpireList);

      let umpireKey_1 = state.umpireSelectionDict[1]?.key;
      let umpireKey_2 = state.umpireSelectionDict[2]?.key;
      let umpireReserveKey = state.umpireSelectionDict[2]?.key;
      let reloadAvailableUmpires = state.reloadAvailableUmpires;

      if (reloadAvailableUmpires) {
        if (umpireKey_1 && !checkSelectedUmpireIsAvailable(newUmpireList, umpireKey_1)) {
          const umpire1 = umpireList.find(umpire => umpire.key == umpireKey_1);
          message.warning(
            AppConstants.umpire1NotAvailable.replace('${umpire1}', umpire1?.umpireName),
          );
          state.umpireSelectionDict[UmpireSequence.umpire1] = null;
        }

        if (umpireKey_2 && !checkSelectedUmpireIsAvailable(newUmpireList, umpireKey_2)) {
          const umpire2 = umpireList.find(umpire => umpire.key == umpireKey_2);
          message.warning(
            AppConstants.umpire2NotAvailable.replace('${umpire2}', umpire2?.umpireName),
          );
          state.umpireSelectionDict[UmpireSequence.umpire2] = null;
        }

        if (umpireReserveKey && !checkSelectedUmpireIsAvailable(newUmpireList, umpireReserveKey)) {
          const referee = umpireList.find(umpire => umpire.key == umpireReserveKey);
          message.warning(
            AppConstants.umpireReserveNotAvailable.replace('${referee}', referee?.umpireName),
          );
          state.umpireSelectionDict[UmpireSequence.UmpireReserve] = null;
        }
      }
      return {
        ...state,
        onLoad: false,
        umpireLoad: false,
        status: action.status,
        reloadAvailableUmpires: false,
        umpireSelectionDict: cloneDeep(state.umpireSelectionDict),
        newUmpireList,
        umpireList,
      };
    }
    case ApiConstants.API_OTHER_OFFICIAL_LIST_SUCCESS: {
      return {
        ...state,
        otherOfficialsList: action.result.userData,
      };
    }
    case ApiConstants.API_LIVE_SCORE_UPDATE_MATCH:
      // let utcTimestamp = null;
      // let date = null;
      if (action.key === 'start_date') {
        state.start_date = action.data;
        state.start_post_date = action.data;
        if (action.data != null) {
          const d_date = moment(action.data).format('YYYY-MM-DD').split('-');
          let d_newTime;
          if (!!state.start_time) {
            const d_oldTime = moment(state.start_time).format('HH:mm').split(':');
            d_newTime = moment([d_date[0], d_date[1] - 1, d_date[2], d_oldTime[0], d_oldTime[1]])
              .utc()
              .format();
          } else {
            d_newTime = moment([d_date[0], d_date[1] - 1, d_date[2]])
              .utc()
              .format();
          }
          state.matchData.startTime = d_newTime;
          if (d_newTime !== 'Invalid date') {
            state.updateUmpireFetchCall = true;
            state.reloadAvailableUmpires = true;
          }
        }
      } else if (action.key === 'start_time') {
        state.start_time = action.data;
        state.displayTime = action.data;
        if (action.data != null) {
          const t_date = !!state.matchData.startTime
            ? moment(state.matchData.startTime).format('YYYY-MM-DD').split('-')
            : moment().format('YYYY-MM-DD').split('-');
          const t_time = moment(action.data).format('HH:mm').split(':');
          const t_newTime = moment([t_date[0], t_date[1] - 1, t_date[2], t_time[0], t_time[1]])
            .utc()
            .format();
          state.matchData.startTime = t_newTime;
          if (t_newTime !== 'Invalid date') {
            state.updateUmpireFetchCall = true;
            state.reloadAvailableUmpires = true;
          }
        }
      } else if (action.key === 'forfietedTeam') {
        state.forfietedTeam = action.data;
      } else if (action.key === 'abandoneReason') {
        state.abandoneReason = action.data;
      } else if (action.key === 'clearData') {
        state.forfietedTeam = null;
        state.abandoneReason = null;
      } else if (action.key === 'scorerId_1') {
        state.scorerId_1 = action.data;
      } else if (action.key === 'scorerId_2') {
        state.scorerId_2 = action.data;
      }

      //match team officials
      else if (action.key === 'matchTeamOfficial') {
        const data = action.data;
        const matchTeamOfficials = [...state.matchTeamOfficials];
        const index = matchTeamOfficials.findIndex(
          x =>
            x.matchId === data.matchId &&
            x.teamId === data.teamId &&
            x.teamOfficialRoleId === data.teamOfficialRoleId,
        );
        if (data.userId === 'delete') {
          index >= 0 && matchTeamOfficials.splice(index, 1);
        } else if (index < 0) {
          matchTeamOfficials.push(data);
        } else {
          matchTeamOfficials.splice(index, 1, data);
        }
        state.matchTeamOfficials = matchTeamOfficials;
      }

      //update umpire selection
      else if (action.key === 'umpireSelect') {
        updateUmpireSelection(state, action);
        resetOtherUmpireSelections(state, action);
      } else if (action.key === 'umpireEdit') {
        updateUmpireData(state, action);
      } else if (action.key === 'clearUmpireDict') {
        clearUmpireDict(state, action.data);
      } else if (action.key === 'officialSelect') {
        const { official, sequence } = action.data;
        for (const sequence of Object.keys(state.officialSelectionDict)) {
          if (state.officialSelectionDict[sequence]?.id === official.id) {
            delete state.officialSelectionDict[sequence];
          }
        }
        state.officialSelectionDict[sequence] = official;
      } else if (action.key === 'clearOfficialDict') {
        delete state.officialSelectionDict[action.data];
      }

      //add new match
      else if (action.key === 'addMatch') {
        state.recordUmpireType = null;
        state.scorer1 = null;
        state.scorer2 = null;
        state.scorer3 = null;
        state.scorer4 = null;
        state.scorerId_1 = null;
        state.scorerId_2 = null;
        state.scorerId_3 = null;
        state.scorerId_4 = null;
        state.scorerRosterId_1 = null;
        state.scorerRosterId_2 = null;
        state.scorerRosterId_3 = null;
        state.scorerRosterId_4 = null;
        state.team1Id = null;
        state.team2Id = null;
        state.addEditMatch['divisionId'] = null;
        state.addEditMatch['mnbMatchId'] = null;
        state.addEditMatch['isFinals'] = false;
        state.addEditMatch['isLocked'] = false;
        state.addEditMatch['extraTimeType'] = null;
        state.addEditMatch['extraTimeDuration'] = null;
        state.addEditMatch['extraTimeMainBreak'] = null;
        state.addEditMatch['extraTimeBreak'] = null;
        state.addEditMatch['extraTimeWinByGoals'] = null;
        state.addEditMatch['extraTimeFor'] = null;
        state.matchData['isFinals'] = false;
        state.matchData['isLocked'] = false;
        state.matchData['extraTimeType'] = null;
        state.matchData['extraTimeDuration'] = null;
        state.matchData['extraTimeMainBreak'] = null;
        state.matchData['extraTimeBreak'] = null;
        state.matchData['extraTimeWinByGoals'] = null;
        state.matchData['extraTimeFor'] = null;
        state.umpireReserveId = null;
      } else if (action.key === 'isFinals') {
        if (action.data === true) {
          state[action.key] = action.data;
          state.addEditMatch[action.key] = action.data;
          state.matchData[action.key] = action.data;
        } else {
          state.addEditMatch['isFinals'] = false;
          state.matchData['isFinals'] = false;
          state.addEditMatch['extraTimeType'] = null;
          state.addEditMatch['extraTimeDuration'] = null;
          state.addEditMatch['extraTimeMainBreak'] = null;
          state.addEditMatch['extraTimeBreak'] = null;
          state.addEditMatch['extraTimeWinByGoals'] = null;
          state.addEditMatch['extraTimeFor'] = null;
          state.matchData['extraTimeType'] = null;
          state.matchData['extraTimeDuration'] = null;
          state.matchData['extraTimeMainBreak'] = null;
          state.matchData['extraTimeBreak'] = null;
          state.matchData['extraTimeWinByGoals'] = null;
          state.matchData['extraTimeFor'] = null;
        }
      } else if (
        action.key === 'matchDuration' ||
        action.key === 'mainBreakDuration' ||
        action.key === 'breakDuration' ||
        action.key === 'qtrBreak' ||
        action.key === 'extraTimeType' ||
        action.key === 'extraTimeDuration' ||
        action.key === 'extraTimeMainBreak' ||
        action.key === 'extraTimeBreak' ||
        action.key === 'extraTimeQtrBreak' ||
        action.key === 'extraTimeFor'
      ) {
        state[action.key] = action.data;
        state.addEditMatch[action.key] = action.data;
        state.matchData[action.key] = action.data;
        state.updateUmpireFetchCall = true;
        state.reloadAvailableUmpires = true;
      } else if (action.key === 'team1PeriodScore' || action.key === 'team2PeriodScore') {
        const period = action.contentType;
        const found = state.matchScoresData.find(x => x.period === period);
        const key = action.key.replace('Period', '');
        if (found) {
          found[key] = Number(action.data);
        } else {
          const newMatchScore = {
            matchId: state.addEditMatch.id,
            period: period,
          };
          newMatchScore[key] = Number(action.data);
          state.matchScoresData.push(newMatchScore);
        }

        let finalScore = null;
        state.matchScoresData.forEach(score => {
          if (!finalScore) {
            finalScore = score;
          } else if (score[key] && score[key] !== 0 && score.period > finalScore.period) {
            finalScore = score;
          }
        });
        state.addEditMatch[key] = finalScore[key];
        state.matchData[key] = state.addEditMatch[key];
      } else if (['team1PenaltyScore', 'team2PenaltyScore'].includes(action.key)) {
        updatePenaltyScores(state, action);
      } else {
        state[action.key] = action.data;
        state.addEditMatch[action.key] = action.data;
        state.matchData[action.key] = action.data;
      }
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_UN_END_MATCH_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_UN_END_MATCH_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_CREATE_MATCH_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_CREATE_MATCH_SUCCESS:
      // let createData = action.result;
      return {
        ...state,
        onLoad: false,
        umpireSelectionDict: {},
        umpireSearchDict: {},
        initialMatchUmpires: [],
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_COMPETITION_VENUES_LIST_SUCCESS:
      let venueCourts = generateCourtsArray(action.venues);
      state.venueData = venueCourts;
      state.courList = venueCourts;
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_CLEAR_MATCH_DATA:
      state.matchData = matchObj;
      state.addEditMatch = object;
      state.staticMatchData = object;
      return { ...state, umpireSelectionDict: {}, umpireSearchDict: {}, officialSelectionDict: {}, initialMatchUmpires: [] };

    case ApiConstants.API_LIVE_SCORE_CREATE_ROUND_LOAD:
      return { ...state, roundLoad: true };

    case ApiConstants.API_LIVE_SCORE_CREATE_ROUND_SUCCESS:
      state.roundList.push(action.result);
      state.matchData.roundId = action.result.id;
      state.addEditMatch.roundId = action.result.id;
      state.addEditMatch.round = action.result;
      state.highestSequence = action.result.sequence;
      return { ...state, roundLoad: false };

    case ApiConstants.API_GET_LIVESCOREMATCH_DETAIL_INITIATE:
      return {
        ...state,
        matchDetails: undefined,
        onLoad: true,
        matchDataLoad: true,
      };

    case ApiConstants.API_GET_LIVESCOREMATCH_DETAIL_SUCCESS:
      let team1Player = liveScoreMatchModal.getMatchViewData(action.payload.team1players);
      let team2Player = liveScoreMatchModal.getMatchViewData(action.payload.team2players);
      let match = action?.payload?.match;
      state.initialMatchUmpires = action.payload.umpires ? action.payload.umpires : [];

      //at Court Umpires
      const atCourtUmpires = action.payload.umpires.filter(
        u => u.umpireType === RECORDUMPIRETYPE.Names,
      );

      //if record umpire is users, then we only want that type in the selection.
      const umpireTypeIsUsers = getRecordUmpireType() === RECORDUMPIRETYPE.Users;
      const filteredUmpires = action.payload.umpires.filter(u =>
        umpireTypeIsUsers ? u.umpireType === RECORDUMPIRETYPE.Users : true,
      );
      populateUmpireStateData(state, filteredUmpires);
      for (const official of (action.payload.officials || [])) {
        state.officialSelectionDict[official.sequence] = {
          id: official.userId,
          sequence: official.sequence,
        };
      }

      if (match) {
        if (match.scorer1 !== null) {
          state.scorer1 = match.scorer1;
          state.scorerId_1 = match.scorer1.id;
          state.scorerRosterId_1 = match.scorer1.rosterId;
        } else {
          state.scorer1 = null;
          state.scorerId_1 = null;
          state.scorerRosterId_1 = null;
        }
        if (match.scorer2 !== null) {
          state.scorer2 = match.scorer2;
          state.scorerId_2 = match.scorer2.id;
          state.scorerRosterId_2 = match.scorer2.rosterId;
        } else {
          state.scorer2 = null;
          state.scorerId_2 = null;
          state.scorerRosterId_2 = null;
        }
        state.initialTeam1Score = match.team1Score;
        state.initialTeam2Score = match.team2Score;
        state.initialHasPenalty = !!match.hasPenalty;
        state.initialTeam1PenaltyScore = match.team1PenaltyScore;
        state.initialTeam2PenaltyScore = match.team2PenaltyScore;
      }
      return {
        ...state,
        onLoad: false,
        matchDataLoad: false,
        matchDetails: action.payload,
        team1Players: team1Player,
        team2Players: team2Player,
        atCourtUmpires,
      };

    case ApiConstants.API_GET_LIVESCOREMATCH_DETAIL_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.payload,
      };

    case ApiConstants.API_LIVE_SCORE_DELETE_MATCH_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_DELETE_MATCH_SUCCESS:
      return { ...state, onLoad: false };

    case ApiConstants.API_LIVE_SCORE_MATCH_IMPORT_LOAD:
      return {
        ...state,
        onLoad: true,
        importResult: null,
      };

    case ApiConstants.API_LIVE_SCORE_MATCH_IMPORT_SUCCESS:
      return {
        ...state,
        onLoad: false,
        importResult: action.result,
      };

    case ApiConstants.API_LIVE_SCORE_MATCH_IMPORT_WITH_DELETING_LOAD:
      return {
        ...state,
        onLoad: true,
        importResult: null,
      };

    case ApiConstants.API_LIVE_SCORE_MATCH_IMPORT_WITH_DELETING_SUCCESS:
      return {
        ...state,
        onLoad: false,
        importResult: action.result,
      };

    case ApiConstants.API_LIVE_SCORE_MATCH_IMPORT_RESET:
      return {
        ...state,
        importResult: null,
      };

    case ApiConstants.API_LIVE_SCORE_CREATE_MATCH_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_CREATE_MATCH_ERROR:
      return { ...state, onLoad: false };

    // case ApiConstants.API_LIVE_SCORE_DIVISION_LOAD:
    //     return { ...state, onLoad: true };

    // case ApiConstants.API_LIVE_SCORE_DIVISION_SUCCESS:
    //     return { ...state, onLoad: false };

    case ApiConstants.API_LIVE_SCORE_ONLY_DIVISION_SUCCESS:
      return {
        ...state,
        onLoad: false,
        divisionList: action.result,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_TEAM_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_TEAM_SUCCESS:
      state.teamResult = action.result;
      return {
        ...state,
        onLoad: false,
        teamResult: action.result,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_ROUND_LIST_LOAD:
      return { ...state, roundLoad: true };

    case ApiConstants.API_LIVE_SCORE_ROUND_LIST_SUCCESS:
      let sequenceValue = getHighestSequence(action.result);
      state.highestSequence = sequenceValue;
      let roundListArray = action.result;
      roundListArray.sort((a, b) => Number(a.sequence) - Number(b.sequence));
      state.roundList = removeDuplicateValues(roundListArray, state.addEditMatch);
      return {
        ...state,
        onLoad: false,
        status: action.status,
        roundLoad: false,
      };

    case ApiConstants.API_LIVE_SCORE_CLUB_LIST_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_CLUB_LIST_SUCCESS:
      return {
        ...state,
        onLoad: false,
        clubListData: action.result,
      };

    case ApiConstants.API_LIVE_MATCH_LOCAL_SEARCH:
      if (action.key === 'courts') {
        if (action.search.length > 0) {
          const filteredData = state.venueData.filter(item => {
            return item.name.toLowerCase().indexOf(action.search.toLowerCase()) > -1;
          });
          state.venueData = filteredData;
        } else {
          state.venueData = state.courList;
        }
      }
      return { ...state };

    case ApiConstants.API_CLEAR_ROUND_DATA:
      if (action.key === 'all') {
        state.roundList = [];
        state.divisionList = [];
      } else {
        state.roundList = [];
      }
      return { ...state };

    case ApiConstants.API_LADDER_SETTING_MATCH_RESULT_SUCCESS:
      return {
        ...state,
        onLoad: false,
        matchResult: action.result,
        error: null,
        state: action.status,
      };

    case ApiConstants.CHANGE_PLAYER_LINEUP_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_CHANGE_LINEUP_STATUS_SUCCESS:
      let lineup = state[action.key][action.index]['lineup'];
      let resultList = action.result;
      let playerId = state[action.key][action.index].playerId;
      if (action.key === 'team1Players' || action.key === 'team2Players') {
        assignLineups(playerId, lineup, resultList);
      }
      return {
        ...state,
        onLoad: false,
        error: null,
        state: action.status,
      };

    case ApiConstants.CHANGE_BULK_MATCH_SCORE:
      let matchListArray = JSON.parse(JSON.stringify(state.liveScoreMatchListData));
      matchListArray[action.index][action.key] = action.value;
      state.liveScoreMatchListData = matchListArray;
      return {
        ...state,
        onLoad: false,
        error: null,
        state: action.status,
      };

    case ApiConstants.BULK_SCORE_UPDATE_LOAD:
      return { ...state, onLoad: true, onUpdateBulkScore: true };

    case ApiConstants.BULK_SCORE_UPDATE_SUCCESS:
      let matchUpdatedList = state.liveScoreMatchListData;
      state.liveScoreBulkScoreList = matchUpdatedList;
      return {
        ...state,
        onLoad: false,
        onUpdateBulkScore: false,
        status: action.status,
      };

    case ApiConstants.BULK_SCORE_UPDATE_CANCEL:
      state.liveScoreMatchListData = state.liveScoreBulkScoreList;
      return { ...state, onLoad: false, onUpdateBulkScore: false };

    case ApiConstants.API_ADD_LIVE_STREAM_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_ADD_LIVE_STREAM_SUCCESS:
      state.matchDetails.match.livestreamURL = action.result.livestreamURL;
      return { ...state, onLoad: false };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.matchListActionObject = null;
      return { ...state, onLoad: false };

    case ApiConstants.API_GET_REF_BADGE_SUCCESS:
      state.accreditation = action.result;
      return {
        ...state,
        onLoad: false,
      };
    case ApiConstants.RESET_UMPIRE_LIST_BOOL:
      return {
        ...state,
        updateUmpireFetchCall: false,
      };

    case ApiConstants.SET_LIVE_SCORE_MATCH_LIST_PAGE_SIZE:
      return {
        ...state,
        liveScoreMatchListPageSize: action.pageSize,
      };

    case ApiConstants.SET_LIVE_SCORE_MATCH_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        liveScoreMatchListPage: action.pageNum,
      };

    case ApiConstants.API_GET_LIVE_SCORE_IS_LOCKED_MATCH_LOAD:
      return {
        ...state,
        onLoadMatch: true,
      };

    case ApiConstants.API_GET_LIVE_SCORE_IS_LOCKED_MATCH_SUCCESS:
      return {
        ...state,
        onLoadMatch: false,
        lockedMatch: action.result,
      };

    case ApiConstants.CLEAR_LIVE_SCORE_IS_LOCKED_MATCH_LIST: {
      return {
        ...state,
        lockedMatch: false,
      };
    }

    case ApiConstants.API_MEDIA_REPORT_EXPORT_FILE_LOAD: {
      return {
        ...state,
        exportingReport: true,
      };
    }

    case ApiConstants.API_MEDIA_REPORT_EXPORT_FILE_SUCCESS: {
      return {
        ...state,
        exportingReport: false,
      };
    }

    case ApiConstants.API_MEDIA_REPORT_EXPORT_FILE_FAILED: {
      return {
        ...state,
        exportingReport: false,
      };
    }
    case ApiConstants.API_LIVE_SCORE_COMP_BEST_POINT_LIST:
      return {
        ...state,
        loading: true,
        bestPlayerPoints: null,
      };
    case ApiConstants.API_LIVE_SCORE_COMP_BEST_POINT_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        bestPlayerPoints: action.payload,
      };
    case ApiConstants.API_LIVE_SCORE_COMP_BEST_POINT_LIST_ERROR:
      return {
        ...state,
        loading: false,
      };

    case ApiConstants.API_LIVE_SCORE_COMP_BEST_POINT_UPDATE:
      return {
        ...state,
        loading: false,
        bestPlayerPoints: action.payload,
      };
    case ApiConstants.API_LIVE_SCORE_COMP_BEST_POINT_SAVE:
      return {
        ...state,
        loading: true,
      };
    case ApiConstants.API_LIVE_SCORE_COMP_BEST_POINT_UPDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        bestPlayerPoints: action.payload,
      };
    case ApiConstants.API_LIVE_SCORE_COMP_BEST_POINT_UPDATE_ERROR:
      return {
        ...state,
        loading: false,
      };

    case ApiConstants.API_LIVE_SCORE_UPDATE_MATCH_SCORE:
      //Update match score
      const comp = JSON.parse(getLiveScoreCompetition());
      const canCalculateScores = isBasketball ? true : comp ? comp.recordGoalAttempts : false;
      if (!canCalculateScores) {
        return state;
      }
      const { actions, teamAttendance } = action.payload;
      const matchDetails = state.matchDetails;
      if (matchDetails && matchDetails.match) {
        const match = matchDetails.match;

        if (match.team1ResultId !== null) {
          if (
            match.team1ResultId === 4 ||
            match.team1ResultId === 6 ||
            match.team1ResultId === 8 ||
            match.team1ResultId === 9
          ) {
            return state;
          }
        }

        //Filter actions for score.
        let playerActions = null;
        if (isBasketball) {
          playerActions = actions.filter(
            act =>
              act.gameStatId === GameStats.Ftm &&
              (act.value === ValueKind.FTM ||
                act.value === ValueKind.PM2 ||
                act.value === ValueKind.PM3) &&
              isNotNullAndUndefined(act.actionCount),
          );
        } else {
          playerActions = actions.filter(
            act =>
              [GameStats.Goals, GameStats.goal, GameStats.ownGoal, GameStats.penalty].includes(
                act.gameStatId,
              ) && isNotNullAndUndefined(act.actionCount),
          );
        }

        const calculateTeamScore = teamId => {
          return playerActions
            .filter(act => {
              const isOwnGoal = act.gameStatId === GameStats.ownGoal;
              return (
                !act.isDeleted &&
                act.gameStatId !== GameStats.penalty &&
                ((act.teamId === teamId && !isOwnGoal) || (act.teamId !== teamId && isOwnGoal))
              );
            })
            .reduce((prev, act) => prev + Number(act.value * act.actionCount), 0);
        };
        const calculateTeamPenaltyScore = teamId => {
          const penaltyActions = playerActions.filter(act => {
            return !act.isDeleted && act.gameStatId === GameStats.penalty && act.teamId === teamId;
          });
          if (penaltyActions.length) {
            return penaltyActions.reduce(
              (prev, act) => prev + Number(act.value * act.actionCount),
              0,
            );
          } else {
            return null;
          }
        };

        //regular team scores
        match.team1Score =
          playerActions.length === 0 && !teamAttendance
            ? state.initialTeam1Score
            : calculateTeamScore(match.team1Id);
        match.team2Score =
          playerActions.length === 0 && !teamAttendance
            ? state.initialTeam2Score
            : calculateTeamScore(match.team2Id);

        //penalty scores
        match.team1PenaltyScore =
          playerActions.length === 0 && !teamAttendance
            ? state.initialTeam1PenaltyScore
            : calculateTeamPenaltyScore(match.team1Id);
        match.team2PenaltyScore =
          playerActions.length === 0 && !teamAttendance
            ? state.initialTeam2PenaltyScore
            : calculateTeamPenaltyScore(match.team2Id);

        if (
          isNotNullAndUndefined(match.team1PenaltyScore) ||
          isNotNullAndUndefined(match.team2PenaltyScore)
        ) {
          match.hasPenalty = true;
          //if one of the penalty scores is null, set it to 0 instead
          match.team1PenaltyScore = isNullOrUndefined(match.team1PenaltyScore)
            ? 0
            : match.team1PenaltyScore;
          match.team2PenaltyScore = isNullOrUndefined(match.team2PenaltyScore)
            ? 0
            : match.team2PenaltyScore;
        } else {
          match.hasPenalty = false;
        }

        return {
          ...state,
        };
      } else {
        return state;
      }

    case ApiConstants.API_LIVE_SCORE_ACTIVATE_FINALS:
      return {
        ...state,
        onLoadMatch: true,
        activateFinals: false,
      };

    case ApiConstants.API_LIVE_SCORE_ACTIVATE_FINALS_SUCCESS:
      return {
        ...state,
        onLoadMatch: false,
        activateFinals: true,
      };

    case ApiConstants.API_LIVE_SCORE_ACTIVATE_FINALS_FAIL:
    case ApiConstants.API_LIVE_SCORE_ACTIVATE_FINALS_ERROR:
      return {
        ...state,
        onLoadMatch: false,
        activateFinals: true,
      };

    case ApiConstants.API_LIVE_SCORE_ACTIVATE_FINALS_RESET:
      return {
        ...state,
        activateFinals: false,
      };

    case ApiConstants.API_LIVE_SCORE_FINALISE_MATCH_RESULT_LOAD:
      return {
        ...state,
        finaliseResultLoad: true,
      };
    case ApiConstants.API_LIVE_SCORE_FINALISE_MATCH_RESULT_SUCCESS:
      return {
        ...state,
        finaliseResultLoad: false,
      };
    case ApiConstants.API_LIVE_SCORE_FINALISE_MATCH_RESULT_FAIL:
      return {
        ...state,
        finaliseResultLoad: false,
      };

    case ApiConstants.API_LIVE_SCORE_PLAYER_MINUTE_RECORD_LOAD:
      return {
        ...state,
        team1Players: [],
        team2Players: [],
      };

    case ApiConstants.API_LIVE_SCORE_MATCH_TEAM_OFFICIAL_LOAD:
      return {
        ...state,
        loadMatchTeamOfficials: true,
      };

    case ApiConstants.API_LIVE_SCORE_MATCH_TEAM_OFFICIAL_SUCCESS:
      return {
        ...state,
        matchTeamOfficials: action.result,
      };

    default:
      return state;
  }
}

export default liveScoreMatchReducer;
