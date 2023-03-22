import ApiConstants from '../../../themes/apiConstants';

function liveScoreIncidentList(
  competitionId,
  search,
  limit,
  offset,
  sortBy,
  sortOrder,
  liveScoreCompIsParent,
  competitionOrganisationId,
  round,
  incidentType,
  incidentStatusRefId,
) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_INCIDENT_LIST_LOAD,
    competitionId,
    search: search,
    limit,
    offset,
    sortBy,
    sortOrder,
    liveScoreCompIsParent,
    competitionOrganisationId,
    round,
    incidentType,
    incidentStatusRefId,
  };
  return action;
}

function liveScoreUpdateIncident(data, key) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_INCIDENT,
    key,
    data,
  };
  return action;
}

// function liveScoreClearIncident() {
//     const action = {
//         type: ApiConstants.API_LIVE_SCORE_CLEAR_INCIDENT,
//     };
//     return action;
// }

export const createPlayerSuspensionAction = data => {
  return {
    type: ApiConstants.API_CREATE_PLAYER_SUSPENSION,
    data,
  };
};

export const updatePlayerSuspensionAction = (suspensionId, data) => {
  return {
    type: ApiConstants.API_UPDATE_PLAYER_SUSPENSION,
    suspensionId,
    data,
  };
};

export const createTribunalAction = data => {
  return {
    type: ApiConstants.API_CREATE_TRIBUNAL,
    data,
  };
};

export const updateTribunalAction = (tribunalId, data) => {
  return {
    type: ApiConstants.API_UPDATE_TRIBUNAL,
    tribunalId,
    data,
  };
};

export const liveScoreClearIncident = () => {
  return {
    type: ApiConstants.API_LIVE_SCORE_CLEAR_INCIDENT,
  };
};

export const initIncidentSuspensions = (suspensions) => {
  return {
    type: ApiConstants.API_LIVE_SCORE_INIT_INCIDENT_SUSPENSIONS,
    payload: suspensions,
  }
}

export const updateSelectedSuspension = (userId, data) => {
  return {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_SELECTED_SUSPENSION,
    payload: { userId, data },
  }
}

function liveScoreUpdateIncidentData(data, key) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_INCIDENT_DATA,
    key,
    data,
  };

  return action;
}

function liveScoreAddEditIncident(data) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_ADD_EDIT_INCIDENT_LOAD,
    data,
  };

  return action;
}

function liveScoreIncidentTypeAction(sportRefId) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_INCIDENT_TYPE_LOAD,
    sportRefId,
  };

  return action;
}

function setPageSizeAction(pageSize) {
  const action = {
    type: ApiConstants.SET_LIVE_SCORE_INCIDENT_LIST_PAGE_SIZE,
    pageSize,
  };

  return action;
}

function setPageNumberAction(pageNum) {
  const action = {
    type: ApiConstants.SET_LIVE_SCORE_INCIDENT_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };

  return action;
}

export {
  liveScoreIncidentList,
  liveScoreUpdateIncident,
  liveScoreUpdateIncidentData,
  liveScoreAddEditIncident,
  liveScoreIncidentTypeAction,
  setPageSizeAction,
  setPageNumberAction,
};
