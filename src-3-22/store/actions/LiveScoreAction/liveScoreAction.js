import ApiConstants from '../../../themes/apiConstants';

function liveScorePlayerListAction(competitionID) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_LIST_LOAD,
    competitionID: competitionID,
  };

  return action;
}

function getliveScoreScorerList(competitionId, roleId, screenKey) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_GET_SCORER_LIST_LOAD,
    competitionId,
    roleId,
    screenKey,
  };

  return action;
}

function getliveScoreAvailableScorerList(data) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_GET_AVAILABLE_SCORER_LIST_LOAD,
    data,
  };

  return action;
}

function liveScoreClearScorerList() {
  const action = {
    type: ApiConstants.LIVE_SCORE_CLEAR_SCORER_LIST,
  };
  return action;
}

function liveScoreClearOfficeList(roleId, entityId) {
  const action = {
    type: ApiConstants.LIVE_SCORE_CLEAR_OFFICIAL_LIST,
    roleId,
    entityId,
  };
  return action;
}

export {
  liveScorePlayerListAction,
  getliveScoreScorerList,
  getliveScoreAvailableScorerList,
  liveScoreClearScorerList,
  liveScoreClearOfficeList,
};
