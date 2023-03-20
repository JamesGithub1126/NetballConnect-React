import { put, call } from 'redux-saga/effects';
import { message } from 'antd';

import ApiConstants from '../../../themes/apiConstants';
import AxiosApi from '../../http/registrationHttp/registrationAxiosApi';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_REG_CLEARANCE_FAIL,
    error: result,
    status: result.status,
  });
  setTimeout(() => {
    message.error(result.result.data.message);
  }, 800);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_REG_CLEARANCE_ERROR,
    error,
    status: error.status,
  });
  setTimeout(() => {
    // message.error(error.result.data.message);
    message.error('Something went wrong.');
  }, 800);
}

// Get All Competitions
export function* registrationCompetitionsSaga(action) {
  try {
    const result = yield call(
      AxiosApi.registrationCompetitionList,
      action.yearId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_REG_COMPETITIONS_SUCCESS,
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
export function* getRegistrationClearanceSaga(action) {
  try {
    const result = yield call(
      AxiosApi.getRegistrationClearance,
      action.payload,
      action.sortBy,
      action.sortOrder,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_REG_CLEARANCE_SUCCESS,
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

export function* getPastRegForClearanceSaga(action) {
  try {
    const result = yield call(
      AxiosApi.clearanceGetPastRegistrations,
      action.payload,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_CLEARANCE_GET_PAST_REG_SUCCESS,
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

export function* changeClearanceApproverSaga(action) {
  try {
    const result = yield call(AxiosApi.clearanceChangeApprover, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_CLEARANCE_CHANGE_APPROVER_SUCCESS,
        status: result.status,
      });
      message.config({ maxCount: 1, duration: 1.5 });
      message.success('Successfully Updated');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Get Registration Change Export
export function* exportRegistrationClearanceSaga(action) {
  try {
    const result = yield call(
      AxiosApi.exportRegistrationClearance,
      action.payload,
      action.sortBy,
      action.sortOrder,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_CLEARANCE_EXPORT_SUCCESS,
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

export function* approveRegistrationClearanceSaga(action) {
  try {
    const result = yield call(AxiosApi.approveRegistrationClearance, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_CLEARANCE_APPROVE_SUCCESS,
        result: {
          approval: action.payload.approval,
          records: result.result.data,
        },
        status: result.status,
      });
      message.config({ maxCount: 1, duration: 1.5 });
      message.success('Successfully Updated');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* saveRegistrationClearanceSaga(action) {
  try {
    const result = yield call(AxiosApi.saveRegistrationClearance, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_CLEARANCE_SAVE_SUCCESS,
        status: result.status,
      });
      message.config({ maxCount: 1, duration: 1.5 });
      message.success('Successfully Updated');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* exportRegistrationChangeSaga(action) {
  try {
    const result = yield call(AxiosApi.exportRegistrationChangeDashboard, action.payload);
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
