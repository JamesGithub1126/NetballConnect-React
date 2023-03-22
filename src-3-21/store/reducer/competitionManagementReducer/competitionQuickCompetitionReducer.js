import ApiConstants from '../../../themes/apiConstants';
import moment from 'moment';
import {
  isArrayNotEmpty,
  // isNotNullOrEmptyString
} from '../../../util/helpers';
import { isDateSame, sortArrayByDate } from './../../../themes/dateformate';
import ColorsArray from '../../../util/colorsArray';
// import AppConstants from "../../../themes/appConstants";
import { reverseArray } from 'util/permissions';
import { CompetitionFormatType, CompetitionType } from 'util/enums';
import { uniqBy } from 'lodash';
//dummy object
const newQuickComp = {
  competitionName: '',
  competitionVenues: [],
  divisions: [],
  draws: [],
  timeslots: [],
  dateNewArray: [],
  competition: null,
};

//initial state
const initialState = {
  onLoad: false,
  venueEditOnLoad: false,
  error: null,
  result: [],
  status: 0,
  selectedVenues: [],
  timeSlot: [
    {
      dayRefId: 1,
      startTime: [
        {
          startTime: '00:00',
          sortOrder: 0,
        },
      ],
    },
  ],
  division: [
    {
      competitionDivisionId: 0,
      divisionName: '',
      grades: [
        {
          competitionDivisionGradeId: 0,
          gradeName: '',
          noOfTeams: '',
        },
      ],
    },
  ],
  divisionGradeNameList: [],
  roundList: [],
  competitionName: '',
  competitionDate: null,
  competitionTypeRefId: 1,
  competitionFormatRefId: 2,
  noOfRounds: null,
  roundInDays: 7,
  roundInHours: 0,
  roundInMins: 0,
  quick_CompetitionArr: [],
  quick_CompetitionYearArr: [],
  onQuickCompLoad: false,
  selectedCompetition: '',
  quickComptitionDetails: newQuickComp,
  postDivisionData: [],
  postTimeslotData: [],
  timeSlotId: [],
  postDraws: [],
  teamPlayerArray: [
    { id: 1, value: 'Import' },
    { id: 2, value: 'Merge with an Existing Competition' },
  ],
  selectedTeamPlayer: 0,
  importModalVisible: false,
  teamsImportData: [],
  isTeamNotInDraws: 0,
  importPlayer: false,
  postSelectedVenues: [],
  mergeCompetitionList: [],
  onInvitationLoad: false,
  mergeValidate: false,
  validateMessage: '',
  newSelectedCompetition: '',
  mergeCompetitionTypeSelection: null,
  updateStatus: false,
  yearId: null,
};
var gradeColorArray = [];
const lightGray = '#999999';
const colorsArray = ColorsArray;

function setupGradesArray(gradesArray, gradeId) {
  for (let i in gradesArray) {
    if (gradesArray[i] === gradeId) {
      return false;
    }
  }
  return true;
}

function postSwapedDrawsArrayFunc(drawsArray, sourcedrawsId, targetdrawsId, freeObject) {
  let postSourceArray = JSON.parse(JSON.stringify(drawsArray));
  let postTargetArray = JSON.parse(JSON.stringify(drawsArray));
  if (sourcedrawsId !== null && targetdrawsId !== null) {
    let postSourceIndex = postSourceArray.findIndex(x => x.drawsId === sourcedrawsId);
    let postTargetIndex = postTargetArray.findIndex(x => x.drawsId === targetdrawsId);
    let postTarget = JSON.parse(JSON.stringify(postTargetArray[postTargetIndex]));
    let postSource = JSON.parse(JSON.stringify(postSourceArray[postSourceIndex]));
    // drawsArray[postSourceIndex].drawsId = postTarget.drawsId
    drawsArray[postSourceIndex].venueCourtId = postTarget.venueCourtId;
    drawsArray[postSourceIndex].matchDate = postTarget.matchDate;
    drawsArray[postSourceIndex].startTime = postTarget.startTime;
    drawsArray[postSourceIndex].endTime = postTarget.endTime;
    drawsArray[postSourceIndex].isLocked = 1;
    // drawsArray[postTargetIndex].drawsId = postSource.drawsId
    drawsArray[postTargetIndex].venueCourtId = postSource.venueCourtId;
    drawsArray[postTargetIndex].matchDate = postSource.matchDate;
    drawsArray[postTargetIndex].startTime = postSource.startTime;
    drawsArray[postTargetIndex].endTime = postSource.endTime;
    drawsArray[postTargetIndex].isLocked = 1;
  } else {
    if (sourcedrawsId == null) {
      let freeTargetIndex = postTargetArray.findIndex(x => x.drawsId === targetdrawsId);
      drawsArray[freeTargetIndex].matchDate = freeObject.matchDate;
      drawsArray[freeTargetIndex].startTime = freeObject.startTime;
      drawsArray[freeTargetIndex].endTime = freeObject.endTime;
      drawsArray[freeTargetIndex].venueCourtId = freeObject.venueCourtId;
      drawsArray[freeTargetIndex].isLocked = 1;
    }
    if (targetdrawsId == null) {
      let freeSourceIndex = postSourceArray.findIndex(x => x.drawsId === sourcedrawsId);
      drawsArray[freeSourceIndex].matchDate = freeObject.matchDate;
      drawsArray[freeSourceIndex].startTime = freeObject.startTime;
      drawsArray[freeSourceIndex].endTime = freeObject.endTime;
      drawsArray[freeSourceIndex].venueCourtId = freeObject.venueCourtId;
      drawsArray[freeSourceIndex].isLocked = 1;
    }
  }
  return drawsArray;
}

//
function swapedDrawsArrayFunc(drawsArray, sourtXIndex, targetXIndex, sourceYIndex, targetYIndex) {
  let sourceArray = JSON.parse(JSON.stringify(drawsArray));
  let targetArray = JSON.parse(JSON.stringify(drawsArray));

  let source = JSON.parse(JSON.stringify(sourceArray[sourtXIndex].slotsArray[sourceYIndex]));
  let target = JSON.parse(JSON.stringify(targetArray[targetXIndex].slotsArray[targetYIndex]));
  let sourceCopy = JSON.parse(JSON.stringify(sourceArray[sourtXIndex].slotsArray[sourceYIndex]));
  let targetCopy = JSON.parse(JSON.stringify(targetArray[targetXIndex].slotsArray[targetYIndex]));
  let sourceNew = JSON.parse(JSON.stringify(sourceArray[sourtXIndex].slotsArray[sourceYIndex]));
  let targetNew = JSON.parse(JSON.stringify(targetArray[targetXIndex].slotsArray[targetYIndex]));

  // sourceCopy.drawsId = targetNew.drawsId;
  sourceCopy.venueCourtId = targetNew.venueCourtId;
  sourceCopy.matchDate = targetNew.matchDate;
  sourceCopy.startTime = targetNew.startTime;
  sourceCopy.endTime = targetNew.endTime;
  sourceCopy.isLocked = 1;

  // targetCopy.drawsId = sourceNew.drawsId;
  targetCopy.venueCourtId = sourceNew.venueCourtId;
  targetCopy.matchDate = sourceNew.matchDate;
  targetCopy.startTime = sourceNew.startTime;
  targetCopy.endTime = sourceNew.endTime;
  targetCopy.isLocked = 1;

  target.startTime = sourceNew.startTime;
  target.endTime = sourceNew.endTime;
  target.venueCourtId = sourceNew.venueCourtId;
  target.matchDate = sourceNew.matchDate;
  target.isLocked = 1;

  source.matchDate = targetNew.matchDate;
  source.startTime = targetNew.startTime;
  source.endTime = targetNew.endTime;
  source.venueCourtId = targetNew.venueCourtId;
  source.isLocked = 1;

  if (source.drawsId === null) {
    drawsArray[sourtXIndex].slotsArray[sourceYIndex] = target;
    drawsArray[targetXIndex].slotsArray[targetYIndex] = source;
  } else if (target.drawsId === null) {
    drawsArray[sourtXIndex].slotsArray[sourceYIndex] = target;
    drawsArray[targetXIndex].slotsArray[targetYIndex] = source;
  } else {
    drawsArray[sourtXIndex].slotsArray[sourceYIndex] = targetCopy;
    drawsArray[targetXIndex].slotsArray[targetYIndex] = sourceCopy;
  }
  return drawsArray;
}

function setupDateObjectArray(dateArray, drawObject) {
  var tempDateArray = JSON.parse(JSON.stringify(dateArray));
  let defaultDateObject = {
    date: drawObject.matchDate,
    notInDraw: drawObject.outOfCompetitionDate === 1 || drawObject.outOfRoundDate === 1,
  };
  for (let i in dateArray) {
    if (isDateSame(dateArray[i].date, drawObject.matchDate)) {
      if (tempDateArray[i].notInDraw) {
        tempDateArray[i] = defaultDateObject;
      }
      return tempDateArray;
    }
  }
  tempDateArray.push(defaultDateObject);

  return tempDateArray;
}

function checkVenueCourtNumber(mainCourtNumberArray, object) {
  for (let i in mainCourtNumberArray) {
    if (mainCourtNumberArray[i].venueCourtId === object.venueCourtId) {
      return { status: true, index: i };
    }
  }
  return { status: false, index: -1 };
}

function sortDateArray(dateArray) {
  let inDrawsArray = [];
  let outDrawsArray = [];
  for (let i in dateArray) {
    if (!dateArray[i].notInDraw) {
      inDrawsArray.push(dateArray[i]);
    } else {
      outDrawsArray.push(dateArray[i]);
    }
  }
  inDrawsArray = sortArrayByDate(inDrawsArray);
  outDrawsArray = sortArrayByDate(outDrawsArray);

  return inDrawsArray.concat(outDrawsArray);
}

//sort court array
function sortCourtArray(mainCourtNumberArray) {
  let isSortedArray = [];
  const sortAlphaNum = (a, b) =>
    a.venueNameCourtName.localeCompare(b.venueNameCourtName, 'en', { numeric: true });
  // let collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
  // isSortedArray = mainCourtNumberArray.sort(collator.compare)
  // isSortedArray = mainCourtNumberArray.sort((a, b) => a.venueNameCourtName.localeCompare(b.venueNameCourtName));
  isSortedArray = mainCourtNumberArray.sort(sortAlphaNum);
  return isSortedArray;
}

// function for draw structure
function drawsDataStructure(drawsData) {
  let mainCourtNumberArray = [];
  let dateArray = [];
  let gradeArray = [];
  let sortedDateArray = [];
  let sortMainCourtNumberArray = [];
  if (drawsData) {
    if (isArrayNotEmpty(drawsData)) {
      drawsData.forEach(object => {
        dateArray = setupDateObjectArray(dateArray, object);
        if (setupGradesArray(gradeArray, object.competitionDivisionGradeId)) {
          gradeArray.push(object.competitionDivisionGradeId);
        }
        let courtNumberResponse = checkVenueCourtNumber(mainCourtNumberArray, object);
        if (!courtNumberResponse.status) {
          mainCourtNumberArray.push({
            venueCourtNumber: object.venueCourtNumber,
            venueCourtName: object.venueCourtName,
            venueShortName: object.venueShortName,
            venueNameCourtName:
              JSON.stringify(object.venueShortName) + JSON.stringify(object.venueCourtNumber),
            venueCourtId: object.venueCourtId,
            venueId: object.venueId,
            slotsArray: [],
          });
        }
      });
      sortedDateArray = sortDateArray(dateArray);
      sortMainCourtNumberArray = sortCourtArray(JSON.parse(JSON.stringify(mainCourtNumberArray)));
      mainCourtNumberArray = mapSlotObjectsWithTimeSlots(
        drawsData,
        sortMainCourtNumberArray,
        sortedDateArray,
        gradeArray,
      );
    }
  }
  const legendArray = [];
  let legendsArray = createLegendsArray(mainCourtNumberArray, legendArray, sortedDateArray);
  return { mainCourtNumberArray, sortedDateArray, legendsArray };
}
function createLegendsArray(drawsArray, currentLegends, dateArray) {
  const newArray = currentLegends;
  for (const i in drawsArray) {
    for (const j in drawsArray[i].slotsArray) {
      const color = drawsArray[i].slotsArray[j].colorCode;
      const index = currentLegends.findIndex(x => x.colorCode === color);
      const object = {
        colorCode: color,
        gradeName: color === '#999999' ? 'N/A' : drawsArray[i].slotsArray[j].gradeName,
        divisionName: drawsArray[i].slotsArray[j].divisionName
          ? drawsArray[i].slotsArray[j].divisionName
          : 'N/A',
        competitionDivisionGradeId: drawsArray[i].slotsArray[j].competitionDivisionGradeId,
        divisionId: drawsArray[i].slotsArray[j].competitionDivisionId,
        checked: true,
      };
      if (index === -1) {
        if (color !== '#999999') {
          newArray.push(object);
        }
      }
    }
  }
  return newArray;
}
const checkColorMatching = color => x => x.colorCode === color;
function getGradeColor(gradeId) {
  let gradeColorTempArray = JSON.parse(JSON.stringify(gradeColorArray));
  let index = gradeColorTempArray.findIndex(x => x.gradeId === gradeId);

  var color = lightGray;
  if (index !== -1) {
    color = gradeColorTempArray[index].colorCode;
  } else {
    for (var i in colorsArray) {
      let colorIndex = gradeColorTempArray.findIndex(checkColorMatching(colorsArray[i]));
      if (colorIndex === -1) {
        gradeColorArray.push({ gradeId: gradeId, colorCode: colorsArray[i] });
        color = colorsArray[i];
        break;
      }
    }
  }
  return color;
}

function mapSlotObjectsWithTimeSlots(
  drawsArray,
  mainCourtNumberArray,
  sortedDateArray,
  gradeArray,
) {
  for (let i in mainCourtNumberArray) {
    let tempSlotsArray = [];
    for (let j in sortedDateArray) {
      tempSlotsArray.push(
        getSlotFromDate(
          drawsArray,
          mainCourtNumberArray[i].venueCourtId,
          sortedDateArray[j].date,
          gradeArray,
          mainCourtNumberArray[i].venueId,
        ),
      );
    }
    mainCourtNumberArray[i].slotsArray = tempSlotsArray;
  }
  return mainCourtNumberArray;
}
function getSlotFromDate(drawsArray, venueCourtId, matchDate, gradeArray, venueId) {
  let timeIndex = drawsArray.findIndex(x => x.matchDate === matchDate);
  let startTime = drawsArray[timeIndex].startTime;
  let endTime = drawsArray[timeIndex].endTime;
  for (let i in drawsArray) {
    // startTime = drawsArray[i].startTime;
    // endTime = drawsArray[i].endTime;
    if (drawsArray[i].venueCourtId === venueCourtId && drawsArray[i].matchDate == matchDate) {
      let gradeColour = getGradeColor(drawsArray[i].competitionDivisionGradeId);
      drawsArray[i].colorCode = gradeColour;
      return drawsArray[i];
    }
  }

  return {
    drawsId: null,
    venueId: venueId,
    venueCourtNumber: null,
    venueCourtName: null,
    venueCourtId: venueCourtId,
    venueShortName: null,
    matchDate,
    startTime,
    endTime,
    gradeName: null,
    competitionDivisionGradeId: null,
    divisionName: null,
    competitionTimeslotId: null,
    competitionVenueTimeslotDayTimeId: null,
    competitionVenueTimeslotEntityId: null,
    competitionDivisionId: null,
    dayRefId: null,
    colorCode: '#999999',
    isLocked: 0,
  };
}

///sort competition data
function sortCompArray(compListData) {
  let isSortedArray = [];
  const sortAlphaNum = (a, b) =>
    a.competitionName.localeCompare(b.competitionName, 'en', { numeric: true });
  isSortedArray = compListData.sort(sortAlphaNum);
  return isSortedArray;
}

//set competitionvenue object
function createCompetitionVenuesData(value) {
  let VenueObject = {
    competitionVenueId: 0,
    venueId: '',
  };
  let selectVenueArray = [];
  if (value.length > 0) {
    for (let i in value) {
      VenueObject = {
        competitionVenueId: 0,
        venueId: value[i],
      };
      selectVenueArray.push(VenueObject);
    }
  }
  return selectVenueArray;
}
// get competition result
function getCompetitionResult(result) {
  let selectedVenues = [];
  let selectVenues = result.competitionVenues;
  if (selectVenues.length > 0) {
    for (let i in selectVenues) {
      selectedVenues.push(selectVenues[i].venueId);
    }
  }
  return selectedVenues;
}
// check timeslot status
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

//checkTimeSlotId
function checkTimeSlotId(timeSlotData) {
  let timeSlot_ID = 0;
  if (timeSlotData.length > 0) {
    let timeSlot_ID = timeSlotData[0].competitionTimeslotId
      ? timeSlotData[0].competitionTimeslotId
      : 0;
    return timeSlot_ID;
  }
  return timeSlot_ID;
}

//create Timeslot Data
function createTimeslotData(dataArr) {
  let updatedtimeSlotArr = [];
  if (dataArr.length > 0) {
    let data = dataArr[0].timeslots;
    if (data.length > 0) {
      for (let i in data) {
        let matchUpdatedTimeSlot = data[i];
        let timeSlotStatusData = checkTimeSlotStatus(matchUpdatedTimeSlot, updatedtimeSlotArr);
        if (timeSlotStatusData.status) {
          let timeslotUpdatedArray = getTimeslotUpdatedArray(matchUpdatedTimeSlot);
          updatedtimeSlotArr[timeSlotStatusData.index].startTime.push(
            JSON.parse(JSON.stringify(timeslotUpdatedArray)),
          );
        } else {
          let timeslotUpdatedArray = getTimeslotUpdatedArray(matchUpdatedTimeSlot);
          let mainobj = {
            dayRefId: matchUpdatedTimeSlot.dayRefId,
            matchDate: matchUpdatedTimeSlot.matchDate,
            startTime: [timeslotUpdatedArray],
          };
          updatedtimeSlotArr.push(JSON.parse(JSON.stringify(mainobj)));
        }
      }
    }
  }
  return updatedtimeSlotArr;
}
function getTimeslotUpdatedArray(matchUpdatedTimeSlot) {
  let timeslotUpdatedArray = {
    startTime: matchUpdatedTimeSlot.startTime,
    endTime: matchUpdatedTimeSlot.endTime,
    sortOrder: matchUpdatedTimeSlot.sortOrder,
    noOfRounds: matchUpdatedTimeSlot.noOfRounds,
    competitionTimeslotsEntity: matchUpdatedTimeSlot.competitionTimeslotsEntity,
    grades: matchUpdatedTimeSlot.competitionTimeslotsEntity.map(x => x.venuePreferenceEntityId),
    competitionVenueTimeslotsDayTimeId: matchUpdatedTimeSlot.competitionVenueTimeslotsDayTimeId,
  };
  return timeslotUpdatedArray;
}
function setDefaultForWeeklyCompetitionType(state) {
  state.competitionFormatRefId = CompetitionFormatType.RoundRobin;
  state.noOfRounds = null;
  state.roundInDays = 7;
  state.roundInHours = 0;
  state.roundInMins = 0;
}
// state
function QuickCompetitionState(state = initialState, action) {
  switch (action.type) {
    ////Competition name and venues update
    case ApiConstants.API_UPDATE_QUICKCOMPETITION_COMPETITION:
      if (action.key === 'add') {
        state.competitionName = action.value;
      } else if (action.key === 'clear') {
        state.competitionName = '';
        state.competitionDate = null;
        state.competitionTypeRefId = CompetitionType.Weekly;
        setDefaultForWeeklyCompetitionType(state);
      } else if (action.key === 'allData') {
        state.selectedVenues = [];
        state.timeSlot = [];
        state.division = [];
        state.competitionName = '';
        state.postDivisionData = [];
        state.postTimeslotData = [];
        state.timeSlotId = 0;
        state.quickComptitionDetails = JSON.parse(JSON.stringify(newQuickComp));
        state.postDraws = [];
        state.importPlayer = false;
        state.postSelectedVenues = [];
      } else if (action.key === 'date') {
        state.competitionDate = moment(action.value).format('YYYY-MM-DD');
      } else if (action.key == 'competitionTypeRefId') {
        state[action.key] = action.value;
        if (action.value == CompetitionType.Weekly) {
          setDefaultForWeeklyCompetitionType(state);
        } else {
          state.roundInDays = 0;
        }
      } else if (action.key === 'editComp') {
        let competition = state.quickComptitionDetails.competition;
        if (competition) {
          state.competitionName = competition.competitionName;
          state.competitionDate = competition.startDate;
          state.competitionTypeRefId = competition.competitionTypeRefId;
          state.competitionFormatRefId = competition.competitionFormatRefId;
          state.noOfRounds = competition.noOfRounds;
          state.roundInDays = competition.roundInDays;
          state.roundInHours = competition.roundInHours;
          state.roundInMins = competition.roundInMins;
        }
      } else {
        state[action.key] = action.value;
      }
      return {
        ...state,
      };

    ////Competition name and venues update
    case ApiConstants.Update_QuickCompetition_Data:
      if (action.key === 'venues') {
        state.quickComptitionDetails.competitionVenues = createCompetitionVenuesData(
          JSON.parse(JSON.stringify(action.item)),
        );
        state.selectedVenues = action.item;
      }
      if (action.key === 'competitionName') {
        state.quickComptitionDetails.competitionName = action.item;
      }
      return { ...state, onLoad: true };

    // update quick competition timeslot
    case ApiConstants.API_UPDATE_QUICKCOMPETITION_TIMESLOT:
      if (action.key === 'add') {
        let timeSlotobject = {
          dayRefId: 1,
          startTime: [
            {
              competitionVenueTimeslotsDayTimeId: 0,
              startTime: '00:00',
              endTime: '00:00',
              sortOrder: 0,
              competitionTimeslotsEntity: [],
            },
          ],
        };
        state.timeSlot.push(timeSlotobject);
      }
      if (action.key === 'addStartTime') {
        let startTimeObject = {
          competitionVenueTimeslotsDayTimeId: 0,
          startTime: '00:00',
          endTime: '00:00',
          sortOrder: 0,
          competitionTimeslotsEntity: [],
        };
        state.timeSlot[action.index].startTime.push(startTimeObject);
      }
      if (action.key === 'remove') {
        state.timeSlot.splice(action.index, 1);
      }
      if (action.key === 'removeStartTime') {
        state.timeSlot[action.index].startTime.splice(action.timeindex, 1);
      }
      if (action.key === 'changeTime') {
        state.timeSlot[action.index].startTime[action.timeindex].startTime = action.value;
      }
      // else if (action.key === 'changeEndTime') {
      //   state.timeSlot[action.index].startTime[action.timeindex].endTime = action.value;
      // }
      if (action.key === 'day') {
        state.timeSlot[action.index].dayRefId = action.value;
      }
      if (action.key === 'swapTimeslot') {
        state.timeSlot = JSON.parse(JSON.stringify(state.postTimeslotData));
      }
      return {
        ...state,
      };
    // update quick competition division
    case ApiConstants.API_UPDATE_QUICKCOMPETITION_Division:
      if (action.key === 'addDivision') {
        let divisionObject = {
          competitionDivisionId: 0,
          divisionName: '',
          grades: [
            {
              competitionDivisionGradeId: 0,
              gradeName: '',
              noOfTeams: '',
            },
          ],
        };
        state.division.push(divisionObject);
      } else if (action.key === 'addGrade') {
        let gradeObject = {
          competitionDivisionGradeId: 0,
          gradeName: '',
          noOfTeams: '',
        };
        state.division[action.index].grades.push(gradeObject);
      } else if (action.key === 'removeDivision') {
        state.division.splice(action.index, 1);
      } else if (action.key === 'removeGrade') {
        state.division[action.index].grades.splice(action.gradeIndex, 1);
      } else if (action.key === 'divisionName') {
        state.division[action.index].divisionName = action.value;
      } else if (action.key === 'noOfTeams') {
        state.division[action.index].grades[action.gradeIndex].noOfTeams = action.value;
      } else if (action.key === 'gradeName') {
        state.division[action.index].grades[action.gradeIndex].gradeName = action.value;
      } else if (action.key === 'swap') {
        state.division = JSON.parse(JSON.stringify(state.postDivisionData));
      } else if (action.key === 'matchDuration') {
        state.division[action.index].matchDuration = action.value;
      } else {
        state.division[action.index][action.key] = action.value;
      }
      return {
        ...state,
      };

    ///////create quick competition  load
    case ApiConstants.API_CREATE_QUICK_COMPETITION_LOAD:
      state.selectedCompetition = '';
      return {
        ...state,
        onLoad: true,
        onQuickCompLoad: true,
        updateStatus: false,
      };
    ///////create quick competition  success
    case ApiConstants.API_CREATE_QUICK_COMPETITION_SUCCESS:
      let AllCompListData = JSON.parse(JSON.stringify(state.quick_CompetitionArr));
      let newCompetitionData = JSON.parse(JSON.stringify(action.result));
      state.selectedCompetition = newCompetitionData.competitionId;
      AllCompListData.push(newCompetitionData);
      let sortCompData = sortCompArray(AllCompListData);
      state.quick_CompetitionArr = sortCompData;
      state.onQuickCompLoad = false;
      return {
        ...state,
        onLoad: false,
      };
    case ApiConstants.API_EXPORT_QUICK_COMPETITION_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_EXPORT_QUICK_COMPETITION_SUCCESS:
      return {
        ...state,
        onLoad: false,
      };
    ///////quick competition  fail
    case ApiConstants.API_QUICK_COMPETITION_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        onQuickCompLoad: false,
      };
    ///////quick competition  error
    case ApiConstants.API_QUICK_COMPETITION_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        onQuickCompLoad: false,
      };

    ////////post/save quick competition division load
    case ApiConstants.API_SAVE_QUICK_COMPETITION_DIVISION_LOAD:
      return { ...state, onLoad: true, error: null, onQuickCompLoad: true };
    ////////post/save quick competition division success
    case ApiConstants.API_SAVE_QUICK_COMPETITION_DIVISION_SUCCESS:
      state.division = JSON.parse(JSON.stringify(action.result.divisions));
      state.postDivisionData = JSON.parse(JSON.stringify(action.result.divisions));
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
        onQuickCompLoad: false,
      };

    ////get year and  quick competition list load
    case ApiConstants.API_YEAR_AND_QUICK_COMPETITION_LOAD:
      return { ...state, onLoad: true };
    ////get year and  quick competition list success
    case ApiConstants.API_YEAR_AND_QUICK_COMPETITION_SUCCESS:
      let yearListSorted = action.yearList ? reverseArray(action.yearList) : [];
      return {
        ...state,
        quick_CompetitionArr: action.competetionListResult,
        quick_CompetitionYearArr: yearListSorted,
        onLoad: false,
        error: null,
        yearId: action.yearId,
      };
    ////get quick competition Load
    case ApiConstants.API_GET_QUICK_COMPETITION_LOAD:
      return { ...state, onQuickCompLoad: true, selectedCompetition: '' };
    ////get quick competition success
    case ApiConstants.API_GET_QUICK_COMPETITION_SUCCESS:
      let detailsResult = JSON.parse(JSON.stringify(action.result));
      let competiitonResult = getCompetitionResult(JSON.parse(JSON.stringify(action.result)));
      detailsResult.competitionVenues = createCompetitionVenuesData(
        JSON.parse(JSON.stringify(competiitonResult)),
      );
      let timeSlotResultArr = createTimeslotData(
        JSON.parse(JSON.stringify(action.result.competitionTimeslotManual)),
      );
      state.timeSlot = JSON.parse(JSON.stringify(timeSlotResultArr));
      state.postTimeslotData = JSON.parse(JSON.stringify(timeSlotResultArr));
      state.selectedVenues = competiitonResult;
      state.postSelectedVenues = competiitonResult;
      state.timeSlotId = checkTimeSlotId(
        JSON.parse(JSON.stringify(action.result.competitionTimeslotManual)),
      );
      state.division = JSON.parse(JSON.stringify(action.result.divisions));
      state.postDivisionData = JSON.parse(JSON.stringify(action.result.divisions));
      state.postDraws = JSON.parse(JSON.stringify(action.result.draws));
      let drawsData = drawsDataStructure(JSON.parse(JSON.stringify(action.result.draws)));
      detailsResult.draws = drawsData.mainCourtNumberArray;
      detailsResult.dateNewArray = drawsData.sortedDateArray;
      // detailsResult.legendsArray = drawsData.legendsArray;
      state.divisionGradeNameList = drawsData.legendsArray || [];
      state.roundList = uniqBy(
        action.result.draws.map(x => {
          return {
            roundId: x.roundId,
            roundName: x.roundName,
            checked: true,
          };
        }),
        'roundId',
      );
      state.onQuickCompLoad = false;
      state.isTeamNotInDraws = action.result.isTeamNotInDraws;
      state.importPlayer = JSON.parse(JSON.stringify(action.result.importPlayer));
      return {
        ...state,
        quickComptitionDetails: detailsResult,
        // onQuickCompLoad: false
      };

    ////time slot post quick competition load
    case ApiConstants.API_QUICK_COMPETITION_TIMESLOT_POST_LOAD:
      return { ...state, onQuickCompLoad: true, error: null };
    ////time slot post quick competition success
    case ApiConstants.API_QUICK_COMPETITION_TIMESLOT_POST_SUCCESS:
      state.postTimeslotData = JSON.parse(JSON.stringify(state.timeSlot));
      state.timeSlotId = action.result.id;
      return {
        ...state,
        result: action.result,
        onLoad: false,
        onQuickCompLoad: false,
        error: null,
        status: action.status,
      };

    ////update quick competition load
    case ApiConstants.API_UPDATE_QUICK_COMPETITION_LOAD:
      return { ...state, onLoad: true, onQuickCompLoad: true };
    ////update quick competition Success
    case ApiConstants.API_UPDATE_QUICK_COMPETITION_SUCCESS:
      state.updateStatus = action.updateStatus;
      let AllCompListArr = JSON.parse(JSON.stringify(state.quick_CompetitionArr));
      let changeCompIndex = AllCompListArr.findIndex(x => x.competitionId === action.competitionId);
      AllCompListArr[changeCompIndex].competitionName = action.competitionName;
      let newSortCompData = sortCompArray(AllCompListArr);
      state.quick_CompetitionArr = newSortCompData;
      let detailsResultData = JSON.parse(JSON.stringify(action.detailResult));
      let competiitonResultData = getCompetitionResult(
        JSON.parse(JSON.stringify(action.detailResult)),
      );
      detailsResultData.competitionVenues = createCompetitionVenuesData(
        JSON.parse(JSON.stringify(competiitonResultData)),
      );
      let timeslotArr = createTimeslotData(
        JSON.parse(JSON.stringify(action.detailResult.competitionTimeslotManual)),
      );
      state.timeSlot = JSON.parse(JSON.stringify(timeslotArr));
      state.postTimeslotData = JSON.parse(JSON.stringify(timeslotArr));
      state.timeSlotId = checkTimeSlotId(
        JSON.parse(JSON.stringify(action.detailResult.competitionTimeslotManual)),
      );
      state.selectedVenues = competiitonResultData;
      state.postSelectedVenues = competiitonResultData;
      state.division = JSON.parse(JSON.stringify(action.detailResult.divisions));
      state.postDivisionData = JSON.parse(JSON.stringify(action.detailResult.divisions));
      state.importPlayer = JSON.parse(JSON.stringify(action.detailResult.importPlayer));
      state.postDraws = JSON.parse(JSON.stringify(action.detailResult.draws));
      let drawsDataArray = drawsDataStructure(
        JSON.parse(JSON.stringify(action.detailResult.draws)),
      );
      detailsResultData.draws = drawsDataArray.mainCourtNumberArray;
      detailsResultData.dateNewArray = drawsDataArray.sortedDateArray;
      state.divisionGradeNameList = drawsDataArray.legendsArray || [];
      state.roundList = uniqBy(
        action.detailResult.draws.map(x => {
          return {
            roundId: x.roundId,
            roundName: x.roundName,
            checked: true,
          };
        }),
        'roundId',
      );
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
        quickComptitionDetails: detailsResultData,
        onQuickCompLoad: false,
      };
    case ApiConstants.API_QUICK_COMPETITION_GENERATE_FIXTURE_LOAD:
      return { ...state, onLoad: true, onQuickCompLoad: true };
    case ApiConstants.API_QUICK_COMPETITION_ADD_TEAM_LOAD:
      return { ...state, onLoad: true, onQuickCompLoad: true };
    case ApiConstants.API_UPDATE_QUICKCOMPETITION_DRAWS:
      let sourceXIndex = action.sourceArray[0];
      let sourceYIndex = action.sourceArray[1];
      let targetXIndex = action.targetArray[0];
      let targetYIndex = action.targetArray[1];
      let sourceDrawId = action.sourceDrawsId;
      let targetDrawId = action.targetDrawsId;
      let drawDataCase = state.quickComptitionDetails.draws;
      let swapedDrawsArray = state.quickComptitionDetails.draws;
      let postDrawDataCase = state.postDraws;
      let postSwapedDrawsArray = state.postDraws;
      postSwapedDrawsArray = postSwapedDrawsArrayFunc(
        postDrawDataCase,
        sourceDrawId,
        targetDrawId,
        action.freeObject,
      );
      state.postDraws = postSwapedDrawsArray;
      swapedDrawsArray = swapedDrawsArrayFunc(
        drawDataCase,
        sourceXIndex,
        targetXIndex,
        sourceYIndex,
        targetYIndex,
      );
      state.quickComptitionDetails.draws = swapedDrawsArray;

      return {
        ...state,
        onQuickCompLoad: false,
      };

    case ApiConstants.API_UPDATE_QUICKCOMPETITION_INVITATIONS:
      if (action.key === 'selectedTeamPlayer') {
        state.selectedTeamPlayer = action.value;
        if (action.value === 1) {
          state.importModalVisible = true;
        } else {
          state.importModalVisible = false;
        }
      }
      if (action.key === 'importModalVisible') {
        state.importModalVisible = false;
        state.teamsImportData = [];
      }

      return {
        ...state,
      };

    case ApiConstants.QUICKCOMP_IMPORT_DATA_CLEAN:
      if (action.key === 'all') {
        state.selectedTeamPlayer = 0;
        state.mergeValidate = false;
        state.teamsImportData = [];
      }
      return {
        ...state,
      };
    case ApiConstants.QUICKCOMP_IMPORT_DATA_LOAD:
      return {
        ...state,
        onLoad: true,
        status: null,
        error: null,
      };
    case ApiConstants.QUICKCOMP_IMPORT_DATA_SUCCESS:
      let resTeams = action.result;
      return {
        ...state,
        onLoad: false,
        teamsImportData: resTeams.data,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_QUICK_COMPETITION_ADD_VENUE_LOAD:
      return {
        ...state,
        onLoad: true,
        onQuickCompLoad: true,
        error: null,
        status: null,
      };

    case ApiConstants.API_QUICK_COMPETITION_ADD_VENUE_SUCCESS:
      state.postSelectedVenues = JSON.parse(JSON.stringify(state.selectedVenues));
      return {
        ...state,
        onLoad: false,
        onQuickCompLoad: false,
        status: action.status,
      };

    case ApiConstants.API_GET_MERGE_COMPETITION_LOAD:
      return {
        ...state,
        status: action.status,
      };

    case ApiConstants.API_GET_MERGE_COMPETITION_SUCCESS:
      return {
        ...state,
        status: action.status,
        mergeCompetitionList: action.result,
      };

    case ApiConstants.API_VALIDATE_MERGE_COMPETITION_LOAD:
      return {
        ...state,
        onInvitationLoad: true,
        error: null,
        mergeValidate: false,
      };
    case ApiConstants.API_VALIDATE_MERGE_COMPETITION_SUCCESS:
      return {
        ...state,
        onInvitationLoad: false,
        error: null,
        mergeCompetitionTypeSelection: action.result,
        mergeValidate: action.validateSuccess,
        validateMessage: action.result.message,
      };

    case ApiConstants.API_MERGE_COMPETITION_PROCESS_LOAD:
      return {
        ...state,
        onInvitationLoad: true,
        error: null,
        status: 0,
        newSelectedCompetition: '',
      };

    case ApiConstants.API_MERGE_COMPETITION_PROCESS_SUCCESS:
      let selectedCompetitionId = action.result.competitionId;
      let selectedCompetitionName = action.result.competitionName;
      let matchSelectedCompetitionIndex = state.quick_CompetitionArr.findIndex(
        x => x.competitionId === selectedCompetitionId,
      );
      if (matchSelectedCompetitionIndex === -1) {
        let competitionUniquekey = {
          competitionId: selectedCompetitionId,
          competitionName: selectedCompetitionName,
        };
        state.quick_CompetitionArr.push(competitionUniquekey);
      }
      state.newSelectedCompetition = action.result.competitionId;
      return {
        ...state,
        onInvitationLoad: false,
        error: null,
        status: 0,
      };

    case ApiConstants.API_UPDATE_STATUS_TIMESLOT_LOAD:
      return { ...state, onQuickCompLoad: true, error: null };

    case ApiConstants.API_UPDATE_STATUS_TIMESLOT_SUCCESS:
      return {
        ...state,
        onQuickCompLoad: false,
        error: null,
      };

    case ApiConstants.API_UPDATE_STATUS_DIVISION_LOAD:
      return {
        ...state,
        onQuickCompLoad: true,
        error: null,
      };
    case ApiConstants.API_UPDATE_STATUS_DIVISION_SUCCESS:
      return {
        ...state,
        onQuickCompLoad: false,
        error: null,
      };
    case ApiConstants.API_UPDATE_STATUS_VENUE_LOAD:
      return {
        ...state,
        onQuickCompLoad: true,
        error: null,
      };
    case ApiConstants.API_UPDATE_STATUS_VENUE_SUCCESS:
      return {
        ...state,
        onQuickCompLoad: false,
        error: null,
      };
    default:
      return state;
  }
}

export default QuickCompetitionState;
