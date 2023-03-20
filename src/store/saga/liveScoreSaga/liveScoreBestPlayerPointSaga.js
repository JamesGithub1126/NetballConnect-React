import { put, call } from 'redux-saga/effects';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import ApiConstants from '../../../themes/apiConstants';
import { message } from 'antd';
import AppConstants from '../../../themes/appConstants';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_BEST_PLAYER_POINT_FAIL,
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
    type: ApiConstants.API_LIVE_SCORE_BEST_PLAYER_POINT_ERROR,
    error: error,
    status: error.status,
  });
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(AppConstants.somethingWentWrong);
}

export function* liveScoreBestPlayerPointListSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreBestPlayerPointList,
      action.competitionId,
      action.body,
      action.select_status,
      action.divisionId,
      action.roundName,
      action.compOrgId,
      action.typeRefId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_BEST_PLAYER_POINT_LIST_SUCCESS,
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
