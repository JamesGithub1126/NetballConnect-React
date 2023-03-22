import { put, call } from 'redux-saga/effects';
import { message } from 'antd';
import ApiConstants from '../../../themes/apiConstants';
import AxiosApi from '../../http/registrationHttp/registrationAxiosApi';

function* failSaga(result, type) {
  yield put({
    type,
    error: result,
    status: result.status,
  });
  setTimeout(() => {
    message.error(result.result.data.message);
  }, 800);
}

function* errorSaga(error, type) {
  yield put({
    type,
    error,
    status: error.status,
  });
  setTimeout(() => {
    // message.error(error.result.data.message);
    message.error('Something went wrong.');
  }, 800);
}

/// /// EndUserRegistration Save
export function* endUserRegistrationSaveSaga(action) {
  try {
    const result = yield call(AxiosApi.saveEndUserRegistration, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_END_USER_REGISTRATION_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result, ApiConstants.API_END_USER_REGISTRATION_FAIL);
    }
  } catch (error) {
    yield call(errorSaga, error, ApiConstants.API_END_USER_REGISTRATION_ERROR);
  }
}

/// /// Org Registration Registration Settings
export function* orgRegistrationRegistrationSettings(action) {
  try {
    const result = yield call(AxiosApi.getOrgRegistrationRegistrationSettings, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ORG_REGISTRATION_REG_SETTINGS_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result, ApiConstants.API_END_USER_REGISTRATION_FAIL);
    }
  } catch (error) {
    yield call(errorSaga, error, ApiConstants.API_END_USER_REGISTRATION_ERROR);
  }
}

/// /// EndUserRegistration Membership Products
export function* endUserRegistrationMembershipProducts(action) {
  try {
    const result = yield call(AxiosApi.getEndUserRegMembershipProducts, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_MEMBERSHIP_PRODUCT_END_USER_REG_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result, ApiConstants.API_END_USER_REGISTRATION_FAIL);
    }
  } catch (error) {
    yield call(errorSaga, error, ApiConstants.API_END_USER_REGISTRATION_ERROR);
  }
}

export function* endUserRegDashboardListSaga(action) {
  try {
    const result = yield call(
      AxiosApi.endUserRegDashboardList,
      action.payload,
      action.sortBy,
      action.sortOrder,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_REG_DASHBOARD_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result, ApiConstants.API_USER_REG_DASHBOARD_LIST_FAIL);
    }
  } catch (error) {
    yield call(errorSaga, error, ApiConstants.API_USER_REG_DASHBOARD_LIST_ERROR);
  }
}

export function* updateRegTransactionSaga(action) {
  try {
    const result = yield call(AxiosApi.updateRegTransaction, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_TRANSACTION_UPDATE_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result, ApiConstants.API_USER_REG_DASHBOARD_LIST_FAIL);
    }
  } catch (error) {
    yield call(errorSaga, error, ApiConstants.API_USER_REG_DASHBOARD_LIST_ERROR);
  }
}

export function* exportRegistrationSaga(action) {
  try {
    const result = yield call(AxiosApi.exportRegistraion, action.params);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_EXPORT_REGISTRATION_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result, ApiConstants.API_USER_REG_DASHBOARD_LIST_FAIL);
    }
  } catch (error) {
    yield call(errorSaga, error, ApiConstants.API_USER_REG_DASHBOARD_LIST_ERROR);
  }
}
