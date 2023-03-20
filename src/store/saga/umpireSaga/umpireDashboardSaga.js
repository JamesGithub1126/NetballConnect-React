import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';
import history from 'util/history';
import { receiptImportResult } from 'util/showImportResult';
import LiveScoreAxiosApi from 'store/http/liveScoreHttp/liveScoreAxiosApi';
import CommonAxiosApi from 'store/http/commonHttp/commonAxiosApi';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_UMPIRE_FAIL });

  let msg = result.result.data
    ? result.result.data.message || AppConstants.somethingWentWrong
    : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_UMPIRE_ERROR,
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

function* umpireListDashboardSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.umpireListDashboard, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_UMPIRE_DASHBOARD_LIST_SUCCESS,
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

function* umpireVenueListSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.getVenueList, action.compId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_UMPIRE_DASHBOARD_VENUE_LIST_SUCCESS,
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

function* umpireDivisionListSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreGetDivision, action.competitionID);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_UMPIRE_DASHBOARD_DIVISION_LIST_SUCCESS,
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

function* umpireImportSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.umpireImport, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UMPIRE_IMPORT_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      if (result.result.data.hasBatchError) {
        message.error(AppConstants.somethingWentWrong);
      } else if (Object.keys(result.result.data.error).length === 0) {
        history.push(action.data.screenName === 'umpireDashboard' ? '/umpireDashboard' : 'umpire');
        message.success(
          action.data.screenName === 'umpireDashboard'
            ? 'Umpire Dashboard Imported Successfully.'
            : result.result.data.message,
        );
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

function* umpireRoundListSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.umpireRoundList,
      action.competitionID,
      action.divisionId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UMPIRE_ROUND_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
        isAllRound: !action.divisionId,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* publishUmpireAllocation(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.publishUmpireAllocation, action.data);

    if (result.status === 1) {
      if (!result.result.data.reload) {
        message.warning(AppConstants.noPublishRoster);
      } else {
        message.success(AppConstants.rosterPublished);
      }
      yield put({
        type: ApiConstants.API_PUBLISH_UMPIRE_ALLOCATION_SUCCESS,
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

function* liveScoreSaveBlockDeclineSaga(payload) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreSaveBlockDecline, payload.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_SAVE_BLOCK_DECLINE_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success('Umpire Block Decline status changed succesfully.');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* liveScoreSaveBlockDeclineDataGetSaga(payload) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreGetBlockDeclineTime, payload.data);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_SAVE_BLOCK_DECLINE_DATA_GET_LOAD_SUCCESS,
        result: result.result.data.result,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export default function* rootUmpireDashboardSaga() {
  yield takeEvery(ApiConstants.API_GET_UMPIRE_DASHBOARD_LIST_LOAD, umpireListDashboardSaga);
  yield takeEvery(ApiConstants.API_GET_UMPIRE_DASHBOARD_VENUE_LIST_LOAD, umpireVenueListSaga);
  yield takeEvery(ApiConstants.API_GET_UMPIRE_DASHBOARD_DIVISION_LIST_LOAD, umpireDivisionListSaga);
  yield takeEvery(ApiConstants.API_UMPIRE_IMPORT_LOAD, umpireImportSaga);
  yield takeEvery(ApiConstants.API_UMPIRE_ROUND_LIST_LOAD, umpireRoundListSaga);
  yield takeEvery(ApiConstants.API_PUBLISH_UMPIRE_ALLOCATION_LOAD, publishUmpireAllocation);
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_SAVE_BLOCK_DECLINE_LOAD,
    liveScoreSaveBlockDeclineSaga,
  );
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_SAVE_BLOCK_DECLINE_DATA_GET_LOAD,
    liveScoreSaveBlockDeclineDataGetSaga,
  );
}
