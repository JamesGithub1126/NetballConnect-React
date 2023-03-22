import { put, call } from 'redux-saga/effects';

import ApiConstants from 'themes/apiConstants';
import AxiosApi from 'store/http/axiosApi';

function* roleSaga(action) {
  try {
    const result = yield call(AxiosApi.role, action);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ROLE_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_ROLE_FAIL });
      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_ROLE_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* ureSaga(action) {
  try {
    const result = yield call(AxiosApi.ure, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_URE_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_URE_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_URE_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export default function* rootRoleSaga() {}
