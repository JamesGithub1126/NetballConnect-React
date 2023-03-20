import * as message from '../../../util/messageHandler';
import * as moment from 'moment';

import userHttp from './userHttp';
import history from '../../../util/history';
import { getUserId, getAuthToken, getOrganisationData } from '../../../util/sessionStorage';
import axios from 'axios';
import { ROLE } from 'util/enums';
import { EntityType } from '../../../enums/enums';
import { RegistrationUserRoles } from '../../../enums/registrationEnums';

let token = getAuthToken();
let userId = getUserId();

let umpireSearchCancelTokenSource = null;

// const internetStatus = navigator.onLine;

async function logout() {
  await localStorage.clear();
  history.push('/');
}

let userHttpApi = {
  Login(payload) {
    const base64 = require('base-64');
    const md5 = require('md5');
    let authorization = base64.encode(payload.userName + ':' + md5(payload.password));
    const url = '/users/loginWithTfa';
    return Method.dataGet(url, authorization);
  },

  QrCode(payload) {
    const base64 = require('base-64');
    const md5 = require('md5');
    let authorization = base64.encode(
      payload.userName + ':' + md5(payload.password) + ':' + payload.code,
    );
    const url = '/users/confirmTfa';
    return Method.dataGet(url, authorization);
  },

  //role Api
  role() {
    const url = '/ref/roles';
    return Method.dataGet(url, token);
  },

  // User Role Entity Api
  ure() {
    const url = '/ure';
    return Method.dataGet(url, token);
  },

  async impersonation(payload) {
    const userId = await getUserId();
    const { orgId, access } = payload;
    const url = `/ure/impersonation?userId=${userId}&organisationUniqueKey=${orgId}&access=${access}`;

    return Method.dataPost(url, token);
  },

  async saveAffiliate(payload) {
    let userId = await getUserId();
    const url = `api/affiliates/save?userId=${userId}`;
    return Method.dataPost(url, token, payload);
  },

  async saveAffiliateFinder(payload) {
    let userId = await getUserId();
    const url = `api/organisationdetail/save?userId=${userId}`;
    return Method.dataPost(url, token, payload);
  },

  async affiliateByOrganisationId(organisationId) {
    let userId = await getUserId();
    const url = `api/affiliate/${organisationId}?userId=${userId}`;
    return Method.dataGet(url, token);
  },

  async saveUserOrganisation(organisationId, payload) {
    let userId = await getUserId();
    const url = `api/save/userorganisation?userId=${userId}&organisationId=${organisationId}`;
    return Method.dataPut(url, token, payload);
  },

  async integrationsByOrganisationId(organisationId) {
    let userId = await getUserId();
    const url = `api/orgIntegrations/${organisationId}?userId=${userId}`;
    return Method.dataGet(url, token);
  },

  async saveIntegrations(payload) {
    let userId = await getUserId();
    const url = `api/orgIntegrations/save?userId=${userId}`;
    return Method.dataPost(url, token, payload);
  },

  async organisationDetailByOrganisationId(organisationId) {
    let userId = await getUserId();
    const url = `api/organisationDetails/${organisationId}?userId=${userId}`;
    return Method.dataGet(url, token);
  },

  async organisationMembershipsByOrganisationId(organisationId) {
    let userId = await getUserId();
    const url = `api/organisationMemberships/${organisationId}?userId=${userId}`;
    return Method.dataGet(url, token);
  },

  async affiliatesListing(payload, sortBy, sortOrder) {
    let userId = await getUserId();
    let url;
    if (sortBy && sortOrder) {
      url = `api/affiliateslisting?userId=${userId}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    } else {
      url = `api/affiliateslisting?userId=${userId}`;
    }
    return Method.dataPost(url, token, payload);
  },

  async affiliateToOrganisation(organisationId, searchText) {
    let userId = await getUserId();
    let url = null;
    if (searchText) {
      url = `api/affiliatedtoorganisation/${organisationId}?userId=${userId}&search=${searchText}`;
    } else {
      url = `api/affiliatedtoorganisation/${organisationId}?userId=${userId}`;
    }
    return Method.dataGet(url, token);
  },

  async getVenueOrganisation(key) {
    let userId = await getUserId();
    let organisationUniqueKey = await getOrganisationData().organisationUniqueKey;
    let url = `api/organisation?userId=${userId}`;
    if (key) {
      url += `&organisationUniqueKey=${organisationUniqueKey}`;
    }
    return Method.dataGet(url, token);
  },

  async getRestrictedAccounts(payload) {
    let url = `/api/organisation/restrictedAccounts`;
    return Method.dataPost(url, token, payload);
  },

  liveScoreManagerList(
    roleId,
    entityTypeId,
    entityId,
    searchText,
    offset,
    sortBy,
    sortOrder,
    compOrgId,
    isParent,
    limit,
  ) {
    let url = '';
    // let offsetValue = offset ? offset : null
    if (searchText) {
      if (offset != null) {
        url = `/users/byRole?roleId=${roleId}&entityTypeId=${
          isParent ? 1 : entityTypeId
        }&entityId=${
          isParent ? entityId : compOrgId
        }&userName=${searchText}&offset=${offset}&limit=${limit}`;
      } else {
        url = `/users/byRole?roleId=${roleId}&entityTypeId=${
          isParent ? 1 : entityTypeId
        }&entityId=${isParent ? entityId : compOrgId}&userName=${searchText}`;
      }
    } else {
      if (offset != null) {
        url = `/users/byRole?roleId=${roleId}&entityTypeId=${
          isParent ? 1 : entityTypeId
        }&entityId=${isParent ? entityId : compOrgId}&offset=${offset}&limit=${limit}`;
      } else {
        url = `/users/byRole?roleId=${roleId}&entityTypeId=${
          isParent ? 1 : entityTypeId
        }&entityId=${isParent ? entityId : compOrgId}`;
      }
    }

    if (sortBy && sortOrder) {
      url += `&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    }

    return Method.dataGet(url, token);
  },

  affiliateDelete(affiliateId) {
    const url = `api/affiliate/delete?userId=${userId}`;
    let payload = { affiliateId: affiliateId };
    return Method.dataPost(url, token, payload);
  },

  //// get particular user organisation
  async getUserOrganisation() {
    const user_Id = await getUserId();
    const Auth_token = await getAuthToken();
    const url = `api/userorganisation?userId=${user_Id}`;
    return Method.dataGet(url, Auth_token);
  },

  async organisationDetails(payload) {
    const url = `api/organisation-details?organisationUniqueKey=${payload.organisationUniqueKey}`;
    return Method.dataGet(url, token);
  },

  getUserCommunicationPrivacy(payload) {
    const url = `api/user/communication-privacy?userId=${payload}`;
    return Method.dataGet(url, token);
  },

  updateCommunicationPrivacy(payload) {
    const url = `api/user/communication-privacy`;
    return Method.dataPost(url, token, payload);
  },

  getUserDashboardTextualListing(payload, sortBy, sortOrder) {
    let url;
    if (sortBy && sortOrder) {
      url = `api/user/dashboard/textual?sortBy=${sortBy}&sortOrder=${sortOrder}`;
    } else {
      url = `api/user/dashboard/textual`;
    }

    return Method.dataPost(url, token, payload);
  },

  getUserDashboardTextualSpectatorCount(payload) {
    const url = `api/user/dashboard/textual/spectatorCount`;
    return Method.dataPost(url, token, payload);
  },

  getUserModulePersonalData(payload) {
    const url = `api/user/personaldetails?userId=${payload.userId}&organisationId=${payload.organisationId}`;
    return Method.dataGet(url, token);
  },

  getUserModuleDocuments(payload) {
    const url = `api/user/documents?userId=${payload.userId}`;
    return Method.dataGet(url, token);
  },

  addUserModuleDocuments(payload) {
    const url = `api/user/document`;
    return Method.dataPost(url, token, payload);
  },

  removeUserModuleDocument(payload) {
    const url = `api/user/document?id=${payload.id}`;
    return Method.dataDelete(url, token);
  },

  getUserModuleUploadDocument(payload) {
    const url = `api/user/uploadDocument?userId=${payload.userId}`;
    let formData = new FormData();
    formData.append('file', payload.file);
    return Method.dataPostFormData(url, token, formData);
  },

  getUserModulePersonalByCompData(payload) {
    const url = `api/user/personaldetails/competition`;
    return Method.dataPost(url, token, payload);
  },

  getUserModuleMedicalInfo(payload) {
    const url = `api/user/medical`;
    return Method.dataPost(url, token, payload);
  },

  getUserModuleRegistrationData(payload) {
    const url = `api/user/registration`;
    return Method.dataPost(url, token, payload);
  },

  getUserOwnRegistrationData(payload) {
    const url = `api/user/ownregistration`;
    return Method.dataPost(url, token, payload);
  },

  getUserMemberships(payload) {
    const url = `api/user/membershipExpiry`;
    return Method.dataPost(url, token, payload);
  },

  getUserModuleTeamMembersData(payload) {
    const url = `/api/user/registration/team`;
    return Method.dataPost(url, token, payload);
  },

  getUserModuleTeamRegistrationData(payload) {
    const url = `api/user/registration/teamdetails`;
    return Method.dataPost(url, token, payload);
  },

  getUserModuleOtherRegistrationData(payload) {
    const url = `api/user/registration/yourdetails`;
    return Method.dataPost(url, token, payload);
  },

  getUserModuleActivityPlayer(payload) {
    const url = `api/user/activity/player`;
    return Method.dataPost(url, token, payload);
  },

  getUserModuleActivityParent(payload) {
    const url = `api/user/activity/parent`;
    return Method.dataPost(url, token, payload);
  },

  getUserModuleActivityScorer(payload) {
    const url = `api/user/activity/scorer`;
    return Method.dataPost(url, token, payload);
  },

  getUserModuleActivityManager(payload) {
    const url = `api/user/activity/manager`;
    return Method.dataPost(url, token, payload);
  },

  getUserMergeMatches(userId) {
    const url = `/userMerge/matches/${userId}`;
    return Method.dataGet(url, token);
  },

  liveScoreSearchManager(data) {
    let { id } = JSON.parse(localStorage.getItem('LiveScoreCompetition'));
    if (data && data.length > 0) {
      const url = `users/byFunction?functionId=8&entityTypeId=1&entityId=${id}&userName=${data}`;
      return Method.dataGet(url, token);
    }
    const url = `users/byFunction?functionId=8&entityTypeId=1&entityId=${id}`;
    return Method.dataGet(url, token);
  },

  // Search scorer
  scorerSearchApi(functionId, entityTypeId, competitionId, searchText) {
    if (searchText && searchText.length > 0) {
      const url = `users/byFunction?functionId=${functionId}&entityTypeId=${entityTypeId}&entityId=${competitionId}&userName=${searchText}`;
      return Method.dataGet(url, token);
    }
    const url = `users/byFunction?functionId=${functionId}&entityTypeId=${entityTypeId}&entityId=${competitionId}`;
    return Method.dataGet(url, token);
  },

  getUserFriendList(payload, sortBy, sortOrder) {
    let url;
    if (sortBy && sortOrder) {
      url = `users/dashboard/friend?sortBy=${sortBy}&sortOrder=${sortOrder}`;
    } else {
      url = `users/dashboard/friend`;
    }
    return Method.dataPost(url, token, payload);
  },

  exportUserFriendList(payload) {
    const url = `users/export/friends`;
    let _now = moment().utc().format('Y-MM-DD');
    return Method.dataPostDownload(url, token, payload, `playWithFriend-${_now}`);
  },

  getUserReferFriendList(payload, sortBy, sortOrder) {
    let url;
    if (sortBy && sortOrder) {
      url = `users/dashboard/referfriend?sortBy=${sortBy}&sortOrder=${sortOrder}`;
    } else {
      url = `users/dashboard/referfriend`;
    }
    return Method.dataPost(url, token, payload);
  },

  getRegistrationFormSubmissions(payload) {
    let url;
    url = `users/dashboard/formSubmissions`;
    return Method.dataPost(url, token, payload);
  },

  exportUserReferFriendList(payload) {
    const url = `users/export/referFriends`;
    let _now = moment().utc().format('Y-MM-DD');
    return Method.dataPostDownload(url, token, payload, `referFriend-${_now}`);
  },

  async getOrgPhotosList(payload) {
    // let organisationUniqueKey = await getOrganisationData().organisationUniqueKey;
    const url = `api/organisationphoto/list?organisationUniqueKey=${payload.organisationId} `;
    return Method.dataGet(url, token, payload);
  },

  saveOrgPhoto(payload) {
    // let organisationUniqueKey = await getOrganisationData().organisationUniqueKey;
    const url = `api/organisationphoto/save`;
    return Method.dataPost(url, token, payload);
  },

  deleteOrgPhoto(payload) {
    // let organisationUniqueKey = await getOrganisationData().organisationUniqueKey;
    const url = `api/organisationphoto/delete/${payload.id}`;
    return Method.dataDelete(url, token);
  },

  ////forgot password
  forgotPassword(email, resetType) {
    const param = encodeURIComponent(email);
    const url = `password/forgot?email=${param}&type=${resetType}`;
    return Method.dataGet(url, token);
  },

  //liveScore coaches list
  liveScoreCoachesList(
    roleId,
    entityId,
    search,
    offset,
    limit,
    sortBy,
    sortOrder,
    isParent,
    competitionId,
  ) {
    // let { id } = JSON.parse(localStorage.getItem('LiveScoreCompetiton'))
    let url;
    if (offset != null) {
      url = `/users/byRole?roleId=${roleId}&entityTypeId=${isParent ? 1 : 6}&entityId=${
        isParent ? competitionId : entityId
      }&userName=${search}&offset=${offset}&limit=${limit}`;
    } else {
      url = `/users/byRole?roleId=${roleId}&entityTypeId=${isParent ? 1 : 6}&entityId=${
        isParent ? competitionId : entityId
      }&userName=${search}`;
    }

    if (sortBy && sortOrder) {
      url += `&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    }
    return Method.dataGet(url, localStorage.token);
  },

  deleteOrgContact(payload) {
    // let organisationUniqueKey = await getOrganisationData().organisationUniqueKey;
    const url = `api/affiliate/user/delete/${payload.id}?organisationUniqueKey=${payload.organisationId}`;
    return Method.dataDelete(url, token);
  },

  exportOrgRegQuestions(payload) {
    const url = `api/export/registration/questions`;
    let _now = moment().utc().format('Y-MM-DD');
    return Method.dataPostDownload(url, token, payload, `userTextualDashboard-${_now}`);
  },

  async exportAffiliateUserData(payload) {
    const url = `api/affiliates/export`;
    let _now = moment().utc().format('Y-MM-DD');
    return Method.dataPostDownload(url, token, payload, `userAffiliates-${_now}`);
  },

  exportUserRegData(payload) {
    const url = `api/export/registration/data`;
    return Method.dataPostDownload(url, token, payload, 'UserRegistrationData');
  },

  async getSubmittedRegData(payload) {
    const url = `api/user/registration/registrationForm`;
    return Method.dataPost(url, token, payload);
  },

  async affiliateDirectory(payload, sortBy, sortOrder) {
    let url;

    if (sortBy && sortOrder) {
      url = `api/affiliatedirectory?sortBy=${sortBy}&sortOrder=${sortOrder}`;
    } else {
      url = `api/affiliatedirectory`;
    }
    return Method.dataPost(url, token, payload);
  },

  exportAffiliateDirectory(payload) {
    const url = `api/export/affiliatedirectory`;
    let _now = moment().utc().format('Y-MM-DD');
    return Method.dataPostDownload(url, token, payload, `affiliateDirectory-${_now}`);
  },

  otherOfficialList(competitionId) {
    const url = `/users/byRoles?roleIds=[${RegistrationUserRoles.OtherOfficial}]&entityTypeId=${EntityType.Competition}&entityId=${competitionId}&needUREs=true&basedOnLinkedEntities=false&basedOnFunctionRoles=false`;
    return Method.dataGet(url, token);
  },

  umpireList(data) {
    let url = null;
    if (data.entityTypes === 6) {
      if (data.userName) {
        url = `/users/byRoles?roleIds=${data.refRoleId}&entityTypeId=${data.entityTypes}&entityId=${
          data.compOrgId
        }&userName=${data.userName}&offset=${
          data.offset
        }&limit=${10}&needUREs=${true}&individualLinkedEntityRequired=${true}&competitionId=${
          data.compId
        }`;
      } else if (data.offset != null) {
        url = `/users/byRoles?roleIds=${data.refRoleId}&entityTypeId=${data.entityTypes}&entityId=${
          data.compOrgId
        }&offset=${
          data.offset
        }&limit=${10}&needUREs=${true}&individualLinkedEntityRequired=${true}&competitionId=${
          data.compId
        }`;
      } else {
        url = `/users/byRoles?roleIds=${data.refRoleId}&entityTypeId=${data.entityTypes}&entityId=${
          data.compOrgId
        }&needUREs=${true}&individualLinkedEntityRequired=${true}&competitionId=${data.compId}`;
      }
    } else {
      if (data.userName) {
        url = `/users/byRoles?roleIds=${data.refRoleId}&entityTypeId=${data.entityTypes}&entityId=${
          data.compId
        }&userName=${data.userName}&offset=${
          data.offset
        }&limit=${10}&needUREs=${true}&individualLinkedEntityRequired=${true}`;
      } else if (data.offset != null) {
        url = `/users/byRoles?roleIds=${data.refRoleId}&entityTypeId=${data.entityTypes}&entityId=${
          data.compId
        }&offset=${
          data.offset
        }&limit=${10}&needUREs=${true}&individualLinkedEntityRequired=${true}`;
      } else {
        url = `/users/byRoles?roleIds=${data.refRoleId}&entityTypeId=${data.entityTypes}&entityId=${
          data.compId
        }&needUREs=${true}&individualLinkedEntityRequired=${true}`;
      }
    }
    if (data.sortBy && data.sortOrder) {
      url += `&sortBy=${data.sortBy}&sortOrder=${data.sortOrder}`;
    }

    if (data.onlyUniqueUsers) {
      url += `&onlyUniqueUsers=${data.onlyUniqueUsers}`;
    }

    return Method.dataGet(url, localStorage.token);
  },

  newUmpireList(data) {
    let url = null;
    const { organisationId } = getOrganisationData() || {};
    if (data.isCompParent !== true) {
      url = `/users/umpiresAvailable?entityTypeId=${data.entityTypes}&entityId=${data.compOrgId}&needUREs=true&individualLinkedEntityRequired=true&matchStartTime=${data.matchStartTime}&matchEndTime=${data.matchEndTime}&matchId=${data.matchId}`;
    } else {
      url = `/users/umpiresAvailable?entityTypeId=${data.entityTypes}&entityId=${data.compId}&needUREs=true&individualLinkedEntityRequired=true&matchStartTime=${data.matchStartTime}&matchEndTime=${data.matchEndTime}&matchId=${data.matchId}`;
    }
    if (organisationId) {
      url += `&organisationId=${organisationId}`;
    }
    if (data.name) {
      url += `&name=${data.name}`;
    }
    if (data.onlyUniqueUsers) {
      url += `&onlyUniqueUsers=${data.onlyUniqueUsers}`;
    }
    if (data.anyoneCanBeUmpire) {
      url += `&anyoneCanBeUmpire=${data.anyoneCanBeUmpire}`;
    }
    if (data.roleIds && data.roleIds.length) {
      url += `&roleIds=${JSON.stringify(data.roleIds)}`;
    }

    if (umpireSearchCancelTokenSource) {
      umpireSearchCancelTokenSource.cancel();
    }

    const cancelToken = axios.CancelToken;
    umpireSearchCancelTokenSource = cancelToken.source();
    return Method.dataGet(url, token, umpireSearchCancelTokenSource.token);
  },

  availableUmpireCoachList(data) {
    let url = null;
    if (data.isCompParent !== true) {
      url = `/users/umpireCoachsAvailable?entityTypeId=${data.entityTypes}&entityId=${data.compOrgId}&needUREs=true&individualLinkedEntityRequired=true&matchStartTime=${data.matchStartTime}&matchEndTime=${data.matchEndTime}&matchId=${data.matchId}`;
    } else {
      url = `/users/umpireCoachsAvailable?entityTypeId=${data.entityTypes}&entityId=${data.compId}&needUREs=true&individualLinkedEntityRequired=true&matchStartTime=${data.matchStartTime}&matchEndTime=${data.matchEndTime}&matchId=${data.matchId}`;
    }
    return Method.dataGet(url, localStorage.token);
  },

  updateUserProfile(payload) {
    let url = `api/userprofile/update?section=${payload.section}`;
    if (payload.organisationId) {
      url += `&organisationId=${payload.organisationId}`;
    }
    return Method.dataPost(url, token, payload);
  },

  updateBannerCount(payload) {
    const { organisationId } = getOrganisationData() || {};
    const url = `api/bannerCount?organisationId=${organisationId}`;
    return Method.dataPost(url, token, payload);
  },

  async getBannerCount(orgId) {
    const { organisationId } = getOrganisationData() || {};
    const url = `api/bannerCount?organisationId=${organisationId}`;
    return Method.dataGet(url, token);
  },

  userExportFiles(url, userType) {
    return Method.dataGetDownload(url, localStorage.token, userType);
  },

  getUserHistory(payload) {
    const url = `api/user/history`;
    return Method.dataPost(url, token, payload);
  },

  saveUserPhoto(payload, userId) {
    const url = userId ? `users/photo?userId=${userId}` : `users/photo`;
    return Method.dataPost(url, token, payload);
  },

  getUserDetail() {
    const url = `users/profile`;
    return Method.dataGet(url, token);
  },

  saveUserDetail(payload) {
    const url = `users/profile`;
    return Method.dataPatch(url, token, payload);
  },

  updateUserPassword(payload) {
    const url = `users/updatePassword`;
    return Method.dataPatch(url, token, payload);
  },

  updateCharity(payload) {
    const url = `api/charity/update`;
    return Method.dataPost(url, token, payload);
  },

  updateTermsAndConditions(payload) {
    const url = `api/termsandcondition/update`;
    return Method.dataPost(url, token, payload);
  },

  deleteUserById(payload) {
    const url = `api/user/delete`;
    return Method.dataPost(url, token, payload);
  },

  getUserModuleIncidentData(payload) {
    const url = `api/user/activity/incident`;
    return Method.dataPost(url, token, payload);
  },

  getUserModuleSuspendedMatchesData(payload) {
    const url = `api/user/activity/suspendedMatches`;
    return Method.dataPost(url, token, payload);
  },

  getUserRoleData(userId) {
    const url = `ure/byUserId?userId=${userId}`;
    return Method.dataGet(url, token);
  },

  getScorerActivityData(payload, roleId, matchStatus) {
    const url = `api/user/activity/roster?roleId=${roleId}&matchStatus=${matchStatus}`;
    return Method.dataPost(url, token, payload);
  },

  getUmpireData(payload, roleId, matchStatus) {
    const url = `api/user/activity/roster?roleId=${roleId}&matchStatus=${matchStatus}`;
    return Method.dataPost(url, token, payload);
  },

  getCoachData(payload, roleId, matchStatus) {
    const url = `api/user/activity/roster?roleId=${roleId}&matchStatus=${matchStatus}`;
    return Method.dataPost(url, token, payload);
  },

  umpireList_Data(data) {
    let url = null;
    let entity_Id = data.entityTypes === 6 ? data.competitionOrgId : data.compId;
    if (data.userName) {
      url = `/users/byRoles?roleIds=${data.refRoleId}&entityTypeId=${
        data.entityTypes
      }&entityId=${entity_Id}&userName=${data.userName}&offset=${data.offset}&limit=${
        data.limit
      }&needUREs=${true}&individualLinkedEntityRequired=${true}`;
    } else if (data.offset != null) {
      url = `/users/byRoles?roleIds=${data.refRoleId}&entityTypeId=${
        data.entityTypes
      }&entityId=${entity_Id}&offset=${data.offset}&limit=${
        data.limit
      }&needUREs=${true}&individualLinkedEntityRequired=${true}`;
    } else {
      url = `/users/byRoles?roleIds=${data.refRoleId}&entityTypeId=${
        data.entityTypes
      }&entityId=${entity_Id}&needUREs=${true}&individualLinkedEntityRequired=${true}`;
    }

    if (data.sortBy && data.sortOrder) {
      url += `&sortBy=${data.sortBy}&sortOrder=${data.sortOrder}`;
    }

    return Method.dataGet(url, localStorage.token);
  },
  umpireSearch(data) {
    let url = null;
    if (data.userName) {
      url = `users/byRole?roleId=${data.refRoleId}&entityTypeId=${data.entityTypes}&entityId=${data.compId}&userName=${data.userName}`;
    } else {
      url = `users/byRole?roleId=${data.refRoleId}&entityTypeId=${data.entityTypes}&entityId=${data.compId}`;
    }
    return Method.dataGet(url, token);
  },
  getSpectatorList(payload) {
    const url = `users/dashboard/spectator`;
    return Method.dataPost(url, token, payload);
  },
  getNetSetGoList(payload, sortBy, sortOrder) {
    let url;
    if (sortBy && sortOrder) {
      url = `api/user/dashboard/netsetgo?sortBy=${sortBy}&sortOrder=${sortOrder}`;
    } else {
      url = `api/user/dashboard/netsetgo`;
    }
    return Method.dataPost(url, token, payload);
  },
  registrationResendEmail(teamId, userId) {
    const payload = { teamId, userId };
    const url = `api/users/registration/resendmail`;
    return Method.dataPost(url, token, payload);
  },
  async resetTfaApi(userId) {
    const url = `/users/profile/reset/tfa?userId=${userId}`;
    return Method.dataPost(url, token);
  },

  addChild(payload) {
    const url = `/users/admin/child/create?parentUserId=${payload.userId}&sameEmail=${payload.sameEmail}`;
    return Method.dataPost(url, token, { childUser: payload.body });
  },

  addParent(payload) {
    const url = `/users/admin/parent/create?childUserId=${payload.userId}&sameEmail=${payload.sameEmail}`;
    return Method.dataPost(url, token, { parentUser: payload.body });
  },

  findPossibleMerge(payload) {
    return Method.dataPost('userMerge/find', token, payload);
  },

  getUsersByIds(ids) {
    return Method.dataGet(`users/byIds?ids=${JSON.stringify(ids)}`);
  },

  saveUserAvailability(id, userVenueGroupId, payload) {
    return Method.dataPost(
      `availability?userId=${id}${userVenueGroupId ? `&userVenueGroupId=${userVenueGroupId}` : ''}`,
      token,
      payload,
    );
  },

  getUserAvailability(id) {
    return Method.dataGet(`availability?userId=${id}`, token);
  },

  getUserVenueGroups(id) {
    return Method.dataGet(`userVenueGroup?userId=${id}`, token);
  },

  saveUserVenueGroup(payload) {
    return Method.dataPost(`userVenueGroup`, token, payload);
  },

  deleteUserVenueGroup(id) {
    return Method.dataDelete(`userVenueGroup/${id}`, token);
  },

  getMergedUserList(userId) {
    return Method.dataGet(`users/merged?userId=${userId}`, token);
  },

  getUserDuplicatesList(payload) {
    return Method.dataPost(`users/userDuplicates`, token, payload);
  },

  exportUserDuplicatesList(payload) {
    const url = `users/userDuplicates/export`;
    let _now = moment().utc().format('Y-MM-DD');
    return Method.dataPostDownload(url, token, payload, `userDuplicates-${_now}`);
  },

  userIgnoreMatch(payload) {
    return Method.dataPost(`users/userDuplicates/ignoreMatch`, token, payload);
  },

  undeleteUser(data) {
    const url = `users/undelete?userId=${data.userId}&deletedUserId=${data.deletedUserId}`;
    return Method.dataGet(url, token);
  },

  async getUserParentData(userId) {
    var url = `api/parents?userId=${userId || 0}`;
    return Method.dataGet(url, token);
  },

  getUserTermsAndConditions() {
    return Method.dataGet('api/terms-and-conditions', token);
  },

  saveUserTermsAndConditions(payload) {
    return Method.dataPost('api/terms-and-conditions/', token, payload);
  },

  getSateSettings(organisationId) {
    var url = `api/stateSettings?organisationId=${organisationId}`;
    return Method.dataGet(url, token);
  },

  getStateOrganisations(organisationId) {
    const url = `api/stateOrganisations?organisationId=${organisationId}`;
    return Method.dataGet(url, token);
  },

  swapUserAccounts(payload) {
    return Method.dataPost('users/swapParentURE', token, payload);
  },
};

let Method = {
  async dataPost(newUrl, authorization, body) {
    const url = newUrl;
    return await new Promise((resolve, reject) => {
      userHttp
        .post(url, body, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            Authorization: 'BWSA ' + authorization,
            SourceSystem: 'WebAdmin',
          },
        })
        .then(result => {
          if (result.status === 200) {
            return resolve({
              status: 1,
              result: result,
            });
          } else if (result.status === 212) {
            return resolve({
              status: 4,
              result: result,
            });
          } else {
            if (result) {
              return reject({
                status: 3,
                error: result.data.message,
              });
            } else {
              return reject({
                status: 4,
                error: 'Something went wrong.',
              });
            }
          }
        })
        .catch(err => {
          if (err.response) {
            if (err.response.status !== null && err.response.status !== undefined) {
              if (err.response.status === 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus === 401) {
                  logout();
                  message.error({ status: 401 });
                }
              } else {
                return reject({
                  status: 5,
                  error: err,
                  responseData: err.response.data,
                });
              }
            }
          } else {
            return reject({
              status: 5,
              error: err,
            });
          }
        });
    });
  },

  async dataPut(newUrl, authorization, body) {
    const url = newUrl;
    return await new Promise((resolve, reject) => {
      userHttp
        .put(url, body, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            Authorization: 'BWSA ' + authorization,
            SourceSystem: 'WebAdmin',
          },
        })
        .then(result => {
          if (result.status === 200) {
            return resolve({
              status: 1,
              result: result,
            });
          } else if (result.status === 212) {
            return resolve({
              status: 4,
              result: result,
            });
          } else {
            if (result) {
              return reject({
                status: 3,
                error: result.data.message,
              });
            } else {
              return reject({
                status: 4,
                error: 'Something went wrong.',
              });
            }
          }
        })
        .catch(err => {
          if (err.response) {
            if (err.response.status !== null && err.response.status !== undefined) {
              if (err.response.status === 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus === 401) {
                  logout();
                  message.error({ status: 401 });
                }
              } else {
                return reject({
                  status: 5,
                  error: err,
                });
              }
            }
          } else {
            return reject({
              status: 5,
              error: err,
            });
          }
        });
    });
  },

  async dataPostFormData(newUrl, authorization, body) {
    const url = newUrl;
    return await new Promise((resolve, reject) => {
      userHttp
        .post(url, body, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Origin': '*',
            Authorization: 'BWSA ' + authorization,
            SourceSystem: 'WebAdmin',
          },
        })
        .then(result => {
          if (result.status === 200) {
            return resolve({
              status: 1,
              result: result,
            });
          } else if (result.status === 212) {
            return resolve({
              status: 4,
              result: result,
            });
          } else {
            if (result) {
              return reject({
                status: 3,
                error: result.data.message,
              });
            } else {
              return reject({
                status: 4,
                error: 'Something went wrong.',
              });
            }
          }
        })
        .catch(err => {
          if (err.response) {
            if (err.response.status !== null && err.response.status !== undefined) {
              if (err.response.status === 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus === 401) {
                  logout();
                  message.error({ status: 401 });
                }
              } else {
                return reject({
                  status: 5,
                  error: err,
                });
              }
            }
          } else {
            return reject({
              status: 5,
              error: err,
            });
          }
        });
    });
  },

  async dataPostDownload(newUrl, authorization, body, fileName) {
    const url = newUrl;
    return await new Promise((resolve, reject) => {
      userHttp
        .post(url, body, {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            Accept: 'application/csv',
            Authorization: 'BWSA ' + authorization,
            SourceSystem: 'WebAdmin',
          },
        })
        .then(result => {
          if (result.status === 200) {
            const url = window.URL.createObjectURL(new Blob([result.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName + '.csv'); //or any other extension
            document.body.appendChild(link);
            link.click();
            return resolve({
              status: 1,
              result: result,
            });
          } else if (result.status === 212) {
            return resolve({
              status: 4,
              result: result,
            });
          } else {
            if (result) {
              return reject({
                status: 3,
                error: result.data.message,
              });
            } else {
              return reject({
                status: 4,
                error: 'Something went wrong.',
              });
            }
          }
        })
        .catch(err => {
          if (err.response) {
            if (err.response.status !== null && err.response.status !== undefined) {
              if (err.response.status === 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus === 401) {
                  logout();
                  message.error({ status: 401 });
                }
              } else {
                return reject({
                  status: 5,
                  error: err,
                });
              }
            }
          } else {
            return reject({
              status: 5,
              error: err,
            });
          }
        });
    });
  },

  async dataPatch(newUrl, authorization, body) {
    const url = newUrl;
    return await new Promise((resolve, reject) => {
      userHttp
        .patch(url, body, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            Authorization: 'BWSA ' + authorization,
            SourceSystem: 'WebAdmin',
          },
        })
        .then(result => {
          if (result.status === 200) {
            return resolve({
              status: 1,
              result: result,
            });
          } else if (result.status === 212) {
            return resolve({
              status: 4,
              result: result,
            });
          } else {
            if (result) {
              return reject({
                status: 3,
                error: result.data.message,
              });
            } else {
              return reject({
                status: 4,
                error: 'Something went wrong.',
              });
            }
          }
        })
        .catch(err => {
          if (err.response) {
            if (err.response.status !== null || err.response.status !== undefined) {
              if (err.response.status === 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus === 401) {
                  logout();
                  message.error({ status: 401 });
                }
              } else if (err.response.status === 400) {
                message.config({
                  duration: 1.5,
                  maxCount: 1,
                });
                message.error({ content: err.response.data.message });
                return reject({
                  status: 5,
                  error: err.response.data.message,
                });
              } else {
                return reject({
                  status: 5,
                  error: err.response && err.response.data.message,
                });
              }
            }
          } else {
            return reject({
              status: 5,
              error: err.response && err.response.data.message,
            });
          }
        });
    });
  },

  // Method to GET response
  async dataGet(newUrl, authorization, cancelToken) {
    const url = newUrl;
    return await new Promise((resolve, reject) => {
      userHttp
        .get(url, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'BWSA ' + authorization,
            'Access-Control-Allow-Origin': '*',
            SourceSystem: 'WebAdmin',
          },
          cancelToken: cancelToken,
        })
        .then(result => {
          if (result.status === 200) {
            return resolve({
              status: 1,
              result: result,
            });
          } else if (result.status === 212) {
            return resolve({
              status: 4,
              result: result,
            });
          } else {
            if (result) {
              return reject({
                status: 3,
                error: result.data.message,
              });
            } else {
              return reject({
                status: 4,
                error: 'Something went wrong.',
              });
            }
          }
        })
        .catch(err => {
          if (axios.isCancel(err)) {
            return;
          } else if (err.response) {
            if (err.response.status !== null && err.response.status !== undefined) {
              if (err.response.status === 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus === 401) {
                  logout();
                  message.error({ status: 401 });
                }
              } else if (err.response.status === 404) {
                return reject({
                  status: 6,
                  error: err,
                });
              } else {
                return reject({
                  status: 5,
                  error: err,
                });
              }
            }
          } else {
            return reject({
              status: 5,
              error: err,
            });
          }
        });
    });
  },

  async dataDelete(newUrl, authorization) {
    const url = newUrl;
    return await new Promise((resolve, reject) => {
      userHttp
        .delete(url, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'BWSA ' + authorization,
            'Access-Control-Allow-Origin': '*',
            SourceSystem: 'WebAdmin',
          },
        })
        .then(result => {
          if (result.status === 200) {
            return resolve({
              status: 1,
              result: result,
            });
          } else if (result.status === 212) {
            return resolve({
              status: 4,
              result: result,
            });
          } else {
            if (result) {
              return reject({
                status: 3,
                error: result.data.message,
              });
            } else {
              return reject({
                status: 4,
                error: 'Something went wrong.',
              });
            }
          }
        })
        .catch(err => {
          if (err.response) {
            if (err.response.status !== null && err.response.status !== undefined) {
              if (err.response.status === 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus === 401) {
                  logout();
                  message.error({ status: 401 });
                }
              } else {
                return reject({
                  status: 5,
                  error: err,
                });
              }
            }
          } else {
            return reject({
              status: 5,
              error: err,
            });
          }
        });
    });
  },

  async dataGetDownload(newUrl, authorization, userType) {
    const url = newUrl;
    return await new Promise((resolve, reject) => {
      userHttp
        .get(url, {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/csv',
            Authorization: 'BWSA ' + authorization,
            'Access-Control-Allow-Origin': '*',
            SourceSystem: 'WebAdmin',
          },
        })
        .then(result => {
          if (result.status === 200) {
            const url = window.URL.createObjectURL(new Blob([result.data]));
            const link = document.createElement('a');
            link.href = url;
            let _now = moment().utc().format('Y-MM-DD');
            let fileName = 'filecsv';
            if (userType === 'manager') {
              fileName = `matchDayManagerList-${_now}`;
            } else if (userType === 'coach') {
              fileName = `matchDayCoaches-${_now}`;
            } else {
              fileName = `umpire-${_now}`;
            }
            link.setAttribute('download', `${fileName}.csv`); //or any other extension
            document.body.appendChild(link);
            link.click();
            return resolve({
              status: 1,
              result: result,
            });
          } else if (result.status === 212) {
            return resolve({
              status: 4,
              result: result,
            });
          } else {
            if (result) {
              return reject({
                status: 3,
                error: result.data.message,
              });
            } else {
              return reject({
                status: 4,
                error: 'Something went wrong.',
              });
            }
          }
        })
        .catch(err => {
          if (err.response) {
            if (err.response.status !== null && err.response.status !== undefined) {
              if (err.response.status === 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus === 401) {
                  logout();
                  message.error({ status: 401 });
                }
              } else {
                return reject({
                  status: 5,
                  error: err,
                });
              }
            }
          } else {
            return reject({
              status: 5,
              error: err,
            });
          }
        });
    });
  },
};

export default userHttpApi;
