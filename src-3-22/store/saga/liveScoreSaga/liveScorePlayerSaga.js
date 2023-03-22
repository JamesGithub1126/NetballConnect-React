import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';
import history from 'util/history';
import { receiptImportResult } from 'util/showImportResult';
import LiveScoreAxiosApi from 'store/http/liveScoreHttp/liveScoreAxiosApi';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_PLAYER_FAIL,
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
  yield put({
    type: ApiConstants.API_LIVE_SCORE_PLAYER_ERROR,
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

// Player list saga
function* liveScorePlayerSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScorePlayerList,
      action.competitionID,
      action.teamId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_PLAYER_LIST_SUCCESS,
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

// Add/Edit player saga
function* liveScoreAddEditPlayerSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreAddEditPlayer, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_ADD_EDIT_PLAYER_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      message.config({
        duration: 1.5,
        maxCount: 1,
      });
      message.success(
        action.playerId ? 'Player Edited Successfully.' : 'Player Added Successfully.',
      );

      // history.push(action.temaViewPlayer ? "/matchDayTeamView" : "/matchDayPlayerList", { tableRecord: action.data.teamId });
      history.push(
        action.propsData.screenName === 'fromMatchList' ||
          action.propsData.screenName === 'fromTeamList'
          ? '/matchDayTeamView'
          : '/matchDayPlayerList',
        { ...action.propsData },
      );
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Match Import
function* liveScorePlayerImportSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScorePlayerImport,
      action.competitionId,
      action.csvFile,
      action.key,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_PLAYER_IMPORT_SUCCESS,
        result: result.result.data,
      });

      if (Object.keys(result.result.data.error).length === 0) {
        history.push('/matchDayPlayerList');
        message.success('Player Imported Successfully.');
      } else {
        receiptImportResult(result.result);
      }
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Delete Player Saga
function* liveScoreDeletePlayerSaga(action) {
  const { playerListActionObject } = action;
  const correctLimit = playerListActionObject.limit || 10;
  const newTotalCount = playerListActionObject.totalCount - 1;
  const lastPlayerOnPage = newTotalCount - playerListActionObject.offset === 0;
  const correctOffset = lastPlayerOnPage
    ? Math.max(playerListActionObject.offset - correctLimit, 0)
    : playerListActionObject.offset;

  try {
    const deleteResult = yield call(LiveScoreAxiosApi.liveScoreDeletePlayer, action.playerId);
    if (deleteResult.status === 1) {
      if (playerListActionObject.key) {
        yield put({
          type: ApiConstants.API_LIVE_SCORE_DELETE_PLAYER_SUCCESS,
          status: deleteResult.status,
        });
        message.success('Player Deleted Successfully.');
        history.push('/matchDayPlayerList');
      } else {
        const result = yield call(
          LiveScoreAxiosApi.getPlayerWithPagination,
          playerListActionObject.competitionId,
          correctOffset,
          correctLimit,
          playerListActionObject.search,
          playerListActionObject.sortBy,
          playerListActionObject.sortOrder,
          playerListActionObject.isParent,
        );
        if (result.status === 1) {
          yield put({
            type: ApiConstants.API_LIVE_SCORE_PLAYER_LIST_PAGINATION_SUCCESS,
            result: result.result.data,
            status: result.status,
          });
          message.success('Player Deleted Successfully.');
        } else {
          yield put({
            type: ApiConstants.API_LIVE_SCORE_DELETE_PLAYER_SUCCESS,
            status: result.status,
          });
          message.success('Player Deleted Successfully.');
        }
      }
    } else {
      yield call(failSaga, deleteResult);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Player list pagination
function* getPlayerListPaginationSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.getPlayerWithPagination,
      action.competitionID,
      action.offset,
      action.limit,
      action.search,
      action.sortBy,
      action.sortOrder,
      action.isParent,
      action.competitionOrganisationId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_PLAYER_LIST_PAGINATION_SUCCESS,
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

// Player list search
function* getPlayerListSearchSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScorePlayerSearchList,
      action.competitionId,
      action.competitionOrganisationId,
      action.matchId,
      action.name,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_PLAYER_LIST_SEARCH_SUCCESS,
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

export default function* rootLiveScorePlayerSaga() {
  yield takeEvery(ApiConstants.API_LIVE_SCORE_PLAYER_LIST_LOAD, liveScorePlayerSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_ADD_EDIT_PLAYER_LOAD, liveScoreAddEditPlayerSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_PLAYER_IMPORT_LOAD, liveScorePlayerImportSaga);
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_PLAYER_LIST_PAGINATION_LOAD,
    getPlayerListPaginationSaga,
  );
  yield takeEvery(ApiConstants.API_LIVE_SCORE_PLAYER_LIST_SEARCH_LOAD, getPlayerListSearchSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_DELETE_PLAYER_LOAD, liveScoreDeletePlayerSaga);
}
