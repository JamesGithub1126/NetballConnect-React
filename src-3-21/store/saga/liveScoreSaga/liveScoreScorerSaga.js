import { put, call } from 'redux-saga/effects';
import { message } from 'antd';

import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import ApiConstants from '../../../themes/apiConstants';
import history from '../../../util/history';
import userHttpApi from '../../http/userHttp/userAxiosApi';
import AppConstants from '../../../themes/appConstants';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_LIVE_SCORE_SCORER_LIST_FAIL });
  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_SCORER_LIST_ERROR,
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

//// get manager list
export function* liveScoreScorerListSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreScorerList,
      action.competitionId,
      action.roleId,
      action.body,
      action.search,
      action.sortBy,
      action.sortOrder,
      action.liveScoreCompIsParent,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_SCORER_LIST_SUCCESS,
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

//// Add/Edit Scorer Saga
export function* liveScoreAddEditScorerSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreAddEditScorer,
      action.body,
      action.teamId,
      action.existingScorerId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_ADD_EDIT_SCORER_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success('Add Scorer - Successfully Added');
      if (action.isEdit) {
        history.push('/matchDayScorerList');
      } else {
        history.push('/matchDayAssignMatch', { record: result.result.data });
      }
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* liveScoreAssigneMatches(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.getAssignMatchesList,
      action.competitionId,
      action.teamId,
      action.body,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVESCORE_ASSIGN_MATCHES_SUCCESS,
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

// Assign Match saga
export function* liveScoreChangeAssignStatus(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.changeAssignStatus,
      action.roleId,
      action.records,
      action.teamID,
      action.teamkey,
      action.scorer_Id,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVESCORE_ASSIGN_CHANGE_STATUS_SUCCESS,
        result: result.result.data,
        status: result.status,
        index: action.index,
        scorerKey: action.scorerKey,
      });
      message.success('Match assign successfully.');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Unassign Match status
export function* liveScoreUnAssignMatcheSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.unAssignMatcheStatus, action.records);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVESCORE_UNASSIGN_STATUS_SUCCESS,
        result: result.result.data,
        status: result.status,
        index: action.index,
        scorerKey: action.scorerKey,
      });
      message.success('Match unassign successfully.');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Scorer search api saga
export function* liveScoreScorerSearchSaga(action) {
  try {
    const result = yield call(
      userHttpApi.scorerSearchApi,
      action.roleId,
      action.entityTypeId,
      action.competitionId,
      action.searchText,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVESCORE_SCORER_SEARCH_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      // message.success('Match unassign successfully.')
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}
