import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import CompetitionAxiosApi from '../../http/competitionHttp/competitionAxiosApi';
import { message } from 'antd';

export function* competitionModuleSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.competitionYear);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_YEAR_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_GET_YEAR_FAIL });
      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_GET_YEAR_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* competitonGenerateDrawSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.competitionGenerateDraw, action.payload);
    let msg = result.result.data.message;
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GENERATE_DRAW_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      if (result.result.data.level === 'warning' && msg) {
        showMessage('warning', msg);
      }
    } else {
      yield put({ type: ApiConstants.API_GENERATE_DRAW_FAIL, status: result.status });
      showMessage('error', msg);
    }
  } catch (error) {
    console.log('error' + error);
    yield put({
      type: ApiConstants.API_GENERATE_DRAW_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function showMessage(level, msg) {
  setTimeout(() => {
    message.config({
      duration: 5,
      maxCount: 1,
    });
    message[level](JSON.stringify(msg));
  }, 800);
}
