import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import AppConstants from '../../../themes/appConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import { message } from 'antd';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_LIVE_SCORE_BULK_MATCH_FAIL });
  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_BULK_MATCH_ERROR,
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

////Bulk push back saga
export function* liveScoreBulkPushBack(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.bulkMatchPushBack,
      action.pushBackData,
      action.start_Date,
      action.end_Date,
      action.bulkRadioBtn,
      action.formatedNewDate,
      action.payload,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_BULK_PUSH_BACK_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success('Push Back - Added Sucessfully');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

////Bulk bring forward saga
export function* liveScoreBulkBringForwardSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreBringForward,
      action.competitionID,
      action.data,
      action.start_Date,
      action.end_Date,
      action.bulkRadioBtn,
      action.formatedNewDate,
      action.payload,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_BULK_BRING_FORWARD_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success('Bring Forward - Added Sucessfully');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

//// Bulk end matches saga
export function* liveScoreEndMatchesSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreEndMatches,
      action.data,
      action.start_Date,
      action.end_Date,
      action.payload,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_BULK_END_MATCHES_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success('End Match - Added Sucessfully');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

//// Bulk end matches saga
export function* liveScoreDoubleHeaderSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreDoubleHeader,
      action.competitionID,
      action.data,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_BULK_DOUBLE_HEADER_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success('Double Header - Added Sucessfully');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

//// Bulk end matches saga
export function* liveScoreAbandonMatchSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreAbandonMatch,
      action.data,
      action.startDate,
      action.endDate,
      action.competitionID,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_BULK_ABANDON_MATCH_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success('Abandon Match - Added Sucessfully');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* liveScorePostponeMatchSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScorePostponeMatch,
      action.data,
      action.startDate,
      action.endDate,
      action.competitionID,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_BULK_POSTPONE_MATCH_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success('Postpone Match - Added Sucessfully');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

//// Bulk end matches saga
export function* liveScoreMatchResult(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreMatchResult);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_MATCH_RESULT_SUCCESS,
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
