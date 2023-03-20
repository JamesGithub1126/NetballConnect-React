import ApiConstants from '../../../themes/apiConstants';
import { isArrayNotEmpty } from '../../../util/helpers';
import { LsCompStatus } from '../../../enums/enums';

const initialState = {
  loader: false,
  List: null,
  yearList: [],
  ownedCompetitions: [],
  participatingInComptitions: [],
  ownedTotalCount: 1,
  ownedCurrentPage: 1,
  ownedPageSize: 10,
  participateTotalCount: 1,
  participateCurrentPage: 1,
  participatePageSize: 10,
  ownedLoad: false,
  partLoad: false,
  allCompListLoad: false,
  competitionListActionObject: null,
  exportingBulkLadder: false,
};
export default function liveScoreCompetition(state = initialState, payload) {
  switch (payload.type) {
    case ApiConstants.API_LIVE_SCORE_COMPETITION_INITIATE:
      return {
        ...state,
        loader: true,
      };
    case ApiConstants.API_LIVE_SCORE_COMPETITION_SUCCESS:
      return {
        ...state,
        loader: false,
        List: payload.payload,
      };
    case ApiConstants.API_LIVE_SCORE_COMPETITION_ERROR:
      return {
        ...state,
        loader: false,
        errorMessage: payload.payload,
      };
    case ApiConstants.API_LIVE_SCORE_COMPETITION_DELETE_INITIATE:
      return {
        ...state,
        loader: true,
        ownedLoad: true,
      };
    case ApiConstants.API_LIVE_SCORE_COMPETITION_DELETE_SUCCESS:
      if (payload.key === 'own') {
        let ownIndex = state.ownedCompetitions.findIndex(data => data.id === payload.payload.id);
        state.ownedCompetitions.splice(ownIndex, 1);
      }
      if (payload.key === 'part') {
        let partIndex = state.participatingInComptitions.findIndex(
          data => data.id === payload.payload.id,
        );
        state.participatingInComptitions.splice(partIndex, 1);
      }
      return {
        ...state,
        loader: false,
        ownedLoad: false,
      };
    case ApiConstants.API_LIVE_SCORE_COMPETITION_DELETE_ERROR:
      return {
        ...state,
        loader: false,
        deleteError: payload.payload.message,
      };

    //End competition
    case ApiConstants.API_LIVE_SCORE_COMPETITION_END_INITIATE:
      return {
        ...state,
        loader: true,
        ownedLoad: true,
      };
    case ApiConstants.API_LIVE_SCORE_COMPETITION_END_SUCCESS:
      if (payload.key === 'own') {
        let ownIndex = state.ownedCompetitions.findIndex(
          data => data.uniqueKey === payload.payload.compKey,
        );
        state.ownedCompetitions[ownIndex].statusRefId = LsCompStatus.Ended;
      }
      return {
        ...state,
        loader: false,
        ownedLoad: false,
      };
    case ApiConstants.API_LIVE_SCORE_COMPETITION_END_ERROR:
      return {
        ...state,
        loader: false,
        ownedLoad: false,
        endError: payload.payload.message,
      };

    //Change competition visibility
    case ApiConstants.API_LIVE_SCORE_COMPETITION_CHANGE_VISIBILITY_INITIATE:
      return {
        ...state,
        loader: true,
        ownedLoad: true,
      };
    case ApiConstants.API_LIVE_SCORE_COMPETITION_CHANGE_VISIBILITY_SUCCESS:
      if (payload.key === 'own') {
        let ownIndex = state.ownedCompetitions.findIndex(
          data => data.uniqueKey === payload.payload.compKey,
        );
        state.ownedCompetitions[ownIndex].statusRefId = payload.payload.status;
      }
      return {
        ...state,
        loader: false,
        ownedLoad: false,
      };
    case ApiConstants.API_LIVE_SCORE_COMPETITION_CHANGE_VISIBILITY_ERROR:
      return {
        ...state,
        loader: false,
        ownedLoad: false,
        endError: payload.payload.message,
      };

    //LIve score year reducer

    case ApiConstants.API_ONLY_YEAR_LIST_LOAD:
      return { ...state, loader: true };

    case ApiConstants.API_ONLY_YEAR_LIST_SUCCESS:
      return {
        ...state,
        loader: false,
        yearList: payload.result,
        // status: action.status
      };

    /////livescore own part competition listing
    case ApiConstants.API_LIVESCORE_OWN_PART_COMPETITION_LIST_LOAD:
      return {
        ...state,
        loader: true,
        ownedLoad: payload.key === 'own' || payload.key === 'all',
        partLoad: payload.key === 'part' || payload.key === 'all',
        allCompListLoad: true,
        competitionListActionObject: payload,
      };

    case ApiConstants.API_LIVESCORE_OWN_PART_COMPETITION_LIST_SUCCESS:
      let allData = payload.payload;
      if (payload.key === 'own' || payload.key === 'all') {
        state.ownedCompetitions = isArrayNotEmpty(allData.ownedCompetitions.competitions)
          ? allData.ownedCompetitions.competitions
          : [];
        state.ownedTotalCount = allData.ownedCompetitions.page
          ? allData.ownedCompetitions.page.totalCount
          : 1;
        state.ownedCurrentPage = allData.ownedCompetitions.page
          ? allData.ownedCompetitions.page.currentPage
          : 1;
      }
      if (payload.key === 'part' || payload.key === 'all') {
        state.participatingInComptitions = isArrayNotEmpty(
          allData.participatingInCompetitions.competitions,
        )
          ? allData.participatingInCompetitions.competitions
          : [];
        state.participateTotalCount = allData.participatingInCompetitions.page
          ? allData.participatingInCompetitions.page.totalCount
          : 1;
        state.participateCurrentPage = allData.participatingInCompetitions.page
          ? allData.participatingInCompetitions.page.currentPage
          : 1;
      }
      return {
        ...state,
        loader: false,
        ownedLoad: false,
        partLoad: false,
        allCompListLoad: false,
      };
    case ApiConstants.API_LIVESCORE_OWN_PART_COMPETITION_LIST_ERROR:
      return {
        ...state,
        loader: false,
        ownedLoad: false,
        partLoad: false,
      };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.competitionListActionObject = null;
      return { ...state, onLoad: false };

    case ApiConstants.SET_LIVE_SCORE_PARTICIPATE_PAGE_SIZE:
      return {
        ...state,
        participatePageSize: payload.pageSize,
      };

    case ApiConstants.SET_LIVE_SCORE_PARTICIPATE_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        participateCurrentPage: payload.pageNum,
      };

    case ApiConstants.SET_LIVE_SCORE_OWNED_PAGE_SIZE:
      return {
        ...state,
        ownedPageSize: payload.pageSize,
      };

    case ApiConstants.SET_LIVE_SCORE_OWNED_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        ownedCurrentPage: payload.pageNum,
      };
    case ApiConstants.API_BULK_LADDER_EXPORT_FILE_LOAD: {
      return {
        ...state,
        exportingBulkLadder: true
      }
    }
    case ApiConstants.API_BULK_LADDER_EXPORT_FILE_SUCCESS: {
      return {
        ...state,
        exportingBulkLadder: false
      }
    }
    case ApiConstants.API_BULK_LADDER_EXPORT_FILE_FAILED: {
      return {
        ...state,
        exportingBulkLadder: false
      }
    }

    default:
      return state;
  }
}
