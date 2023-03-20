import ApiConstants from '../../../themes/apiConstants';

function liveScoreGetMatchEventsAction(payload) {
  return {
    type: ApiConstants.API_LIVE_SCORE_GET_MATCH_EVENTS_LOAD,
    payload,
  };
}

function liveScoreAddNewMatchEventAction(payload) {
  return { type: ApiConstants.API_LIVE_SCORE_ADD_NEW_MATCH_EVENT, payload };
}

function liveScoreRemoveNewMatchEventAction(payload) {
  return { type: ApiConstants.API_LIVE_SCORE_REMOVE_NEW_MATCH_EVENT, payload };
}

function liveScoreUpdateNewMatchEventAction(payload) {
  return {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_NEW_MATCH_EVENT,
    payload,
  };
}

function liveScorePeriodTimeStampUpdated(payload) {
  return { type: ApiConstants.API_LIVE_SCORE_PERIOD_TIMESTAMP_UPDATED, payload };
}

function liveScoreSaveNewMatchEventAction(payload) {
  return { type: ApiConstants.API_LIVE_SCORE_SAVE_NEW_MATCH_EVENT_LOAD, payload };
}

function liveScoreEventTimeStampUpdated(payload) {
  return { type: ApiConstants.API_LIVE_SCORE_EVENT_MINUTES_UPDATED, payload };
}

function liveScoreClearEventLogData() {
  return { type: ApiConstants.API_LIVE_SCORE_CLEAR_MATCH_EVENT_LOGS };
}

function liveScoreActionLogSetTeamListing(payload) {
  return { type: ApiConstants.API_LIVE_SCORE_ACTIONLOG_SET_TEAM_LISTING, payload };
}

function liveScoreActionLogSetFields(payload) {
  return { type: ApiConstants.API_LIVE_SCORE_ACTIONLOG_SET_FIELDS, payload };
}

function liveScoreActionLogReset() {
  return { type: ApiConstants.API_LIVE_SCORE_ACTIONLOG_SET_DEFAULTS };
}

function liveScoreActionLogAddPeriod(payload) {
  return { type: ApiConstants.API_LIVE_SCORE_ACTIONLOG_ADD_PERIOD, payload };
}

export {
  liveScoreGetMatchEventsAction,
  liveScoreAddNewMatchEventAction,
  liveScoreRemoveNewMatchEventAction,
  liveScoreUpdateNewMatchEventAction,
  liveScoreSaveNewMatchEventAction,
  liveScorePeriodTimeStampUpdated,
  liveScoreEventTimeStampUpdated,
  liveScoreClearEventLogData,
  liveScoreActionLogSetTeamListing,
  liveScoreActionLogSetFields,
  liveScoreActionLogReset,
  liveScoreActionLogAddPeriod,
};
