import { put, call, takeEvery } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import CommonAxiosApi from '../../http/commonHttp/commonAxiosApi';
import { message } from 'antd';
import AppConstants from '../../../themes/appConstants';

function* failSaga(type, result) {
  yield put({ type });
  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(type, error) {
  yield put({
    type: type,
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

export function* liveScorePlayerActionListLoadSaga(action) {
  try {
    const references = yield call(CommonAxiosApi.getCommonReferenceCall, {
      ActionCategory: 'ActionCategory',
      Outcome: 'Outcome',
      Contribution: 'Contribution',
    });
    const result = yield call(
      LiveScoreAxiosApi.liveScorePlayerActionListLoad,
      action.matchId,
      action.teamIds,
    );
    if (references.status === 1 && result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_PLAYER_ACTION_LIST_SUCCESS,
        status: result.status,
        playerActions: result.result.data.playerActions,
        references: references.result.data,
      });
    } else {
      yield call(failSaga, ApiConstants.API_LIVE_SCORE_PLAYER_ACTION_LIST_FAIL, result);
    }
  } catch (error) {
    yield call(errorSaga, ApiConstants.API_LIVE_SCORE_PLAYER_ACTION_LIST_ERROR, error);
  }
}

export default function* rootLiveScorePlayerActionsSaga() {
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_PLAYER_ACTION_LIST_LOAD,
    liveScorePlayerActionListLoadSaga,
  );
}
