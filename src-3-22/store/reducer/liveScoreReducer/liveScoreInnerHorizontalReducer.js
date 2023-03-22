import ApiConstants from '../../../themes/apiConstants';
import { getLiveScoreCompetition } from '../../../util/sessionStorage';

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  competitionList: [],
  success: false,
};
function innerHorizontalState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_INNER_HORIZONTAL_COMPETITION_LIST_LOAD:
      return { ...state, onLoad: true, success: false };

    case ApiConstants.API_INNER_HORIZONTAL_COMPETITION_LIST_SUCCESS:
      let result = action.result;
      return {
        ...state,
        onLoad: false,
        competitionList: result,
        status: action.status,
        success: true,
      };

    case ApiConstants.API_YEAR_LIST_LOAD:
      return { ...state, error: null };

    case ApiConstants.API_ONLY_YEAR_LIST_LOAD:
      return { ...state, error: null };

    case ApiConstants.API_INNER_HORIZONTAL_FAIL:
      return { ...state, onLoad: false, success: false };

    case ApiConstants.API_INNER_HORIZONTAL_ERROR:
      return {
        ...state,
        onLoad: false,
        success: false,
        error: action.error,
      };

    case ApiConstants.API_UPDATE_INNER_HORIZONTAL:
      // const livescoreSavedCompObject_2 = JSON.parse(getLiveScoreCompetition())
      state.competitionList = [];
      return {
        ...state,
      };

    case ApiConstants.API_INITIALIZE_COMP_DATA:
      if (getLiveScoreCompetition()) {
        const livescoreSavedCompObject = JSON.parse(getLiveScoreCompetition());
        state.competitionList.push(livescoreSavedCompObject);
        let data = state.competitionList;
        let dataArr = data.map(item => {
          return [item.longName, item];
        });
        let maparr = new Map(dataArr);
        let resultData = [...maparr.values()];
        state.competitionList = resultData;
      }

      return {
        ...state,
      };

    case ApiConstants.LiveScore_SETTING_SUCCESS:
      state.competitionList.push(action.payload);
      return {
        ...state,
      };

    default:
      return state;
  }
}

export default innerHorizontalState;
