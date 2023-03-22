import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';
import history from 'util/history';
import { receiptImportResult } from 'util/showImportResult';
import LiveScoreAxiosApi from 'store/http/liveScoreHttp/liveScoreAxiosApi';
import UserAxiosApi from 'store/http/userHttp/userAxiosApi';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_LIVE_SCORE_COACH_FAIL });

  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_COACH_ERROR,
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

function* liveScoreCoachSaga(action) {
  try {
    const result = yield call(
      UserAxiosApi.liveScoreCoachesList,
      action.roleId,
      action.entityId,
      action.search,
      action.offset,
      action.limit,
      action.sortBy,
      action.sortOrder,
      action.isParent,
      action.competitionId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_COACH_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
        navigation: action.navigation,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* liveScoreAddCoachSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreAddCoach,
      action.data,
      action.teamId,
      action.existingManagerId,
      action.compOrgId,
      action.isParent,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_ADD_EDIT_COACH_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      message.success('Add Coach - Successfully Added');

      history.push('/matchDayCoaches');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* liveScoreCoachImportSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreCoachImport, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_COACH_IMPORT_SUCCESS,
        result: result.result.data,
      });

      if (Object.keys(result.result.data.error).length === 0) {
        history.push('/matchDayCoaches');
        message.success('Coach Imported Successfully.');
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

export default function* rootLiveScoreCoachSaga() {
  yield takeEvery(ApiConstants.API_LIVE_SCORE_COACH_LIST_LOAD, liveScoreCoachSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_ADD_EDIT_COACH_LOAD, liveScoreAddCoachSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_COACH_IMPORT_LOAD, liveScoreCoachImportSaga);
}
