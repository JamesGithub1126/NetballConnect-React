import { put, call } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_INNER_HORIZONTAL_FAIL });
  const msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_INNER_HORIZONTAL_ERROR,
    error,
    status: error.status,
  });
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(AppConstants.somethingWentWrong);
}

// get manager list
// eslint-disable-next-line import/prefer-default-export
export function* getInnerHorizontalCompSaga(action) {
  try {
    const result =
      action.compData.length > 1
        ? {
            status: 1,
            result: { data: action.compData },
          }
        : yield call(
            LiveScoreAxiosApi.innerHorizontalCompList,
            action.organisationId,
            action.yearRefId,
          );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_INNER_HORIZONTAL_COMPETITION_LIST_SUCCESS,
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
