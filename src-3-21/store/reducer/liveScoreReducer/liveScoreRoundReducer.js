import ApiConstants from 'themes/apiConstants';

const initialState = {
  onLoad: false,
  error: null,
  result: null,
  status: 0,
  roundList: [],
  excludedRoundList: [],
};

function liveScoreRoundState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_CREATE_ROUND_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_CREATE_ROUND_SUCCESS:
      return {
        ...state,
        onLoad: false,
        result: action.result,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_CREATE_ROUND_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_CREATE_ROUND_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_ROUND_LIST_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_ROUND_LIST_SUCCESS:
      let roundListArray = action.result;
      roundListArray.sort((a, b) => Number(a.sequence) - Number(b.sequence));
      state.roundList = roundListArray;
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.API_CLEAR_ROUND_DATA:
      if (action.key === 'all') {
        state.roundList = [];
        state.divisionList = [];
        state.excludedRoundList = [];
      } else {
        state.roundList = [];
        state.excludedRoundList = [];
      }
      return { ...state };

    case ApiConstants.API_LIVE_SCORE_EXCLUDED_ROUND_LIST_LOAD: {
      return { ...state, onLoad: true };
    }

    case ApiConstants.API_LIVE_SCORE_EXCLUDED_ROUND_LIST_SUCCESS: {
      const excludedRoundList = action.result;
      return { ...state, onLoad: false, excludedRoundList };
    }

    default:
      return state;
  }
}

export default liveScoreRoundState;
