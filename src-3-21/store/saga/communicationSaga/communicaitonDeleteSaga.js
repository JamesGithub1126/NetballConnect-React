import { put, call } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';
import communicationAxiosApi from '../../http/communicationHttp/communicationAxiosApi';
import liveScoreAxiosApi from 'store/http/liveScoreHttp/liveScoreAxiosApi';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_DELETE_COMMUNICATION_FAIL });

  const msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_DELETE_COMMUNICATION_ERROR,
    error,
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

export function* communicationDeleteSaga(action) {
  try {
    const result = yield call(communicationAxiosApi.deleteCommunication, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_DELETE_COMMUNICATION_SUCCESS,
        result: action.data,
        status: result.status,
      });
      let newsId = result.result.data.newsId;
      if (newsId) {
        yield call(liveScoreAxiosApi.liveScorePublish_Notify, { id: result.result.data.newsId }, true);
        yield call(liveScoreAxiosApi.liveScoreDeleteNews, result.result.data.newsId);
      }
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}
