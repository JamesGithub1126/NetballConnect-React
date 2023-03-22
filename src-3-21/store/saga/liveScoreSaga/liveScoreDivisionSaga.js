import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';
import history from 'util/history';
import { receiptImportResult } from 'util/showImportResult';
import LiveScoreAxiosApi from 'store/http/liveScoreHttp/liveScoreAxiosApi';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_ONLY_DIVISION_FAIL,
    error: result,
    status: result.status,
  });

  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_ONLY_DIVISION_ERROR,
    error: error,
    status: error.status,
  });

  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(AppConstants.somethingWentWrong);
}

// Get the Division list
function* liveScoreDivisionSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreGetDivision,
      action.competitionID,
      action.compKey,
      action.sortBy,
      action.sortOrder,
      action.isParent,
      action.compOrgId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_ONLY_DIVISION_SUCCESS,
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

function* liveScoreCreateDivisionSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreCreateDivision,
      action.name,
      action.divisionName,
      action.gradeName,
      action.competitionId,
      action.divisionId,
      action.positionTracking,
      action.recordGoalAttempts,
      action.timeoutsData,
      action.gameTimeTracking,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_CREATE_DIVISION_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      history.push('/matchDayDivisionList');

      message.success('Division created successfully');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Delete Team Saga
function* liveScoreDeleteDivisionSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreDeleteDivision, action.divisionId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_DELETE_DIVISION_SUCCESS,
        status: result.status,
      });

      history.push('/matchDayDivisionList');

      message.success('Division Deleted Successfully.');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Import Saga
function* liveScoreDivisionImportSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreDivisionImport, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_DIVISION_IMPORT_SUCCESS,
        result: result.result.data,
      });

      if (Object.keys(result.result.data.error).length === 0) {
        history.push('/matchDayDivisionList');
        message.success('Division Imported Successfully.');
      } else {
        receiptImportResult(result.result);
      }
    } else {
      yield call(failSaga, result);
    }
  } catch (e) {
    yield call(errorSaga, e);
  }
}

// Main Division List
function* liveScoreMainDivisionListSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreGetMainDivisionList,
      action.competitionID,
      action.offset,
      action.limit,
      action.sortBy,
      action.sortOrder,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_MAIN_DIVISION_LIST_SUCCESS,
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

export default function* rootLiveScoreDivisionSaga() {
  yield takeEvery(ApiConstants.API_LIVE_SCORE_ONLY_DIVISION_LOAD, liveScoreDivisionSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_CREATE_DIVISION_LOAD, liveScoreCreateDivisionSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_DELETE_DIVISION_LOAD, liveScoreDeleteDivisionSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_DIVISION_IMPORT_LOAD, liveScoreDivisionImportSaga);
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_MAIN_DIVISION_LIST_LOAD,
    liveScoreMainDivisionListSaga,
  );
}
