import ApiConstants from 'themes/apiConstants';

// Get Role
function getRoleAction() {
  return {
    type: ApiConstants.API_ROLE_LOAD,
  };
}

// Get URE
function getUreAction() {
  return {
    type: ApiConstants.API_URE_LOAD,
  };
}

// Impersonation
function impersonationAction(payload) {
  return {
    type: ApiConstants.API_IMPERSONATION_LOAD,
    payload,
  };
}

/* Affiliates Listing */
function getAffiliatesListingAction(payload, sortBy, sortOrder) {
  return {
    type: ApiConstants.API_AFFILIATES_LISTING_LOAD,
    payload,
    sortBy,
    sortOrder,
  };
}

function getAffiliatesListingResetAction(payload, sortBy, sortOrder) {
  return {
    type: ApiConstants.API_AFFILIATES_LISTING_RESET,
    payload,
    sortBy,
    sortOrder,
  };
}

/* Save Affiliate */
function saveAffiliateAction(payload) {
  return {
    type: ApiConstants.API_SAVE_AFFILIATE_LOAD,
    payload,
  };
}

function saveAffiliateFinderAction(payload) {
  return {
    type: ApiConstants.API_SAVE_AFFILIATE_FINDER_LOAD,
    payload,
  };
}

function saveUserOrganisationAction(organisationId, payload, onSuccess) {
  return {
    type: ApiConstants.API_SAVE_USER_ORGANISATION_LOAD,
    payload,
    organisationId,
    onSuccess,
  };
}

/* Get Affiliate by Organisation Id */
function getAffiliateByOrganisationIdAction(organisationId) {
  return {
    type: ApiConstants.API_AFFILIATE_BY_ORGANISATION_LOAD,
    payload: organisationId,
  };
}

/* Get Affiliate by Organisation Id */
function getOrganisationDetailByOrganisationIdAction(organisationId) {
  return {
    type: ApiConstants.API_ORGANISATION_DETAIL_BY_ORGANISATION_LOAD,
    payload: organisationId,
  };
}

/* Get state memberships Organisation Id */
function getStateMembershipsByOrganisationIdAction(organisationId) {
  return {
    type: ApiConstants.API_ORGANISATION_MEMBERSHIPS_BY_ORGID_LOAD,
    payload: organisationId,
  };
}

/* Get Affiliate Our Organisation */
function getAffiliateOurOrganisationIdAction(organisationId) {
  return {
    type: ApiConstants.API_AFFILIATE_OUR_ORGANISATION_LOAD,
    payload: organisationId,
  };
}

/* Get AffiliateTo Organisation */
function getAffiliateToOrganisationAction(organisationId, searchText) {
  return {
    type: ApiConstants.API_AFFILIATE_TO_ORGANISATION_LOAD,
    payload: organisationId,
    searchText,
  };
}

/* Export Affiliates */
function exportAffiliateUsersAction(filter) {
  return {
    type: ApiConstants.API_EXPORT_AFFILIATE_LOAD_DATA,
    payload: filter,
  };
}
// Update Affiliate
function updateAffiliateAction(data, key) {
  return {
    type: ApiConstants.UPDATE_AFFILIATE,
    updatedData: data,
    key,
  };
}

// Update NewAffiliate
function updateNewAffiliateAction(data, key) {
  return {
    type: ApiConstants.UPDATE_NEW_AFFILIATE,
    updatedData: data,
    key,
  };
}

// Update Org Affiliate
function updateOrgAffiliateAction(data, key) {
  return {
    type: ApiConstants.UPDATE_ORG_AFFILIATE,
    updatedData: data,
    key,
  };
}

// Get organisation
function getOrganisationAction(key) {
  return {
    type: ApiConstants.API_ORGANISATION_LOAD,
    key,
  };
}

function affiliateDeleteAction(affiliateId) {
  return {
    type: ApiConstants.API_AFFILIATE_DELETE_LOAD,
    payload: affiliateId,
  };
}

// Get particular user organisation
function getUserOrganisationAction() {
  return {
    type: ApiConstants.API_GET_USER_ORGANISATION_LOAD,
  };
}

// onchange user organisation data
function onOrganisationChangeAction(organisationData, key) {
  return {
    type: ApiConstants.ONCHANGE_USER_ORGANISATION,
    organisationData,
    key,
  };
}

/* User Communication Privacy */
function getCommunicationPrivacy(payload) {
  return {
    type: ApiConstants.API_USER_COMMUNICATION_PRIVACY_LOAD,
    payload,
  };
}

function updateCommunicationPrivacy(payload) {
  return {
    type: ApiConstants.API_USER_UPDATE_COMMUNICATION_PRIVACY_LOAD,
    payload,
  };
}

/* User Dashboard Textual Listing */
function getUserDashboardTextualAction(payload, sortBy, sortOrder) {
  return {
    type: ApiConstants.API_USER_DASHBOARD_TEXTUAL_LOAD,
    payload,
    sortBy,
    sortOrder,
  };
}

function getUserDashboardTextualSpectatorCountAction(payload) {
  return {
    type: ApiConstants.API_USER_DASHBOARD_TEXTUAL_SPECTATOR_COUNT_LOAD,
    payload,
  };
}
function getUserModulePersonalDetailsAction(payload) {
  return {
    type: ApiConstants.API_USER_MODULE_PERSONAL_DETAIL_LOAD,
    payload: payload,
  };
}

function getUserModuleDocumentsAction(payload) {
  return {
    type: ApiConstants.API_USER_MODULE_DOCUMENTS_LOAD,
    payload,
  };
}

function removeUserModuleDocumentAction(id) {
  return {
    type: ApiConstants.API_USER_MODULE_REMOVE_DOCUMENT_LOAD,
    payload: id,
  };
}

function getUserModulePersonalByCompetitionAction(payload) {
  return {
    type: ApiConstants.API_USER_MODULE_PERSONAL_BY_COMPETITION_LOAD,
    payload,
  };
}

function getUserModuleRegistrationAction(payload) {
  return {
    type: ApiConstants.API_USER_MODULE_REGISTRATION_LOAD,
    payload,
  };
}

function getUserOwnModuleRegistrationAction(payload) {
  return {
    type: ApiConstants.API_USER_MODULE_OWN_REGISTRATION_LOAD,
    payload,
  };
}

function getUserModuleTeamRegistrationAction(payload) {
  return {
    type: ApiConstants.API_USER_MODULE_TEAM_REGISTRATION_LOAD,
    payload,
  };
}

function getUserModuleOtherRegistrationAction(payload) {
  return {
    type: ApiConstants.API_USER_MODULE_OTHER_REGISTRATION_LOAD,
    payload,
  };
}

function getUserModuleMedicalInfoAction(userId) {
  return {
    type: ApiConstants.API_USER_MODULE_MEDICAL_INFO_LOAD,
    payload: userId,
  };
}

function getUserModuleActivityPlayerAction(userId) {
  return {
    type: ApiConstants.API_USER_MODULE_ACTIVITY_PLAYER_LOAD,
    payload: userId,
  };
}

function getUserModuleActivityParentAction(userId) {
  return {
    type: ApiConstants.API_USER_MODULE_ACTIVITY_PARENT_LOAD,
    payload: userId,
  };
}

function getUserModuleActivityScorerAction(userId) {
  return {
    type: ApiConstants.API_USER_MODULE_ACTIVITY_SCORER_LOAD,
    payload: userId,
  };
}

function getUserModuleActivityManagerAction(userId) {
  return {
    type: ApiConstants.API_USER_MODULE_ACTIVITY_MANAGER_LOAD,
    payload: userId,
  };
}

function getUserFriendAction(payload, sortBy, sortOrder) {
  return {
    type: ApiConstants.API_USER_FRIEND_LOAD,
    payload,
    sortBy,
    sortOrder,
  };
}

function exportUserFriendAction(payload) {
  return {
    type: ApiConstants.API_EXPORT_USER_FRIEND_LOAD,
    payload,
  };
}

function getUserReferFriendAction(payload, sortBy, sortOrder) {
  return {
    type: ApiConstants.API_USER_REFER_FRIEND_LOAD,
    payload,
    sortBy,
    sortOrder,
  };
}

function initRegistrationFormSubmissionsAction(payload) {
  return {
    type: ApiConstants.API_REGISTRATION_FORM_SUBMISSIONS_INIT,
    payload,
  };
}

function getRegistrationFormSubmissionsAction(payload) {
  return {
    type: ApiConstants.API_REGISTRATION_FORM_SUBMISSIONS_LOAD,
    payload,
  };
}

function updateSubmissionsSearchAction(key, value) {
  return {
    type: ApiConstants.API_UPDATE_SUBMISSIONS_SEARCH,
    key,
    value,
  };
}

function exportUserReferFriendAction(payload) {
  return {
    type: ApiConstants.API_EXPORT_USER_REFER_FRIEND_LOAD,
    payload,
  };
}

function getOrganisationPhotoAction(payload) {
  return {
    type: ApiConstants.API_GET_ORG_PHOTO_LOAD,
    payload,
  };
}

function saveOrganisationPhotoAction(payload) {
  return {
    type: ApiConstants.API_SAVE_ORG_PHOTO_LOAD,
    payload,
  };
}

function deleteOrganisationPhotoAction(payload) {
  return {
    type: ApiConstants.API_DELETE_ORG_PHOTO_LOAD,
    payload,
  };
}

function deleteOrgContact(payload) {
  return {
    type: ApiConstants.API_DELETE_ORG_CONTACT_LOAD,
    payload,
  };
}

/* Export Organisation Registration Question */
function exportOrgRegQuestionAction(payload) {
  return {
    type: ApiConstants.API_EXPORT_ORG_REG_QUESTIONS_LOAD,
    payload,
  };
}

/* Export User Registration Data */
function getSubmittedRegData(payload) {
  return {
    type: ApiConstants.API_GET_SUBMITTED_REG_DATA_LOAD,
    payload,
  };
}

/* Transfer User Registration */
function transferUserRegistration(payload) {
  return {
    type: ApiConstants.API_TRANSFER_USER_REGISTRATION_LOAD,
    payload,
  };
}

/* Export User Registration Data */
function exportUserRegData(payload) {
  return {
    type: ApiConstants.API_EXPORT_USER_REG_DATA_LOAD,
    payload,
  };
}

/* Affiliate Directory Listing */
function getAffiliateDirectoryAction(payload, sortBy, sortOrder) {
  return {
    type: ApiConstants.API_AFFILIATE_DIRECTORY_LOAD,
    payload,
    sortBy,
    sortOrder,
  };
}

/* Export Affiliate Directory */
function exportAffiliateDirectoryAction(payload) {
  return {
    type: ApiConstants.API_EXPORT_AFFILIATE_DIRECTORY_LOAD,
    payload,
  };
}

function userProfileUpdateAction(data) {
  return {
    type: ApiConstants.API_USER_PROFILE_UPDATE_LOAD,
    data,
  };
}

function userProfileUpdateHideStatisticsAction(data) {
  return {
    type: ApiConstants.API_USER_PROFILE_UPDATE_HIDE_STATISTICS_LOAD,
    data,
  };
}

function addChildAction(body, userId, sameEmail) {
  return {
    type: ApiConstants.API_ADD_CHILD_LOAD,
    payload: { body, userId, sameEmail },
  };
}

function addParentAction(body, userId, sameEmail) {
  return {
    type: ApiConstants.API_ADD_PARENT_LOAD,
    payload: { body, userId, sameEmail },
  };
}

function userPhotoUpdateAction(payload, userId) {
  return {
    type: ApiConstants.API_USER_PHOTO_UPDATE_LOAD,
    payload,
    userId,
  };
}

function userDetailUpdateAction(payload) {
  return {
    type: ApiConstants.API_USER_DETAIL_UPDATE_LOAD,
    payload,
  };
}

function userPasswordUpdateAction(payload) {
  return {
    type: ApiConstants.API_USER_PASSWORD_UPDATE_LOAD,
    payload,
  };
}

function getUserHistoryAction(userId) {
  return {
    type: ApiConstants.API_USER_MODULE_HISTORY_LOAD,
    payload: userId,
  };
}

function getUserProfileAction() {
  return {
    type: ApiConstants.API_USER_DETAIL_LOAD,
  };
}

// update charity value
function updateCharityValue(value, index, key) {
  return {
    type: ApiConstants.UPDATE_ORGANISATION_CHARITY_ROUND_UP,
    value,
    index,
    key,
  };
}

function updateCharityAction(payload) {
  return {
    type: ApiConstants.API_UPDATE_CHARITY_ROUND_UP_LOAD,
    payload,
  };
}

function updateTermsAndConditionAction(payload) {
  return {
    type: ApiConstants.API_UPDATE_TERMS_AND_CONDITION_LOAD,
    payload,
  };
}

function userDeleteAction(payload) {
  return {
    type: ApiConstants.API_USER_DELETE_LOAD,
    payload,
  };
}

function getUserModuleIncidentListAction(payload) {
  return {
    type: ApiConstants.API_GET_USER_MODULE_INCIDENT_LIST_LOAD,
    payload,
  };
}

function getUserModuleSuspendedMatchesAction(payload) {
  return {
    type: ApiConstants.API_GET_USER_MODULE_SUSPENDED_MATCHES_LIST_LOAD,
    payload,
  };
}

function getUserRole(userId) {
  return {
    type: ApiConstants.API_GET_USER_ROLE_LOAD,
    userId,
  };
}

function getScorerData(payload, roleId, matchStatus) {
  return {
    type: ApiConstants.API_GET_SCORER_ACTIVITY_LOAD,
    payload,
    roleId,
    matchStatus,
  };
}

function getUmpireData(payload, roleId, matchStatus) {
  return {
    type: ApiConstants.API_GET_UMPIRE_DATA_LOAD,
    payload,
    roleId,
    matchStatus,
  };
}

function getCoachData(payload, roleId, matchStatus) {
  return {
    type: ApiConstants.API_GET_COACH_DATA_LOAD,
    payload,
    roleId,
    matchStatus,
  };
}

function getUmpireActivityListAction(payload, roleId, userId, sortBy, sortOrder) {
  return {
    type: ApiConstants.API_GET_UMPIRE_ACTIVITY_LIST_LOAD,
    payload,
    roleId,
    userId,
    sortBy,
    sortOrder,
  };
}

function getBannerCnt(organisationId) {
  return {
    type: ApiConstants.API_BANNER_COUNT_LOAD,
    organisationId,
  };
}

function updateBannerAction(payload) {
  return {
    type: ApiConstants.API_UPDATE_BANNER_COUNT_LOAD,
    payload,
  };
}

function clearListAction(payload) {
  return {
    type: ApiConstants.API_CLEAR_LIST_DATA,
    payload,
  };
}

function getSpectatorListAction(payload, sortBy, sortOrder) {
  return {
    type: ApiConstants.API_GET_SPECTATOR_LIST_LOAD,
    payload,
    sortBy,
    sortOrder,
  };
}

function registrationResendEmailAction(teamId, userId) {
  return {
    type: ApiConstants.API_REGISTRATION_RESEND_EMAIL_LOAD,
    teamId,
    userId,
  };
}

function resetTfaAction(Id) {
  return {
    type: ApiConstants.Api_RESET_TFA_LOAD,
    Id,
  };
}

function addUsersToBeCompared(users) {
  return {
    type: ApiConstants.ADD_USERS_TO_BE_MERGED,
    payload: users,
  };
}

function getUserModuleTeamMembersAction(payload) {
  return {
    type: ApiConstants.API_GET_USER_MODULE_TEAM_MEMBERS_LOAD,
    payload,
  };
}

function getNetSetGoActionList(payload, sortBy, sortOrder) {
  return {
    type: ApiConstants.API_GET_NETSETGO_LIST_LOAD,
    payload,
    sortBy,
    sortOrder,
  };
}

function teamMemberSaveUpdateAction(data, key, index, subIndex) {
  return {
    type: ApiConstants.TEAM_MEMBER_SAVE_UPDATE_ACTION,
    data,
    key,
    index,
    subIndex,
  };
}

function teamMembersSaveAction(payload) {
  return {
    type: ApiConstants.API_TEAM_MEMBERS_SAVE_LOAD,
    payload,
  };
}

function getTeamMembersAction(teamMemberRegId) {
  return {
    type: ApiConstants.API_GET_TEAM_MEMBERS_LOAD,
    teamMemberRegId,
  };
}

function updateReviewInfoAction(value, key, index, subkey, subIndex) {
  return {
    type: ApiConstants.UPDATE_TEAM_MEMBER_REVIEW_INFO,
    value,
    key,
    index,
    subkey,
    subIndex,
  };
}

function getTeamMembersReviewAction(payload) {
  return {
    type: ApiConstants.API_GET_TEAM_MEMBERS_REVIEW_LOAD,
    payload,
  };
}

function teamMemberUpdateAction(data) {
  return {
    type: ApiConstants.API_TEAM_MEMBER_UPDATE_LOAD,
    data,
  };
}

function teamMemberSendInviteAction(data) {
  return {
    type: ApiConstants.API_TEAM_MEMBER_SEND_INVITE_LOAD,
    data,
  };
}

function filterByRelations(data) {
  return {
    type: ApiConstants.API_FILTER_USERS_LOAD,
    data,
  };
}

function getUsersByIds(data) {
  return {
    type: ApiConstants.API_GET_USERS_BY_IDS_LOAD,
    data,
  };
}

export function getUserVenueGroups(data) {
  return {
    type: ApiConstants.API_GET_USER_VENUE_GROUPS_LOAD,
    data,
  };
}

function getUserParentDataAction(data) {
  return {
    type: ApiConstants.API_GET_USER_PARENT_DATA_LOAD,
    data,
  };
}

function setAffiliateDirectoryListPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_AFFILIATE_DIRECTORY_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setAffiliateDirectoryListPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_AFFILIATE_DIRECTORY_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

function setNetSetGoListPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_NETSETGO_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setNetSetGoListPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_NETSETGO_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

function setPlayWithFriendListPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_PLAY_WITH_FRIEND_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setPlayWithFriendListPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_PLAY_WITH_FRIEND_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

function setReferFriendListPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_REFER_FRIEND_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setReferFriendListPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_REFER_FRIEND_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

function setFormSubmissionsListPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_REGISTRATION_FORM_SUBMISSIONS_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setFormSubmissionsListPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_REGISTRATION_FORM_SUBMISSIONS_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

function setSpectatorListPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_SPECTATOR_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setSpectatorListPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_SPECTATOR_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

function setAffiliateTableListPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_USER_AFFILIATES_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setAffiliateTableListPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_USER_AFFILIATES_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

function setTextualTableListPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_USER_TEXTUAL_LIST_PAGE_SIZE,
    pageSize,
  };
}

function setTextualTableListPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_USER_TEXTUAL_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

function cancelDeRegistrationAction(payload) {
  return {
    type: ApiConstants.API_CANCEL_DEREGISTRATION_LOAD,
    payload,
  };
}

function getUserTermsAndConditionsAction() {
  return {
    type: ApiConstants.API_GET_USER_TERMS_AND_CONDITIONS_LOAD,
  };
}

function saveUserTermsAndConditionsAction(payload) {
  return {
    type: ApiConstants.API_SAVE_USER_TERMS_AND_CONDITIONS_LOAD,
    payload,
  };
}

function getStateSettingsAction(organisationId) {
  return {
    type: ApiConstants.API_STATE_SETTINGS_LOAD,
    organisationId,
  };
}

function getStateOrganisationsAction(organisationId) {
  return {
    type: ApiConstants.API_STATE_ORGANISATIONS_LOAD,
    organisationId,
  };
}

function liveScoreGetSummaryScoringByUserAction(payload) {
  return { type: ApiConstants.API_LIVE_SCORE_GET_SUMMARY_SCORING_BY_USER_LOAD, payload };
}

function liveScoreGetSuspensionsAction(filter, suspensionApplyToList) {
  return {
    type: ApiConstants.LIVE_SCORE_GET_SUSPENSIONS_LIST_LOAD,
    filter,
    suspensionApplyToList,
  };
}

function liveScoreGetTribunalsAction(filter, penaltyTypeList) {
  return {
    type: ApiConstants.LIVE_SCORE_GET_TRIBUNALS_LIST_LOAD,
    filter,
    penaltyTypeList,
  };
}

function getMergeSelectedUserDetailsAction(payload) {
  return {
    type: ApiConstants.API_GET_MERGE_SELECTED_USER_LOAD,
    payload: payload,
  };
}

function getMergedUserListAction(userId) {
  return {
    type: ApiConstants.API_GET_MERGED_USER_LIST_LOAD,
    userId,
  };
}

function clearUserDuplicatesListAction() {
  return {
    type: ApiConstants.API_GET_USER_DUPLICATES_LIST_RESET,
  };
}

function updateUserDuplicatesFilterAction(key, value) {
  return {
    type: ApiConstants.API_UPDATE_USER_DUPLICATES_FILTER,
    payload: { key, value },
  };
}

function getUserDuplicatesListAction(payload) {
  return {
    type: ApiConstants.API_GET_USER_DUPLICATES_LIST_LOAD,
    payload,
  };
}

function exportUserDuplicatesListAction(payload) {
  return {
    type: ApiConstants.API_EXPORT_USER_DUPLICATES_LIST_LOAD,
    payload,
  };
}

function userIgnoreMatchAction(payload) {
  return {
    type: ApiConstants.API_GET_USER_IGNORE_MATCH_LOAD,
    payload,
  };
}

function resetMergedUserListAction(userId) {
  return {
    type: ApiConstants.API_GET_MERGED_USER_LIST_RESET,
    userId,
  };
}

function undeleteUserAction(userId, deletedUserId) {
  return {
    type: ApiConstants.API_UNDELETE_MERGED_USER_LOAD,
    userId,
    deletedUserId,
  };
}

function loadRegSettingLinksAction(organisationUniqueKey) {
  return {
    type: ApiConstants.API_REG_SETTING_LINK_LOAD,
    organisationUniqueKey,
  };
}

function updateRegSettingLinks(key, index, value) {
  return {
    type: ApiConstants.API_REG_SETTING_LINK_UPDATE,
    key,
    index,
    value,
  };
}

export {
  getRoleAction,
  getUreAction,
  getAffiliatesListingAction,
  getAffiliatesListingResetAction,
  saveAffiliateAction,
  getCommunicationPrivacy,
  updateCommunicationPrivacy,
  getAffiliateByOrganisationIdAction,
  getAffiliateToOrganisationAction,
  updateAffiliateAction,
  updateNewAffiliateAction,
  getAffiliateOurOrganisationIdAction,
  updateOrgAffiliateAction,
  getOrganisationAction,
  affiliateDeleteAction,
  getUserOrganisationAction,
  onOrganisationChangeAction,
  getUserDashboardTextualAction,
  getUserModulePersonalDetailsAction,
  getUserModuleDocumentsAction,
  removeUserModuleDocumentAction,
  getUserModuleMedicalInfoAction,
  getUserModuleRegistrationAction,
  getUserModuleTeamRegistrationAction,
  getUserModuleOtherRegistrationAction,
  getUserModulePersonalByCompetitionAction,
  getUserModuleActivityPlayerAction,
  getUserModuleActivityParentAction,
  getUserModuleActivityScorerAction,
  getUserModuleActivityManagerAction,
  getUserFriendAction,
  exportUserFriendAction,
  getUserReferFriendAction,
  initRegistrationFormSubmissionsAction,
  getRegistrationFormSubmissionsAction,
  updateSubmissionsSearchAction,
  exportUserReferFriendAction,
  getOrganisationPhotoAction,
  saveOrganisationPhotoAction,
  deleteOrganisationPhotoAction,
  deleteOrgContact,
  exportOrgRegQuestionAction,
  getAffiliateDirectoryAction,
  exportAffiliateDirectoryAction,
  userProfileUpdateAction,
  getUserHistoryAction,
  userPhotoUpdateAction,
  userDetailUpdateAction,
  userPasswordUpdateAction,
  getUserProfileAction,
  updateCharityValue,
  updateCharityAction,
  updateTermsAndConditionAction,
  impersonationAction,
  userDeleteAction,
  getUserModuleIncidentListAction,
  getUserRole,
  getScorerData,
  getUmpireData,
  getCoachData,
  getUmpireActivityListAction,
  getBannerCnt,
  updateBannerAction,
  clearListAction,
  getSpectatorListAction,
  registrationResendEmailAction,
  resetTfaAction,
  addUsersToBeCompared,
  getUserModuleTeamMembersAction,
  getNetSetGoActionList,
  addChildAction,
  addParentAction,
  teamMemberSaveUpdateAction,
  teamMembersSaveAction,
  getTeamMembersAction,
  updateReviewInfoAction,
  getTeamMembersReviewAction,
  teamMemberUpdateAction,
  teamMemberSendInviteAction,
  exportUserRegData,
  getSubmittedRegData,
  transferUserRegistration,
  filterByRelations,
  getUsersByIds,
  getUserParentDataAction,
  setAffiliateDirectoryListPageSizeAction,
  setAffiliateDirectoryListPageNumberAction,
  setNetSetGoListPageSizeAction,
  setNetSetGoListPageNumberAction,
  setPlayWithFriendListPageSizeAction,
  setPlayWithFriendListPageNumberAction,
  setReferFriendListPageSizeAction,
  setReferFriendListPageNumberAction,
  setSpectatorListPageSizeAction,
  setSpectatorListPageNumberAction,
  setAffiliateTableListPageSizeAction,
  setAffiliateTableListPageNumberAction,
  setTextualTableListPageSizeAction,
  setTextualTableListPageNumberAction,
  cancelDeRegistrationAction,
  getUserDashboardTextualSpectatorCountAction,
  getUserTermsAndConditionsAction,
  saveUserTermsAndConditionsAction,
  getUserModuleSuspendedMatchesAction,
  getOrganisationDetailByOrganisationIdAction,
  saveAffiliateFinderAction,
  getStateMembershipsByOrganisationIdAction,
  getStateSettingsAction,
  getStateOrganisationsAction,
  liveScoreGetSummaryScoringByUserAction,
  userProfileUpdateHideStatisticsAction,
  getUserOwnModuleRegistrationAction,
  liveScoreGetSuspensionsAction,
  liveScoreGetTribunalsAction,
  getMergeSelectedUserDetailsAction,
  getMergedUserListAction,
  getUserDuplicatesListAction,
  exportUserDuplicatesListAction,
  clearUserDuplicatesListAction,
  updateUserDuplicatesFilterAction,
  userIgnoreMatchAction,
  resetMergedUserListAction,
  undeleteUserAction,
  saveUserOrganisationAction,
  loadRegSettingLinksAction,
  updateRegSettingLinks,
  exportAffiliateUsersAction,
};
