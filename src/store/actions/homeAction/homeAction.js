import ApiConstants from '../../../themes/apiConstants';

//get userCount Action
function getUserCount(year) {
  const action = {
    type: ApiConstants.API_USER_COUNT_LOAD,
    year,
  };
  return action;
}
function clearHomeDashboardData(key) {
  const action = {
    type: ApiConstants.clearHomeDashboardData,
    key,
  };
  return action;
}

function setHomeDashboardYear(year) {
  const action = {
    type: ApiConstants.setHomeDashboardYearKey,
    year,
  };
  return action;
}

function setPageSize(pageSize) {
  const action = {
    type: ApiConstants.SET_PAGE_SIZE,
    pageSize,
  };
  return action;
}

function setPageNum(pageNum) {
  const action = {
    type: ApiConstants.SET_PAGE_CURRENT_NUMBER,
    pageNum,
  };
  return action;
}

function getActionBoxAction(payload) {
  const action = {
    type: ApiConstants.API_GET_ACTION_BOX_LOAD,
    payload,
  };

  return action;
}

function updateActionBoxAction(payload) {
  const action = {
    type: ApiConstants.API_UPDATE_ACTION_BOX_LOAD,
    payload,
  };
  return action;
}

/* Get Affiliate Our Organisation */
function getAffiliateOurOrganisationIdAction(organisationId) {
  return {
    type: ApiConstants.API_AFFILIATE_OUR_ORGANISATION_LOAD,
    payload: organisationId,
  };
}

function getOrganisationSettingsAction(payload) {
  return {
    type: ApiConstants.API_ORGANISATION_SETTINGS_LOAD,
    payload,
  };
}

export {
  getUserCount,
  clearHomeDashboardData,
  setHomeDashboardYear,
  getActionBoxAction,
  updateActionBoxAction,
  setPageSize,
  setPageNum,
  getAffiliateOurOrganisationIdAction,
  getOrganisationSettingsAction,
};
