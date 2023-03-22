import ApiConstants from '../../../themes/apiConstants';
import moment from 'moment';

var abandonObject = {
  startDate: '',
  startTime: moment('00:01', 'HH:mm'),
  endDate: '',
  endTime: moment('23:59', 'HH:mm'),
  venueId: null,
  courtId: [],
  roundId: null,
  resultType: null,
};

var pushBackObject = {
  startDate: '',
  startTime: moment('00:01', 'HH:mm'),
  endDate: '',
  endTime: moment('23:59', 'HH:mm'),
  venueId: null,
  courtId: [],
  hours: '',
  minutes: '',
  seconds: '',
  optionalDate: '',
  optionalTime: '',
};
var bringForwardObject = {
  startDate: '',
  startTime: moment('00:01', 'HH:mm'),
  endDate: '',
  endTime: moment('23:59', 'HH:mm'),
  venueId: null,
  courtId: [],
  hours: '',
  minutes: '',
  seconds: '',
  optionalDate: '',
  optionalTime: '',
};

var endMatchObject = {
  startDate: '',
  startTime: moment('00:01', 'HH:mm'),
  endDate: '',
  endTime: moment('23:59', 'HH:mm'),
  venueId: null,
  courtId: [],
  roundId: [],
};

var postponeMatchObject = {
  startDate: '',
  startTime: moment('00:01', 'HH:mm'),
  endDate: '',
  endTime: moment('23:59', 'HH:mm'),
  venueId: null,
  courtId: [],
  roundId: [],
};

var doubleHeaderObject = {
  round_1: null,
  round_2: null,
};

var selectedOptionObj = {
  selected_Option: [],
  courtId: [],
};

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  pushBackData: pushBackObject,
  bringForwardData: bringForwardObject,
  endMatchData: endMatchObject,
  postponeMatchData: postponeMatchObject,
  doubleHeaderResult: doubleHeaderObject,
  selectedOption: '',
  selected_Option: selectedOptionObj,
  abandonData: abandonObject,
  venueData: '',
  pushCourtData: '',
  bringCourtData: '',
  abandonCourtData: '',
  endCourtData: '',
  postponeCourtData: '',
  start_Date: '',
  start_Time: '',
  end_Date: '',
  end_Time: '',
  matchResult: [],
  bulkRadioBtn: 'fixedDuration',
  mainCourtList: [],
  roundList: [],
};

// Remove duplicate rounds names

function removeDuplicateValues(array) {
  return array.filter(
    (obj, index, self) => index === self.findIndex(el => el['name'] === obj['name']),
  );
}

function LiveScoreBulkMatchState(state = initialState, action) {
  switch (action.type) {
    ////Banner List Case
    case ApiConstants.API_LIVE_SCORE_BULK_PUSH_BACK_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_BULK_PUSH_BACK_SUCCESS:
      state.pushBackData = pushBackObject;
      state.selectedOption = '';
      return {
        ...state,
        onLoad: false,
        result: action.result,
        status: action.status,
      };

    ////Bring Forward case
    case ApiConstants.API_LIVE_SCORE_BULK_BRING_FORWARD_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_BULK_BRING_FORWARD_SUCCESS:
      state.bringForwardData = bringForwardObject;
      state.selectedOption = '';
      return {
        ...state,
        onLoad: false,
        result: action.result,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_BULK_END_MATCHES_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_BULK_END_MATCHES_SUCCESS:
      state.endMatchData = endMatchObject;
      state.selectedOption = '';

      return {
        ...state,
        onLoad: false,
        result: action.result,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_BULK_DOUBLE_HEADER_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_BULK_DOUBLE_HEADER_SUCCESS:
      let doubleHeaderObj = {
        round_1: null,
        round_2: null,
      };
      state.doubleHeaderResult = doubleHeaderObj;
      state.selectedOption = '';
      return {
        ...state,
        onLoad: false,
        result: action.result,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_BULK_MATCH:
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };
    case ApiConstants.API_LIVE_SCORE_UPDATE_BULK:
      if (action.key === 'selectedOption') {
        state.bulkRadioBtn = 'fixedDuration';

        state.pushBackData['courtId'] = [];
        state.bringForwardData['courtId'] = [];
        state.endMatchData['courtId'] = [];
        state.postponeMatchData['courtId'] = [];
        state.abandonData['courtId'] = [];

        state.pushCourtData = [];
        state.abandonCourtData = [];
        state.endCourtData = [];
        state.postponeCourtData = [];
        state.bringCourtData = [];

        state.pushBackData['venueId'] = null;
        state.pushBackData['hours'] = '';
        state.pushBackData['minutes'] = '';
        state.pushBackData['seconds'] = '';
        state.pushBackData['optionalDate'] = '';
        state.pushBackData['optionalTime'] = '';

        state.abandonData['venueId'] = null;
        state.abandonData['resultType'] = null;

        state.bringForwardData['venueId'] = null;
        state.bringForwardData['hours'] = '';
        state.bringForwardData['minutes'] = '';
        state.bringForwardData['seconds'] = '';
        state.bringForwardData['optionalDate'] = '';
        state.bringForwardData['optionalTime'] = '';

        state.endMatchData['venueId'] = null;
        state.postponeMatchData['venueId'] = null;

        state.selectedOption = action.data;
        let new_object = state.selected_Option;
        new_object[action.key] = action.data;
        state.selected_Option = new_object;
      } else if (action.key === 'bulkRadioBtn') {
        state.bulkRadioBtn = action.data;
      } else if (state.selectedOption === 'pushBack') {
        let new_object = state.pushBackData;
        if (action.key === 'venueCourtId') {
          new_object['courtId'] = action.data;
          state.selected_Option = new_object;
        }
        if (action.key === 'optionalDate') {
          new_object['optionalDate'] = action.data;
          state.selected_Option = new_object;
        }
        if (action.key === 'optionalTime') {
          new_object['optionalTime'] = action.data;
          state.selected_Option = new_object;
        }
        if (action.key === 'venueId') {
          new_object[action.key] = action.data;
          let index = state.venueData.findIndex(x => x.venueId === action.data);
          if (index > -1) {
            let courts = state.venueData[index].venueCourts;
            state.pushCourtData = courts;
            state.mainCourtList = courts;
          }
        } else {
          new_object[action.key] = action.data;
        }
        state.pushBackData = new_object;
      } else if (state.selectedOption === 'bringForward') {
        let new_object = state.bringForwardData;

        if (action.key === 'venueId') {
          new_object[action.key] = action.data;
          let index = state.venueData.findIndex(x => x.venueId === action.data);
          if (index > -1) {
            let courts = state.venueData[index].venueCourts;
            state.bringCourtData = courts;
            state.mainCourtList = courts;
          }
        } else {
          new_object[action.key] = action.data;
        }
        state.bringForwardData = new_object;
      } else if (state.selectedOption === 'endMatch') {
        state.endMatchData = endMatchObject;
        let new_object = state.endMatchData;
        if (action.key === 'venueId') {
          new_object[action.key] = action.data;
          let index = state.venueData.findIndex(x => x.venueId === action.data);
          if (index > -1) {
            let courts = state.venueData[index].venueCourts;
            state.endCourtData = courts;
            state.mainCourtList = courts;
          }
        } else {
          new_object[action.key] = action.data;
        }
        state.endMatchData = new_object;
      } else if (state.selectedOption === 'postponeMatch') {
        state.postponeMatchData = postponeMatchObject;
        let new_object = state.postponeMatchData;
        if (action.key === 'venueId') {
          new_object[action.key] = action.data;
          let index = state.venueData.findIndex(x => x.venueId === action.data);
          if (index > -1) {
            let courts = state.venueData[index].venueCourts;
            state.postponeCourtData = courts;
            state.mainCourtList = courts;
          }
        } else {
          new_object[action.key] = action.data;
        }
        state.postponeMatchData = new_object;
      } else if (state.selectedOption === 'abandonMatch') {
        // state.abandonData = abandonObject
        let new_object = state.abandonData;
        new_object[action.key] = action.data;
        if (action.key === 'venueId') {
          let index = state.venueData.findIndex(x => x.venueId === action.data);
          if (index > -1) {
            let courts = state.venueData[index].venueCourts;
            state.abandonCourtData = courts;
            state.mainCourtList = courts;
          }
        }
        state.abandonData = new_object;
      } else if (state.selectedOption === 'doubleHeader') {
        let new_object = state.doubleHeaderResult;
        new_object[action.key] = action.data;
        state.doubleHeaderResult = new_object;
      } else if (action.key === 'refreshPage') {
        state.selectedOption = action.data;
      } else {
        action.key = action.data;
      }
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_BULK_MATCH_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };
    case ApiConstants.API_LIVE_SCORE_BULK_MATCH_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
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

    case ApiConstants.API_MATCH_RESULT_LOAD:
      return {
        ...state,
        onLoad: true,
      };
    case ApiConstants.API_MATCH_RESULT_SUCCESS:
      return {
        ...state,
        onLoad: false,
        matchResult: action.result,
        error: null,
      };

    //// Abandon Match
    case ApiConstants.API_LIVE_SCORE_BULK_ABANDON_MATCH_LOAD:
      return {
        ...state,
        onLoad: true,
      };
    case ApiConstants.API_LIVE_SCORE_BULK_ABANDON_MATCH_SUCCESS:
      state.selectedOption = '';
      return {
        ...state,
        onLoad: false,
      };

    case ApiConstants.API_LIVE_SCORE_BULK_POSTPONE_MATCH_LOAD:
      return {
        ...state,
        onLoad: true,
      };
    case ApiConstants.API_LIVE_SCORE_BULK_POSTPONE_MATCH_SUCCESS:
      state.selectedOption = '';
      return {
        ...state,
        onLoad: false,
      };

    //// Search Court Data
    case ApiConstants.API_SEARCH_COURT_LIST:
      return {
        ...state,
        pushCourtData: action.data,
        bringCourtData: action.data,
        abandonCourtData: action.data,
        endCourtData: action.data,
        postponeCourtData: action.data,
      };

    case ApiConstants.CLEAR_FILTER_SEARCH:
      return {
        ...state,
        pushCourtData: state.mainCourtList,
        bringCourtData: state.mainCourtList,
        abandonCourtData: state.mainCourtList,
        endCourtData: state.mainCourtList,
        postponeCourtData: state.mainCourtList,
      };

    case ApiConstants.API_LIVE_SCORE_ROUND_LIST_LOAD:
      return { ...state, roundLoad: true };

    case ApiConstants.API_LIVE_SCORE_ROUND_LIST_SUCCESS:
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

export default LiveScoreBulkMatchState;
