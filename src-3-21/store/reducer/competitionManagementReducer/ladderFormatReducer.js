import ApiConstants from '../../../themes/apiConstants';
import { isEmptyArray } from 'formik';
import {
  isArrayNotEmpty,
  // isNotNullOrEmptyString
} from '../../../util/helpers';
import { deepCopyFunction } from '../../../util/helpers';

let obj = {
  ladderFormatId: 0,
  ladderSchemeId: 0,
  schemeName: '',
  isDefault: 0,
  isEditted: false,
  divisions: [],
  selectedDivisions: [],
  resultTypes: [],
};
const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  ladderSchemeDefaults: [obj],
  ladderFormats: [obj],
  defaultDivisions: [],
  isAllDivisionChecked: false,
};

function ladderFormatReducer(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_GET_LADDER_FORMAT_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_GET_LADDER_FORMAT_SUCCESS:
      let ladderFormatData = action.result;
      let ladderSchemeDefaults = ladderFormatData.ladderSchemeDefaults;
      let isAllDivisionChecked = false;
      if (ladderFormatData.ladderFormats.length === 0) {
        setLadderFormats(
          ladderFormatData.ladderFormats,
          ladderFormatData.ladderSchemeDefaults,
          ladderFormatData.divisions,
        );
      } else {
        if (ladderFormatData.ladderFormats.length === 1) {
          if (ladderFormatData.ladderFormats[0].selectedDivisions.length === 0) {
            isAllDivisionChecked = true;
          }
        }
      }

      setLadderDivisions(ladderFormatData.ladderFormats, ladderFormatData.divisions);

      // console.log("**" + JSON.stringify(ladderFormatData.ladderFormats));

      return {
        ...state,
        onLoad: false,
        ladderSchemeDefaults: ladderSchemeDefaults,
        ladderFormats: ladderFormatData.ladderFormats,
        defaultDivisions: ladderFormatData.divisions,
        isAllDivisionChecked: isAllDivisionChecked,
        status: action.status,
      };

    case ApiConstants.API_SAVE_LADDER_FORMAT_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_SAVE_LADDER_FORMAT_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.UPDATE_LADDER_FORMAT:
      let oldData = state.ladderFormats;
      let updatedValue = action.updatedData;
      let getKey = action.key;
      // let index = action
      if (getKey === 'ladderFormat') {
        state.ladderFormats = updatedValue;
      } else if (getKey === 'ladderFormatAdd') {
        setLadderFormats(state.ladderFormats, state.ladderSchemeDefaults, state.defaultDivisions);
        setLadderDivisions(state.ladderFormats, state.defaultDivisions);
      } else if (getKey === 'allDivision') {
        state.isAllDivisionChecked = updatedValue;
      } else {
        oldData[getKey] = updatedValue;
      }

      return { ...state, error: null };

    case ApiConstants.API_LADDER_FORMAT_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LADDER_FORMAT_ERROR:
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

function setLadderFormats(ladderFormats, ladderSchemeDefaults, defaultDivisions) {
  if (!isEmptyArray(ladderSchemeDefaults)) {
    let index = 0;
    let itemArr = ladderFormats.filter(x => x.ladderSchemeId !== 0);
    if (!isEmptyArray(itemArr)) {
      for (let i in ladderSchemeDefaults) {
        let checkValPresent = itemArr.filter(
          x => x.ladderSchemeId === ladderSchemeDefaults[i].ladderSchemeId,
        );
        if (!checkValPresent.length) {
          index = i;
          break;
        } else {
          index = -1;
        }
      }
    }
    let clonedSchemeDefaults = deepCopyFunction(ladderSchemeDefaults);
    let firstItem = clonedSchemeDefaults[index];

    if (firstItem !== undefined && firstItem !== null) {
      let obj = {
        ladderFormatId: 0,
        ladderSchemeId: firstItem.ladderSchemeId,
        schemeName: firstItem.schemeName,
        isDefault: firstItem.isDefault,
        isEditted: false,
        divisions: [],
        resultTypes: firstItem.resultTypes,
        selectedDivisions: [],
      };
      obj.divisions.push(defaultDivisions);

      ladderFormats.push(obj);
    }
  }
}

function setLadderDivisions(ladderFormats, defaultDivisions) {
  let ladderFormatData = ladderFormats;
  if (isArrayNotEmpty(ladderFormatData)) {
    // let disabledArray = [];
    for (let item in ladderFormatData) {
      let divisionsArray = [];
      let divisions = defaultDivisions;

      for (let div in divisions) {
        let divisionsObj = {
          schemeName: ladderFormatData[item].schemeName,
          competitionMembershipProductDivisionId:
            divisions[div].competitionMembershipProductDivisionId,
          isChecked: false,
          isDisabled: false,
          divisionsName: divisions[div].divisionName,
        };
        let itemDivisions = ladderFormatData[item].divisions;
        for (let compDivision in itemDivisions) {
          if (
            itemDivisions[compDivision].competitionMembershipProductDivisionId ===
            divisions[div].competitionMembershipProductDivisionId
          ) {
            divisionsObj.competitionMembershipProductDivisionId =
              itemDivisions[compDivision].competitionMembershipProductDivisionId;
            divisionsObj.isChecked = true;
          }
        }
        divisionsArray.push(divisionsObj);
      }
      ladderFormatData[item].divisions = divisionsArray;
    }
    for (let item in ladderFormatData) {
      let itemDivisions = ladderFormatData[item].divisions;
      let schemeName = ladderFormatData[item].schemeName;
      let remainingFormatDiv = ladderFormatData.filter(x => x.schemeName != schemeName);
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

export default ladderFormatReducer;
