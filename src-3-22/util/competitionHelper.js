import { getOrganisationData } from './sessionStorage';

export const isCompetitionOrganiser = competitionCreatorOrgUniqueKey => {
  const organisationUniqueKey = getOrganisationData()?.organisationUniqueKey;
    return competitionCreatorOrgUniqueKey && organisationUniqueKey
    ? competitionCreatorOrgUniqueKey === organisationUniqueKey
    : false;
};
