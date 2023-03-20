import { getJsonfromSheet } from '../utils/convertGoogleSheet_to_Json';
export interface User {
  usercredential: any;
}

export const normalUser: User = {
  usercredential: getJsonfromSheet(0).then(Users => {
    return Users;
  }),
};

export const childUser: User = {
  usercredential: getJsonfromSheet(0).then(Users => {
    return Users;
  }),
};
