import ApiConstants from '../../../themes/apiConstants';
import { reverseArray } from 'util/permissions';
import { SuspenedMatchStatusRefId } from 'enums/enums';

const initialState = {
  onLoad: false,
  onLoadTypes: false,
  onLoadMatches: false,
  status: 0,
  error: null,
  yearList: [],
  suspensionServedStatus: [],
  suspensionList: [],
  suspensionSummary: {
    matchesServed: 0,
    matchesAllocatedStillServed: 0,
    matchesAllocated: 0,
    suspensionsRequiringReview: 0,
  },
  pagination: {
    currentPage: 0,
    pageSize: 10,
    totalCount: 0,
  },
  filter: {
    yearRefId: undefined,
    servedStatusRefId: -1,
    competitionUniqueKey: -1,
    affiliate: -1,
    suspendedFrom: null,
    suspendedTo: null,
    searchText: null,
    offset: 0,
    limit: 10,
    sortBy: null,
    sortOrder: null,
  },
  competitionMatchList: [],
  selectedSuspension: {},
  selectedMatchList: [],
};

const getSuspensionSummary = (suspensionList) => {
  const summary = {
    matchesServed: 0,
    matchesAllocatedStillServed: 0,
    matchesAllocated: 0,
    suspensionsRequiringReview: 0,
  }
  for (let suspension of suspensionList) {
    const { suspendedMatches, suspendedMatchList } = suspension;
    if (suspendedMatches && suspendedMatchList) {
      const matchesServed = suspendedMatchList.filter(
        i => i.servedStatusRefId === SuspenedMatchStatusRefId.ServedYes,
      );
      summary.matchesServed += matchesServed.length;

      const matchesPending = suspendedMatchList.filter(
        i => i.servedStatusRefId === SuspenedMatchStatusRefId.Pending,
      );
      summary.matchesAllocatedStillServed += matchesPending.length;

      summary.matchesAllocated += suspendedMatches - suspendedMatchList.length;
    }
  }
  return summary;
}

const getSelectedMatches = (suspension) => {
  return suspension
    ? suspension.suspendedMatchList?.map(i => i.matchId)
    : [];
}

function liveScoreSuspensionState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_SUSPENSION_TYPE_LIST_LOAD:
      return { ...state, onLoadTypes: true };

    case ApiConstants.API_SUSPENSION_TYPE_LIST_SUCCESS: {
      const yearList = action.result.year ? reverseArray(action.result.year) : [];
      return {
        ...state,
        yearList,
        suspensionServedStatus: action.result.suspensionServedStatus,
      }
    }

    case ApiConstants.API_SUSPENSION_LIST_LOAD:    
      return { ...state, onLoad: true };

    case ApiConstants.API_SUSPENSION_LIST_SUCCESS:
      const { result: { page, results}, payload } = action;
      return {
        ...state,
        onLoad: false,
        status: action.status,
        suspensionList: results,
        suspensionSummary: getSuspensionSummary(results),
        pagination: {
          ...page,
          pageSize: payload.limit,
        },
      };

    case ApiConstants.API_SUSPENSION_SET_FILTER:
      return {
        ...state,
        filter: action.payload,
      }

    case ApiConstants.API_SUSPENSION_UPDATE_FILTER: {
      const { key, value } = action.payload;
      if (state.filter[key] === value) {
        return state;
      }
      const filter = {
        ...state.filter,
        offset: 0,
        [key]: value,
      };
      if (key === 'yearRefId') {
        filter.competitionUniqueKey = -1;
      }
      return {
        ...state,
        filter,
      }
    }

    case ApiConstants.API_SUSPENSION_MATCHES_LIST_LOAD:
      return { ...state, onLoadMatches: true };

    case ApiConstants.API_SUSPENSION_MATCHES_LIST_SUCCESS: {
      const matches = action.result;
      const { selectedSuspension } = state;
      const selectedMatchList = getSelectedMatches(selectedSuspension);

      if (selectedSuspension.suspendedMatchList?.length) {
        selectedSuspension.suspendedMatchList.forEach(record => {
          const item = matches.find(m => m.matchId === record.matchId)
          if (item) {
            item.id = record.id;
            item.servedStatusRefId = record.servedStatusRefId;
          }
        });
      }
      
      return {
        ...state,
        onLoadMatches: false,
        competitionMatchList: matches,
        selectedMatchList,
      };
    }

    case ApiConstants.API_SUSPENSION_SET_SELECTED:
      return {
        ...state,
        selectedSuspension: action.payload,
        selectedMatchList: getSelectedMatches(action.payload)
      }

    case ApiConstants.API_SUSPENSION_SET_MATCH_SERVED_STATE: {
      const { matchId, checked } = action.payload;
      const matches = [...state.competitionMatchList];
      const match = matches.find(m => m.matchId === matchId);
      if (match) {
        match.servedStatusRefId = !!checked
          ? SuspenedMatchStatusRefId.ServedYes
          : SuspenedMatchStatusRefId.ServedNo;
      }
      return {
        ...state,
        competitionMatchList: matches,
      }
    }

    case ApiConstants.API_SUSPENSION_SETMATCH_SELECTED_STATE: {
      return {
        ...state,
        selectedMatchList: action.payload,
      }
    }

    case ApiConstants.API_SUSPENSION_UPDATE_SUSPENDED_MATCHES_LOAD:
      return { ...state, onLoadMatches: true };

    case ApiConstants.API_SUSPENSION_UPDATE_MATCHES_SUCCESS: {
      return {
        ...state,
        filter: {
          ...state.filter,
        },
        onLoadMatches: false
      };
    }

    default:
      return state;
  }
}

export default liveScoreSuspensionState;
