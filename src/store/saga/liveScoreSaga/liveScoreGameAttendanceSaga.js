import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import ApiConstants from '../../../themes/apiConstants';
import AppConstants from '../../../themes/appConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_LIVE_SCORE_GAME_ATTENDANCE_FAIL });
  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_GAME_ATTENDANCE_ERROR,
    error: error,
    status: error.status,
  });
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(AppConstants.somethingWentWrong);
}

// Get game attendance
export function* liveScoreGameAttendanceList(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreGameAttendanceList, {
      matchId: action.matchId,
      teamId: action.teamId,
    });
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_GAME_ATTENDANCE_LIST_SUCCESS,
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

// Export game attendance
export function* liveScoreExportGameAttendance(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreExportGameAttendance, {
      matchId: action.matchId,
      teamId: action.teamId,
      body: action.payload,
    });
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_EXPORT_ATTENDANCE_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.info(AppConstants.exportAttendanceMessage);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export default function* liveScoreGameAttendanceSaga() {
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_EXPORT_ATTENDANCE_LOAD,
    liveScoreExportGameAttendance,
  );
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_GAME_ATTENDANCE_LIST_LOAD,
    liveScoreGameAttendanceList,
  );
}
