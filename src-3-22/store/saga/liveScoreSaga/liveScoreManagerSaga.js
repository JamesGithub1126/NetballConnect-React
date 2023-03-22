import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';
import history from 'util/history';
import { receiptImportResult } from 'util/showImportResult';
import LiveScoreAxiosApi from 'store/http/liveScoreHttp/liveScoreAxiosApi';
import UserAxiosApi from 'store/http/userHttp/userAxiosApi';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_LIVE_SCORE_MANAGER_FAIL });

  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  console.log(error);
  yield put({
    type: ApiConstants.API_LIVE_SCORE_MANAGER_ERROR,
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

// Get manager list
function* liveScoreManagerListSaga(action) {
  try {
    const result = yield call(
      UserAxiosApi.liveScoreManagerList,
      action.roleId,
      action.entityTypeId,
      action.entityId,
      action.searchText,
      action.offset,
      action.sortBy,
      action.sortOrder,
      action.compOrgId,
      action.isParent,
      action.limit,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_MANAGER_LIST_SUCCESS,
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

// Add/Edit Manager Saga
function* liveScoreAddEditManagerSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreAddEditManager,
      action.data,
      action.compOrgId,
      action.isParent,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_ADD_EDIT_MANAGER_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      message.success('Add Manager - Successfully Added');

      history.push('/matchDayManagerList');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Search Manager Saga
function* liveScoreManagerSearchSaga(action) {
  try {
    const result = yield call(
      UserAxiosApi.liveScoreSearchManager,
      action.data,
      action.competitionOrgId,
      action.roleId,
    );

    if (result) {
      if (result.status === 1) {
        yield put({
          type: ApiConstants.API_LIVESCORE_MANAGER_SEARCH_SUCCESS,
          result: result.result.data,
          status: result.status,
        });
      } else {
        yield call(failSaga, result);
      }
    } else {
      yield put({
        type: ApiConstants.API_LIVESCORE_MANAGER_SEARCH_SUCCESS,
        result: [],
      });
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* liveScoreManagerImportSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreManagerImport, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_MANAGER_IMPORT_SUCCESS,
        result: result.result.data,
      });

      if (Object.keys(result.result.data.error).length === 0) {
        history.push('/matchDayManagerList');
        message.success('Manager Imported Successfully.');
      } else {
        receiptImportResult(result.result);
      }
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export default function* rootLiveScoreManagerSaga() {
  yield takeEvery(ApiConstants.API_LIVE_SCORE_MANAGER_LIST_LOAD, liveScoreManagerListSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_ADD_EDIT_MANAGER_LOAD, liveScoreAddEditManagerSaga);
  yield takeEvery(ApiConstants.API_LIVESCORE_MANAGER_SEARCH_LOAD, liveScoreManagerSearchSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_MANAGER_IMPORT_LOAD, liveScoreManagerImportSaga);
}
