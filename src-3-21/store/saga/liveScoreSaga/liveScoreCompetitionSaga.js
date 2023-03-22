import { call, put, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import ApiConstants from 'themes/apiConstants';
import AppConstants from 'themes/appConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';

function* failSaga(result) {
  const msg = result?.result?.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
};

function* errorSaga(error) {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
  
    message.error(AppConstants.somethingWentWrong);
};

function* liveScoreCompetitionSaga({ payload, year, orgKey, recordUmpires, sortBy, sortOrder }) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreCompetition,
      payload,
      year,
      orgKey,
      recordUmpires,
      sortBy,
      sortOrder,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_COMPETITION_SUCCESS,
        payload: result.result.data,
      });
    } else {
      const msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
      message.config({
        duration: 1.5,
        maxCount: 1,
      });
      message.error(msg);
    }
  } catch (error) {
    yield put({ type: ApiConstants.API_LIVE_SCORE_COMPETITION_ERROR, payload: error });
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(AppConstants.somethingWentWrong);
  }
}

function* liveScoreCompetitionDeleteSaga({ payload, key }) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreCompetitionDelete, payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_COMPETITION_DELETE_SUCCESS,
        payload: { id: payload },
        key,
      });
      message.success('Deleted Successfully');
    } else {
      setTimeout(() => {
        message.error(result.result.message || 'Something Went Wrong ');
      }, 800);
      yield put({ type: ApiConstants.API_LIVE_SCORE_COMPETITION_DELETE_ERROR });
    }
  } catch (e) {
    yield put({ type: ApiConstants.API_LIVE_SCORE_COMPETITION_DELETE_ERROR, payload: e });
    setTimeout(() => {
      message.error('Something Went Wrong');
    }, 800);
  }
}

function* liveScoreOwnPartCompetitionListSaga({
  payload,
  orgKey,
  sortBy,
  sortOrder,
  key,
  yearRefId,
}) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreOwnPartCompetitionList,
      payload,
      orgKey,
      sortBy,
      sortOrder,
      yearRefId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVESCORE_OWN_PART_COMPETITION_LIST_SUCCESS,
        payload: result.result.data,
        key,
      });
    } else {
      const msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
      message.config({
        duration: 1.5,
        maxCount: 1,
      });
      message.error(msg);
    }
  } catch (error) {
    yield put({ type: ApiConstants.API_LIVESCORE_OWN_PART_COMPETITION_LIST_ERROR, payload: error });
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(AppConstants.somethingWentWrong);
  }
}

function* liveScoreCompetitionEndSaga({ key, compKey }) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreCompetitionEnd, compKey);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_COMPETITION_END_SUCCESS,
        key,
        payload: {
          compKey,
        },
      });
      message.success('Ended Successfully');
    } else {
      setTimeout(() => {
        message.error(result.result.data.message || 'Something Went Wrong ');
      }, 800);
      yield put({ type: ApiConstants.API_LIVE_SCORE_COMPETITION_END_ERROR });
    }
  } catch (e) {
    yield put({ type: ApiConstants.API_LIVE_SCORE_COMPETITION_END_ERROR, payload: e });
    setTimeout(() => {
      message.error('Something Went Wrong');
    }, 800);
  }
}

function* liveScoreCompChangeVisibilitySaga({ key, compKey, status }) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreCompChangeVisibility, compKey, status);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_COMPETITION_CHANGE_VISIBILITY_SUCCESS,
        key,
        payload: {
          compKey,
          status,
        },
      });
      message.success(result.result.data.message);
    } else {
      setTimeout(() => {
        message.error(result.result.data.message || 'Something Went Wrong ');
      }, 800);
      yield put({ type: ApiConstants.API_LIVE_SCORE_COMPETITION_CHANGE_VISIBILITY_ERROR });
    }
  } catch (e) {
    yield put({
      type: ApiConstants.API_LIVE_SCORE_COMPETITION_CHANGE_VISIBILITY_ERROR,
      payload: e,
    });
    setTimeout(() => {
      message.error('Something Went Wrong');
    }, 800);
  }
}

function* liveScoreCompBestPointList({ payload }) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreCompBestPointList, payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_COMP_BEST_POINT_LIST_SUCCESS,
        payload: result.result.data.playerPoints,
      });
    } else {
      setTimeout(() => {
        message.error(result.result.data.message || 'Something Went Wrong ');
      }, 800);
      yield put({ type: ApiConstants.API_LIVE_SCORE_COMP_BEST_POINT_LIST_ERROR });
    }
  } catch (e) {
    yield put({ type: ApiConstants.API_LIVE_SCORE_COMP_BEST_POINT_LIST_ERROR, payload: e });
    setTimeout(() => {
      message.error('Something Went Wrong');
    }, 800);
  }
}

function* liveScoreCompBestPointUpdate({ payload }) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreCompBestPointUpdate, payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_COMP_BEST_POINT_UPDATE_SUCCESS,
        payload: result.result.data.playerPoints,
      });
      message.success(result.result.data.message);
    } else {
      setTimeout(() => {
        message.error(result.result.data.message || 'Something Went Wrong ');
      }, 800);
      yield put({ type: ApiConstants.API_LIVE_SCORE_COMP_BEST_POINT_UPDATE_ERROR });
    }
  } catch (e) {
    yield put({ type: ApiConstants.API_LIVE_SCORE_COMP_BEST_POINT_UPDATE_ERROR, payload: e });
    setTimeout(() => {
      message.error('Something Went Wrong');
    }, 800);
  }
}

function* bulkLadderExportSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.exportBulkLadder, action.compId, action.exportType);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_BULK_LADDER_EXPORT_FILE_SUCCESS,
        status: result.status,
      });
    } else {
      yield put({
        type: ApiConstants.API_BULK_LADDER_EXPORT_FILE_FAILED,
      });
      yield call(failSaga, result);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_BULK_LADDER_EXPORT_FILE_FAILED,
    });
    yield call(errorSaga, error);
  }
}


export default function* rootLiveScoreCompetitionSaga() {
  yield takeEvery(ApiConstants.API_LIVE_SCORE_COMPETITION_INITIATE, liveScoreCompetitionSaga);
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_COMPETITION_DELETE_INITIATE,
    liveScoreCompetitionDeleteSaga,
  );
  yield takeEvery(
    ApiConstants.API_LIVESCORE_OWN_PART_COMPETITION_LIST_LOAD,
    liveScoreOwnPartCompetitionListSaga,
  );
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_COMPETITION_END_INITIATE,
    liveScoreCompetitionEndSaga,
  );
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_COMPETITION_CHANGE_VISIBILITY_INITIATE,
    liveScoreCompChangeVisibilitySaga,
  );
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_COMP_BEST_POINT_LIST,
    liveScoreCompBestPointList,
  );
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_COMP_BEST_POINT_SAVE,
    liveScoreCompBestPointUpdate,
  );
  yield takeEvery(ApiConstants.API_BULK_LADDER_EXPORT_FILE_LOAD, bulkLadderExportSaga);
}
