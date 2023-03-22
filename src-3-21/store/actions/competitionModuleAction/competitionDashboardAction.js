import ApiConstants from '../../../themes/apiConstants';
// competition dashboard
function competitionDashboardAction(yearId) {
  const action = {
    type: ApiConstants.API_COMPETITION_DASHBOARD_LOAD,
    yearId,
  };
  return action;
}

//  Enhanced Round Robin Fixture template
function fixtureTemplateRoundsAction() {
  const action = {
    type: ApiConstants.API_FIXTURE_TEMPLATE_ROUNDS_LOAD,
  };
  return action;
}
function updateCompetitionStatus(payload, yearId) {
  const action = {
    type: ApiConstants.API_COMPETITION_STATUS_UPDATE_LOAD,
    payload,
    yearId,
  };
  return action;
}

function saveCompetitionDivisionsAction(competitionId, organisationId, payload) {
  const action = {
    type: ApiConstants.API_SAVE_COMPETITION_DIVISIONS_LOAD,
    competitionId,
    organisationId,
    payload,
  };

  return action;
}

function deleteCompetitionAction(competitionId, targetValue) {
  const action = {
    type: ApiConstants.API_COMPETITION_DASHBOARD_DELETE_LOAD,
    competitionId,
    targetValue,
  };
  return action;
}

function archiveCompetitionAction(competitionId, statusRefId) {
  const action = {
    type: ApiConstants.API_COMPETITION_DASHBOARD_ARCHIVE_LOAD,
    competitionId,
    statusRefId,
  };
  return action;
}

function updateReplicateSaveObjAction(data, key, subKey, index) {
  const action = {
    type: ApiConstants.UPDATE_REPLICATE_SAVE_OBJ,
    data,
    key,
    subKey,
    index,
  };
  return action;
}

function replicateSaveAction(replicateSave) {
  const action = {
    type: ApiConstants.API_REPLICATE_SAVE_LOAD,
    replicateData: replicateSave,
  };
  return action;
}

function getOldMembershipProductsByCompIdAction(payload) {
  const action = {
    type: ApiConstants.API_OLD_MEMBERSHIP_PRODUCTS_BY_COMP_ID_LOAD,
    payload,
  };
  return action;
}

function getNewMembershipProductByYearAction(payload) {
  const action = {
    type: ApiConstants.API_NEW_MEMBERSHIP_PRODUCTS_BY_YEAR_LOAD,
    payload,
  };
  return action;
}

export {
  competitionDashboardAction,
  fixtureTemplateRoundsAction,
  updateCompetitionStatus,
  deleteCompetitionAction,
  archiveCompetitionAction,
  updateReplicateSaveObjAction,
  replicateSaveAction,
  getOldMembershipProductsByCompIdAction,
  getNewMembershipProductByYearAction,
  saveCompetitionDivisionsAction,
};
