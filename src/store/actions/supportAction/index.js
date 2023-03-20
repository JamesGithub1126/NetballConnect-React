import ApiConstants from '../../../themes/apiConstants';

function getSupportContentAction() {
  return {
    type: ApiConstants.API_SUPPORT_CONTENT_LOAD,
  };
}

export { getSupportContentAction };
