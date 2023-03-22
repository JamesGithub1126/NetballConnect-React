import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import AppConstants from '../../../themes/appConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import { message } from 'antd';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_LIVE_SCORE_GET_FIXTURE_COMP_FAIL });
  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_GET_FIXTURE_COMP_ERROR,
    error: error,
    status: error.status,
  });
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(AppConstants.somethingWentWrong);
}

//// get manager list
export function* getLiveScoreFixtureCompSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.getFixtureCompList, action.orgId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_GET_FIXTURE_COMP_SUCCESS,
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
