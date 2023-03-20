import ApiConstants from '../../../themes/apiConstants';

function liveScoreScorerListAction(
  competitionId,
  roleId,
  body,
  search,
  sortBy,
  sortOrder,
  liveScoreCompIsParent,
) {
  return {
    type: ApiConstants.API_LIVE_SCORE_SCORER_LIST_LOAD,
    competitionId,
    roleId,
    body,
    search,
    sortBy,
    sortOrder,
    liveScoreCompIsParent,
  };
}

function liveScoreScorerUpdate(data, key) {
  return {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_SCORER,
    data,
    key,
  };
}

// Devision action
function liveScoreAddEditScorer(body, teamId, existingScorerId, isEdit) {
  return {
    type: ApiConstants.API_LIVE_SCORE_ADD_EDIT_SCORER_LOAD,
    body,
    teamId,
    existingScorerId,
    isEdit,
  };
}

/// Assign matches action
function assignMatchesAction(competitionId, teamId, body) {
  return {
    type: ApiConstants.API_LIVESCORE_ASSIGN_MATCHES_LOAD,
    competitionId,
    teamId,
    body,
  };
}

/// Change assign status
function changeAssignStatus(index, records, roleId, teamID, scorerKey, teamkey, scorer_Id) {
  return {
    type: ApiConstants.API_LIVESCORE_ASSIGN_CHANGE_STATUS_LOAD,
    index,
    records,
    roleId,
    teamID,
    scorerKey,
    teamkey,
    scorer_Id,
  };
}

/// Change assign status
function unAssignMatcheStatus(index, records, scorerKey, teamkey) {
  return {
    type: ApiConstants.API_LIVESCORE_UNASSIGN_STATUS_LOAD,
    index,
    records,
    scorerKey,
    teamkey,
  };
}

// Scorer Search
function liveScoreScorerSearch(roleId, entityTypeId, competitionId, searchText) {
  return {
    type: ApiConstants.API_LIVESCORE_SCORER_SEARCH_LOAD,
    roleId,
    entityTypeId,
    competitionId,
    searchText,
  };
}

function setLiveScoreAssignMatchListPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_LIVE_SCORE_ASSIGN_MATCH_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setLiveScoreAssignMatchListPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_LIVE_SCORE_ASSIGN_MATCH_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

export {
  liveScoreScorerListAction,
  liveScoreScorerUpdate,
  liveScoreAddEditScorer,
  assignMatchesAction,
  changeAssignStatus,
  unAssignMatcheStatus,
  liveScoreScorerSearch,
  setLiveScoreAssignMatchListPageSizeAction,
  setLiveScoreAssignMatchListPageNumberAction,
};
