import ApiConstants from '../../../themes/apiConstants';

const initialState = {
  onLoad: false,
  error: null,
  result: null,
  status: 0,
  exported: false,
};

function liveScoreGameAttendanceState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_EXPORT_ATTENDANCE_LOAD:
      return {
        ...state,
        onLoad: true,
        exported: false,
      };

    case ApiConstants.API_LIVE_SCORE_EXPORT_ATTENDANCE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        exported: true,
      };

    case ApiConstants.API_LIVE_SCORE_GAME_ATTENDANCE_LIST_LOAD:
      return {
        ...state,
        onLoad: true,
        gameAttendanceList: action.result,
      };

    case ApiConstants.API_LIVE_SCORE_GAME_ATTENDANCE_LIST_SUCCESS:
      return {
        ...state,
        onLoad: false,
        gameAttendanceList: action.result,
      };

    case ApiConstants.API_LIVE_SCORE_GAME_ATTENDANCE_FAIL:
      return {
        ...state,
        onLoad: false,
        exported: false,
      };

    case ApiConstants.API_LIVE_SCORE_GAME_ATTENDANCE_ERROR:
      return {
        ...state,
        onLoad: false,
        exported: false,
      };

    case ApiConstants.API_LIVE_SCORE_PLAYER_MINUTE_RECORD_SUCCESS:
      return {
        ...state,
      };
    default:
      return state;
  }
}

export default liveScoreGameAttendanceState;
