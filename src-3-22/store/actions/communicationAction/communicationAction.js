import ApiConstants from '../../../themes/apiConstants';

function communicationListAction(data) {
  const action = {
    type: ApiConstants.API_COMMUNICATION_LIST_LOAD,
    data,
  };
  return action;
}

function addCommunicationAction(data) {
  const action = {
    type: ApiConstants.API_ADD_COMMUNICATION_LOAD,
    data,
  };
  return action;
}

function refreshCommunicationModuleDataAction() {
  const action = {
    type: ApiConstants.API_REFRESH_COMMUNICATION_DATA,
  };
  return action;
}

function updateCommunicationModuleData(data) {
  const action = {
    type: ApiConstants.API_UPDATE_COMMUNICATION_DATA,
    data,
  };
  return action;
}

// Communication publish
function communicationPublishAction(data) {
  const action = {
    type: ApiConstants.API_COMMUNICATION_PUBLISH_LOAD,
    data,
  };
  return action;
}

// delete Communication data
function deleteCommunicationAction(id) {
  const action = {
    type: ApiConstants.API_DELETE_COMMUNICATION_LOAD,
    data: id,
  };
  return action;
}

// set Communication page size
function setCommunicationTableListPageSizeAction(pageSize) {
  return {
    type: ApiConstants.SET_COMMUNICATION_LIST_PAGE_SIZE,
    pageSize,
  };
}

// set Communication current page
function setCommunicationTableListPageNumberAction(pageNum) {
  return {
    type: ApiConstants.SET_COMMUNICATION_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };
}

export {
  communicationListAction,
  addCommunicationAction,
  refreshCommunicationModuleDataAction,
  communicationPublishAction,
  deleteCommunicationAction,
  updateCommunicationModuleData,
  setCommunicationTableListPageSizeAction,
  setCommunicationTableListPageNumberAction,
};
