import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import { message } from 'antd';
import AppConstants from '../../../themes/appConstants';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_LIVE_SCORE_GAME_TIME_STATISTICS_FAIL });
  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_GAME_TIME_STATISTICS_ERROR,
    error: error,
    status: error.status,
  });
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(AppConstants.somethingWentWrong);
}

export function* liveScoreGameTimeStatisticsSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.gameTimeStatistics,
      action.competitionId,
      action.aggregate,
      action.offset,
      action.limit,
      action.searchText,
      action.sortBy,
      action.sortOrder,
      action.isParent,
      action.compOrgId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_GAME_TIME_STATISTICS_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
        // navigation: action.navigation
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}
