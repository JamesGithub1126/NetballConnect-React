import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import CompManagementAxiosApi from '../../http/competitionManagementHttp/competitionManagementAxiosApi';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_COMPETITION_FORMAT_FAIL,
    error: result,
    status: result.status,
  });
  setTimeout(() => {
    alert(result.message);
  }, 800);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_COMPETITION_FORMAT_ERROR,
    error: error,
    status: error.status,
  });
}

/* Get the Competition Format */
export function* getCompetitionFormatSaga(action) {
  try {
    const result = yield call(CompManagementAxiosApi.getCompetitionFormat, action);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COMPETITION_FORMAT_SUCCESS,
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

/* Save the Competition Format */
export function* saveCompetitionFormatSaga(action) {
  try {
    const result = yield call(CompManagementAxiosApi.saveCompetitionFormat, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_COMPETITION_FORMAT_SUCCESS,
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
