import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import { message } from 'antd';
import history from '../../../util/history';
import AppConstants from '../../../themes/appConstants';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_LADDERS_LIST_FAIL,
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
    type: ApiConstants.API_LIVE_SCORE_LADDERS_LIST_ERROR,
    error: error,
    status: error.status,
  });
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(AppConstants.somethingWentWrong);
}

//////get the competition fee list in registration
export function* liveScoreLaddersDivisionsaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreLadderDivision, action.competitionID);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_LADDERS_DIVISION_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      let divisionId = result.result.data[0];
      const listResult = yield call(LiveScoreAxiosApi.liveScoreLadderList, divisionId);
      if (listResult.status === 1) {
        yield put({
          type: ApiConstants.API_LIVE_SCORE_LADDERS_LIST_SUCCESS,
          result: listResult.result.data,
          status: listResult.status,
        });
      } else {
        yield put({
          type: ApiConstants.API_LIVE_SCORE_LADDERS_LIST_FAIL,
        });
        setTimeout(() => {
          alert(result.data.message);
        }, 800);
      }
    } else {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_LADDERS_DIVISION_FAIL,
      });
      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_LIVE_SCORE_LADDERS_DIVISION_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* liveScoreLaddersListSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreLadderList,
      action.divisionID,
      action.competitionID,
      action.compKey,
      action.isFullLadder,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_LADDERS_LIST_SUCCESS,
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

export function* ladderAdjustmentPostSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.ladderAdjustmentPostData, action.data);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LADDER_ADJUSTMENT_POST_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      history.push('/matchDayLadderList');
      message.success('LadderAdjustment - Updated Successfully.');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* ladderAdjustmentGetSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.ladderAdjustmentGetData, action.data);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LADDER_ADJUSTMENT_GET_SUCCESS,
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

export function* liveScoreResetLadderSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.resetLadderPoints, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_RESET_LADDER_SUCCESS,
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
