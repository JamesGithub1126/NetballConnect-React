import ApiConstants from '../../../themes/apiConstants';

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  teamAttendanceResult: [],
  teamAttendanceList: [],
  teamAttendancePage: 0,
  teamAttendanceTotalCount: 0,
  bestPlayerPointResult: [],
  bestPlayerPointList: [],
  bestPlayerPointPage: 0,
  bestPlayerPointTotalCount: 0,
  divisionList: [],
  highestSequence: null,
  roundLoad: false,
  roundList: [],
  onDivisionLoad: false,
  teamAttendanceListActionObject: null,
};

function getHighestSequence(roundArr) {
  let sequence = [];

  for (let i in roundArr) {
    sequence.push(roundArr[i].sequence);
  }

  return Math.max.apply(null, sequence);
}

// Remove duplicate rounds names

function removeDuplicateValues(array) {
  return array.filter(
    (obj, index, self) => index === self.findIndex(el => el['name'] === obj['name']),
  );
}

function liveScoreTeamAttendanceState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_TEAM_ATTENDANCE_LIST_LOAD:
      state.teamAttendanceResult = [];
      state.teamAttendanceListActionObject = action;
      return {
        ...state,
        onLoad: true,
      };
    case ApiConstants.API_LIVE_SCORE_TEAM_ATTENDANCE_LIST_SUCCESS:
      state.teamAttendanceResult = action.result.stats;
      return {
        ...state,
        onLoad: false,
        status: action.status,
        teamAttendancePage: action.result.page.currentPage,
        teamAttendanceTotalCount: action.result.page.totalCount,
      };
    case ApiConstants.API_LIVE_SCORE_TEAM_ATTENDANCE_FAIL:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: action.error,
      };
    case ApiConstants.API_LIVE_SCORE_TEAM_ATTENDANCE_ERROR:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: action.error,
      };

    case ApiConstants.API_LIVE_SCORE_BEST_PLAYER_POINT_LIST_LOAD:
      state.bestPlayerPointResult = [];
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_LIVE_SCORE_BEST_PLAYER_POINT_LIST_SUCCESS:
      state.bestPlayerPointResult = action.result.stats;
      return {
        ...state,
        onLoad: false,
        status: action.status,
        bestPlayerPointPage: action.result.page.currentPage,
        bestPlayerPointTotalCount: action.result.page.totalCount,
      };
    case ApiConstants.API_LIVE_SCORE_BEST_PLAYER_POINT_FAIL:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: action.error,
      };
    case ApiConstants.API_LIVE_SCORE_BEST_PLAYER_POINT_ERROR:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: action.error,
      };

    case ApiConstants.API_LIVE_SCORE_ONLY_DIVISION_LOAD:
      return { ...state, onDivisionLoad: true };

    case ApiConstants.API_LIVE_SCORE_ONLY_DIVISION_SUCCESS:
      return {
        ...state,
        onDivisionLoad: false,
        divisionList: action.result,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_ROUND_LIST_LOAD:
      return { ...state, roundLoad: true };

    case ApiConstants.API_LIVE_SCORE_ROUND_LIST_SUCCESS:
      let sequenceValue = getHighestSequence(action.result);
      state.highestSequence = sequenceValue;
      let roundListArray = action.result;
      roundListArray.sort((a, b) => Number(a.sequence) - Number(b.sequence));
      state.roundList = removeDuplicateValues(roundListArray);
      return {
        ...state,
        onLoad: false,
        status: action.status,
        roundLoad: false,
      };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.teamAttendanceListActionObject = null;
      return { ...state, onLoad: false };

    default:
      return state;
  }
}

export default liveScoreTeamAttendanceState;
