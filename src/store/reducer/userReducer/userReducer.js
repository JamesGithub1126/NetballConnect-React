import ApiConstants from 'themes/apiConstants';
import AppConstants from 'themes/appConstants';
import {
  isArrayNotEmpty,
  deepCopyFunction,
  feeIsNull,
  formatValue,
  isNotNullAndUndefined,
} from 'util/helpers';
import { setImpersonation } from 'util/sessionStorage';
import { message } from 'antd';
import { transactionFeeCap } from 'util/enums';
import moment from 'moment';

const teamMemberObj = {
  genderRefId: null,
  email: '',
  lastName: '',
  firstName: '',
  middleName: null,
  dateOfBirth: null,
  mobileNumber: '',
  payingFor: 0,
  emergencyFirstName: null,
  emergencyLastName: null,
  emergencyContactNumber: null,
  isRegistererAsParent: 0,
  parentOrGuardian: [],
  membershipProductTypes: [],
};

const teamMembersSaveTemp = {
  competitionId: null,
  organisationId: null,
  registrationId: null,
  teamMemberRegId: null,
  existingUserId: null,
  registeringYourself: 4,
  competitionMembershipProductDivisionId: null,
  teamId: null,
  registeringPersonUserId: null,
  name: null,
  countryRefId: null,
  mobileNumber: null,
  teamName: null,
  divisions: [],
  teamMembers: [],
  registrationRestrictionTypeRefId: null,
};

const affiliate = {
  affiliateId: 0,
  affiliateOrgId: 0,
  organisationTypeRefId: 0,
  affiliatedToOrgId: 0,
  organisationId: '',
  name: '',
  street1: '',
  street2: '',
  suburb: '',
  phoneNo: '',
  email: '',
  city: '',
  postalCode: '',
  stateRefId: 0,
  whatIsTheLowestOrgThatCanAddChild: 3,
  whatIsTheLowestOrgThatCanAddVenue: 4,
  isRestrictedToLinkedVenues: 0,
  contacts: [],
  charityRoundUp: [],
  charity: [],
};

// let affiliateListObj = {
//   affiliateId: 0,
//   affiliateToOrgId: 0,
//   affiliateOrgId: 0,
//   affiliateName: '',
//   affiliatedToName: '',
//   organisationTypeRefName: '',
//   contact1Name: '',
//   contact2Name: '',
//   statusRefName: ''
// };
//
// let affiliateToObj = {
//   affiliateTo: [],
//   organisationTypes: [],
//   organisationName: ''
// };

const initialState = {
  onLoad: false,
  onLoadAffiliates: false,
  onloadRegSettings: false,
  affiliateOnLoad: false,
  affiliateToOnLoad: false,
  affiliateOurOrgOnLoad: false,
  onloadOrgDetail: false,
  onTextualLoad: false,
  onUpUpdateLoad: false,
  error: null,
  result: [],
  status: 0,
  affiliate: { affiliate },
  affiliateEdit: affiliate,
  affiliateOurOrg: affiliate,
  affiliateList: [],
  affiliatesByParentList: [],
  affiliateTo: {},
  roles: [],
  userRolesEntity: [],
  userCommunicationPrivacy: [],
  affiliateListPage: 1,
  affiliateListPageSize: 10,
  affiliateListTotalCount: 1,
  venueOrganisation: [],
  allUserOrganisationData: [],
  getUserOrganisation: [],
  organisationUniqueKey: {},
  userDashboardTextualList: [],
  userDashboardTextualPage: 1,
  userDashboardTextualPageSize: 10,
  userDashboardTextualTotalCount: 1,
  personalData: {},
  personalEmergency: [],
  medicalData: [],
  documents: [],
  personalByCompData: [],
  userRegistrationList: null,
  userRegistrationPage: 1,
  userRegistrationTotalCount: 1,
  userRegistrationOnLoad: false,
  activityPlayerOnLoad: false,
  activityPlayerList: [],
  activityPlayerPage: 1,
  activityPlayerTotalCount: 1,
  activityParentOnLoad: false,
  activityParentList: [],
  activityParentPage: 1,
  activityParentTotalCount: 1,
  activityScorerOnLoad: false,
  activityScorerList: [],
  activityScorerPage: 1,
  activityScorerTotalCount: 1,
  activityManagerOnLoad: false,
  activityManagerList: [],
  activityManagerPage: 1,
  activityManagerTotalCount: 1,
  onOrgLoad: false,
  friendList: [],
  friendPage: 1,
  friendPageSize: 10,
  friendTotalCount: 1,
  referFriendList: [],
  referFriendPage: 1,
  referFriendPageSize: 10,
  referFriendTotalCount: 1,
  formSubmissionsList: [],
  formSubmissionsPage: 1,
  formSubmissionsPageSize: 10,
  formSubmissionsTotalCount: 1,
  formSubmissionSearch: {
    startDate: null,
    endDate: null,
    registrationUniqueKey: null,
    searchText: null,
  },
  orgPhotosList: [],
  userDashboardCounts: null,
  userDashboardSpectatorCount: 0,
  onAffiliateDirLoad: false,
  affiliateDirectoryList: [],
  affiliateDirectoryPage: 1,
  affiliateDirectoryPageSize: 10,
  affiliateDirectoryTotalCount: 1,
  organisationTypes: [],
  onExpAffiliateDirLoad: false,
  onMedicalLoad: false,
  onPersonLoad: false,
  userHistoryLoad: false,
  userHistoryList: [],
  userHistoryPage: 1,
  userHistoryTotalCount: 1,
  isProfileLoaded: false,
  userProfile: {},
  userDetailUpdate: false,
  userPhotoUpdate: false,
  userPasswordUpdate: false,
  defaultCharityRoundUp: [],
  impersonationLoad: false,
  impersonation: false,
  userRoleEntity: [],
  userProfileUpdate: null,
  userIncidentData: [],
  incidentDataLoad: false,
  incidentCurrentPage: null,
  incidentTotalCount: null,
  userRole: [],
  scorerActivityRoster: [],
  scorerCurrentPage: null,
  scorerTotalCount: null,
  umpireDataLoad: false,
  umpireActivityRoster: [],
  umpireCurrentPage: null,
  umpireTotalCount: null,
  coachDataLoad: false,
  coachActivityRoster: [],
  coachCurrentPage: null,
  coachTotalCount: null,
  umpireActivityOnLoad: false,
  umpireActivityList: [],
  umpireActivityCurrentPage: 1,
  umpireActivityTotalCount: 0,
  userTextualDasboardListAction: null,
  affiliateDirListAction: null,
  userAffiliateListAction: null,
  userFriendListAction: null,
  userReferFriendListAction: null,
  onSaveOrgPhotoLoad: false,
  onDeleteOrgPhotoLoad: false,
  bannerCount: null,
  onLoadSearch: false,
  impersonationAccess: false,
  spectatorList: [],
  spectatorPage: 1,
  spectatorPageSize: 10,
  spectatorTotalCount: 1,
  spectatorListAction: null,
  impersonationList: [],
  onImpersonationLoad: false,
  usersToBeMerged: [],
  teamMembersDetails: null,
  getTeamMembersOnLoad: false,
  teamMembersSave: deepCopyFunction(teamMembersSaveTemp),
  membershipProductsInfo: null,
  onMembershipLoad: false,
  teamMemberRegReviewList: null,
  teamMembersSaveErrorMsg: null,
  teamMemberRegId: null,
  teamMembersSaveOnLoad: false,
  getTeamMembersReviewOnLoad: false,
  possibleMatches: [],
  possibleMatchesOnLoad: false,
  onTeamUpdateLoad: false,
  teamMemberUpdate: null,
  teamMemberDeletion: false,
  addTeamMember: false,
  userSubmittedRegData: [],
  onTransferUserRegistrationLoad: false,
  organisationUsersList: [],
  usersByIdsList: [],
  parentData: [],
  getUserParentDataOnLoad: false,
  netSetGoList: [],
  netSetGoPage: 1,
  netSetGoPageSize: 10,
  netSetGoTotalCount: 1,
  isPersonalUserLoading: false,
  isDocumentLoading: false,
  isCompUserLoading: false,
  cancelDeRegistrationLoad: false,
  userTCAcknowledgement: false,
  suspendedMatchesDataLoad: false,
  suspendedMatchesData: [],
  suspendedMatchesCurrentPage: null,
  suspendedMatchesTotalCount: null,
  suspensionsDataLoad: false,
  suspensionsData: [],
  suspensionsCurrentPage: null,
  suspensionsTotalCount: null,
  tribunalsDataLoad: false,
  tribunalsData: [],
  tribunalsCurrentPage: null,
  tribunalsTotalCount: null,
  affiliateFinder: null,
  organisationMemberships: [],
  stateSettings: null,
  stateOrganisations: [],
  onLoadMatch: false,
  onLoadCareer: false,
  matchStats: [],
  careerStats: [],
  userOwnRegistrationOnLoad: false,
  mergeSelectedUser: {},
  mergeMatches: [],
  onLoadMergeSelectedUser: false,
  onLoadMergedUsers: false,
  mergedUserList: [],
  onLoadUndeleteUsers: false,
  onLoadUserDuplicates: false,
  userDuplicatesFilter: {
    showIgnoredMatches: false,
    searchText: null,
  },
  userVenueGroups: {
    loading: false,
    items: [],
  },
  userDuplicatesPage: { currentPage: 1, pageSize: 10, totalCount: 0 },
  userDuplicatesList: null,
  onRegSettingLinkLoad: false,
  regSettingLinks: [],
};

let uniqueRegLinkOrgId = 0;

//get User Role
function getIsUmpireUserRole(userRoleData) {
  let isUmpireRole = false;

  for (let i in userRoleData) {
    if (userRoleData[i].roleId == 15 || userRoleData[i].roleId == 20) {
      isUmpireRole = true;
      break;
    }
  }
  return isUmpireRole;
}

function getUpdatedTeamMemberObj(state, competition) {
  try {
    const teamMemberTemp = deepCopyFunction(teamMemberObj);
    teamMemberTemp.membershipProductTypes = [];
    let membershipProduct = competition.membershipProducts.find(
      x =>
        x.competitionMembershipProductId == state.team.competitionMembershipProductId &&
        x.competitionMembershipProductTypeId == state.team.competitionMembershipProductTypeId,
    );
    let division = membershipProduct.divisions.find(
      x =>
        x.competitionMembershipProductDivisionId ==
        state.team.competitionMembershipProductDivisionId,
    );
    const filteredTeamMembershipProducts = competition.membershipProducts.filter(
      x => x.isTeamRegistration === 1 && x.allowTeamRegistrationTypeRefId === 1,
    );
    for (let product of filteredTeamMembershipProducts) {
      const obj = {
        competitionMembershipProductId: product.competitionMembershipProductId,
        competitionMembershipProductTypeId: product.competitionMembershipProductTypeId,
        isPlayer: product.isPlayer,
        productTypeName: product.shortName,
        isChecked: false,
        fromDate: product.dobFromDate,
        toDate: product.dobToDate,
        name: product.name,
      };
      if (
        division &&
        division.fromDate &&
        division.toDate &&
        product.isPlayer &&
        obj.fromDate &&
        obj.toDate
      ) {
        if (
          moment(division.fromDate).isAfter(obj.toDate) ||
          moment(division.toDate).isBefore(obj.fromDate)
        ) {
          //membership type not in division range
          continue;
        }
      }
      teamMemberTemp.membershipProductTypes.push(obj);
    }
    return teamMemberTemp;
  } catch (ex) {
    console.log(`Error in getUpdatedTeamMemberObj::${ex}`);
  }
}

function updateTeamMembersSave(state) {
  try {
    const membershipProducts = state.membershipProductInfo;
    const organisation = membershipProducts[0];
    const competition = organisation.competitions[0];
    state.teamMembersSave.registrationRestrictionTypeRefId =
      competition.registrationRestrictionTypeRefId;
    state.teamMembersSave.teamMembers.push(getUpdatedTeamMemberObj(state, competition));
  } catch (ex) {
    console.log(`Error in updateTeamMemberSave::${ex}`);
  }
}

function userReducer(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_USER_FAIL:
      return {
        ...state,
        onLoad: false,
        impersonationLoad: false,
        userDetailUpdate: false,
        userPhotoUpdate: false,
        userPasswordUpdate: false,
        error: action.error,
        status: action.status,
        umpireActivityOnLoad: false,
        onMedicalLoad: false,
        possibleMatchesOnLoad: false,
        cancelDeRegistrationLoad: false,
        userOwnRegistrationOnLoad: false,
      };

    case ApiConstants.API_USER_ERROR:
      return {
        ...state,
        onLoad: false,
        impersonationLoad: false,
        userDetailUpdate: false,
        userPhotoUpdate: false,
        userPasswordUpdate: false,
        error: action.error,
        status: action.status,
        umpireActivityOnLoad: false,
        onMedicalLoad: false,
        possibleMatchesOnLoad: false,
        cancelDeRegistrationLoad: false,
      };

    // get Role Entity List for current user
    case ApiConstants.API_ROLE_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_ROLE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        roles: action.result,
        status: action.status,
      };

    // User Role Entity List for current user
    case ApiConstants.API_URE_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_URE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        userRoleEntity: action.result,
        status: action.status,
      };

    case ApiConstants.API_AFFILIATES_LISTING_LOAD:
      return {
        ...state,
        onLoad: action.payload.paging.limit !== -1,
        onLoadAffiliates: true,
        onImpersonationLoad: action.payload.paging.limit === -1,
        userAffiliateListAction: action,
      };

    case ApiConstants.API_AFFILIATES_LISTING_SUCCESS:
      const data = action.result;
      return {
        ...state,
        onLoad: false,
        onLoadAffiliates: false,
        affiliateList: data.affiliates,
        impersonationList: data.affiliates,
        affiliatesByParentList: data?.affiliateList || [],
        affiliateListPage: data.page ? data.page.currentPage : 1,
        affiliateListTotalCount: data.page ? data.page.totalCount : 0,
        status: action.status,
      };

    case ApiConstants.API_AFFILIATES_LISTING_RESET: {
      return {
        ...state,
        affiliateList: [],
      };
    }

    case ApiConstants.API_AFFILIATES_IMPERSONATION_LISTING_SUCCESS:
      return {
        ...state,
        onImpersonationLoad: false,
        impersonationList: action.result.affiliates,
        affiliatesByParentList: action.result?.affiliateList || [],
        status: action.status,
      };
    case ApiConstants.API_SAVE_AFFILIATE_LOAD:
    case ApiConstants.API_SAVE_AFFILIATE_FINDER_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_SAVE_AFFILIATE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.API_SAVE_AFFILIATE_FINDER_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        affiliateFinder: { ...action.result },
      };

    case ApiConstants.API_GET_USER_VENUE_GROUPS_LOAD:
      return {
        ...state,
        userVenueGroups: {
          ...state.userVenueGroups,
          loading: true,
          items: [],
        },
      };

    case ApiConstants.API_GET_USER_VENUE_GROUPS_SUCCESS:
      return {
        ...state,
        userVenueGroups: {
          ...state.userVenueGroups,
          loading: false,
          items: action.result.map(userVenueGroup => ({
            ...userVenueGroup,
            userVenues: userVenueGroup.userVenues.map(({ venueId }) => venueId),
          })),
        },
      };

    case ApiConstants.API_AFFILIATE_BY_ORGANISATION_LOAD:
      return { ...state, onLoad: true, affiliateOnLoad: true };

    case ApiConstants.API_AFFILIATE_BY_ORGANISATION_SUCCESS:
      return {
        ...state,
        onLoad: false,
        affiliateOnLoad: false,
        affiliateEdit: action.result,
        status: action.status,
      };

    case ApiConstants.API_ORGANISATION_DETAIL_BY_ORGANISATION_SUCCESS:
      return {
        ...state,
        affiliateFinder: action.result,
        onloadOrgDetail: false,
      };

    case ApiConstants.API_ORGANISATION_MEMBERSHIPS_BY_ORGID_SUCCESS:
      return {
        ...state,
        organisationMemberships: action.result,
      };

    case ApiConstants.API_ORGANISATION_DETAIL_BY_ORGANISATION_LOAD:
      return {
        ...state,
        onloadRegSettings: true,
      };

    case ApiConstants.API_AFFILIATE_OUR_ORGANISATION_LOAD:
      return { ...state, onLoad: true, affiliateOurOrgOnLoad: true };

    case ApiConstants.API_AFFILIATE_OUR_ORGANISATION_SUCCESS:
      const affiliateOurOrgData = action.result;
      const charityData = getCharityResult(action.charityResult);
      const selectedCharity = checkSelectedCharity(affiliateOurOrgData.charityRoundUp, charityData);
      affiliateOurOrgData.charityRoundUp = selectedCharity;

      return {
        ...state,
        onLoad: false,
        affiliateOurOrgOnLoad: false,
        affiliateOurOrg: affiliateOurOrgData,
        defaultCharityRoundUp: charityData,
        status: action.status,
      };

    case ApiConstants.API_AFFILIATE_TO_ORGANISATION_LOAD:
      return { ...state, onLoad: true, affiliateToOnLoad: true, onLoadSearch: true };

    case ApiConstants.API_AFFILIATE_TO_ORGANISATION_SUCCESS:
      return {
        ...state,
        onLoad: false,
        affiliateTo: action.result,
        affiliateToOnLoad: false,
        status: action.status,
        onLoadSearch: false,
      };

    case ApiConstants.UPDATE_AFFILIATE:
      let oldData = state.affiliateEdit;
      let updatedValue = action.updatedData;
      let getKey = action.key;
      oldData[getKey] = updatedValue;
      return { ...state, error: null };

    case ApiConstants.UPDATE_ORG_AFFILIATE:
      let oldOrgData = state.affiliateOurOrg;
      let updatedOrgValue = action.updatedData;
      let getOrgKey = action.key;
      oldOrgData[getOrgKey] = updatedOrgValue;
      /*   if (action.key == 'minFeeRange' || action.key == 'maxFeeRange') {
              let minFee = oldOrgData['minFeeRange'];
              let maxFee = oldOrgData['maxFeeRange'];
              if (isNotNullAndUndefined(minFee) && isNotNullAndUndefined(maxFee) && minFee > maxFee) {
                message.error(AppConstants.minMaxFeeError);
                oldOrgData['maxFeeRange'] = oldOrgData['minFeeRange'] + 1;
              }
            } */
      return { ...state, error: null };

    case ApiConstants.UPDATE_ORGANISATION_CHARITY_ROUND_UP:
      if (action.key === 'charityRoundUp') {
        state.affiliateOurOrg.charityRoundUp[action.index].isSelected = action.value;
      }

      if (action.key === 'name') {
        state.affiliateOurOrg.charity[action.index][action.key] = action.value;
      }
      if (action.key === 'description') {
        state.affiliateOurOrg.charity[action.index][action.key] = action.value;
      }

      return { ...state };

    case ApiConstants.UPDATE_NEW_AFFILIATE:
      let oldAffiliateData = state.affiliate.affiliate;
      let updatedVal = action.updatedData;
      let key = action.key;
      if (key === 'addAffiliate') {
        state.affiliate.affiliate = {
          affiliateId: 0,
          affiliateOrgId: 0,
          organisationTypeRefId: 0,
          affiliatedToOrgId: 0,
          organisationId: '',
          name: '',
          street1: '',
          street2: '',
          suburb: '',
          phoneNo: '',
          city: '',
          postalCode: '',
          stateRefId: 0,
          whatIsTheLowestOrgThatCanAddChild: 3,
          whatIsTheLowestOrgThatCanAddVenue: 4,
          isRestrictedToLinkedVenues: 0,
          contacts: [],
          email: '',
          charityRoundUp: [],
          charity: [],
        };
      } else {
        oldAffiliateData[key] = updatedVal;
      }

      return {
        ...state,
        error: null,
      };

    //Get organisation for add venue
    case ApiConstants.API_ORGANISATION_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_ORGANISATION_SUCCESS:
      return {
        ...state,
        venueOrganisation: action.result,
        onLoad: false,
        error: null,
        status: action.status,
      };

    case ApiConstants.API_BANNER_COUNT_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_BANNER_COUNT_SUCCESS:
      return {
        ...state,
        bannerCount: action.result,
        onLoad: false,
        error: null,
        status: action.status,
      };

    case ApiConstants.API_UPDATE_BANNER_COUNT_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_UPDATE_BANNER_COUNT_SUCCESS:
      return {
        ...state,
        bannerCount: action.result,
        onLoad: false,
        error: null,
        status: action.status,
      };

    //////delete the Affiliate
    case ApiConstants.API_AFFILIATE_DELETE_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_AFFILIATE_DELETE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    /////get particular user organisation
    case ApiConstants.API_GET_USER_ORGANISATION_LOAD:
    case ApiConstants.API_SAVE_USER_ORGANISATION_LOAD:
      return { ...state, onLoad: true, error: null, onOrgLoad: true };

    case ApiConstants.API_GET_USER_ORGANISATION_SUCCESS:
    case ApiConstants.API_SAVE_USER_ORGANISATION_SUCCESS:
      state.allUserOrganisationData = isArrayNotEmpty(action.result) ? action.result : [];
      state.getUserOrganisation = isArrayNotEmpty(action.result) ? action.result : [];
      state.onOrgLoad = false;
      return {
        ...state,
        onLoad: false,
        error: null,
        status: action.status,
      };

    ////onchange user organisation data
    case ApiConstants.ONCHANGE_USER_ORGANISATION:
      let allOrgData = JSON.parse(JSON.stringify(state.allUserOrganisationData));
      let organisationIndex = allOrgData.findIndex(
        x => x.organisationUniqueKey === action.organisationData.organisationUniqueKey,
      );
      if (organisationIndex > -1) {
        allOrgData.splice(organisationIndex, 1);
        state.getUserOrganisation = allOrgData;
      }
      return {
        ...state,
        organisationUniqueKey: action.organisationData.organisationUniqueKey,
        onLoad: false,
        error: null,
      };

    case ApiConstants.API_USER_COMMUNICATION_PRIVACY_LOAD:
      return { ...state };

    case ApiConstants.API_USER_COMMUNICATION_PRIVACY_SUCCESS:
      return {
        ...state,
        userCommunicationPrivacy: action.result,
        status: action.status,
      };

    case ApiConstants.API_USER_UPDATE_COMMUNICATION_PRIVACY_LOAD:
      return { ...state, onUpUpdateLoad: true };

    case ApiConstants.API_USER_UPDATE_COMMUNICATION_PRIVACY_SUCCESS:
      return {
        ...state,
        userCommunicationPrivacy: action.result,
        onUpUpdateLoad: false,
        status: action.status,
      };

    case ApiConstants.API_USER_DASHBOARD_TEXTUAL_LOAD:
      return { ...state, onTextualLoad: true, userTextualDasboardListAction: action };

    case ApiConstants.API_USER_DASHBOARD_TEXTUAL_SUCCESS:
      let textualData = action.result;
      return {
        ...state,
        onTextualLoad: false,
        userDashboardTextualList: textualData.users,
        userDashboardTextualPage: textualData.page ? textualData.page.currentPage : 1,
        userDashboardTextualTotalCount: textualData.page.totalCount,
        competitions: isArrayNotEmpty(textualData.competitions) ? textualData.competitions : [],
        organisations: isArrayNotEmpty(textualData.organisations) ? textualData.organisations : [],
        roles: isArrayNotEmpty(textualData.roles)
          ? textualData.roles.sort((a, b) => (a.description > b.description ? 1 : -1))
          : state.roles,
        userDashboardCounts: textualData.counts,
        status: action.status,
      };

    case ApiConstants.API_USER_DASHBOARD_TEXTUAL_SPECTATOR_COUNT_LOAD:
      return { ...state };

    case ApiConstants.API_USER_DASHBOARD_TEXTUAL_SPECTATOR_COUNT_SUCCESS:
      return {
        ...state,
        userDashboardSpectatorCount: action.result.spectatorCount,
      };

    case ApiConstants.API_USER_MODULE_PERSONAL_DETAIL_LOAD:
      return { ...state, onLoad: true, isPersonalUserLoading: true };

    case ApiConstants.API_USER_MODULE_PERSONAL_DETAIL_ERROR:
      return { ...state, onLoad: true, isPersonalUserLoading: false };

    case ApiConstants.API_USER_MODULE_PERSONAL_DETAIL_SUCCESS:
      let personalData = action.result;
      let arr = [];
      if (personalData != null) {
        let obj = {
          emergencyFirstName: personalData.emergencyFirstName,
          emergencyLastName: personalData.emergencyLastName,
          emergencyContactNumber: personalData.emergencyContactNumber,
          emergencyContactRelationshipId: personalData.emergencyContactRelationshipId,
          userId: personalData.userId,
        };
        arr.push(obj);
      }
      return {
        ...state,
        onLoad: false,
        personalData: personalData,
        personalEmergency: arr,
        status: action.status,
        isPersonalUserLoading: false,
      };

    case ApiConstants.API_USER_MODULE_DOCUMENTS_LOAD:
      return { ...state, onLoad: true, isDocumentLoading: true };

    case ApiConstants.API_USER_MODULE_DOCUMENTS_ERROR:
      return { ...state, onLoad: false, isDocumentLoading: false };

    case ApiConstants.API_USER_MODULE_DOCUMENTS_SUCCESS:
      let documents = action.result;
      return {
        ...state,
        onLoad: false,
        documents: documents,
        status: action.status,
        isDocumentLoading: false,
      };

    case ApiConstants.API_USER_MODULE_REMOVE_DOCUMENT_LOAD:
      return { ...state, isDocumentLoading: true };

    case ApiConstants.API_USER_MODULE_REMOVE_DOCUMENT_ERROR:
      return { ...state, isDocumentLoading: false };

    case ApiConstants.API_USER_MODULE_REMOVE_DOCUMENT_SUCCESS:
      return { ...state, isDocumentLoading: false };

    case ApiConstants.API_USER_MODULE_PERSONAL_BY_COMPETITION_LOAD:
      return { ...state, onPersonLoad: true, isCompUserLoading: true };

    case ApiConstants.API_USER_MODULE_PERSONAL_BY_COMPETITION_ERROR:
      return { ...state, onPersonLoad: false, isCompUserLoading: false };

    case ApiConstants.API_USER_MODULE_PERSONAL_BY_COMPETITION_SUCCESS:
      let personalByCompData = action.result;

      return {
        ...state,
        onPersonLoad: false,
        personalByCompData: personalByCompData,
        status: action.status,
        isCompUserLoading: false,
      };

    case ApiConstants.API_USER_MODULE_MEDICAL_INFO_LOAD:
      return { ...state, onMedicalLoad: true };

    case ApiConstants.API_USER_MODULE_MEDICAL_INFO_SUCCESS:
      let medicalData = action.result;
      return {
        ...state,
        onMedicalLoad: false,
        medicalData: medicalData,
        status: action.status,
      };

    case ApiConstants.API_USER_MODULE_REGISTRATION_LOAD:
      return { ...state, userRegistrationOnLoad: true };

    case ApiConstants.API_USER_MODULE_OWN_REGISTRATION_LOAD:
      return { ...state, userOwnRegistrationOnLoad: true };

    case ApiConstants.API_USER_MODULE_REGISTRATION_SUCCESS:
      let userRegistrationData = action.result;
      return {
        ...state,
        userRegistrationOnLoad: false,
        userRegistrationList: userRegistrationData,
        // userRegistrationDataPage: userRegistrationData.page ? userRegistrationData.page.currentPage : 1,
        // userRegistrationDataTotalCount: userRegistrationData.page.totalCount,
        status: action.status,
      };
    case ApiConstants.API_USER_MODULE_OWN_REGISTRATION_SUCCESS:
      let userRegistrationList = deepCopyFunction(state.userRegistrationList);
      if (userRegistrationList) {
        userRegistrationList.myRegistrations = action.result?.myRegistrations;
      }
      return {
        ...state,
        userOwnRegistrationOnLoad: false,
        userRegistrationList: userRegistrationList,
        status: action.status,
      };

    case ApiConstants.API_GET_USER_MODULE_TEAM_MEMBERS_LOAD:
      return { ...state, getTeamMembersOnLoad: true };

    case ApiConstants.API_GET_USER_MODULE_TEAM_MEMBERS_SUCCESS:
      let teamMembersDetailsData = action.result;
      return {
        ...state,
        getTeamMembersOnLoad: false,
        teamMembersDetails: teamMembersDetailsData,
        status: action.status,
      };

    case ApiConstants.API_USER_MODULE_TEAM_REGISTRATION_LOAD:
      return { ...state, userRegistrationOnLoad: true };

    case ApiConstants.API_USER_MODULE_TEAM_REGISTRATION_SUCCESS:
      let userTeamRegistrationData = action.result;
      return {
        ...state,
        userTeamRegistrationOnLoad: false,
        userTeamRegistrationList: userTeamRegistrationData.registrationTeamDetails,
        userTeamRegistrationDataPage: userTeamRegistrationData.page
          ? userTeamRegistrationData.page.currentPage
          : 1,
        userTeamRegistrationDataTotalCount: userTeamRegistrationData.page.totalCount,
        status: action.status,
      };

    case ApiConstants.API_USER_MODULE_OTHER_REGISTRATION_LOAD:
      return { ...state, userRegistrationOnLoad: true };

    case ApiConstants.API_USER_MODULE_OTHER_REGISTRATION_SUCCESS:
      let userOtherRegistrationData = action.result;
      return {
        ...state,
        userOtherRegistrationOnLoad: false,
        userOtherRegistrationList: userOtherRegistrationData.registrationYourDetails,
        userOtherRegistrationDataPage: userOtherRegistrationData.page
          ? userOtherRegistrationData.page.currentPage
          : 1,
        userOtherRegistrationDataTotalCount: userOtherRegistrationData.page.totalCount,
        status: action.status,
      };

    case ApiConstants.API_USER_MODULE_ACTIVITY_PLAYER_LOAD:
      return { ...state, activityPlayerOnLoad: true };

    case ApiConstants.API_USER_MODULE_ACTIVITY_PLAYER_SUCCESS:
      let activityPlayerData = action.result;
      return {
        ...state,
        activityPlayerOnLoad: false,
        activityPlayerList: activityPlayerData.activityPlayers,
        activityPlayerPage: activityPlayerData.page ? activityPlayerData.page.currentPage : 1,
        activityPlayerTotalCount: activityPlayerData.page.totalCount,
        status: action.status,
      };

    case ApiConstants.API_USER_MODULE_ACTIVITY_PARENT_LOAD:
      return { ...state, activityParentOnLoad: true };

    case ApiConstants.API_USER_MODULE_ACTIVITY_PARENT_SUCCESS:
      let activityParentData = action.result;
      return {
        ...state,
        activityParentOnLoad: false,
        activityParentList: activityParentData.activityParents,
        activityParentPage: activityParentData.page ? activityParentData.page.currentPage : 1,
        activityParentTotalCount: activityParentData.page.totalCount,
        status: action.status,
      };

    case ApiConstants.API_USER_MODULE_ACTIVITY_SCORER_LOAD:
      return { ...state, activityScorerOnLoad: true };

    case ApiConstants.API_USER_MODULE_ACTIVITY_SCORER_SUCCESS:
      let activityScorerData = action.result;
      return {
        ...state,
        activityScorerOnLoad: false,
        activityScorerList: activityScorerData.activityScorer,
        activityScorerPage: activityScorerData.page ? activityScorerData.page.currentPage : 1,
        activityScorerTotalCount: activityScorerData.page.totalCount,
        status: action.status,
      };

    case ApiConstants.API_USER_MODULE_ACTIVITY_MANAGER_LOAD:
      return { ...state, activityManagerOnLoad: true };

    case ApiConstants.API_USER_MODULE_ACTIVITY_MANAGER_SUCCESS:
      let activityManagerData = action.result;
      return {
        ...state,
        activityManagerOnLoad: false,
        activityManagerList: activityManagerData.activityManager,
        activityManagerPage: activityManagerData.page ? activityManagerData.page.currentPage : 1,
        activityManagerTotalCount: activityManagerData.page.totalCount,
        status: action.status,
      };

    case ApiConstants.API_USER_FRIEND_LOAD:
      return { ...state, onLoad: true, userFriendListAction: action };

    case ApiConstants.API_USER_FRIEND_SUCCESS:
      let friendData = action.result;
      return {
        ...state,
        onLoad: false,
        friendList: friendData ? friendData.friends : [],
        friendPage: friendData && friendData.page ? friendData.page.currentPage : 1,
        friendTotalCount: friendData && friendData.page ? friendData.page.totalCount : 1,
        status: action.status,
      };

    case ApiConstants.API_EXPORT_USER_FRIEND_LOAD:
      return { ...state, onExpUserFriendLoad: true };

    case ApiConstants.API_EXPORT_USER_FRIEND_SUCCESS:
      return {
        ...state,
        onExpUserFriendLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_USER_REFER_FRIEND_LOAD:
      return { ...state, onLoad: true, userReferFriendListAction: action };

    case ApiConstants.API_USER_REFER_FRIEND_SUCCESS:
      let referFriendData = action.result;
      return {
        ...state,
        onLoad: false,
        referFriendList: referFriendData ? referFriendData.referFriends : [],
        referFriendPage:
          referFriendData && referFriendData.page ? referFriendData.page.currentPage : 1,
        referFriendTotalCount:
          referFriendData && referFriendData.page ? referFriendData.page.totalCount : 1,
        status: action.status,
      };

    case ApiConstants.API_REGISTRATION_FORM_SUBMISSIONS_INIT:
      return {
        ...state,
        formSubmissionsList: [],
        formSubmissionsPage: 1,
        formSubmissionsPageSize: 10,
        formSubmissionsTotalCount: 1,
        formSubmissionSearch: {
          startDate: null,
          endDate: null,
          registrationUniqueKey: null,
          searchText: null,
        },
      };

    case ApiConstants.API_REGISTRATION_FORM_SUBMISSIONS_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_REGISTRATION_FORM_SUBMISSIONS_SUCCESS:
      let formData = action.result;
      if (formData) {
        return {
          ...state,
          onLoad: false,
          formSubmissionsList: formData.formSubmissions ?? [],
          formSubmissionsPage: formData.page ? formData.page.currentPage : 1,
          formSubmissionsTotalCount: formData.page ? formData.page.totalCount : 1,
          status: action.status,
        };
      }
      return state;

    case ApiConstants.API_UPDATE_SUBMISSIONS_SEARCH:
      const formSubmissionSearch = {
        ...state.formSubmissionSearch,
        [action.key]: action.value,
      };
      return { ...state, formSubmissionSearch };

    case ApiConstants.API_EXPORT_USER_REFER_FRIEND_LOAD:
      return { ...state, onExpUserFriendLoad: true };

    case ApiConstants.API_EXPORT_USER_REFER_FRIEND_SUCCESS:
      return {
        ...state,
        onExpUserFriendLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_GET_ORG_PHOTO_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_GET_ORG_PHOTO_SUCCESS:
      let orgPhotoData = action.result;
      return {
        ...state,
        onLoad: false,
        orgPhotosList: orgPhotoData ? orgPhotoData : [],
        status: action.status,
      };

    case ApiConstants.API_SAVE_ORG_PHOTO_LOAD:
      return { ...state, onSaveOrgPhotoLoad: true };

    case ApiConstants.API_SAVE_ORG_PHOTO_SUCCESS:
      return {
        ...state,
        onSaveOrgPhotoLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_DELETE_ORG_PHOTO_LOAD:
      return { ...state, onDeleteOrgPhotoLoad: true };

    case ApiConstants.API_DELETE_ORG_PHOTO_SUCCESS:
      return {
        ...state,
        onDeleteOrgPhotoLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_DELETE_ORG_CONTACT_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_DELETE_ORG_CONTACT_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_EXPORT_ORG_REG_QUESTIONS_LOAD:
      return { ...state, onExpOrgRegQuesLoad: true };

    case ApiConstants.API_EXPORT_ORG_REG_QUESTIONS_SUCCESS:
      return {
        ...state,
        onExpOrgRegQuesLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_EXPORT_USER_REG_DATA_LOAD:
      return { ...state, onExpUserRegDataLoad: true };

    case ApiConstants.API_EXPORT_USER_REG_DATA_SUCCESS:
      return {
        ...state,
        onExpUserRegDataLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_GET_SUBMITTED_REG_DATA_LOAD:
      return { ...state, onGetSubmittedRegDataLoad: true };

    case ApiConstants.API_GET_SUBMITTED_REG_DATA_SUCCESS:
      return {
        ...state,
        userSubmittedRegData: action.result,
        onGetSubmittedRegDataLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_TRANSFER_USER_REGISTRATION_LOAD:
      return { ...state, onTransferUserRegistrationLoad: true };

    case ApiConstants.API_TRANSFER_USER_REGISTRATION_SUCCESS:
      message.success(AppConstants.transferSuccessMsg);
      return {
        ...state,
        onTransferUserRegistrationLoad: false,
        status: action.status,
      };
    case ApiConstants.API_TRANSFER_USER_REGISTRATION_FAIL:
      return {
        ...state,
        onTransferUserRegistrationLoad: false,
      };

    case ApiConstants.API_AFFILIATE_DIRECTORY_LOAD:
      return { ...state, onAffiliateDirLoad: true, affiliateDirListAction: action };

    case ApiConstants.API_AFFILIATE_DIRECTORY_SUCCESS:
      let affiliateDirData = action.result;
      return {
        ...state,
        onAffiliateDirLoad: false,
        affiliateDirectoryList: affiliateDirData.affiliates,
        affiliateDirectoryPage: affiliateDirData.page ? affiliateDirData.page.currentPage : 1,
        affiliateDirectoryTotalCount: affiliateDirData.page.totalCount,
        organisationTypes: isArrayNotEmpty(affiliateDirData.organisationTypes)
          ? affiliateDirData.organisationTypes
          : [],
        status: action.status,
      };

    case ApiConstants.API_EXPORT_AFFILIATE_DIRECTORY_LOAD:
      return { ...state, onExpAffiliateDirLoad: true };

    case ApiConstants.API_EXPORT_AFFILIATE_DIRECTORY_SUCCESS:
      return {
        ...state,
        onExpAffiliateDirLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_USER_PROFILE_UPDATE_PLAYER:
      return { ...state, onExpAffiliateDirLoad: true };

    case ApiConstants.API_POSSIBLE_MATCH_LOAD:
      return { ...state, possibleMatchesOnLoad: true };

    case ApiConstants.API_POSSIBLE_MATCH_SUCCESS:
      return {
        ...state,
        possibleMatches: action.payload,
        possibleMatchesOnLoad: false,
      };

    case ApiConstants.API_USER_PROFILE_UPDATE_LOAD:
    case ApiConstants.API_USER_PROFILE_UPDATE_HIDE_STATISTICS_LOAD:
      return { ...state, onUpUpdateLoad: true };

    case ApiConstants.API_USER_PROFILE_UPDATE_SUCCESS:
      return {
        ...state,
        onUpUpdateLoad: false,
        userProfileUpdate: action.result,
        status: action.status,
      };

    case ApiConstants.API_USER_PROFILE_UPDATE_HIDE_STATISTICS_SUCCESS:
      const tempData = { ...state.personalData };
      tempData.isHidden = action.result.isHidden;
      return { ...state, personalData: tempData, onUpUpdateLoad: false };

    case ApiConstants.API_USER_PROFILE_UPDATE_HIDE_STATISTICS_ERROR:
      return { ...state, onUpUpdateLoad: false };

    case ApiConstants.API_USER_MODULE_HISTORY_LOAD:
      return { ...state, userHistoryLoad: true };

    case ApiConstants.API_USER_MODULE_HISTORY_SUCCESS:
      let userHistoryData = action.result;
      return {
        ...state,
        userHistoryLoad: false,
        userHistoryList: userHistoryData.userHistory,
        userHistoryPage: userHistoryData.page ? userHistoryData.page.currentPage : 1,
        userHistoryTotalCount: userHistoryData.page.totalCount,
        status: action.status,
      };

    case ApiConstants.API_USER_PHOTO_UPDATE_LOAD:
      return { ...state, userPhotoUpdate: true };

    case ApiConstants.API_USER_PHOTO_UPDATE_SUCCESS:
      let personalDataTemp = { ...action.result };
      personalDataTemp.userId = personalDataTemp.id;
      let arrTemp = [];
      if (personalDataTemp != null) {
        let obj = {
          emergencyFirstName: personalDataTemp.emergencyFirstName,
          emergencyLastName: personalDataTemp.emergencyLastName,
          emergencyContactNumber: personalDataTemp.emergencyContactNumber,
          userId: personalDataTemp.userId,
        };
        arrTemp.push(obj);
      }
      return {
        ...state,
        personalData: personalDataTemp,
        personalEmergency: arrTemp,
        userPhotoUpdate: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_USER_DETAIL_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_USER_DETAIL_SUCCESS:
      return {
        ...state,
        isProfileLoaded: true,
        userProfile: action.result,
        onLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_USER_DETAIL_UPDATE_LOAD:
      return { ...state, userDetailUpdate: true };

    case ApiConstants.API_USER_DETAIL_UPDATE_SUCCESS:
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          ...action.result,
        },
        userDetailUpdate: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_USER_PASSWORD_UPDATE_LOAD:
      return { ...state, userPasswordUpdate: true };

    case ApiConstants.API_USER_PASSWORD_UPDATE_SUCCESS:
      return {
        ...state,
        userPasswordUpdate: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_UPDATE_CHARITY_ROUND_UP_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_UPDATE_CHARITY_ROUND_UP_SUCCESS:
      let charityRoundUpResponse = action.result.charityRoundUp;
      let charityResponse = action.result.charity;
      let ourOrgData = state.affiliateOurOrg;
      let updatedCharityData = getCharityResult(state.defaultCharityRoundUp);
      let updatedCharity = checkSelectedCharity(charityRoundUpResponse, updatedCharityData);
      ourOrgData['charityRoundUp'] = updatedCharity;
      ourOrgData.charity = charityResponse;
      return {
        ...state,
        onLoad: false,
        status: action.status,
        affiliateOurOrg: ourOrgData,
      };

    case ApiConstants.API_UPDATE_TERMS_AND_CONDITION_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_UPDATE_TERMS_AND_CONDITION_SUCCESS:
      let ourOrgTCData = state.affiliateOurOrg;
      ourOrgTCData['termsAndConditions'] = action.result.organisation.termsAndConditions;
      if (action.result.organisation.termsAndConditionsRefId == '2') {
        ourOrgTCData['termsAndConditionsFile'] = action.result.organisation.termsAndConditions;
        ourOrgTCData['termsAndConditionsLink'] = null;
      } else {
        ourOrgTCData['termsAndConditionsLink'] = action.result.organisation.termsAndConditions;
        ourOrgTCData['termsAndConditionsFile'] = null;
      }
      ourOrgTCData['stateTermsAndConditions'] = action.result.organisation.stateTermsAndConditions;
      if (action.result.organisation.stateTermsAndConditionsRefId == '2') {
        ourOrgTCData['stateTermsAndConditionsFile'] =
          action.result.organisation.stateTermsAndConditions;
        ourOrgTCData['stateTermsAndConditionsLink'] = null;
      } else {
        ourOrgTCData['stateTermsAndConditionsLink'] =
          action.result.organisation.stateTermsAndConditions;
        ourOrgTCData['stateTermsAndConditionsFile'] = null;
      }

      return {
        ...state,
        onLoad: false,
        status: action.status,
        affiliateOurOrg: ourOrgTCData,
      };

    case ApiConstants.API_IMPERSONATION_LOAD:
      return { ...state, impersonationLoad: true };

    case ApiConstants.API_IMPERSONATION_SUCCESS:
      setImpersonation(action.impersonationAccess);
      return {
        ...state,
        impersonationLoad: false,
        impersonation: action.result.success,
        status: action.status,
        impersonationAccess: action.impersonationAccess,
      };
    case ApiConstants.API_USER_DELETE_LOAD:
      return {
        ...state,
        onLoad: true,
      };
    case ApiConstants.API_USER_DELETE_SUCCESS:
      return {
        ...state,
        onLoad: false,
      };

    case ApiConstants.API_GET_USER_MODULE_INCIDENT_LIST_LOAD:
      return { ...state, incidentDataLoad: true };

    case ApiConstants.API_GET_USER_MODULE_INCIDENT_LIST_SUCCESS:
      return {
        ...state,
        incidentDataLoad: false,
        userIncidentData: action.result.results,
        incidentCurrentPage: action.result.page.currentPage,
        incidentTotalCount: action.result.page.totalCount,
      };

    case ApiConstants.API_GET_USER_MODULE_SUSPENDED_MATCHES_LIST_LOAD:
      return { ...state, suspendedMatchesDataLoad: true };

    case ApiConstants.API_GET_USER_MODULE_SUSPENDED_MATCHES_LIST_SUCCESS:
      return {
        ...state,
        suspendedMatchesDataLoad: false,
        suspendedMatchesData: action.result.results,
        suspendedMatchesCurrentPage: action.result.page.currentPage,
        suspendedMatchesTotalCount: action.result.page.totalCount,
      };

    case ApiConstants.LIVE_SCORE_GET_SUSPENSIONS_LIST_LOAD:
      return { ...state, suspensionsDataLoad: true };

    case ApiConstants.LIVE_SCORE_GET_SUSPENSIONS_LIST_SUCCESS:
      return {
        ...state,
        suspensionsDataLoad: false,
        suspensionsData: action.result.results,
        suspensionsCurrentPage: action.result.page.currentPage,
        suspensionsTotalCount: action.result.page.totalCount,
      };

    case ApiConstants.LIVE_SCORE_GET_TRIBUNALS_LIST_LOAD:
      return { ...state, tribunalsDataLoad: true };

    case ApiConstants.LIVE_SCORE_GET_TRIBUNALS_LIST_SUCCESS:
      return {
        ...state,
        tribunalsDataLoad: false,
        tribunalsData: action.result.results,
        tribunalsCurrentPage: action.result.page.currentPage,
        tribunalsTotalCount: action.result.page.totalCount,
      };

    case ApiConstants.API_GET_USER_ROLE_LOAD:
      return { ...state };

    case ApiConstants.API_GET_USER_ROLE_SUCCESS:
      let isUmpireRole = getIsUmpireUserRole(action.result);
      let userRole = getUserRole(action.result);
      state.isUmpireRole = isUmpireRole;
      state.userRole = userRole;
      return {
        ...state,
      };

    ////Scorer
    case ApiConstants.API_GET_SCORER_ACTIVITY_LOAD:
      return { ...state, activityScorerOnLoad: true };

    case ApiConstants.API_GET_SCORER_ACTIVITY_SUCCESS:
      return {
        ...state,
        activityScorerOnLoad: false,
        scorerActivityRoster: action.result.activityRoster,
        scorerCurrentPage: action.result.page.currentPage,
        scorerTotalCount: action.result.page.totalCount,
      };

    ////Umpire
    case ApiConstants.API_GET_UMPIRE_DATA_LOAD:
      return { ...state, umpireDataLoad: true };

    case ApiConstants.API_GET_UMPIRE_DATA_SUCCESS:
      return {
        ...state,
        umpireDataLoad: false,
        umpireActivityRoster: action.result.activityRoster,
        umpireCurrentPage: action.result.page.currentPage,
        umpireTotalCount: action.result.page.totalCount,
      };

    ////Coach
    case ApiConstants.API_GET_COACH_DATA_LOAD:
      return { ...state, coachDataLoad: true };

    case ApiConstants.API_GET_COACH_DATA_SUCCESS:
      return {
        ...state,
        coachDataLoad: false,
        coachActivityRoster: action.result.activityRoster,
        coachCurrentPage: action.result.page.currentPage,
        coachTotalCount: action.result.page.totalCount,
      };

    ////umpire activity list
    case ApiConstants.API_GET_UMPIRE_ACTIVITY_LIST_LOAD:
      return { ...state, umpireActivityOnLoad: true };

    case ApiConstants.API_GET_UMPIRE_ACTIVITY_LIST_SUCCESS:
      let umpireActivityData = action.result;
      return {
        ...state,
        umpireActivityOnLoad: false,
        umpireActivityList: isArrayNotEmpty(umpireActivityData.results)
          ? umpireActivityData.results
          : [],
        umpireActivityCurrentPage: umpireActivityData.page.currentPage,
        umpireActivityTotalCount: umpireActivityData.page.totalCount,
      };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.userTextualDasboardListAction = null;
      state.affiliateDirListAction = null;
      state.userAffiliateListAction = null;
      state.userFriendListAction = null;
      state.userReferFriendListAction = null;
      state.spectatorListAction = null;
      return { ...state, onLoad: false };

    case ApiConstants.API_GET_SPECTATOR_LIST_LOAD:
      return { ...state, onLoad: true, spectatorListAction: action };

    case ApiConstants.API_GET_SPECTATOR_LIST_SUCCESS:
      let spectatorData = action.result;
      return {
        ...state,
        onLoad: false,
        spectatorList: spectatorData ? spectatorData.spectator : [],
        spectatorPage: spectatorData && spectatorData.page ? spectatorData.page.currentPage : 1,
        spectatorTotalCount:
          spectatorData && spectatorData.page ? spectatorData.page.totalCount : 1,
        status: action.status,
      };

    case ApiConstants.API_REGISTRATION_RESEND_EMAIL_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_REGISTRATION_RESEND_EMAIL_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    ////Coach
    case ApiConstants.API_CLEAR_LIST_DATA:
      state.affiliateTo = [];
      return { ...state };

    case ApiConstants.Api_RESET_TFA_LOAD:
      return {
        ...state,
        onMedicalLoad: true,
        status: null,
      };

    case ApiConstants.Api_RESET_TFA_SUCCESS:
      return {
        ...state,
        onMedicalLoad: false,
      };

    case ApiConstants.ADD_USERS_TO_BE_MERGED:
      state.usersToBeMerged = action.payload;
      return {
        ...state,
      };

    case ApiConstants.API_GET_NETSETGO_LIST_LOAD:
      return { ...state, onLoad: true, netSetGoListAction: action };

    case ApiConstants.API_GET_NETSETGO_LIST_SUCCESS:
      let netSetGoData = action.result;
      return {
        ...state,
        onLoad: false,
        netSetGoList: netSetGoData ? netSetGoData.netSetGo : [],
        netSetGoPage: netSetGoData && netSetGoData.page ? netSetGoData.page.currentPage : 1,
        netSetGoTotalCount: netSetGoData && netSetGoData.page ? netSetGoData.page.totalCount : 1,
        status: action.status,
      };

    case ApiConstants.API_MEMBERSHIP_PRODUCT_END_USER_REG_LOAD:
      return { ...state, onMembershipLoad: true };

    case ApiConstants.API_MEMBERSHIP_PRODUCT_END_USER_REG_SUCCESS:
      state.membershipProductInfo = action.result;
      if (!state.teamMemberRegId) {
        state.teamMembersSave = deepCopyFunction(teamMembersSaveTemp);
        updateTeamMembersSave(state);
      }
      return {
        ...state,
        onMembershipLoad: false,
        status: action.status,
      };

    case ApiConstants.TEAM_MEMBER_SAVE_UPDATE_ACTION:
      if (action.key === 'teamMembersSave') {
        state.teamMembersSave = action.data;
      } else if (action.key === 'teamMember') {
        if (action.index === undefined) {
          updateTeamMembersSave(state);
          state.addTeamMember = true;
        } else {
          state.teamMembersSave.teamMembers.splice(action.index, 1);
          state.teamMemberDeletion = true;
        }
      } else if (action.key === 'membershipProductTypes') {
        state.teamMembersSave.teamMembers[action.index].membershipProductTypes[
          action.subIndex
        ].isChecked = action.data;
      } else if (action.key === 'teamMemberRegId') {
        state.teamMemberRegId = action.data;
      } else if (action.key === 'teamMemberDeletion') {
        state.teamMemberDeletion = false;
      } else if (action.key === 'addTeamMember') {
        state.addTeamMember = false;
      } else if (action.key === 'team') {
        state.team = action.data;
      } else {
        state.teamMembersSave.teamMembers[action.index][action.key] = action.data;
      }
      return {
        ...state,
      };

    case ApiConstants.API_TEAM_MEMBERS_SAVE_LOAD:
      return { ...state, teamMembersSaveOnLoad: true };

    case ApiConstants.API_TEAM_MEMBERS_SAVE_SUCCESS:
      state.teamMembersSaveErrorMsg = action.result.errorMsg ? action.result.errorMsg : null;
      state.teamMemberRegId = action.result.id ? action.result.id : null;
      state.teamMembersSaveOnLoad = false;
      return {
        ...state,
        status: action.status,
      };

    case ApiConstants.API_GET_TEAM_MEMBERS_LOAD:
      return { ...state, getTeamMembersOnLoad: true };

    case ApiConstants.API_GET_TEAM_MEMBERS_SUCCESS:
      return {
        ...state,
        status: action.status,
        teamMembersSave: action.result,
        getTeamMembersOnLoad: false,
      };

    case ApiConstants.API_GET_TEAM_MEMBERS_REVIEW_LOAD:
      return { ...state, getTeamMembersReviewOnLoad: true };

    case ApiConstants.API_GET_TEAM_MEMBERS_REVIEW_SUCCESS:
      return {
        ...state,
        teamMemberRegReviewList: action.result,
        status: action.status,
        getTeamMembersReviewOnLoad: false,
      };

    case ApiConstants.UPDATE_TEAM_MEMBER_REVIEW_INFO:
      try {
        let reviewData = state.teamMemberRegReviewList;
        if (action.subkey == 'total') {
          let type = action.key;
          let totalVal = reviewData.total.total;
          let transactionVal = 0;
          let targetVal = 0;
          if (action.value === 1) {
            if (type === 'International_CC') {
              transactionVal = (totalVal * 3.0) / 100 + 0.3;
            }
            if (type === 'International_AE') {
              transactionVal = (totalVal * 2.7) / 100 + 0.3;
            } else if (type === 'DOMESTIC_CC') {
              transactionVal = (totalVal * 2.25) / 100 + 0.3;
            } else if (type === 'direct_debit') {
              transactionVal = (totalVal * 1.5) / 100 + 0.3;
              if (transactionVal > transactionFeeCap.DIRECT_DEBIT) {
                transactionVal = transactionFeeCap.DIRECT_DEBIT;
              }
            }
            targetVal = feeIsNull(transactionVal) + feeIsNull(totalVal);
            reviewData['total']['targetValue'] = formatValue(targetVal);
            reviewData['total']['transactionFee'] = formatValue(transactionVal);
          } else {
            reviewData['total']['targetValue'] = '0.00';
            reviewData['total']['transactionFee'] = '0.00';
          }
        }
        return {
          ...state,
          error: null,
        };
      } catch (ex) {
        console.log('Error in UPDATE_TEAM_MEMBER_REVIEW_INFO::' + ex);
      }
      return { ...state };

    case ApiConstants.API_TEAM_MEMBER_UPDATE_LOAD:
      return { ...state, onTeamUpdateLoad: true };

    case ApiConstants.API_TEAM_MEMBER_UPDATE_SUCCESS:
      return {
        ...state,
        onTeamUpdateLoad: false,
        teamMemberUpdate: action.result,
        status: action.status,
      };
    case ApiConstants.API_TEAM_MEMBER_SEND_INVITE_LOAD:
      return { ...state, onTeamSendInviteLoad: true };

    case ApiConstants.API_TEAM_MEMBER_SEND_INVITE_SUCCESS:
      return {
        ...state,
        onTeamSendInviteLoad: false,
        status: action.status,
      };
    case ApiConstants.API_FILTER_USERS_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_FILTER_USERS_SUCCESS:
      return {
        ...state,
        onLoad: false,
        organisationUsersList: action.result,
      };
    case ApiConstants.API_GET_USERS_BY_IDS_LOAD:
      return { ...state, onLoad: true };
    case ApiConstants.API_GET_USERS_BY_IDS_SUCCESS:
      return {
        ...state,
        onLoad: false,
        usersByIdsList: action.result,
      };
    case ApiConstants.API_GET_USER_PARENT_DATA_LOAD:
      return { ...state, getUserParentDataOnLoad: true };

    case ApiConstants.API_GET_USER_PARENT_DATA_SUCCESS:
      let parentData = action.result.userData;
      const nonAvailableParent = {
        id: -1,
        firstName: AppConstants.parentDetails,
        lastName: AppConstants.unavailable,
      };
      parentData.push(nonAvailableParent);

      return {
        ...state,
        parentData,
        status: action.status,
        getUserParentDataOnLoad: false,
      };
    case ApiConstants.SET_AFFILIATE_DIRECTORY_LIST_PAGE_SIZE:
      return {
        ...state,
        affiliateDirectoryPageSize: action.pageSize,
      };

    case ApiConstants.SET_AFFILIATE_DIRECTORY_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        affiliateDirectoryPage: action.pageNum,
      };

    case ApiConstants.SET_NETSETGO_LIST_PAGE_SIZE:
      return {
        ...state,
        netSetGoPageSize: action.pageSize,
      };

    case ApiConstants.SET_NETSETGO_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        netSetGoPage: action.pageNum,
      };

    case ApiConstants.SET_PLAY_WITH_FRIEND_LIST_PAGE_SIZE:
      return {
        ...state,
        friendPageSize: action.pageSize,
      };

    case ApiConstants.SET_PLAY_WITH_FRIEND_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        friendPage: action.pageNum,
      };

    case ApiConstants.SET_REFER_FRIEND_LIST_PAGE_SIZE:
      return {
        ...state,
        referFriendPageSize: action.pageSize,
      };

    case ApiConstants.SET_REGISTRATION_FORM_SUBMISSIONS_LIST_PAGE_SIZE:
      return {
        ...state,
        formSubmissionsPageSize: action.pageSize,
      };

    case ApiConstants.SET_REFER_FRIEND_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        referFriendPage: action.pageNum,
      };

    case ApiConstants.SET_REGISTRATION_FORM_SUBMISSIONS_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        formSubmissionsPage: action.pageNum,
      };

    case ApiConstants.SET_SPECTATOR_LIST_PAGE_SIZE:
      return {
        ...state,
        spectatorPageSize: action.pageSize,
      };

    case ApiConstants.SET_SPECTATOR_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        spectatorPage: action.pageNum,
      };

    case ApiConstants.SET_USER_AFFILIATES_LIST_PAGE_SIZE:
      return {
        ...state,
        affiliateListPageSize: action.pageSize,
      };

    case ApiConstants.SET_USER_AFFILIATES_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        affiliateListPage: action.pageNum,
      };

    case ApiConstants.SET_USER_TEXTUAL_LIST_PAGE_SIZE:
      return {
        ...state,
        userDashboardTextualPageSize: action.pageSize,
      };

    case ApiConstants.SET_USER_TEXTUAL_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        userDashboardTextualPage: action.pageNum,
      };

    case ApiConstants.API_CANCEL_DEREGISTRATION_LOAD:
      return { ...state, cancelDeRegistrationLoad: true };

    case ApiConstants.API_CANCEL_DEREGISTRATION_SUCCESS:
      return {
        ...state,
        cancelDeRegistrationLoad: false,
        status: action.status,
      };

    case ApiConstants.API_GET_USER_TERMS_AND_CONDITIONS_LOAD:
    case ApiConstants.API_SAVE_USER_TERMS_AND_CONDITIONS_LOAD:
      return {
        ...state,
        userTCAcknowledgement: false,
      };

    case ApiConstants.API_GET_USER_TERMS_AND_CONDITIONS_SUCCESS:
    case ApiConstants.API_SAVE_USER_TERMS_AND_CONDITIONS_SUCCESS:
      return {
        ...state,
        userTCAcknowledgement: action.payload.userTCAcknowledgement,
      };
    case ApiConstants.API_STATE_SETTINGS_LOAD:
      return { ...state, loader: false };

    case ApiConstants.API_STATE_SETTINGS_SUCCESS:
      return {
        ...state,
        loader: false,
        stateSettings: action.payload,
      };
    case ApiConstants.API_STATE_ORGANISATIONS_SUCCESS:
      return {
        ...state,
        loader: false,
        stateOrganisations: action.payload,
      };

    case ApiConstants.API_LIVE_SCORE_GET_SUMMARY_SCORING_BY_USER_LOAD:
      switch (action.payload.aggregate) {
        case AppConstants.match:
          return {
            ...state,
            onLoadMatch: true,
          };
        case AppConstants.career:
          return {
            ...state,
            onLoadCareer: true,
          };
        default:
          return {
            ...state,
          };
      }

    case ApiConstants.API_LIVE_SCORE_GET_SUMMARY_SCORING_BY_USER_SUCCESS:
    case ApiConstants.API_LIVE_SCORE_GET_SUMMARY_SCORING_BY_USER_ERROR:
      switch (action.aggregate) {
        case AppConstants.match:
          return {
            ...state,
            onLoadMatch: false,
            matchStats: action.result || [],
          };
        case AppConstants.career:
          return {
            ...state,
            onLoadCareer: false,
            careerStats: action.result || [],
          };
        default:
          return {
            ...state,
          };
      }

    case ApiConstants.API_GET_MERGED_USER_LIST_RESET:
      return {
        ...state,
        mergedUserList: [],
      };

    case ApiConstants.API_GET_MERGED_USER_LIST_LOAD:
      return { ...state, onLoadMergedUsers: true };

    case ApiConstants.API_GET_MERGED_USER_LIST_SUCCESS:
      return {
        ...state,
        mergedUserList: action.payload,
        onLoadMergedUsers: false,
      };

    case ApiConstants.API_UNDELETE_MERGED_USER_LOAD:
      return { ...state, onLoadUndeleteUsers: true };

    case ApiConstants.API_UNDELETE_MERGED_USER_SUCCESS: {
      const mergedUserList = state.mergedUserList;
      const index = mergedUserList.findIndex(it => it.id === action.payload.deletedUserId);
      if (index >= 0) {
        mergedUserList.splice(index, 1);
      }
      return {
        ...state,
        mergedUserList: [...mergedUserList],
        onLoadUndeleteUsers: false,
      };
    }

    case ApiConstants.API_GET_MERGE_SELECTED_USER_LOAD:
      return {
        ...state,
        onLoadMergeSelectedUser: true,
        mergeSelectedUser: {},
        mergeMatches: [],
      };

    case ApiConstants.API_GET_MERGE_SELECTED_USER_ERROR:
      return { ...state, onLoadMergeSelectedUser: false };

    case ApiConstants.API_GET_MERGE_SELECTED_USER_SUCCESS:
      return {
        ...state,
        mergeSelectedUser: action.result,
        mergeMatches: action.mergeMatches,
        onLoadMergeSelectedUser: false,
      };

    case ApiConstants.API_GET_USER_DUPLICATES_LIST_LOAD:
    case ApiConstants.API_EXPORT_USER_DUPLICATES_LIST_LOAD:
      return {
        ...state,
        onLoadUserDuplicates: true,
      };

    case ApiConstants.API_GET_USER_DUPLICATES_LIST_SUCCESS: {
      return {
        ...state,
        onLoadUserDuplicates: false,
        userDuplicatesList: action.result.results,
        userDuplicatesPage: {
          ...action.result.page,
          pageSize: action.payload.limit,
        },
      };
    }

    case ApiConstants.API_EXPORT_USER_DUPLICATES_LIST_SUCCESS: {
      return {
        ...state,
        onLoadUserDuplicates: false,
      };
    }

    case ApiConstants.API_GET_USER_DUPLICATES_LIST_RESET:
      return {
        ...state,
        onLoadUserDuplicates: false,
        userDuplicatesList: null,
        userDuplicatesFilter: {
          showIgnoredMatches: false,
          searchText: null,
        },
      };

    case ApiConstants.API_UPDATE_USER_DUPLICATES_FILTER: {
      const { key, value } = action.payload;
      const userDuplicatesFilter = {
        ...state.userDuplicatesFilter,
        [key]: value,
      };
      return {
        ...state,
        userDuplicatesFilter,
      };
    }

    case ApiConstants.API_GET_USER_IGNORE_MATCH_LOAD:
      return {
        ...state,
        onLoadIgnoreMatch: true,
      };

    case ApiConstants.API_GET_USER_IGNORE_MATCH_SUCCESS:
      return {
        ...state,
        onLoadIgnoreMatch: false,
        userDuplicatesList: null,
      };

    case ApiConstants.API_REG_SETTING_LINK_LOAD:
      return {
        ...state,
        onRegSettingLinkLoad: true,
      };

    case ApiConstants.API_REG_SETTING_LINK_SUCCESS:
      return {
        ...state,
        regSettingLinks: action.result,
        onRegSettingLinkLoad: false,
      };

    case ApiConstants.API_REG_SETTING_LINK_FAILED:
      return {
        ...state,
        onRegSettingLinkLoad: false,
      };

    case ApiConstants.API_REG_SETTING_LINK_UPDATE: {
      const { key, index, value } = action;
      const regSettingLinks = [...state.regSettingLinks];
      if (key === 'add') {
        regSettingLinks.push({
          ...value,
          linkedOrganisations: [],
          no: ++uniqueRegLinkOrgId,
        });
      } else if (key === 'remove') {
        regSettingLinks.splice(index, 1);
      } else if (key === 'organisationId') {
        const rslink = regSettingLinks[index];
        const linkedOrganisations = value.map(organisationId => {
          const org = rslink.linkedOrganisations.find(x => x.organisationId === organisationId);
          if (org) {
            return org;
          }
          return {
            registrationSettingLinkId: rslink.id,
            organisationId,
          };
        });
        rslink.linkedOrganisations = linkedOrganisations;
      } else {
        const rslink = regSettingLinks[index];
        rslink[key] = value;
      }
      return {
        ...state,
        regSettingLinks,
      };
    }

    default:
      return state;
  }
}

//get User Role
function getUserRole(userRoleData) {
  let userRole = false;

  for (let i in userRoleData) {
    if (userRoleData[i].roleId === 15 || userRoleData[i].roleId === 20) {
      userRole = true;
      break;
    }
  }
  return userRole;
}

// get charity result
function getCharityResult(data) {
  let newCharityResult = [];
  if (isArrayNotEmpty(data)) {
    for (let i in data) {
      data[i]['isSelected'] = false;
    }
    newCharityResult = data;
  }
  return newCharityResult;
}

// for check selected Charity
function checkSelectedCharity(selected, data) {
  const arr = [];
  for (let i in data) {
    const obj = {
      id: 0,
      description: data[i].description,
      charityRoundUpRefId: data[i].id,
      isSelected: false,
    };
    if (selected) {
      let filteredRes = selected.find(x => x.charityRoundUpRefId === data[i].id);
      if (filteredRes !== null && filteredRes !== undefined) {
        obj.id = filteredRes.id;
        obj.charityRoundUpRefId = filteredRes.charityRoundUpRefId;
        obj.isSelected = true;
        arr.push(obj);
      } else {
        arr.push(obj);
      }
    } else {
      arr.push(obj);
    }
  }
  return arr;
}

export default userReducer;
