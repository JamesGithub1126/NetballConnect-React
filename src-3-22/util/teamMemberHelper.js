import { getAge, isArrayNotEmpty } from './helpers';

import { getChildEmail } from './registrationHelper';
import moment from 'moment';
const ADULT = 18;

export const showMemberEmailValidation = teamRegistrationObj => {
  try {
    let error = false;
    let memberEmails = [];
    let teamMembers = teamRegistrationObj.teamMembers;
    if (teamRegistrationObj.email) {
      memberEmails.push(teamRegistrationObj.email.toLowerCase().trim());
    }
    for (let teamMember of teamMembers) {
      if (teamMember.email) {
        let memberEmail = teamMember.email.toLowerCase().trim();
        let isChild =
          teamMember.payingFor == 1 &&
          getAge(teamMember.dateOfBirth) <= ADULT &&
          teamMember.parentOrGuardian &&
          teamMember.parentOrGuardian.length > 0 &&
          teamMember.parentOrGuardian.some(p => p.email?.toLowerCase().trim() === memberEmail);
        if (isChild) {
          teamMember.referParentEmail = true;
          memberEmail = getChildEmail(memberEmail, teamMember.firstName);
        } else {
          if (teamMember.referParentEmail) {
            teamMember.referParentEmail = false;
          }
        }
        if (memberEmails.includes(memberEmail)) {
          error = true;
        }
        memberEmails.push(memberEmail);
      }
    }
    return error;
  } catch (ex) {
    console.log('Error in showMemberEmailValidation::' + ex);
  }
};

export const showMemberTypeValidation = teamMember => {
  try {
    let error = false;
    if (teamMember.membershipProductTypes.find(x => x.isChecked == true)) {
      error = false;
    } else {
      error = true;
    }
    return error;
  } catch (ex) {
    console.log('Error in showMemberTypeValidation::' + ex);
  }
};
const getMemberNameMobileKey = teamMember => {
  return (
    teamMember.firstName.toLowerCase().trim() +
    '_' +
    teamMember.lastName.toLowerCase().trim() +
    '_' +
    teamMember.mobileNumber
  );
};
const getMemberNameDobKey = teamMember => {
  return (
    teamMember.firstName.toLowerCase().trim() +
    '_' +
    teamMember.lastName.toLowerCase().trim() +
    '_' +
    teamMember.dateOfBirth
  );
};
export const showMemberDetailValidation = teamRegistrationObj => {
  try {
    let teamMembers = teamRegistrationObj.teamMembers;
    let error = false;
    let memberDetails = [];
    if (teamRegistrationObj.firstName) {
      memberDetails.push(getMemberNameMobileKey(teamRegistrationObj));
      memberDetails.push(getMemberNameDobKey(teamRegistrationObj));
    }
    for (let teamMember of teamMembers) {
      if (teamMember.firstName) {
        let memberNameMobile = getMemberNameMobileKey(teamMember);
        if (memberDetails.includes(memberNameMobile)) {
          error = true;
          return error;
        }
        memberDetails.push(memberNameMobile);
        if (teamMember.payingFor == 1) {
          let memberNameDob = getMemberNameDobKey(teamMember);
          if (memberDetails.includes(memberNameDob)) {
            error = true;
            return error;
          }
          memberDetails.push(memberNameDob);
        }
      }
    }
    return error;
  } catch (ex) {
    console.log('Error in showMemberEmailValidation::' + ex);
  }
};
export const checkDobRestriction = (member, dobRestriction, personNames) => {
  let isValid = true;
  let dobInput = moment(member.dateOfBirth, 'MM-DD-YYYY');
  if (!dobInput.isValid()) {
    dobInput = moment(member.dateOfBirth, 'YYYY-MM-DD');
  }
  let dob = dobInput.format('YYYY-MM-DD');
  if (dobRestriction.fromDate && dobRestriction.toDate) {
    if (
      !(
        moment(dob).isSameOrAfter(
          moment(dobRestriction.fromDate, 'YYYY-MM-DD').format('YYYY-MM-DD'),
        ) &&
        moment(dob).isSameOrBefore(moment(dobRestriction.toDate, 'YYYY-MM-DD').format('YYYY-MM-DD'))
      )
    ) {
      isValid = false;
      personNames.push({ member: member, restriction: dobRestriction });
    }
  }
  return isValid;
};
export const checkDobDivisionRestriction = teamMembersSaveTemp => {
  try {
    const selectedDivision = teamMembersSaveTemp.divisions[0];
    let personNames = [];
    let errorMessage = '';
    if (isArrayNotEmpty(teamMembersSaveTemp.teamMembers)) {
      for (let member of teamMembersSaveTemp.teamMembers) {
        let selectedPlayerTypes = [];
        for (let type of member.membershipProductTypes) {
          if (type.isChecked) {
            if (
              member.payingFor == 1 &&
              member.dateOfBirth &&
              !checkDobRestriction(member, type, personNames)
            ) {
              break;
            }
            if (type.isPlayer == 1) {
              if (
                member.payingFor == 1 &&
                member.dateOfBirth &&
                !checkDobRestriction(member, selectedDivision, personNames)
              ) {
                break;
              }
              selectedPlayerTypes.push(type);
            }
          }
        }
        if (selectedPlayerTypes.length > 1) {
          let personsString = member.firstName + ' ' + member.lastName;
          errorMessage = `${personsString} cannot register in two player types`;
          return errorMessage;
        }
      }
    }
    if (isArrayNotEmpty(personNames)) {
      let invalidPerson = personNames[0];
      let fromDate = moment(invalidPerson.restriction.fromDate, 'YYYY-MM-DD').format('DD-MM-YYYY');
      let toDate = moment(invalidPerson.restriction.toDate, 'YYYY-MM-DD').format('DD-MM-YYYY');
      let personsString = invalidPerson.member.firstName + ' ' + invalidPerson.member.lastName;
      let restrictionName =
        invalidPerson.restriction.divisionName || invalidPerson.restriction.name;

      errorMessage =
        restrictionName +
        ' has a DOB restriction of ' +
        fromDate +
        ' to ' +
        toDate +
        '. ' +
        personsString +
        ' is not allowed to register to this competition.';
    }
    return errorMessage;
  } catch (ex) {
    console.log('Error in checkGenderDivisionRestriction::' + ex);
  }
};
