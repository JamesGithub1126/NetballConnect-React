import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_LIVE_SCORE_SCORER_LIST_FAIL });

  const msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_SCORER_LIST_ERROR,
    error,
    status: error.status,
  });

  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(AppConstants.somethingWentWrong);
}

function* liveScoreDivisionSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreGetDivision, action.competitionID);

    if (result.status === 1) {
      const divisionId = result.result.data[0];
      const listResult = yield call(
        LiveScoreAxiosApi.liveScoreLadderList,
        divisionId.id,
        action.competitionID,
      );

      if (listResult.status === 1) {
        const teamResult = yield call(LiveScoreAxiosApi.liveScoreTeam, action.competitionID);
        if (teamResult.status === 1) {
          const roundResult = yield call(LiveScoreAxiosApi.liveScoreRound, action.competitionID);
          if (roundResult.status === 1) {
            yield put({
              type: ApiConstants.API_LIVE_SCORE_DIVISION_SUCCESS,
              divisionList: result.result.data,
              ladderList: listResult.result.data,
              teamResult: teamResult.result.data,
              roundResult: roundResult.result.data,
              status: listResult.status,
            });
          }
        }
      }
    } else {
      yield put({ type: ApiConstants.API_LIVE_SCORE_DIVISION_FAIL });
      setTimeout(() => {
        alert(result);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_LIVE_SCORE_DIVISION_ERROR,
      error,
      status: error.status,
    });
  }
}

// Get manager list
function* getLiveScoreScorerSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.getLiveScoreScorerList,
      action.competitionId,
      action.roleId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_GET_SCORER_LIST_SUCCESS,
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

function* getLiveScoreAvailableScorerSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.getLiveScoreAvailableScorerList,
      action.data,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_GET_AVAILABLE_SCORER_LIST_SUCCESS,
        result: result.result.data,
        roleId: action.data.roleId,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export default function* rootLiveScoreSaga() {
  yield takeEvery(ApiConstants.API_LIVE_SCORE_DIVISION_LOAD, liveScoreDivisionSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_GET_SCORER_LIST_LOAD, getLiveScoreScorerSaga);
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_GET_AVAILABLE_SCORER_LIST_LOAD,
    getLiveScoreAvailableScorerSaga,
  );
}
