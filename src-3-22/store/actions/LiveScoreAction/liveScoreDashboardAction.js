// import AppConstants from "themes/appConstants";
import ApiConstants from '../../../themes/apiConstants';

function liveScoreDashboardListAction(
  competitionID,
  startDay,
  currentTime,
  competitionOrganisationId,
  liveScoreCompIsParent,
  offset,
  limit,
) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_DASHBOARD_LOAD,
    competitionID: competitionID,
    startDay: startDay,
    currentTime: currentTime,
    competitionOrganisationId,
    liveScoreCompIsParent,
    offset,
    limit,
  };

  return action;
}

function liveScoreSingleGameListAction(payload) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_SINGLE_GAME_LIST_LOAD,
    payload,
  };

  return action;
}

function liveScoreSingleGameRedeemPayAction(payload) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_SINGLE_GAME_REDEEM_PAY_LOAD,
    payload,
  };

  return action;
}

function liveScorePlayersToPayListAction(payload) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_PLAYERS_TO_PAY_LIST_LOAD,
    payload,
  };

  return action;
}

function liveScorePlayersToPayRetryPaymentAction(payload) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_PLAYERS_TO_PAY_RETRY_PAYMENT_LOAD,
    payload,
  };

  return action;
}

function liveScorePlayersToCashReceivedAction(payload) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_PLAYERS_TO_PAY_CASH_RECEIVED_LOAD,
    payload,
  };

  return action;
}

function setPageSizeAction(pageSize) {
  const action = {
    type: ApiConstants.SET_LIVE_SCORE_DASHBOARD_LIST_PAGE_SIZE,
    pageSize,
  };

  return action;
}

function setSingleGamePageSizeAction(pageSize) {
  const action = {
    type: ApiConstants.SET_LIVE_SCORE_SINGLE_GAME_LIST_PAGE_SIZE,
    pageSize,
  };

  return action;
}

function setPageNumberAction(pageNum) {
  const action = {
    type: ApiConstants.SET_LIVE_SCORE_DASHBOARD_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };

  return action;
}

function clearSingleGameDataList() {
  const action = {
    type: ApiConstants.CLEAR_SINGLE_GAME_DATA_LIST,
  };
  return action;
}

export {
  liveScoreDashboardListAction,
  liveScoreSingleGameListAction,
  liveScoreSingleGameRedeemPayAction,
  liveScorePlayersToPayListAction,
  liveScorePlayersToPayRetryPaymentAction,
  liveScorePlayersToCashReceivedAction,
  setPageSizeAction,
  setPageNumberAction,
  clearSingleGameDataList,
  setSingleGamePageSizeAction,
};
