import ApiConstants from 'themes/apiConstants';

// get Venue by competition
function getCompetitionVenue(competitionId) {
  return {
    type: ApiConstants.API_GET_COMPETITION_VENUES_MULTI_LOAD,
    competitionId,
  };
}

// get competition draws
function getCompetitionDrawsAction(
  yearRefId,
  competitionId,
  venueId,
  roundId,
  orgId,
  startDate,
  endDate,
  dateRangeCheck,
) {
  return {
    type: ApiConstants.API_GET_COMPETITION_MULTI_DRAWS_LOAD,
    yearRefId,
    competitionId,
    venueId,
    roundId,
    orgId,
    startDate,
    endDate,
    dateRangeCheck,
  };
}

// get rounds in the competition draws
function getDrawsRoundsAction(yearRefId, competitionId, key, dateRangeCheck, startDate, endDate) {
  return {
    type: ApiConstants.API_GET_COMPETITION_MULTI_DRAWS_ROUNDS_LOAD,
    yearRefId,
    competitionId,
    key,
    dateRangeCheck,
    startDate,
    endDate,
  };
}

function bulkLockMatches(payload) {
  return {
    type: ApiConstants.API_GET_LIVE_SCORE_BULK_LOCK_MATCHES_LOAD,
    payload,
  };
}

// update competition draws
function updateCompetitionDraws(
  data,
  source,
  target,
  actionType,
  drawData,
  sourceDuplicate,
  targetDuplicate,
  apiData,
  dateRangeCheck,
) {
  return {
    type: ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_LOAD,
    data,
    sourceArray: source,
    targetArray: target,
    actionType,
    drawData,
    sourceDuplicate,
    targetDuplicate,
    apiData,
    dateRangeCheck,
  };
}

// update competition draws timeline
function updateCompetitionDrawsTimeline(
  data,
  source,
  target,
  actionType,
  drawData,
  yearRefId,
  competitionId,
  venueId,
  roundId,
  orgId,
  startDate,
  endDate,
  dateRangeCheck,
  onFinish,
) {
  return {
    type: ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_TIMELINE_LOAD,
    data,
    sourceArray: source,
    targetArray: target,
    actionType,
    drawData,
    yearRefId,
    competitionId,
    venueId,
    roundId,
    orgId,
    startDate,
    endDate,
    dateRangeCheck,
    onFinish,
  };
}

/// Save Draws
function saveDraws(yearId, competitionId, drawsMasterId) {
  return {
    type: ApiConstants.API_UPDATE_COMPETITION_SAVE_MULTI_DRAWS_LOAD,
    yearId,
    competitionId,
    drawsMasterId,
  };
}

// update draws court timing where N/A is there
function updateCourtTimingsDrawsAction(
  data,
  source,
  target,
  actionType,
  drawData,
  apiData,
  dateRangeCheck,
) {
  return {
    type: ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_COURT_TIMINGS_LOAD,
    data,
    sourceArray: source,
    targetArray: target,
    actionType,
    drawData,
    apiData,
    dateRangeCheck,
  };
}

function updateCourtTimingsDrawsDragSuccessAction(
  data,
  source,
  target,
  actionType,
  drawData,
  competitionId,
  dateRangeCheck,
) {
  return {
    type: ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_DRAG_LOAD,
    result: data,
    status: 1,
    getResult: data,
    competitionId: competitionId,
    sourceArray: source,
    targetArray: target,
    actionType: actionType,
    drawData: drawData,
    dateRangeCheck: dateRangeCheck,
  };
}
function updateCompetitionDrawsSwapLoadAction(
  data,
  source,
  target,
  actionType,
  drawData,
  dateRangeCheck,
) {
  return {
    type: ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_DRAG_LOAD,
    result: data,
    status: 1,
    sourceArray: source,
    targetArray: target,
    actionType: actionType,
    drawData: drawData,
    dateRangeCheck: dateRangeCheck,
  };
}

function dateSelectionRounds(data) {
  return {
    type: ApiConstants.UPDATE_ROUNDS_TIME,
    data,
  };
}

function clearMultiDraws(key) {
  return {
    type: ApiConstants.clearMultidrawsData,
    key,
  };
}

function clearFixtureData(key) {
  return {
    type: ApiConstants.clearFixtureData,
    key,
  };
}

// draws division grade names list
function getDivisionGradeNameLisAction(competitionId) {
  return {
    type: ApiConstants.API_MULTI_DRAWS_DIVISION_GRADE_NAME_LIST_LOAD,
    competitionId,
  };
}

function publishDraws(competitionId, key, payload) {
  return {
    type: ApiConstants.API_MULTI_DRAW_PUBLISH_LOAD,
    competitionId,
    key,
    payload,
  };
}

function matchesListDrawsAction(competitionId) {
  return {
    type: ApiConstants.API_MULTI_DRAW_MATCHES_LIST_LOAD,
    competitionId,
  };
}

function importDrawsAction(csvFile, competitionId, organisationId) {
  return {
    type: ApiConstants.API_IMPORT_DRAWS_LOAD,
    payload: {
      csvFile,
      competitionId,
      organisationId,
    },
  };
}

// get Division by competition
function getDivisionAction(competitionId) {
  return {
    type: ApiConstants.API_GET_DIVISION_MULTI_LOAD,
    competitionId,
  };
}

// unlockDrawsAction
function unlockDrawsAction(drawsId, roundId, venueCourtId, key) {
  return {
    type: ApiConstants.API_UPDATE_MULTI_DRAWS_LOCK_LOAD,
    drawsId,
    roundId,
    venueCourtId,
    key,
  };
}

// get active rounds in the competition
function getActiveRoundsAction(yearRefId, competitionId) {
  return {
    type: ApiConstants.API_GET_MULTI_DRAWS_ACTIVE_ROUNDS_LOAD,
    yearRefId,
    competitionId,
  };
}

// change range of date
function changeDrawsDateRangeAction(yearRefId, competitionId, startDate, endDate) {
  return {
    type: ApiConstants.API_MULTI_CHANGE_DATE_RANGE_GET_VENUE_DIVISIONS_LOAD,
    yearRefId,
    competitionId,
    startDate,
    endDate,
  };
}

// on change filter checkbox on multi field draws
function checkBoxOnChange(value, key, index, subIndex, additionalData) {
  return {
    type: ApiConstants.ONCHANGE_MULTI_FIELD_DRAWS_CHECKBOX,
    value,
    key,
    index,
    subIndex,
    additionalData,
  };
}

function setTimelineModeAction(value) {
  return {
    type: ApiConstants.SET_TIMELINE_MODE,
    value,
  };
}

function updateMultiDrawsCourtTimings(roundId, index, timeString) {
  return {
    type: ApiConstants.API_COMPETITION_MULTI_DRAWS_COURT_TIMINGS_UPDATE,
    roundId,
    index,
    timeString,
  };
}

export {
  getCompetitionDrawsAction,
  getDrawsRoundsAction,
  updateCompetitionDraws,
  updateCompetitionDrawsTimeline,
  saveDraws,
  getCompetitionVenue,
  updateCourtTimingsDrawsAction,
  updateCourtTimingsDrawsDragSuccessAction,
  updateCompetitionDrawsSwapLoadAction,
  dateSelectionRounds,
  clearMultiDraws,
  getDivisionGradeNameLisAction,
  publishDraws,
  matchesListDrawsAction,
  getDivisionAction,
  clearFixtureData,
  unlockDrawsAction,
  getActiveRoundsAction,
  changeDrawsDateRangeAction,
  checkBoxOnChange,
  importDrawsAction,
  setTimelineModeAction,
  updateMultiDrawsCourtTimings,
  bulkLockMatches,
};
