import ApiConstants from '../../../themes/apiConstants';

function getLiveScoreGamePositionsList(sportRefId) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_GET_GAME_POSITION_LIST_LOAD,
    sportRefId: sportRefId,
  };

  return action;
}

function getLiveScoreGameStatsList(sportRefId, getDeleted) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_GET_GAME_STATS_LIST_LOAD,
    sportRefId: sportRefId,
    getDeleted: getDeleted,
  };

  return action;
}

export { getLiveScoreGamePositionsList, getLiveScoreGameStatsList };
