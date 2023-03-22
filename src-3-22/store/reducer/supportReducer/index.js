import ApiConstants from '../../../themes/apiConstants';

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
};

function supportReducer(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_SUPPORT_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_SUPPORT_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_SUPPORT_CONTENT_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_SUPPORT_CONTENT_SUCCESS:
      return {
        ...state,
        onLoad: false,
        result: action.result,
        status: action.status,
        error: null,
      };

    default:
      return state;
  }
}

export default supportReducer;
