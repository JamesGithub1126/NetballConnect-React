import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from '../../../themes/appConstants';
import ApiConstants from '../../../themes/apiConstants';
import AxiosApi from '../../http/shopHttp/shopAxios';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_SHOP_ORDER_SUMMARY_FAIL,
    error: result,
    status: result.status,
  });

  setTimeout(() => {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(result.result.data.message);
  }, 800);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_SHOP_ORDER_SUMMARY_ERROR,
    error: error,
    status: error.status,
  });

  setTimeout(() => {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(AppConstants.somethingWentWrong);
  }, 800);
}

// Shop order summary listing get API
function* getOrderSummaryListingSaga(action) {
  try {
    const result = yield call(AxiosApi.getOrderSummaryListing, action.params);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_SHOP_ORDER_SUMMARY_LISTING_SUCCESS,
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

// //// //////export order summary  API
function* exportOrderSummarySaga(action) {
  try {
    const result = yield call(AxiosApi.exportOrderSummary, action.params);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_EXPORT_ORDER_SUMMARY_SUCCESS,
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
export default function* rootShopOrderSummarySaga() {
  yield takeEvery(ApiConstants.API_GET_SHOP_ORDER_SUMMARY_LISTING_LOAD, getOrderSummaryListingSaga);
  yield takeEvery(ApiConstants.API_GET_EXPORT_ORDER_SUMMARY_LOAD, exportOrderSummarySaga);
}
