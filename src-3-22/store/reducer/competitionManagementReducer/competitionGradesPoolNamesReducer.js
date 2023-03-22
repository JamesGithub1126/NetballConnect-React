import ApiConstants from '../../../themes/apiConstants';

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  typeOfGrades: [
    { id: 1, description: 'Alphabetic' },
    { id: 2, description: 'Numeric' },
    { id: 3, description: 'Custom' },
  ],
};

function competitionGradesPoolReducer(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_GET_COMPETITION_GRADES_POOLS_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_COMPETITION_GRADES_POOLS_FAIL:
    case ApiConstants.API_COMPETITION_GRADES_POOLS_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    default:
      return state;
  }
}

export default competitionGradesPoolReducer;
