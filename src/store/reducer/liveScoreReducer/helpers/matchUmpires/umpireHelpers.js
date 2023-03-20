import { EntityType, UmpireSequence } from 'enums/enums';
import AppConstants from 'themes/appConstants';
import { ROLE } from 'util/enums';
import { isNotNullAndUndefined } from 'util/helpers';
import { getRecordUmpireType } from 'util/sessionStorage';

//variables
export const umpireSearchRoleIds = [
  ROLE.UMPIRE,
  ROLE.UMPIRE_COACH,
  ROLE.UMPIRE_RESERVE,
  ROLE.PLAYER,
  ROLE.MANAGER,
  ROLE.COACH,
  ROLE.MEMBER,
];

const UmpireFields = {
  umpire1: {
    sequence: 1,
    roleId: ROLE.UMPIRE,
    name: AppConstants.umpire1,
    orgHeading: AppConstants.umpire1Club,
    orgPlaceholder: AppConstants.selectUmpire1Organisation,
    heading: AppConstants.umpire1Name,
    rateHeading: AppConstants.umpire1Rate,
    selectPlaceholder: AppConstants.selectUmpire1Name,
    searchPlaceholder: `Search ${AppConstants.umpire1} Name`,
    inputPlaceholder: AppConstants.enterUmpire1name,
  },
  umpire2: {
    sequence: 2,
    roleId: ROLE.UMPIRE,
    name: AppConstants.umpire2,
    orgHeading: AppConstants.umpire2Club,
    orgPlaceholder: AppConstants.selectUmpire2Organisation,
    heading: AppConstants.umpire2Name,
    rateHeading: AppConstants.umpire2Rate,
    selectPlaceholder: AppConstants.selectUmpire2Name,
    searchPlaceholder: `Search ${AppConstants.umpire2} Name`,
    inputPlaceholder: AppConstants.enterUmpire2name,
  },
  umpire3: {
    sequence: 3,
    roleId: ROLE.UMPIRE,
    name: AppConstants.umpire3,
    orgHeading: AppConstants.umpire3Club,
    orgPlaceholder: AppConstants.selectUmpire3Organisation,
    heading: AppConstants.umpire3Name,
    rateHeading: AppConstants.umpire3Rate,
    selectPlaceholder: AppConstants.selectUmpire3Name,
    searchPlaceholder: `Search ${AppConstants.umpire3} Name`,
    inputPlaceholder: AppConstants.enterUmpire3name,
  },
  umpire4: {
    sequence: 4,
    roleId: ROLE.UMPIRE,
    name: AppConstants.umpire4,
    orgHeading: AppConstants.umpire4Club,
    orgPlaceholder: AppConstants.selectUmpire4Organisation,
    heading: AppConstants.umpire4Name,
    rateHeading: AppConstants.umpire4Rate,
    selectPlaceholder: AppConstants.selectUmpire4Name,
    searchPlaceholder: `Search ${AppConstants.umpire4} Name`,
    inputPlaceholder: AppConstants.enterUmpire4name,
  },
  umpireCoach: {
    sequence: 5,
    roleId: ROLE.UMPIRE_COACH,
    name: AppConstants.umpireCoach,
    orgHeading: AppConstants.umpireCoachClub,
    orgPlaceholder: AppConstants.selectUmpireCoachOrganisation,
    selectPlaceholder: `Select ${AppConstants.umpireCoach}`,
    searchPlaceholder: `Search ${AppConstants.umpireCoach}`,
    heading: AppConstants.umpireCoach,
    rateHeading: AppConstants.umpireCoachRate,
  },
  umpireReserve: {
    sequence: 0,
    roleId: ROLE.UMPIRE_RESERVE,
    name: AppConstants.umpireReserve,
    orgHeading: AppConstants.umpireReserveClub,
    orgPlaceholder: AppConstants.selectUmpireReserveOrganisation,
    selectPlaceholder: `Select ${AppConstants.umpireReserve}`,
    searchPlaceholder: `Search ${AppConstants.umpireCoach}`,
    heading: AppConstants.umpireReserve,
    rateHeading: AppConstants.umpireResRate,
  },
};

export function getRoleFromSequence(sequence) {
  switch (sequence) {
    case UmpireSequence.UmpireCoach:
      return ROLE.UMPIRE_COACH;
    case UmpireSequence.UmpireReserve:
      return ROLE.UMPIRE_RESERVE;
    default:
      return ROLE.UMPIRE;
  }
}

export function getUmpireField(sequence) {
  switch (sequence) {
    case UmpireSequence.Umpire1:
      return UmpireFields.umpire1;
    case UmpireSequence.Umpire2:
      return UmpireFields.umpire2;
    case UmpireSequence.Umpire3:
      return UmpireFields.umpire3;
    case UmpireSequence.Umpire4:
      return UmpireFields.umpire4;
    case UmpireSequence.UmpireCoach:
      return UmpireFields.umpireCoach;
    case UmpireSequence.UmpireReserve:
      return UmpireFields.umpireReserve;
  }
}

export function checkSelectedUmpireIsAvailable(umpires, key) {
  for (let umpire of umpires) {
    if (umpire.key == key) {
      return true;
    }
  }
  return false;
}

export function createUmpireArray(umpiresData, accreditationArr) {
  let umpireArray = [];
  for (let i in umpiresData) {
    //variables
    const userRoleCheck = umpiresData[i].userRoleEntities;
    const linkedEntity = umpiresData[i].linkedEntity;

    for (let j in userRoleCheck) {
      for (let k in linkedEntity) {
        //variables
        const userId = umpiresData[i].id;
        const userName = `${umpiresData[i].firstName} ${umpiresData[i].lastName}`;
        const roleId = userRoleCheck[j].roleId;
        const accreditationBadge = getAccreditationValue(
          accreditationArr,
          umpiresData[i].accreditationLevelUmpireRefId,
        );
        const competitionOrganisationName =
          linkedEntity[k].entityTypeId !== 1 ? linkedEntity[k].name : null;
        const competitionOrganisationId = getCompetitionOrganisationId(linkedEntity[k]);

        //umpire object
        let umpireObj = createUmpireRecord();
        umpireObj.key = `${userId}_${competitionOrganisationId}`;
        umpireObj.selectionName = `${userName}${
          accreditationBadge ? ` - ${accreditationBadge}` : ``
        }${competitionOrganisationName ? ` - ${competitionOrganisationName}` : ``}`;
        umpireObj.roleId = roleId;
        umpireObj.userId = userId;
        umpireObj.competitionOrganisationId = competitionOrganisationId;
        umpireObj.umpireName = userName;

        umpireArray.push(umpireObj);
      }
    }
  }
  return umpireArray;
}

export function setUmpireAvailable(umpireList, newUmpireList) {
  umpireList.forEach(umpire => {
    umpire.disabled =
      newUmpireList.findIndex(nu => Number(nu.userId) == Number(umpire.userId)) == -1;
  });
}

export function disableSelectedUmpires(umpireList, umpireSelectionDict, currSequence) {
  let usedUmpires = [];
  //find all selected umpires, execept for the one in the current sequence
  for (let key in umpireSelectionDict) {
    if (
      isNotNullAndUndefined(key) &&
      umpireSelectionDict[key] &&
      Number(key) !== currSequence //do no disable for own list
    ) {
      usedUmpires.push(umpireSelectionDict[key]);
    }
  }
  //disable any umpire in the current list that is already selected in another sequence
  umpireList.forEach(umpire => {
    umpire.disabled =
      usedUmpires.findIndex(nu => Number(nu.userId) == Number(umpire.userId)) !== -1;
  });
}

export function populateUmpireStateData(state, umpires) {
  for (let umpire of umpires) {
    //variables
    const competitionOrganisationId = umpire.competitionOrganisations[0].id;
    const competitionOrganisationName = umpire.competitionOrganisations[0].name;
    const accreditationBadge = getAccreditationValue(
      state.accreditation,
      umpire.accreditationLevelUmpireRefId,
    );

    let umpireObj = createUmpireRecord();
    umpireObj.key = `${umpire.userId}_${competitionOrganisationId}`;
    umpireObj.selectionName = `${umpire.umpireName}${
      accreditationBadge ? ` - ${accreditationBadge}` : ``
    }${competitionOrganisationName ? ` - ${competitionOrganisationName}` : ``}`;
    umpireObj.userId = Number(umpire.userId);
    umpireObj.rosterId = Number(umpire.rosterId);
    umpireObj.matchId = umpire.matchId;
    umpireObj.competitionOrganisationId = Number(competitionOrganisationId);
    umpireObj.umpireName = umpire.umpireName;
    umpireObj.umpireType = umpire.umpireType;
    umpireObj.sequence = Number(umpire.sequence);
    umpireObj.verifiedBy = umpire.verifiedBy;
    umpireObj.createdBy = umpire.createdBy;
    state.umpireSelectionDict[umpire.sequence] = umpireObj;
  }
}

export function updateUmpireSelection(state, action) {
  let { umpire, sequence } = action.data;
  if (!umpire) {
    state.umpireSelectionDict[sequence] = null;
    recalculateDisabledForAllSearchFields(state, sequence);
    return;
  }

  const intialUmpire = state.initialMatchUmpires.find(u => u.userId === umpire.userId);

  umpire.sequence = Number(sequence);
  umpire.roleId = getRoleFromSequence(sequence);
  umpire.umpireType = getRecordUmpireType() || null;
  umpire.rosterId = intialUmpire?.rosterId;

  state.umpireSelectionDict[sequence] = umpire;
  recalculateDisabledForAllSearchFields(state, sequence);
}

export function resetOtherUmpireSelections(state, action) {
  let { umpire, sequence } = action.data;
  if (!umpire) {
    return;
  }
  for (let key in state.umpireSelectionDict) {
    if (
      Number(sequence) !== Number(key) &&
      state.umpireSelectionDict[key]?.userId === umpire.userId
    ) {
      state.umpireSelectionDict[key] = null;
    }
  }
}
export function updateUmpireData(state, action) {
  const { sequence, key, value } = action.data;
  if (!state.umpireSelectionDict[sequence]) {
    const recordUmpireType = getRecordUmpireType();
    let newUmpire = createUmpireRecord();
    newUmpire.umpireType = recordUmpireType;
    newUmpire.sequence = sequence;
    state.umpireSelectionDict[sequence] = newUmpire;
  }
  state.umpireSelectionDict[sequence][key] = value;
}

export function clearUmpireDict(state, sequence) {
  state.umpireSearchDict[sequence] = [];
  state.umpireSelectionDict[sequence] = null;
  recalculateDisabledForAllSearchFields(state, sequence);
}

// helpers
function recalculateDisabledForAllSearchFields(state, currSequence) {
  //for each search list
  for (let key in state.umpireSearchDict) {
    if (state.umpireSearchDict[key]) {
      //disable any any user in the list that has been already be selected in another sequence
      disableSelectedUmpires(state.umpireSearchDict[key], state.umpireSelectionDict, Number(key));
    }
  }
}
function getAccreditationValue(accreditationArray, accreditationValue) {
  if (accreditationArray) {
    for (let i in accreditationArray) {
      if (accreditationArray[i].id === accreditationValue) {
        return accreditationArray[i].description;
      }
    }
  }
  return null;
}

function getCompetitionOrganisationId(linkedEntity) {
  if (linkedEntity.entityTypeId === EntityType.Team) {
    return linkedEntity.competitionOrganisationId;
  } else if (linkedEntity.entityTypeId === EntityType.CompetitionOrganisation) {
    return linkedEntity.entityId;
  } else {
    return null;
  }
}
function createUmpireRecord() {
  /*
    Copy below and set initial values

    umpireObj.key = null;
    umpireObj.disabled = null;
    umpireObj. selectionName = null;
    umpireObj.roleId = null;

    umpireObj.userId = null;
    umpireObj.matchId = null;
    umpireObj.competitionOrganisationId = null;
    umpireObj.umpireName = null;
    umpireObj.umpireType = null;
    umpireObj.sequence = null;
    umpireObj.verifiedBy = null;
    umpireObj.createdBy = null;
    */
  return {
    //front end excluise
    key: null,
    disabled: null,
    selectionName: null,
    roleId: null,
    //---------

    userId: null,
    rosterId: null,
    matchId: null,
    teamId: null,
    competitionOrganisationId: null,
    umpireName: null,
    umpireType: null,
    sequence: null,
    verifiedBy: null,
    createdBy: null,
  };
}
