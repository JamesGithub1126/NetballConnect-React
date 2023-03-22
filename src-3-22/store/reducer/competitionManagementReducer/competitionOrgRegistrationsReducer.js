import ApiConstants from '../../../themes/apiConstants';
import { isArrayNotEmpty } from '../../../util/helpers';

const initialState = {
  onLoad: false,
  error: null,
  compOrgRegistrations: [],
  status: 0
};


function CompetitionOrgRegistrations(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_GET_COMPETITION_ORG_REGISTRATIONS_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    //competition  own final team grading data get api
    case ApiConstants.API_GET_COMPETITION_ORG_REGISTRATIONS_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_COMPETITION_ORG_REGISTRATIONS_SUCCESS:
      return {
        ...state,
        compOrgRegistrations: isArrayNotEmpty(action.result) ? action.result : [],
        onLoad: false,
        error: null,
      };

    default:
      return state;
  }
}

export default CompetitionOrgRegistrations
