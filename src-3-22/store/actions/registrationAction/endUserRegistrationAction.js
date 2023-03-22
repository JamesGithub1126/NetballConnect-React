import ApiConstants from '../../../themes/apiConstants';

/// //save end user registration
function saveEndUserRegistrationAction(payload) {
  const action = {
    type: ApiConstants.API_SAVE_END_USER_REGISTRATION_LOAD,
    payload,
  };
  return action;
}

// Update End user registration
function updateEndUserRegisrationAction(data, key) {
  const action = {
    type: ApiConstants.UPDATE_END_USER_REGISTRATION,
    updatedData: data,
    key,
  };
  return action;
}

/// //Organisation Registration Registration Settings
function orgRegistrationRegSettingsEndUserRegAction(payload) {
  const action = {
    type: ApiConstants.API_ORG_REGISTRATION_REG_SETTINGS_LOAD,
    payload,
  };
  return action;
}

/// //End User Registration Membership Products
function membershipProductEndUserRegistrationAction(payload) {
  const action = {
    type: ApiConstants.API_MEMBERSHIP_PRODUCT_END_USER_REG_LOAD,
    payload,
  };
  return action;
}

/// //end user registration Dashboard List
function endUserRegDashboardListAction(payload, sortBy, sortOrder) {
  const action = {
    type: ApiConstants.API_USER_REG_DASHBOARD_LIST_LOAD,
    payload,
    sortBy,
    sortOrder,
  };
  return action;
}

function regTransactionUpdateAction(payload) {
  const action = {
    type: ApiConstants.API_REG_TRANSACTION_UPDATE_LOAD,
    payload,
  };

  return action;
}

function exportRegistrationAction(params) {
  const action = {
    type: ApiConstants.API_GET_EXPORT_REGISTRATION_LOAD,
    params,
  };
  return action;
}

function setRegistrationListPageSize(pageSize) {
  const action = {
    type: ApiConstants.SET_REGISTRATION_LIST_PAGE_SIZE,
    pageSize,
  };

  return action;
}

function setRegistrationListPageNumber(pageNum) {
  const action = {
    type: ApiConstants.SET_REGISTRATION_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };

  return action;
}

export {
  saveEndUserRegistrationAction,
  updateEndUserRegisrationAction,
  orgRegistrationRegSettingsEndUserRegAction,
  membershipProductEndUserRegistrationAction,
  endUserRegDashboardListAction,
  regTransactionUpdateAction,
  exportRegistrationAction,
  setRegistrationListPageSize,
  setRegistrationListPageNumber,
};
