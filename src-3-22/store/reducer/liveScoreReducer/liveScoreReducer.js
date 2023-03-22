import ApiConstants from 'themes/apiConstants';

const initialState = {
  onLoad: false,
  error: null,
  divisionList: [],
  status: 0,
  liveScoreMatchListData: [],
  teamResult: [],
  roundResult: [],
  checkInitState: {
    isDivision: false,
    isTeam: false,
    isRound: false,
    isLadder: false,
  },
  scorerListResult: [],
  availableScoreListResult: [],
  availableOfficialList: {},
};

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

function LiveScoreState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_DIVISION_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_DIVISION_SUCCESS:
      return {
        ...state,
        onLoad: false,
        divisionList: action.divisionList ? action.divisionList : [],
        teamResult: action.teamResult,
        roundResult: action.roundResult,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_CREATE_ROUND_SUCCESS:
      // state.roundResult.push(action.result);
      return {
        ...state,
        onLoad: false,
        // result: action.result,
        // status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_GET_SCORER_LIST_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_GET_AVAILABLE_SCORER_LIST_LOAD:
      return { ...state, onLoad: true, loadScorers: true, availableScoreListResult: [] };

    case ApiConstants.API_LIVE_SCORE_GET_SCORER_LIST_SUCCESS:
      let result = action.result ? updateScorerData(action.result) : [];
      return {
        ...state,
        onLoad: false,
        scorerListResult: result,
      };

    case ApiConstants.API_LIVE_SCORE_GET_AVAILABLE_SCORER_LIST_SUCCESS:
      let availableScores = action.result ? updateScorerData(action.result) : [];
      if (action.roleId) {
        // Avaliable officials
        const officialList = state.availableOfficialList;
        const officials = officialList[action.roleId];
        if (officials) {
          officialList[action.roleId] = officials.concat(availableScores);
        } else {
          officialList[action.roleId] = availableScores;
        }
        return {
          ...state,
          onLoad: false,
          loadScorers: false,
          availableOfficialList: { ...officialList },
        };
      }
      // Update available score list.
      return {
        ...state,
        onLoad: false,
        loadScorers: false,
        availableScoreListResult: availableScores,
      };

    case ApiConstants.LIVE_SCORE_CLEAR_SCORER_LIST: {
      return {
        ...state,
        availableScoreListResult: [],
      };
    }

    case ApiConstants.LIVE_SCORE_CLEAR_OFFICIAL_LIST: {
      let officials = [];
      const entityId = action.entityId;
      if (entityId) {
        officials = state.availableOfficialList[action.roleId];
        if (officials) {
          officials = officials.filter(i => i.entityId !== entityId);
        }
      }
      return {
        ...state,
        availableOfficialList: {
          ...state.availableOfficialList,
          [action.roleId]: officials,
        },
      };
    }
    default:
      return state;
  }
}

export default LiveScoreState;
