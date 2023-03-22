import ApiConstants from '../../../themes/apiConstants';

function liveScoreExportGameAttendanceAction(matchId, teamId, payload) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_EXPORT_ATTENDANCE_LOAD,
    matchId,
    teamId,
    payload,
  };

  return action;
}

function liveScoreGameAttendanceListAction(matchId, teamId = null) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_GAME_ATTENDANCE_LIST_LOAD,
    matchId,
    teamId,
  };

  return action;
}

export { liveScoreExportGameAttendanceAction, liveScoreGameAttendanceListAction };
