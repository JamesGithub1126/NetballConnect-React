import ApiConstants from 'themes/apiConstants';

function liveScoreUmpiresListAction(competitionId, body) {
  return {
    type: ApiConstants.API_LIVE_SCORE_UMPIRES_LIST_LOAD,
    competitionId,
    body,
  };
}

function liveScoreUmpireImportAction(payload) {
  return {
    type: ApiConstants.API_LIVE_SCORE_UMPIRES_IMPORT_LOAD,
    payload,
  };
}

function liveScoreUmpireResetImportResultAction() {
  return {
    type: ApiConstants.API_LIVE_SCORE_UMPIRES_IMPORT_RESET,
  };
}

function getUmpireAvailabilityAction(userId, fromTime, endTime) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_GET_UMPIRE_AVAILABILITY_LOAD,
    userId,
    fromTime,
    endTime,
  };
  return action;
}

function saveUmpireAvailabilityAction(postData, userId, fromTime, endTime) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_SAVE_UMPIRE_AVAILABILITY_LOAD,
    postData,
    userId,
    fromTime,
    endTime,
  };
  return action;
}

export {
  liveScoreUmpiresListAction,
  liveScoreUmpireImportAction,
  liveScoreUmpireResetImportResultAction,
  getUmpireAvailabilityAction,
  saveUmpireAvailabilityAction,
};
