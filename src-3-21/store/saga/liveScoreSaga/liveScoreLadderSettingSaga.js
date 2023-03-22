import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import CommonAxiosApi from '../../http/commonHttp/commonAxiosApi';
import { message } from 'antd';
import AppConstants from '../../../themes/appConstants';
import { getLiveScoreCompetition, setLiveScoreCompetition } from '../../../util/sessionStorage';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_LADDER_SETTING_FAIL,
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
    type: ApiConstants.API_LIVE_SCORE_LADDER_SETTING_ERROR,
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

export function* laddersSettingGetMatchResult(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.ladderSettingMatchResult);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LADDER_SETTING_MATCH_RESULT_SUCCESS,
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

export function* laddersSettingGetData(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.laddersSettingGetData, action.competitionId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LADDER_SETTING_GET_DATA_SUCCESS,
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

export function* laddersSettingPostData(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.laddersSettingPostData,
      action.postData,
      action.canUpdatePastPoints,
    );
    if (result.status === 1) {
      const { ladderCalculationTypeId, ladderEndRefId } = action.postData;
      const competition = JSON.parse(getLiveScoreCompetition());
      setLiveScoreCompetition({
        ...competition,
        ladderCalculationTypeId,
        ladderEndRefId,
      });

      const result = yield call(LiveScoreAxiosApi.laddersSettingGetData, action.competitionId);
      yield put({
        type: ApiConstants.API_LADDER_SETTING_POST_DATA_SUCCESS,
        result: result.result.data,
        getData: result.result.data,
        status: result.status,
      });
      message.success('Ladder settings updated successfully.');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}
