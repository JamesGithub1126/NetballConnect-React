import ApiConstants from 'themes/apiConstants';

function liveScorePlayerListAction(competitionID, teamId) {
  return {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_LIST_LOAD,
    competitionID,
    teamId,
  };
}

function liveScorePlayerListSearchAction(competitionId, competitionOrganisationId, matchId, name) {
  return {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_LIST_SEARCH_LOAD,
    competitionId,
    competitionOrganisationId,
    matchId,
    name,
  };
}

function liveScoreUpdatePlayerSearchResult(data, key) {
  return {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_SEARCH_RESULT_UPDATE,
    data,
    key,
  };
}

function liveScoreUpdatePlayerDataAction(data, key) {
  return {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_PLAYER,
    data,
    key,
  };
}

function liveScoreAddEditPlayerAction(data, playerId, propsData) {
  return {
    type: ApiConstants.API_LIVE_SCORE_ADD_EDIT_PLAYER_LOAD,
    data,
    playerId,
    propsData,
  };
}

function liveScoreDeletePlayerAction(playerId, playerListActionObject) {
  return {
    type: ApiConstants.API_LIVE_SCORE_DELETE_PLAYER_LOAD,
    playerId,
    playerListActionObject,
  };
}

function liveScorePlayerImportAction(competitionID, csvFile, key) {
  return {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_IMPORT_LOAD,
    competitionID,
    csvFile,
    key,
  };
}

function liveScorePlayerResetImportResultAction() {
  return {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_IMPORT_RESET,
  };
}

// Player list with pagination
function playerListWithPaginationAction(
  competitionID,
  offset,
  limit,
  search,
  sortBy,
  sortOrder,
  isParent,
  competitionOrganisationId,
) {
  return {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_LIST_PAGINATION_LOAD,
    competitionID,
    offset,
    limit,
    search,
    sortBy,
    sortOrder,
    isParent,
    competitionOrganisationId,
  };
}

function setPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_LIVE_SCORE_PLAYER_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_LIVE_SCORE_PLAYER_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

export {
  liveScorePlayerListAction,
  liveScoreAddEditPlayerAction,
  liveScoreUpdatePlayerDataAction,
  liveScorePlayerImportAction,
  liveScorePlayerListSearchAction,
  liveScorePlayerResetImportResultAction,
  playerListWithPaginationAction,
  liveScoreDeletePlayerAction,
  setPageSizeAction,
  setPageNumberAction,
  liveScoreUpdatePlayerSearchResult,
};
