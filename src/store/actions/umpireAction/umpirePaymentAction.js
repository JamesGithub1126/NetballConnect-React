import ApiConstants from 'themes/apiConstants';

function getUmpirePaymentData(data) {
  return {
    type: ApiConstants.API_GET_UMPIRE_PAYMENT_DATA_LOAD,
    data,
  };
}

export const resetUmpirePaymentData = () => {
  return {
    type: ApiConstants.API_UMPIRE_PAYMENT_RESET_LIST,
  }
}

function updateUmpirePaymentData(data) {
  return {
    type: ApiConstants.API_UPDATE_UMPIRE_PAYMENT_DATA,
    data,
  };
}

function getUmpirePaymentLinkedOrganisationData(competitionId) {
  return {
    type: ApiConstants.API_UMPIRE_LINKED_ORGANISATION_LIST_LOAD,
    competitionId,
  };
}

function umpirePaymentTransferData(data) {
  return {
    type: ApiConstants.API_UMPIRE_PAYMENT_TRANSFER_DATA_LOAD,
    data,
  };
}

function umpirePaymentAction(data) {
  return {
    type: ApiConstants.API_UMPIRE_PAYMENT_ACTION_LOAD,
    data,
  };
}

function exportFilesAction(data) {
  return {
    type: ApiConstants.API_UMPIRE_PAYMENT_EXPORT_FILE_LOAD,
    data,
  };
}

function setPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_UMPIRE_PAYMENT_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_UMPIRE_PAYMENT_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

function getAdminListAction(payload) {
  return {
    type: ApiConstants.API_GET_ADMIN_LIST_DATA_LOAD,
    payload,
  };
}

function updateExtraAmountAction(payload) {
  return {
    type: ApiConstants.API_UMPIRE_PAYMENT_UPDATE_EXTRA_AMOUNT,
    payload,
  }
}

function bulkUpdateAuth2Action(payload){
  return {
    type: ApiConstants.API_UMPIRE_PAYMENT_BULK_UPDATE_AUTHORIZER2,
    payload,
}
}

function restoreInitUmpireData() {
  return {
    type: ApiConstants.API_UMPIRE_PAYMENT_RESTORE_INITAL_DATA,
  }
}

export {
  getUmpirePaymentData,
  getUmpirePaymentLinkedOrganisationData,
  updateUmpirePaymentData,
  umpirePaymentTransferData,
  exportFilesAction,
  setPageSizeAction,
  setPageNumberAction,
  getAdminListAction,
  umpirePaymentAction,
  updateExtraAmountAction,
  bulkUpdateAuth2Action,
  restoreInitUmpireData,
};
