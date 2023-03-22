import ApiConstants from '../../../themes/apiConstants';

var venueChangeObj = {
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  venueId: [],
  courtId: [],
  changeToVenueId: [],
  changeToCourtId: [],
};

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  venueChangeData: venueChangeObj,
  venueData: '',
  courtData: '',
  courtDataForChange: '',
  mainCourtList: [],
};

function LiveScoreVenueChange(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_UPDATE_VENUE_CHANGE:
      if (action.key === 'venueId') {
        state.venueChangeData[action.key] = action.data;
        state.venueChangeData['courtId'] = [];
        let index = state.venueData.findIndex(x => x.venueId === action.data);
        if (index > -1) {
          let courts = state.venueData[index].venueCourts;
          state.courtData = courts;
          state.mainCourtList = courts;
        }
      } else if (action.key === 'changeToVenueId') {
        state.venueChangeData[action.key] = action.data;
        state.venueChangeData['changeToCourtId'] = [];

        let index = state.venueData.findIndex(x => x.venueId === action.data);
        if (index > -1) {
          let courts = state.venueData[index].venueCourts;
          state.courtDataForChange = courts;
          state.mainCourtList = courts;
        }
      } else {
        state.venueChangeData[action.key] = action.data;
      }
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_COMPETITION_VENUES_LIST_SUCCESS:
      state.venueData = action.venues;
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    //// Search Court Data
    case ApiConstants.API_SEARCH_COURT_LIST:
      return {
        ...state,
        courtData: action.key === 'court_1' && action.data,
        courtDataForChange: action.key === 'court_2' && action.data,
      };

    case ApiConstants.CLEAR_FILTER_SEARCH:
      return {
        ...state,
        courtData: action.key === 'court_1' && state.mainCourtList,
        courtDataForChange: action.key === 'court_2' && state.mainCourtList,
      };

    case ApiConstants.API_SAVE_VENUE_CHANGE_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_SAVE_VENUE_CHANGE_SUCCESS:
      //     let emptyObject  = {
      //         startDate: "",
      //         startTime: "",
      //         endDate: "",
      //         endTime: "",
      //         venueId: [],
      //         courtId: [],
      //         changeToVenueId: [],
      //         changeToCourtId: []
      //     }

      // state.venueChangeData = emptyObject
      return {
        ...state,
        onLoad: false,
      };

    case ApiConstants.API_SAVE_VENUE_CHANGE_FAIL:
      return {
        ...state,
        onLoad: false,
      };

    case ApiConstants.API_SAVE_VENUE_CHANGE_ERROR:
      return {
        ...state,
        onLoad: false,
      };

    default:
      return state;
  }
}

export default LiveScoreVenueChange;
