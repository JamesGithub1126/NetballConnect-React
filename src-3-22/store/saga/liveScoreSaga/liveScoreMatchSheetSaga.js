import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import { message } from 'antd';
import AppConstants from '../../../themes/appConstants';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_MATCH_SHEET_FAIL,
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
    type: ApiConstants.API_LIVE_SCORE_MATCH_SHEET_ERROR,
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
export function* liveScoreDivisionsaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreGetDivision,
      action.competitionID,
      action.compKey,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_ONLY_DIVISION_SUCCESS,
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

export function* liveScoreMatchSheetSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreCreateDivision,
      action.name,
      action.divisionName,
      action.gradeName,
      action.competitionId,
      action.divisionId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_CREATE_DIVISION_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      // history.push("/matchDayDivisionList")
      // message.success("Division created successfully")
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* liveScoreMatchSheetPrintSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreMatchSheetPrint,
      action.competitionId,
      action.divisionId,
      action.teamId,
      action.templateType,
      action.roundName,
      action.venueId,
      action.homeCompetitionOrganisationId,
      action.homeCompetitionOrganisationName,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_MATCH_SHEET_PRINT_SUCCESS,
        status: result.status,
      });
      message.config({ duration: 5, maxCount: 1 });
      message.loading(AppConstants.printProcessing);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* liveScoreBlankMatchSheetPrintSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreBlankMatchSheetPrint,
      action.competitionId,
      action.templateType,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_BLANK_MATCH_SHEET_PRINT_SUCCESS,
        status: result.status,
      });
      message.config({ duration: 5, maxCount: 1 });
      message.loading(AppConstants.printProcessing);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* liveScoreMatchSheetDownloadSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreMatchSheetDownloadList,
      action.competitionId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_MATCH_SHEET_DOWNLOADS_SUCCESS,
        matchSheetDownloads: result.result.data.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}
