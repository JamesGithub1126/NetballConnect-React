import { put, call } from 'redux-saga/effects';
import { message } from 'antd';

import ApiConstants from '../../../themes/apiConstants';
import AxiosApi from '../../http/registrationHttp/registrationAxiosApi';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_REGISTRATION_CHANGE_FAIL,
    error: result,
    status: result.status,
  });
  setTimeout(() => {
    message.error(result.result.data.message);
  }, 800);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_REGISTRATION_CHANGE_ERROR,
    error,
    status: error.status,
  });
  setTimeout(() => {
    // message.error(error.result.data.message);
    message.error('Something went wrong.');
  }, 800);
}

// Save DeRegister Data
export function* saveDeRegisterSaga(action) {
  try {
    const result = yield call(AxiosApi.saveDeRegister, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_DE_REGISTRATION_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Get Registration Change Dashboard
export function* getRegistrationChangeDashboardSaga(action) {
  try {
    const result = yield call(
      AxiosApi.getRegistrationChangeDashboard,
      action.payload,
      action.sortBy,
      action.sortOrder,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_REGISTRATION_CHANGE_DASHBOARD_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* exportRegistrationChangeSaga(action) {
  try {
    const result = yield call(
      AxiosApi.exportRegistrationChangeDashboard,
      action.payload,
      action.sortBy,
      action.sortOrder,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_REGISTRATION_CHANGE_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Get Registration Change Review
export function* getRegistrationChangeReviewSaga(action) {
  try {
    const result = yield call(AxiosApi.getRegistrationChangeReview, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_REGISTRATION_CHANGE_REVIEW_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Save Registration Change Review
export function* saveRegistrationChangeReviewSaga(action) {
  try {
    const result = yield call(AxiosApi.saveRegistrationChangeReview, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_REGISTRATION_CHANGE_REVIEW_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* saveRefundedOfflineSaga(action) {
  try {
    const result = yield call(AxiosApi.refundedOffline, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REGISTRATION_CHANGE_REFUNDED_OFFLINE_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Get getTransferOrganisations
export function* getTransferOrganisationsSaga(action) {
  try {
    const result = yield call(AxiosApi.getTransferOrganisationsData, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_TRANSFER_COMPETITIONS_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* getMoveCompDataSaga(action) {
  try {
    const result = yield call(AxiosApi.getMoveCompData, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_MOVE_COMP_DATA_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* moveCompetitionSaga(action) {
  try {
    const result = yield call(AxiosApi.moveCompetition, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_MOVE_COMPETITION_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result, ApiConstants.API_REGISTRATION_CHANGE_FAIL);
    }
  } catch (error) {
    yield call(errorSaga, error, ApiConstants.API_REGISTRATION_CHANGE_ERROR);
  }
}

////// Get DeRegister Data
export function* getDeRegisterSaga(action) {
  try {
    const result = yield call(AxiosApi.getDeRegisterData, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_DE_REGISTRATION_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}
