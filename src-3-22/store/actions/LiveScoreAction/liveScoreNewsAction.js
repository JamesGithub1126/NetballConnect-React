import ApiConstants from '../../../themes/apiConstants';

function liveScoreNewsListAction(competitionId, sortBy, sortOrder) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_NEWS_LIST_LOAD,
    competitionId,
    sortBy,
    sortOrder
  };
  return action;
}

function liveScoreAddNewsDetailsAction(addNewItemDetail) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_ADD_NEWS_DETAILS,
    addNewItemDetail: addNewItemDetail,
  };

  return action;
}

function liveScoreUpdateNewsAction(data, key, contentType) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_NEWS,
    data,
    key,
    contentType: contentType,
  };
  return action;
}

function liveScoreAddNewsAction(data) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_ADD_NEWS_LOAD,
    data,
  };
  return action;
}

function liveScoreRefreshNewsAction() {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_REFRESH_NEWS,
  };
  return action;
}
// news notification on click publish and notify
function newsNotificationAction(data, value, screenKey) {
  const action = {
    type: ApiConstants.API_LIVESCORE_NEWS_NOTIFICATION_LOAD,
    data,
    value,
    screenKey: screenKey,
  };
  return action;
}
// delete news data
function liveScoreDeleteNewsAction(id) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_DELETE_NEWS_LOAD,
    id: id,
  };
  return action;
}
function setDefaultImageVideoNewAction(data) {
  const action = {
    type: ApiConstants.API_DEFAULT_NEWS_IMAGE_VIDEO,
    payload: data,
  };
  return action;
}

export {
  liveScoreNewsListAction,
  liveScoreAddNewsDetailsAction,
  liveScoreAddNewsAction,
  liveScoreUpdateNewsAction,
  liveScoreRefreshNewsAction,
  newsNotificationAction,
  liveScoreDeleteNewsAction,
  setDefaultImageVideoNewAction,
};
