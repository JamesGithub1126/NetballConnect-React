import ApiConstants from '../../../themes/apiConstants';

function timeSlotInit() {
  const action = {
    type: ApiConstants.API_TIME_SLOT_INIT_LOAD,
  };

  return action;
}

function getCommonRefData(data) {
  const action = {
    type: ApiConstants.API_GET_COMMON_REF_DATA_LOAD,
    data,
  };

  return action;
}

function addVenueAction(data) {
  const action = {
    type: ApiConstants.API_ADD_VENUE_LOAD,
    data,
  };

  return action;
}

////Venue List for own competitionvenue and times
function venueListAction() {
  const action = {
    type: ApiConstants.API_VENUE_LIST_LOAD,
  };

  return action;
}

// User Widgets
function getUserWidgetsAction(payload) {
  return {
    type: ApiConstants.API_USER_WIDGETS_LOAD,
    payload,
  };
}

// Revenue Widgets
function getRevenueWidgetsAction(payload) {
  return {
    type: ApiConstants.API_REVENUE_WIDGETS_LOAD,
    payload,
  };
}

// Shop Purchases Widgets
function getShopPurchasesWidgetsAction(payload) {
  return {
    type: ApiConstants.API_SHOP_PURCHASES_WIDGETS_LOAD,
    payload,
  };
}

// Registration Widgets
function getRegistrationWidgetsAction(payload) {
  return {
    type: ApiConstants.API_REGISTRATION_WIDGETS_LOAD,
    payload,
  };
}

// Registrations Growth Widget
function getRegistrationsGrowthWidgetsAction(payload) {
  return {
    type: ApiConstants.API_REGISTRATIONS_GROWTH_WIDGETS_LOAD,
    payload,
  };
}

// Revenue Growth Widget
function getRevenueGrowthWidgetsAction(payload) {
  return {
    type: ApiConstants.API_REVENUE_GROWTH_WIDGETS_LOAD,
    payload,
  };
}

// Export Organisation Changes
function exportOrganisationChangesAction(payload, widget) {
  return {
    type: ApiConstants.API_ORG_GROWTH_EXPORT_FILE_LOAD,
    payload,
    widget,
  };
}

//////get the grades reference data
function gradesReferenceListAction() {
  const action = {
    type: ApiConstants.API_GRADES_REFERENCE_LIST_LOAD,
  };
  return action;
}

//////get the favorite Team Reference Action
function favouriteTeamReferenceAction() {
  const action = {
    type: ApiConstants.API_FAVOURITE_TEAM_REFERENCE_LOAD,
  };
  return action;
}

//////get the Firebird Player Reference Action
function firebirdPlayerReferenceAction() {
  const action = {
    type: ApiConstants.API_FIREBIRD_PLAYER_REFERENCE_LOAD,
  };
  return action;
}

//////get the Registration Other Info Reference Action
function registrationOtherInfoReferenceAction() {
  const action = {
    type: ApiConstants.API_REGISTRATION_OTHER_INFO_REFERENCE_LOAD,
  };
  return action;
}

//////get the Country Reference Action
function countryReferenceAction() {
  const action = {
    type: ApiConstants.API_COUNTRY_REFERENCE_LOAD,
  };
  return action;
}

//////get the Nationality Reference Action
function nationalityReferenceAction() {
  const action = {
    type: ApiConstants.API_NATIONALITY_REFERENCE_LOAD,
  };
  return action;
}

function getDivisionFieldConfigAction() {
  const action = {
    type: ApiConstants.API_DIVISION_FIELD_CONFIG_LOAD,
  };
  return action;
}

//////get the Nationality Reference Action
function heardByReferenceAction() {
  const action = {
    type: ApiConstants.API_HEARDBY_REFERENCE_LOAD,
  };
  return action;
}

//////get the Player Position Reference Action
function playerPositionReferenceAction() {
  const action = {
    type: ApiConstants.API_PLAYER_POSITION_REFERENCE_LOAD,
  };
  return action;
}

function searchVenueList(filterData) {
  const action = {
    type: ApiConstants.Search_Venue_updated,
    filterData: filterData,
  };
  return action;
}

function clearFilter() {
  const action = {
    type: ApiConstants.CLEAR_FILTER_SEARCH,
  };
  return action;
}

////Venue List for User Module
function venuesListAction(payload, sortBy, sortOrder) {
  const action = {
    type: ApiConstants.API_VENUES_LIST_LOAD,
    data: payload,
    sortBy,
    sortOrder,
  };

  return action;
}

function venueDeleteAction(payload) {
  const action = {
    type: ApiConstants.API_VENUE_DELETE_LOAD,
    data: payload,
  };

  return action;
}

function getGenderAction() {
  const action = {
    type: ApiConstants.API_GET_GENDER_LOAD,
  };
  return action;
}

function getPhotoTypeAction() {
  const action = {
    type: ApiConstants.API_GET_PHOTO_TYPE_LOAD,
  };
  return action;
}

function getApplyToAction() {
  const action = {
    type: ApiConstants.API_GET_APPY_TO_LOAD,
  };
  return action;
}

function getExtraTimeDrawAction() {
  const action = {
    type: ApiConstants.API_GET_EXTRA_TIME_DRAW_LOAD,
  };
  return action;
}

function getFinalFixtureTemplateAction() {
  const action = {
    type: ApiConstants.API_GET_FINAL_FIXTURE_TEMPLATE_LOAD,
  };
  return action;
}

////Court List for own competitionvenue and times
function courtListAction(venueId) {
  const action = {
    type: ApiConstants.API_COURT_LIST_LOAD,
    venueId,
  };

  return action;
}

// Send invite to
function inviteTypeAction() {
  const action = {
    type: ApiConstants.API_GET_INVITE_TYPE_LOAD,
  };
  return action;
}

function getAllowTeamRegistrationTypeAction() {
  const action = {
    type: ApiConstants.API_ALLOW_TEAM_REGISTRATION_TYPE_LOAD,
  };

  return action;
}

// Registration RegistrationRestrictionType

function registrationRestrictionTypeAction() {
  const action = {
    type: ApiConstants.API_REGISTRATION_RESTRICTION_TYPE_LOAD,
  };

  return action;
}

function disabilityReferenceAction() {
  const action = {
    type: ApiConstants.API_DISABILITY_REFERENCE_LOAD,
  };
  return action;
}

function quickCompetitionInit(body) {
  const action = {
    type: ApiConstants.API_GET_COMMON_INIT_LOAD,
    body,
  };
  return action;
}

////get state reference data
function getStateReferenceAction(body) {
  const action = {
    type: ApiConstants.API_GET_STATE_REFERENCE_DATA_LOAD,
    body,
  };
  return action;
}

function registrationPaymentStatusAction() {
  const action = {
    type: ApiConstants.API_REGISTRATION_PAYMENT_STATUS_LOAD,
  };
  return action;
}

function getMatchPrintTemplateType() {
  const action = {
    type: ApiConstants.API_MATCH_PRINT_TEMPLATE_LOAD,
  };

  return action;
}

function checkVenueDuplication(body) {
  const action = {
    type: ApiConstants.API_VENUE_ADDRESS_CHECK_DUPLICATION_LOAD,
    body,
  };

  return action;
}

function registrationChangeType() {
  const action = {
    type: ApiConstants.API_REGISTRATION_CHANGE_TYPE_LOAD,
  };

  return action;
}

function membershipPaymentOptionAction() {
  const action = {
    type: ApiConstants.API_MEMBERSHIP_PAYMENT_OPTIONS_LOAD,
  };

  return action;
}

function accreditationUmpireReferenceAction() {
  const action = {
    type: ApiConstants.API_ACCREDITATION_UMPIRE_REFERENCE_LOAD,
  };
  return action;
}

function netSetGoTshirtSizeAction() {
  const action = {
    type: ApiConstants.API_NETSETGO_TSHIRT_SIZE_LOAD,
  };
  return action;
}

function combinedAccreditationUmpieCoachRefrence() {
  const action = {
    type: ApiConstants.API_ACCREDITATION_UMPIRE_COACH_COMBINED_REFERENCE_LOAD,
  };
  return action;
}

function setVenuesTableListPageSizeAction(pageSize) {
  const action = {
    type: ApiConstants.SET_VENUES_LIST_PAGE_SIZE,
    pageSize,
  };

  return action;
}

function setVenuesTableListPageNumberAction(pageNum) {
  const action = {
    type: ApiConstants.SET_VENUES_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };

  return action;
}

// getDocumentType
function getDocumentType() {
  const action = {
    type: ApiConstants.API_GET_DOCUMENT_TYPE_LOAD,
  };
  return action;
}

function getRelationshipListAction() {
  const action = {
    type: ApiConstants.API_RELATIONSHIP_LIST_LOAD,
  };
  return action;
}

function getLadderReferenceListAction() {
  const action = {
    type: ApiConstants.API_LADDER_REFERENCE_LIST_LOAD,
  };
  return action;
}

function getIncidentOffencesListAction() {
  const action = {
    type: ApiConstants.API_INCIDENT_OFFENCES_LIST_LOAD,
  };
  return action;
}

function getPenaltyTypeListAction() {
  const action = {
    type: ApiConstants.API_PENALTY_TYPE_LIST_LOAD,
  };
  return action;
}

function getAppealOutcomeListAction() {
  const action = {
    type: ApiConstants.API_APPEAL_OUTCOME_LIST_LOAD,
  };
  return action;
}

function getDaysListAction() {
  const action = {
    type: ApiConstants.API_GET_DAYS_LOAD,
  };
  return action;
}

function getGenericCommonReference(body) {
  const action = {
    type: ApiConstants.API_GENERIC_COMMON_REFERENCE_LOAD,
    body,
  };
  return action;
}

function getIncidentStatus() {
  const action = {
    type: ApiConstants.API_GET_REFERENCE_INCIDENT_STATUS_LOAD,
  };
  return action;
}

function getSuspensionApplyToAction() {
  const action = {
    type: ApiConstants.API_GET_SUSPENSION_REFERENCE_APPLY_TO_LOAD,
  };
  return action;
}

function getEmailRecipientsListAction(payload) {
  const action = {
    type: ApiConstants.API_GET_EMAIL_RECIPIENTS_LIST_LOAD,
    payload,
  };
  return action;
}

function exportEmailRecipientsListAction(payload) {
  const action = {
    type: ApiConstants.API_EXPORT_EMAIL_RECIPIENTS_LIST_LOAD,
    payload,
  };
  return action;
}

function clearEmailRecipientsListAction() {
  const action = {
    type: ApiConstants.API_GET_EMAIL_RECIPIENTS_LIST_RESET,
  };
  return action;
}

export {
  timeSlotInit,
  getCommonRefData,
  addVenueAction,
  venueListAction,
  gradesReferenceListAction,
  favouriteTeamReferenceAction,
  firebirdPlayerReferenceAction,
  registrationOtherInfoReferenceAction,
  countryReferenceAction,
  nationalityReferenceAction,
  heardByReferenceAction,
  playerPositionReferenceAction,
  searchVenueList,
  clearFilter,
  venuesListAction,
  venueDeleteAction,
  getGenderAction,
  getPhotoTypeAction,
  getApplyToAction,
  getExtraTimeDrawAction,
  getFinalFixtureTemplateAction,
  courtListAction,
  inviteTypeAction,
  getAllowTeamRegistrationTypeAction,
  registrationRestrictionTypeAction,
  disabilityReferenceAction,
  quickCompetitionInit,
  getStateReferenceAction,
  registrationPaymentStatusAction,
  getMatchPrintTemplateType,
  checkVenueDuplication,
  registrationChangeType,
  membershipPaymentOptionAction,
  accreditationUmpireReferenceAction,
  netSetGoTshirtSizeAction,
  combinedAccreditationUmpieCoachRefrence,
  setVenuesTableListPageSizeAction,
  setVenuesTableListPageNumberAction,
  getDivisionFieldConfigAction,
  getDocumentType,
  getRelationshipListAction,
  getLadderReferenceListAction,
  getIncidentOffencesListAction,
  getPenaltyTypeListAction,
  getAppealOutcomeListAction,
  getDaysListAction,
  getGenericCommonReference,
  getIncidentStatus,
  getSuspensionApplyToAction,
  getUserWidgetsAction,
  getRevenueWidgetsAction,
  getShopPurchasesWidgetsAction,
  getRegistrationWidgetsAction,
  getEmailRecipientsListAction,
  exportEmailRecipientsListAction,
  clearEmailRecipientsListAction,
  getRegistrationsGrowthWidgetsAction,
  exportOrganisationChangesAction,
  getRevenueGrowthWidgetsAction,
};
