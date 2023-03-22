import ApiConstants from '../../../themes/apiConstants';

/* Get Competition Org Registrations */
function getCompetitionOrgRegistrationsAction(payload) {
  return {
    type: ApiConstants.API_GET_COMPETITION_ORG_REGISTRATIONS_LOAD,
    payload,
  };
}

export {
  getCompetitionOrgRegistrationsAction
}
