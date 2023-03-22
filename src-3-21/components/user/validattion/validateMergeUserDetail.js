import AppConstants from '../../../themes/appConstants';

/**
 * The method compares user data for both users and
 * checks if all the required fields are complete.
 * It will return error message or null if all user data is valid
 * @param {*} firstUserData
 * @param {*} secondUserData
 * @param {*} payload
 * @returns validation message or null if the data is valid
 */
const validateUserDetails = (firstUserData, secondUserData, payload) => {
  if ((firstUserData.externalUserId || secondUserData.externalUserId) && !payload.externalUserId) {
    return AppConstants.selectExternalUserRegistration;
  }
  if ((firstUserData.photoUrl || secondUserData.photoUrl) && !payload.photoUrl) {
    return AppConstants.selectUserPhoto;
  }
  return null;
};

export default validateUserDetails;
