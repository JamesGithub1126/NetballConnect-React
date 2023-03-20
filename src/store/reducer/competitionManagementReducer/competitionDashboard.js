import ApiConstants from '../../../themes/apiConstants';
import { deepCopyFunction, isArrayNotEmpty } from '../../../util/helpers';
import ColorsArray from '../../../util/colorsArray';

const replicateObj = {
  details: {
    oldYearRefId: null,
    oldCompetitionId: null,
    newYearRefId: null,
    competitionName: null,
    competitionDates: null,
    competitionStartDate: null,
    competitionEndDate: null,
    registrationCloseDate: null,
    replicateSettings: {
      competitionLogo: 0,
      competitionDetails: 0,
      competitionType: 0,
      nonPlayingDates: 0,
      registrationTypes: 0,
      registrationFees: 0,
      venues: 0,
      fixtures: null, // { divisions: 0, grades: 0, teams: 0, venuePreferneces: 0, timeslots: 0,},
    },
  },
  membershipProducts: [],
};

const fixtures = {
  divisions: null,
  grades: null,
  teams: null,
  venuePreferneces: null,
  timeslots: null,
};

const membershipProductObj = {
  newProducts: {
    membershipProductUniqueKey: null,
    membershipProductTypes: [],
  },
  oldProducts: {
    competitionMembershipProductId: null,
    membershipProductUniqueKey: null,
    membershipProductTypes: [],
  },
};

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  ownedCompetitions: [],
  participatingInComptitions: [],
  updateLoad: false,
  deleteCompLoad: false,
  replicateSave: deepCopyFunction(replicateObj),
  replicateSaveOnLoad: false,
  replicateSaved: false,
  competitionId: null,
  yearRefId: null,
  oldMembershipProducs: [],
  oldMembershipOnLoad: null,
  newMembershipOnLoad: false,
  newMembershipProducs: [],
  replicateSaveErrorMessage: null,
};

///// Generate Owned Competition Array

function genrateOwnedCompArray(dashboardList) {
  let ownedCompetitions = JSON.parse(JSON.stringify(dashboardList.ownedCompetitions));

  for (let i in ownedCompetitions) {
    let ownDivisionList = ownedCompetitions[i].divisions;
    if (isArrayNotEmpty(ownDivisionList)) {
      ownDivisionList.forEach((item, index) => {
        item.color = index <= ColorsArray.length ? ColorsArray[index] : '#a3a3b1';
      });
    }
  }
  return ownedCompetitions;
}

///// Create Participating In competition Array

function genratePaticipatingArray(dashboardList) {
  let participatingComptitions = JSON.parse(
    JSON.stringify(dashboardList.participatingInComptitions),
  );

  for (let i in participatingComptitions) {
    let divisionList = participatingComptitions[i].divisions;
    if (isArrayNotEmpty(divisionList)) {
      divisionList.forEach((item, index) => {
        item.color = index <= ColorsArray.length ? ColorsArray[index] : '#a3a3b1';
      });
    }
  }
  return participatingComptitions;
}

function setMembershipProducts(state, payload) {
  try {
    let replicateSaveTemp = state.replicateSave;
    let membershipProductTemp = deepCopyFunction(membershipProductObj);
    let newMembershipProduct = state.newMembershipProducs.find(
      x => x.membershipProductUniqueKey == payload.newMembershipProductUniqueKey,
    );
    if (newMembershipProduct) {
      //set new prouducts object
      membershipProductTemp.newProducts.membershipProductUniqueKey =
        payload.newMembershipProductUniqueKey;
      let newMembershipProuductTypes = [];
      for (let productType of newMembershipProduct.membershipProductTypes) {
        let obj = {
          membershipProductTypeMappingId: productType.membershipProductTypeMappingId,
          productTypeName: productType.membershipProductTypeName,
          isDefault: productType.isDefault,
          isPlayer: productType.isPlaying,
        };
        newMembershipProuductTypes.push(obj);
      }
      membershipProductTemp.newProducts.membershipProductTypes = newMembershipProuductTypes;

      //set old product objects
      let oldMembershipProduct = state.oldMembershipProducs[payload.oldProductIndex];
      membershipProductTemp.oldProducts.competitionMembershipProductId =
        oldMembershipProduct.competitionMembershipProductId;
      membershipProductTemp.oldProducts.membershipProductUniqueKey =
        oldMembershipProduct.membershipProductUniqueKey;
      let oldMembershipProuductTypes = [];
      for (let productType of oldMembershipProduct.membershipProductTypes) {
        let obj = {
          competitionMembershipProductId: productType.competitionMembershipProductId,
          competitionMembershipProductTypeId: productType.competitionMembershipProductTypeId,
          membershipProductTypeMappingId: productType.membershipProductTypeMappingId,
          productTypeName: productType.membershipProductTypeName,
          isDefault: productType.isDefault,
          isPlayer: productType.isPlaying,
        };
        oldMembershipProuductTypes.push(obj);
      }
      membershipProductTemp.oldProducts.membershipProductTypes = oldMembershipProuductTypes;

      replicateSaveTemp.membershipProducts[payload.oldProductIndex] = membershipProductTemp;
    }
  } catch (ex) {
    console.log('Error in setMembershipProducts::' + ex);
  }
}

function CompetitionDashboardState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_COMPETITION_DASHBOARD_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_COMPETITION_DASHBOARD_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    ////Competition Dashboard Case
    case ApiConstants.API_COMPETITION_DASHBOARD_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_COMPETITION_DASHBOARD_SUCCESS:
      let ownCompetionArray = genrateOwnedCompArray(action.result);
      let participatingComptitions = genratePaticipatingArray(action.result);
      return {
        ...state,
        onLoad: false,
        ownedCompetitions: ownCompetionArray,
        participatingInComptitions: participatingComptitions,
        status: action.status,
      };

    case ApiConstants.API_COMPETITION_DASHBOARD_DELETE_LOAD:
    case ApiConstants.API_COMPETITION_DASHBOARD_ARCHIVE_LOAD:
      return { ...state, deleteCompLoad: true };

    case ApiConstants.API_COMPETITION_DASHBOARD_DELETE_SUCCESS:
    case ApiConstants.API_COMPETITION_DASHBOARD_ARCHIVE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        result: action.result,
        status: action.status,
        deleteCompLoad: false,
      };

    case ApiConstants.API_SAVE_COMPETITION_DIVISIONS_LOAD:
    case ApiConstants.API_COMPETITION_STATUS_UPDATE_LOAD:
      return { ...state, updateLoad: true };

    case ApiConstants.API_SAVE_COMPETITION_DIVISIONS_SUCCESS:
      return {
        ...state,
        updateLoad: false,
      };

    case ApiConstants.API_COMPETITION_STATUS_UPDATE_SUCCESS:
      let ownCompetion_Array = genrateOwnedCompArray(action.updateDashboardResult);
      let participating_Comptitions = genratePaticipatingArray(action.updateDashboardResult);
      return {
        ...state,
        updateLoad: false,
        ownedCompetitions: ownCompetion_Array,
        participatingInComptitions: participating_Comptitions,
      };

    case ApiConstants.UPDATE_REPLICATE_SAVE_OBJ:
      let replicateData = action.data;
      let replicateKey = action.key;
      let replicateSubKey = action.subKey;
      let oldProductIndex = action.index;
      if (replicateKey === 'details') {
        state.replicateSave[replicateKey][replicateSubKey] = replicateData;
      } else if (replicateKey === 'replicateSettings') {
        let fixtures = state.replicateSave.details.replicateSettings.fixtures;
        if (fixtures) {
          if (replicateSubKey === 'registrationTypes' && replicateData == 0) {
            state.replicateSave.details.replicateSettings.registrationFees = 0;
            fixtures.divisions = 0;
            fixtures.grades = 0;
            fixtures.teams = 0;
          }
          if (replicateSubKey === 'venues' && replicateData == 0) {
            fixtures.venuePreferneces = 0;
          }
        }
        state.replicateSave.details[replicateKey][replicateSubKey] = replicateData;
      } else if (replicateKey === 'fixtures') {
        if (replicateSubKey === 'fixtures') {
          if (replicateData == 1) {
            state.replicateSave.details.replicateSettings[replicateKey] =
              deepCopyFunction(fixtures);
          } else {
            state.replicateSave.details.replicateSettings[replicateKey] = null;
          }
        } else {
          state.replicateSave.details.replicateSettings[replicateKey][replicateSubKey] =
            replicateData;
        }
      } else if (replicateKey === 'membershipProducts') {
        let payload = {
          newMembershipProductUniqueKey: replicateData,
          oldProductIndex: oldProductIndex,
        };
        setMembershipProducts(state, payload);
      }
      return {
        ...state,
      };

    case ApiConstants.API_REPLICATE_SAVE_LOAD:
      return { ...state, replicateSaveOnLoad: true };

    case ApiConstants.API_REPLICATE_SAVE_SUCCESS:
      let responseData = action.result;
      return {
        ...state,
        status: action.status,
        replicateSaveOnLoad: false,
        competitionId: action.status == 1 ? responseData.competitionId : null,
        yearRefId: action.status == 1 ? responseData.yearRefId : null,
        replicateSaveErrorMessage: action.status == 4 ? responseData : null,
        replicateSaved: true,
      };

    case ApiConstants.API_OLD_MEMBERSHIP_PRODUCTS_BY_COMP_ID_LOAD:
      return { ...state, oldMembershipOnLoad: true };

    case ApiConstants.API_OLD_MEMBERSHIP_PRODUCTS_BY_COMP_ID_SUCCESS:
      let oldMemResponseData = action.result[0].membershipProducts;
      return {
        ...state,
        status: action.status,
        oldMembershipOnLoad: false,
        oldMembershipProducs: oldMemResponseData,
      };

    case ApiConstants.API_NEW_MEMBERSHIP_PRODUCTS_BY_YEAR_LOAD:
      return { ...state, newMembershipOnLoad: true };

    case ApiConstants.API_NEW_MEMBERSHIP_PRODUCTS_BY_YEAR_SUCCESS:
      let newMemResponseData = action.result[0].membershipProducts;
      return {
        ...state,
        status: action.status,
        newMembershipOnLoad: false,
        newMembershipProducs: newMemResponseData,
      };

    default:
      return state;
  }
}

export default CompetitionDashboardState;
