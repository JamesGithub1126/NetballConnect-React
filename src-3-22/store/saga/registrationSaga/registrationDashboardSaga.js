import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import AxiosApi from '../../http/registrationHttp/registrationAxiosApi';
import { message } from 'antd';

function* failSaga(result) {
  console.log('failSaga', result.result.data.message);
  yield put({
    type: ApiConstants.API_REG_DASHBOARD_LIST_FAIL,
    error: result,
    status: result.status,
  });
  setTimeout(() => {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(result.result.data.message);
  }, 800);
}

function* errorSaga(error) {
  console.log('errorSaga', error);
  yield put({
    type: ApiConstants.API_REG_DASHBOARD_LIST_ERROR,
    error: error,
    status: error.status,
  });

  setTimeout(() => {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error('Something went wrong.');
  }, 800);
}

//////get the membership fee list in registration
export function* regDashboardListSaga(action) {
  try {
    const result = yield call(
      AxiosApi.registrationDashboardList,
      action.offset,
      action.limit,
      action.yearRefId,
      action.sortBy,
      action.sortOrder,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_DASHBOARD_LIST_SUCCESS,
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

//////get the membership fee list in registration
export function* getCompetitionSaga(action) {
  try {
    const result = yield call(AxiosApi.getAllCompetitionList, action.yearRefId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_ALL_COMPETITION_SUCCESS,
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

///////////////////registration main dashboard listing owned and participate registration
export function* registrationMainDashboardListSaga(action) {
  try {
    const result = yield call(
      AxiosApi.registrationMainDashboardList,
      action.yearRefId,
      action.sortBy,
      action.sortOrder,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_REGISTRATION_MAIN_DASHBOARD_LISTING_SUCCESS,
        result: result.result.data,
        status: result.status,
        key: action.key,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

////////////////// Registration Status Update Failed
export function* registrationFailedStatusUpdateSaga(action) {
  try {
    const result = yield call(AxiosApi.updateRegistrationFailedStatus, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REGISTRATION_FAILED_STATUS_UPDATE_SUCCESS,
        result: result.result.data,
        status: result.status,
        key: action.key,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* registrationRequestFundsOfflineSaga(action) {
  try {
    const result = yield call(AxiosApi.requestFundsOffline, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REGISTRATION_REQUEST_FUNDS_OFFLINE_SUCCESS,
        result: result.result.data,
        status: result.status,
        key: action.key,
      });
      message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* registrationMarkOfflineAsPaidSaga(action) {
  try {
    const result = yield call(AxiosApi.markOfflineAsPaid, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REGISTRATION_MARK_OFFLINE_AS_PAID_SUCCESS,
        result: result.result.data,
        status: result.status,
        key: action.key,
      });
      message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* registrationRetryPaymentSaga(action) {
  try {
    const result = yield call(AxiosApi.registrationRetryPayment, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REGISTRATION_RETRY_PAYMENT_SUCCESS,
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

export function* exportGovernmentVouchersSaga(action) {
  try {
    const result = yield call(AxiosApi.exportGovernmentVoucher, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REGISTRATION_DASHBOARD_EXPORT_VOUCHER_SUCCESS,
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
