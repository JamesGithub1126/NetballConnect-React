import { getJsonfromSheet } from '../utils/convertGoogleSheet_to_Json';
export interface AffiliateCompetitionCreation {
  affiliate_Competition: any;
}

export const affiliatetCompetitionCreation: AffiliateCompetitionCreation = {
  affiliate_Competition: getJsonfromSheet(6).then(affiliatetCompetitionCreation => {
    return affiliatetCompetitionCreation;
  }),
};
