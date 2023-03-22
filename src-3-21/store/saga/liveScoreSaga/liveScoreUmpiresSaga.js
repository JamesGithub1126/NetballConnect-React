import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';
import history from 'util/history';
import { receiptImportResult } from 'util/showImportResult';
import LiveScoreAxiosApi from 'store/http/liveScoreHttp/liveScoreAxiosApi';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_LIVE_SCORE_UMPIRES_FAIL });

  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_UMPIRES_ERROR,
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

function* liveScoreUmpiresSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.umpiresList, action.competitionId, action.body);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_UMPIRES_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
        // navigation: action.navigation,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* liveScoreUmpiresImportSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.umpireImport, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_UMPIRES_IMPORT_SUCCESS,
        result: result.result.data,
        status: result.status,
        // navigation: action.navigation,
      });

      if (Object.keys(result.result.data.error).length === 0) {
        history.push('/matchDayUmpireList');
        message.success('Umpire Imported Successfully.');
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

function* getUmpireAvailabilitySaga(action) {
  const { fromTime, endTime, userId } = action;
  try {
    const result = yield call(
      LiveScoreAxiosApi.getUmpireAvailabilityList,
      userId,
      fromTime,
      endTime,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_GET_UMPIRE_AVAILABILITY_SUCCESS,
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

///////////get umpire availability list
function* saveUmpireAvailabilitySaga(action) {
  try {
    const { postData, fromTime, endTime, userId } = action;
    const updateResult = yield call(
      LiveScoreAxiosApi.saveUmpireAvailabilityList,
      postData,
      userId,
      fromTime,
      endTime,
    );

    if (updateResult.status === 1) {
      const result = yield call(
        LiveScoreAxiosApi.getUmpireAvailabilityList,
        userId,
        fromTime,
        endTime,
      );

      if (result.status === 1) {
        yield put({
          type: ApiConstants.API_LIVE_SCORE_SAVE_UMPIRE_AVAILABILITY_SUCCESS,
          result: result.result.data,
          status: result.status,
        });
        message.success('Schedule successfully updated');
      } else {
        yield call(failSaga, result);
      }
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export default function* rootLiveScoreUmpiresSaga() {
  yield takeEvery(ApiConstants.API_LIVE_SCORE_UMPIRES_LIST_LOAD, liveScoreUmpiresSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_UMPIRES_IMPORT_LOAD, liveScoreUmpiresImportSaga);
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_GET_UMPIRE_AVAILABILITY_LOAD,
    getUmpireAvailabilitySaga,
  );
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_SAVE_UMPIRE_AVAILABILITY_LOAD,
    saveUmpireAvailabilitySaga,
  );
}
