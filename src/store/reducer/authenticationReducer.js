import ApiConstants from 'themes/apiConstants';
import { setAuthToken, setUserId } from 'util/sessionStorage';
import { setSignDate } from '../../util/sessionStorage';

const initialState = {
  onLoad: false,
  error: null,
  result: null,
  status: 0,
  loggedIn: false,
  forgotPasswordMessage: '',
  forgotPasswordSuccess: false,
  validateQRFailed: false,
};

function login(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LOGIN_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LOGIN_SUCCESS:
      return {
        ...state,
        onLoad: false,
        result: {
          ...action.result,
          userName: action.loginData.payload.userName,
          password: action.loginData.payload.password,
        },
        status: action.status,
      };

    case ApiConstants.API_LOGIN_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LOGIN_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_QR_CODE_LOAD:
      return { ...state, onLoad: true, validateQRFailed: false };

    case ApiConstants.API_QR_CODE_SUCCESS:
      setUserId(action.result.user.id);
      setAuthToken(action.result.authToken);
      setSignDate(action.result.signDate);
      window.location.reload();

      return {
        ...state,
        onLoad: false,
        result: action.result,
        status: action.status,
      };

    case ApiConstants.API_QR_CODE_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        validateQRFailed: true,
      };

    case ApiConstants.API_QR_CODE_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        validateQRFailed: true,
      };

    // forgot password
    case ApiConstants.API_FORGOT_PASSWORD_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        forgotPasswordMessage: action.result.message ? action.result.message : '',
        onLoad: false,
        forgotPasswordSuccess: true,
        status: action.status,
      };

    // clear reducer
    case ApiConstants.ACTION_TO_CLEAR_AUTHENTICATION_REDUCER:
      if (action.key === 'forgotPasswordSuccess') {
        state.forgotPasswordSuccess = false;
      }
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    default:
      return state;
  }
}

export default login;
