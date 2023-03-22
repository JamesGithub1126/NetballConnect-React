import ApiConstants from '../../../themes/apiConstants';

function liveScoreRoundListAction(competitionID, divisionId, isParent, compOrgId) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_ROUND_LIST_LOAD,
    competitionID,
    divisionId,
    isParent,
    compOrgId,
  };
  return action;
}

function liveScoreCreateRoundAction(roundName, sequence, competitionID, divisionId) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_CREATE_ROUND_LOAD,
    roundName: roundName,
    sequence: sequence,
    competitionID: competitionID,
    divisionId,
  };
  return action;
}

function clearRoundData() {
  const action = {
    type: ApiConstants.API_CLEAR_ROUND_DATA,
  };
  return action;
}

function liveScoreExcludedRoundListAction(competitionId) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_EXCLUDED_ROUND_LIST_LOAD,
    competitionId,
  };
  return action;
}

export { liveScoreRoundListAction, liveScoreCreateRoundAction, clearRoundData, liveScoreExcludedRoundListAction };
