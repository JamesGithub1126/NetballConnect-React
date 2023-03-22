import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import SystemConstants from '../../../themes/systemConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import CommonHttpAxiosApi from '../../http/commonHttp/commonAxiosApi';
import { message } from 'antd';
import history from '../../../util/history';
import AppConstants from '../../../themes/appConstants';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_INCIDENT_LIST_FAIL,
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
    type: ApiConstants.API_LIVE_SCORE_INCIDENT_LIST_ERROR,
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

export function* liveScoreSuspensionListSaga({ payload }) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreSuspensionList, payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SUSPENSION_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
        payload,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* liveScoreSuspensionTypeListSaga() {
  try {
    const payload = {
      year: 'year',
      suspensionServedStatus: 'suspensionServedStatus',
    }
    const result = yield call(CommonHttpAxiosApi.getCommonReferenceCall, payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SUSPENSION_TYPE_LIST_SUCCESS,
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

export function* liveScoreSuspensionMatchesListSaga({ payload }) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreSuspensionMatchList, payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SUSPENSION_MATCHES_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
        payload,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* liveScoreSuspensionUpdateMatchesSaga({ payload }) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreSuspensionUpdateMatchs, payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SUSPENSION_UPDATE_MATCHES_SUCCESS,
        result: result.result.data,
        status: result.status,
        payload,
      });
      message.success('Updated Successfully');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}
