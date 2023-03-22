import { compareSortOrder } from 'util/drawUtil';
import ApiConstants from '../../../themes/apiConstants';
import {
  isArrayNotEmpty,
  // isNotNullOrEmptyString
} from '../../../util/helpers';

const initialState = {
  onLoad: false,
  onSummaryLoad: false,
  onTeamDeleteLoad: false,
  updateGradeOnLoad: false,
  onDivisionChangeLoad: false,
  error: null,
  result: [],
  status: 0,
  getCompOwnProposedTeamGradingData: [],
  compFinalTeamGradingFinalGradesData: [],
  getPartProposedTeamGradingData: [],
  ownTeamGradingSummaryGetData: [],
  ownTeamGradingOrganisationsData: [],
  finalsortOrderArray: [],
  getFinalGradesListData: [],
  teamRanks: [],
};

function checkGradesValue(gradeId, gradingData) {
  let object = {
    status: false,
    result: null,
  };
  for (let j in gradingData) {
    if (gradingData[j].sortOrder == gradeId) {
      object = {
        status: true,
        result: gradingData[j],
      };

      break;
    }
  }

  return object;
}

function ownTeamGradingSummaryFunction(ownTeamGradingSummaryData, sortOrderArray) {
  let defaultObj = {
    competitionDivisionGradeId: null,
    gradeName: null,
    teamCount: null,
    sortOrder: null,
    drawCount: null,
  };
  for (let i in ownTeamGradingSummaryData) {
    let gradesArray = [];
    for (let j in sortOrderArray) {
      let checkGradesArray = checkGradesValue(
        sortOrderArray[j],
        ownTeamGradingSummaryData[i].grades,
      );
      let newValue =
        ownTeamGradingSummaryData[i].finalGradeOrganisationCount +
        '/' +
        ownTeamGradingSummaryData[i].totalOrganisationCount;
      ownTeamGradingSummaryData[i].statusData = newValue;
      if (checkGradesArray.status) {
        defaultObj = {
          competitionDivisionGradeId: checkGradesArray.result.competitionDivisionGradeId,
          gradeName: checkGradesArray.result.gradeName,
          teamCount: checkGradesArray.result.teamCount,
          sortOrder: checkGradesArray.result.sortOrder,
          gradeRefId: checkGradesArray.result.gradeRefId,
          teamRanked: checkGradesArray.result.teamRanked,
          drawCount: checkGradesArray.result.drawCount,
        };
      } else {
        defaultObj = {
          competitionDivisionGradeId: null,
          gradeName: null,
          teamCount: null,
          sortOrder: null,
          drawCount: null,
        };
      }

      gradesArray.push(defaultObj);
    }
    ownTeamGradingSummaryData[i].grades = gradesArray;
    for (let k in gradesArray) {
      ownTeamGradingSummaryData[i][`grades${k}`] = gradesArray[k];
    }
  }
  return ownTeamGradingSummaryData;
}

function getUpdatedHistoryData(data) {
  if (data.length > 0) {
    for (let i in data) {
      let historyData = data[i].playerHistory;
      for (let j in historyData) {
        historyData[j]['hoverVisible'] = false;
      }
    }
    return data;
  } else {
    return data;
  }
}

function sortOrderArray(ownTeamGradingSummaryData) {
  let sortOrderArray = [];
  if (ownTeamGradingSummaryData.length > 0) {
    ownTeamGradingSummaryData.forEach(item => {
      let grades = item.grades;
      grades.forEach(gradeItem => {
        let sortOrder = gradeItem.sortOrder === null ? null : parseInt(gradeItem.sortOrder);
        sortOrderArray.indexOf(sortOrder) === -1 && sortOrderArray.push(sortOrder);
      });
    });
    sortOrderArray.sort(sortOrder(true));
    if (sortOrderArray[0] === -1) {
      sortOrderArray.shift();
      sortOrderArray.push(-1);
    }
  }
  return sortOrderArray;
}
function sortOrder(ascending) {
  return function (a, b) {
    if (a === b) {
      return 0;
    } else if (a === null) {
      return 1;
    } else if (b === null) {
      return -1;
    } else if (ascending) {
      return a < b ? -1 : 1;
    } else {
      return a < b ? 1 : -1;
    }
  };
}

function getProposedTeamGradingData(data) {
  if (data.length > 0) {
    for (let i in data) {
      let playerDataHistory = data[i].playerHistory;
      for (let j in playerDataHistory) {
        playerDataHistory[j]['hoverVisible'] = false;
      }
    }
    return data;
  } else {
    return data;
  }
}

function CompetitionOwnTeamGrading(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_COMPETITION_OWN_TEAM_GRADING_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_COMPETITION_OWN_TEAM_GRADING_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    //competition  own final team grading data get api
    case ApiConstants.API_GET_COMPETITION_OWN_PROPOSED_TEAM_GRADING_LIST_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_COMPETITION_OWN_PROPOSED_TEAM_GRADING_LIST_SUCCESS:
      let finalTeamGradingData = action.result;
      let teamGradingData = isArrayNotEmpty(finalTeamGradingData.teamGradings)
        ? finalTeamGradingData.teamGradings
        : [];
      let registrationInvitees = isArrayNotEmpty(finalTeamGradingData.registrationInvitees)
        ? finalTeamGradingData.registrationInvitees
        : [];
      if (isArrayNotEmpty(teamGradingData)) {
        teamGradingData.forEach(item => {
          item['isDirectRegistration'] = registrationInvitees.length > 0 ? 1 : 0;
        });
      }
      let teamGradingDataArr = isArrayNotEmpty(finalTeamGradingData.teamGradings)
        ? finalTeamGradingData.teamGradings
        : [];
      let updatedTeamGradingData = getUpdatedHistoryData(teamGradingDataArr);
      let sourceFinalGrades = isArrayNotEmpty(finalTeamGradingData.finalGrades)
        ? finalTeamGradingData.finalGrades
        : [];
      sourceFinalGrades.sort(function (a, b) {
        var nameA = a.name.toUpperCase(); // ignore upper and lowercase
        var nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA.length < nameB.length) {
          return -1;
        } else if (nameA.length > nameB.length) {
          return 1;
        }
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });

      return {
        ...state,
        getCompOwnProposedTeamGradingData: updatedTeamGradingData,
        compFinalTeamGradingFinalGradesData: sourceFinalGrades,
        teamRanks: isArrayNotEmpty(finalTeamGradingData.teamRanks)
          ? finalTeamGradingData.teamRanks
          : [],
        onLoad: false,
        error: null,
      };

    ////////competition own final team grading data on Change table
    case ApiConstants.ONCHANGE_COMPETITION_OWN_PROPOSED_TEAM_GRADING_DATA:
      let finalGradingOnChangeData = state.getCompOwnProposedTeamGradingData;

      let finalGrades = state.compFinalTeamGradingFinalGradesData;
      let record = action.record;
      let obj = finalGrades.find(x => x.gradeRefId === action.value);
      if (action.key === 'sortOrder') {
        // let oldval = record[action.key];
        // record[action.key] = oldval > action.value ? action.value - 1 : action.value + 1;
        let teamIndex = finalGradingOnChangeData.indexOf(record);
        finalGradingOnChangeData.splice(teamIndex, 1);
        finalGradingOnChangeData.splice(action.value - 1, 0, record);
        finalGradingOnChangeData.forEach((x, index) => {
          x.sortOrder = index + 1;
        });
      } else if (action.key === 'addBye') {
        if (finalGradingOnChangeData.length) {
          const otherTeam = finalGradingOnChangeData[0];

          finalGradingOnChangeData.push({
            ...otherTeam,
            teamId: -1,
            teamName: 'Bye',
            sortOrder: finalGradingOnChangeData.length + 1,
            finalGradeId: action.record.gradeRefId,
            proposedGradeRefId: action.record.gradeRefId,
          });
        }
      } else if (action.key === 'removeTeam') {
        finalGradingOnChangeData.splice(action.value, 1);
        finalGradingOnChangeData.forEach((x, index) => {
          x.sortOrder = index + 1;
        });
      }  else if (action.key === 'actionType') {
        if (action.value === 'IsActive') {
          record[action.key] = action.value;
          record['isActive'] = 0;
          record['delIndicationMsg'] = 'Marked as deleted';
          record['sortOrder'] = finalGradingOnChangeData.length + 1;
          finalGradingOnChangeData.sort(compareSortOrder);
          finalGradingOnChangeData.forEach((x, index) => {
            x.sortOrder = index + 1;
          });
        } else {
          record[action.key] = action.value;
          record['isActive'] = 1;
          record['delIndicationMsg'] = '';
        }
      } else {
        record[action.key] = action.value;
        if (action.key === 'finalGradeId') {
          record['finalGradeName'] = obj.name;
        }
      }

      state.getCompOwnProposedTeamGradingData = JSON.parse(
        JSON.stringify(finalGradingOnChangeData),
      );

      return {
        ...state,
        onLoad: false,
        error: null,
      };

    ////////competition save own final team grading table data
    case ApiConstants.API_SAVE_COMPETITION_OWN_FINAL_TEAM_GRADING_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_SAVE_COMPETITION_OWN_FINAL_TEAM_GRADING_SUCCESS:
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    //////// /clear competition  team grading reducer data
    case ApiConstants.OWN_COMP_TEAM_GRADING_CLEARING_PARTICULAR_REDUCER_DATA:
      if (action.key === 'finalTeamGrading') {
        state.getCompOwnProposedTeamGradingData = [];
        state.compFinalTeamGradingFinalGradesData = [];
      }
      if (action.key === 'getPartProposedTeamGradingData') {
        state.getPartProposedTeamGradingData = [];
      }
      if (action.key === 'ownTeamGradingSummaryGetData') {
        state.ownTeamGradingSummaryGetData = [];
        state.finalsortOrderArray = [];
      }
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    //competition  own final team grading data get api
    case ApiConstants.API_GET_COMPETITION_PART_PROPOSED_TEAM_GRADING_LIST_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_COMPETITION_PART_PROPOSED_TEAM_GRADING_LIST_SUCCESS:
      let partProposedTeamGradingData = action.result;
      let getpartProposedTeamData = isArrayNotEmpty(partProposedTeamGradingData)
        ? partProposedTeamGradingData
        : [];
      let proposedTeamGradingData = getProposedTeamGradingData(getpartProposedTeamData);
      return {
        ...state,
        getPartProposedTeamGradingData: proposedTeamGradingData,
        onLoad: false,
        error: null,
      };

    ////////competition participate in proposed team grading data on Change table
    case ApiConstants.ONCHANGE_COMPETITION_PART_PROPOSED_TEAM_GRADING_DATA:
      let partProposedTeamGradingOnchangeData = state.getPartProposedTeamGradingData;
      let record1 = action.record;
      if (action.key === 'proposedGradeRefId') {
        record1['proposedGradeRefId'] = action.value;
        let grade = state.getFinalGradesListData.find(x => x.gradeRefId == action.value);
        if (grade) {
          record1.proposedGradeName = grade.name;
        }
      }
      if (action.key === 'teamName') {
        record1['teamName'] = action.value;
      }
      state.getPartProposedTeamGradingData = JSON.parse(
        JSON.stringify(partProposedTeamGradingOnchangeData),
      );
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    ////////competition save own final team grading table data
    case ApiConstants.API_SAVE_COMPETITION_PART_PROPOSED_TEAM_GRADING_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_SAVE_COMPETITION_PART_PROPOSED_TEAM_GRADING_SUCCESS:
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    ///////save the changed grade name in own competition team grading summary data
    case ApiConstants.API_SAVE_UPDATED_GRADE_NAME_TEAM_GRADING_SUMMARY_LOAD:
      return { ...state, onLoad: true, error: null, updateGradeOnLoad: true };

    case ApiConstants.API_SAVE_UPDATED_GRADE_NAME_TEAM_GRADING_SUMMARY_SUCCESS:
      return {
        ...state,
        onLoad: false,
        error: null,
        updateGradeOnLoad: false,
      };

    ///////////////team grading summary publish
    case ApiConstants.API_PUBLISH_TEAM_GRADING_SUMMARY_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_PUBLISH_TEAM_GRADING_SUMMARY_SUCCESS:
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    ///////get the own team grading summary listing data
    case ApiConstants.API_GET_COMPETITION_OWN_TEAM_GRADING_SUMMARY_LIST_LOAD:
      return { ...state, onSummaryLoad: true, error: null };

    case ApiConstants.API_GET_COMPETITION_OWN_TEAM_GRADING_SUMMARY_LIST_SUCCESS:
      let ownTeamGradingSummaryData = isArrayNotEmpty(action.result) ? action.result : [];
      let finalsortOrderArray = sortOrderArray(ownTeamGradingSummaryData);
      let teamGradingFinalData = ownTeamGradingSummaryFunction(
        ownTeamGradingSummaryData,
        finalsortOrderArray,
      );
      state.ownTeamGradingSummaryGetData = teamGradingFinalData;
      state.finalsortOrderArray = finalsortOrderArray;
      return {
        ...state,
        onSummaryLoad: false,
        error: null,
      };

    case ApiConstants.API_GET_COMPETITION_OWN_TEAM_GRADING_ORGANISATIONS_LIST_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_COMPETITION_OWN_TEAM_GRADING_ORGANISATIONS_LIST_SUCCESS:
      let ownTeamGradingOrganisationsData = isArrayNotEmpty(action.result) ? action.result : [];
      state.ownTeamGradingOrganisationsData = ownTeamGradingOrganisationsData;
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    ////////competition own team grading summary listing  data on Change table
    case ApiConstants.ONCHANGE_COMPETITION_TEAM_GRADING_SUMMARY_DATA:
      let ownTeamGradingSummaryGetTableData = JSON.parse(
        JSON.stringify(state.ownTeamGradingSummaryGetData),
      );
      if (action.key === 'ownTeamGradingSummaryGetData') {
        ownTeamGradingSummaryGetTableData.length > 0 &&
          ownTeamGradingSummaryGetTableData.forEach(item => {
            let gradeIndex = item.grades.findIndex(
              x => x.competitionDivisionGradeId === action.index,
            );
            if (gradeIndex >= 0) {
              let gradesParameter = `grades${gradeIndex}`;
              item[gradesParameter].gradeName = action.value;
            }
          });
      }
      state.ownTeamGradingSummaryGetData = ownTeamGradingSummaryGetTableData;
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    ////////////get the competition final grades on the basis of competition and division
    case ApiConstants.API_GET_COMPETITION_FINAL_GRADES_LIST_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_COMPETITION_FINAL_GRADES_LIST_SUCCESS:
      return {
        ...state,
        getFinalGradesListData: isArrayNotEmpty(action.result) ? action.result : [],
        onLoad: false,
        error: null,
      };

    case ApiConstants.API_TEAM_GRADING_COMMENT_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_TEAM_GRADING_COMMENT_SUCCESS:
      let gradingIndex = state.getCompOwnProposedTeamGradingData.findIndex(
        x => x.teamId === action.teamId,
      );
      if (gradingIndex > -1) {
        state.getCompOwnProposedTeamGradingData[gradingIndex].responseComments = action.comment;
        state.getCompOwnProposedTeamGradingData[gradingIndex].responseCommentsCreatedBy =
          action.result.message.responseCommentsCreatedBy;
        state.getCompOwnProposedTeamGradingData[gradingIndex].responseCommentsCreatedOn =
          action.result.message.responseCommentsCreatedOn;
        state.getCompOwnProposedTeamGradingData[gradingIndex].isCommentsAvailable = 1;
      }
      return {
        ...state,
        onLoad: false,
      };

    case ApiConstants.API_PART_TEAM_GRADING_COMMENT_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_PART_TEAM_GRADING_COMMENT_SUCCESS:
      let partTeamIndex = state.getPartProposedTeamGradingData.findIndex(
        x => x.teamId === action.teamId,
      );
      if (partTeamIndex > -1) {
        state.getPartProposedTeamGradingData[partTeamIndex].comments = action.comment;
        state.getPartProposedTeamGradingData[partTeamIndex].commentsCreatedBy =
          action.result.message.commentsCreatedBy;
        state.getPartProposedTeamGradingData[partTeamIndex].commentsCreatedOn =
          action.result.message.commentsCreatedOn;
        state.getPartProposedTeamGradingData[partTeamIndex].isCommentsAvailable = 1;
      }
      return { ...state, onLoad: false };

    case ApiConstants.changeHoverProposedTeamGrading:
      state.getCompOwnProposedTeamGradingData[action.tableIndex].playerHistory[
        action.historyIndex
      ].hoverVisible = action.key;
      return { ...state };

    case ApiConstants.changeHoverPartProposedTeamGrading:
      state.getPartProposedTeamGradingData[action.tableIndex].playerHistory[
        action.historyIndex
      ].hoverVisible = action.key;
      return { ...state };

    case ApiConstants.API_COMPETITION_TEAM_DELETE_ACTION_LOAD:
      return { ...state, onTeamDeleteLoad: true };

    case ApiConstants.API_COMPETITION_TEAM_DELETE_ACTION_SUCCESS:
      return {
        ...state,
        onTeamDeleteLoad: false,
        error: null,
      };

    case ApiConstants.API_EXPORT_FINAL_TEAMS_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_EXPORT_FINAL_TEAMS_SUCCESS:
      return {
        ...state,
        onLoad: false,
      };
    case ApiConstants.API_EXPORT_PROPOSED_TEAMS_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_EXPORT_PROPOSED_TEAMS_SUCCESS:
      return {
        ...state,
        onLoad: false,
      };
    case ApiConstants.API_EXPORT_FINAL_PLAYERS_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_EXPORT_FINAL_PLAYERS_SUCCESS:
      return {
        ...state,
        onLoad: false,
      };
    case ApiConstants.API_EXPORT_PROPOSED_PLAYERS_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_EXPORT_PROPOSED_PLAYERS_SUCCESS:
      return {
        ...state,
        onLoad: false,
      };
    case ApiConstants.API_CHANGE_COMPETITION_DIVISION_TEAM_LOAD:
      return { ...state, onDivisionChangeLoad: true };

    case ApiConstants.API_CHANGE_COMPETITION_DIVISION_TEAM_SUCCESS:
      return {
        ...state,
        onDivisionChangeLoad: false,
      };

    default:
      return state;
  }
}

export default CompetitionOwnTeamGrading;
