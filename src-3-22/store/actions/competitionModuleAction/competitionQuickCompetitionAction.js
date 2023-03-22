import ApiConstants from '../../../themes/apiConstants';
// competition dashboard
function updateQuickCompetitionData(item, key) {
  const action = {
    type: ApiConstants.Update_QuickCompetition_Data,
    item,
    key,
  };
  return action;
}

function updateTimeSlot(key, index, timeindex, value) {
  const action = {
    type: ApiConstants.API_UPDATE_QUICKCOMPETITION_TIMESLOT,
    key,
    index,
    timeindex,
    value,
  };
  return action;
}

function updateDivision(key, index, gradeIndex, value) {
  const action = {
    type: ApiConstants.API_UPDATE_QUICKCOMPETITION_Division,
    key,
    index,
    gradeIndex,
    value,
  };
  return action;
}

function updateCompetition(value, key) {
  const action = {
    type: ApiConstants.API_UPDATE_QUICKCOMPETITION_COMPETITION,
    value,
    key,
  };
  return action;
}

function createQuickCompetitionAction(payload) {
  const action = {
    type: ApiConstants.API_CREATE_QUICK_COMPETITION_LOAD,
    payload,
  };
  return action;
}

////post/save quick competition division
function saveQuickCompDivisionAction(competitionUniqueKey, divisions, year, competitionName) {
  const action = {
    type: ApiConstants.API_SAVE_QUICK_COMPETITION_DIVISION_LOAD,
    competitionUniqueKey,
    divisions,
    year,
    competitionName,
  };
  return action;
}

function getYearAndQuickCompetitionAction(yearData, yearId) {
  const action = {
    type: ApiConstants.API_YEAR_AND_QUICK_COMPETITION_LOAD,
    yearData,
    yearId,
  };
  return action;
}

function getQuickCompetitionAction(payload) {
  const action = {
    type: ApiConstants.API_GET_QUICK_COMPETITION_LOAD,
    payload,
  };
  return action;
}

// post time slot Data
function quickCompetitionTimeSlotData(payload, year, competitionUniqueKey, competitionName) {
  const action = {
    type: ApiConstants.API_QUICK_COMPETITION_TIMESLOT_POST_LOAD,
    payload,
    year: year,
    competitionUniqueKey: competitionUniqueKey,
    competitionName: competitionName,
  };
  return action;
}
////update quick competition
function updateQuickCompetitionAction(payload, year) {
  const action = {
    type: ApiConstants.API_UPDATE_QUICK_COMPETITION_LOAD,
    payload,
    year,
  };
  return action;
}
function quickCompetitionGenerateFixtureAction(payload, year) {
  const action = {
    type: ApiConstants.API_QUICK_COMPETITION_GENERATE_FIXTURE_LOAD,
    payload,
    year,
  };
  return action;
}
function quickCompetitionAddTeamAction(payload, year) {
  const action = {
    type: ApiConstants.API_QUICK_COMPETITION_ADD_TEAM_LOAD,
    payload,
    year,
  };
  return action;
}
function exportQuickCompetitionAction(competitionId) {
  const action = {
    type: ApiConstants.API_EXPORT_QUICK_COMPETITION_LOAD,
    competitionId,
  };
  return action;
}

function updateQuickCompetitionDraws(
  sourceArray,
  targetArray,
  sourceDrawsId,
  targetDrawsId,
  freeObject,
  key,
) {
  const action = {
    type: ApiConstants.API_UPDATE_QUICKCOMPETITION_DRAWS,
    sourceArray,
    targetArray,
    sourceDrawsId,
    targetDrawsId,
    freeObject,
    key,
  };
  return action;
}
function updateSelectedTeamPlayer(value, key) {
  const action = {
    type: ApiConstants.API_UPDATE_QUICKCOMPETITION_INVITATIONS,
    value,
    key,
  };
  return action;
}

function quickCompImportDataCleanUpAction(key) {
  const action = {
    type: ApiConstants.QUICKCOMP_IMPORT_DATA_CLEAN,
    key,
  };
  return action;
}

function quickCompetitionPlayerImportAction(payload) {
  const action = {
    type: ApiConstants.QUICKCOMP_IMPORT_DATA_LOAD,
    payload,
  };
  return action;
}
function quickCompetitionAddVenue(payload) {
  const action = {
    type: ApiConstants.API_QUICK_COMPETITION_ADD_VENUE_LOAD,
    payload,
  };
  return action;
}

function getMergeCompetitionAction() {
  return {
    type: ApiConstants.API_GET_MERGE_COMPETITION_LOAD,
  };
}

function validateMergeCompetitionaction(payload) {
  return {
    type: ApiConstants.API_VALIDATE_MERGE_COMPETITION_LOAD,
    payload,
  };
}

function mergeCompetitionProceed(payload) {
  return {
    type: ApiConstants.API_MERGE_COMPETITION_PROCESS_LOAD,
    payload,
  };
}

function updateQuickCompetitionTimeSlotData(
  body,
  yearRefId,
  competitionUniqueKey,
  competitionName,
  payload,
) {
  return {
    type: ApiConstants.API_UPDATE_STATUS_TIMESLOT_LOAD,
    body,
    yearRefId,
    competitionUniqueKey,
    competitionName,
    payload,
  };
}

function updateGridAndDivisionAction(
  competitionUniqueKey,
  divisions,
  year,
  competitionName,
  payload,
) {
  return {
    type: ApiConstants.API_UPDATE_STATUS_DIVISION_LOAD,
    competitionUniqueKey,
    divisions,
    year,
    competitionName,
    payload,
  };
}

function updateGridAndVenue(body, payload, competitionUniqueKey, year, competitionName) {
  return {
    type: ApiConstants.API_UPDATE_STATUS_VENUE_LOAD,
    body,
    payload,
    competitionUniqueKey,
    year,
    competitionName,
  };
}

export {
  updateQuickCompetitionData,
  updateTimeSlot,
  updateDivision,
  updateCompetition,
  createQuickCompetitionAction,
  saveQuickCompDivisionAction,
  exportQuickCompetitionAction,
  getYearAndQuickCompetitionAction,
  getQuickCompetitionAction,
  quickCompetitionTimeSlotData,
  updateQuickCompetitionAction,
  quickCompetitionGenerateFixtureAction,
  quickCompetitionAddTeamAction,
  updateQuickCompetitionDraws,
  updateSelectedTeamPlayer,
  quickCompImportDataCleanUpAction,
  quickCompetitionPlayerImportAction,
  quickCompetitionAddVenue,
  getMergeCompetitionAction,
  validateMergeCompetitionaction,
  mergeCompetitionProceed,
  updateQuickCompetitionTimeSlotData,
  updateGridAndDivisionAction,
  updateGridAndVenue,
};
