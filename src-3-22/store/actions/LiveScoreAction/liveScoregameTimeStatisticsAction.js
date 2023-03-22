import ApiConstants from '../../../themes/apiConstants';

function gameTimeStatisticsListAction(
  competitionId,
  aggregate,
  offset,
  limit,
  searchText,
  sortBy,
  sortOrder,
  isParent,
  compOrgId,
) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_GAME_TIME_STATISTICS_LIST_LOAD,
    competitionId,
    aggregate: aggregate,
    offset,
    limit,
    searchText,
    sortBy,
    sortOrder,
    isParent: isParent,
    compOrgId,
  };

  return action;
}

function setPageSizeAction(pageSize) {
  const action = {
    type: ApiConstants.SET_LIVE_SCORE_GAME_TIME_LIST_PAGE_SIZE,
    pageSize,
  };

  return action;
}

function setPageNumberAction(pageNum) {
  const action = {
    type: ApiConstants.SET_LIVE_SCORE_GAME_TIME_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };

  return action;
}

export { gameTimeStatisticsListAction, setPageSizeAction, setPageNumberAction };
