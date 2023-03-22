import ApiConstants from 'themes/apiConstants';

function liveScorePlayerMinuteTrackingListAction(matchId, teamId, playerId) {
  return {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_MINUTE_TRACKING_LIST_LOAD,
    matchId,
    teamId,
    playerId,
  };
}

function liveScorePlayerMinuteRecordAction(payload, matchId) {
  return {
    type: ApiConstants.API_LIVE_SCORE_PLAYER_MINUTE_RECORD_LOAD,
    payload,
    matchId,
  };
}

function liveScoreUpdatePlayerMinuteRecordAction(data) {
  return {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_PLAYER_MINUTE_RECORD,
    data,
  };
}

function liveScoreUpdateTrackingData(data) {
  return {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_TRACKING_DATA,
    data,
  };
}

function liveScoreStatisticsInitPositionListAction(data) {
  return {
    type: ApiConstants.API_LIVE_SCORE_INIT_PLAYER_POSITION_LIST,
    data,
  };
}

function liveScoreStatisticsAddPositionAction(data) {
  return {
    type: ApiConstants.API_LIVE_SCORE_ADD_PLAYER_POSITION,
    data,
  };
}

function liveScoreStatisticsUpdatePositionAction(data) {
  return {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_PLAYER_POSITION,
    data,
  };
}

function liveScoreStatisticsRemovePositionAction(data) {
  return {
    type: ApiConstants.API_LIVE_SCORE_REMOVE_PLAYER_POSITION,
    data,
  };
}

function liveScoreStatisticsUpdatePlayDuration(data) {
  return {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_PLAY_DURATION,
    data,
  };
}

function liveScoreStatisticsUpdatePlayedState(data) {
  return {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_PLAYED_STATE,
    data,
  };
}

//CURRENTLY NOT IN USE
/* function liveScoreStatisticslinkTracks(data) {
  return {
    type: ApiConstants.API_LIVE_SCORE_LINK_TRACKS,
    data,
  };
} */

export {
  liveScorePlayerMinuteRecordAction,
  liveScorePlayerMinuteTrackingListAction,
  liveScoreUpdateTrackingData,
  liveScoreUpdatePlayerMinuteRecordAction,
  liveScoreStatisticsInitPositionListAction,
  liveScoreStatisticsAddPositionAction,
  liveScoreStatisticsUpdatePositionAction,
  liveScoreStatisticsRemovePositionAction,
  liveScoreStatisticsUpdatePlayDuration,
  liveScoreStatisticsUpdatePlayedState,
};
