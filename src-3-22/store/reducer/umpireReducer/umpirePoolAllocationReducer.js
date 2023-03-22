import ApiConstants from '../../../themes/apiConstants';

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  umpirePoolData: [],
  deletedUmpirePoolId: '',
  newUmpirePool: null,
};

function umpirePoolAllocationState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_GET_UMPIRE_POOL_DATA_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_GET_UMPIRE_POOL_DATA_SUCCESS:
      let result = action.result;
      return {
        ...state,
        onLoad: false,
        status: action.status,
        umpirePoolData: result,
      };

    case ApiConstants.API_SAVE_UMPIRE_POOL_DATA_LOAD:
      return {
        ...state,
        newUmpirePool: null,
        onLoad: true,
      };

    case ApiConstants.API_SAVE_UMPIRE_POOL_DATA_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        newUmpirePool: action.result,
      };

    case ApiConstants.API_UPDATE_UMPIRE_POOL_DATA_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_UPDATE_UMPIRE_POOL_DATA_SUCCESS:
      const umpirePoolDataCopyForUpdate = JSON.parse(JSON.stringify(state.umpirePoolData));

      const umpirePoolUmpireIdx = umpirePoolDataCopyForUpdate.findIndex(
        dataItem => dataItem.id === action.result.id,
      );

      umpirePoolDataCopyForUpdate.splice(umpirePoolUmpireIdx, 1, action.result);

      return {
        ...state,
        onLoad: false,
        status: action.status,
        umpirePoolData: umpirePoolDataCopyForUpdate,
      };

    case ApiConstants.API_UPDATE_UMPIRE_POOL_MANY_DATA_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_UPDATE_UMPIRE_POOL_MANY_DATA_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        umpirePoolData: action.result,
      };

    case ApiConstants.API_DELETE_UMPIRE_POOL_DATA_LOAD:
      return {
        ...state,
        deletedUmpirePoolId: '',
        onLoad: true,
      };

    case ApiConstants.API_DELETE_UMPIRE_POOL_DATA_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        deletedUmpirePoolId: action.result,
      };

    case ApiConstants.API_UPDATE_UMPIRE_POOL_TO_DIVISION_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_UPDATE_UMPIRE_POOL_TO_DIVISION_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        umpirePoolData: action.result,
      };

    case ApiConstants.API_APPLY_UMPIRE_ALLOCATION_ALGORITHM_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_APPLY_UMPIRE_ALLOCATION_ALGORITHM_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        // umpirePoolData: action.result,
      };

    case ApiConstants.API_UMPIRE_POOL_ALLOCATION_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };
    case ApiConstants.API_UMPIRE_POOL_ALLOCATION_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_UMPIRE_YEAR_CHANGED:
      return {
        ...state,
        umpirePoolData: [],
      }

    default:
      return state;
  }
}

export default umpirePoolAllocationState;
