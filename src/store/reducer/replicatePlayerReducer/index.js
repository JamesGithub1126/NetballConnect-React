import ApiConstants from 'themes/apiConstants';

const initialState = {
  onLoad: false,
  onLoadComp: false,
  onLoadOrg: false,
  onLoadDiv: false,
  competitions: [],
  affiliates: [],
  divisions: [],
  selections: {
    competitionUniqueKey: [],
    organisationUniqueKey: null,
    roleId: null,
    divisionId: null,
  },
  modalVisible: false,
};

const ReplicatePlayerState = (state = initialState, action) => {
  switch (action.type) {
    /**MovePlayer Modal Toggle Visoibility */
    case ApiConstants.API_REPLICATE_PLAYER_MODAL_VISIBILITY: {
      return {
        ...state,
        modalVisible: action.payload ? action.payload : false,
      };
    }

    case ApiConstants.API_REPLICATE_PLAYER_UPDATE_SELECTION: {
      const { key, value } = action;
      const selections = {
        ...state.selections,
        [key]: value,
      };

      // We need to reset some states if competition is changed;
      let affiliates = state.affiliates;
      let divisions = state.divisions;
      if (key === 'competitionUniqueKey') {
        affiliates = divisions = [];
      }

      return {
        ...state,
        selections,
        affiliates,
        divisions,
      };
    }

    /**Competitions */
    case ApiConstants.API_REPLICATE_PLAYER_GET_COMPETITION_LIST_LOAD: {
      return { ...state, onLoadComp: true };
    }
    case ApiConstants.API_REPLICATE_PLAYER_GET_COMPETITION_LIST_SUCCESS:
    case ApiConstants.API_REPLICATE_PLAYER_GET_COMPETITION_LIST_ERROR: {
      return {
        ...state,
        competitions: action.result ? action.result : [],
        onLoadComp: false,
      };
    }
    /**Affiliates */
    case ApiConstants.API_REPLICATE_PLAYER_GET_AFFILIATE_LIST_LOAD: {
      return { ...state, onLoadOrg: true };
    }
    case ApiConstants.API_REPLICATE_PLAYER_GET_AFFILIATE_LIST_SUCCESS:
    case ApiConstants.API_REPLICATE_PLAYER_GET_AFFILIATE_LIST_ERROR: {
      const affiliates = action.result ? action.result : [];

      // Reset selected affiliate if it doesn't exist in the list.
      const selections = { ...state.selections };
      const organisationId = selections.organisationUniqueKey;
      if (organisationId) {
        if (!affiliates.find(i => i.organisationUniqueKey === organisationId)) {
          selections.organisationUniqueKey = null;
        }
      }
      return {
        ...state,
        onLoadOrg: false,
        selections,
        affiliates,
      };
    }

    /**Divisions */
    case ApiConstants.API_REPLICATE_PLAYER_GET_DIVISION_LIST_LOAD: {
      return { ...state, onLoadDiv: true };
    }
    case ApiConstants.API_REPLICATE_PLAYER_GET_DIVISION_LIST_SUCCESS:
    case ApiConstants.API_REPLICATE_PLAYER_GET_DIVISION_LIST_ERROR: {
      const divisions = action.result ? action.result : [];

      // Reset selected affiliate if it doesn't exist in the list.
      const selections = { ...state.selections };
      const divisionId = selections.divisionId;
      if (divisionId) {
        if (!divisions.find(i => i.id === divisionId)) {
          selections.divisionId = null;
        }
      }
      return {
        ...state,
        onLoadDiv: false,
        selections,
        divisions,
      };
    }

    /**Move Player Button Click */
    case ApiConstants.API_REPLICATE_PLAYER_SUBMIT_LOAD: {
      return { ...state, onLoad: true };
    }

    case ApiConstants.API_REPLICATE_PLAYER_SUBMIT_SUCCESS: {
      return {
        ...state,
        onLoad: false,
        modalVisible: action.payload ? action.payload : false,
      };
    }
    
    case ApiConstants.API_REPLICATE_PLAYER_SUBMIT_ERROR: {
      return {
        ...state,
        onLoad: false,
      };
    }

    case ApiConstants.API_REPLICATE_PLAYER_RESET_SELECTIONS: {
      return {
        ...state,
        selections: {
          competitionUniqueKey: [],
          organisationUniqueKey: null,
          roleId: null,
          divisionId: null,
        },
      };
    }

    case ApiConstants.API_COMMON_COMPONENT_YEAR_SET_SELECT: {
      return {
        ...state,
        competitions: [],
        affiliates: [],
        divisions: [],
        selections: {
          ...state.selections,
          competitionUniqueKey: [],
          organisationUniqueKey: null,
          divisionId: null,
        },
      };
    }

    default:
      return state;
  }
};

export default ReplicatePlayerState;
