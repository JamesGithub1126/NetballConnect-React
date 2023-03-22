import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import { message } from 'antd';
import AppConstants from '../../../themes/appConstants';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_ASSIGN_UMPIRE_FAIL });
  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_ASSIGN_UMPIRE_ERROR,
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

/////get the umpire assign list
export function* getAssignUmpireListSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.getAssignUmpiresList,
      action.competitionId,
      action.venueId,
      action.body,
      action.userId,
      action.showRosterAvailability,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_ASSIGN_UMPIRE_LIST_SUCCESS,
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

//////////assign umpire to a match
export function* assignUmpireSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.assignUmpire, action.payload, action.rosterLocked);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ASSIGN_UMPIRE_FROM_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
        index: action.index,
        umpireKey: action.umpireKey,
        sameUmpire: action.sameUmpire,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

/////unassign umpire from the match(delete)
export function* unassignUmpireSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.unassignUmpire,
      action.rosterId,
      action.rosterLocked,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UNASSIGN_UMPIRE_FROM_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
        index: action.index,
        umpireKey: action.umpireKey,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}
