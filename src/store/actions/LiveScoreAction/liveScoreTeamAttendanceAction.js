import ApiConstants from '../../../themes/apiConstants';

function liveScoreTeamAttendanceListAction(
  competitionId,
  body,
  select_status,
  divisionId,
  roundId,
  isParent,
  compOrgId,
) {
  return {
    type: ApiConstants.API_LIVE_SCORE_TEAM_ATTENDANCE_LIST_LOAD,
    competitionId,
    body,
    select_status,
    divisionId,
    roundId,
    isParent,
    compOrgId,
  };
}

export { liveScoreTeamAttendanceListAction };
