import ApiConstants from 'themes/apiConstants';

function liveScoreMatchListAction(
  competitionID,
  start,
  offset,
  limit,
  search,
  divisionId,
  roundName,
  teamIds,
  sortBy,
  sortOrder,
  competitionOrganisationId,
  from = null,
  to = null,
) {
  return {
    type: ApiConstants.API_LIVE_SCORE_MATCH_LIST_LOAD,
    competitionID,
    start,
    offset,
    limit,
    search,
    divisionId,
    roundName,
    teamIds,
    sortBy,
    sortOrder,
    competitionOrganisationId,
    from,
    to,
  };
}

function liveScoreAddEditMatchAction(matchId) {
  return {
    type: ApiConstants.API_LIVE_SCORE_ADD_EDIT_MATCH_LOAD,
    matchId,
  };
}

function liveScoreAddEditMatchScoresAction(matchId) {

  return {
    type: ApiConstants.API_LIVE_SCORE_ADD_EDIT_MATCH_SCORES_LOAD,
    matchId,
  };
}

function liveScoreAddMatchAction() {
  return {
    type: ApiConstants.API_LIVE_SCORE_ADD_MATCH,
  };
}

function liveScoreUpdateMatchAction(data, key, contentType) {
  return {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_MATCH,
    data,
    key,
    contentType,
  };
}

function liveScoreUnEndMatchAction(id) {
  return {
    type: ApiConstants.API_LIVE_SCORE_UN_END_MATCH_LOAD,
    id,
  };
}

function liveScoreGetMatchTeamOfficials(matchId) {
  return {
    type: ApiConstants.API_LIVE_SCORE_MATCH_TEAM_OFFICIAL_LOAD,
    matchId,
  };
}

function liveScoreCreateMatchAction(
  data,
  competitionId,
  key,
  isEdit,
  team1resultId,
  team2resultId,
  matchStatus,
  endTime,
  umpireKey,
  umpireArr,
  scorerData,
  recordUmpireType,
  screenName,
  competitionOrganisationId,
  matchScoresData,
  canRegenLadderPoints,
  matchTeamOfficials,
  officialData,
) {
  return {
    type: ApiConstants.API_LIVE_SCORE_CREATE_MATCH_LOAD,
    data,
    competitionId,
    key,
    isEdit,
    team1resultId,
    team2resultId,
    matchStatus,
    endTime,
    umpireKey,
    umpireArr,
    scorerData,
    recordUmpireType,
    screenName,
    competitionOrganisationId,
    matchScoresData,
    canRegenLadderPoints,
    matchTeamOfficials,
    officialData,
  };
}

function clearMatchAction() {
  return {
    type: ApiConstants.API_LIVE_SCORE_CLEAR_MATCH_DATA,
  };
}

function liveScoreDeleteMatch(matchId) {
  return {
    type: ApiConstants.API_LIVE_SCORE_DELETE_MATCH_LOAD,
    matchId,
  };
}

function getCompetitionVenuesList(competitionID, searchValue) {
  return {
    type: ApiConstants.API_LIVE_SCORE_COMPETITION_VENUES_LIST_LOAD,
    competitionID,
    searchValue,
  };
}

function liveScoreMatchImportAction(competitionID, csvFile) {
  return {
    type: ApiConstants.API_LIVE_SCORE_MATCH_IMPORT_LOAD,
    competitionID,
    csvFile,
  };
}

function liveScoreMatchImportWithDeletingAction(competitionID, csvFile, isWithDeleting) {
  return {
    type: ApiConstants.API_LIVE_SCORE_MATCH_IMPORT_WITH_DELETING_LOAD,
    competitionID,
    csvFile,
    isWithDeleting,
  };
}

function liveScoreMatchResetImportResultAction() {
  return {
    type: ApiConstants.API_LIVE_SCORE_MATCH_IMPORT_RESET,
  };
}

function liveScoreGetMatchDetailInitiate(data, isLineup) {
  return {
    type: ApiConstants.API_GET_LIVESCOREMATCH_DETAIL_INITIATE,
    payload: data,
    isLineup: isLineup,
  };
}

function otherOfficialListAction(competitionId) {
  return {
    type: ApiConstants.API_OTHER_OFFICIAL_LIST_LOAD,
    payload: competitionId,
  };
}

function liveScoreClubListAction(competitionId) {
  return {
    type: ApiConstants.API_LIVE_SCORE_CLUB_LIST_LOAD,
    competitionId,
  };
}

function searchFilterAction(search, key) {
  return {
    type: ApiConstants.API_LIVE_MATCH_LOCAL_SEARCH,
    search,
    key,
  };
}

function changePlayerLineUpAction(data) {
  return {
    type: ApiConstants.CHANGE_PLAYER_LINEUP_LOAD,
    data,
  };
}

function changeMatchBulkScore(value, key, index) {
  return {
    type: ApiConstants.CHANGE_BULK_MATCH_SCORE,
    value,
    key,
    index,
  };
}

function bulkScoreUpdate(data) {
  return {
    type: ApiConstants.BULK_SCORE_UPDATE_LOAD,
    data,
  };
}

function onCancelBulkScoreUpdate() {
  return {
    type: ApiConstants.BULK_SCORE_UPDATE_CANCEL,
  };
}

function liveScoreAddLiveStreamAction(data) {
  return {
    type: ApiConstants.API_ADD_LIVE_STREAM_LOAD,
    data,
  };
}

function clearDataOnCompChangeAction() {
  return {
    type: ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE,
  };
}
function resetUmpireListBoolAction() {
  return {
    type: ApiConstants.RESET_UMPIRE_LIST_BOOL,
  };
}

function setPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_LIVE_SCORE_MATCH_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_LIVE_SCORE_MATCH_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

function getIsLockedMatch(payload) {
  return {
    type: ApiConstants.API_GET_LIVE_SCORE_IS_LOCKED_MATCH_LOAD,
    payload,
  };
}

function clearIsLockedMatch() {
  return { type: ApiConstants.CLEAR_LIVE_SCORE_IS_LOCKED_MATCH_LIST };
}

function exportMediaReportAction(params) {
  return {
    type: ApiConstants.API_MEDIA_REPORT_EXPORT_FILE_LOAD,
    params
  }
}

function liveScoreActivateFinals(competitionId, divisionIds) {
  return {
    type: ApiConstants.API_LIVE_SCORE_ACTIVATE_FINALS,
    data: { competitionId, divisionIds }
  };
}

function liveScoreActivateFinalsReset() {
  return {
    type: ApiConstants.API_LIVE_SCORE_ACTIVATE_FINALS_RESET,
  };
}

function finaliseMatchResultAction(payload) {
  return {
    type: ApiConstants.API_LIVE_SCORE_FINALISE_MATCH_RESULT_LOAD,
    payload,
  }
}

export {
  liveScoreMatchListAction,
  liveScoreAddEditMatchAction,
  liveScoreAddEditMatchScoresAction,
  liveScoreAddMatchAction,
  liveScoreUpdateMatchAction,
  liveScoreCreateMatchAction,
  liveScoreUnEndMatchAction,
  liveScoreGetMatchTeamOfficials,
  clearMatchAction,
  liveScoreDeleteMatch,
  getCompetitionVenuesList,
  liveScoreMatchImportAction,
  liveScoreMatchResetImportResultAction,
  liveScoreGetMatchDetailInitiate,
  liveScoreClubListAction,
  searchFilterAction,
  changePlayerLineUpAction,
  changeMatchBulkScore,
  bulkScoreUpdate,
  onCancelBulkScoreUpdate,
  liveScoreAddLiveStreamAction,
  clearDataOnCompChangeAction,
  resetUmpireListBoolAction,
  setPageSizeAction,
  setPageNumberAction,
  getIsLockedMatch,
  clearIsLockedMatch,
  liveScoreMatchImportWithDeletingAction,
  exportMediaReportAction,
  liveScoreActivateFinals,
  liveScoreActivateFinalsReset,
  finaliseMatchResultAction,
  otherOfficialListAction,
};
