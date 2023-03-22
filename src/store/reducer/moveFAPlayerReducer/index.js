import ApiConstants from 'themes/apiConstants';

const initialState = {
  playersToMove: [],
  onLoad: false,
  onLoadComp: false,
  onLoadOrg: false,
  onLoadDiv: false,
  competitions: [],
  affiliates: [],
  divisions: [],
  finalMovePlayersList: {
    competitionUniqueKey: [],
    organisationUniqueKey: null,
    roleId: null,
    divisionId: null,
  },
  modalVisible: false,
  userRoleComponentVisible: false, //default for player
};

const MovePlayerState = (state = initialState, action) => {
  switch (action.type) {
    /**MovePlayer Modal Toggle Visoibility */
    case ApiConstants.MOVE_PLAYER_TOGGLE_MODAL_VISIBILITY: {
      return {
        ...state,
        modalVisible: action.payload ? action.payload : false,
      };
    }

    case ApiConstants.API_MOVE_PLAYER_UPDATE_SELECTION: {
      const { key, value } = action;
      const finalMovePlayersList = {
        ...state.finalMovePlayersList,
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
        finalMovePlayersList,
        affiliates,
        divisions,
      };
    }

    case ApiConstants.API_SET_FINAL_PLAYER_LIST: {
      const { payload } = action;
      let finalMovePlayersList = state.finalMovePlayersList;
      finalMovePlayersList = {
        ...finalMovePlayersList,
        ...payload,
      };

      return {
        ...state,
        finalMovePlayersList,
      };
    }
    case ApiConstants.API_MOVE_PLAYER_SET_PLAYER_LIST: {
      return {
        ...state,
        playersToMove: action.payload ? action.payload : [],
      };
    }
    /**Player List */
    case ApiConstants.API_MOVE_PLAYER_LIST_LOAD: {
      return { ...state, onLoad: true };
    }
    case ApiConstants.API_MOVE_PLAYER_LIST_SUCCESS:
    case ApiConstants.API_MOVE_PLAYER_LIST_ERROR:
      return { ...state, onLoad: false };

    /**Competitions */
    case ApiConstants.API_GET_COMPETITION_LIST_LOAD: {
      return { ...state, onLoadComp: true };
    }
    case ApiConstants.API_GET_COMPETITION_LIST_LOAD_SUCCESS:
    case ApiConstants.API_GET_COMPETITION_LIST_LOAD_ERROR: {
      return {
        ...state,
        competitions: action.result ? action.result : [],
        onLoadComp: false,
      };
    }
    /**Affiliates */
    case ApiConstants.API_GET_AFFILIATE_LIST_LOAD: {
      return { ...state, onLoadOrg: true };
    }
    case ApiConstants.API_GET_AFFILIATE_LIST_LOAD_SUCCESS:
    case ApiConstants.API_GET_AFFILIATE_LIST_LOAD_ERROR: {
      const affiliates = action.result ? action.result : [];

      // Reset selected affiliate if it doesn't exist in the list.
      const finalMovePlayersList = { ...state.finalMovePlayersList };
      const organisationId = finalMovePlayersList.organisationUniqueKey;
      if (organisationId) {
        if (!affiliates.find(i => i.organisationUniqueKey === organisationId)) {
          finalMovePlayersList.organisationUniqueKey = null;
        }
      }
      return {
        ...state,
        onLoadOrg: false,
        finalMovePlayersList,
        affiliates,
      };
    }

    /**Divisions */
    case ApiConstants.API_GET_AFFILIATE_DIVISION_LIST_LOAD: {
      return { ...state, onLoadDiv: true };
    }
    case ApiConstants.API_GET_AFFILIATE_DIVISION_LIST_LOAD_SUCCESS:
    case ApiConstants.API_GET_AFFILIATE_DIVISION_LIST_LOAD_ERROR: {
      const divisions = action.result ? action.result : [];

      // Reset selected affiliate if it doesn't exist in the list.
      const finalMovePlayersList = { ...state.finalMovePlayersList };
      const divisionId = finalMovePlayersList.divisionId;
      if (divisionId) {
        if (!divisions.find(i => i.id === divisionId)) {
          finalMovePlayersList.divisionId = null;
        }
      }
      return {
        ...state,
        onLoadDiv: false,
        finalMovePlayersList,
        divisions,
      };
    }

    /**Move Player Button Click */
    case ApiConstants.API_MOVE_PLAYER_LOAD: {
      return { ...state, onLoad: true };
    }

    case ApiConstants.API_MOVE_PLAYER_LOAD_SUCCESS: {
      return {
        ...state,
        onLoad: false,
        modalVisible: action.payload ? action.payload : false,
      };
    }

    case ApiConstants.API_MOVE_PLAYER_LOAD_ERROR: {
      return {
        ...state,
        onLoad: false,
      };
    }

    case ApiConstants.API_MOVE_PLAYER_RESET_SELECTIONS: {
      return {
        ...state,
        finalMovePlayersList: {
          competitionUniqueKey: [],
          organisationUniqueKey: null,
          roleId: null,
          divisionId: null,
        },
      };
    }

    /** userRoleId Placeholder */
    case ApiConstants.API_MOVE_PLAYER_UPDATE_PLACEHOLDERROLE: {
      return {
        ...state,
        userRoleComponentVisible: action.payload ? action.payload : false,
      };
    }

    case ApiConstants.API_COMMON_COMPONENT_YEAR_SET_SELECT: {
      return {
        ...state,
        competitions: [],
        affiliates: [],
        divisions: [],
        finalMovePlayersList: {
          ...state.finalMovePlayersList,
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

export default MovePlayerState;
