import ApiConstants from '../../../themes/apiConstants';
import liveScoreLadderSettingModal from '../../objectModel/liveScoreLadderSettingModal';
// import { stat } from 'fs';
// import { getLiveScoreCompetition } from '../../../util/sessionStorage';
import { deepCopyFunction } from '../../../util/helpers';
const initialState = {
  onLoad: false,
  error: null,
  result: null,
  status: 0,
  matchResult: [],
  postData: [],
  loader: false,
  ladders: [],
  divisions: [],
  defaultLadders: [],
  rounds: [],
  drawSettings: {
    hideAllDivisons: false,
    hiddenDivisionIds: [],
    hideAllRounds: false,
    hiddenRoundNames: [],
  },
  hideLadderSettings: {
    hideAllDivisons: false,
    hiddenDivisionIds: [],
    hideAllRounds: false,
    hiddenRoundNames: [],
  },
};

function getResultValues(data, matchData) {
  for (let i in matchData) {
    for (let j in data) {
      if (data[j].resultTypeId === matchData[i].id) {
        matchData[i]['points'] = data[j].points;
        break;
      }
    }
  }
  return matchData;
}

// function matchPostArray(id, data) {

//     let object = {
//         status: false,
//         result: null,
//     }

//     for (let i in data) {
//         if (data[i].resultTypeId === id) {
//             object = {
//                 status: true,
//                 result: data[i],
//             }
//             break
//         }

//     }

//     return object
// }

// function setPostData(selectedData, matcheResults, compId) {
//     let postArray = []
//     let object = null
//     for (let i in matcheResults) {
//         let postResultObject = matchPostArray(matcheResults[i].id, selectedData)
//         if (postResultObject.status) {
//             object = {
//                 competitionId: postResultObject.result.competitionId,
//                 resultTypeId: postResultObject.result.resultTypeId,
//                 points: postResultObject.result.points,
//             }
//         } else {
//             object = {
//                 competitionId: compId,
//                 resultTypeId: matcheResults[i].id,
//                 points: 0,
//             }

//         }

//         postArray.push(object)
//     }

//     return postArray
// }

function disableAddedDivisions(ladders, divisions) {
  resetDivisionDisabled(ladders, divisions);
  for (let item in ladders) {
    let itemDivisions = ladders[item].divisions;
    let ladderFormatId = ladders[item].ladderFormatId;
    let remainingFormatDiv = ladders.filter(x => x.ladderFormatId !== ladderFormatId);

    for (let remDiv in remainingFormatDiv) {
      let selectedDivisions = remainingFormatDiv[remDiv].selectedDivisions;
      for (let i in selectedDivisions) {
        for (let j in itemDivisions) {
          if (itemDivisions[j].divisionId === selectedDivisions[i]) {
            itemDivisions[j].isDisabled = true;
            let division = divisions.find(x => x.divisionId === itemDivisions[j].divisionId);
            division['isDisabled'] = true;
          }
        }
      }
    }

    let currSelDivisions = ladders[item].selectedDivisions;
    for (let i in currSelDivisions) {
      for (let j in divisions) {
        if (divisions[j].divisionId === currSelDivisions[i]) {
          divisions[j]['isDisabled'] = true;
        }
      }
    }
  }
}

function resetDivisionDisabled(ladders, divisions) {
  for (let item in ladders) {
    let itemDivisions = ladders[item].divisions;
    for (let j in itemDivisions) {
      itemDivisions[j].isDisabled = false;
    }
  }

  for (let item in divisions) {
    divisions[item]['isDisabled'] = false;
  }
}

function liveScoreLadderSettingReducer(state = initialState, action) {
  switch (action.type) {
    //LIVESCORE Ladder Setting Get Match Result
    case ApiConstants.API_LADDER_SETTING_MATCH_RESULT_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LADDER_SETTING_MATCH_RESULT_SUCCESS:
      let matchResult = liveScoreLadderSettingModal.getLadderSettingData(action.result);
      let matchData = liveScoreLadderSettingModal.getLadderData(action.result);

      return {
        ...state,
        onLoad: false,
        matchResult: matchResult,
        postData: matchData,
      };

    //LIVESCORE Ladder Setting Get Data
    case ApiConstants.API_LADDER_SETTING_GET_DATA_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LADDER_SETTING_GET_DATA_SUCCESS:
      let ladderRes = action.result;
      disableAddedDivisions(ladderRes.ladders, ladderRes.divisions);
      return {
        ...state,
        onLoad: false,
        ladders: ladderRes.ladders,
        divisions: ladderRes.divisions,
        defaultLadders: ladderRes.defaultLadders,
        rounds: ladderRes.rounds,
        drawSettings: ladderRes.drawSettings,
        hideLadderSettings: ladderRes.hideLadderSettings,
      };

    //// Update Ladder Setting
    case ApiConstants.UPDATE_LADDER_SETTING:
      if (action.key === 'addLadder') {
        let ladder = deepCopyFunction(state.defaultLadders.find(x => x));

        let formatId = -new Date().getTime();
        ladder.ladderFormatId = formatId;
        ladder.isAllDivision = Number(0);
        state.ladders.push(ladder);
        disableAddedDivisions(state.ladders, state.divisions);
      } else if (action.key === 'isAllDivision') {
        let ladder = state.ladders[action.index];
        if (action.data) {
          let arr = [];
          state.divisions.forEach(item => {
            arr.push(item.divisionId);
          });
          ladder.selectedDivisions = [];
          ladder.selectedDivisions.push(...arr);
          state.ladders = [];
          state.ladders.push(ladder);
        }
        ladder[action.key] = action.data;
        disableAddedDivisions(state.ladders, state.divisions);
      } else if (action.key === 'deleteLadder') {
        state.ladders.splice(action.index, 1);
        disableAddedDivisions(state.ladders, state.divisions);
      } else if (action.key === 'selectedDivisions') {
        state.ladders[action.index][action.key] = action.data;
        state.ladders[action.index]['isAllDivision'] = false;
        disableAddedDivisions(state.ladders, state.divisions);
      } else if (action.key === 'resultTypes') {
        state.ladders[action.index]['settings'][action.subIndex][action.subKey] = action.data;
      } else {
        state.ladders[action.index][action.key] = action.data;
      }

      return {
        ...state,
      };

    //LIVESCORE Ladder Setting Post Data
    case ApiConstants.API_LADDER_SETTING_POST_DATA_LOAD:
      return { ...state, loader: true };

    case ApiConstants.API_LADDER_SETTING_POST_DATA_SUCCESS:
      let receivePostData = getResultValues(action.getData, state.matchResult);
      return {
        ...state,
        loader: false,
        matchResult: receivePostData,
      };

    case ApiConstants.API_LIVE_SCORE_LADDER_SETTING_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };
    case ApiConstants.API_LIVE_SCORE_LADDER_SETTING_ERROR:
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

export default liveScoreLadderSettingReducer;
