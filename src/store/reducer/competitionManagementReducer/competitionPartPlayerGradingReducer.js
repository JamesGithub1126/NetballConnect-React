import ApiConstants from '../../../themes/apiConstants';
import {
  isArrayNotEmpty,
  // isNotNullOrEmptyString
} from '../../../util/helpers';
import ColorsArray from '../../../util/colorsArray';
import { isEmpty, cloneDeep } from 'lodash';
import AppConstants from 'themes/appConstants';

const initialState = {
  onLoad: false,
  onTeamDeleteLoad: false,
  onDivisionChangeLoad: false,
  error: null,
  result: [],
  status: 0,
  getCompPartPlayerGradingSummaryData: [],
  assignedPartPlayerGradingListData: [],
  unassignedPartPlayerGradingListData: {
    teamId: null,
    teamName: 'Unassigned',
    playerCount: 0,
    players: [],
    isChecked: false,
  },
  newTeam: [],
  AllPartPlayerGradingListData: [],
  playerImportData: [],
  teamsImportData: [],
  playerCommentList: [],
  commentLoad: false,
  teamsForPlayerReplication: [],
  replicatePlayerLoad: false,
  deletePlayerLoad: false,
  prevAllPartPlayerGradingListData: [],
  prevAssignedPartPlayerGradingListData: [],
  prevUnassignedPartPlayerGradingListData: [],
  competitionLoad: false,
  competition: null,
  unassignAll: false,
};

var positionColorArray = [];
const colorsArray = ColorsArray;
const unassignTeam = { id: 0, name: AppConstants.unassigned };

function unassignedListDataFormation(data) {
  let assignedPartPlayerGradingListData = [];
  let unassignedPartPlayerGradingListData = {
    teamId: null,
    teamName: 'Unassigned',
    playerCount: 0,
    players: [],
    isChecked: false,
  };
  for (let i in data) {
    if (data[i].teamId !== null) {
      assignedPartPlayerGradingListData.push(data[i]);
    } else {
      unassignedPartPlayerGradingListData = data[i];
    }
  }

  return {
    unassignedPartPlayerGradingListData,
    assignedPartPlayerGradingListData,
  };
}

function updateLinkedPlayerTeam(teamArray, playerId, newTeamId) {
  for (let team of teamArray) {
    for (let player of team.players) {
      let linkedPlayers = player.linkedPlayers;
      for (let lp of linkedPlayers) {
        if (lp.id === playerId) {
          if (newTeamId === 0) {
            lp.teamId = null;
          } else {
            lp.teamId = newTeamId;
          }
        }
      }
    }
  }
}

function updatedAssignData(assignArr, source, destination) {
  let match_Index = assignArr.findIndex(x => x.teamId === null);
  if (match_Index === -1) {
    let unassignedPartPlayerGradingList = {
      teamId: null,
      teamName: 'Unassigned',
      playerCount: 0,
      players: [],
    };
    assignArr.push(unassignedPartPlayerGradingList);
  }
  let sourceTeam = parseInt(source.droppableId) === 0 ? null : JSON.parse(source.droppableId);
  let destinationTeam =
    parseInt(destination.droppableId) === 0 ? null : JSON.parse(destination.droppableId);
  sourceTeam = sourceTeam ? sourceTeam : null;
  destinationTeam = destinationTeam ? destinationTeam : null;
  let swapPlayer;
  assignArr = sortTeamsAndPlayers(assignArr);
  let matchSourceIndex = assignArr.findIndex(x => x.teamId === sourceTeam);
  swapPlayer = assignArr[matchSourceIndex].players[source.index];
  let newTeamId = Number(destination.droppableId);
  updateLinkedPlayerTeam(assignArr, swapPlayer.playerId, newTeamId);
  assignArr[matchSourceIndex].playerCount = parseInt(assignArr[matchSourceIndex].playerCount) - 1;
  assignArr[matchSourceIndex].players.splice(source.index, 1);
  let matchDestinationIndex = assignArr.findIndex(x => x.teamId === destinationTeam);
  assignArr[matchDestinationIndex].playerCount =
    parseInt(assignArr[matchDestinationIndex].playerCount) + 1;
  assignArr[matchDestinationIndex].players.splice(destination.index, 0, swapPlayer);
  let updatedplayerAssignData = unassignedListDataFormation(JSON.parse(JSON.stringify(assignArr)));
  return {
    updatedplayerAssignData,
    assignArr: sortTeamsAndPlayers(assignArr),
  };
}
///sort unassign players
function sortUnassignedPlayers(unassignPlayer) {
  let players = unassignPlayer.players;
  if (players.length > 0) {
    const sortAlphaNumPlayers = (a, b) =>
      a.playerName.localeCompare(b.playerName, 'en', { numeric: true });
    unassignPlayer.players = players.sort(sortAlphaNumPlayers);
  }
  return unassignPlayer;
}

//sort Assign players
function sortTeamsAndPlayers(assignTeam) {
  if (assignTeam.length > 0) {
    for (let i in assignTeam) {
      let players = assignTeam[i].players;
      if (players.length > 0) {
        const sortAlphaNumPlayers = (a, b) =>
          a.playerName.localeCompare(b.playerName, 'en', { numeric: true });
        assignTeam[i].players = players.sort(sortAlphaNumPlayers);
      }
    }
    const sortAlphaNum = (a, b) => a.teamName.localeCompare(b.teamName, 'en', { numeric: true });
    assignTeam.sort(sortAlphaNum);
    let deletedTeams = assignTeam.filter(x => x.isTeamDeleted == 1);
    if (deletedTeams.length > 0) {
      let nonDeletedTeams = assignTeam.filter(x => x.isTeamDeleted == 0);
      assignTeam = [...nonDeletedTeams, ...deletedTeams];
    }
  }
  return assignTeam;
}

function getPositionColor(position) {
  let teamColorTempArray = JSON.parse(JSON.stringify(positionColorArray));
  let index = teamColorTempArray.findIndex(x => x.position === position);
  var color = '#999999';
  if (index !== -1) {
    color = teamColorTempArray[index].colorCode;
  } else {
    const checkColorMatching = color => x => x.colorCode === color;
    for (var i in colorsArray) {
      let colorIndex = teamColorTempArray.findIndex(checkColorMatching(colorsArray[i]));
      if (colorIndex === -1) {
        positionColorArray.push({ position: position, colorCode: colorsArray[i] });
        color = colorsArray[i];
        break;
      }
    }
  }
  return color;
}

// update colour
function updateColor(data) {
  if (data.length > 0) {
    for (let i in data) {
      let team = data[i].players;
      for (let j in team) {
        if (team[j].position1 !== null) {
          team[j].position1Color = getPositionColor(team[j].position1);
        }
        if (team[j].position2 !== null) {
          team[j].position2Color = getPositionColor(team[j].position2);
        }
      }
    }
    return data;
  } else {
    return data;
  }
}

function CompetitionPartPlayerGrading(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_COMPETITION_PART_PLAYER_GRADING_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        importResult: null,
      };

    case ApiConstants.API_COMPETITION_PART_PLAYER_GRADING_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    //competition part player grade calculate player grading summary get API
    case ApiConstants.API_GET_COMPETITION_PART_PLAYER_GRADE_CALCULATE_SUMMARY_LIST_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_COMPETITION_PART_PLAYER_GRADE_CALCULATE_SUMMARY_LIST_SUCCESS:
      let partPlayerSummaryListData = isArrayNotEmpty(action.result) ? action.result : [];
      let finalPartPlayerSummaryListData = [];
      partPlayerSummaryListData.forEach(item => {
        if (item.minimumPlayers) {
          item['noOfTeams'] = Math.floor(item['playerCount'] / item.minimumPlayers);
          item['extraPlayers'] = item['playerCount'] % item.minimumPlayers;
          finalPartPlayerSummaryListData.push(item);
        } else {
          finalPartPlayerSummaryListData.push(item);
        }
      });
      state.getCompPartPlayerGradingSummaryData = finalPartPlayerSummaryListData;
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    //////competition part player grade calculate player grading summary data on Change table input
    case ApiConstants.ONCHANGE_COMPETITION_PART_PLAYER_GRADE_CALCULATE_SUMMARY_DATA:
      let onChangePartPlayerData = JSON.parse(
        JSON.stringify(state.getCompPartPlayerGradingSummaryData),
      );
      if (action.key === 'minimumPlayers') {
        onChangePartPlayerData[action.index]['minimumPlayers'] = action.value;
        onChangePartPlayerData[action.index]['noOfTeams'] =
          action.value.length !== 0
            ? Math.floor(onChangePartPlayerData[action.index]['playerCount'] / action.value)
            : 0;
        onChangePartPlayerData[action.index]['extraPlayers'] =
          action.value.length !== 0
            ? onChangePartPlayerData[action.index]['playerCount'] % action.value
            : 0;
      }
      state.getCompPartPlayerGradingSummaryData = onChangePartPlayerData;
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    //////save the competition part player grade calculate player grading summary or say proposed player grading toggle
    case ApiConstants.API_SAVE_COMPETITION_PART_PLAYER_GRADE_CALCULATE_SUMMARY_LIST_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_SAVE_COMPETITION_PART_PLAYER_GRADE_CALCULATE_SUMMARY_LIST_SUCCESS:
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    /////competition part player grading get API
    case ApiConstants.API_GET_COMPETITION_PART_PLAYER_GRADING_LIST_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_COMPETITION_PART_PLAYER_GRADING_LIST_SUCCESS:
      let partPlayerGradingListData = isArrayNotEmpty(action.result) ? action.result : [];
      let updatedPlayers = updateColor(JSON.parse(JSON.stringify(partPlayerGradingListData)));
      state.AllPartPlayerGradingListData = JSON.parse(JSON.stringify(updatedPlayers));
      let teamData = unassignedListDataFormation(JSON.parse(JSON.stringify(updatedPlayers)));
      state.unassignedPartPlayerGradingListData = sortUnassignedPlayers(
        teamData.unassignedPartPlayerGradingListData,
      );
      state.assignedPartPlayerGradingListData = sortTeamsAndPlayers(
        teamData.assignedPartPlayerGradingListData,
      );
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    //////competition part player grading clear reducer
    case ApiConstants.CLEARING_COMPETITION_PART_PLAYER_GRADING_REDUCER_DATA:
      if (action.key === 'partPlayerGradingListData') {
        state.partPlayerGradingListData = [];
        state.AllPartPlayerGradingListData = [];
        state.unassignedPartPlayerGradingListData = {
          teamId: null,
          teamName: 'Unassigned',
          playerCount: 0,
          players: [],
          isChecked: false,
        };
        state.assignedPartPlayerGradingListData = [];
      }
      if (action.key === 'commentList') {
        state.playerCommentList = [];
      }
      state.teamsForPlayerReplication = [];
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    // competition part player grading add team
    case ApiConstants.API_ADD_NEW_TEAM_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_ADD_NEW_TEAM_SUCCESS:
      let newobj = {
        teamId: action.result.teamId,
        teamName: action.result.teamName,
        playerCount: action.result.playerCount,
        players: action.result.players,
        isChecked: false,
      };
      state.assignedPartPlayerGradingListData.push(newobj);
      state.AllPartPlayerGradingListData.push(newobj);
      let sortData = sortTeamsAndPlayers(state.assignedPartPlayerGradingListData);
      return {
        ...state,
        onLoad: false,
        assignedPartPlayerGradingListData: sortData,
        // newTeam: action.result,
        error: null,
      };
    //
    case ApiConstants.API_DRAG_NEW_TEAM_LOAD:
      if(!action.canUpdateAssignData){
        return {...state, onLoad: true}
      }
      let assignData = JSON.parse(JSON.stringify(state.AllPartPlayerGradingListData));
      let sourceData = updatedAssignData(assignData, action.source, action.destination);
      return {
        ...state,
        AllPartPlayerGradingListData: sourceData.assignArr,
        unassignedPartPlayerGradingListData: sortUnassignedPlayers(
          sourceData.updatedplayerAssignData.unassignedPartPlayerGradingListData,
        ),
        assignedPartPlayerGradingListData: sortTeamsAndPlayers(
          sourceData.updatedplayerAssignData.assignedPartPlayerGradingListData,
        ),
        onLoad: true,
      };

    case ApiConstants.DRAG_PLAYER_END:
      let data = JSON.parse(JSON.stringify(state.AllPartPlayerGradingListData));
      let updatedData = updatedAssignData(data, action.source, action.destination);
      const prevAllData = state.AllPartPlayerGradingListData;
      const prevAssignedData = state.assignedPartPlayerGradingListData;
      const prevUnassignedData = state.unassignedPartPlayerGradingListData;

      return {
        ...state,

        prevAllPartPlayerGradingListData: prevAllData,
        prevAssignedPartPlayerGradingListData: prevAssignedData,
        prevUnassignedPartPlayerGradingListData: prevUnassignedData,

        AllPartPlayerGradingListData:cloneDeep(updatedData.assignArr),
        unassignedPartPlayerGradingListData:
        cloneDeep(updatedData.updatedplayerAssignData.unassignedPartPlayerGradingListData),
        assignedPartPlayerGradingListData:
        cloneDeep(updatedData.updatedplayerAssignData.assignedPartPlayerGradingListData),
      };

    case ApiConstants.UNDO_PREV_DRAG_CHANGE:
      const allGradingListData = cloneDeep(state.prevAllPartPlayerGradingListData);
      const assignedGradingListData = cloneDeep(state.prevAssignedPartPlayerGradingListData);
      const unassignedGradingListData = cloneDeep(state.prevUnassignedPartPlayerGradingListData);

      return {
        ...state,
        AllPartPlayerGradingListData: allGradingListData,
        unassignedPartPlayerGradingListData: unassignedGradingListData,
        assignedPartPlayerGradingListData: assignedGradingListData,
        prevAllPartPlayerGradingListData: [],
        prevUnassignedPartPlayerGradingListData: [],
        prevAssignedPartPlayerGradingListData: [],
      };

    case ApiConstants.API_DRAG_NEW_TEAM_SUCCESS:
      return {
        ...state,
        onLoad: false,
        DropSuccess: action.result,
        error: null,
      };

    case ApiConstants.DRAG_PLAYER_IN_SAME_TEAM:
      let assignPLayerSameTeam = JSON.parse(JSON.stringify(state.AllPartPlayerGradingListData));
      let assignedPLayerSameTeam = updatedAssignData(
        assignPLayerSameTeam,
        action.source,
        action.destination,
      );
      state.AllPartPlayerGradingListData = assignedPLayerSameTeam.assignArr;
      state.unassignedPartPlayerGradingListData = sortUnassignedPlayers(
        assignedPLayerSameTeam.updatedplayerAssignData.unassignedPartPlayerGradingListData,
      );
      state.assignedPartPlayerGradingListData = sortTeamsAndPlayers(
        assignedPLayerSameTeam.updatedplayerAssignData.assignedPartPlayerGradingListData,
      );
      return { ...state };

    case ApiConstants.API_PLAYER_GRADING_COMMENT_LOAD:
      return {
        ...state,
        onLoad: true,
        error: null,
      };

    case ApiConstants.API_PLAYER_GRADING_COMMENT_SUCCESS:
      if (action.teamIndex === null) {
        let matchIndex = state.unassignedPartPlayerGradingListData.players.findIndex(
          x => x.playerId === action.playerId,
        );
        if (matchIndex > -1) {
          state.unassignedPartPlayerGradingListData['players'][matchIndex].comments =
            action.comment;
          state.unassignedPartPlayerGradingListData['players'][matchIndex].commentsCreatedBy =
            action.result.message.commentsCreatedBy;
          state.unassignedPartPlayerGradingListData['players'][matchIndex].commentsCreatedOn =
            action.result.message.commentsCreatedOn;
          state.unassignedPartPlayerGradingListData['players'][matchIndex].isCommentsAvailable = 1;
        }
      } else {
        let assignMatchIndex = state.assignedPartPlayerGradingListData[
          action.teamIndex
        ].players.findIndex(x => x.playerId === action.playerId);
        if (assignMatchIndex > -1) {
          state.assignedPartPlayerGradingListData[action.teamIndex].players[
            assignMatchIndex
          ].comments = action.comment;
          state.assignedPartPlayerGradingListData[action.teamIndex].players[
            assignMatchIndex
          ].isCommentsAvailable = 1;
        }
      }
      state.onLoad = false;
      return {
        ...state,
      };

    case ApiConstants.API_PLAYER_GRADING_SUMMARY_COMMENT_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_PLAYER_GRADING_SUMMARY_COMMENT_SUCCESS:
      let matchindexData = state.getCompPartPlayerGradingSummaryData.findIndex(
        x => x.competitionMembershipProductDivisionId === action.divisionId,
      );
      if (matchindexData > -1) {
        state.getCompPartPlayerGradingSummaryData[matchindexData].comments = action.comment;
        state.getCompPartPlayerGradingSummaryData[matchindexData].commentsCreatedBy =
          action.result.message.commentsCreatedBy;
        state.getCompPartPlayerGradingSummaryData[matchindexData].commentsCreatedOn =
          action.result.message.commentsCreatedOn;
      }
      state.onLoad = false;
      return {
        ...state,
      };
    case ApiConstants.API_COMPETITION_PLAYER_IMPORT_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_COMPETITION_PLAYER_IMPORT_SUCCESS:
      let res = action.result;
      let importResult = null;
      if (!isEmpty(res.error)) {
        importResult = res;
      }
      return {
        ...state,
        playerImportData: res.data,
        status: action.status,
        onLoad: false,
        importResult,
      };
    case ApiConstants.API_COMPETITION_TEAMS_IMPORT_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_COMPETITION_TEAMS_IMPORT_SUCCESS:
      let resTeams = action.result;
      return {
        ...state,
        teamsImportData: resTeams.data,
        status: action.status,
        onLoad: false,
      };

    case ApiConstants.API_COMPETITION_IMPORT_DATA_CLEANUP:
      if (action.key === 'player') {
        state.playerImportData = [];
      } else if (action.key === 'team') {
        state.teamsImportData = [];
      }
      return {
        ...state,
        importResult: null,
      };

    case ApiConstants.API_COMPETITION_TEAM_DELETE_LOAD:
      return { ...state, onTeamDeleteLoad: true };

    case ApiConstants.API_COMPETITION_TEAM_DELETE_SUCCESS:
      return {
        ...state,
        onTeamDeleteLoad: false,
        error: null,
      };
    case ApiConstants.API_CHANGE_COMPETITION_DIVISION_PLAYER_LOAD:
      return { ...state, onDivisionChangeLoad: true };

    case ApiConstants.API_CHANGE_COMPETITION_DIVISION_PLAYER_SUCCESS:
      return {
        ...state,
        onDivisionChangeLoad: false,
      };

    case ApiConstants.UPDATE_PLAYER_GRADING_DATA:
      if (action.key === 'assigned') {
        let asssignPlayers = sortTeamsAndPlayers(action.data);
        state.assignedPartPlayerGradingListData = asssignPlayers;
      } else if (action.key == 'unAssigned') {
        state.unassignedPartPlayerGradingListData = sortUnassignedPlayers(action.data);
      }
      return { ...state };

    case ApiConstants.API_GET_COMMENT_LIST_LOAD:
      return {
        ...state,
        onLoad: true,
        commentLoad: true,
      };

    case ApiConstants.API_GET_COMMENT_LIST_SUCCESS:
      return {
        ...state,
        onLoad: false,
        playerCommentList: action.result ? action.result : [],
        commentLoad: false,
      };

    case ApiConstants.API_EXPORT_PLAYER_GRADES_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_EXPORT_PLAYER_GRADES_SUCCESS:
      return {
        ...state,
        onLoad: false,
      };

    case ApiConstants.API_GET_TEAMS_FOR_PLAYER_REPLICATION_LOAD:
      return {
        ...state,
        teamsForPlayerReplication: [],
      };

    case ApiConstants.API_GET_TEAMS_FOR_PLAYER_REPLICATION_SUCCESS:
      return {
        ...state,
        teamsForPlayerReplication: [unassignTeam, ...action.result],
      };

    case ApiConstants.API_REPLICATE_PLAYER_LOAD:
      return {
        ...state,
        replicatePlayerLoad: true,
      };

    case ApiConstants.API_REPLICATE_PLAYER_SUCCESS:
      return {
        ...state,
        replicatePlayerLoad: false,
      };
    case ApiConstants.API_DELETE_PLAYER_LOAD:
      return {
        ...state,
        deletePlayerLoad: true,
      };
    case ApiConstants.API_DELETE_PLAYER_SUCCESS:
      return {
        ...state,
        deletePlayerLoad: false,
      };
    case ApiConstants.API_GET_COMP_FOR_PLAYER_GRADING_LOAD:
      return {
        ...state,
        competitionLoad: true,
      }
    case ApiConstants.API_GET_COMP_FOR_PLAYER_GRADING_SUCCESS: 
    return {
      ...state,
      competition: action.result,
      competitionLoad: false,
    }
    default:
      return state;
  }
}

export default CompetitionPartPlayerGrading;
