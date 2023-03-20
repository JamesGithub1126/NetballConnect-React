import ApiConstants from '../../themes/apiConstants';

function setYearRefId(yearRefId) {
  return {
    type: ApiConstants.API_YEAR_SET_SELECTED,
    payload: yearRefId,
  };
}

function setYearRefIdCommon(modalYearRefId) {
  return {
    type: ApiConstants.API_COMMON_COMPONENT_YEAR_SET_SELECT,
    payload: modalYearRefId,
  };
}
// Get the common year list reference
function getYearListAction() {
  return {
    type: ApiConstants.API_YEAR_LIST_LOAD,
  };
}

function getFeeTypeAction() {
  return {
    type: ApiConstants.API_FEE_TYPE_LIST_LOAD,
  };
}

function getPaymentOptionsListAction() {
  return {
    type: ApiConstants.API_PAYMENT_OPTIONS_LIST_LOAD,
  };
}

function getPaymentMethodsListAction() {
  return {
    type: ApiConstants.API_PAYMENT_METHODS_LIST_LOAD,
  };
}

// Get the common year list reference
function getOnlyYearListAction(yearsArray) {
  return {
    type: ApiConstants.API_ONLY_YEAR_LIST_LOAD,
    yearsArray,
  };
}

// Get the common membership product validity type list reference
function getProductValidityListAction() {
  return {
    type: ApiConstants.API_PRODUCT_VALIDITY_LIST_LOAD,
  };
}

// Get the common Membership Product Fees Type
function getMembershipProductFeesTypeAction() {
  return {
    type: ApiConstants.API_COMMON_MEMBERSHIP_PRODUCT_FEES_TYPE_LOAD,
  };
}

// Get the common Membership Product Category Types
function getMembershipProductCategoryTypesAction() {
  return {
    type: ApiConstants.API_COMMON_MEMBERSHIP_PRODUCT_CATEGORY_TYPES_LOAD,
  };
}

// Get common reference discount type
function getCommonDiscountTypeTypeAction() {
  return {
    type: ApiConstants.API_COMMON_DISCOUNT_TYPE_LOAD,
  };
}

// Get the common Competition type list reference
function getCompetitionTypeListAction(year) {
  return {
    type: ApiConstants.API_COMPETITION_TYPE_LIST_LOAD,
    year,
  };
}

function getVenuesTypeAction(key) {
  return {
    type: ApiConstants.API_REG_FORM_VENUE_LOAD,
    key,
  };
}

function getRegFormAdvSettings() {
  return {
    type: ApiConstants.API_REG_FORM_SETTINGS_LOAD,
  };
}

function getRegistrationMethod() {
  return {
    type: ApiConstants.API_REG_FORM_METHOD_LOAD,
  };
}

// Types of competition in competition fees section from reference table
function competitionFeeInit() {
  return {
    type: ApiConstants.API_REG_COMPETITION_FEE_INIT_LOAD,
  };
}

function getMatchTypesAction() {
  return {
    type: ApiConstants.API_MATCH_TYPES_LOAD,
  };
}

function getCompetitionFormatTypesAction() {
  return {
    type: ApiConstants.API_COMPETITION_FORMAT_TYPES_LOAD,
  };
}

// Year and competition get action
function getYearAndCompetitionAction(yearData, yearId, key) {
  return {
    type: ApiConstants.API_GET_YEAR_COMPETITION_LOAD,
    yearData,
    yearId,
    key,
  };
}

// Get competition
function getCompetitionTypesAction() {
  return {
    type: ApiConstants.API_COMPETITION_TYPES_LOAD,
  };
}

// Clear year competition
function clearYearCompetitionAction() {
  return {
    type: ApiConstants.CLEAR_COMPETITION_DATA,
  };
}

function getYearAndCompetitionOwnAction(yearData, yearId, key) {
  return {
    type: ApiConstants.API_GET_YEAR_OWN_COMPETITION_LOAD,
    yearData,
    yearId,
    key,
  };
}

function getYearAndCompetitionParticipateAction(yearData, yearId, key) {
  return {
    type: ApiConstants.API_GET_YEAR_Participate_COMPETITION_LOAD,
    yearData,
    yearId,
    key,
  };
}

function searchVenueList(filterData) {
  return {
    type: ApiConstants.Search_Venue_updated_Competition,
    filterData,
  };
}

function clearFilter() {
  return {
    type: ApiConstants.CLEAR_FILTER_SEARCH_VENUE,
  };
}

function getEnhancedRoundRobinAction() {
  return {
    type: ApiConstants.API_ENHANCED_ROUND_ROBIN_LOAD,
  };
}

function exportFilesAction(URL) {
  return {
    type: ApiConstants.API_EXPORT_FILES_LOAD,
    URL,
  };
}

function CLEAR_OWN_COMPETITION_DATA(key) {
  return {
    type: ApiConstants.CLEAR_OWN_COMPETITION_DATA,
    key,
  };
}

function userExportFilesAction(URL, userType) {
  return {
    type: ApiConstants.API_USER_EXPORT_FILES_LOAD,
    URL,
    userType,
  };
}

function getRefBadgeData(data) {
  return {
    type: ApiConstants.API_GET_REF_BADGE_LOAD,
    data,
  };
}

function getDiscountMethodListAction() {
  return {
    type: ApiConstants.API_GET_DISCOUNT_METHOD_LIST_LOAD,
  };
}

export {
  setYearRefId,
  getYearListAction,
  getOnlyYearListAction,
  getProductValidityListAction,
  getCompetitionTypeListAction,
  getVenuesTypeAction,
  getRegFormAdvSettings,
  getRegistrationMethod,
  getMembershipProductFeesTypeAction,
  getCommonDiscountTypeTypeAction,
  competitionFeeInit,
  getMatchTypesAction,
  getCompetitionTypesAction,
  getCompetitionFormatTypesAction,
  getYearAndCompetitionAction,
  clearYearCompetitionAction,
  getYearAndCompetitionOwnAction,
  getYearAndCompetitionParticipateAction,
  searchVenueList,
  clearFilter,
  getEnhancedRoundRobinAction,
  exportFilesAction,
  CLEAR_OWN_COMPETITION_DATA,
  userExportFilesAction,
  getRefBadgeData,
  getFeeTypeAction,
  getPaymentOptionsListAction,
  getPaymentMethodsListAction,
  getDiscountMethodListAction,
  getMembershipProductCategoryTypesAction,
  setYearRefIdCommon,
};
