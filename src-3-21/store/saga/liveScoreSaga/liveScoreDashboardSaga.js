import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import AppConstants from '../../../themes/appConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import RegistrationAxiosApi from '../../http/registrationHttp/registrationAxiosApi';
import { message } from 'antd';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_LIVE_SCORE_DASHBOARD_FAIL });
  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 3,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_DASHBOARD_ERROR,
    error: error,
    status: error.status,
  });

  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(AppConstants.somethingWentWrong);
}

export function* liveScoreDashboardSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreDashboard,
      action.competitionID,
      action.startDay,
      action.currentTime,
      action.competitionOrganisationId,
      action.liveScoreCompIsParent,
      action.offset,
      action.limit,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_DASHBOARD_SUCCESS,
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

export function* liveScoreSingleGameListSaga(action) {
  try {
    const result = yield call(RegistrationAxiosApi.getSingleGameList, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_SINGLE_GAME_LIST_SUCCESS,
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

export function* liveScoreSingleGameRedeemPaySaga(action) {
  try {
    const result = yield call(RegistrationAxiosApi.singleGameRedeemPay, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_SINGLE_GAME_REDEEM_PAY_SUCCESS,
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

export function* liveScorePlayersToPayListSaga(action) {
  try {
    const result = yield call(RegistrationAxiosApi.getPlayersToPayList, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_PLAYERS_TO_PAY_LIST_SUCCESS,
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

export function* liveScorePlayersToPayRetryPaymentSaga(action) {
  try {
    const result = yield call(RegistrationAxiosApi.playersToPayRetryPayment, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_PLAYERS_TO_PAY_RETRY_PAYMENT_SUCCESS,
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

export function* liveScorePlayersToCashReceivedSaga(action) {
  try {
    const result = yield call(RegistrationAxiosApi.playersToPayCashReceived, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_PLAYERS_TO_PAY_CASH_RECEIVED_SUCCESS,
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
