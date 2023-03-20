import ApiConstants from '../../../themes/apiConstants';
import {
  isArrayNotEmpty,
  // isNotNullOrEmptyString
} from '../../../util/helpers';

let obj = {
  competitionFormatId: 0,
  competitionName: '',
  yearRefId: 1,
  competitionUniqueKey: '',
  organisationId: 0,
  competitionFormatRefId: 0,
  isDefault: 0,
  fixtureTemplateId: 0,
  matchTypeRefId: 0,
  noOfRounds: 0,
  enhancedRoundRobinRefId: 0,
  competitionTypeRefId: 0,
  roundInDays: 7,
  roundInHours: 0,
  roundInMins: 0,
  competionFormatDivisions: [],
  fixtureTemplates: [],
  divisions: [],
};
const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  competitionFormatList: [obj],
  isAllDivisionChecked: false,
};
function competitionFormatReducer(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_GET_COMPETITION_FORMAT_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_GET_COMPETITION_FORMAT_SUCCESS:
      let data = action.result;
      let isAllDivisionChecked = false;
      getCompetitionFormatDivisions(data);
      if (
        data.competionFormatDivisions.length === 1 ||
        !isArrayNotEmpty(data.competionFormatDivisions)
      ) {
        if (isArrayNotEmpty(data.competionFormatDivisions)) {
          if (data.competionFormatDivisions[0].selectedDivisions.length === 0)
            isAllDivisionChecked = true;
        } else {
          isAllDivisionChecked = true;
        }
      }
      if (isArrayNotEmpty(data.competionFormatDivisions)) {
        data.competionFormatDivisions.forEach(cfd => {
          if (isAllDivisionChecked) {
            cfd.overrideStartDate = false;
            cfd.divisionStartDate = null;
          } else {
            cfd.overrideStartDate = !!cfd.divisionStartDate;
          }
        });
      }

      return {
        ...state,
        onLoad: false,
        competitionFormatList: data,
        isAllDivisionChecked: isAllDivisionChecked,
        status: action.status,
      };

    case ApiConstants.API_SAVE_COMPETITION_FORMAT_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_SAVE_COMPETITION_FORMAT_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.UPDATE_COMPETITION_FORMAT:
      let oldData = state.competitionFormatList;
      let updatedValue = action.updatedData;
      let getKey = action.key;
      if (getKey === 'addCompetitionFormatDivisions') {
        addCompetitionFormatDivision(updatedValue);
        getCompetitionFormatDivisions(updatedValue);
      } else if (getKey === 'allDivision') {
        state.isAllDivisionChecked = updatedValue;
      } else if (getKey === 'nonPlayingDates') {
        oldData[getKey].push(updatedValue);
      } else if (getKey === 'nonPlayingDataRemove') {
        oldData.nonPlayingDates.splice(updatedValue, 1);
      } else if (getKey === 'nonPlayingUpdateDates') {
        let index = updatedValue.index;
        let key = updatedValue.key;
        oldData.nonPlayingDates[index][key] = updatedValue.data;
      } else {
        oldData[getKey] = updatedValue;
      }

      return { ...state, error: null };

    case ApiConstants.API_COMPETITION_FORMAT_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_COMPETITION_FORMAT_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    default:
      return state;
  }
}

function addCompetitionFormatDivision(data, key) {
  let compFormatDivisionObj = {
    competitionFormatTemplateId: -data.competionFormatDivisions.length,
    matchDuration: 0,
    mainBreak: 0,
    qtrBreak: 0,
    timeBetweenGames: 0,
    divisionStartDate: null,
    isFinal: 0,
    divisions: [],
    selectedDivisions: [],
  };
  let divisions = data.divisions;
  for (let item in divisions) {
    let divisionsObj = {
      competitionFormatDivisionId: 0,
      competitionMembershipProductDivisionId: divisions[item].competitionMembershipProductDivision,
      isChecked: false,
      isDisabled: false,
      divisionsName: divisions[item].divisionName,
    };
    compFormatDivisionObj.divisions.push(divisionsObj);
  }
  data.competionFormatDivisions.push(compFormatDivisionObj);
  // this.state.competitionFormatList[key] = data.competionFormatDivisions;
}

function getCompetitionFormatDivisions(data) {
  let compFormatDivisions = data.competionFormatDivisions;
  if (isArrayNotEmpty(compFormatDivisions)) {
    // let disabledArray = [];
    for (let formatDivision of compFormatDivisions) {
      if (formatDivision.divisionStartDate) {
        formatDivision.divisionStartDate = formatDivision.divisionStartDate.replace('Z', '');
      }
      let divisionsArray = [];
      let divisions = data.divisions;

      for (let div in divisions) {
        let divisionsObj = {
          competitionFormatDivisionId: 0,
          competitionMembershipProductDivisionId:
            divisions[div].competitionMembershipProductDivision,
          isChecked: false,
          isDisabled: false,
          divisionsName: divisions[div].divisionName,
        };
        let itemDivisions = formatDivision.divisions;
        for (let compDivision in itemDivisions) {
          if (
            itemDivisions[compDivision].competitionMembershipProductDivisionId ===
            divisions[div].competitionMembershipProductDivision
          ) {
            divisionsObj.competitionFormatDivisionId =
              itemDivisions[compDivision].competitionFormatDivisionId;
            divisionsObj.competitionMembershipProductDivisionId =
              itemDivisions[compDivision].competitionMembershipProductDivisionId;
            divisionsObj.isChecked = true;
          }
        }
        divisionsArray.push(divisionsObj);
      }
      formatDivision.divisions = divisionsArray;
    }
    for (let item in compFormatDivisions) {
      let itemDivisions = compFormatDivisions[item].divisions;
      let competitionFormatTemplateId = compFormatDivisions[item].competitionFormatTemplateId;
      let remainingFormatDiv = compFormatDivisions.filter(
        x => x.competitionFormatTemplateId != competitionFormatTemplateId,
      );

      for (let remDiv in remainingFormatDiv) {
        let selectedDivisions = remainingFormatDiv[remDiv].selectedDivisions;
        for (let i in selectedDivisions) {
          for (let j in itemDivisions) {
            if (itemDivisions[j].competitionMembershipProductDivisionId === selectedDivisions[i]) {
              itemDivisions[j].isDisabled = true;
            }
          }
        }
      }
    }
  }
}

export default competitionFormatReducer;
