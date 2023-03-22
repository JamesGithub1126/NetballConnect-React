import ApiConstants from 'themes/apiConstants';

const coachObj = {
  id: null,
  firstName: '',
  lastName: '',
  mobileNumber: '',
  email: '',
  teams: null,
};

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  coachdata: coachObj,
  teamId: null,
  teamResult: [],
  coachRadioBtn: 'new',
  coachesResult: [],
  mainCoachListResult: [],
  exsitingManagerId: null,
  loading: false,
  teams: null,
  onLoadSearch: false,
  selectedteam: [],
  currentPage: null,
  totalCount: null,
  coachListActionObject: null,
};

function getTeamObj(teamSelectId, teamArr) {
  let teamObj = [];
  for (let i in teamArr) {
    for (let j in teamSelectId) {
      if (teamSelectId[j] === teamArr[i].id) {
        teamObj.push({
          name: teamArr[i].name,
          id: teamArr[i].id,
        });
        break;
      }
    }
  }
  return teamObj;
}

function generateTeamId(teamIdArr) {
  let teamId = [];
  for (let i in teamIdArr) {
    if (teamIdArr[i].entityTypeId === 3) teamId.push(teamIdArr[i].entityId);
  }
  return teamId;
}

// function getSelectedTeam(coachId, CoachListArray) {
//     let teamObj = null;
//     for (let i in CoachListArray) {
//         if (coachId === CoachListArray[i].id) {
//             teamObj = (CoachListArray[i].linkedEntity);
//         }
//     }
//     return teamObj;
// }

// function generateSelectedTeam(selectedTeams, teamList) {
//     let teamIds = [];
//     for (let i in teamList) {
//         for (let j in selectedTeams) {
//             if (selectedTeams[j].entityId === teamList[i].id) {
//                 teamIds.push(selectedTeams[j].entityId);
//             }
//         }
//     }
//     return teamIds;
// }

function liveScoreCoachState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_COACH_LIST_LOAD:
      return { ...state, onLoad: true, coachListActionObject: action };

    case ApiConstants.API_LIVE_SCORE_COACH_LIST_SUCCESS:
      let user_Data = action.result.userData ? action.result.userData : action.result;

      return {
        ...state,
        onLoad: false,
        coachesResult: user_Data,
        mainCoachListResult: user_Data,
        currentPage: action.result.page ? action.result.page.currentPage : null,
        totalCount: action.result.page ? action.result.page.totalCount : null,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_TEAM_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_TEAM_SUCCESS:
      return {
        ...state,
        onLoad: false,
        loading: false,
        teamResult: action.result,
      };

    case ApiConstants.API_LIVE_SCORE_UPDATE_COACH:
      if (action.key === 'teamId') {
        state.coachdata['teams'] = getTeamObj(action.data, state.teamResult);
        state.teamId = action.data;
      } else if (action.key === 'coachRadioBtn') {
        state.coachRadioBtn = action.data;
        state.exsitingManagerId = null;
      } else if (action.key === 'coachSearch') {
        state.exsitingManagerId = action.data;
        // let index = state.coachesResult.findIndex(x => x.id == action.data);
        // let selectedTeam = [];
        // if (index > -1) {
        //     selectedTeam = state.coachesResult[index].linkedEntity;
        // }
        // state.selectedteam = getSelectedTeam(action.data,state.coachesResult);
        // let teamIds = generateTeamId(selectedTeam);
        // state.teamId = teamIds;
        // let coach_TeamObj = getTeamObj(teamIds, state.teamResult);
        // state.coachdata["teams"] = coach_TeamObj;
      } else if (action.key === 'isEditCoach') {
        state.onLoad = true;
        state.coachdata.id = action.data.id;
        state.coachdata.firstName = action.data.firstName;
        state.coachdata.lastName = action.data.lastName;
        state.coachdata.mobileNumber = action.data.mobileNumber;
        state.coachdata.email = action.data.email;
        state.teamId = generateTeamId(action.data.linkedEntity);
        state.coachdata['teams'] = getTeamObj(state.teamId, state.teamResult);
        state.coachRadioBtn = 'new';
      } else if (action.key === 'isAddCoach') {
        state.coachdata = coachObj;
        state.coachdata.id = null;
        state.teamId = [];
        state.coachRadioBtn = 'new';
      } else {
        state.coachdata[action.key] = action.data;
      }
      return {
        ...state,
        onLoad: false,
        loading: false,
      };

    case ApiConstants.API_LIVE_SCORE_COACH_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        loading: false,
      };

    case ApiConstants.API_LIVE_SCORE_COACH_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        loading: false,
      };

    case ApiConstants.API_LIVE_SCORE_ADD_EDIT_COACH_LOAD:
      return { ...state, loading: true };

    case ApiConstants.API_LIVE_SCORE_ADD_EDIT_COACH_SUCCESS:
      return { ...state, loading: false };

    case ApiConstants.API_LIVESCORE_COACH_SEARCH_LOAD:
      return { ...state, onLoadSearch: true };

    case ApiConstants.API_LIVESCORE_COACH_SEARCH_SUCCESS:
      return {
        ...state,
        onLoadSearch: false,
        coachesResult: action.result,
        status: action.status,
      };

    case ApiConstants.CLEAR_LIVESCORE_MANAGER:
      return {
        ...state,
        // coachesResult: state.mainCoachListResult,
      };

    case ApiConstants.API_LIVE_SCORE_COACH_IMPORT_LOAD:
      return {
        ...state,
        onLoad: true,
        importResult: null,
      };

    case ApiConstants.API_LIVE_SCORE_COACH_IMPORT_SUCCESS:
      return {
        ...state,
        onLoad: false,
        importResult: action.result,
      };

    case ApiConstants.API_LIVE_SCORE_COACH_IMPORT_RESET:
      return {
        ...state,
        importResult: null,
      };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.coachListActionObject = null;
      return { ...state, onLoad: false };

    case ApiConstants.SET_LIVE_SCORE_COACHES_LIST_PAGE_SIZE:
      return {
        ...state,
        pageSize: action.pageSize,
      };

    case ApiConstants.SET_LIVE_SCORE_COACHES_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        currentPage: action.pageNum,
      };

    default:
      return state;
  }
}

export default liveScoreCoachState;
