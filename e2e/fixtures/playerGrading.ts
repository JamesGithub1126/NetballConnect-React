import { getJsonfromSheet } from '../utils/convertGoogleSheet_to_Json';

export interface PlayerGrading {
    playergrading: any;
}
export const player_Grading: PlayerGrading = {
    playergrading: getJsonfromSheet(9).then(player_Grading => {
        return player_Grading;
    }),
};
