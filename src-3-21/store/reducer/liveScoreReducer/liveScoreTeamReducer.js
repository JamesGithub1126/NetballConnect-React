import ApiConstants from 'themes/apiConstants';
// import liveScoreTeamModal from "store/objectModel/liveScoreTeamModal";

const teamManagerObj = {
  name: '',
  alias: '',
  logoUrl: null,
  divisionId: null,
  organisationId: null,
  userIds: [],
  firstName: '',
  lastName: '',
  mobileNumber: '',
  email: '',
};

const teamNewObj = {
  name: '',
  alias: '',
  logoUrl: null,
  divisionId: null,
  organisationId: null,
  firstName: '',
  lastName: '',
  mobileNumber: '',
  email: '',
};

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  teamResult: [],
  playerList: [],
  onLoad_2: false,
  form: {
    name: '',
    alias: '',
    logoUrl: '',
    teamLogo: '',
    divisionId: '',
    affiliate: '',
    managerType: '',
    managerContactNo: '',
    managerEmailAddress: '',
    managerLastName: '',
    managerFirstName: '',
    existingManager: '',
    division: [],
    AffilateList: [],
  },
  allData: null,
  teamData: null,
  managerData: null,
  teamManagerData: teamManagerObj,
  teamNewData: teamNewObj,
  affilateList: [],
  divisionList: [],
  managerType: null,
  selectedManager: [],
  teamLogo: null,
  managerList: [],
  isCheked: false,
  totalTeams: null,
  livescoreTeamActionObject: null,
  teamCurrentPage: 1,
  teamLoad: false,
  screenKey: null,
  roundsData: null,
};

function getNameWithNumber(name, number) {
  let numberLength =
    number.length < 10
      ? new Array(10 - 4).join('x') + number.substr(number - 5, 4)
      : new Array(number.length - 4).join('x') + number.substr(number.length - 5, 4);
  let newName = name + '-' + numberLength;
  return newName;
}

function updateManagersData(result) {
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

function getManagerId(managerData) {
  let managerIds = [];
  for (let i in updateManagersData(managerData)) {
    managerIds.push(managerData[i].userId);
  }
  return managerIds;
}

function LiveScoreTeamState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_GET_TEAM_VIEW_PLAYER_LIST_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_GET_TEAM_VIEW_PLAYER_LIST_SUCCESS:
      // let playerData = liveScoreTeamModal.getTeamViewPlayerListData(action.result.players);
      return {
        ...state,
        onLoad: false,
        playerList: action.result.players,
        allData: action.result,
        teamData: action.result.team[0],
        managerData: action.result.managers[0],
        managerList: action.result.managers,
      };

    case ApiConstants.API_LIVE_SCORE_DELETE_TEAM_LOAD:
      return { ...state, onLoad_2: true };

    case ApiConstants.API_LIVE_SCORE_DELETE_TEAM_SUCCESS:
      return { ...state, onLoad_2: false };

    // case ApiConstants.API_LIVE_SCORE_TEAM_LOAD:
    //     return { ...state, onLoad: true };

    // case ApiConstants.API_LIVE_SCORE_TEAM_SUCCESS:
    //     return {
    //         ...state,
    //         onLoad: false,
    //         teamResult: action.result,
    //         status: action.status,
    //     };

    case ApiConstants.API_LIVE_SCORE_TEAM_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_TEAM_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.LIVE_SCORE_TEAM_EDIT:
      const { key } = action.payload;
      const { data } = action.payload;
      if (key === 'managerType') {
        state[key] = data;
      } else if (key === 'teamLogo') {
        state[key] = data;
      } else if (key === 'checkBox') {
        state.isCheked = data;
        if (data) {
          state.teamManagerData['logoUrl'] = null;
          state.teamLogo = null;
        }
      } else if (key === 'addTeam') {
        state.teamManagerData['logoUrl'] = null;
        state.teamLogo = null;
        state.managerType = null;
        state.teamManagerData = {
          name: '',
          alias: '',
          logoUrl: null,
          divisionId: null,
          organisationId: null,
          userIds: [],
          firstName: '',
          lastName: '',
          mobileNumber: '',
          email: '',
        };
      } else if (key === 'logoUrl') {
        state.teamManagerData['logoUrl'] = data;
        state.isCheked = false;
      } else {
        state.teamManagerData[key] = data;
        if (key === 'userIds') {
          state.selectedManager = data;
        }
      }
      return {
        ...state,
        // form: {
        //     ...state.form,
        //     [key]: data,
        // },
      };

    case ApiConstants.GET_DIVISION_TEAM:
      return { ...state, onLoad: true };

    case ApiConstants.GET_AFFILIATE_TEAM:
      return { ...state };

    case ApiConstants.GET_DIVISION_SUCCESS:
      return {
        ...state,
        onLoad: false,
        // form: {
        //     ...state.form,
        //     division: action.payload,
        // },
        divisionList: action.payload,
      };

    case ApiConstants.GET_DIVISION_ERROR:
      return {
        ...state,
        onLoad: false,
        form: {
          ...state.form,
          DivisionListError: action.payload,
        },
      };

    case ApiConstants.API_LIVE_SCORE_DELETE_TEAM_PLAYER_LOAD:
      return {
        ...state,
        onLoad: true,
      };
    case ApiConstants.API_LIVE_SCORE_DELETE_TEAM_PLAYER_SUCCESS:
      return { ...state, onLoad: false };

    case ApiConstants.GET_AFFILIATE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        // form: {
        //     ...state.form,
        //     AffilateList: action.payload,
        // },
        affilateList: action.payload,
      };

    case ApiConstants.GET_AFFILIATE_ERROR:
      return {
        ...state,
        onLoad: false,
        form: {
          ...state.form,
          AffilateListError: action.payload,
        },
      };

    case ApiConstants.API_LIVE_SCORE_TEAM_IMPORT_LOAD:
      return {
        ...state,
        onLoad: true,
        importResult: null,
      };

    case ApiConstants.API_LIVE_SCORE_TEAM_IMPORT_SUCCESS:
      return {
        ...state,
        onLoad: false,
        importResult: action.result,
      };

    case ApiConstants.API_LIVE_SCORE_TEAM_IMPORT_RESET:
      return {
        ...state,
        importResult: null,
      };

    case ApiConstants.API_LIVE_SCORE_ADD_TEAM_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_ADD_TEAM_SUCCESS:
      return { ...state, onLoad: false, screenKey: action.screenKey };

    case ApiConstants.API_LIVE_SCORE_GET_TEAM_LOAD:
      return { ...state, onLoad: true, teamLoad: true };

    case ApiConstants.API_LIVE_SCORE_GET_TEAM_SUCCESS:
      state.teamManagerData = action.result.team.length > 0 ? action.result.team[0] : null;
      state.teamLogo = action.result.team.length > 0 ? action.result.team[0].logoUrl : null;
      let managerId = getManagerId(action.result.managers);
      state.teamManagerData['userIds'] = managerId;
      state.selectedManager = managerId;
      state.managerList = action.result.managers.map(m => {
        return { id: m.userId, nameWithNumber: m.nameWithNumber };
      });
      state.managerType = action.result.managers.length > 0 ? 'existing' : null;
      return { ...state, onLoad: false, teamLoad: false };

    case ApiConstants.API_LIVE_SCORE_TEAM_WITH_PAGING_LOAD:
      return { ...state, onLoad: true, livescoreTeamActionObject: action };

    case ApiConstants.API_LIVE_SCORE_TEAM_WITH_PAGING_SUCCESS:
      const result = action.result.teams;
      state.totalTeams = action.result.page.page.totalCount;
      state.teamCurrentPage = action.result.page.page.currentPage;
      return {
        ...state,
        onLoad: false,
        teamResult: result,
        status: action.status,
      };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.livescoreTeamActionObject = null;
      return { ...state, onLoad: false };

    //////update team name for competition module also
    case ApiConstants.API_LIVE_SCORE_UPDATE_COMP_TEAM_NAME_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_UPDATE_COMP_TEAM_NAME_SUCCESS:
      return { ...state, onLoad: false };

    case ApiConstants.API_LIVE_SCORE_GET_ROUNDS_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_GET_ROUNDS_SUCCESS:
      return {
        ...state,
        onLoad: false,
        roundsData: action.result,
        status: action.status,
      };
    default:
      return state;
  }
}

export default LiveScoreTeamState;
