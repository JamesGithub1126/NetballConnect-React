import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import AppConstants from '../../../themes/appConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import { message } from 'antd';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_LIVE_SCORE_GET_GAME_POSITION_LIST_FAIL });
  const msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_GET_GAME_POSITION_LIST_ERROR,
    error: error,
    status: error.status,
  });
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(AppConstants.somethingWentWrong);
}

// Get liveScore game position list
export function* liveScoreGamePositionSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreGamePositions, action.sportRefId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_GET_GAME_POSITION_LIST_SUCCESS,
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

// Get liveScore game stats list
export function* liveScoreGameStatsSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreGameStats, action.sportRefId, action.getDeleted);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_GET_GAME_STATS_LIST_SUCCESS,
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
