import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';
// import history from "util/history";
// import { receiptImportResult } from "util/showImportResult";
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

function* umpireAllocationSettingsGetSaga(action) {
  try {
    const result = yield call(UmpireAxiosApi.umpireAllocationSettingsGet, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_UMPIRE_ALLOCATION_SETTINGS_SUCCESS,
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

function* umpireAllocationSettingsPostSaga(action) {
  try {
    const result = yield call(UmpireAxiosApi.umpireAllocationSettingsPost, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_UMPIRE_ALLOCATION_SETTINGS_SUCCESS,
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

export default function* rootUmpireSettingsSaga() {
  yield takeEvery(
    ApiConstants.API_GET_UMPIRE_ALLOCATION_SETTINGS_LOAD,
    umpireAllocationSettingsGetSaga,
  );
  yield takeEvery(
    ApiConstants.API_SAVE_UMPIRE_ALLOCATION_SETTINGS_LOAD,
    umpireAllocationSettingsPostSaga,
  );
}
