import ApiConstants from '../../../themes/apiConstants';

//shop setting get API
function getShopSettingAction() {
  const action = {
    type: ApiConstants.API_GET_SHOP_SETTING_LOAD,
  };
  return action;
}

//shop setting create address
function createAddressAction(payload, key) {
  const action = {
    type: ApiConstants.API_CREATE_SHOP_SETTING_ADDRESS_LOAD,
    payload,
    key,
  };
  return action;
}

//// add/edit setting screen data
function onChangeSettingsData(data, key, index) {
  const action = {
    type: ApiConstants.SHOP_SETTINGS_DETAILS_ONCHANGE,
    data,
    key,
    index,
  };
  return action;
}
export { getShopSettingAction, createAddressAction, onChangeSettingsData };
