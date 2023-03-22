import ApiConstants from '../../../themes/apiConstants';

function liveScoreBestPlayerPointListAction(
  competitionId,
  body,
  select_status,
  divisionId,
  roundName,
  compOrgId,
  typeRefId,
) {
  return {
    type: ApiConstants.API_LIVE_SCORE_BEST_PLAYER_POINT_LIST_LOAD,
    competitionId,
    body,
    select_status,
    divisionId,
    roundName,
    compOrgId,
    typeRefId,
  };
}

export { liveScoreBestPlayerPointListAction };
