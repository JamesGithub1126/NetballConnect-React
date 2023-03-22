import { put, call } from 'redux-saga/effects';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import ApiConstants from '../../../themes/apiConstants';
import { message } from 'antd';
import AppConstants from '../../../themes/appConstants';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_TEAM_ATTENDANCE_FAIL,
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
    type: ApiConstants.API_LIVE_SCORE_TEAM_ATTENDANCE_ERROR,
    error: error,
    status: error.status,
  });
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(AppConstants.somethingWentWrong);
}

export function* liveScoreTeamAttendanceListSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreAttendanceList,
      action.competitionId,
      action.body,
      action.select_status,
      action.divisionId,
      action.roundId,
      action.isParent,
      action.compOrgId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_TEAM_ATTENDANCE_LIST_SUCCESS,
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
