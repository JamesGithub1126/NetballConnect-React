import { GENDER } from './enums';

export const getGenderDescription = item => {
  if (!item) return '';
  let genderRefId = item.genderRefId;
  switch (genderRefId) {
    case GENDER.MALE:
      return 'Male';
    case GENDER.FEMALE:
      return 'Female';
    case GENDER.MALE:
      return 'Male';
    case GENDER.NON_BINARY:
      return 'Non-Binary';
    case GENDER.DIFFERENT_IDENTITY:
      return item.genderOther || '';
    default:
      return '';
  }
};
