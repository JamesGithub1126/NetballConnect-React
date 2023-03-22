import ApiConstants from '../../../themes/apiConstants';

function liveScorePerMatchListAction(payload) {
  return {
    type: ApiConstants.API_LIVE_SCORE_PER_MATCH_LIST_LOAD,
    payload,
  };
}
function liveScorePerMatchPayAction(payload) {
  return {
    type: ApiConstants.API_LIVE_SCORE_PER_MATCH_PAY_LOAD,
    payload,
  };
}
export { liveScorePerMatchListAction, liveScorePerMatchPayAction };
