import ApiConstants from 'themes/apiConstants';

function liveScoreCoachListAction(
  roleId,
  entityId,
  search,
  offset,
  limit,
  sortBy,
  sortOrder,
  isParent,
  competitionId,
) {
  return {
    type: ApiConstants.API_LIVE_SCORE_COACH_LIST_LOAD,
    roleId,
    entityId,
    search,
    offset,
    limit,
    sortBy,
    sortOrder,
    isParent,
    competitionId,
  };
}

function liveScoreUpdateCoach(data, key) {
  return {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_COACH,
    data,
    key,
  };
}

function liveScoreAddEditCoach(data, teamId, existingManagerId, compOrgId, isParent) {
  return {
    type: ApiConstants.API_LIVE_SCORE_ADD_EDIT_COACH_LOAD,
    data,
    teamId,
    existingManagerId,
    compOrgId,
    isParent,
  };
}

function liveScoreCoachSearch(data, competitionId) {
  return {
    type: ApiConstants.API_LIVESCORE_COACH_SEARCH_LOAD,
    data,
    competitionId,
  };
}

function liveScoreClear() {
  return {
    type: ApiConstants.CLEAR_LIVESCORE_MANAGER,
  };
}

function liveScoreCoachImportAction(payload) {
  return {
    type: ApiConstants.API_LIVE_SCORE_COACH_IMPORT_LOAD,
    payload,
  };
}

function liveScoreCoachResetImportResultAction() {
  return {
    type: ApiConstants.API_LIVE_SCORE_COACH_IMPORT_RESET,
  };
}

function setPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_LIVE_SCORE_COACHES_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_LIVE_SCORE_COACHES_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

export {
  liveScoreUpdateCoach,
  liveScoreCoachListAction,
  liveScoreAddEditCoach,
  liveScoreCoachSearch,
  liveScoreClear,
  liveScoreCoachImportAction,
  liveScoreCoachResetImportResultAction,
  setPageSizeAction,
  setPageNumberAction,
};
