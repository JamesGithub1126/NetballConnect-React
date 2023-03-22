import ApiConstants from '../../../themes/apiConstants';
import { getLiveScoreCompetition, getOrganisationData } from '../../../util/sessionStorage';
let scorerObj = {
  id: null,
  firstName: '',
  lastName: '',
  emailAddress: '',
  contactNo: '',
  teams: [],
};

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  scorerListResult: [],
  scorerListPage: 0,
  scorerListTotalCount: 0,
  scorerData: scorerObj,
  scorerRadioBtn: 'new',
  existingScorerId: null,
  teamResult: [],
  allTeamData: [],
  teamId: null,
  assignMatches: [],
  assignMatchListPage: 1,
  assignMatchListPageSize: 10,
  assignMatchTotalCount: 1,
  searchScorer: [],
  onLoadSearch: false,
  scorerActionObject: null,
};

// function genrateTeamId(teamIdArr) {
//     let teamId = []
//     for (let i in teamIdArr) {
//         teamId.push(teamIdArr[i].name)
//     }
//     return teamId
// }

function getTeamObj(teamSelectId, teamArr) {
  let teamObj = [];
  let obj = '';
  for (let i in teamArr) {
    for (let j in teamSelectId) {
      if (teamSelectId[j] === teamArr[i].id) {
        obj = {
          name: teamArr[i].name,
          id: teamArr[i].id,
        };
        teamObj.push(obj);
      }
    }
  }

  return teamObj;
}

function getNameWithNumber(name, number) {
  let numberLength =
    number.length < 10
      ? new Array(10 - 4).join('x') + number.substr(number - 5, 4)
      : new Array(number.length - 4).join('x') + number.substr(number.length - 5, 4);
  let newName = name + '-' + numberLength;
  return newName;
}

function updateScorerData(result) {
  if (result.length > 0) {
    for (let i in result) {
      let number = JSON.stringify(result[i].mobileNumber);
      let name = result[i].firstName + ' ' + result[i].lastName;
      let nameWithNumber = getNameWithNumber(name, number);
      result[i].nameWithNumber = nameWithNumber;
    }
  }
  return result;
}

function liveScoreScorerState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_SCORER_LIST_LOAD:
      return { ...state, onLoad: true, scorerActionObject: action };

    case ApiConstants.API_LIVE_SCORE_SCORER_LIST_SUCCESS:
      let scorerList = action.result.users
        ? updateScorerData(action.result.users)
        : updateScorerData(action.result);
      // let teamData = getTeamData(scorerList.users)
      return {
        ...state,
        onLoad: false,
        status: action.status,
        scorerListResult: scorerList,
        scorerListCurrentPage: action.result.page ? action.result.page.currentPage : null,
        scorerListTotalCount: action.result.page ? action.result.page.totalCount : null,
      };

    case ApiConstants.API_LIVE_SCORE_TEAM_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_TEAM_SUCCESS:
      const { competitionOrganisation, organisationId } = getLiveScoreCompetition()
        ? JSON.parse(getLiveScoreCompetition())
        : {};
      let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
      const orgItem = getOrganisationData();
      const userOrganisationId = orgItem ? orgItem.organisationId : 0;
      let liveScoreCompIsParent = userOrganisationId === organisationId;
      let teamsArray = JSON.parse(JSON.stringify(action.result));
      // state.allTeamData = JSON.parse(JSON.stringify(action.result))
      let teamObject = {
        name: 'All Teams',
        id: null,
      };
      if (!liveScoreCompIsParent) {
        state.allTeamData = teamsArray.filter(
          item => item?.linkedCompetitionOrganisation?.id === compOrgId,
        );
      } else {
        state.allTeamData = teamsArray;
      }
      state.allTeamData.unshift(teamObject);

      return {
        ...state,
        onLoad: false,
        teamResult: teamsArray,
      };

    case ApiConstants.API_LIVE_SCORE_UPDATE_SCORER:
      if (action.key === 'teamId') {
        let selectedTeams = getTeamObj(action.data, state.teamResult);

        state.scorerData['teams'] = selectedTeams;
        state.teamId = action.data;
      } else if (action.key === 'scorerRadioBtn') {
        state[action.key] = action.data;
        state.existingScorerId = null;
      } else if (action.key === 'isEditScorer') {
        state.scorerData = action.data;
      } else if (action.key === 'isAddScorer') {
        scorerObj = {
          firstName: '',
          lastName: '',
          emailAddress: '',
          contactNo: '',
          teams: [],
        };
        state.scorerData = scorerObj;
        state.teamId = null;
        state.scorerRadioBtn = 'new';
      } else if (action.key === 'scorerSearch') {
        state.existingScorerId = action.data;
      } else {
        state.scorerData[action.key] = action.data;
      }
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    //// Add Edit Manager
    case ApiConstants.API_LIVE_SCORE_ADD_EDIT_SCORER_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_ADD_EDIT_SCORER_SUCCESS:
      return {
        ...state,
        //  onLoad: false
      };

    case ApiConstants.API_LIVESCORE_ASSIGN_MATCHES_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_LIVESCORE_ASSIGN_MATCHES_SUCCESS:
      return {
        ...state,
        onLoad: false,
        assignMatches: action.result.matches,
        assignMatchListPage: 0,
        assignMatchTotalCount: action.result.page.totalCount,
      };

    case ApiConstants.API_LIVESCORE_ASSIGN_CHANGE_STATUS_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_LIVESCORE_ASSIGN_CHANGE_STATUS_SUCCESS:
      let index = action.index;
      state.assignMatches[index][action.scorerKey] = action.result;
      return {
        ...state,
        onLoad: false,
      };

    case ApiConstants.API_LIVESCORE_UNASSIGN_STATUS_LOAD:
      return {
        ...state,
        onLoad: true,
      };
    case ApiConstants.API_LIVESCORE_UNASSIGN_STATUS_SUCCESS:
      let indexValue = action.index;
      state.assignMatches[indexValue][action.scorerKey] = null;
      return {
        ...state,
        onLoad: false,
      };

    case ApiConstants.API_LIVESCORE_SCORER_SEARCH_LOAD:
      return {
        ...state,
        onLoadSearch: true,
      };
    case ApiConstants.API_LIVESCORE_SCORER_SEARCH_SUCCESS:
      let searchdata = action.result ? updateScorerData(action.result) : [];
      return {
        ...state,
        onLoadSearch: false,
        searchScorer: searchdata,
      };

    case ApiConstants.API_LIVE_SCORE_SCORER_LIST_FAIL:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: action.error,
      };

    case ApiConstants.API_LIVE_SCORE_SCORER_LIST_ERROR:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: action.error,
      };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.scorerActionObject = null;
      return { ...state, onLoad: false };

    case ApiConstants.SET_LIVE_SCORE_ASSIGN_MATCH_LIST_PAGE_SIZE:
      return {
        ...state,
        assignMatchListPageSize: action.pageSize,
      };

    case ApiConstants.SET_LIVE_SCORE_ASSIGN_MATCH_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        assignMatchListPage: action.pageNum,
      };

    default:
      return state;
  }
}

export default liveScoreScorerState;
