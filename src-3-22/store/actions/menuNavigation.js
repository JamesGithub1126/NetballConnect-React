import ApiConstants from '../../themes/apiConstants';

function MenuNavigationAction(menuName) {
  const action = {
    type: ApiConstants.MENU_NAVIGATION_CHANGE,
    menuName: menuName,
  };

  return action;
}

export { MenuNavigationAction };
