import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import { message } from 'antd';
import history from '../../../util/history';
import AppConstants from '../../../themes/appConstants';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_NEWS_SAGA_FAIL });
  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_NEWS_SAGA_ERROR,
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

////News List
export function* liveScoreNewsListSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreNewsList, action.competitionId, action.sortBy, action.sortOrder);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_NEWS_LIST_SUCCESS,
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

////News AddNews
export function* liveScoreAddNewsSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreAddNews, action.data);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_ADD_NEWS_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success(
        action.data.newsId ? 'News edited successfully.' : 'News added successfully.',
      );
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// get notification of news publish

export function* liveScoreNewsNotificationSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScorePublish_Notify, action.data, action.value);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVESCORE_NEWS_NOTIFICATION_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      // message.success(action.newsId ? 'News Edited Successfully.' : 'News Added Successfully .');
      //screenKey
      history.push({
        pathname: '/matchDayNewsList',
        state: { screenKey: action.screenKey },
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* liveScoreNewsDeleteSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreDeleteNews, action.id);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_DELETE_NEWS_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success('News Deleted Successfully.');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}
