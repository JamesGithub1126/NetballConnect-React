import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import CompManagementAxiosApi from '../../http/competitionManagementHttp/competitionManagementAxiosApi';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_COMPETITION_FEES_FAIL });
  setTimeout(() => {
    alert(result.message);
  }, 800);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_COMPETITION_FEES_ERROR,
    error: error,
    status: error.status,
  });
}

/* Get the Competition Finals */
export function* getCompetitionFinalsSaga(action) {
  try {
    const result = yield call(CompManagementAxiosApi.getCompetitonFinals, action);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COMPETITION_FINALS_SUCCESS,
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

/* Save the Competition Finals */
export function* saveCompetitionFinalsSaga(action) {
  try {
    const result = yield call(CompManagementAxiosApi.saveCompetitionFinals, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_COMPETITION_FINALS_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else if (result.status === 4) {
      yield put({
        type: ApiConstants.API_SAVE_COMPETITION_FINALS_SUCCESS,
        result: result.result.data.message,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

/* getDownloadTemplateSaga*/
export function* getDownloadTemplateSaga(action) {
  try {
    const result = yield call(CompManagementAxiosApi.getTemplateDownload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_TEMPLATE_DOWNLOAD_SUCCESS,
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
