import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import UmpireAxiosApi from 'store/http/umpireHttp/umpireAxios';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_UMPIRE_FAIL });

  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_UMPIRE_ERROR,
    error: error,
    status: error.status,
  });

  if (error.status === 400) {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(error && error.error ? error.error : AppConstants.somethingWentWrong);
  } else {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(AppConstants.somethingWentWrong);
  }
}

function* umpirePaymentListSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.umpirePaymentList, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_UMPIRE_PAYMENT_DATA_SUCCESS,
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

function* umpirePaymentsListLinkedOrganisationsSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.getCompetitionLinkedOrganisationsList, action.competitionId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UMPIRE_LINKED_ORGANISATION_LIST_SUCCESS,
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

function* umpirePaymentTransferSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.umpirePaymentTransfer, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UMPIRE_PAYMENT_TRANSFER_DATA_SUCCESS,
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

function* umpirePaymenExportSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.umpirePaymentExport, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UMPIRE_PAYMENT_EXPORT_FILE_SUCCESS,
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

function* umpirePaymentSettingsGetSaga(action) {
  try {
    const result = yield call(UmpireAxiosApi.umpirePaymentSettingsGet, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_UMPIRE_PAYMENT_SETTINGS_SUCCESS,
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

function* umpirePaymentSettingsSaveSaga(action) {
  try {
    const result = yield call(UmpireAxiosApi.umpirePaymentSettingsPost, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_UMPIRE_PAYMENT_SETTINGS_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success(AppConstants.settingsUpdatedMessage);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* getAdminListSaga(action) {
  try {
    const result = yield call(UmpireAxiosApi.getAdminList, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_ADMIN_LIST_DATA_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* umpirePaymentActionSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.umpirePaymentAction, action.data);

    if (result.status === 1) {
      message.success(result.result.data.message);
    } else {
      message.error(result.result.data.message);
    }
    yield put({
      type: ApiConstants.API_UMPIRE_PAYMENT_ACTION_SUCCESS,
      result: result.result.data,
      status: result.status,
    });
  } catch (error) {
    message.success(AppConstants.errorMessage);
    yield call(errorSaga, error);
  }
}

export default function* rootUmpirePaymentSaga() {
  yield takeEvery(ApiConstants.API_GET_UMPIRE_PAYMENT_DATA_LOAD, umpirePaymentListSaga);
  yield takeEvery(ApiConstants.API_UMPIRE_PAYMENT_TRANSFER_DATA_LOAD, umpirePaymentTransferSaga);
  yield takeEvery(ApiConstants.API_UMPIRE_LINKED_ORGANISATION_LIST_LOAD, umpirePaymentsListLinkedOrganisationsSaga);
  yield takeEvery(ApiConstants.API_UMPIRE_PAYMENT_EXPORT_FILE_LOAD, umpirePaymenExportSaga);
  yield takeEvery(ApiConstants.API_GET_UMPIRE_PAYMENT_SETTINGS_LOAD, umpirePaymentSettingsGetSaga);
  yield takeEvery(
    ApiConstants.API_SAVE_UMPIRE_PAYMENT_SETTINGS_LOAD,
    umpirePaymentSettingsSaveSaga,
  );
  yield takeEvery(ApiConstants.API_GET_ADMIN_LIST_DATA_LOAD, getAdminListSaga);
  yield takeEvery(ApiConstants.API_UMPIRE_PAYMENT_ACTION_LOAD, umpirePaymentActionSaga);
}
