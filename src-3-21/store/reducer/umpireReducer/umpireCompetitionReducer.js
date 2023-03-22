import ApiConstants from '../../../themes/apiConstants';

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  umpireComptitionList: [],
  umpireComptitionData: null,
  isDirectCompetition: false,
};
function umpireCompetitionState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_UMPIRE_COMPETITION_LIST_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_UMPIRE_COMPETITION_LIST_SUCCESS:
      let result = action.result;
      return {
        ...state,
        onLoad: false,
        umpireComptitionList: result,
        status: action.status,
      };

    case ApiConstants.API_UMPIRE_COMPETITION_Data_SUCCESS:
      const competition = action.result || {};
      let competitionInvitees = competition.competitionInvitees || [];
      let index = competitionInvitees.findIndex(i => i.inviteesRefId != 5);
      return {
        ...state,
        umpireComptitionData: action.result,
        isDirectCompetition: index == -1,
        status: action.status,
      };

    case ApiConstants.API_UMPIRE_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };
    case ApiConstants.API_UMPIRE_ERROR:
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

export default umpireCompetitionState;
