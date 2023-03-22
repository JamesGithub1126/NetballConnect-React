import ApiConstants from '../../../themes/apiConstants';

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  perMatchResult: [],
  //perMatchList: [],
  perMatchPage: 0,
  perMatchTotalCount: 0,
  divisionList: [],
  highestSequence: null,
  roundLoad: false,
  roundList: [],
  onDivisionLoad: false,
  perMatchListActionObject: null,
};

function getHighestSequence(roundArr) {
  let sequence = [];

  for (let i in roundArr) {
    sequence.push(roundArr[i].sequence);
  }

  return Math.max.apply(null, sequence);
}

// Remove duplicate rounds names

function removeDuplicateValues(array) {
  return array.filter(
    (obj, index, self) => index === self.findIndex(el => el['name'] === obj['name']),
  );
}

function liveScoreTeamPerMatchState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_PER_MATCH_LIST_LOAD:
      state.perMatchResult = [];
      state.perMatchListActionObject = action;
      return {
        ...state,
        onLoad: true,
      };
    case ApiConstants.API_LIVE_SCORE_PER_MATCH_LIST_SUCCESS:
      let result = action.result.stats;
      state.perMatchResult = result;
      return {
        ...state,
        onLoad: false,
        status: action.status,
        perMatchPage: action.result.page.currentPage,
        perMatchTotalCount: action.result.page.totalCount,
      };
    case ApiConstants.API_LIVE_SCORE_PER_MATCH_PAY_LOAD:
      return {
        ...state,
        onLoad: true,
        onPaymentLoad: true,
      };
    case ApiConstants.API_LIVE_SCORE_PER_MATCH_PAY_SUCCESS:
      return {
        ...state,
        onLoad: false,
        onPaymentLoad: false,
        status: action.status,
      };
    case ApiConstants.API_LIVE_SCORE_PER_MATCH_FAIL:
      return {
        ...state,
        onLoad: false,
        onPaymentLoad: false,
        status: action.status,
        error: action.error,
      };
    case ApiConstants.API_LIVE_SCORE_PER_MATCH_ERROR:
      return {
        ...state,
        onLoad: false,
        onPaymentLoad: false,
        status: action.status,
        error: action.error,
      };

    case ApiConstants.API_LIVE_SCORE_ONLY_DIVISION_LOAD:
      return { ...state, onDivisionLoad: true };

    case ApiConstants.API_LIVE_SCORE_ONLY_DIVISION_SUCCESS:
      return {
        ...state,
        onDivisionLoad: false,
        divisionList: action.result,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_ROUND_LIST_LOAD:
      return { ...state, roundLoad: true };

    case ApiConstants.API_LIVE_SCORE_ROUND_LIST_SUCCESS:
      let sequenceValue = getHighestSequence(action.result);
      state.highestSequence = sequenceValue;
      let roundListArray = action.result;
      roundListArray.sort((a, b) => Number(a.sequence) - Number(b.sequence));
      state.roundList = removeDuplicateValues(roundListArray);
      return {
        ...state,
        onLoad: false,
        status: action.status,
        roundLoad: false,
      };

    default:
      return state;
  }
}

export default liveScoreTeamPerMatchState;
