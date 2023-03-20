import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import { message } from 'antd';
import AppConstants from '../../../themes/appConstants';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_LIVE_SCORE_GOAL_FAIL });
  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_GOAL_ERROR,
    error: error,
    status: error.status,
  });
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(AppConstants.somethingWentWrong);
}

export function* liveScoreGoalSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreGoalList,
      action.competitionID,
      action.goalType,
      action.search,
      action.offset,
      action.limit,
      action.sortBy,
      action.sortOrder,
      action.divisionId,
      action.roundId,
      action.isParent,
      action.compOrgId,
      action.sportRefId,
      action.isEnhanced,
      action.selectedStats,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_GOAL_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
        goalType: action.goalType,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* liveScoreGoalByPlayerSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreGoalByPlayerList,
      action.competitionID,
      action.goalType,
      action.search,
      action.offset,
      action.limit,
      action.sortBy,
      action.sortOrder,
      action.isParent,
      action.compOrgId,
      action.sportRefId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_GOAL_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
        goalType: action.goalType,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}
