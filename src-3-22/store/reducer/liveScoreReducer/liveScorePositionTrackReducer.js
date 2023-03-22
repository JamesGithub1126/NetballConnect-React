import ApiConstants from '../../../themes/apiConstants';
import liveScorePositionTrackModal from '../../objectModel/liveScorePositionTrackModal';

const initialState = {
  onLoad: false,
  error: null,
  status: 0,
  positionTrackResult: [],
  totalCount: 1,
  currentPage: 1,
  pageSize: 10,
};
function LiveScorePositionTrackState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_POSITION_TRACKING_LOAD:
      return { ...state, onLoad: true, positionTrackResult: [] };

    case ApiConstants.API_LIVE_SCORE_POSITION_TRACKING_SUCCESS:
      let positionTrackData = liveScorePositionTrackModal.getPositionTrackListData(
        action.result.results,
        action.reporting);

      return {
        ...state,
        onLoad: false,
        positionTrackResult: positionTrackData,
        totalCount: action.result.page.totalCount,
      };

    case ApiConstants.API_LIVE_SCORE_POSITION_TRACKING_FAIL:
      return { ...state, onLoad: false };

    case ApiConstants.API_LIVE_SCORE_POSITION_TRACKING_ERROR:
      return {
        ...state,
        onLoad: false,
      };

    case ApiConstants.SET_LIVE_SCORE_POSITION_TRACK_REPORT_PAGE_SIZE:
      return {
        ...state,
        pageSize: action.pageSize,
      };

    case ApiConstants.SET_LIVE_SCORE_POSITION_TRACK_REPORT_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        currentPage: action.pageNum,
      };

    default:
      return state;
  }
}

export default LiveScorePositionTrackState;
