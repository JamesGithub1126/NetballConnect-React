import ApiConstants from '../../themes/apiConstants';
import { Encrypt, Decrypt } from '../../util/encryption';
import { JwtEncrypt, JwtDecrypt } from '../../util/jwt';
import history from '../../util/history';

const initialState = {
  onLoad: false,
  error: null,
  result: null,
  status: 0,
};

function role(state = initialState, action) {
  switch (action.type) {
    // Reference for Roles
    case ApiConstants.API_ROLE_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_ROLE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        result: action.result,
        status: action.status,
      };

    case ApiConstants.API_ROLE_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_ROLE_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    // User Role Entity List for current  user
    case ApiConstants.API_URE_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_URE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        result: action.result,
        status: action.status,
      };

    case ApiConstants.API_URE_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_URE_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    default:
      return state;
  }
}

export default role;
