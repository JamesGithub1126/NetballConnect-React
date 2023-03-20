import ApiConstants from '../../../themes/apiConstants';

// stripe payment account balance API
function accountBalanceAction() {
  return {
    type: ApiConstants.API_STRIPE_ACCOUNT_BALANCE_API_LOAD,
  };
}

// For stripe charging payment API
function chargingPaymentAction(competitionId, stripeToken) {
  return {
    type: ApiConstants.API_STRIPE_CHARGING_PAYMENT_API_LOAD,
    competitionId,
    stripeToken,
  };
}

// save stripe account
function saveStripeAccountAction(code) {
  return {
    type: ApiConstants.API_SAVE_STRIPE_ACCOUNT_API_LOAD,
    code,
  };
}

// stripe login link
function getStripeLoginLinkAction() {
  return {
    type: ApiConstants.API_GET_STRIPE_LOGIN_LINK_API_LOAD,
  };
}

// stripe payments transfer list
function getStripeTransferListAction(page, starting_after, ending_before, params) {
  return {
    type: ApiConstants.API_GET_STRIPE_PAYMENTS_TRANSFER_LIST_API_LOAD,
    page,
    starting_after,
    ending_before,
    params,
  };
}

// stripe payout list
function getStripePayoutListAction(page, starting_after, ending_before, params) {
  return {
    type: ApiConstants.API_GET_STRIPE_PAYOUT_LIST_API_LOAD,
    page,
    starting_after,
    ending_before,
    params,
  };
}

// stripe payout list
function getStripeRefundsListAction(page, starting_after, ending_before, params) {
  return {
    type: ApiConstants.API_GET_STRIPE_REFUND_LIST_API_LOAD,
    page,
    starting_after,
    ending_before,
    params,
  };
}

// stripe single payout transaction list
function getTransactionPayoutListAction(page, starting_after, ending_before, payoutId) {
  return {
    type: ApiConstants.API_GET_STRIPE_TRANSACTION_PAYOUT_LIST_API_LOAD,
    page,
    starting_after,
    ending_before,
    payoutId,
  };
}

// get invoice
function getInvoice(registrationid, userRegId, invoiceId, teamMemberRegId, transactionId) {
  return {
    type: ApiConstants.API_GET_INVOICE_LOAD,
    registrationid,
    userRegId,
    invoiceId,
    teamMemberRegId,
    transactionId,
  };
}

function getShopInvoice(shopUniqueKey, invoiceId) {
  const action = {
    type: ApiConstants.API_GET_SHOP_INVOICE_LOAD,
    shopUniqueKey,
    invoiceId,
  };
  return action;
}

// payment dashboard
function getPaymentList(
  offset,
  limit,
  sortBy,
  sortOrder,
  userId,
  registrationId,
  yearId,
  competitionKey,
  paymentFor,
  dateFrom,
  dateTo,
  searchValue,
  feeType,
  paymentType,
  paymentMethod,
  membershipType,
  paymentStatus,
  discountMethod,
) {
  return {
    type: ApiConstants.API_PAYMENT_TYPE_LIST_LOAD,
    offset,
    limit,
    sortBy,
    sortOrder,
    userId,
    registrationId,
    yearId,
    competitionKey,
    paymentFor,
    dateFrom,
    dateTo,
    searchValue,
    feeType,
    paymentType,
    paymentMethod,
    membershipType,
    paymentStatus,
    discountMethod,
  };
}

export function clearPaymentList() {
  return {
    type: ApiConstants.API_PAYMENT_TYPE_LIST_CLEAR,
  }
}

// export payment dashboard data
function exportPaymentApi(key, year, dateFrom, dateTo) {
  return {
    type: ApiConstants.API_PAYMENT_DASHBOARD_EXPORT_LOAD,
    key,
    year,
    dateFrom,
    dateTo,
  };
}

function exportTransactionsApi(key, year, dateFrom, dateTo) {
  return {
    type: ApiConstants.API_PAYMENT_DASHBOARD_EXPORT_TRANSACTIONS_LOAD,
    key,
    year,
    dateFrom,
    dateTo,
  };
}

// export customer transaction data
function exportCustomerTransactionApi(customerId, year, dateFrom, dateTo, timeZone) {
  return {
    type: ApiConstants.API_CUSTOMER_TRANSACTION_EXPORT_LOAD,
    customerId,
    year,
    dateFrom,
    dateTo,
    timeZone,
  };
}

function getInvoiceStatusAction(registrationid, userRegId, invoiceId, teamMemberRegId) {
  return {
    type: ApiConstants.API_GET_INVOICE_STATUS_LOAD,
    registrationid,
    userRegId,
    invoiceId,
    teamMemberRegId,
  };
}

function exportPaymentDashboardApi(
  offset,
  sortBy,
  sortOrder,
  userId,
  registrationId,
  yearId,
  competitionKey,
  paymentFor,
  dateFrom,
  dateTo,
  searchValue,
  feeType,
  paymentType,
  paymentMethod,
  membershipType,
  paymentStatus,
  discountMethod,
) {
  return {
    type: ApiConstants.API_EXPORT_PAYMENT_DASHBOARD_LOAD,
    offset,
    sortBy,
    sortOrder,
    userId,
    registrationId,
    yearId,
    competitionKey,
    paymentFor,
    dateFrom,
    dateTo,
    searchValue,
    feeType,
    paymentType,
    paymentMethod,
    membershipType,
    paymentStatus,
    discountMethod,
  };
}

function exportPayoutTransaction(payoutId) {
  return {
    type: ApiConstants.API_STRIPE_TRANSACTION_PAYOUT_LIST_EXPORT_LOAD,
    payoutId,
  };
}

function getParticipantSummaryAction(
  offset,
  limit,
  sortBy,
  sortOrder,
  userId,
  registrationId,
  yearId,
  competitionKey,
  paymentFor,
  dateFrom,
  dateTo,
  searchValue,
  feeType,
  paymentType,
  paymentMethod,
  membershipType,
  paymentStatus,
  dobFrom,
  dobTo,
  version,
  membershipProduct,
) {
  return {
    type: ApiConstants.API_PARTICIPANT_SUMMARY_LIST_LOAD,
    offset,
    limit,
    sortBy,
    sortOrder,
    userId,
    registrationId,
    yearId,
    competitionKey,
    paymentFor,
    dateFrom,
    dateTo,
    searchValue,
    feeType,
    paymentType,
    paymentMethod,
    membershipType,
    paymentStatus,
    dobFrom,
    dobTo,
    version,
    membershipProduct,
  };
}

function exportParticipantSummaryApiAction(
  offset,
  sortBy,
  sortOrder,
  userId,
  registrationId,
  yearId,
  competitionKey,
  paymentFor,
  dateFrom,
  dateTo,
  searchValue,
  feeType,
  paymentType,
  paymentMethod,
  membershipType,
  paymentStatus,
  dobFrom,
  dobTo,
  version,
  membershipProduct,
) {
  return {
    type: ApiConstants.API_EXPORT_PARTICIPANT_SUMMARY_LOAD,
    offset,
    sortBy,
    sortOrder,
    userId,
    registrationId,
    yearId,
    competitionKey,
    paymentFor,
    dateFrom,
    dateTo,
    searchValue,
    feeType,
    paymentType,
    paymentMethod,
    membershipType,
    paymentStatus,
    dobFrom,
    dobTo,
    version,
    membershipProduct,
  };
}

function setDashboardPageSizeAction(pageSize) {
  const action = {
    type: ApiConstants.SET_PAYMENT_DASHBOARD_LIST_PAGE_SIZE,
    pageSize,
  };

  return action;
}

function setDashboardPageNumberAction(pageNum) {
  const action = {
    type: ApiConstants.SET_PAYMENT_DASHBOARD_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };

  return action;
}

function setParticipantSummaryPageSizeAction(pageSize) {
  const action = {
    type: ApiConstants.SET_PARTICIPANT_SUMMARY_LIST_PAGE_SIZE,
    pageSize,
  };

  return action;
}

function setParticipantSummaryPageNumberAction(pageNum) {
  const action = {
    type: ApiConstants.SET_PARTICIPANT_SUMMARY_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };

  return action;
}

function partialRefundAmountAction(payload) {
  return {
    type: ApiConstants.API_PARTIAL_REFUND_AMOUNT_LOAD,
    payload,
  };
}

function clearInvoiceDataAction() {
  const action = {
    type: ApiConstants.CLEAR_INVOICE_DATA,
  };
  return action;
}

function getFinancialSummaryAction(yearRefId) {
  const action = {
    type: ApiConstants.GET_FINANCIAL_SUMMARY_LOAD,
    yearRefId,
  };
  return action;
}

export {
  accountBalanceAction,
  chargingPaymentAction,
  saveStripeAccountAction,
  getStripeLoginLinkAction,
  getStripeTransferListAction,
  getStripePayoutListAction,
  getTransactionPayoutListAction,
  getShopInvoice,
  getInvoice,
  clearInvoiceDataAction,
  getPaymentList,
  exportPaymentApi,
  exportTransactionsApi,
  getStripeRefundsListAction,
  getInvoiceStatusAction,
  exportPaymentDashboardApi,
  exportPayoutTransaction,
  setDashboardPageSizeAction,
  setDashboardPageNumberAction,
  setParticipantSummaryPageSizeAction,
  setParticipantSummaryPageNumberAction,
  partialRefundAmountAction,
  getParticipantSummaryAction,
  exportParticipantSummaryApiAction,
  exportCustomerTransactionApi,
  getFinancialSummaryAction,
};
