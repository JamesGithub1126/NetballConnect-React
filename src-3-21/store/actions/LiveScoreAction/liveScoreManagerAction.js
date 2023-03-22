import ApiConstants from 'themes/apiConstants';
// Division action
function liveScoreAddEditManager(data, compOrgId, isParent) {
  return {
    type: ApiConstants.API_LIVE_SCORE_ADD_EDIT_MANAGER_LOAD,
    data,
    compOrgId,
    isParent,
  };
}

// Manager list action
function liveScoreManagerListAction(
  roleId,
  entityTypeId,
  entityId,
  searchText,
  offset,
  sortBy,
  sortOrder,
  key,
  compOrgId,
  isParent,
  limit,
) {
  return {
    type: ApiConstants.API_LIVE_SCORE_MANAGER_LIST_LOAD,
    roleId,
    entityTypeId,
    entityId,
    searchText,
    offset,
    sortBy,
    sortOrder,
    key,
    compOrgId,
    isParent,
    limit,
  };
}

// Manager list action
function liveScoreUpdateManagerDataAction(data, key) {
  return {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_MANAGER_DATA,
    data,
    key,
  };
}

function liveScoreManagerFilter(payload) {
  return {
    type: ApiConstants.API_LIVESCORE_MANAGER_FILTER,
    payload,
  };
}

function liveScoreClear() {
  return {
    type: ApiConstants.CLEAR_LIVESCORE_MANAGER,
  };
}

function liveScoreManagerSearch(data, competitionOrgId, roleId) {
  return {
    type: ApiConstants.API_LIVESCORE_MANAGER_SEARCH_LOAD,
    data,
    competitionOrgId,
    roleId,
  };
}

function liveScoreManagerImportAction(payload) {
  return {
    type: ApiConstants.API_LIVE_SCORE_MANAGER_IMPORT_LOAD,
    payload,
  };
}

function liveScoreManagerResetImportResultAction() {
  return {
    type: ApiConstants.API_LIVE_SCORE_MANAGER_IMPORT_RESET,
  };
}

function clearListAction() {
  return {
    type: ApiConstants.API_LIVE_SCORE_CLEAR_LIST,
  };
}

function setPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_LIVE_SCORE_MANAGER_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_LIVE_SCORE_MANAGER_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

export {
  liveScoreAddEditManager,
  liveScoreManagerListAction,
  liveScoreUpdateManagerDataAction,
  liveScoreManagerFilter,
  liveScoreClear,
  liveScoreManagerSearch,
  liveScoreManagerImportAction,
  liveScoreManagerResetImportResultAction,
  clearListAction,
  setPageSizeAction,
  setPageNumberAction,
};
