import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import CompetitionAxiosApi from '../../http/competitionHttp/competitionAxiosApi';
import { message } from 'antd';
import CommonAxiosApi from '../../http/commonHttp/commonAxiosApi';

export function* venueTimeSaga(action) {
  try {
    const commResult = yield call(CommonAxiosApi.getCommonData);
    if (commResult.status === 1) {
      const result = yield call(
        CompetitionAxiosApi.venueConstraintList,
        action.yearRefId,
        action.competitionUniqueKey,
        action.organisationId,
      );
      if (result.status === 1) {
        yield put({
          type: ApiConstants.API_VENUE_CONSTRAINTS_LIST_SUCCESS,
          commResult: commResult.result.data,
          result: result.result.data,
          status: result.status,
        });
      } else {
        yield put({
          type: ApiConstants.API_VENUE_CONSTRAINTS_LIST_SUCCESS,
          commResult: commResult.result.data,
          result: [],
          status: result.status,
        });
      }
    } else {
      yield put({
        type: ApiConstants.API_VENUE_CONSTRAINTS_LIST_FAIL,
      });
      setTimeout(() => {
        // alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_VENUE_CONSTRAINTS_LIST_ERROR,
      error: error,
      status: error.status,
    });
    setTimeout(() => {
      message.error('Something went wrong.');
    }, 800);
  }
}

export function* venueConstraintPostSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.venueConstraintPost, action.data);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_VENUE_CONSTRAINT_POST_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      setTimeout(() => {
        message.success(result.result.data.message);
      }, 800);
    } else {
      yield put({
        type: ApiConstants.API_VENUE_CONSTRAINT_POST_FAIL,
        error: result,
        status: result.status,
      });
      setTimeout(() => {}, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_VENUE_CONSTRAINT_POST_ERROR,
      error: error,
      status: error.status,
    });
    setTimeout(() => {
      message.error('Something went wrong.');
    }, 800);
  }
}
