import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';
import history from 'util/history';
import { receiptImportResult } from 'util/showImportResult';
import LiveScoreAxiosApi from 'store/http/liveScoreHttp/liveScoreAxiosApi';
import CompetitionAxiosApi from 'store/http/competitionHttp/competitionAxiosApi';

function* failSaga(result) {
  console.log(result);
  yield put({
    type: ApiConstants.API_LIVE_SCORE_TEAM_FAIL,
    error: result,
    status: result.status,
  });

  const msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  console.log(error);
  yield put({
    type: ApiConstants.API_LIVE_SCORE_TEAM_ERROR,
    error,
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

function* liveScoreTeamSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreTeam,
      action.competitionID,
      action.divisionId,
      action.compOrgId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_TEAM_SUCCESS,
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

// Team View Player List Saga
function* liveScoreTeamViewPlayerListSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreTeamViewPlayerList, action.teamId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_TEAM_VIEW_PLAYER_LIST_SUCCESS,
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

// Delete Team Saga
function* liveScoreDeleteTeamSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreDeleteTeam, action.teamId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_DELETE_TEAM_SUCCESS,
        status: result.status,
      });

      history.push('/matchDayTeam');

      message.success('Team Deleted Successfully.');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Delete Player Saga

function* liveScoreDeletePlayerSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreDeletePlayer, action.playerId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_DELETE_TEAM_PLAYER_SUCCESS,
        status: result.status,
      });
      history.push('/matchDayTeam');
      message.success('Player Deleted Successfully.');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* liveScoreTeamDivisionSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreGetDivision, action.payload);

    if (result.status === 1) {
      yield put({ type: ApiConstants.GET_DIVISION_SUCCESS, payload: result.result.data });
    } else {
      yield call(failSaga, result);
    }
  } catch (e) {
    yield call(errorSaga, e);
  }
}

function* liveScoreAffiliateSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreGetAffiliate, action.payload);

    if (result.status === 1) {
      yield put({ type: ApiConstants.GET_AFFILIATE_SUCCESS, payload: result.result.data });
    } else {
      yield call(failSaga, result);
    }
  } catch (e) {
    yield call(errorSaga, e);
  }
}

function* addTeamLiveScoreSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreAddNewTeam, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_ADD_TEAM_SUCCESS,
        screenKey: action.screenKey,
      });

      message.success(
        action.teamId
          ? 'Team has been updated Successfully'
          : 'Team has been created Successfully.',
      );

      history.push(
        action.key
          ? 'matchDayDashboard'
          : action.screenKey === 'umpire'
          ? 'umpire'
          : '/matchDayTeam',
      );

      let updateCompData = {
        teamUniqueKey: action.teamUniqueKey ? action.teamUniqueKey : '',
        name: result.result.data.name,
      };
      if (action.sourceIdAvailable === true && action.teamUniqueKey) {
        const result1 = yield call(CompetitionAxiosApi.updateCompTeamName, updateCompData);
        if (result1.status === 1) {
          yield put({
            type: ApiConstants.API_LIVE_SCORE_UPDATE_COMP_TEAM_NAME_SUCCESS,
            payload: result1.result.data,
          });
        }
      }
    } else {
      yield call(failSaga, result);
    }
  } catch (e) {
    yield call(errorSaga, e);
  }
}

function* liveScoreTeamImportSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreTeamImport, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_TEAM_IMPORT_SUCCESS,
        result: result.result.data,
      });

      if (Object.keys(result.result.data.error).length === 0) {
        history.push('/matchDayTeam');
        message.success('Team Imported Successfully.');
      } else {
        receiptImportResult(result.result);
      }
    } else {
      yield call(failSaga, result);
    }
  } catch (e) {
    yield call(errorSaga, e);
  }
}

function* liveScoreGetTeamSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreGetTeamData, action.teamId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_GET_TEAM_SUCCESS,
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

// Team list with paging
function* liveScoreTeamPagingSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.getTeamWithPaging,
      action.competitionID,
      action.offset,
      action.limit,
      action.search,
      action.sortBy,
      action.sortOrder,
      action.competitionOrganisationId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_TEAM_WITH_PAGING_SUCCESS,
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

function* liveScoreGetRoundsSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.getRounds, action.competitionId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_GET_ROUNDS_SUCCESS,
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

export default function* rootLiveScoreTeamSaga() {
  yield takeEvery(ApiConstants.API_LIVE_SCORE_TEAM_LOAD, liveScoreTeamSaga);
  yield takeEvery(ApiConstants.API_GET_TEAM_VIEW_PLAYER_LIST_LOAD, liveScoreTeamViewPlayerListSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_DELETE_TEAM_LOAD, liveScoreDeleteTeamSaga);
  yield takeEvery(ApiConstants.GET_DIVISION_TEAM, liveScoreTeamDivisionSaga);
  yield takeEvery(ApiConstants.GET_AFFILIATE_TEAM, liveScoreAffiliateSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_ADD_TEAM_LOAD, addTeamLiveScoreSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_TEAM_IMPORT_LOAD, liveScoreTeamImportSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_GET_TEAM_LOAD, liveScoreGetTeamSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_TEAM_WITH_PAGING_LOAD, liveScoreTeamPagingSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_DELETE_TEAM_PLAYER_LOAD, liveScoreDeletePlayerSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_GET_ROUNDS_LOAD, liveScoreGetRoundsSaga);
}
