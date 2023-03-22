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

/* Get the Ladder Format */
export function* getLadderFormatSaga(action) {
  try {
    const result = yield call(CompManagementAxiosApi.getLadderFormat, action);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_LADDER_FORMAT_SUCCESS,
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

/* Save the Ladder Format */
export function* saveLadderFormatSaga(action) {
  try {
    const result = yield call(CompManagementAxiosApi.saveLadderFormat, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_LADDER_FORMAT_SUCCESS,
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
