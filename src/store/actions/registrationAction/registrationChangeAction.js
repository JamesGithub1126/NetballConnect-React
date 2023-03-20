import ApiConstants from '../../../themes/apiConstants';

function updateRegistrationReviewAction(value, key) {
  return {
    type: ApiConstants.API_UPDATE_REG_REVIEW,
    value,
    key,
  };
}

function saveDeRegisterDataAction(payload) {
  return {
    type: ApiConstants.API_SAVE_DE_REGISTRATION_LOAD,
    payload,
  };
}

function updateDeregistrationData(value, key, subKey) {
  return {
    type: ApiConstants.API_UPDATE_DE_REGISTRATION,
    value,
    key,
    subKey,
  };
}

function getRegistrationChangeDashboard(payload, sortBy, sortOrder) {
  return {
    type: ApiConstants.API_GET_REGISTRATION_CHANGE_DASHBOARD_LOAD,
    payload,
    sortBy,
    sortOrder,
  };
}

function exportRegistrationChange(payload, sortBy, sortOrder) {
  return {
    type: ApiConstants.API_EXPORT_REGISTRATION_CHANGE_LOAD,
    payload,
    sortBy,
    sortOrder,
  };
}

function getRegistrationChangeReview(payload) {
  return {
    type: ApiConstants.API_GET_REGISTRATION_CHANGE_REVIEW_LOAD,
    payload,
  };
}

function saveRegistrationChangeReview(payload) {
  return {
    type: ApiConstants.API_SAVE_REGISTRATION_CHANGE_REVIEW_LOAD,
    payload,
  };
}

function getTransferCompetitionsAction(payload) {
  return {
    type: ApiConstants.API_GET_TRANSFER_COMPETITIONS_LOAD,
    payload,
  };
}

function getMoveCompDataAction(payload) {
  return {
    type: ApiConstants.API_GET_MOVE_COMP_DATA_LOAD,
    payload,
  };
}

function moveCompetitionAction(payload) {
  return {
    type: ApiConstants.API_MOVE_COMPETITION_LOAD,
    payload,
  };
}

function setRegistrationChangeListPageSize(pageSize) {
  return {
    type: ApiConstants.SET_REGISTRATION_CHANGE_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setRegistrationChangeListPageNumber(pageNum) {
  return {
    type: ApiConstants.SET_REGISTRATION_CHANGE_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

function setRegistrationChangeRefundedOffline(payload) {
  return {
    type: ApiConstants.API_REGISTRATION_CHANGE_REFUNDED_OFFLINE_LOAD,
    payload,
  };
}

function getDeRegisterDataAction(payload) {
  const action = {
    type: ApiConstants.API_GET_DE_REGISTRATION_LOAD,
    payload,
  };

  return action;
}

export {
  updateRegistrationReviewAction,
  saveDeRegisterDataAction,
  updateDeregistrationData,
  getRegistrationChangeDashboard,
  exportRegistrationChange,
  getRegistrationChangeReview,
  saveRegistrationChangeReview,
  getTransferCompetitionsAction,
  getMoveCompDataAction,
  moveCompetitionAction,
  setRegistrationChangeListPageSize,
  setRegistrationChangeListPageNumber,
  getDeRegisterDataAction,
  setRegistrationChangeRefundedOffline,
};
