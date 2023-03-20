import ApiConstants from '../../../themes/apiConstants';

function umpireListAction(data) {
  const action = {
    type: ApiConstants.API_UMPIRE_LIST_LOAD,
    data,
  };
  return action;
}
function newUmpireListAction(data) {
  const action = {
    type: ApiConstants.API_NEW_UMPIRE_LIST_LOAD,
    data,
  };
  return action;
}

function availableUmpireCoachListAction(data) {
  const action = {
    type: ApiConstants.API_AVAILABLE_UMPIRECOACH_LIST_LOAD,
    data,
  };
  return action;
}

// new for umpire list

function getUmpireList(data) {
  const action = {
    type: ApiConstants.API_GET_UMPIRE_LIST_LOAD,
    data,
  };

  return action;
}

function addUmpireAction(data, extraData, isUmpire, isUmpireCoach, isOtherOfficial) {
  const action = {
    type: ApiConstants.API_ADD_UMPIRE_LOAD,
    data,
    extraData,
    isUmpire,
    isUmpireCoach,
    isOtherOfficial,
  };
  return action;
}

function updateAddUmpireData(data, key) {
  const action = {
    type: ApiConstants.UPDATE_ADD_UMPIRE_DATA,
    data,
    key,
  };
  return action;
}

function getUmpireAffiliateList(data) {
  const action = {
    type: ApiConstants.API_GET_UMPIRE_AFFILIATE_LIST_LOAD,
    data,
  };
  return action;
}

function exportUmpireListAction(data) {
  const action = {
    type: ApiConstants.API_EXPORT_UMPIRE_LIST_LOAD,
    data,
  };
  return action;
}

function umpireSearchAction(data) {
  const action = {
    type: ApiConstants.API_UMPIRE_SEARCH_LOAD,
    data,
  };
  return action;
}

function umpireClear() {
  const action = {
    type: ApiConstants.CLEAR_UMPIRE_SEARCH,
  };
  return action;
}

function umpireMainListAction(data) {
  const action = {
    type: ApiConstants.API_UMPIRE_MAIN_LIST_LOAD,
    data,
  };
  return action;
}

function setUmpireListPageSizeAction(pageSize) {
  const action = {
    type: ApiConstants.SET_UMPIRE_LIST_PAGE_SIZE,
    pageSize,
  };

  return action;
}

function setUmpireListPageNumberAction(pageNum) {
  const action = {
    type: ApiConstants.SET_UMPIRE_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };

  return action;
}

function getRankedUmpiresCount(data) {
  const action = {
    type: ApiConstants.API_GET_RANKED_UMPIRES_COUNT,
    data,
  };
  return action;
}

function updateUmpireRank(data) {
  const action = {
    type: ApiConstants.API_UPDATE_UMPIRE_RANK,
    data,
  };
  return action;
}

function getUmpireActivityListAction(data) {
  const action = {
    type: ApiConstants.API_GET_UMPIRES_ACTIVITY_LIST_LOAD,
    data,
  };
  return action;
}

function setPageNumberAction(pageNum) {
  const action = {
    type: ApiConstants.SET_UMPIRE_ACTIVITY_PAGE_CURRENT_NUMBER,
    pageNum,
  };
  return action;
}

function setPageSizeAction(pageSize) {
  const action = {
    type: ApiConstants.SET_UMPIRE_ACTIVITY_PAGE_SIZE_NUMBER,
    pageSize,
  };
  return action;
}

export {
  umpireListAction,
  addUmpireAction,
  updateAddUmpireData,
  getUmpireAffiliateList,
  umpireSearchAction,
  umpireClear,
  umpireMainListAction,
  newUmpireListAction,
  getUmpireList,
  setUmpireListPageSizeAction,
  setUmpireListPageNumberAction,
  getRankedUmpiresCount,
  updateUmpireRank,
  getUmpireActivityListAction,
  setPageNumberAction,
  exportUmpireListAction,
  setPageSizeAction,
  availableUmpireCoachListAction,
};
