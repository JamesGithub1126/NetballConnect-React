import { getJsonfromSheet } from '../utils/convertGoogleSheet_to_Json';

export interface DirectCompetitionCreation {
  direct_Competition: any;
}

export const directCompetitionCreation: DirectCompetitionCreation = {
  direct_Competition: getJsonfromSheet(6).then(directCompetitionCreation => {
    return directCompetitionCreation;
  }),
};
