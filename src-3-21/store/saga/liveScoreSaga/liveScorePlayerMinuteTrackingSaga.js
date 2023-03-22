import { put, call, takeEvery } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import { message } from 'antd';
import AppConstants from '../../../themes/appConstants';
import history from '../../../util/history';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_LIVE_SCORE_PLAYER_MINUTE_TRACKING_FAIL });
  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_PLAYER_MINUTE_TRACKING_ERROR,
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

// Record player minute
export function* liveScorePlayerMinuteRecordSaga(action) {
  try {
    /*const actionResult = yield call(
      LiveScoreAxiosApi.liveScorePlayerActionSave,
      action.playerActions,
    )
    if (actionResult.status !== 1) {
      yield call(failSaga, result);
      return;
    }*/

    const result = yield call(
      LiveScoreAxiosApi.liveScorePlayerMinuteRecord,
      action.payload,
      action.matchId,
    );
    if (result.status === 1) {
      message.success(result.result.data.message);
      yield put({
        type: ApiConstants.API_LIVE_SCORE_PLAYER_MINUTE_RECORD_SUCCESS,
        status: result.status,
        payload: result.result.data,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Fetch player minute tracking list
export function* liveScorePlayerMinuteTrackingListSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScorePlayerMinuteTrackingList, action);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_PLAYER_MINUTE_TRACKING_LIST_SUCCESS,
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

export default function* rootLiveScorePlayerMinuteTrackingSaga() {
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_PLAYER_MINUTE_RECORD_LOAD,
    liveScorePlayerMinuteRecordSaga,
  );
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_PLAYER_MINUTE_TRACKING_LIST_LOAD,
    liveScorePlayerMinuteTrackingListSaga,
  );
}
