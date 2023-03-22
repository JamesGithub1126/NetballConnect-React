import ApiConstants from 'themes/apiConstants';

function getUmpireDashboardList(data) {
  return {
    type: ApiConstants.API_GET_UMPIRE_DASHBOARD_LIST_LOAD,
    data,
  };
}

function getUmpireDashboardVenueList(compId) {
  return {
    type: ApiConstants.API_GET_UMPIRE_DASHBOARD_VENUE_LIST_LOAD,
    compId,
  };
}

function getUmpireDashboardDivisionList(competitionID) {
  return {
    type: ApiConstants.API_GET_UMPIRE_DASHBOARD_DIVISION_LIST_LOAD,
    competitionID,
  };
}

export function getUmpireDashboardCompetitionOrganisationsList(competitionId) {
  return {
    type: ApiConstants.API_GET_UMPIRE_COMPETITION_ORGANISATIONS_LIST_LOAD,
    competitionId,
  };
}

function umpireDashboardImportAction(data) {
  return {
    type: ApiConstants.API_UMPIRE_IMPORT_LOAD,
    data,
  };
}

function umpireDashboardResetImportResultAction() {
  return {
    type: ApiConstants.API_UMPIRE_IMPORT_RESET,
  };
}

function umpireRoundListAction(competitionID, divisionId) {
  return {
    type: ApiConstants.API_UMPIRE_ROUND_LIST_LOAD,
    competitionID,
    divisionId,
  };
}

function umpireDashboardUpdate(data) {
  return {
    type: ApiConstants.UPDATE_UMPIRE_DASHBOARD,
    data,
  };
}

function setPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_UMPIRE_DASHBOARD_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_UMPIRE_DASHBOARD_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

function publishUmpireAllocation(data) {
  return {
    type: ApiConstants.API_PUBLISH_UMPIRE_ALLOCATION_LOAD,
    data,
  };
}

function umpireYearChangedAction() {
  return {
    type: ApiConstants.API_UMPIRE_YEAR_CHANGED,
  };
}

function saveBlockDeclineAction(data) {
  return {
    type: ApiConstants.API_LIVE_SCORE_SAVE_BLOCK_DECLINE_LOAD,
    data,
  };
}

function findSaveUsersData(data) {
  return {
    type: ApiConstants.API_LIVE_SCORE_SAVE_BLOCK_DECLINE_DATA_GET_LOAD,
    data,
  };
}
function clearBlockDeclineData() {
  return {
    type: ApiConstants.API_LIVE_SCORE_CLEAR_BLOCK_DECLINE,
  };
}

export {
  getUmpireDashboardList,
  getUmpireDashboardVenueList,
  getUmpireDashboardDivisionList,
  umpireDashboardImportAction,
  umpireDashboardResetImportResultAction,
  umpireRoundListAction,
  umpireDashboardUpdate,
  setPageSizeAction,
  setPageNumberAction,
  publishUmpireAllocation,
  umpireYearChangedAction,
  saveBlockDeclineAction,
  findSaveUsersData,
  clearBlockDeclineData,
};
