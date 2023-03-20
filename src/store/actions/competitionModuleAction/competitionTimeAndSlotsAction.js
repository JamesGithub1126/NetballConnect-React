import ApiConstants from '../../../themes/apiConstants';

// get competition with time slots
function getCompetitionWithTimeSlots(year, competitionId, alldata) {
  const action = {
    type: ApiConstants.API_GET_COMPETITION_WITH_TIME_SLOTS_LOAD,
    year: year,
    competitionId,
    alldata: alldata,
  };
  return action;
}
// add and remove time slot
function addRemoveTimeSlot(index, item, key, parentIndex) {
  const action = {
    type: ApiConstants.Api_ADD_REMOVE_TIME_SLOT_TABLE,
    index,
    item,
    key,
    parentIndex,
  };
  return action;
}

// get competition teams
function getCompetitionTeams(id) {
  const action = {
    type: ApiConstants.API_COMPETITION_TEAMS_GET_LOAD,
    id,
  };
  return action;
}

// get competition timeslots
// function getCompetitionTimeslots(id) {
//   const action = {
//     type: ApiConstants.API_COMPETITION_TIMESLOTS_GET_LOAD,
//     id,
//   };
//   return action;
// }

// get competition timeslots
// function getTeamTimeslotsPreferences(id) {
//   const action = {
//     type: ApiConstants.API_TEAM_TIMESLOTS_PREFERENCES_GET_LOAD,
//     id,
//   };
//   return action;
// }

// save competition timeslots
// function saveTeamTimeslotsPreferences(id, organisationId, payload) {
//   const action = {
//     type: ApiConstants.API_TEAM_TIMESLOTS_PREFERENCES_SAVE_LOAD,
//     id,
//     organisationId,
//     payload,
//   };
//   return action;
// }

function UpdateTimeSlotsData(value, key, contentType, index, mainId, id) {
  return {
    type: ApiConstants.UPDATE_POST_DATA_TIME_SLOTS_COMPETITION,
    value,
    key,
    contentType,
    index,
    mainId,
    id,
  };
}

function UpdateTimeSlotsDataManual(value, key, contentType, index, mainId, id, parentIndex) {
  return {
    type: ApiConstants.UPDATE_POST_DATA_TIME_SLOTS_MANUAL_COMPETITION,
    value,
    key,
    contentType,
    index,
    mainId,
    id,
    parentIndex,
  };
}

function UpdateTimeSlotsMatchDurationReference(
  value,
  index,
  mainTimeRotationID,
  timeslotRotationRefId,
) {
  return {
    type: ApiConstants.UPDATE_POST_DATA_TIME_SLOTS_MATCHDURATION_REFERENCE_COMPETITION,
    value,
    index,
    mainTimeRotationID,
    timeslotRotationRefId,
  };
}

// post time slot Data
function addTimeSlotDataPost(payload, id) {
  const action = {
    type: ApiConstants.API_COMPETITION_TIMESLOT_POST_LOAD,
    payload,
    id,
    //isTeamPreferenceActive,
  };
  return action;
}
function searchDivisionList(value, key) {
  const action = {
    type: ApiConstants.Search_Division_Timeslot_update,
    value,
    key,
  };
  return action;
}

function ClearDivisionArr(key) {
  const action = {
    type: ApiConstants.Clear_Division_Timeslot_update,
    key,
  };
  return action;
}

export {
  getCompetitionWithTimeSlots,
  addRemoveTimeSlot,
  UpdateTimeSlotsData,
  UpdateTimeSlotsDataManual,
  addTimeSlotDataPost,
  searchDivisionList,
  ClearDivisionArr,
  getCompetitionTeams,
  //getCompetitionTimeslots,
  //getTeamTimeslotsPreferences,
  //saveTeamTimeslotsPreferences,
  UpdateTimeSlotsMatchDurationReference,
};
