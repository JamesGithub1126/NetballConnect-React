import ApiConstants from 'themes/apiConstants';

function getUmpirePoolData(payload) {
  return {
    type: ApiConstants.API_GET_UMPIRE_POOL_DATA_LOAD,
    payload,
  };
}

function saveUmpirePoolData(payload) {
  return {
    type: ApiConstants.API_SAVE_UMPIRE_POOL_DATA_LOAD,
    payload,
  };
}

function updateUmpirePoolData(payload) {
  return {
    type: ApiConstants.API_UPDATE_UMPIRE_POOL_DATA_LOAD,
    payload,
  };
}

function updateUmpirePoolManyData(payload) {
  return {
    type: ApiConstants.API_UPDATE_UMPIRE_POOL_MANY_DATA_LOAD,
    payload,
  };
}

function deleteUmpirePoolData(payload) {
  return {
    type: ApiConstants.API_DELETE_UMPIRE_POOL_DATA_LOAD,
    payload,
  };
}

function updateUmpirePoolToDivision(payload) {
  return {
    type: ApiConstants.API_UPDATE_UMPIRE_POOL_TO_DIVISION_LOAD,
    payload,
  };
}

function applyUmpireAllocatioAlgorithm(payload) {
  return {
    type: ApiConstants.API_APPLY_UMPIRE_ALLOCATION_ALGORITHM_LOAD,
    payload,
  };
}

export {
  getUmpirePoolData,
  saveUmpirePoolData,
  updateUmpirePoolData,
  updateUmpirePoolManyData,
  deleteUmpirePoolData,
  updateUmpirePoolToDivision,
  applyUmpireAllocatioAlgorithm,
};
