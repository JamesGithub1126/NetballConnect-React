import ApiConstants from '../../../themes/apiConstants';

//Goals action
function liveScoreGoalListAction({
 competitionID,
 goalType,
 search,
 offset,
 limit,
 sortBy,
 sortOrder,
 divisionId,
 roundId,
 isParent,
 compOrgId,
 sportRefId,
 isEnhanced = false,
 selectedStats,
}) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_GOAL_LIST_LOAD,
    competitionID: competitionID,
    selectedStats,
    goalType,
    search,
    offset,
    limit,
    sortBy,
    sortOrder,
    divisionId,
    roundId,
    isParent,
    compOrgId,
    sportRefId,
    isEnhanced,
  };

  return action;
}

function liveScorePlayerStatisticsListAction(
  competitionID,
  goalType,
  search,
  offset,
  limit,
  sortBy,
  sortOrder,
  isParent,
  compOrgId,
  sportRefId,
) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_GOAL_LIST_BY_PLAYER_LOAD,
    competitionID: competitionID,
    goalType,
    search,
    offset,
    limit,
    sortBy,
    sortOrder,
    isParent,
    compOrgId,
    sportRefId,
  };

  return action;
}

function setPageSizeAction(pageSize) {
  const action = {
    type: ApiConstants.SET_LIVE_SCORE_GOALS_LIST_PAGE_SIZE,
    pageSize,
  };

  return action;
}

function setPageNumberAction(pageNum) {
  const action = {
    type: ApiConstants.SET_LIVE_SCORE_GOALS_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };

  return action;
}

export {
  liveScoreGoalListAction,
  liveScorePlayerStatisticsListAction,
  setPageSizeAction,
  setPageNumberAction,
};
