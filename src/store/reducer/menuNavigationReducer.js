import ApiConstants from '../../themes/apiConstants';

const initialState = {
  menuName: 'Home',
};

function menuNavigation(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.MENU_NAVIGATION_CHANGE:
      return {
        ...state,
        menuName: action.menuName,
      };

    default:
      return state;
  }
}

export default menuNavigation;
