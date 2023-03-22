import ApiConstants from '../../../themes/apiConstants';

const initialState = {
  onLoad: false,
  error: null,
  status: 0,
  dashboardIncidentList: null,
  dashboardNewsList: null,
  dashboardMatchList: null,
  onSingleGameLoad: false,
  onSingleGameRedeemPayLoad: false,
  playersToPayList: [],
  singleGameDataList: [],
  liveScorePlayerstoPayListPage: 1,
  liveScorePlayerstoPayListPageSize: 10,
  liveScorePlayerstoPayListTotalCount: 1,
  liveScoreSingleGameListPage: 1,
  liveScoreSingleGameListPageSize: 10,
  liveScoreSingleGameListTotalCount: 0,
  liveScoreTotalPageSize: 10,
};

function liveScoreDashboardsReducer(state = initialState, action) {
  switch (action.type) {
    //LiveScore Dashboard List
    case ApiConstants.API_LIVE_SCORE_DASHBOARD_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_DASHBOARD_SUCCESS:
      return {
        ...state,
        onLoad: false,
        dashboardIncidentList: action.result.incident,
        dashboardNewsList: action.result.news,
        dashboardMatchList: action.result.match,
        liveScoreTotalPageSize: action.result.totalPageSize,
      };

    //Match Day SingleGame List
    case ApiConstants.API_LIVE_SCORE_SINGLE_GAME_LIST_LOAD:
      return { ...state, onSingleGameLoad: true };

    case ApiConstants.API_LIVE_SCORE_SINGLE_GAME_LIST_SUCCESS:
      return {
        ...state,
        onSingleGameLoad: false,
        singleGameDataList: action.result.singleGameData,
        liveScoreSingleGameListPage: action.result.page ? action.result.page.currentPage : 1,
        liveScoreSingleGameListTotalCount: action.result.page ? action.result.page.totalCount : 0,
      };

    case ApiConstants.SET_LIVE_SCORE_SINGLE_GAME_LIST_PAGE_SIZE:
      return {
        ...state,
        liveScoreSingleGameListPageSize: action.pageSize,
      };

    //Match Day SingleGame Pay Redeem
    case ApiConstants.API_LIVE_SCORE_SINGLE_GAME_REDEEM_PAY_LOAD:
      return { ...state, onSingleGameRedeemPayLoad: true };

    case ApiConstants.API_LIVE_SCORE_SINGLE_GAME_REDEEM_PAY_SUCCESS:
      return {
        ...state,
        onSingleGameRedeemPayLoad: false,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_DASHBOARD_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        onRetryPaymentLoad: false,
        retryPaymenDetails: null,
        retryPaymentMessage: null,
        retryPaymentSuccess: false,
      };
    case ApiConstants.API_LIVE_SCORE_DASHBOARD_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        onRetryPaymentLoad: false,
        retryPaymenDetails: null,
        retryPaymentMessage: null,
        retryPaymentSuccess: false,
      };

    case ApiConstants.API_LIVE_SCORE_PLAYERS_TO_PAY_LIST_LOAD:
      return { ...state, onPlayersToPayLoad: true };

    case ApiConstants.API_LIVE_SCORE_PLAYERS_TO_PAY_LIST_SUCCESS:
      return {
        ...state,
        onPlayersToPayLoad: false,
        playersToPayList: action.result.playersToPay,
        liveScorePlayerstoPayListPage: action.result.page ? action.result.page.currentPage : 1,
        liveScorePlayerstoPayListTotalCount: action.result.page ? action.result.page.totalCount : 0,
      };

    case ApiConstants.API_LIVE_SCORE_PLAYERS_TO_PAY_RETRY_PAYMENT_LOAD:
      return { ...state, onRetryPaymentLoad: true };

    case ApiConstants.API_LIVE_SCORE_PLAYERS_TO_PAY_RETRY_PAYMENT_SUCCESS:
      return {
        ...state,
        onRetryPaymentLoad: false,
        retryPaymentMessage: action.result.message,
        retryPaymentSuccess: action.result.success,
        checkCardAvailability: action.result.cardAvailability,
        retryPaymenDetails: action.result,
      };

    case ApiConstants.API_LIVE_SCORE_PLAYERS_TO_PAY_CASH_RECEIVED_LOAD:
      return { ...state, onRetryPaymentLoad: true };

    case ApiConstants.API_LIVE_SCORE_PLAYERS_TO_PAY_CASH_RECEIVED_SUCCESS:
      return {
        ...state,
        onRetryPaymentLoad: false,
        retryPaymentMessage: action.result.message,
        retryPaymentSuccess: action.result.success,
      };

    case ApiConstants.SET_LIVE_SCORE_DASHBOARD_LIST_PAGE_SIZE:
      return {
        ...state,
        liveScorePlayerstoPayListPageSize: action.pageSize,
        liveScoreSingleGameListPageSize: action.pageSize,
      };

    case ApiConstants.SET_LIVE_SCORE_DASHBOARD_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        liveScorePlayerstoPayListPage: action.pageNum,
        liveScoreSingleGameListPage: action.pageNum,
      };

    case ApiConstants.CLEAR_SINGLE_GAME_DATA_LIST:
      return {
        ...state,
        singleGameDataList: [],
      };

    default:
      return state;
  }
}

export default liveScoreDashboardsReducer;
