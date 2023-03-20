import { put, call } from 'redux-saga/effects';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import ApiConstants from '../../../themes/apiConstants';
import { message } from 'antd';
import AppConstants from '../../../themes/appConstants';
import RegistrationAxiosApi from '../../http/registrationHttp/registrationAxiosApi';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_PER_MATCH_FAIL,
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
    type: ApiConstants.API_LIVE_SCORE_PER_MATCH_ERROR,
    error: error,
    status: error.status,
  });
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(AppConstants.somethingWentWrong);
}

export function* liveScorePerMatchListSaga(action) {
  try {
    const result = yield call(RegistrationAxiosApi.getPerMatchList, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_PER_MATCH_LIST_SUCCESS,
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
export function* liveScorePerMatchPaySaga(action) {
  try {
    const result = yield call(RegistrationAxiosApi.payPerMatchFee, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_PER_MATCH_PAY_SUCCESS,
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
