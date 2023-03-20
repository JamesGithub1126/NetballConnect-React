import ApiConstants from '../../../themes/apiConstants';
import {
  isArrayNotEmpty,
  // isNotNullOrEmptyString
} from '../../../util/helpers';
import AppConstants from '../../../themes/appConstants';
import { sortArrayAlphabetical } from '../../../util/drawUtil';
import { TIMESLOTS_ROTATION_SUB } from 'util/enums';

const postTimeSlot = {
  mainTimeRotationID: null,
  competitionUniqueKey: null,
  organisationId: null,
  applyToVenueRefId: null,
  timeslotRotationRefId: null,
  timeslotGenerationRefId: null,
  competitionTimeslotId: 0,
  competitionVenueTimeslotsDayTime: [],
  competitionTimeslotsEntity: [],
  competitionTimeslotManual: [
    {
      venueId: null,
      timeslots: [],
    },
  ],
};
// initial state
const initialState = {
  mainDivisionList: [],
  mainGradeList: [],
  onLoad: false,
  onGetTimeSlotLoad: false,
  error: null,
  result: [],
  status: 0,
  getcompetitionTimeSlotData: postTimeSlot,
  applyVenue: [],
  timeSlotRotation: [],
  allrefernceData: [],
  timeSlotGeneration: [],
  weekDays: [],
  manaualTimeSlotObj: {
    venueId: null,
    timeslots: [],
  },
  allVenueList: [],
  timeSlotManualAllVenue: [],
  defaultDataAllVenue: [],
  timeSlotEntityManualkey: [],
  allResult: [],
  competitionVenues: [],
  timeSlotRotationHelpMessage: [
    AppConstants.timeSlotNoPrefMsg,
    AppConstants.timeSlotEvenRotationMsg,
    AppConstants.allocateToSameTimeslotMsg,
  ],
  timeSlotGenerationHelpMessage: [
    AppConstants.timeSlote_BasedOnMatchDurationMsg,
    AppConstants.manuallyAddTimeSloteMsg,
  ],
  teamList: null,
  timeslotsList: null,
  timeslotsManualRawData: null,
  timePreferences: null,
};

//time slot Entity
function timeSlotEntity(entityId, SelectedEntity) {
  let object = {
    status: false,
    result: [],
  };

  for (let i in SelectedEntity) {
    if (SelectedEntity[i].venuePreferenceEntityId === entityId) {
      object = {
        status: true,
        result: SelectedEntity[i],
      };
      break;
    }
  }

  return object;
}

// check checkTimeSlotStatus
function checkTimeSlotStatus(timeSlotobj, updatedtimeSlotArr) {
  let obj = {
    status: false,
    index: null,
  };
  for (let i in updatedtimeSlotArr) {
    if (timeSlotobj.dayRefId === updatedtimeSlotArr[i].dayRefId) {
      obj = {
        status: true,
        index: [i],
      };
      break;
    }
  }
  return obj;
}

// get timeslot all venue per day
function getTimeslotPerVenuePerDay(timeslotData) {
  let updatedtimeSlotArr = [];
  for (let i in timeslotData) {
    let matchUpdatedTimeSlot = timeslotData[i];
    // let competitionTimeslotsEntityArr = timeslotData[i].competitionTimeslotsEntity
    let timeSlotStatusData = checkTimeSlotStatus(matchUpdatedTimeSlot, updatedtimeSlotArr);
    if (timeSlotStatusData.status) {
      let timeslotUpdatedArrayValue = {
        startTime: matchUpdatedTimeSlot.startTime,
        sortOrder: matchUpdatedTimeSlot.sortOrder,
        competitionTimeslotsEntity: matchUpdatedTimeSlot.competitionTimeslotsEntity,
        timeSlotEntityManualkey: matchUpdatedTimeSlot.timeSlotEntityManualkey,
        timeSlotEntityGradeKey: matchUpdatedTimeSlot.timeSlotEntityGradeKey,
        competitionVenueTimeslotsDayTimeId: matchUpdatedTimeSlot.competitionVenueTimeslotsDayTimeId,
      };
      updatedtimeSlotArr[timeSlotStatusData.index].startTime.push(
        JSON.parse(JSON.stringify(timeslotUpdatedArrayValue)),
      );
    } else {
      let timeslotUpdatedArray = {
        startTime: matchUpdatedTimeSlot.startTime,
        sortOrder: matchUpdatedTimeSlot.sortOrder,
        competitionTimeslotsEntity: matchUpdatedTimeSlot.competitionTimeslotsEntity,
        timeSlotEntityManualkey: matchUpdatedTimeSlot.timeSlotEntityManualkey,
        timeSlotEntityGradeKey: matchUpdatedTimeSlot.timeSlotEntityGradeKey,
        competitionVenueTimeslotsDayTimeId: matchUpdatedTimeSlot.competitionVenueTimeslotsDayTimeId,
      };

      let mainobj = {
        dayRefId: matchUpdatedTimeSlot.dayRefId,
        startTime: [timeslotUpdatedArray],
      };
      updatedtimeSlotArr.push(JSON.parse(JSON.stringify(mainobj)));
    }
  }
  return updatedtimeSlotArr;
}

//getTimeslotAllVenuePerDay
function getTimeslotAllVenuePerDay(timeslotData) {
  // timeslotData
  let allVenuetimeSlotArr = [];
  for (let i in timeslotData) {
    let matchUpdatedTimeSlot = timeslotData[i];
    // let competitionTimeslotsEntityArrdata = timeslotData[i].competitionTimeslotsEntity
    let timeSlotStatusData = checkTimeSlotStatus(matchUpdatedTimeSlot, allVenuetimeSlotArr);
    if (timeSlotStatusData.status) {
      let timeslotUpdatedArrayValue = {
        startTime: matchUpdatedTimeSlot.startTime,
        sortOrder: matchUpdatedTimeSlot.sortOrder,
        competitionTimeslotsEntity: matchUpdatedTimeSlot.competitionTimeslotsEntity,
        timeSlotEntityManualkey: matchUpdatedTimeSlot.timeSlotEntityManualkey,
        timeSlotEntityGradeKey: matchUpdatedTimeSlot.timeSlotEntityGradeKey,
        competitionVenueTimeslotsDayTimeId: matchUpdatedTimeSlot.competitionVenueTimeslotsDayTimeId,
      };

      allVenuetimeSlotArr[timeSlotStatusData.index].startTime.push(
        JSON.parse(JSON.stringify(timeslotUpdatedArrayValue)),
      );
    } else {
      let timeslotUpdatedArray = {
        startTime: matchUpdatedTimeSlot.startTime,
        sortOrder: matchUpdatedTimeSlot.sortOrder,
        competitionTimeslotsEntity: matchUpdatedTimeSlot.competitionTimeslotsEntity,
        timeSlotEntityManualkey: matchUpdatedTimeSlot.timeSlotEntityManualkey,
        timeSlotEntityGradeKey: matchUpdatedTimeSlot.timeSlotEntityGradeKey,
        competitionVenueTimeslotsDayTimeId: matchUpdatedTimeSlot.competitionVenueTimeslotsDayTimeId,
      };

      let mainobj = {
        dayRefId: matchUpdatedTimeSlot.dayRefId,
        startTime: [timeslotUpdatedArray],
      };
      allVenuetimeSlotArr.push(JSON.parse(JSON.stringify(mainobj)));
    }
  }
  return allVenuetimeSlotArr;
}

//get getTimeSlotPerVenueEntity
function getTimeSlotPerVenueEntity(timeSlotArr, rotationId) {
  if (timeSlotArr !== []) {
    for (let i in timeSlotArr) {
      let perVenueEntity = timeSlotArr[i].competitionTimeslotsEntity;
      timeSlotArr[i]['timeSlotEntityManualkey'] = [];
      timeSlotArr[i]['timeSlotEntityGradeKey'] = [];
      for (let k in perVenueEntity) {
        if (rotationId === 4 && perVenueEntity[k].venuePreferenceTypeRefId === 1) {
          timeSlotArr[i]['timeSlotEntityManualkey'].push(perVenueEntity[k].venuePreferenceEntityId);
        } else if (rotationId === 5 && perVenueEntity[k].venuePreferenceTypeRefId === 2) {
          timeSlotArr[i]['timeSlotEntityGradeKey'].push(perVenueEntity[k].venuePreferenceEntityId);
        }
      }
    }
  }
  let perDayVenueTimeSlot = getTimeslotPerVenuePerDay(timeSlotArr);

  return perDayVenueTimeSlot;
}

// get api  getTimeSlotManualEntity
function getTimeSlotManualEntity(timeSlotsArr, rotationId) {
  if (isArrayNotEmpty(timeSlotsArr)) {
    for (let i in timeSlotsArr) {
      let entitiyArr = timeSlotsArr[i].competitionTimeslotsEntity;
      timeSlotsArr[i]['timeSlotEntityManualkey'] = [];
      timeSlotsArr[i]['timeSlotEntityGradeKey'] = [];
      for (let k in entitiyArr) {
        if (rotationId === 4 && entitiyArr[k].venuePreferenceTypeRefId === 1) {
          timeSlotsArr[i]['timeSlotEntityManualkey'].push(entitiyArr[k].venuePreferenceEntityId);
        } else if (rotationId === 5 && entitiyArr[k].venuePreferenceTypeRefId === 2) {
          timeSlotsArr[i]['timeSlotEntityGradeKey'].push(entitiyArr[k].venuePreferenceEntityId);
        }
      }
    }
  }

  let updateTimeSlotManualData = getTimeslotAllVenuePerDay(timeSlotsArr);

  return updateTimeSlotManualData;
}

//get api time Slot entity
function getTimeSlotEntity(data, id) {
  for (let i in data) {
    data[i]['timeSlotEntityManualkeyArr'] = [];
    data[i]['timeSlotEntityGradeKeyArr'] = [];
    let entityInfoArr = data[i].competitionTimeslotsEntityInfo;
    for (let j in entityInfoArr) {
      if (id === 4 && entityInfoArr[j].venuePreferenceTypeRefId === 1) {
        data[i]['timeSlotEntityManualkeyArr'].push(entityInfoArr[j].venuePreferenceEntityId);
      } else if (id === 5 && entityInfoArr[j].venuePreferenceTypeRefId === 2) {
        data[i]['timeSlotEntityGradeKeyArr'].push(entityInfoArr[j].venuePreferenceEntityId);
      }
      // if (id === 4) {
      //     data[i]["timeSlotEntityManualkeyArr"].push(entityInfoArr[j].venuePreferenceTypeRefId)
      // } else {
      //     data[i]["timeSlotEntityGradeKeyArr"].push(entityInfoArr[j].venuePreferenceTypeRefId)
      // }
    }
  }
  if (data.length > 0) {
    return data;
  } else {
    let timeSlotEntityObj = {
      sortOrder: 0,
      competitionTimeslotsEntityInfo: [
        {
          competitionVenueTimeslotEntityId: 0,
          venuePreferenceTypeRefId: '',
          venuePreferenceEntityId: '',
        },
      ],
      timeSlotEntityManualkeyArr: [],
      timeSlotEntityGradeKeyArr: [],
    };
    data.push(timeSlotEntityObj);
    return data;
  }
}

// time Slot entity key
function getTimeSlotEntityObj(selectedEntityArray, value, mainId, index) {
  // let modifiedEntityKeyArray = []
  let modifiedEntityArray = [];
  for (let j in value) {
    let matchTimeSlot = timeSlotEntity(
      value[j],
      selectedEntityArray[index].competitionTimeslotsEntityInfo,
    );
    let timeSlotEntityObject = null;
    if (matchTimeSlot.status) {
      timeSlotEntityObject = {
        competitionVenueTimeslotEntityId: 0,
        venuePreferenceTypeRefId: mainId === 4 ? 1 : 2,
        venuePreferenceEntityId: matchTimeSlot.result.venuePreferenceEntityId,
      };
    } else {
      timeSlotEntityObject = {
        competitionVenueTimeslotEntityId: 0,
        venuePreferenceTypeRefId: mainId === 4 ? 1 : 2,
        venuePreferenceEntityId: value[j],
      };
    }
    modifiedEntityArray.push(timeSlotEntityObject);
  }
  return modifiedEntityArray;
}

function updateManualTimeSlotEntity(data, value, mainId, index) {
  let modifiedManualEntityArray = [];
  for (let i in value) {
    let matchTimeSlotManual = timeSlotEntity(value[i], data);
    let timeSlotEntityManualObject = null;
    if (matchTimeSlotManual.status) {
      timeSlotEntityManualObject = {
        competitionVenueTimeslotEntityId: 0,
        venuePreferenceTypeRefId: mainId === 4 ? 1 : 2,
        venuePreferenceEntityId: matchTimeSlotManual.result.venuePreferenceEntityId,
      };
    } else {
      timeSlotEntityManualObject = {
        competitionVenueTimeslotEntityId: 0,
        venuePreferenceTypeRefId: mainId === 4 ? 1 : 2,
        venuePreferenceEntityId: value[i],
      };
    }
    modifiedManualEntityArray.push(timeSlotEntityManualObject);
  }
  return modifiedManualEntityArray;
}

//get Selected time rotation data
function getSelectedTimeRotation(defaultData, data) {
  let parentId;
  let subParentId;
  for (let i in defaultData) {
    if (defaultData[i].id !== data.timeslotRotationRefId) {
      if (defaultData[i].subReferences !== null) {
        let subReferencesArr = defaultData[i].subReferences;
        for (let j in subReferencesArr) {
          if (subReferencesArr[j].id === data.timeslotRotationRefId) {
            subParentId = subReferencesArr[j].id;
            parentId = defaultData[i].id;
          }
        }
      }
    } else {
      if (defaultData[i].subReferences !== null) {
        parentId = defaultData[i].id;
        subParentId = defaultData[i].subReferences[0].id;
        break;
      } else {
        parentId = defaultData[i].id;
        subParentId = defaultData[i].id;
        break;
      }
    }
  }
  return {
    parentId,
    subParentId,
  };
}

// get Selected Time Rotation Data
function getSelectedTimeGeneration(defaultData, data) {
  let matchtimeRotaion = defaultData.findIndex(x => x.id === data.timeslotRotationRefId);
  if (matchtimeRotaion > -1) {
    defaultData[matchtimeRotaion].isSelected = true;
  }
  return defaultData;
}

//result update
function updatedResultData(data, result) {
  result['mainTimeRotationID'] = data.parentId;
  if (result.timeslotGenerationRefId === 2 && result.applyToVenueRefId === 0) {
    result.applyToVenueRefId = 1;
  }
  return result;
}

///get Rotation Data
// function getRotationData(data) {
//     let RotationData = []
//     if (isArrayNotEmpty(data)) {
//         for (let i in data) {
//             data[i]["isSelected"] = false
//             if (data[i].subReferences !== null) {
//                 let subReferencesData = data[i].subReferences
//                 for (let j in subReferencesData) {
//                     subReferencesData[j]['isSelected'] = false
//                 }
//             }
//         }
//         RotationData = data
//     }
//     return RotationData
// }

/// get venue Data
function getVenueData(data) {
  let updatedData = [];
  if (isArrayNotEmpty(data)) {
    for (let i in data) {
      data[i]['isSelected'] = false;
    }
    updatedData = data;
  }
  return updatedData;
}

//
function matchSelectedVenues(venueId, selectedVenues) {
  let object = {
    status: false,
    result: [],
  };
  for (let i in selectedVenues) {
    if (selectedVenues[i].venueId === venueId) {
      object = {
        status: true,
        result: selectedVenues[i],
      };
      break;
    }
  }
  return object;
}

//check per venue details
function checkPerVenueManual(data, rotaionId) {
  let modifiedPerVenueTimeSlotArr = [];
  let perVenueObj = {
    venueId: 0,
    timeslots: [
      {
        dayRefId: null,
        startTime: [
          {
            startTime: '00:00',
            sortOrder: 0,
            competitionTimeslotsEntity: [
              {
                competitionVenueTimeslotEntityId: 0,
                venuePreferenceTypeRefId: '',
                venuePreferenceEntityId: '',
              },
            ],
            timeSlotEntityManualkey: [],
            timeSlotEntityGradeKey: [],
            competitionVenueTimeslotsDayTimeId: 0,
          },
        ],
      },
    ],
  };
  if (data.length > 0) {
    for (let i in data) {
      if (data[i].venueId === 0) {
        perVenueObj = {
          venueId: 0,
          timeslots: getTimeSlotPerVenueEntity(data[i].timeslots, rotaionId),
        };
      }
    }
  }
  modifiedPerVenueTimeSlotArr.push(perVenueObj);
  return modifiedPerVenueTimeSlotArr;
}

// check selected Venue Details
function checkSelectedVenueDetails(allVenues, selectedVenues, rotationId) {
  let modifiedVenueArray = [];
  for (let i in allVenues) {
    let matchedObject = matchSelectedVenues(allVenues[i].id, selectedVenues);
    let timeSloteObject = null;
    if (matchedObject.status) {
      timeSloteObject = {
        venueName: allVenues[i].name,
        venueId: matchedObject.result.venueId,
        timeslots: getTimeSlotManualEntity(matchedObject.result.timeslots, rotationId),
      };
    } else {
      timeSloteObject = {
        venueName: allVenues[i].name,
        venueId: allVenues[i].id,
        timeslots: [
          {
            dayRefId: null,
            startTime: [
              {
                startTime: '00:00',
                sortOrder: 0,
                competitionTimeslotsEntity: [
                  {
                    competitionVenueTimeslotEntityId: 0,
                    venuePreferenceTypeRefId: '',
                    venuePreferenceEntityId: '',
                  },
                ],
                timeSlotEntityManualkey: [],
                timeSlotEntityGradeKey: [],
                competitionVenueTimeslotsDayTimeId: 0,
              },
            ],
          },
        ],
      };
    }
    modifiedVenueArray.push(timeSloteObject);
  }
  return modifiedVenueArray;
}

//updatedTimeslotsDayTime
function updatedTimeslotsDayTime(result) {
  let initalTimeSlotDaytime = {
    competitionVenueTimeslotsDayTimeId: 0,
    dayRefId: null,
    startTime: '00:00',
    endTime: '00:00',
    sortOrder: null,
    competitionTimeslotsEntity: [],
  };
  if (result.competitionVenueTimeslotsDayTime.length > 0) {
    return result;
  } else {
    result.competitionVenueTimeslotsDayTime.push(initalTimeSlotDaytime);
    return result;
  }
}

function getTimeSlotRotationWithHelpMsg(data, helpMsg) {
  for (let i in data) {
    data[i]['helpMsg'] = helpMsg[i];
  }
  return data;
}

function getTimeSlotGenerationWithHelpMsg(data, helpMsg) {
  for (let i in data) {
    data[i]['helpMsg'] = helpMsg[i];
  }
  return data;
}

// state Competition TIme Slots
function CompetitionTimeSlots(state = initialState, action) {
  switch (action.type) {
    ///get competition with time slot
    case ApiConstants.API_GET_COMPETITION_WITH_TIME_SLOTS_LOAD:
      return { ...state, onLoad: true, onGetTimeSlotLoad: true, error: null };
    case ApiConstants.API_GET_COMPETITION_WITH_TIME_SLOTS_SUCCESS:
      let refData = action.refResult;
      const timeSlotRotationWithHelpMsg = getTimeSlotRotationWithHelpMsg(
        refData.TimeslotRotation,
        state.timeSlotRotationHelpMessage,
      );
      const timeSlotGenerationWithHelpMsg = getTimeSlotGenerationWithHelpMsg(
        refData.TimeslotGeneration,
        state.timeSlotGenerationHelpMessage,
      );
      state.allrefernceData = action.result;
      let venueData = getVenueData(refData.ApplyToVenue);
      // let timeSlotGeneration = getVenueData(refData.TimeslotGeneration)
      state.applyVenue = venueData;
      state.timeSlotRotation = timeSlotRotationWithHelpMsg;
      state.timeSlotGeneration = timeSlotGenerationWithHelpMsg;
      state.weekDays = refData.Day;
      if (action.result.competitionTimeslotManual) {
        for (let timeslotManual of action.result.competitionTimeslotManual) {
          if (timeslotManual.timeslots) {
            sortArrayAlphabetical(timeslotManual.timeslots, item => item.startTime);
          }
        }
      }
      let resultData = JSON.parse(JSON.stringify(action.result));
      let selectedTimeGeneration = getSelectedTimeGeneration(
        state.timeSlotGeneration,
        action.result,
      );
      let SelectedTimeRotationData = getSelectedTimeRotation(state.timeSlotRotation, action.result);
      let timeslotUpdatedResult = updatedResultData(SelectedTimeRotationData, action.result);
      let timeSlotResult = updatedTimeslotsDayTime(
        JSON.parse(JSON.stringify(timeslotUpdatedResult)),
      );
      let timeSlotEntityKey = getTimeSlotEntity(
        action.result.competitionTimeslotsEntity,
        SelectedTimeRotationData.subParentId,
      );
      let timeSlotsManualVenue = checkSelectedVenueDetails(
        resultData.competitionVenues,
        resultData.competitionTimeslotManual,
        SelectedTimeRotationData.subParentId,
      );
      let timeSlotsPerVenue = checkPerVenueManual(
        action.result.competitionTimeslotManual,
        SelectedTimeRotationData.subParentId,
      );
      state.defaultDataAllVenue = timeSlotsManualVenue;
      timeSlotResult['competitionTimeslotsEntity'] = timeSlotEntityKey;
      timeSlotResult['competitionTimeslotManual'] = timeSlotsPerVenue;
      state.getcompetitionTimeSlotData = timeSlotResult;
      state.timeSlotGeneration = selectedTimeGeneration;
      state.allResult = timeSlotResult;
      state.onGetTimeSlotLoad = false;
      state.mainDivisionList = resultData.divisions;
      state.mainGradeList = resultData.grades;
      return {
        ...state,
        timeslotsManualRawData: resultData.competitionTimeslotManual,
        timeSlotManualAllVenue: timeSlotsManualVenue,
        status: action.status,
        onLoad: false,
        error: null,
      };

    case ApiConstants.API_COMPETITION_TIMESLOT_ERROR:
      return {
        ...state,
        onLoad: false,
        onGetTimeSlotLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_COMPETITION_TIMESLOT_FAIL:
      return {
        ...state,
        onLoad: false,
        onGetTimeSlotLoad: false,
        error: action.error,
        status: action.status,
      };

    // update Post Data For Time SLot COMPETITION
    case ApiConstants.UPDATE_POST_DATA_TIME_SLOTS_COMPETITION:
      if (action.key === 'mainTimeRotationID') {
        if (action.value === 9) {
          state.getcompetitionTimeSlotData.timeslotRotationRefId = 1;
          state.getcompetitionTimeSlotData.mainTimeRotationID = action.value;
        } else if (action.value === 8) {
          state.getcompetitionTimeSlotData.timeslotRotationRefId = 4;
          state.getcompetitionTimeSlotData.mainTimeRotationID = action.value;
        } else {
          state.getcompetitionTimeSlotData.timeslotRotationRefId = action.value;
          state.getcompetitionTimeSlotData.mainTimeRotationID = action.value;
        }
      }
      if (action.key === 'timeslotGenerationRefId') {
        if (action.value === 2) {
          state.getcompetitionTimeSlotData.applyToVenueRefId = 1;
          state.getcompetitionTimeSlotData[action.key] = action.value;
        } else {
          state.getcompetitionTimeSlotData[action.key] = action.value;
        }
      }
      if (action.contentType === 'competitionVenueTimeslotsDayTime') {
        let data1 = JSON.parse(
          JSON.stringify(state.getcompetitionTimeSlotData.competitionVenueTimeslotsDayTime),
        );
        let changeTimeSlotData = data1;
        if (action.id === 4) {
          changeTimeSlotData[action.index][action.key] = action.value;
        } else {
          changeTimeSlotData[action.index][action.key] = action.value;
        }
        state.getcompetitionTimeSlotData.competitionVenueTimeslotsDayTime = changeTimeSlotData;
      }

      if (action.contentType === 'competitionTimeslotsEntity') {
        let changeTimeSlotDivision = getTimeSlotEntityObj(
          state.allResult.competitionTimeslotsEntity,
          action.value,
          action.id,
          action.index,
        );
        if (action.id === 4) {
          state.getcompetitionTimeSlotData.competitionTimeslotsEntity[
            action.index
          ].timeSlotEntityManualkeyArr = action.value;
          state.getcompetitionTimeSlotData.competitionTimeslotsEntity[
            action.index
          ].competitionTimeslotsEntityInfo = changeTimeSlotDivision;
        } else {
          state.getcompetitionTimeSlotData.competitionTimeslotsEntity[
            action.index
          ].timeSlotEntityGradeKeyArr = action.value;
          state.getcompetitionTimeSlotData.competitionTimeslotsEntity[
            action.index
          ].competitionTimeslotsEntityInfo = changeTimeSlotDivision;
        }
      }
      if (action.key === 'applyToVenueRefId') {
        state.getcompetitionTimeSlotData[action.key] = action.value;
      }
      if (action.key === 'timeslotRotationRefId') {
        state.getcompetitionTimeSlotData[action.key] = action.value;
      }
      return { ...state };

    case ApiConstants.Api_ADD_REMOVE_TIME_SLOT_TABLE:
      if (action.key === 'addTimeSlotManual') {
        let timeSlotObj = {
          startTime: '00:00',
          sortOrder: null,
          competitionTimeslotsEntity: [
            {
              competitionVenueTimeslotEntityId: 0,
              venuePreferenceTypeRefId: '',
              venuePreferenceEntityId: '',
            },
          ],
          timeSlotEntityManualkey: [],
          timeSlotEntityGradeKey: [],
        };

        state.getcompetitionTimeSlotData['competitionTimeslotManual'][0].timeslots[
          action.index
        ].startTime.push(timeSlotObj);
      }
      if (action.key === 'removeTimeSlotManual') {
        state.getcompetitionTimeSlotData['competitionTimeslotManual'][0].timeslots[
          action.parentIndex
        ].startTime.splice(action.index, 1);
      }
      if (action.key === 'addTimeSlotManualperVenue') {
        let timeSlotPerVenueObj = {
          startTime: '00:00',
          sortOrder: null,
          competitionTimeslotsEntity: [
            {
              competitionVenueTimeslotEntityId: 0,
              venuePreferenceTypeRefId: '',
              venuePreferenceEntityId: '',
            },
          ],
          timeSlotEntityManualkey: [],
          timeSlotEntityGradeKey: [],
          competitionVenueTimeslotsDayTimeId: 0,
        };
        state.timeSlotManualAllVenue[action.parentIndex].timeslots[action.index].startTime.push(
          timeSlotPerVenueObj,
        );
      }
      if (action.key === 'removeTimeSlotManualPerVenue') {
        state.timeSlotManualAllVenue[action.item].timeslots[action.parentIndex].startTime.splice(
          action.index,
          1,
        );
      }

      if (action.key === 'competitionVenueTimeslotsDayTime') {
        let timeSlotObj = {
          competitionVenueTimeslotsDayTimeId: 0,
          dayRefId: null,
          startTime: '00:00',
          endTime: '00:00',
        };
        state.getcompetitionTimeSlotData[action.key].push(timeSlotObj);
      } else if (action.key === 'competitionTimeslotsEntity') {
        let timeSlotDivisionObj = {
          sortOrder: 0,
          competitionTimeslotsEntityInfo: [
            {
              competitionVenueTimeslotEntityId: 0,
              venuePreferenceTypeRefId: '',
              venuePreferenceEntityId: '',
            },
          ],
          timeSlotEntityManualkeyArr: [],
          timeSlotEntityGradeKeyArr: [],
        };
        state.getcompetitionTimeSlotData[action.key].push(timeSlotDivisionObj);
      } else if (action.key === 'competitionTimeslotManual') {
        if (state.getcompetitionTimeSlotData[action.key] === []) {
          state.getcompetitionTimeSlotData[action.key] = state.manaualTimeSlotObj;
        }
        let timeSlotManaualObj = {
          dayRefId: null,
          startTime: [
            {
              startTime: '00:00',
              sortOrder: null,
              competitionTimeslotsEntity: [
                {
                  competitionVenueTimeslotEntityId: 0,
                  venuePreferenceTypeRefId: '',
                  venuePreferenceEntityId: '',
                },
              ],
              timeSlotEntityManualkey: [],
              timeSlotEntityGradeKey: [],
              competitionVenueTimeslotsDayTimeId: 0,
            },
          ],
        };
        state.getcompetitionTimeSlotData[action.key][0].timeslots.push(timeSlotManaualObj);
      } else if (action.key === 'competitionTimeslotManualAllVenue') {
        let timeSlotManaualAllVenueObj = {
          dayRefId: null,
          startTime: [
            {
              startTime: '00:00',
              sortOrder: null,
              competitionTimeslotsEntity: [
                {
                  competitionVenueTimeslotEntityId: 0,
                  venuePreferenceTypeRefId: '',
                  venuePreferenceEntityId: '',
                },
              ],
              timeSlotEntityManualkey: [],
              timeSlotEntityGradeKey: [],
              competitionVenueTimeslotsDayTimeId: 0,
            },
          ],
        };

        state.timeSlotManualAllVenue[action.index].timeslots.push(timeSlotManaualAllVenueObj);
      } else if (action.key === 'competitionVenueTimeslotsDayTimedelete') {
        state.getcompetitionTimeSlotData['competitionVenueTimeslotsDayTime'].splice(
          action.index,
          1,
        );
      } else if (action.key === 'competitionTimeslotsEntitydelete') {
        state.getcompetitionTimeSlotData['competitionTimeslotsEntity'].splice(action.index, 1);
      } else if (action.key === 'competitionTimeslotManualAllVenuedelete') {
        state.timeSlotManualAllVenue[action.item].timeslots.splice(action.index, 1);
      } else if (action.key === 'competitionTimeslotManualdelete') {
        state.getcompetitionTimeSlotData['competitionTimeslotManual'][0].timeslots.splice(
          action.index,
          1,
        );
      }
      return { ...state };

    case ApiConstants.UPDATE_POST_DATA_TIME_SLOTS_MATCHDURATION_REFERENCE_COMPETITION:
      let changeTimeSlotData = [
        ...state.getcompetitionTimeSlotData.competitionVenueTimeslotsDayTime,
      ];

      let timeslotEntitys = changeTimeSlotData[action.index].competitionTimeslotsEntity || [];
      let newEntitys = [];
      action.value.forEach(val => {
        let entity = timeslotEntitys.find(tn => tn.venuePreferenceEntityId == val);
        if (!entity) {
          entity = {
            competitionVenueTimeslotEntityId: 0,
            venuePreferenceTypeRefId:
              action.timeslotRotationRefId === TIMESLOTS_ROTATION_SUB.ALLOCATE_DIVISIONS ? 1 : 2,
            venuePreferenceEntityId: val,
          };
        }
        newEntitys.push(entity);
      });

      changeTimeSlotData[action.index].competitionTimeslotsEntity = newEntitys;

      state.getcompetitionTimeSlotData.competitionVenueTimeslotsDayTime = changeTimeSlotData;
      return { ...state };

    case ApiConstants.UPDATE_POST_DATA_TIME_SLOTS_MANUAL_COMPETITION:
      if (action.contentType === 'competitionTimeslotManualDivision') {
        let changeTimeSlotDataManualDivision =
          state.getcompetitionTimeSlotData.competitionTimeslotManual;
        changeTimeSlotDataManualDivision[0].timeslots[action.parentIndex].startTime[
          action.index
        ].timeSlotEntityManualkey = action.value;
      }
      if (action.contentType === 'competitionTimeslotManual') {
        let changeTimeSlotDataManual = state.getcompetitionTimeSlotData.competitionTimeslotManual;
        if (action.mainId === null) {
          changeTimeSlotDataManual = state.getcompetitionTimeSlotData.competitionTimeslotManual;
          changeTimeSlotDataManual[0].timeslots[action.index][action.key] = action.value;
          state.getcompetitionTimeSlotData.competitionTimeslotManual = changeTimeSlotDataManual;
        } else {
          let timeSlotEntityManual = updateManualTimeSlotEntity(
            changeTimeSlotDataManual[0].timeslots[action.parentIndex].startTime[action.index]
              .competitionTimeslotsEntity,
            action.value,
            action.id,
          );
          if (action.id === 4) {
            changeTimeSlotDataManual[0].timeslots[action.parentIndex].startTime[
              action.index
            ].competitionTimeslotsEntity = timeSlotEntityManual;
            changeTimeSlotDataManual[0].timeslots[action.parentIndex].startTime[
              action.index
            ].timeSlotEntityManualkey = action.value;
            state.getcompetitionTimeSlotData.competitionTimeslotManual = changeTimeSlotDataManual;
          } else {
            changeTimeSlotDataManual[0].timeslots[action.parentIndex].startTime[
              action.index
            ].competitionTimeslotsEntity = timeSlotEntityManual;
            changeTimeSlotDataManual[0].timeslots[action.parentIndex].startTime[
              action.index
            ].timeSlotEntityGradeKey = action.value;
            state.getcompetitionTimeSlotData.competitionTimeslotManual = changeTimeSlotDataManual;
          }
        }
      }
      if (action.contentType === 'competitionTimeslotManualAllvenue') {
        let changeTimeSlotDataManualAllVenue = state.timeSlotManualAllVenue;
        if (action.mainId === null) {
          changeTimeSlotDataManualAllVenue[action.parentIndex].timeslots[action.index][action.key] =
            action.value;
          state.getcompetitionTimeSlotData.competitionTimeslotManual =
            changeTimeSlotDataManualAllVenue;
        } else {
          let timeSlotEntityManualAll = updateManualTimeSlotEntity(
            changeTimeSlotDataManualAllVenue[action.parentIndex].timeslots[action.id].startTime[
              action.index
            ].competitionTimeslotsEntity,
            action.value,
            action.mainId,
            0,
          );
          if (action.mainId === 4) {
            changeTimeSlotDataManualAllVenue[action.parentIndex].timeslots[action.id].startTime[
              action.index
            ].competitionTimeslotsEntity = timeSlotEntityManualAll;
            changeTimeSlotDataManualAllVenue[action.parentIndex].timeslots[action.id].startTime[
              action.index
            ].timeSlotEntityManualkey = action.value;
            state.timeSlotManualAllVenue = changeTimeSlotDataManualAllVenue;
          } else {
            changeTimeSlotDataManualAllVenue[action.parentIndex].timeslots[action.id].startTime[
              action.index
            ].competitionTimeslotsEntity = timeSlotEntityManualAll;
            changeTimeSlotDataManualAllVenue[action.parentIndex].timeslots[action.id].startTime[
              action.index
            ].timeSlotEntityGradeKey = action.value;
            state.timeSlotManualAllVenue = changeTimeSlotDataManualAllVenue;
          }
        }
      }
      if (action.contentType === 'competitionTimeslotManualTime') {
        let changeTimeSlotDataManualTime =
          state.getcompetitionTimeSlotData.competitionTimeslotManual;
        changeTimeSlotDataManualTime[0].timeslots[action.id].startTime[action.index].startTime =
          action.value;
      }

      if (action.contentType === 'competitionTimeslotManualperVenueTime') {
        let changeTimeSlotDataManualperVenueTime = state.timeSlotManualAllVenue;
        changeTimeSlotDataManualperVenueTime[action.parentIndex].timeslots[action.id].startTime[
          action.index
        ].startTime = action.value;
      }
      return { ...state };

    case ApiConstants.API_COMPETITION_TIMESLOT_POST_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_COMPETITION_TIMESLOT_POST_SUCCESS:
      return {
        ...state,
        result: action.result,
        onLoad: false,
        error: null,
        status: action.status,
      };

    case ApiConstants.API_COMPETITION_TEAMS_GET_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_COMPETITION_TEAMS_GET_SUCCESS:
      return {
        ...state,
        teamList: action.result,
        onLoad: false,
        error: null,
        status: action.status,
      };

    // case ApiConstants.API_COMPETITION_TIMESLOTS_GET_LOAD:
    //   return { ...state, onLoad: true, error: null };

    // case ApiConstants.API_COMPETITION_TIMESLOTS_GET_SUCCESS:
    //   return {
    //     ...state,
    //     timeslotsList: action.result,
    //     onLoad: false,
    //     error: null,
    //     status: action.status,
    //   };

    // case ApiConstants.API_TEAM_TIMESLOTS_PREFERENCES_GET_LOAD:
    //   return { ...state, onLoad: true, error: null };

    // case ApiConstants.API_TEAM_TIMESLOTS_PREFERENCES_GET_SUCCESS:
    //   return {
    //     ...state,
    //     timePreferences: action.result,
    //     onLoad: false,
    //     error: null,
    //     status: action.status,
    //   };

    // case ApiConstants.API_TEAM_TIMESLOTS_PREFERENCES_SAVE_LOAD:
    //   return { ...state, onLoad: true, error: null };

    // case ApiConstants.API_TEAM_TIMESLOTS_PREFERENCES_SAVE_SUCCESS:
    //   return {
    //     ...state,
    //     timePreferences: action.result,
    //     onLoad: false,
    //     error: null,
    //     status: action.status,
    //   };

    /// Venue list
    case ApiConstants.API_REG_FORM_VENUE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        allVenueList: action.result,
        status: action.status,
      };

    case ApiConstants.Clear_Division_Timeslot_update:
      if (action.key === 'divisions') {
        state.getcompetitionTimeSlotData.divisions = state.mainDivisionList;
      }
      if (action.key === 'grades') {
        state.getcompetitionTimeSlotData.grades = state.mainGradeList;
      }
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    case ApiConstants.Search_Division_Timeslot_update:
      if (action.key === 'divisions') {
        state.getcompetitionTimeSlotData.divisions = action.value;
      }
      if (action.key === 'grades') {
        state.getcompetitionTimeSlotData.grades = action.value;
      }
      return {
        ...state,
        onLoad: false,
        error: null,
      };
    default:
      return state;
  }
}

export default CompetitionTimeSlots;
