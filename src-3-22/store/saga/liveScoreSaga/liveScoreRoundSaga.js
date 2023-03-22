import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import { message } from 'antd';
import AppConstants from '../../../themes/appConstants';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_LIVE_SCORE_CREATE_ROUND_FAIL });
  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_CREATE_ROUND_ERROR,
    error: error,
    status: error.status,
  });
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(AppConstants.somethingWentWrong);
}

export function* liveScoreRoundSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreCreateRound,
      action.roundName,
      action.sequence,
      action.competitionID,
      action.divisionId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_CREATE_ROUND_SUCCESS,
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

export function* liveScoreRoundListSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreRound,
      action.competitionID,
      action.divisionId,
      action.isParent,
      action.compOrgId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_ROUND_LIST_SUCCESS,
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

export function* liveScoreExcludedRoundListSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.getRoundsWithExcludedMatches, action.competitionId
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_EXCLUDED_ROUND_LIST_SUCCESS,
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