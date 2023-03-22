import moment from 'moment';

import AppConstants from '../themes/appConstants';
import history from './history';
import {
  getOrganisationData,
  getLiveScoreCompetition,
  getUmpireCompetitionData,
} from './sessionStorage';
import { UserRole, OrganisationType } from 'util/enums';

const organisationTypeRefIdObject = {
  [AppConstants.national]: 1,
  [AppConstants.state]: 2,
  [AppConstants.association]: 3,
  [AppConstants.club]: 4,
};

async function checkOrganisationLevel() {
  const orgItem = await getOrganisationData();
  const organisationTypeRefId = orgItem ? orgItem.organisationTypeRefId : 0;
  return Object.keys(organisationTypeRefIdObject).find(
    key => organisationTypeRefIdObject[key] === organisationTypeRefId,
  );
}

function getOrganisationLevel() {
  const orgItem = getOrganisationData();
  const organisationTypeRefId = orgItem ? orgItem.organisationTypeRefId : 0;
  return Object.keys(organisationTypeRefIdObject).find(
    key => organisationTypeRefIdObject[key] === organisationTypeRefId,
  );
}

const userRoleIdObject = {
  [AppConstants.super_admin]: 1,
  [AppConstants.admin]: 2,
  [AppConstants.manager]: 3,
  [AppConstants.scorer]: 4,
  [AppConstants.member]: 5,
  [AppConstants.spectator]: 6,
  [AppConstants.attendance_recorder]: 7,
  [AppConstants.player]: 8,
  [AppConstants.parent]: 9,
  [AppConstants.web_communications_admin]: 10,
  [AppConstants.web_umpires_admin]: 11,
  [AppConstants.web_results_admin]: 12,
  [AppConstants.web_finance_admin]: 13,
};

async function checkUserRole() {
  const orgItem = await getOrganisationData();
  const userRoleId = orgItem ? orgItem.userRoleId : 0;
  return Object.keys(userRoleIdObject).find(key => userRoleIdObject[key] === userRoleId);
}

async function routePermissionForOrgLevel(orgLevel1, orgLevel2) {
  const orgLevel = await checkOrganisationLevel();
  if (orgLevel1 == orgLevel || orgLevel2 == orgLevel) {
  } else {
    history.push('./');
  }
}
async function routePermissionForMembership() {
  const orgItem = await getOrganisationData();
  const organisationTypeRefId = orgItem ? orgItem.organisationTypeRefId : 0;
  let hasMembershipFees = orgItem.hasMembershipFees ? orgItem.hasMembershipFees : 0;
  let hasOrgMembership = organisationTypeRefId == 1 || organisationTypeRefId == 2;
  let hasAssociationMembership = organisationTypeRefId > 2 && hasMembershipFees == 1;
  if (hasOrgMembership || hasAssociationMembership) {
    return true;
  } else {
    history.push('./');
  }
}

const registrationsInviteesObject = {
  [AppConstants.firstlevelAffiliate]: 2,
  [AppConstants.secondlevelAffiliate]: 3,
  [AppConstants.anyOrgAssociation]: 7,
  [AppConstants.anyOrgClub]: 8,
  [AppConstants.direct]: 5,
  [AppConstants.notApplicable]: 6,
  [AppConstants.NoRegistrations]: 0,
};

function checkRegistrationType(registrationInviteesRefId) {
  return Object.keys(registrationsInviteesObject).find(
    key => registrationsInviteesObject[key] === registrationInviteesRefId,
  );
}

function checkLivScoreCompIsParent() {
  const orgItem = getOrganisationData();
  const liveScoreCompetition = getLiveScoreCompetition();
  const organisationId = orgItem ? orgItem.organisationId : 0;
  const liveScoreCompetitionOrgId = liveScoreCompetition
    ? JSON.parse(liveScoreCompetition).organisationId
    : 0;
  return liveScoreCompetitionOrgId === organisationId;
}

async function checkUserAccess() {
  const orgItem = await getOrganisationData();
  const userRoleId = orgItem ? orgItem.userRoleId : 2;
  if (userRoleId == 2) {
    return 'admin';
  }
  if (userRoleId == 11) {
    return 'umpire';
  }
  if (userRoleId == 13) {
    return 'finance';
  }

  return 'admin';
}

function showRoleLevelPermission(userRoleId, menuName) {
  if (menuName === 'user') {
    switch (userRoleId) {
      case 2:
        return true;
      case 11:
        return true;
      case 13:
        return true;
      default:
        return false;
    }
  } else if (menuName === 'registration') {
    switch (userRoleId) {
      case 2:
        return true;
      default:
        return false;
    }
  } else if (menuName === 'competitions') {
    switch (userRoleId) {
      case 2:
        return true;
      default:
        return false;
    }
  } else if (menuName === 'liveScores') {
    switch (userRoleId) {
      case 2:
        return true;
      default:
        return false;
    }
  } else if (menuName === 'events') {
    switch (userRoleId) {
      case 2:
        return true;
      default:
        return false;
    }
  } else if (menuName === 'shop') {
    switch (userRoleId) {
      case 2:
        return true;
      default:
        return false;
    }
  } else if (menuName === 'umpires') {
    switch (userRoleId) {
      case 2:
        return true;
      case 11:
        return true;
      default:
        return false;
    }
  } else if (menuName === 'finance') {
    switch (userRoleId) {
      case 2:
        return true;
      case 13:
        return true;
      default:
        return false;
    }
  }
}

function checkOrgTypeAccess(screen) {
  if (screen === 'advertising') {
    const org = getOrganisationData();
    return org && org.organisationTypeRefId == OrganisationType.State;
  }
}

function getUserRoleId() {
  const orgItem = getOrganisationData();
  return orgItem ? orgItem.userRoleId : UserRole.Admin;
}

function getCurrentYear(yearArr) {
  const currentYear = moment().year();
  const currentYearIndex = yearArr.findIndex(x => x.name == currentYear);
  if (currentYearIndex === -1) {
    return yearArr[0].id;
  } else {
    return yearArr[currentYearIndex].id;
  }
}

function getNextYear(yearArr) {
  const nextYear = moment().year() + 1;
  const nextYearIndex = yearArr.findIndex(x => x.name == nextYear);
  return nextYearIndex == -1 ? -1 : yearArr[nextYearIndex].id;
}

function compare(a, b) {
  const bandA = a.sortOrder;
  const bandB = b.sortOrder;
  let comparison = 0;
  if (bandA < bandB) {
    comparison = 1;
  } else if (bandA > bandB) {
    comparison = -1;
  }
  return comparison;
}

function reverseArray(array) {
  let isSortedArray = [];
  isSortedArray = array.sort(compare);
  return isSortedArray;
}

async function checkUmpireCompIsParent() {
  const orgItem = await getOrganisationData();
  const umpireCompetition = await getUmpireCompetitionData();
  const organisationId = orgItem ? orgItem.organisationId : 0;
  const umpireCompetitionOrgId = umpireCompetition
    ? JSON.parse(umpireCompetition).organisationId
    : 0;
  return umpireCompetitionOrgId === organisationId;
}

async function checkUserSuperAdmin() {
  const currentUser = await checkUserRole();
  return userRoleIdObject[currentUser] === 1;
}

function isReadOnlyRole() {
  return getUserRoleId() == UserRole.AdminReadonly;
}

function isAdminRole() {
  const role = getUserRoleId();
  return role == UserRole.Admin || role == UserRole.SuperAdmin;
}

export {
  checkOrganisationLevel,
  checkUserRole,
  routePermissionForOrgLevel,
  checkRegistrationType,
  checkLivScoreCompIsParent,
  checkUserAccess,
  showRoleLevelPermission,
  getUserRoleId,
  getCurrentYear,
  getNextYear,
  reverseArray,
  checkUmpireCompIsParent,
  checkUserSuperAdmin,
  getOrganisationLevel,
  isReadOnlyRole,
  checkOrgTypeAccess,
  isAdminRole,
  routePermissionForMembership,
};
