import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';
import AxiosApi from 'store/http/stripeHttp/stripeAxios';

function* failSaga(result) {
  const enc = new TextDecoder("utf-8");
  const response = enc.decode(result.result.data);
  const data = JSON.parse(response);
  yield put({
    type: ApiConstants.API_STRIPE_API_FAIL,
    error: result,
    status: result.status,
  });

  setTimeout(() => {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(data.message);
  }, 800);
}

function* errorSaga(error, responseMessage = '') {
  yield put({
    type: ApiConstants.API_STRIPE_API_ERROR,
    error: error,
    status: error.status,
  });

  setTimeout(() => {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });

    if (responseMessage) message.error(responseMessage);
    else message.error(AppConstants.somethingWentWrong);
  }, 800);
}

// Stripe payment account balance API
function* accountBalanceSaga(action) {
  try {
    const result = yield call(AxiosApi.accountBalance, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_STRIPE_ACCOUNT_BALANCE_API_SUCCESS,
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

// For stripe charging payment API
function* chargingPaymentSaga(action) {
  try {
    const result = yield call(AxiosApi.chargingPayment, action.competitionId, action.stripeToken);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_STRIPE_CHARGING_PAYMENT_API_SUCCESS,
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

// Save stripe account
function* saveStripeAccountSaga(action) {
  try {
    const result = yield call(AxiosApi.saveStripeAccount, action.code);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_STRIPE_ACCOUNT_API_SUCCESS,
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

// Stripe login link
function* getStripeLoginLinkSaga(action) {
  try {
    const result = yield call(AxiosApi.getStripeLoginLink, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_STRIPE_LOGIN_LINK_API_SUCCESS,
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

// Stripe payments transfer list
function* getStripeTransferListSaga(action) {
  try {
    const result = yield call(
      AxiosApi.getStripeTransferList,
      action.page,
      action.starting_after,
      action.ending_before,
      action.params,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_STRIPE_PAYMENTS_TRANSFER_LIST_API_SUCCESS,
        result: result.result.data,
        page: action.page,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Stripe payout list
function* getStripePayoutListSaga(action) {
  try {
    const result = yield call(
      AxiosApi.getStripePayoutList,
      action.page,
      action.starting_after,
      action.ending_before,
      action.params,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_STRIPE_PAYOUT_LIST_API_SUCCESS,
        result: result.result.data,
        page: action.page,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Stripe refund list
function* getStripeRefundListSaga(action) {
  try {
    const result = yield call(
      AxiosApi.getStripeRefundList,
      action.page,
      action.starting_after,
      action.ending_before,
      action.params,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_STRIPE_REFUND_LIST_API_SUCCESS,
        result: result.result.data,
        page: action.page,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Stripe single payout transaction list
function* getTransactionPayoutListSaga(action) {
  try {
    const result = yield call(
      AxiosApi.getTransactionPayoutList,
      action.page,
      action.starting_after,
      action.ending_before,
      action.payoutId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_STRIPE_TRANSACTION_PAYOUT_LIST_API_SUCCESS,
        result: result.result.data,
        page: action.page,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* getShopInvoiceSaga(action) {
  try {
    const result = yield call(AxiosApi.getShopInvoice, action.shopUniqueKey, action.invoiceId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_SHOP_INVOICE_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Get invoice saga
function* getInvoiceSaga(action) {
  try {
    const result = yield call(
      AxiosApi.getInvoice,
      action.registrationid,
      action.userRegId,
      action.invoiceId,
      action.teamMemberRegId,
      action.transactionId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_INVOICE_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Get payment list saga
function* getPaymentListSaga(action) {
  try {
    const result = yield call(
      AxiosApi.getPaymentList,
      action.offset,
      action.limit,
      action.sortBy,
      action.sortOrder,
      action.userId,
      action.registrationId,
      action.yearId,
      action.competitionKey,
      action.paymentFor,
      action.dateFrom,
      action.dateTo,
      action.searchValue,
      action.feeType,
      action.paymentType,
      action.paymentMethod,
      action.membershipType,
      action.paymentStatus,
      action.discountMethod,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_PAYMENT_TYPE_LIST_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Export payment saga
function* exportPaymentSaga(action) {
  try {
    const { key, year, dateFrom, dateTo } = action;
    const result = yield call(AxiosApi.exportPaymentApi, key, year, dateFrom, dateTo);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_PAYMENT_DASHBOARD_EXPORT_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* exportPaymentTransactionsSaga(action) {
  try {
    const { key, year, dateFrom, dateTo } = action;
    const result = yield call(AxiosApi.exportPaymentTransactionsApi, key, year, dateFrom, dateTo);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_PAYMENT_DASHBOARD_EXPORT_TRANSACTIONS_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Export Customer Transaction saga
function* exportCustomerTransactionSaga(action) {
  try {
    const { customerId, year, dateFrom, dateTo, timeZone } = action;
    const result = yield call(
      AxiosApi.exportCustomerTransactionApi,
      customerId,
      year,
      dateFrom,
      dateTo,
      timeZone,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_CUSTOMER_TRANSACTION_EXPORT_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Export transaction saga
function* exportPayoutsTransactionSaga(action) {
  try {
    const { payoutId } = action;
    const result = yield call(AxiosApi.exportPayoutTransaction, payoutId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_STRIPE_TRANSACTION_PAYOUT_LIST_EXPORT_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    if (error.status === 5) {
      // timedout
      yield call(errorSaga, error, AppConstants.payoutTimedoutError);
    } else {
      yield call(errorSaga, error);
    }
  }
}

export function* getInvoiceStatusSaga(action) {
  try {
    const result = yield call(
      AxiosApi.getInvoiceStatus,
      action.registrationid,
      action.userRegId,
      action.invoiceId,
      action.teamMemberRegId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_INVOICE_STATUS_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Export payment Dashboard saga
function* exportPaymentDashboardSaga(action) {
  try {
    const result = yield call(
      AxiosApi.exportPaymentDashboardApi,
      action.offset,
      action.sortBy,
      action.sortOrder,
      action.userId,
      action.registrationId,
      action.yearId,
      action.competitionKey,
      action.paymentFor,
      action.dateFrom,
      action.dateTo,
      action.searchValue,
      action.feeType,
      action.paymentType,
      action.paymentMethod,
      action.membershipType,
      action.paymentStatus,
      action.discountMethod,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_PAYMENT_DASHBOARD_EXPORT_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* partialRefundAmountSaga(action) {
  try {
    const result = yield call(AxiosApi.partialRefundAmountApi, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_PARTIAL_REFUND_AMOUNT_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.config({
        duration: 4.0,
        maxCount: 1,
      });
      message.success(result.result.data.message);
    } else if (result.status === 4) {
      yield put({
        type: ApiConstants.API_PARTIAL_REFUND_AMOUNT_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.config({
        duration: 1.5,
        maxCount: 1,
      });
      message.error(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* getParticipantSummarySaga(action) {
  try {
    const result = yield call(
      AxiosApi.getParticipantSummary,
      action.offset,
      action.limit,
      action.sortBy,
      action.sortOrder,
      action.userId,
      action.registrationId,
      action.yearId,
      action.competitionKey,
      action.paymentFor,
      action.dateFrom,
      action.dateTo,
      action.searchValue,
      action.feeType,
      action.paymentType,
      action.paymentMethod,
      action.membershipType,
      action.paymentStatus,
      action.dobFrom,
      action.dobTo,
      action.version,
      action.membershipProduct,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_PARTICIPANT_SUMMARY_LIST_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* exportParticipantSummarySaga(action) {
  try {
    const result = yield call(
      AxiosApi.exportParticipantSummaryApi,
      action.offset,
      action.sortBy,
      action.sortOrder,
      action.userId,
      action.registrationId,
      action.yearId,
      action.competitionKey,
      action.paymentFor,
      action.dateFrom,
      action.dateTo,
      action.searchValue,
      action.feeType,
      action.paymentType,
      action.paymentMethod,
      action.membershipType,
      action.paymentStatus,
      action.dobFrom,
      action.dobTo,
      action.version,
      action.membershipProduct,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_PARTICIPANT_SUMMARY_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* getFinancialSummarySaga(action) {
  try {
    const result = yield call(
      AxiosApi.getFinancialSummaryApi,
      action.yearRefId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.GET_FINANCIAL_SUMMARY_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export default function* rootStripeSaga() {
  yield takeEvery(ApiConstants.API_STRIPE_ACCOUNT_BALANCE_API_LOAD, accountBalanceSaga);
  yield takeEvery(ApiConstants.API_STRIPE_CHARGING_PAYMENT_API_LOAD, chargingPaymentSaga);
  yield takeEvery(ApiConstants.API_SAVE_STRIPE_ACCOUNT_API_LOAD, saveStripeAccountSaga);
  yield takeEvery(ApiConstants.API_GET_STRIPE_LOGIN_LINK_API_LOAD, getStripeLoginLinkSaga);
  yield takeEvery(
    ApiConstants.API_GET_STRIPE_PAYMENTS_TRANSFER_LIST_API_LOAD,
    getStripeTransferListSaga,
  );
  yield takeEvery(ApiConstants.API_GET_STRIPE_PAYOUT_LIST_API_LOAD, getStripePayoutListSaga);
  yield takeEvery(ApiConstants.API_GET_STRIPE_REFUND_LIST_API_LOAD, getStripeRefundListSaga);
  yield takeEvery(
    ApiConstants.API_GET_STRIPE_TRANSACTION_PAYOUT_LIST_API_LOAD,
    getTransactionPayoutListSaga,
  );
  yield takeEvery(ApiConstants.API_GET_SHOP_INVOICE_LOAD, getShopInvoiceSaga);
  yield takeEvery(ApiConstants.API_GET_INVOICE_LOAD, getInvoiceSaga);
  yield takeEvery(ApiConstants.API_PAYMENT_TYPE_LIST_LOAD, getPaymentListSaga);
  yield takeEvery(ApiConstants.API_PAYMENT_DASHBOARD_EXPORT_LOAD, exportPaymentSaga);
  yield takeEvery(ApiConstants.API_PAYMENT_DASHBOARD_EXPORT_TRANSACTIONS_LOAD, exportPaymentTransactionsSaga);
  yield takeEvery(ApiConstants.API_CUSTOMER_TRANSACTION_EXPORT_LOAD, exportCustomerTransactionSaga);
  yield takeEvery(ApiConstants.API_GET_INVOICE_STATUS_LOAD, getInvoiceStatusSaga);
  yield takeEvery(ApiConstants.API_EXPORT_PAYMENT_DASHBOARD_LOAD, exportPaymentDashboardSaga);
  yield takeEvery(
    ApiConstants.API_STRIPE_TRANSACTION_PAYOUT_LIST_EXPORT_LOAD,
    exportPayoutsTransactionSaga,
  );
  yield takeEvery(ApiConstants.API_PARTIAL_REFUND_AMOUNT_LOAD, partialRefundAmountSaga);
  yield takeEvery(ApiConstants.API_PARTICIPANT_SUMMARY_LIST_LOAD, getParticipantSummarySaga);
  yield takeEvery(ApiConstants.API_EXPORT_PARTICIPANT_SUMMARY_LOAD, exportParticipantSummarySaga);
  yield takeEvery(ApiConstants.GET_FINANCIAL_SUMMARY_LOAD, getFinancialSummarySaga);
}
