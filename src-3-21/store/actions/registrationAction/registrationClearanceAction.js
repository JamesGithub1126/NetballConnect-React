import ApiConstants from '../../../themes/apiConstants';

function getAllCompetitions(yearId) {
  return {
    type: ApiConstants.API_GET_REG_COMPETITIONS_LOAD,
    yearId,
  };
}

function getRegistrationClearanceList(payload, sortBy, sortOrder) {
  return {
    type: ApiConstants.API_GET_REG_CLEARANCE_LOAD,
    payload,
    sortBy,
    sortOrder,
  };
}

function getPastRegForClearanceAction(payload) {
  return {
    type: ApiConstants.API_CLEARANCE_GET_PAST_REG_LOAD,
    payload,
  };
}

function changeClearanceApproverAction(payload) {
  return {
    type: ApiConstants.API_CLEARANCE_CHANGE_APPROVER_LOAD,
    payload,
  };
}

function approveRegistrationClearances(payload) {
  return {
    type: ApiConstants.API_REG_CLEARANCE_APPROVE_LOAD,
    payload,
  };
}

function exportRegistrationClearance(payload, sortBy, sortOrder) {
  return {
    type: ApiConstants.API_REG_CLEARANCE_EXPORT_LOAD,
    payload,
    sortBy,
    sortOrder
  };
}

function getRegistrationChangeReview(payload) {
  return {
    type: ApiConstants.API_GET_REGISTRATION_CHANGE_REVIEW_LOAD,
    payload,
  };
}

function saveRegistrationChangeReview(payload) {
  return {
    type: ApiConstants.API_SAVE_REGISTRATION_CHANGE_REVIEW_LOAD,
    payload,
  };
}

function getTransferCompetitionsAction(payload) {
  return {
    type: ApiConstants.API_GET_TRANSFER_COMPETITIONS_LOAD,
    payload,
  };
}

function getMoveCompDataAction(payload) {
  return {
    type: ApiConstants.API_GET_MOVE_COMP_DATA_LOAD,
    payload,
  };
}

function moveCompetitionAction(payload) {
  return {
    type: ApiConstants.API_MOVE_COMPETITION_LOAD,
    payload,
  };
}

function setRegistrationChangeRefundedOffline(payload) {
  return {
    type: ApiConstants.API_REGISTRATION_CHANGE_REFUNDED_OFFLINE_LOAD,
    payload,
  };
}

function getDeRegisterDataAction(payload) {
  const action = {
    type: ApiConstants.API_GET_DE_REGISTRATION_LOAD,
    payload,
  };

  return action;
}

function updateClearanceDataAction(payload) {
  return {
    type: ApiConstants.API_UPDATE_CLEARANCE_LOAD,
    payload,
  };
}

function saveRegistrationClearances(payload) {
  return {
    type: ApiConstants.API_REG_CLEARANCE_SAVE_LOAD,
    payload,
  };
}

export {
  getAllCompetitions,
  getRegistrationClearanceList,
  approveRegistrationClearances,
  exportRegistrationClearance,
  getRegistrationChangeReview,
  saveRegistrationChangeReview,
  getTransferCompetitionsAction,
  getMoveCompDataAction,
  moveCompetitionAction,
  getDeRegisterDataAction,
  setRegistrationChangeRefundedOffline,
  updateClearanceDataAction,
  saveRegistrationClearances,
  getPastRegForClearanceAction,
  changeClearanceApproverAction,
};
