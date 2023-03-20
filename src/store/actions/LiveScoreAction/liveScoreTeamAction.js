import ApiConstants from 'themes/apiConstants';

function getliveScoreTeams(competitionID, divisionId, compOrgId) {
  return {
    type: ApiConstants.API_LIVE_SCORE_TEAM_LOAD,
    competitionID,
    divisionId,
    compOrgId,
  };
}

// Team View action
function getTeamViewPlayerList(teamId) {
  return {
    type: ApiConstants.API_GET_TEAM_VIEW_PLAYER_LIST_LOAD,
    teamId,
  };
}

// Team Delete action
function liveScoreDeleteTeam(teamId) {
  return {
    type: ApiConstants.API_LIVE_SCORE_DELETE_TEAM_LOAD,
    teamId,
  };
}
function liveScoreDeletePlayerAction(playerId) {
  return {
    type: ApiConstants.API_LIVE_SCORE_DELETE_TEAM_PLAYER_LOAD,
    playerId,
  };
}

function liveScoreAddTeamform(payload) {
  return {
    type: ApiConstants.LIVE_SCORE_TEAM_EDIT,
    payload,
  };
}

function liveScoreGetDivision(payload) {
  return {
    type: ApiConstants.GET_DIVISION_TEAM,
    payload,
  };
}

function liveScoreGetRounds(competitionId) {
  return {
    type: ApiConstants.API_LIVE_SCORE_GET_ROUNDS_LOAD,
    competitionId,
  };
}

function liveScoreGetAffiliate(payload) {
  return {
    type: ApiConstants.GET_AFFILIATE_TEAM,
    payload,
  };
}

function liveAddNewTeam(data, teamId, key, screenKey, sourceIdAvailable, teamUniqueKey) {
  return {
    type: ApiConstants.API_LIVE_SCORE_ADD_TEAM_LOAD,
    payload: data,
    teamId,
    key,
    screenKey,
    sourceIdAvailable,
    teamUniqueKey,
  };
}

function liveScoreTeamImportAction(payload) {
  return {
    type: ApiConstants.API_LIVE_SCORE_TEAM_IMPORT_LOAD,
    payload,
  };
}

function liveScoreTeamResetImportResultAction() {
  return {
    type: ApiConstants.API_LIVE_SCORE_TEAM_IMPORT_RESET,
  };
}

function liveScoreGetTeamDataAction(teamId) {
  return {
    type: ApiConstants.API_LIVE_SCORE_GET_TEAM_LOAD,
    teamId,
  };
}

// Team list with pagination
function getTeamsWithPagination(
  competitionID,
  offset,
  limit,
  search,
  sortBy,
  sortOrder,
  competitionOrganisationId,
) {
  return {
    type: ApiConstants.API_LIVE_SCORE_TEAM_WITH_PAGING_LOAD,
    competitionID,
    offset,
    limit,
    search,
    sortBy,
    sortOrder,
    competitionOrganisationId,
  };
}

export {
  getliveScoreTeams,
  getTeamViewPlayerList,
  liveScoreDeleteTeam,
  liveScoreAddTeamform,
  liveScoreGetDivision,
  liveScoreGetAffiliate,
  liveAddNewTeam,
  liveScoreTeamImportAction,
  liveScoreTeamResetImportResultAction,
  liveScoreGetTeamDataAction,
  getTeamsWithPagination,
  liveScoreDeletePlayerAction,
  liveScoreGetRounds,
};
