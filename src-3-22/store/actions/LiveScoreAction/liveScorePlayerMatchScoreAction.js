import ApiConstants from 'themes/apiConstants';

function liveScorePlayerActionsLoadAction(matchId, teamIds) {
  return {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_ACTION_LIST_LOAD,
    matchId,
    teamIds,
  };
}

function liveScoreUpdatePlayerScoreAction() {
  return {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_ACTION_UPDATE,
  };
}

function liveScoreUpdateMatchScoreAction(payload) {
  return {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_MATCH_SCORE,
    payload,
  };
}

function liveScorePlayerScoreUpdateAction(payload) {
  return {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_SCORE_UPDATE,
    payload,
  };
}

function liveScorePlayerScoreAddAction(payload) {
  return {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_SCORE_ADD,
    payload,
  };
}

function liveScoreClearTeamActions(data) {
  return {
    type: ApiConstants.API_LIVE_SCORE_CLEAR_TEAM_ACTIONS,
    data,
  };
}

function liveScorePlayerScoreInitializeAction() {
  return {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_SCORE_INITIALIZE,
  };
}

function liveScorePlayerBasketballScoreUpdateAction(payload) {
  return {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_BASKETBALL_SCORE_UPDATE,
    payload,
  };
}

function liveScorePlayerBasketballScoreAddAction(payload) {
  return {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_BASKETBALL_SCORE_ADD,
    payload,
  };
}

function liveScoreSetLinkedActions(payload) {
  return {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_SET_LINKED_ACTIONS,
    payload,
  };
}

export {
  liveScorePlayerActionsLoadAction,
  liveScoreUpdatePlayerScoreAction,
  liveScoreUpdateMatchScoreAction,
  liveScorePlayerScoreAddAction,
  liveScoreClearTeamActions,
  liveScorePlayerScoreUpdateAction,
  liveScorePlayerBasketballScoreUpdateAction,
  liveScorePlayerBasketballScoreAddAction,
  liveScorePlayerScoreInitializeAction,
  liveScoreSetLinkedActions,
};
