import ApiConstants from '../../../themes/apiConstants';

function liveScorePositionTrackingAction(data) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_POSITION_TRACKING_LOAD,
    data,
  };

  return action;
}

function setPageSizeAction(pageSize) {
  const action = {
    type: ApiConstants.SET_LIVE_SCORE_POSITION_TRACK_REPORT_PAGE_SIZE,
    pageSize,
  };

  return action;
}

function setPageNumberAction(pageNum) {
  const action = {
    type: ApiConstants.SET_LIVE_SCORE_POSITION_TRACK_REPORT_PAGE_CURRENT_NUMBER,
    pageNum,
  };

  return action;
}

export { liveScorePositionTrackingAction, setPageSizeAction, setPageNumberAction };
