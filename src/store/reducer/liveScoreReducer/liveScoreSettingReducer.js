import ApiConstants from '../../../themes/apiConstants';
import { get } from 'lodash';
import {
  isBasketball,
  isFootball,
  isNetball,
} from '../../../components/liveScore/liveScoreSettings/liveScoreSettingsUtils';
import { BFSettingType } from '../../../util/enums';

const initRecord1 = () => {
  if (isBasketball) {
    return ['recordGoalAttempts'];
  } else {
    return [];
  }
};
const initialState = {
  loader: false,
  initialized: false,
  form: {
    id: 0,
    competitionName: '',
    shortName: '',
    competitionLogo: '',
    Logo: '',
    venue: [],
    scoring: '',
    ladderSetting: [],
    record1: initRecord1(),
    record2: [],
    attendanceRecordingType: null,
    attendanceRecordingPeriod: null,
    timerType: '',
    allVenue: [],
    venueData: [],
    mainVenueList: [],
    days: null,
    hours: null,
    minutes: null,
    attendanceMinutesDays: null,
    attendanceMinuteHours: null,
    lockAttendanceMinutes: null,
    lineupSelectionDays: null,
    lineupSelectionHours: null,
    lineupSelectionMins: null,
    gameTimeTrackingType: 0,
    timeouts: null,
    whoScoring: null,
    acceptScoring: null,
    additionalTime: false,
    extraTime: null,
    extraTimeFor: null,
    extraTimeType: null,
    extraTimeDuration: null,
    extraTimeMainBreak: null,
    extraTimeQuarterBreak: null,
    recordUmpire: [],
    foulsSettings: {},
    courtScorerUserId: null,
    umpireSequenceSettings: null,
    compBorrowRuleRefId: null,
    separateAttendance: false,
    willSupershotBeRecorded: false,
    pointScheme: null,
    premierCompetitionSuspension: false,
    gameTimeTracking: 0,
  },
  buzzerEnabled: false,
  warningBuzzerEnabled: false,
  recordUmpire: [],
  affiliateSelected: null,
  anyOrgSelected: null,
  otherSelected: null,
  nonSelected: null,
  invitedTo: [],
  invitedOrganisation: [],
  associationLeague: [],
  clubSchool: [],
  affiliateNonSelected: null,
  anyOrgNonSelected: null,
  registrationInvitees: [],
  lineupSelection: false,
  allowAffiliatesEnterScore: false,
  gameborrowed: false,
  minutesBorrowed: true,
  premierCompLink: false,
  playerBorrowed: '',
  borrowedPlayer: 'GAMES',
  gamesBorrowedThreshold: null,
  linkedCompetitionId: null,
  inputNumberValue: null,
  anyOrgId: null,
  checkBoxSelection: [],
  viewSelection: null,
  associationChecked: false,
  clubChecked: false,
  associationOrg: [],
  clubOrg: [],
  editLoader: false,
  yearRefId: null,
  affiliateArray: [],
  anyOrgArray: [],
  invitedAnyAssoc: [],
  invitedAnyClub: [],
  competitionInvitees: [],
  gameTimeTrackingType: 0,
  allowForfeit: false,
  isInvitorsChanged: false,
  radioSelectionArr: [],
  invitedAnyAssocArr: [],
  invitedAnyClubArr: [],
  disabled: false,
  hasCompetitions: false,
  bestAndFairestSettings: [],
  references: {},
  enableMatchOfficialRecording: false,
  matchOfficialRecordRoles: [],
  matchOfficialUniqueId: 0,
  allowMaximumAttendance: false,
  allowMaximumLineup: false,
  maximumAttendance: 0,
  maximumLineup: 0,
  lockAttendanceMinutesChecked: false,
};

const emptyState = JSON.stringify(initialState);

//minutes to hour (and days) converter
function recordingTimeDays(num) {
  let d;
  if (num != null) {
    if (num >= 0) {
      d = Math.floor(num / 1440); // 60*24
    } else {
      d = Math.ceil(num / 1440); // 60*24
    }
  }
  return d;
}

//minutes to hour (and days) converter
function recordingTimeHours(num) {
  let d, h;
  if (num != null) {
    if (num >= 0) {
      d = Math.floor(num / 1440); // 60*24
      h = Math.floor((num - d * 1440) / 60);
    } else {
      d = Math.ceil(num / 1440); // 60*24
      h = Math.ceil((num - d * 1440) / 60);
    }
  }
  return h;
}

//minutes to hour (and days) converter
function recordingTimeMins(num) {
  let m;
  if (num != null) {
    if (num >= 0) {
      m = Math.round(num % 60);
    } else {
      m = Math.ceil(num % 60);
    }
  }
  return m;
}

////remove Selected Element From Array
function removeElementFromArray(array, data, keys) {
  let findData = array => array === data;
  let index = array.findIndex(findData);
  array.splice(index, 1);

  return array;
}

function getAffiliateValue(compInviteesArr, regInviteArr) {
  let affiliateSelectedValue = null;
  for (let i in compInviteesArr) {
    for (let j in regInviteArr) {
      for (let k in regInviteArr[j].subReferences) {
        if (compInviteesArr[i].inviteesRefId === regInviteArr[0].subReferences[k].id) {
          affiliateSelectedValue = compInviteesArr[i].inviteesRefId;
        }
      }
    }
  }
  return affiliateSelectedValue;
}

function getAnyOrgValue(compInviteesArr, regInviteArr) {
  let anyOrgSelectedValue = [];
  for (let i in compInviteesArr) {
    for (let j in regInviteArr) {
      for (let k in regInviteArr[j].subReferences) {
        if (compInviteesArr[i].inviteesRefId == regInviteArr[1].subReferences[k].id) {
          anyOrgSelectedValue.push(compInviteesArr[i]);
          break;
        }
      }
      break;
    }
  }
  return anyOrgSelectedValue;
}

function getanyOrgArray(data) {
  let arr = [];
  for (let i in data) {
    if (data[i].inviteesRefId) arr.push(data[i].inviteesRefId);
  }
  // let filteredArr = arr.filter(function (item, index) {
  //     if (arr.indexOf(item) == index)
  //         return item;
  // });
  return arr;
}

function getCheckBoxSelection(compInvitess) {
  let associationLeague = false;
  let clubLeage = false;
  // let assocLeage = null
  for (let i in compInvitess) {
    if (compInvitess[i].inviteesRefId === 7) {
      associationLeague = true;
    }
    if (compInvitess[i].inviteesRefId === 8) {
      clubLeage = true;
      break;
    }
  }
  return { assocLeage: associationLeague, club: clubLeage };
}

function getSelectedOrganization(data, compInviteesArr) {
  let associationLeageOrg = [];
  let clubLeageOrg = [];
  for (let i in compInviteesArr) {
    if (compInviteesArr[i].inviteesRefId === 7) {
      associationLeageOrg.push(compInviteesArr[i].invitedOrganisationId);
    }
    if (compInviteesArr[i].inviteesRefId === 8) {
      clubLeageOrg.push(compInviteesArr[i].invitedOrganisationId);
    }
  }
  return { associationLeageOrg: associationLeageOrg, clubLeageOrg: clubLeageOrg };
}

function getPointSchema(willSupershotBeRecorded) {
  let pointScheme = null;
  if (isNetball) {
    pointScheme = [
      {
        id: 5,
        value: [1],
      },
      {
        id: 6,
        value: [1],
      },
    ];
    if (willSupershotBeRecorded) {
      pointScheme.forEach(it => it.value.push(2));
    }
  } else if (isBasketball) {
    pointScheme = [
      {
        id: 5,
        value: [1, 2, 3],
      },
      {
        id: 6,
        value: [1, 2, 3],
      },
    ];
  } else if (isFootball) {
    pointScheme = [
      {
        id: 1,
        value: [1],
      },
      {
        id: 10,
        value: [1],
      },
      {
        id: 11,
        value: [1],
      },
    ];
  }
  return pointScheme;
}

function willSupershotBeRecordedChecked(pointScheme) {
  if (!pointScheme || pointScheme.length <= 0) {
    return false;
  }
  return pointScheme[0].value.length > 1;
}

function getFoulsSettings(premierCompetitionSuspension) {
  if (!premierCompetitionSuspension) {
    return {};
  }

  return {
    sendoffReport: [
      {
        id: 24,
        type: 'FC',
        value: '5',
      },
      {
        id: 25,
        type: 'FW',
        value: '1',
      },
      {
        id: 26,
        type: 'FS',
        value: '3',
      },
    ],
    removedFromGame: [
      {
        id: 24,
        type: 'FC',
        value: '5',
      },
      {
        id: 25,
        type: 'FW',
        value: '2',
      },
      {
        id: 26,
        type: 'FS',
        value: '2',
      },
    ],
  };
}

function updateRecordSettings(records) {
  if (isNetball) {
    // "Record Goal Attempts" can’t be enabled if "Position Tracking" is not enabled.
    const posTracking = !!records.find(it => it === 'positionTracking');
    if (!posTracking) {
      const aryIndex = records.findIndex(it => it === 'recordGoalAttempts');
      aryIndex >= 0 && records.splice(aryIndex, 1);
    }
  }

  if (isFootball) {
    // Enhanced Statistics can’t be enabled if Goal Attempts is not enabled.
    const goalAttempts = !!records.find(it => it === 'recordGoalAttempts');
    if (!goalAttempts) {
      const aryIndex = records.findIndex(it => it === 'enhancedStatistics');
      aryIndex >= 0 && records.splice(aryIndex, 1);
    }
  }
}

function premierCompetitionSuspensionChecked(foulsSettings) {
  if (!foulsSettings || !foulsSettings.sendoffReport || !foulsSettings.removedFromGame) {
    return false;
  }
  return true;
}

function updateSettingViewState(state, _payload) {
  const { settings: payload, references } = _payload;

  if (references) {
    state.registrationInvitees = references.RegistrationInvitees;
    state.references = references;
  }

  const arraymaped = [{ ...payload }];
  let timeoutsData = payload.timeoutDetails;
  timeoutsData = typeof timeoutsData === 'string' ? JSON.parse(timeoutsData) : timeoutsData;

  const record1 = arraymaped.reduce((memo, data) => {
    if (data.recordUmpire === 1) {
      memo.push('recordUmpire');
    }
    if (data.enhancedStatistics) {
      memo.push('enhancedStatistics');
    }

    if (data.positionTracking) {
      memo.push('positionTracking');
    }
    if (data.recordGoalAttempts || (isBasketball && !data.timerType)) {
      memo.push('recordGoalAttempts');
    }
    return memo;
  }, []);

  if (record1.length > 0) {
    updateRecordSettings(record1);
  }

  const record2 = arraymaped.reduce((memo, data) => {
    if (data.centrePassEnabled) {
      memo.push('centrePassEnabled');
    }
    if (data.incidentsEnabled) {
      memo.push('incidentsEnabled');
    }
    if (data.gameTimeTracking) {
      memo.push('gameTimeTracking');
    }
    if (isNetball) {
      memo.push('gameTimeTrackingType');
    }
    return memo;
  }, []);
  const venueData = payload.competitionVenues.map(item => item.venueId);

  if (payload.linkedCompetitionId) {
    state.premierCompLink = true;
  } else {
    state.premierCompLink = false;
  }
  if (payload.yearRefId) {
    state.yearRefId = payload.yearRefId;
  }

  const bestAndFairests = payload.bestAndFairests;
  if (bestAndFairests && bestAndFairests.length > 0) {
    state.bestAndFairestSettings = bestAndFairests.map(setting => ({
      ...setting,
      receivePoints: setting.receivePoints?.split(',') || [],
    }));
  } else {
    state.bestAndFairestSettings = [];
  }

  let compInvitees = payload.competitionInvitees;
  state.invitedTo = [];
  state.anyOrgArray = [];
  state.associationChecked = false;
  state.clubChecked = false;
  state.associationLeague = [];
  state.clubSchool = [];
  state.affiliateSelected = null;
  state.affiliateNonSelected = [];
  state.anyOrgSelected = [];
  state.otherSelected = [];
  state.invitedAnyAssoc = [];
  state.invitedAnyClub = [];
  state.radioSelectionArr = [];
  state.orgSelectionArr = [];
  state.invitedAnyAssocArr = [];
  state.invitedAnyClubArr = [];
  state.hasCompetitions = Number(payload.sourceId) > 0;

  state.maximumAttendance = payload.maximumAttendance;
  state.allowMaximumAttendance = payload.maximumAttendance > 0;
  state.maximumLineup = payload.maximumLineup;
  state.allowMaximumLineup = payload.maximumLineup > 0;

  if (compInvitees.length > 0) {
    if (compInvitees.length === 1) {
      if (
        compInvitees[0].inviteesRefId === 2 ||
        compInvitees[0].inviteesRefId === 3 ||
        compInvitees[0].inviteesRefId === 5 ||
        compInvitees[0].inviteesRefId === 6 ||
        compInvitees[0].inviteesRefId === 7 ||
        compInvitees[0].inviteesRefId === 8
      ) {
        if (compInvitees[0].inviteesRefId === 5 || compInvitees[0].inviteesRefId === 6) {
          state.otherSelected = compInvitees[0].inviteesRefId;
          state.invitedTo = [compInvitees[0].inviteesRefId];
          state.radioSelectionArr = [compInvitees[0].inviteesRefId];
        } else {
          state.invitedTo = [compInvitees[0].inviteesRefId];
          state.radioSelectionArr = [compInvitees[0].inviteesRefId];
          state.anyOrgArray = [compInvitees[0].inviteesRefId];
          let anyOrgValue = getAnyOrgValue(payload.competitionInvitees, state.registrationInvitees);
          let anyOrgArray = getanyOrgArray(anyOrgValue);
          let anyOrgCheckBoxSelection = getCheckBoxSelection(payload.competitionInvitees);
          state.associationChecked = anyOrgCheckBoxSelection.assocLeage;
          state.clubChecked = anyOrgCheckBoxSelection.club;
          let selectedOrganization = getSelectedOrganization(
            anyOrgArray,
            payload.competitionInvitees,
          );
          state.associationLeague = selectedOrganization.associationLeageOrg;
          state.clubSchool = selectedOrganization.clubLeageOrg;
          let assocArray = [];
          for (let i in selectedOrganization.associationLeageOrg) {
            let associationAffiliteObj = {
              organisationId: selectedOrganization.associationLeageOrg[i],
            };
            assocArray.push(associationAffiliteObj);
          }
          state.invitedAnyAssoc = assocArray;
          state.invitedAnyAssocArr = assocArray;
          let clubArray = [];
          for (let i in selectedOrganization.clubLeageOrg) {
            let clubAffiliteObj = {
              organisationId: selectedOrganization.clubLeageOrg[i],
            };
            clubArray.push(clubAffiliteObj);
          }
          state.invitedAnyClub = clubArray;
          state.invitedAnyClubArr = clubArray;

          let affiliateValue = getAffiliateValue(
            payload.competitionInvitees,
            state.registrationInvitees,
          );
          state.affiliateSelected = affiliateValue;
        }
      }
    } else {
      let affiliateValue = getAffiliateValue(
        payload.competitionInvitees,
        state.registrationInvitees,
      );
      state.affiliateSelected = affiliateValue;

      if (affiliateValue) {
        if (affiliateValue == 2 || affiliateValue == 3) {
          state.affiliateArray = [affiliateValue];
          state.invitedTo = [affiliateValue];
          state.radioSelectionArr = [affiliateValue];
        }
        state.invitedTo = [affiliateValue];
        state.radioSelectionArr = [affiliateValue];
      }
      let anyOrgValue = getAnyOrgValue(payload.competitionInvitees, state.registrationInvitees);

      let anyOrgSelectedArr = getanyOrgArray(anyOrgValue, anyOrgValue);

      for (let i in anyOrgSelectedArr) {
        state.invitedTo.push(anyOrgSelectedArr[i]);
        state.radioSelectionArr.push(anyOrgSelectedArr[i]);
        state.anyOrgArray.push(anyOrgSelectedArr[i]);
      }
      let anyOrgCheckBoxSelection = getCheckBoxSelection(payload.competitionInvitees);
      state.associationChecked = anyOrgCheckBoxSelection.assocLeage;
      state.clubChecked = anyOrgCheckBoxSelection.club;
      let selectedOrganization = getSelectedOrganization(
        anyOrgSelectedArr,
        payload.competitionInvitees,
      );
      state.associationLeague = selectedOrganization.associationLeageOrg;
      state.clubSchool = selectedOrganization.clubLeageOrg;
      let assocArray = [];

      for (let i in selectedOrganization.associationLeageOrg) {
        let associationAffiliteObj = {
          organisationId: selectedOrganization.associationLeageOrg[i],
        };
        assocArray.push(associationAffiliteObj);
      }

      state.invitedAnyAssoc = assocArray;
      state.invitedAnyAssocArr = assocArray;

      let clubArray = [];

      for (let i in selectedOrganization.clubLeageOrg) {
        let clubAffiliteObj = {
          organisationId: selectedOrganization.clubLeageOrg[i],
        };
        clubArray.push(clubAffiliteObj);
      }
      state.invitedAnyClub = clubArray;
      state.invitedAnyClubArr = clubArray;
    }
  } else {
    state.invitedTo = [];
    state.radioSelectionArr = [];
    state.associationChecked = false;
    state.clubChecked = false;
    state.associationLeague = [];
    state.clubSchool = [];
    state.affiliateSelected = null;
    state.anyOrgSelected = null;
    state.otherSelected = null;
    state.invitedAnyAssoc = [];
    state.invitedAnyClub = [];
    state.invitedAnyAssocArr = [];
    state.invitedAnyClubArr = [];
  }

  const pointScheme = payload.pointScheme ? payload.pointScheme : getPointSchema(false);
  const lockAttendanceMinutesChecked = payload.attendanceSelectionTimeEnd !== null ? true : false;
  // Team Official Roles
  state.enableMatchOfficialRecording = payload.enableMatchOfficialRecording;
  if (payload.teamOfficialRoleList) {
    state.matchOfficialRecordRoles = payload.teamOfficialRoleList
      .sort((a, b) => Number(a.sequence) - Number(b.sequence))
      .map((i, index) => ({
        ...i,
        databaseId: i.id,
        id: (index + 1).toString(),
      }));
    state.matchOfficialUniqueId = payload.teamOfficialRoleList.length;
  }

  return {
    ...state,
    loader: false,
    initialized: true,
    editLoader: false,
    form: {
      ...state.form,
      id: payload.id,
      gameTimeTrackingType: payload.gameTimeTrackingType != null ? payload.gameTimeTrackingType : 0,
      competitionName: payload.longName,
      shortName: payload.name,
      competitionLogo: payload.logoUrl,
      Logo: payload.logoUrl,
      scoring: payload.scoringType,
      venue: venueData,
      allVenue: payload.competitionVenues,
      record1,
      record2,
      applySuspensionToRefId: payload.applySuspensionToRefId,
      attendanceRecordingType: payload.attendanceRecordingType,
      attendanceRecordingPeriod: payload.attendanceRecordingPeriod,
      timerType: payload.timerType,
      days: recordingTimeDays(payload.attendanceSelectionTime),
      hours: recordingTimeHours(payload.attendanceSelectionTime),
      minutes: recordingTimeMins(payload.attendanceSelectionTime),
      attendanceMinutesDays: recordingTimeDays(payload.attendanceSelectionTimeEnd),
      attendanceMinuteHours: recordingTimeHours(payload.attendanceSelectionTimeEnd),
      lockAttendanceMinutes: recordingTimeMins(payload.attendanceSelectionTimeEnd),
      lineupSelectionDays: recordingTimeDays(payload.lineupSelectionTime),
      lineupSelectionHours: recordingTimeHours(payload.lineupSelectionTime),
      lineupSelectionMins: recordingTimeMins(payload.lineupSelectionTime),
      timeouts: timeoutsData,
      whoScoring: payload.whoScoring,
      acceptScoring: payload.acceptScoring,
      additionalTime: payload.additionalSettings
        ? !!payload.additionalSettings.ALLOWED_ADDITIONAL_TIME
        : false,
      extraTime: payload.extraTime,
      extraTimeFor: payload.extraTimeFor,
      extraTimeType: payload.extraTimeType,
      extraTimeDuration: payload.extraTimeDuration,
      extraTimeMainBreak: payload.extraTimeMainBreak,
      extraTimeQuarterBreak: payload.extraTimeQuarterBreak,
      foulsSettings: payload.foulsSettings,
      isPublicStats: payload.isPublicStats,
      courtScorerUserId: payload.courtScorerUserId,
      umpireSequenceSettings: payload.umpireSequenceSettings,
      compBorrowRuleRefId: payload.compBorrowRuleRefId,
      officialOrganisationId: payload.officialOrganisationId,
      separateAttendance: payload.scoringType === 'PREMIER_NETBALL',
      willSupershotBeRecorded: willSupershotBeRecordedChecked(pointScheme),
      premierCompetitionSuspension: premierCompetitionSuspensionChecked(payload.foulsSettings),
      pointScheme: pointScheme,
      gameTimeTracking: payload.gameTimeTracking === true ? 1 : 0,
    },
    data: payload,
    competitionSettings: payload,
    buzzerEnabled: payload.buzzerEnabled,
    warningBuzzerEnabled: payload.warningBuzzerEnabled,
    recordUmpire: payload.recordUmpireType,
    lineupSelection: payload.lineupSelectionEnabled,
    allowAffiliatesEnterScore: payload.allowAffiliatesEnterScore,
    borrowedPlayer: payload.playerBorrowingType,
    gamesBorrowedThreshold: payload.gamesBorrowedThreshold,
    linkedCompetitionId: payload.linkedCompetitionId,
    inputNumberValue: payload.gamesBorrowedThreshold,
    disabled: payload.gameTimeTracking,
    lockAttendanceMinutesChecked: lockAttendanceMinutesChecked,
    allowForfeit: payload.allowForfeit === 'MANAGER' ? true : false,
  };
}

export default function liveScoreSettingsViewReducer(state = initialState, { type, payload }) {
  switch (type) {
    case ApiConstants.LiveScore_SETTING_VIEW_RESET_STATE:
      return JSON.parse(emptyState);
    case ApiConstants.LiveScore_SETTING_VIEW_INITITAE:
      return {
        ...state,
        form: {
          ...initialState.form,
          foulsSettings: {},
        },
        editLoader: true,
      };
    case ApiConstants.LiveScore_SETTING_VIEW_SUCCESS:
      return updateSettingViewState(state, payload);

    case ApiConstants.LiveScore_SETTING_VIEW_ERROR:
      return {
        ...state,
        loader: false,
        editLoader: false,
      };

    case ApiConstants.LiveScore_SETTING_VIEW_FAIL:
      return {
        ...state,
        loader: false,
        editLoader: false,
      };
    case ApiConstants.LiveScore_SETTING_CHANGE_FORM:
      const keys = payload.key;
      const Data = payload.data;

      const keysToSetByKey = [
        'buzzerEnabled',
        'warningBuzzerEnabled',
        'lineupSelection',
        'premierCompLink',
        'allowAffiliatesEnterScore',
      ];
      if (keysToSetByKey.includes(keys)) {
        state[keys] = Data;

        if (keys === 'premierCompLink') {
          if (Data === false) {
            state.linkedCompetitionId = null;
          }
        }
      } else if (keys === 'borrowedPlayer') {
        state[keys] = Data;

        if (Data === 'MINUTES') {
          state.gamesBorrowedThreshold = state.inputNumberValue;
        }
      } else if (keys === 'number') {
        state.gamesBorrowedThreshold = Data;
      } else if (keys === 'yearRefId') {
        state.yearRefId = Data;
      } else if (keys === 'linkedCompetitionId') {
        state.linkedCompetitionId = Data;
      } else if (keys === 'recordUmpire') {
        state.recordUmpire = Data;
      } else if (
        keys === 'affiliateSelected' ||
        keys === 'anyOrgSelected' ||
        keys === 'otherSelected' ||
        keys === 'affiliateNonSelected' ||
        keys === 'anyOrgNonSelected'
      ) {
        state.invitedOrganisation = [];
        if (keys === 'affiliateSelected') {
          state.affiliateSelected = Data;
          state.otherSelected = null;
          state.affiliateNonSelected = null;
          state.affiliateArray.splice(0, 1, Data);
          state.invitedTo = [...state.affiliateArray, ...state.anyOrgArray];
        }
        if (keys === 'anyOrgSelected') {
          state.anyOrgSelected = Data;
          state.otherSelected = null;
          state.anyOrgNonSelected = null;
          state.affiliateArray.splice(0, 1, Data);
          state.invitedTo = [...state.affiliateArray, ...state.anyOrgArray];
        }
        if (keys === 'otherSelected') {
          state.otherSelected = Data;
          state.affiliateSelected = null;
          state.anyOrgSelected = null;
          state.affiliateNonSelected = null;
          state.anyOrgNonSelected = null;
          state.invitedTo = [];
          state.invitedTo.push(Data);
          state.associationChecked = false;
          state.clubChecked = false;
          state.invitedAnyAssoc = [];
          state.invitedAnyClub = [];
          state.associationLeague = [];
          state.clubSchool = [];
          state.affiliateArray = [];
          state.anyOrgArray = [];
        }
        if (keys === 'affiliateNonSelected') {
          state.affiliateSelected = [];
          state.otherSelected = null;
          state.affiliateNonSelected = Data;
          state.affiliateArray = [];
          state.invitedTo = [...state.affiliateArray, ...state.anyOrgArray];
        }
        if (keys === 'anyOrgNonSelected') {
          state.invitedTo = [];
          state.anyOrgSelected = [];
          state.otherSelected = null;
          state.associationChecked = false;
          state.clubChecked = false;
          state.anyOrgNonSelected = Data;
          state.invitedAnyAssoc = [];
          state.invitedAnyClub = [];
          state.associationLeague = [];
          state.clubSchool = [];
          state.anyOrgArray = [];
        }
      } else if (keys === 'associationAffilite' || keys === 'clubAffilite') {
        if (keys === 'associationAffilite') {
          state.associationLeague = Data;
          let inviteeArray = [];
          for (let i in Data) {
            let associationAffiliteObj = {
              organisationId: Data[i],
            };
            inviteeArray.push(associationAffiliteObj);
          }
          state.invitedAnyAssoc = inviteeArray;
        }
        if (keys === 'clubAffilite') {
          state.clubSchool = Data;
          let inviteeArray = [];
          for (let i in Data) {
            let clubAffiliteObj = {
              organisationId: Data[i],
            };
            inviteeArray.push(clubAffiliteObj);
          }
          state.invitedAnyClub = inviteeArray;
        }
      } else if (keys === 'record1') {
        updateRecordSettings(Data);
        const posTracking = !!Data.find(it => it === 'positionTracking');
        if (!(posTracking || isBasketball)) {
          state.lineupSelection = false;
          state.form.lineupSelectionDays = null;
          state.form.lineupSelectionHours = null;
          state.form.lineupSelectionMins = null;
        }
      } else if (keys === 'record2') {
        if (Data.find(it => it === 'gameTimeTracking')) {
          state.disabled = true;
          state.form.attendanceRecordingPeriod = 'PERIOD';
        } else {
          state.disabled = false;
        }
      } else if (keys === 'associationChecked') {
        state.anyOrgNonSelected = null;
        state[keys] = payload.data;
        state.otherSelected = null;
        if (Data === true) {
          state.anyOrgArray.push(payload.checkBoxId);
          state.invitedTo = [...state.affiliateArray, ...state.anyOrgArray];
        } else {
          let removeElement = removeElementFromArray(
            state.anyOrgArray,
            payload.checkBoxId,
            'associationChecked',
          );
          state.anyOrgArray = removeElement;
          state.invitedAnyAssoc = [];
          state.associationLeague = [];
          state.invitedTo = [...state.affiliateArray, ...state.anyOrgArray];
        }
      } else if (keys === 'clubChecked') {
        state.anyOrgNonSelected = null;
        state[keys] = payload.data;
        state.otherSelected = null;
        if (Data === true) {
          state.anyOrgArray.push(payload.checkBoxId);
          state.invitedTo = [...state.affiliateArray, ...state.anyOrgArray];
        } else {
          let removeElement = removeElementFromArray(
            state.anyOrgArray,
            payload.checkBoxId,
            'clubChecked',
          );
          state.anyOrgArray = removeElement;
          state.invitedAnyClub = [];
          state.clubSchool = [];
          state.invitedTo = [...state.affiliateArray, ...state.anyOrgArray];
        }
      } else if (keys == 'adminUserScoring') {
        state.form.courtScorerUserId = Data;
      } else if (keys === 'separateAttendance') {
        state.form.scoring = Data ? 'PREMIER_NETBALL' : 'SINGLE';
        if (Data) {
          state.lineupSelection = true;
          const itemKeys = ['positionTracking', 'recordGoalAttempts'];
          itemKeys.forEach(key => {
            if (!state.form.record1.find(i => i === key)) {
              state.form.record1.push(key);
            }
          });
        }
      } else if (keys === 'willSupershotBeRecorded') {
        state.form.pointScheme = getPointSchema(Data);
      } else if (keys === 'premierCompetitionSuspension') {
        state.form.foulsSettings = getFoulsSettings(Data);
      } else if (keys === 'attendanceSelectionTimeChanged') {
        state.lockAttendanceMinutesChecked = Data; // true or false
      } else if (keys === 'gameTimeTrackingType') {
        state.gameTimeTrackingType = Data;
      } else if (keys === 'allowForfeit') {
        state.allowForfeit = Data;
      } else {
        state[keys] = Data;
      }
      return {
        ...state,
        form: {
          ...state.form,
          [keys]: Data,
        },
      };

    case ApiConstants.LiveScore_SETTING_BEST_FAIREST_POINTS: {
      const bfsettings = [...state.bestAndFairestSettings];
      let index = bfsettings.findIndex(
        it => it.bestAndFairestTypeRefId === payload.bestAndFairestTypeRefId,
      );
      if (payload.bestAndFairestTypeRefId === BFSettingType.ORGANISATION_AWARD) {
        index = bfsettings.findIndex(
          it =>
            it.bestAndFairestTypeRefId === payload.bestAndFairestTypeRefId &&
            it.competitionOrganisationId === payload.competitionOrganisationId,
        );
      }
      if (index >= 0) {
        bfsettings.splice(index, 1, payload);
      } else {
        bfsettings.push(payload);
      }

      return {
        ...state,
        bestAndFairestSettings: bfsettings,
      };
    }

    case ApiConstants.LiveScore_SETTING_DATA_POST_INITATE:
      if (payload.isEdit === 'edit') {
        return {
          ...state,
          editLoader: true,
        };
      } else {
        return {
          ...state,
          loader: true,
        };
      }

    case ApiConstants.LiveScore_SETTING_DATA_POST_SUCCESS:
      return {
        ...state,
        loader: false,
        editLoader: false,
      };
    case ApiConstants.LiveScore_SETTING_DATA_POST_ERROR:
      return {
        ...state,
        loader: false,
      };
    case ApiConstants.API_LIVE_SCORE_COMPETITION_VENUES_LIST_SUCCESS:
      return {
        ...state,
        venueData: payload,
        mainVenueList: payload,
      };
    case ApiConstants.LiveScore_CLEAR_SETTING:
      state.lineupSelection = null;
      state.allowAffiliatesEnterScore = false;
      state.inputNumberValue = null;
      state.premierCompLink = false;
      state.gamesBorrowedThreshold = null;
      state.buzzerEnabled = false;
      state.warningBuzzerEnabled = false;
      state.recordUmpire = [];
      state.affiliateSelected = null;
      state.affiliateNonSelected = null;
      state.anyOrgNonSelected = null;
      state.anyOrgSelected = null;
      state.otherSelected = null;
      state.nonSelected = null;
      state.associationChecked = false;
      state.clubChecked = false;
      state.borrowedPlayer = 'GAMES';
      state.lockAttendanceMinutesChecked = false;
      return {
        ...state,
        form: {
          ...initialState.form,
          id: 0,
          competitionName: '',
          competitionLogo: '',
          Logo: '',
          venue: [],
          scoring: '',
          ladderSetting: [],
          record1: initRecord1(),
          record2: [],
          attendanceRecordingType: [],
          attendanceRecordingPeriod: [],
          timerType: [],
          allVenue: [],
        },
        bestAndFairestSettings: [],
      };

    case ApiConstants.LIVESCORE_SEARCH__SETTING:
      return { ...state, venueData: payload };

    case ApiConstants.CLEAR_FILTER_SEARCH:
      state.venueData = state.mainVenueList;
      return {
        ...state,
      };

    case ApiConstants.SETTING_REGISTRATION_INVITEES_LOAD:
      return { ...state, loader: false };

    case ApiConstants.SETTING_REGISTRATION_INVITEES_SUCCESS:
      return {
        ...state,
        loader: false,
        registrationInvitees: payload.RegistrationInvitees,
        references: payload,
      };

    case ApiConstants.LiveScore_SETTING_MATCH_OFFICIAL: {
      const { key, data } = payload;
      const recordRoles = state.matchOfficialRecordRoles;
      switch (key) {
        case 'enableRecording': {
          state.enableMatchOfficialRecording = data;
          break;
        }
        case 'addNewRole': {
          const uniqueId = 1 + state.matchOfficialUniqueId;
          const newRole = { ...data, id: uniqueId.toString() };
          recordRoles.push(newRole);
          state.matchOfficialUniqueId++;
          break;
        }
        case 'changeRole': {
          const { index, role } = data;
          const uniqueId = recordRoles[index].id;
          const updatedRole = { ...role, id: uniqueId };
          recordRoles.splice(index, 1, updatedRole);
          break;
        }
        case 'setRoleName': {
          const { index, roleName } = data;
          recordRoles[index].roleName = roleName;
          break;
        }
        case 'selectFromExistingUsers': {
          const { index, checked } = data;
          recordRoles[index].lookupRoleId = !!checked ? 5 : null;
          break;
        }
        case 'deleteRole': {
          const index = data;
          recordRoles.splice(index, 1);
          break;
        }
        case 'setRoles': {
          return { ...state, matchOfficialRecordRoles: data };
        }
      }
      return {
        ...state,
        matchOfficialRecordRoles: [...recordRoles],
      };
    }

    default:
      return state;
  }
}
