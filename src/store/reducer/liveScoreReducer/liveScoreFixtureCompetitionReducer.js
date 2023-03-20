import ApiConstants from '../../../themes/apiConstants';

const initialState = {
  onLoad: false,
  error: null,
  result: null,
  status: 0,
  comptitionList: [],
};

function liveScoreFixturCompState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_GET_FIXTURE_COMP_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_GET_FIXTURE_COMP_SUCCESS:
      return {
        ...state,
        onLoad: false,
        comptitionList: action.result,
      };

    case ApiConstants.API_LIVE_SCORE_GET_FIXTURE_COMP_FAIL:
      return { ...state, onLoad: false };

    case ApiConstants.API_LIVE_SCORE_GET_FIXTURE_COMP_ERROR:
      return { ...state, onLoad: false };
    default:
      return state;
  }
}

export default liveScoreFixturCompState;
