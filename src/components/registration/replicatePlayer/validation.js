import { message } from 'antd';
import { RegistrationUserRoles } from 'enums/registrationEnums';
import AppConstants from 'themes/appConstants';

const validate = selections => {
  const { roleId, competitionUniqueKey, organisationUniqueKey, divisionId } = selections;
  if (!roleId) {
    message.error(AppConstants.pleaseSelectRole);
    return false;
  }
  if (!competitionUniqueKey || !competitionUniqueKey.length) {
    message.error(AppConstants.pleaseSelectCompetitions);
    return false;
  }
  if (!organisationUniqueKey) {
    message.error(AppConstants.pleaseSelectAffiliate);
    return false;
  }
  if (roleId === RegistrationUserRoles.Player && !divisionId) {
    message.error(AppConstants.pleaseSelectDivision);
    return false;
  }
  return true;
};

export default validate;
