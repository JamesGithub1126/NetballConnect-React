import ApiConstants from '../../../themes/apiConstants';

// get the competition fees list in registration
function regCompetitionListAction(offset, limit, yearRefId, searchText, sortBy, sortOrder) {
  return {
    type: ApiConstants.API_REG_COMPETITION_LIST_LOAD,
    offset,
    limit,
    yearRefId,
    searchText,
    sortBy,
    sortOrder,
  };
}

//////delete the competition list product
function regCompetitionListDeleteAction(competitionId) {
  return {
    type: ApiConstants.API_REG_COMPETITION_LIST_DELETE_LOAD,
    competitionId,
  };
}

//////archive the competition list product
function regCompetitionListArchiveAction(competitionId, statusRefId) {
  return {
    type: ApiConstants.API_REG_COMPETITION_LIST_ARCHIVE_LOAD,
    competitionId,
    statusRefId,
  };
}

/////get the competition fees all the data in one API
function getAllCompetitionFeesDeatilsAction(
  competitionId,
  hasRegistration,
  sourceModule,
  affiliateOrgId,
  yearRefId,
  isEdit,
) {
  return {
    type: ApiConstants.API_GET_COMPETITION_FEES_DETAILS_LOAD,
    competitionId,
    hasRegistration,
    sourceModule,
    affiliateOrgId,
    yearRefId,
    isEdit,
  };
}

/////save the competition fees details
function saveCompetitionFeesDetailsAction(
  payload,
  logoOrgId,
  sourceModule,
  affiliateOrgId,
  isEdit,
) {
  return {
    type: ApiConstants.API_SAVE_COMPETITION_FEES_DETAILS_LOAD,
    payload,
    logoOrgId,
    sourceModule,
    affiliateOrgId,
    isEdit,
  };
}

////save the competition membership tab details
function saveCompetitionFeesMembershipTabAction(payload, competitionId, affiliateOrgId) {
  return {
    type: ApiConstants.API_SAVE_COMPETITION_FEES_MEMBERSHIP_TAB_LOAD,
    payload,
    competitionId,
    affiliateOrgId,
  };
}

////get default competition membershipproduct tab details
function getDefaultCompFeesMembershipProductTabAction(hasRegistration, yearRefId, ownProduct) {
  return {
    type: ApiConstants.API_GET_DEFAULT_COMPETITION_FEES_MEMBERSHIP_PRODUCT_LOAD,
    hasRegistration,
    yearRefId,
    ownProduct,
  };
}

////get default competition membershipproduct tab details for multiple years
function getDefaultCompFeesMembershipProducForMultipleYear(hasRegistration, yearRefIds) {
  return {
    type: ApiConstants.API_GET_DEFAULT_COMPETITION_FEES_MEMBERSHIP_PRODUCT_FOR_MULTI_YEAR_LOAD,
    hasRegistration,
    yearRefIds,
  };
}

////membership product selected action tochange membership typearray data
function membershipProductSelectedAction(checked, index, membershipProductUniqueKey) {
  return {
    type: ApiConstants.COMPETITION_FEES_MEMBERSHIP_PRODUCT_SELECTED_ONCHANGE,
    checked,
    index,
    membershipProductUniqueKey,
  };
}

///membership product selected action tochange membership typearray data
function membershipTypeSelectedAction(checked, membershipIndex, typeIndex) {
  return {
    type: ApiConstants.COMPETITION_FEES_MEMBERSHIP_TYPES_SELECTED_ONCHANGE,
    checked,
    membershipIndex,
    typeIndex,
  };
}

/////save the division table data  in the competition fees section
function saveCompetitionFeesDivisionAction(payload, competitionId, affiliateOrgId) {
  return {
    type: ApiConstants.API_SAVE_COMPETITION_FEES_DIVISION_TAB_LOAD,
    payload,
    competitionId,
    affiliateOrgId,
  };
}

/////onchange the division table data on change
function divisionTableDataOnchangeAction(checked, record, index, keyword) {
  return {
    type: ApiConstants.COMPETITION_FEES_DIVISION_TABLE_DATA_ONCHANGE,
    checked,
    record,
    index,
    keyword,
  };
}

//////add or remove another division in the division tab
function addRemoveDivisionAction(index, item, keyword) {
  return {
    type: ApiConstants.COMPETITION_FEES_DIVISION_ADD_REMOVE,
    index,
    item,
    keyword,
  };
}

//update payments competition fee
function updatePaymentOption(value, index, key) {
  return {
    type: ApiConstants.UPDATE_PAYMENTS_COMPETITION_FEES,
    value,
    index,
    key,
  };
}

// update casual seasonal fee
function updatePaymentFeeOption(value, key, index, subKey, item) {
  return {
    type: ApiConstants.UPDATE_PAYMENTS_OPTIONS_COMPETITION_FEES,
    value,
    key,
    index,
    subKey,
    item,
  };
}

function paymentFeeDeafault() {
  return {
    type: ApiConstants.GET_CASUAL_FEE_DETAIL_API_LOAD,
  };
}

function instalmentDateAction(value, key, subKey) {
  return {
    type: ApiConstants.UPDATE_INSTALMENT_DATE,
    value,
    key,
    subKey,
  };
}

function paymentSeasonalFee() {
  return {
    type: ApiConstants.GET_SEASONAL_FEE_DETAIL_API_LOAD,
  };
}

function paymentPerMatch() {
  return {
    type: ApiConstants.GET_PER_MATCH_FEE_OPTIONS_API_LOAD,
  };
}

function competitionPaymentApi(value, competitionId, affiliateOrgId) {
  return {
    type: ApiConstants.API_POST_COMPETITION_FEE_PAYMENT_LOAD,
    value,
    competitionId,
    affiliateOrgId,
  };
}

function addRemoveCompFeeDiscountAction(keyAction, index) {
  return {
    type: ApiConstants.ADD_ANOTHER_DISCOUNT_COMPETITION_FEE,
    keyAction,
    index,
  };
}

//// add/edit competition FeeDeatils Action
function add_editcompetitionFeeDeatils(data, key) {
  return {
    type: ApiConstants.API_ADD_EDIT_COMPETITION_FEES_DETAILS,
    data,
    key,
  };
}

function add_inviteesToCompetitionFeeDetails(data, key) {
  return {
    type: ApiConstants.API_ADD_INVITEES_TO_COMPETITION_FEES_DETAILS,
    data,
    key,
  };
}

function cancel_add_inviteesToCompetitionFeeDetails() {
  return {
    type: ApiConstants.API_CANCEL_ADD_INVITEES_TO_COMPETITION_FEES_DETAILS,
  };
}

function saveAddedInviteesToCompetitionFeesDetails(competitionId, invitees) {
  return {
    type: ApiConstants.API_SAVE_ADDED_INVITEES_TO_COMPETITION_FEES_DETAILS_LOAD,
    competitionId,
    invitees,
  };
}

///updated discount in membership fees section
function updatedDiscountDataAction(discountData) {
  return {
    type: ApiConstants.UPDATE_DISCOUNT_DATA_COMPETITION_FEES,
    discountData,
  };
}

// for update membership fee product
function updatedDiscountMemberPrd(value, discountData, index) {
  return {
    type: ApiConstants.UPDATE_DISCOUNT_MEMBERSHIP_PRODUCT,
    value,
    discountData,
    index,
  };
}

////save competition fees discount
function regSaveCompetitionFeeDiscountAction(payload, competitionId, affiliateOrgId) {
  return {
    type: ApiConstants.API_POST_COMPETITION_FEE_DISCOUNT_LOAD,
    payload,
    competitionId,
    affiliateOrgId,
  };
}

//////get default discount type for competition feess
function competitionDiscountTypesAction() {
  return {
    type: ApiConstants.API_COMPETITION_DISCOUNT_TYPE_LOAD,
  };
}

//// check box and Radio btn handler - competition fees section
function checkUncheckcompetitionFeeSction(data, parentIndex, key) {
  return {
    type: ApiConstants.CHECK_UNCHECK_COMPETITION_FEES_SECTION,
    data,
    parentIndex,
    key,
  };
}

/// save competition fee section
function saveCompetitionFeeSection(data, competitionId, affiliateOrgId) {
  return {
    type: ApiConstants.API_SAVE_COMPETITION_FEES_SECTION_LOAD,
    data,
    competitionId,
    affiliateOrgId,
  };
}

///// Add/Edit competition fee section details
function add_editFee_deatialsScetion(data, tableIndex, record, key, arrayKey) {
  return {
    type: ApiConstants.API_ADD_EDIT_COMPETITION_FEES_SECTION,
    data,
    key,
    record,
    tableIndex,
    arrayKey,
  };
}

//////clear the reducer data action
function clearCompReducerDataAction(dataName) {
  return {
    type: ApiConstants.REG_COMPETITION_FEES_CLEARING_REDUCER_DATA,
    dataName,
  };
}

/////get default charity and government vouchers
function getDefaultCharity() {
  return {
    type: ApiConstants.API_COMPETITION_FEE_DEFAULT_CHARITY_LOAD,
  };
}

//////get the default competition logo api
function getDefaultCompFeesLogoAction() {
  return {
    type: ApiConstants.API_COMPETITION_FEE_DEFAULT_LOGO_LOAD,
  };
}

///// On invitees search action
function onInviteesSearchAction(value, inviteesType) {
  return {
    type: ApiConstants.API_COMPETITION_FEE_INVITEES_SEARCH_LOAD,
    value,
    inviteesType,
  };
}

//Delete Competition Division from Comp Details
function removeCompetitionDivisionAction(payload) {
  return {
    type: ApiConstants.API_COMPETITION_DIVISION_DELETE_LOAD,
    payload,
  };
}

function paymentMethodsDefaultAction() {
  return {
    type: ApiConstants.API_GET_PAYMENT_METHOD_REF_LOAD,
  };
}

function setPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_REGISTRATION_COMPETITION_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_REGISTARTION_COMPETITION_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

export {
  regCompetitionListAction,
  regCompetitionListDeleteAction,
  regCompetitionListArchiveAction,
  getAllCompetitionFeesDeatilsAction,
  saveCompetitionFeesDetailsAction,
  saveCompetitionFeesMembershipTabAction,
  getDefaultCompFeesMembershipProductTabAction,
  getDefaultCompFeesMembershipProducForMultipleYear,
  membershipProductSelectedAction,
  membershipTypeSelectedAction,
  saveCompetitionFeesDivisionAction,
  divisionTableDataOnchangeAction,
  addRemoveDivisionAction,
  updatePaymentOption,
  updatePaymentFeeOption,
  paymentFeeDeafault,
  paymentSeasonalFee,
  paymentPerMatch,
  competitionPaymentApi,
  addRemoveCompFeeDiscountAction,
  add_editcompetitionFeeDeatils,
  checkUncheckcompetitionFeeSction,
  add_editFee_deatialsScetion,
  saveCompetitionFeeSection,
  updatedDiscountDataAction,
  updatedDiscountMemberPrd,
  regSaveCompetitionFeeDiscountAction,
  competitionDiscountTypesAction,
  clearCompReducerDataAction,
  getDefaultCharity,
  getDefaultCompFeesLogoAction,
  onInviteesSearchAction,
  removeCompetitionDivisionAction,
  instalmentDateAction,
  paymentMethodsDefaultAction,
  setPageSizeAction,
  setPageNumberAction,
  add_inviteesToCompetitionFeeDetails,
  cancel_add_inviteesToCompetitionFeeDetails,
  saveAddedInviteesToCompetitionFeesDetails,
};
