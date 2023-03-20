import ApiConstants from '../../../themes/apiConstants';

///// get Venue by competition

function getCompetitionVenue(competitionId) {
  const action = {
    type: ApiConstants.API_GET_COMPETITION_VENUES_LOAD,
    competitionId,
  };
  return action;
}

/////get competition draws
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
  const action = {
    type: ApiConstants.API_GET_COMPETITION_DRAWS_LOAD,
    yearRefId,
    competitionId,
    venueId,
    roundId,
    orgId,
    startDate,
    endDate,
    dateRangeCheck,
  };
  return action;
}

///get rounds in the competition draws
function getDrawsRoundsAction(yearRefId, competitionId, key) {
  const action = {
    type: ApiConstants.API_GET_COMPETITION_DRAWS_ROUNDS_LOAD,
    yearRefId,
    competitionId,
    key,
  };
  return action;
}

////update competition drwas
function updateCompetitionDraws(data, source, target, actionType, drawData) {
  const action = {
    type: ApiConstants.API_UPDATE_COMPETITION_DRAWS_LOAD,
    data,
    sourceArray: source,
    targetArray: target,
    actionType: actionType,
    drawData: drawData,
  };
  return action;
}

/// Save Draws
function saveDraws(yearId, competitionId, drawsMasterId) {
  const action = {
    type: ApiConstants.API_UPDATE_COMPETITION_SAVE_DRAWS_LOAD,
    yearId: yearId,
    competitionId,
    drawsMasterId: drawsMasterId,
  };
  return action;
}

/////update draws court timing where N/A is there
function updateCourtTimingsDrawsAction(
  data,
  source,
  target,
  actionType,
  drawData,
  apiData,
  dateRangeCheck,
) {
  const action = {
    type: ApiConstants.API_UPDATE_COMPETITION_DRAWS_COURT_TIMINGS_LOAD,
    data,
    sourceArray: source,
    targetArray: target,
    actionType: actionType,
    drawData: drawData,
    apiData: apiData,
    dateRangeCheck: dateRangeCheck,
  };
  return action;
}

function dateSelectionRounds(data) {
  const action = {
    type: ApiConstants.UPDATE_ROUNDS_TIME,
    data,
  };
  return action;
}
function clearDraws(key) {
  const action = {
    type: ApiConstants.cleardrawsData,
    key,
  };
  return action;
}

function clearFixtureData(key) {
  const action = {
    type: ApiConstants.clearFixtureData,
    key,
  };
  return action;
}

////draws division grade names list
function getDivisionGradeNameLisAction(competitionId) {
  const action = {
    type: ApiConstants.API_DRAWS_DIVISION_GRADE_NAME_LIST_LOAD,
    competitionId,
  };
  return action;
}

function publishDraws(competitionId, key, payload) {
  const action = {
    type: ApiConstants.API_DRAW_PUBLISH_LOAD,
    competitionId,
    key,
    payload,
  };
  return action;
}

function matchesListDrawsAction(competitionId) {
  const action = {
    type: ApiConstants.API_DRAW_MATCHES_LIST_LOAD,
    competitionId,
  };
  return action;
}

///// get Division by competition
function getDivisionAction(competitionId) {
  const action = {
    type: ApiConstants.API_GET_DIVISION_LOAD,
    competitionId,
  };
  return action;
}

//get competition fixtures
function getCompetitionFixtureAction(yearId, competitionId, competitionDivisionGradeId) {
  const action = {
    type: ApiConstants.API_GET_FIXTURE_LOAD,
    yearId,
    competitionId,
    competitionDivisionGradeId,
  };
  return action;
}

////update competition drwas
function updateCompetitionFixtures(
  data,
  source,
  target,
  roundId,
  yearId,
  competitionId,
  competitionDivisionGradeId,
) {
  const action = {
    type: ApiConstants.API_UPDATE_COMPETITION_FIXTURE_LOAD,
    data,
    sourceArray: source,
    targetArray: target,
    roundId,
    yearId,
    competitionId,
    competitionDivisionGradeId,
  };
  return action;
}

//unlockDrawsAction
function unlockDrawsAction(drawsId, roundId, venueCourtId, key) {
  const action = {
    type: ApiConstants.API_UPDATE_DRAWS_LOCK_LOAD,
    drawsId,
    roundId,
    venueCourtId,
    key,
  };
  return action;
}

///get active rounds in the competition
function getActiveRoundsAction(yearRefId, competitionId) {
  const action = {
    type: ApiConstants.API_GET_DRAWS_ACTIVE_ROUNDS_LOAD,
    yearRefId,
    competitionId,
  };
  return action;
}

//change range of date
function changeDrawsDateRangeAction(yearRefId, competitionId, startDate, endDate) {
  return {
    type: ApiConstants.API_CHANGE_DATE_RANGE_GET_VENUE_DIVISIONS_LOAD,
    yearRefId,
    competitionId,
    startDate,
    endDate,
  };
}
export {
  getCompetitionDrawsAction,
  getDrawsRoundsAction,
  updateCompetitionDraws,
  saveDraws,
  getCompetitionVenue,
  updateCourtTimingsDrawsAction,
  dateSelectionRounds,
  clearDraws,
  getDivisionGradeNameLisAction,
  publishDraws,
  matchesListDrawsAction,
  getDivisionAction,
  getCompetitionFixtureAction,
  clearFixtureData,
  updateCompetitionFixtures,
  unlockDrawsAction,
  getActiveRoundsAction,
  changeDrawsDateRangeAction,
};
