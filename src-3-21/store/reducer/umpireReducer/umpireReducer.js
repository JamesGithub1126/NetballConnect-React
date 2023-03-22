import ApiConstants from '../../../themes/apiConstants';
import { uniqBy } from 'lodash';
import { deepCopyFunction, isArrayNotEmpty } from '../../../util/helpers';
import { RegistrationUserRoles } from 'enums/registrationEnums';

const umpireObj = {
  id: null,
  firstName: '',
  lastName: '',
  mobileNumber: '',
  email: '',
  affiliates: [],
  teams: [],
  teamId: [],
};

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  umpireList: [],
  umpireRadioBtn: 'new',
  umpireData: deepCopyFunction(umpireObj),
  affiliateId: null,
  exsitingUmpireId: null,
  affilateList: [],
  umpireOwnTeam: false,
  teamsList: [],
  umpireListResult: [],
  onLoadSearch: false,
  selectedAffiliate: null,
  onAffiliateLoad: false,
  selectedAffiliateId: null,
  onSaveLoad: false,
  totalCount: null,
  currentPage: null,
  coachList: [],
  umpireCoachCheckBox: false,
  coachList_Data: [],
  umpireList_Data: [],
  umpireListResult_Data: [],
  pageSize_Data: 10,
  currentPage_Data: 1,
  totalCount_Data: 1,
  umpireListActionObject: null,
  umpireListData: [],
  umpireCheckbox: false,
  isOtherOfficial: false,
  umpireListDataNew: [],
  rankedUmpiresCount: 0,
  umpireActivities: [],
  currentPageUmpireActivity: 1,
  umpireActivityTotalCount: 1,
  currentPageSizeUmpireActivity: 10,
};

function isUmpireCoachCheck(data, key) {
  if (data.userRoleEntities) {
    const checkCoach = data.userRoleEntities;
    for (const i in checkCoach) {
      if (checkCoach[i].roleId === key) {
        return true;
      }
    }
  }
  return false;
}

function createUmpireArray(result) {
  const umpireArray = [];
  for (const i in result) {
    const userRoleCheck = result[i].userRoleEntities;
    for (const j in userRoleCheck) {
      if (userRoleCheck[j].roleId === 15 || userRoleCheck[j].roleId === 19) {
        umpireArray.push(result[i]);
        break;
      }
    }
  }
  return umpireArray;
}

function createUmpireCoachArray(result) {
  const umpireArray = [];
  for (const i in result) {
    const userRoleCheck = result[i].userRoleEntities;
    for (const j in userRoleCheck) {
      if (userRoleCheck[j].roleId === 15 || userRoleCheck[j].roleId === 20) {
        umpireArray.push(result[i]);
        break;
      }
    }
  }
  return umpireArray;
}

function createCoachArray(result) {
  const coachArray = [];
  for (const i in result) {
    const userRole = result[i].userRoleEntities;
    for (const j in userRole) {
      if (userRole[j].roleId === 20) {
        coachArray.push(result[i]);
        break;
      }
    }
  }
  return coachArray;
}

function getAffiliateData(selectedAffiliateId = [], affiliateArray = []) {
  if (!selectedAffiliateId || !affiliateArray) return [];
  const affiliateData = affiliateArray
    .filter(affiliate => selectedAffiliateId.includes(affiliate.id))
    .map(affiliate => ({ id: affiliate.id, name: affiliate.name }));
  return affiliateData;
}

export function getAffiliatesDataFromRoleEntities(linkedEntities = []) {
  return uniqBy(
    linkedEntities.map(linkedEntity => ({
      id: linkedEntity.entityId,
      name: linkedEntity.name,
    })),
    'id',
  );
}

function getTeamsData(selectedTeamId, teamsArray) {
  return selectedTeamId
    .map(teamId => {
      const team = teamsArray.find(curTeam => curTeam.id === teamId);
      if (!team) return null;

      return { id: team.id || teamId, name: team.name };
    })
    .filter(t => !!t);
}

/// / get umpire selected Affiliate
function getumpireAffiliate(selectedUmpireId, umpireListArr) {
  let selectedAffiliate;
  for (const i in umpireListArr) {
    if (selectedUmpireId === umpireListArr[i].id) {
      selectedAffiliate = umpireListArr[i].linkedEntity;
    }
  }
  return selectedAffiliate;
}

function generateSelectedAffiliateIds(linkedEntityArr, affiliateArr) {
  const affiliateIds = [];
  for (const i in affiliateArr) {
    for (const j in linkedEntityArr) {
      if (linkedEntityArr[j].entityId === affiliateArr[i].id) {
        affiliateIds.push(linkedEntityArr[j].entityId);
      }
    }
  }
  return affiliateIds;
}

function umpireState(state = initialState, action) {
  switch (action.type) {
    //Umpire List Export

    case ApiConstants.API_EXPORT_UMPIRE_LIST_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_EXPORT_UMPIRE_LIST_SUCCESS:
      return {
        ...state,
        onLoad: false,
      };
    /// / Umpire List
    case ApiConstants.API_UMPIRE_LIST_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_UMPIRE_LIST_SUCCESS:
      const user_Data = action.result.userData ? action.result.userData : action.result;
      if (action.key === 'data') {
        const coachData = createCoachArray(JSON.parse(JSON.stringify(user_Data)));
        state.coachList = coachData;
      }
      const checkUserData = createUmpireArray(JSON.parse(JSON.stringify(user_Data)));
      return {
        ...state,
        onLoad: false,
        umpireList: checkUserData,
        umpireListResult: checkUserData,
        currentPage: action.result.page ? action.result.page.currentPage : null,
        totalCount: action.result.page ? action.result.page.totalCount : null,
        status: action.status,
      };

    case ApiConstants.API_GET_RANKED_UMPIRES_COUNT_SUCCESS:
      return {
        ...state,
        rankedUmpiresCount: action.result,
      };

    /// /Main Umpire List
    case ApiConstants.API_UMPIRE_MAIN_LIST_LOAD:
      return { ...state, onLoad: true, umpireListActionObject: action.data };

    case ApiConstants.API_UMPIRE_MAIN_LIST_SUCCESS:
      const userMain_Data = action.result.userData ? action.result.userData : action.result;
      if (action.key === 'data') {
        const coachData = createCoachArray(JSON.parse(JSON.stringify(userMain_Data)));
        state.coachList_Data = coachData;
      }
      const checkUser_Data = createUmpireCoachArray(JSON.parse(JSON.stringify(userMain_Data)));
      return {
        ...state,
        onLoad: false,
        umpireList_Data: checkUser_Data,
        umpireListResult_Data: checkUser_Data,
        currentPage_Data: action.result.page ? action.result.page.currentPage : null,
        totalCount_Data: action.result.page ? action.result.page.totalCount : null,
        status: action.status,
      };

    /// / Add Umpire
    case ApiConstants.API_ADD_UMPIRE_LOAD:
      return { ...state, onSaveLoad: true };
    case ApiConstants.API_ADD_UMPIRE_SUCCESS:
      return {
        ...state,
        onSaveLoad: false,
        status: action.status,
      };
    /// / Get Affiliate List
    case ApiConstants.API_GET_UMPIRE_AFFILIATE_LIST_LOAD:
      return { ...state, onAffiliateLoad: true };
    case ApiConstants.API_GET_UMPIRE_AFFILIATE_LIST_SUCCESS:
      state.affilateList = action.result;
      return {
        ...state,
        onAffiliateLoad: false,
        status: action.status,
      };
    case ApiConstants.GET_UMPIRE_TEAMS_LOAD:
      return {
        ...state,
        onLoad: true,
        umpireOwnTeam: false,
      };
    case ApiConstants.GET_UMPIRE_TEAMS_SUCCESS:
      const umpire = action.data;
      if (umpire.email) {
        const affiliates = umpire.organisations.map(({ id, name }) => {
          const org = state.affilateList?.find(affiliate => affiliate.organisationId === id);
          const newId = org ? org.id : id;
          return { name, id: newId };
        });
        const selectedTeams = umpire.selectedTeams.map(({ id, name }) => ({ id, name }));
        const affiliateIds = affiliates.map(affiliate => affiliate.id);
        const teamIds = selectedTeams.map(({ id }) => id);
        const selectedOrganisations = umpire.selectedOrganisations.map(({ compOrgId, name }) => ({
          id: compOrgId,
          name,
        }));

        return {
          ...state,
          onLoad: false,
          umpireOwnTeam: umpire.umpireOwnTeam,
          teamsList: umpire.teams,
          umpireCheckbox: umpire.isUmpire,
          isOtherOfficial: umpire.isOtherOfficial,
          umpireCoachCheckBox: umpire.isUmpireCoach,
          affililateList: umpire.organisations,
          affiliateId: affiliateIds,
          umpireData: {
            ...state.umpireData,
            teams: selectedTeams,
            teamId: teamIds,
            id: umpire.id,
            firstName: umpire.firstName,
            lastName: umpire.lastName,
            mobileNumber: umpire.mobileNumber,
            email: umpire.email,
            affiliates: selectedOrganisations,
          },
        };
      } else {
        return {
          ...state,
          onLoad: false,
          umpireOwnTeam: umpire.umpireOwnTeam,
          teamsList: umpire.teams,
        };
      }

    //// Update Add Umpire Data
    case ApiConstants.UPDATE_ADD_UMPIRE_DATA:
      const { key } = action;
      const { data } = action;
      if (key === 'umpireRadioBtn') {
        state.umpireRadioBtn = data;
        state.umpireData.affiliates = [];
      } else if (key === 'teamId') {
        state.umpireData.teamId = data;
        state.umpireData.teams = getTeamsData(data, state.teamsList);
      } else if (key === 'affiliates') {
        state.affiliateId = data;
        let affiliateObj = getAffiliateData(data, state.affilateList);
        state.umpireData['affiliates'] = affiliateObj;
      } else if (key === 'umnpireSearch') {
        state.exsitingUmpireId = data;
        state.selectedAffiliateId = getumpireAffiliate(data, state.umpireListResult);
        const getAffiliateIds = generateSelectedAffiliateIds(
          state.selectedAffiliateId,
          state.affilateList,
        );
        state.umpireData.affiliates = getAffiliateIds;
      } else if (key === 'isEditUmpire') {
        state.umpireData.id = data.id;
        state.umpireData.firstName = data.firstName;
        state.umpireData.lastName = data.lastName;
        state.umpireData.mobileNumber = data.mobileNumber;
        state.umpireData.email = data.email;
        state.umpireData.affiliates = getAffiliatesDataFromRoleEntities(data.userRoleEntities);
        state.umpireRadioBtn = 'new';
        state.umpireCoachCheckBox = isUmpireCoachCheck(data, 20);
        state.umpireCheckbox = isUmpireCoachCheck(data, 15);
        state.isOtherOfficial = isUmpireCoachCheck(data, RegistrationUserRoles.OtherOfficial);
      } else if (action.key === 'isAddUmpire') {
        state.umpireData = deepCopyFunction(umpireObj);
        state.umpireData.id = null;
        state.umpireData.affiliates = [];
        state.umpireRadioBtn = 'new';
        state.umpireCoachCheckBox = false;
        state.umpireCheckbox = false;
        state.isOtherOfficial = false;
      } else if (action.key === 'partcipateAffiliateId') {
        const umpire_AffiliateObj = getAffiliateData(data, state.affilateList);
        state.umpireData.affiliates = umpire_AffiliateObj;
      } else {
        state.umpireData[action.key] = action.data;
      }
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };
    /// /Umpire Search
    case ApiConstants.API_UMPIRE_SEARCH_LOAD:
      return { ...state, onLoadSearch: true };

    case ApiConstants.API_UMPIRE_SEARCH_SUCCESS:
      return {
        ...state,
        onLoadSearch: false,
        umpireListResult: action.result,
        umpireListData: action.result,
        status: action.status,
      };
    case ApiConstants.CLEAR_UMPIRE_SEARCH:
      state.umpireListResult = [];
      return {
        ...state,
      };

    // get umpire list settings - new
    case ApiConstants.API_GET_UMPIRE_LIST_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_GET_UMPIRE_LIST_SUCCESS:
      const umpireListDataCopy = JSON.parse(JSON.stringify(state.umpireListDataNew));
      umpireListDataCopy.push(...action.result.data);

      return {
        ...state,
        // umpireListDataNew: action.result?.page.currentPage === 1 ? action.result.data : umpireListDataCopy,
        umpireListDataNew: action.result.data,
        currentPage_Data: action.result.page ? action.result.page.currentPage : null,
        totalCount_Data: action.result.page ? action.result.page.totalCount : null,
        onLoad: false,
      };

    case ApiConstants.API_GET_UMPIRES_ACTIVITY_LIST_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_GET_UMPIRES_ACTIVITY_LIST_SUCCESS:
      return {
        ...state,
        onLoad: false,
        umpireActivities: action.data,
        umpireActivityTotalCount: action.totalCount,
      };

    /// / Fail and Error case
    case ApiConstants.API_UMPIRE_FAIL:
      return {
        ...state,
        onLoad: false,
        onSaveLoad: false,
        error: action.error,
        status: action.status,
      };
    case ApiConstants.API_UMPIRE_ERROR:
      return {
        ...state,
        onLoad: false,
        onSaveLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.umpireListActionObject = null;
      return { ...state, onLoad: false };

    case ApiConstants.SET_UMPIRE_LIST_PAGE_SIZE:
      return {
        ...state,
        pageSize_Data: action.pageSize,
      };

    case ApiConstants.SET_UMPIRE_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        currentPage_Data: action.pageNum,
      };

    case ApiConstants.SET_UMPIRE_ACTIVITY_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        currentPageUmpireActivity: action.pageNum,
      };

    case ApiConstants.SET_UMPIRE_ACTIVITY_PAGE_SIZE_NUMBER:
      return {
        ...state,
        currentPageSizeUmpireActivity: action.pageSize,
      };

    case ApiConstants.API_UPDATE_UMPIRE_POOL_MANY_DATA_SUCCESS:
      const tempUmpireListDataNew = [...state.umpireListDataNew];
      if (isArrayNotEmpty(action.result)) {
        for (let ret of action.result) {
          const umpires = ret.umpires || [];

          for (let umpire of umpires) {
            let umpireIndex = tempUmpireListDataNew.findIndex(u => u.id == umpire.id);
            if (umpireIndex > -1) {
              tempUmpireListDataNew.splice(umpireIndex, 1);
            }
          }
        }
      }
      return {
        ...state,
        umpireListDataNew: tempUmpireListDataNew,
      };

    case ApiConstants.API_UMPIRE_YEAR_CHANGED:
      return {
        ...state,
        umpireListDataNew: [],
      };

    default:
      return state;
  }
}
export default umpireState;
