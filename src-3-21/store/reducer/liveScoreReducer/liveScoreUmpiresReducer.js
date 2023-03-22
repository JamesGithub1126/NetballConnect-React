import ApiConstants from 'themes/apiConstants';
import { isArrayNotEmpty } from '../../../util/helpers';

const initialState = {
  onLoad: false,
  status: 0,
  error: null,
  umpiresListResult: [],
  umpires: '',
  umpiresPage: 0,
  umpiresTotalCount: 0,
  umpireAvailabilitySchedule: [],
};

function liveScoreUmpiresState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_UMPIRES_LIST_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_UMPIRES_LIST_SUCCESS:
      let result = action.result;
      state.umpiresListResult = result;
      return {
        ...state,
        onLoad: false,
        status: action.status,
        umpiresPage: result.page.currentPage,
        umpiresTotalCount: result.page.totalCount,
      };

    case ApiConstants.API_LIVE_SCORE_UMPIRES_FAIL:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: action.error,
      };

    case ApiConstants.API_LIVE_SCORE_UMPIRES_ERROR:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: action.error,
      };

    case ApiConstants.API_LIVE_SCORE_UMPIRES_IMPORT_LOAD:
      return {
        ...state,
        onLoad: true,
        importResult: null,
      };

    case ApiConstants.API_LIVE_SCORE_UMPIRES_IMPORT_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        importResult: action.result,
      };

    case ApiConstants.API_LIVE_SCORE_UMPIRES_IMPORT_RESET:
      return {
        ...state,
        onLoad: false,
        importResult: null,
      };

    case ApiConstants.API_LIVE_SCORE_GET_UMPIRE_AVAILABILITY_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_GET_UMPIRE_AVAILABILITY_SUCCESS:
      let umpireAvailabilityData = action.result;
      return {
        ...state,
        onLoad: false,
        umpireAvailabilitySchedule: isArrayNotEmpty(umpireAvailabilityData)
          ? umpireAvailabilityData
          : [],
      };

    ////umpire availability save
    case ApiConstants.API_LIVE_SCORE_SAVE_UMPIRE_AVAILABILITY_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_SAVE_UMPIRE_AVAILABILITY_SUCCESS:
      let umpireAvailabilityUpdatedData = action.result;

      return {
        ...state,
        onLoad: false,
        umpireAvailabilitySchedule: isArrayNotEmpty(umpireAvailabilityUpdatedData)
          ? umpireAvailabilityUpdatedData
          : [],
      };

    default:
      return state;
  }
}

export default liveScoreUmpiresState;
