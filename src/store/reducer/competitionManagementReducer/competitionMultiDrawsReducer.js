/* eslint-disable no-param-reassign, guard-for-in, no-restricted-syntax */
import ColorsArray from 'util/colorsArray';
import {
  clone,
  isArrayNotEmpty,
  uniq,
  // isNotNullOrEmptyString
} from 'util/helpers';
import ApiConstants from 'themes/apiConstants';
import AppConstants from 'themes/appConstants';
import { getWeekDay, isDateSame, sortArrayByDate } from 'themes/dateformate';
import { randomKeyGen } from '../../../util/helpers';
import moment from 'moment';
import DrawConstant from 'themes/drawConstant';
import {
  getDiffBetweenStartAndEnd,
  getAllowedSubcourtsForField,
  getEndTime,
  getMinuteDuration,
  getCustomSubCourt,
  generateGradientArray,
  isVenueFieldConfigurationEnabled,
  TimeslotHourlyList,
  showOnlySelectedDivisions,
  showOnlySelectedOrganisations,
} from '../../../util/drawUtil';
import { DrawShowOnlyType } from 'util/enums';
import { isFootball } from 'util/registrationHelper';
const initialState = {
  changeStatus: false,
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  getDrawsData: [],
  getStaticDrawsData: [],
  dateArray: [],
  getDrawsRoundsData: [],
  competitionVenues: [],
  updateLoad: false,
  gradeColorArray: [],
  divisionGradeNameList: [],
  divisionGradeNameListForRound: [],
  maindivisionGradeNameList: [],
  publishStatus: 0,
  isTeamInDraw: null,
  legendsArray: [],
  fixtureDivisionGradeNameList: [],
  divisionLoad: false,
  fixtureArray: [],
  updateFixtureLoad: false,
  getRoundsDrawsdata: [],
  filteredRoundsDrawsdata: [],
  spinLoad: false,
  drawOrganisations: [],
  // colorsArray: [],
  activeDrawsRoundsData: [],
  onActRndLoad: false,
  teamNames: null,
  liveScoreCompetiton: null,
  allcompetitionDateRange: [],
  drawDivisions: [],
  drawsCompetitionArray: [],
  onImportLoad: false,
  isPastMatchAvailable: null,
  isTimelineMode: false,
  hasSubCourtDivision: false,
  importResult: null,
  isCompByRound: true,
  timelsotHourlyList: clone(TimeslotHourlyList),
  unCheckedGradeIds: [],
};

const gradeColorArray = [];
const gradeCompColorArray = [];
// let fixtureColorArray = [];
const colorsArray = ColorsArray;
const lightGray = '#999999';
let legendsArray = [];
// let colorsArrayDup = [...colorsArray];
let allColorsArray = colorsArray;
let divisionGradeColorInfos = [];

export const checkColorMatching = color => x => x.colorCode === color;

function createCompLegendsArray(drawsArray, currentLegends, dateArray) {
  const newArray = currentLegends;
  for (const courtDraws of drawsArray) {
    for (const draw of courtDraws.slotsArray) {
      const { competitionName } = draw;
      const compIndex = currentLegends.findIndex(x => x.competitionName === competitionName);
      if (compIndex === -1) {
        const color = draw.colorCode;
        if (color !== '#999999') {
          newArray.unshift({ competitionName, legendArray: [] });
          // let index = currentLegends.findIndex((x) => x.colorCode === color)
          const object = {
            colorCode: color,
            gradeName: color === '#999999' ? 'N/A' : draw.gradeName,
            divisionName: draw.divisionName ? draw.divisionName : 'N/A',
            competitionDivisionGradeId: draw.competitionDivisionGradeId
              ? draw.competitionDivisionGradeId
              : 'N/A',
            checked: true,
            isDivisionDeleted: draw.isDivisionDeleted,
            isGradeDeleted: draw.isGradeDeleted,
          };

          // if (index === -1) {
          newArray[0].legendArray.push(object);
          //     break;
          // }
        }
      } else {
        const color = draw.colorCode;
        const getIndex = newArray[compIndex].legendArray.findIndex(x => x.colorCode === color);
        if (getIndex === -1) {
          const object = {
            colorCode: color,
            gradeName: color === '#999999' ? 'N/A' : draw.gradeName,
            divisionName: draw.divisionName ? draw.divisionName : 'N/A',
            competitionDivisionGradeId: draw.competitionDivisionGradeId
              ? draw.competitionDivisionGradeId
              : 'N/A',
            checked: true,
            isDivisionDeleted: draw.isDivisionDeleted,
            isGradeDeleted: draw.isGradeDeleted,
          };
          if (color !== '#999999') {
            newArray[compIndex].legendArray.push(object);
          }
        }
      }
    }
  }
  return newArray;
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
      };
      if (index === -1) {
        if (color !== '#999999') {
          newArray.push(object);
        }
      }
    }
  }
  const dateArrayLength = isArrayNotEmpty(dateArray) ? dateArray.length : 1;
  let temparray = [];
  const finalLegendsChunkArray = [];
  for (let i = 0, j = newArray.length; i < j; i += dateArrayLength) {
    temparray = newArray.slice(i, i + dateArrayLength);
    finalLegendsChunkArray.push(temparray);
  }
  return finalLegendsChunkArray;
}

// function setFixtureColor(data) {
//     let fixtureDraws
//     for (let i in data) {
//         fixtureDraws = data[i].draws
//         for (let j in fixtureDraws) {
//             // let colorTeam = getColor(fixtureDraws[j].team1)
//             fixtureDraws[j].team1Color = getFixtureColor(fixtureDraws[j].team1)
//             fixtureDraws[j].team2Color = getFixtureColor(fixtureDraws[j].team2)
//         }
//     }
//     return data
// }

// sort court array
const sortAlphaNum = (a, b) =>
  a.venueNameCourtName.localeCompare(b.venueNameCourtName, 'en', { numeric: true });

function sortCourtArray(mainCourtNumberArray) {
  let isSortedArray = mainCourtNumberArray.sort(sortAlphaNum);
  return isSortedArray;
}

function sortDateArray(dateArray) {
  let inDrawsArray = [];
  let outDrawsArray = [];
  for (const i in dateArray) {
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

function setupDateObjectArray(dateArray, drawObject) {
  let notInDraw = drawObject.outOfCompetitionDate === 1 || drawObject.outOfRoundDate === 1;
  let dateExist = dateArray.some(x => x.date == drawObject.matchDate && x.notInDraw == notInDraw);
  if (!dateExist && !notInDraw) {
    const slotDayOfWeek = getWeekDay(drawObject.matchDate);
    const defaultDateObject = {
      date: drawObject.matchDate,
      endTime: drawObject.endTime,
      startTime: drawObject.startTime,
      dayOfWeek: slotDayOfWeek,
      notInDraw: notInDraw,
    };
    dateArray.push(defaultDateObject);
  }
  return dateArray;
}

function setupGradesArray(gradesArray, gradeId) {
  for (const i in gradesArray) {
    if (gradesArray[i] === gradeId) {
      return false;
    }
  }
  return true;
}

function checkVenueCourtNumber(mainCourtNumberArray, object) {
  for (const i in mainCourtNumberArray) {
    if (mainCourtNumberArray[i].venueCourtId === object.venueCourtId) {
      return { status: true, index: i };
    }
  }
  return { status: false, index: -1 };
}

function getDrawsDuplicate(drawsArray, drawsObject) {
  for (const d of drawsArray) {
    let isDuplicate =
      d.drawsId !== drawsObject.drawsId &&
      d.venueCourtId === drawsObject.venueCourtId &&
      d.matchDate == drawsObject.matchDate &&
      d.outOfRoundDate == drawsObject.outOfRoundDate;
    if (isVenueFieldConfigurationEnabled) {
      isDuplicate = isDuplicate && (!drawsObject.subCourt || d.subCourt == drawsObject.subCourt);
    }
    if (isDuplicate) {
      return true;
    }
  }
}

function getCompGradeColor(gradeId, competitionUniqueKey) {
  const gradeColorCompTempArray = gradeCompColorArray.slice(0);
  const compIndex = gradeColorCompTempArray.findIndex(
    x => x.competitionUniqueKey === competitionUniqueKey,
  );
  let compGradeColor = lightGray;
  if (compIndex !== -1) {
    const compGradeIndex = gradeColorCompTempArray[compIndex].newGradesArray.findIndex(
      x => x.gradeId === gradeId,
    );
    if (compGradeIndex !== -1) {
      compGradeColor = gradeColorCompTempArray[compIndex].newGradesArray[compGradeIndex].colorCode;
    } else {
      for (const i in allColorsArray) {
        const colorIndex = gradeColorCompTempArray[compIndex].newGradesArray.findIndex(
          checkColorMatching(allColorsArray[i]),
        );
        if (colorIndex === -1) {
          gradeCompColorArray[compIndex].newGradesArray.push({
            gradeId,
            colorCode: allColorsArray[i],
          });
          compGradeColor = allColorsArray[i];
          allColorsArray.splice(i, 1);
          break;
        }
      }
    }
  } else {
    gradeCompColorArray.unshift({ competitionUniqueKey, newGradesArray: [] });
    for (const j in allColorsArray) {
      const colorIndex = gradeCompColorArray[0].newGradesArray.findIndex(
        checkColorMatching(allColorsArray[j]),
      );
      if (colorIndex === -1) {
        gradeCompColorArray[0].newGradesArray.push({ gradeId, colorCode: allColorsArray[j] });
        compGradeColor = allColorsArray[j];
        allColorsArray.splice(j, 1);
        break;
      }
    }
  }
  return compGradeColor;
}

function getGradeColor(gradeId) {
  const gradeColorTempArray = gradeColorArray.slice(0);
  const index = gradeColorTempArray.findIndex(x => x.gradeId === gradeId);

  let color = lightGray;
  if (index !== -1) {
    color = gradeColorTempArray[index].colorCode;
  } else {
    for (const i in colorsArray) {
      const colorIndex = gradeColorTempArray.findIndex(checkColorMatching(colorsArray[i]));
      if (colorIndex === -1) {
        gradeColorArray.push({ gradeId, colorCode: colorsArray[i] });
        color = colorsArray[i];
        break;
      }
    }
  }
  return color;
}

function getGradientColorForDivisionGrade(colorArrays, draw) {
  const divisionGradeColor = divisionGradeColorInfos.find(
    info => info.divisionName === draw.divisionName && info.gradeName === draw.gradeName,
  );
  if (divisionGradeColor) {
    return divisionGradeColor.color;
  } else {
    const divisionInfos = divisionGradeColorInfos.filter(
      info => info.divisionName === draw.divisionName,
    );
    const divisionInfo = divisionInfos[divisionInfos.length - 1];
    if (divisionInfo) {
      if (divisionInfo.gradeIndex < colorArrays[0].length - 1) {
        const color = colorArrays[divisionInfo.divisionIndex][divisionInfo.gradeIndex + 1];
        divisionGradeColorInfos.push({
          divisionName: draw.divisionName,
          gradeName: draw.gradeName,
          divisionIndex: divisionInfo.divisionIndex,
          gradeIndex: divisionInfo.gradeIndex + 1,
          color: color,
        });
        return color;
      } else {
        const color = colorArrays[divisionInfo.divisionIndex + 1][0];
        divisionGradeColorInfos.push({
          divisionName: draw.divisionName,
          gradeName: draw.gradeName,
          divisionIndex: divisionInfo.divisionIndex + 1,
          gradeIndex: 0,
          color: color,
        });
        return color;
      }
    } else {
      if (divisionGradeColorInfos.length !== 0) {
        const lastDivisionInfo = divisionGradeColorInfos[divisionGradeColorInfos.length - 1];
        const color = colorArrays[lastDivisionInfo.divisionIndex + 1][0];
        divisionGradeColorInfos.push({
          divisionName: draw.divisionName,
          gradeName: draw.gradeName,
          divisionIndex: lastDivisionInfo.divisionIndex + 1,
          gradeIndex: 0,
          color: color,
        });
        return color;
      } else {
        const color = colorArrays[0][0];
        divisionGradeColorInfos.push({
          divisionName: draw.divisionName,
          gradeName: draw.gradeName,
          divisionIndex: 0,
          gradeIndex: 0,
          color: color,
        });
        return color;
      }
    }
  }
  return '#999999';
}

function getSlotFromDate(
  drawsArray,
  dateObj,
  gradeArray,
  key,
  mainCourtNumber,
  venuesData,
  hasSubCourtDivision,
) {
  let matchDate = dateObj.date;
  let startTime = dateObj.startTime;
  let endTime = dateObj.endTime;
  const slotDayOfWeek = dateObj.dayOfWeek;
  let outOfRoundDate = dateObj.notInDraw;
  const { venueCourtId, venueCourtNumber, venueCourtName, venueShortName, venueId } =
    mainCourtNumber;
  let sameTimeSlotArray = [];
  const colorArrays = generateGradientArray(0);
  for (const draw of drawsArray) {
    let notInDraw = draw.outOfCompetitionDate === 1 || draw.outOfRoundDate === 1;
    if (draw.matchDate == matchDate && notInDraw == dateObj.notInDraw) {
      startTime = draw.startTime;
      endTime = draw.endTime;
      if (draw.venueCourtId === venueCourtId) {
        // const gradeColour =
        //   key === 'all'
        //     ? getCompGradeColor(draw.competitionDivisionGradeId, draw.competitionUniqueKey)
        //     : getGradeColor(draw.competitionDivisionGradeId);

        const colorInfoObj = getGradientColorForDivisionGrade(colorArrays, draw);
        draw.colorCode = colorInfoObj.code;
        draw.fontColor = colorInfoObj.bright < 50 ? '#FFFFFF' : '#000000';
        draw.teamArray = [
          {
            teamName: draw.homeTeamName,
            teamId: draw.homeTeamId,
          },
          {
            teamName: draw.awayTeamName,
            teamId: draw.awayTeamId,
          },
        ];

        draw.slotId = randomKeyGen(5);
        draw.minuteDuration = getMinuteDuration(draw);
        sameTimeSlotArray.push(draw);
        const checkDuplicate = getDrawsDuplicate(drawsArray, draw);
        if (checkDuplicate) {
          draw.duplicate = true;
        } else {
          draw.duplicate = false;
        }
        if (!hasSubCourtDivision) {
          break;
        }
      }
    }
  }
  let allowedSubCourt = [];
  if (isVenueFieldConfigurationEnabled) {
    const courtConfig = venuesData
      .find(venue => venue.id === venueId)
      .courts.find(court => court.courtId === venueCourtId);
    let fieldConfigurationRefId = courtConfig.fieldConfigurationRefId;
    let fieldConfigurationCustom = courtConfig.fieldConfigurationCustom;
    let courtObj = courtConfig;
    if (courtConfig.availableTimeslots && courtConfig.availableTimeslots.length > 0) {
      let slotConfig = courtConfig.availableTimeslots.findLast(
        s =>
          s.timeslot.day === slotDayOfWeek &&
          s.timeslot.startTime < endTime &&
          s.timeslot.endTime > startTime,
      );
      if (slotConfig) {
        fieldConfigurationRefId = slotConfig.timeslot.fieldConfigurationRefId;
        fieldConfigurationCustom = slotConfig.timeslot.fieldConfigurationCustom;
        courtObj = slotConfig.timeslot;
      }
    }

    if (courtObj.allowedSubCourt) {
      allowedSubCourt = courtObj.allowedSubCourt;
    } else {
      if (fieldConfigurationCustom && fieldConfigurationCustom.length > 0) {
        for (let subCourtSize of fieldConfigurationCustom) {
          let subCourt = getCustomSubCourt(subCourtSize, allowedSubCourt);
          if (subCourt) {
            allowedSubCourt.push(subCourt);
          }
        }
      } else if (fieldConfigurationRefId > 1) {
        allowedSubCourt = getAllowedSubcourtsForField(fieldConfigurationRefId);
      }
      if (!courtObj.allowedSubCourt && allowedSubCourt.length > 0) {
        courtObj.allowedSubCourt = allowedSubCourt;
      }
    }
  }

  if (sameTimeSlotArray.length == 0) {
    let emptySlot = createEmptySlot(
      venueCourtNumber,
      venueCourtName,
      venueCourtId,
      venueShortName,
      matchDate,
      startTime,
      endTime,
      venueId,
      outOfRoundDate,
    );
    if (allowedSubCourt.length > 0 && !hasSubCourtDivision) {
      emptySlot.isUnavailable = true;
    }
    sameTimeSlotArray.push(emptySlot);
  } else if (sameTimeSlotArray.length > 0) {
    if (isVenueFieldConfigurationEnabled) {
      //fill empty slot
      let remainingSlotUnit = 8;
      let existingSubCourts = [];

      let isUnavailable = false;
      //in case subcourt for different divsion start at different time
      let lastDraw = sameTimeSlotArray[sameTimeSlotArray.length - 1];
      let lastDrawTime = new Date(lastDraw.matchDate).getTime() + lastDraw.minuteDuration * 60000;
      let nextMatchOverlap = drawsArray.find(
        s =>
          s.venueCourtId === venueCourtId &&
          s.matchDate > lastDraw.matchDate &&
          s.divisionName != lastDraw.divisionName &&
          lastDrawTime > new Date(s.matchDate).getTime(),
      );
      if (nextMatchOverlap) {
        isUnavailable = true;
      }

      for (let slot of sameTimeSlotArray) {
        if (!slot.subCourt) {
          remainingSlotUnit = 0;
          break;
        }
        remainingSlotUnit -= DrawConstant.subCourtHeightUnit[slot.subCourt];
        existingSubCourts.push(slot.subCourt);
      }
      if (remainingSlotUnit > 0) {
        let fieldIds = allowedSubCourt.filter(f => !existingSubCourts.includes(f));
        for (let fid of fieldIds) {
          if (remainingSlotUnit > 0) {
            let emptySlot = createEmptySlot(
              venueCourtNumber,
              venueCourtName,
              venueCourtId,
              venueShortName,
              matchDate,
              startTime,
              endTime,
              venueId,
              outOfRoundDate,
            );
            emptySlot.subCourt = fid;
            if (isUnavailable) {
              emptySlot.isUnavailable = isUnavailable;
            }
            sameTimeSlotArray.push(emptySlot);
            remainingSlotUnit -= DrawConstant.subCourtHeightUnit[fid];
          }
        }
      }
    }
    if (sameTimeSlotArray.length > 1) {
      sameTimeSlotArray.sort((a, b) => {
        if (a.subCourt && b.subCourt) {
          if (a.subCourt < b.subCourt) {
            return -1;
          }
          if (a.subCourt > b.subCourt) {
            return 1;
          }
        }
        return 0;
      });
    }
  }
  return sameTimeSlotArray;
}
function createEmptySlot(
  venueCourtNumber,
  venueCourtName,
  venueCourtId,
  venueShortName,
  matchDate,
  startTime,
  endTime,
  venueId,
  outOfRoundDate,
) {
  let slotId = randomKeyGen(5);
  const teamArray = [
    {
      teamName: null,
      teamId: null,
    },
    {
      teamName: null,
      teamId: null,
    },
  ];
  const emptySlot = {
    drawsId: null,
    venueCourtNumber,
    venueCourtName,
    venueCourtId,
    venueShortName,
    matchDate,
    startTime,
    endTime,
    homeTeamId: null,
    awayTeamId: null,
    homeTeamName: null,
    awayTeamName: null,
    gradeName: null,
    competitionDivisionGradeId: null,
    divisionName: null,
    isLocked: 0,
    colorCode: '#999999',
    teamArray,
    venueId,
    slotId,
    outOfRoundDate,
    outOfCompetitionDate: 0,
  };
  emptySlot.minuteDuration = getMinuteDuration(emptySlot);
  return emptySlot;
}

function mapSlotObjectsWithTimeSlots(
  drawsArray,
  mainCourtNumberArray,
  sortedDateArray,
  gradeArray,
  key,
  venuesData,
  hasSubCourtDivision,
) {
  for (const i in mainCourtNumberArray) {
    let tempSlotsArray = [];
    for (let j = 0; j < sortedDateArray.length; j++) {
      const sameTimeSlotArray = getSlotFromDate(
        drawsArray,
        sortedDateArray[j],
        gradeArray,
        key,
        mainCourtNumberArray[i],
        venuesData,
        hasSubCourtDivision,
      );
      tempSlotsArray = tempSlotsArray.concat(sameTimeSlotArray);
    }
    for (let k = 0; k < tempSlotsArray.length; k++) {
      tempSlotsArray[k].sortOrder = k + 1;
    }
    mainCourtNumberArray[i].slotsArray = tempSlotsArray;
  }
  return mainCourtNumberArray;
}

function structureDrawsData(data, key, venuesData, hasSubCourtDivision) {
  let mainCourtNumberArray = [];
  let dateArray = [];
  const gradeArray = [];
  let sortedDateArray = [];
  const legendArray = [];
  let sortMainCourtNumberArray = [];
  let notInDraws = [];
  if (data.length > 0 && venuesData) {
    venuesData.forEach(venue => {
      venue.courts.forEach(court => {
        const isCourtNotEmpty = data.some(dataSlot => dataSlot.venueCourtId === court.courtId);
        if (!isCourtNotEmpty) {
          mainCourtNumberArray.push({
            venueCourtNumber: court.courtNumber,
            venueCourtName: `${court.courtName}`,
            venueShortName: venue.shortName,
            venueNameCourtName: venue.shortName.toString() + court.courtName.toString(),
            venueCourtId: court.courtId,
            roundId: venue.roundId ? venue.roundId : 0,
            venueId: venue.id,
            slotsArray: [],
          });
        }
      });
    });
  }
  if (data) {
    if (isArrayNotEmpty(data)) {
      data.forEach(object => {
        dateArray = setupDateObjectArray(dateArray, object);

        if (setupGradesArray(gradeArray, object.competitionDivisionGradeId)) {
          gradeArray.push(object.competitionDivisionGradeId);
        }
        const courtNumberResponse = checkVenueCourtNumber(mainCourtNumberArray, object);
        if (!courtNumberResponse.status) {
          mainCourtNumberArray.push({
            venueCourtNumber: object.venueCourtNumber,
            venueCourtName: object.venueCourtName,
            venueShortName: object.venueShortName,
            venueNameCourtName:
              object.venueShortName.toString() + object.venueCourtNumber.toString(),
            venueCourtId: object.venueCourtId,
            roundId: object.roundId ? object.roundId : 0,
            venueId: object.venueId,
            slotsArray: [],
          });
        }
      });
      let inDraws = data.filter(x => x.outOfCompetitionDate != 1 && x.outOfRoundDate != 1);
      notInDraws = data.filter(x => x.outOfCompetitionDate === 1 || x.outOfRoundDate === 1);

      sortedDateArray = sortDateArray(dateArray);
      sortMainCourtNumberArray = sortCourtArray(mainCourtNumberArray);
      const colorArrays = generateGradientArray(0);
      mainCourtNumberArray = mapSlotObjectsWithTimeSlots(
        inDraws,
        sortMainCourtNumberArray,
        sortedDateArray,
        gradeArray,
        key,
        venuesData,
        hasSubCourtDivision,
      );
      for (let draw of notInDraws) {
        setDrawColor(colorArrays, draw);
      }
    }
  }
  legendsArray =
    key === 'all'
      ? createCompLegendsArray(mainCourtNumberArray, legendArray, sortedDateArray)
      : createLegendsArray(mainCourtNumberArray, legendArray, sortedDateArray);
  return { mainCourtNumberArray, sortedDateArray, legendsArray, notInDraws };
}
function setDrawColor(colorArrays, draw) {
  const colorInfoObj = getGradientColorForDivisionGrade(colorArrays, draw);
  draw.colorCode = colorInfoObj.code;
  draw.fontColor = colorInfoObj.bright < 50 ? '#FFFFFF' : '#000000';
  draw.slotId = randomKeyGen(5);
  draw.minuteDuration = getMinuteDuration(draw);
}

function roundStructureData(data, hasSubCourtDivision) {
  const roundsdata = data.rounds;
  let newStructureDrawsData;
  const venuesData = data.venues;
  if (roundsdata.length > 0) {
    for (const i in roundsdata) {
      newStructureDrawsData = structureDrawsData(
        roundsdata[i].draws,
        'single',
        venuesData,
        hasSubCourtDivision,
      );
      roundsdata[i].draws = newStructureDrawsData.mainCourtNumberArray;
      roundsdata[i].dateNewArray = newStructureDrawsData.sortedDateArray;
      roundsdata[i].legendsArray = newStructureDrawsData.legendsArray;
      roundsdata[i].notInDraws = newStructureDrawsData.notInDraws;
    }
  }
  return {
    roundsdata,
  };
}

function pushColorDivision(division, drawsResultData) {
  const newDivisionArray = [];
  for (const i in division) {
    const divisionGradeId = division[i].competitionDivisionGradeId;
    let name = division[i].name ? division[i].name : '';
    if (name.endsWith('-Ungraded')) {
      continue;
    }

    const newDivisionobject = {
      divisionId: division[i].divisionId,
      competitionDivisionGradeId: divisionGradeId,
      name: name,
      colorCode: lightGray,
      checked: true,
      isDivisionDeleted: division[i].isDivisionDeleted,
      isGradeDeleted: division[i].isGradeDeleted,
    };
    let foundColor = false;
    for (const j in drawsResultData) {
      const { draws } = drawsResultData[j];
      for (const k in draws) {
        const slots = draws[k].slotsArray;
        for (const l in slots) {
          if (slots[l].competitionDivisionGradeId === divisionGradeId) {
            newDivisionobject.colorCode = slots[l].colorCode;
            foundColor = true;
            break;
          }
        }
        if (foundColor) {
          break;
        }
      }
      if (foundColor) {
        break;
      }
    }
    const index = newDivisionArray.findIndex(x => x.competitionDivisionGradeId === divisionGradeId);
    if (index === -1) {
      newDivisionArray.push(newDivisionobject);
    }
  }
  return newDivisionArray;
}

function getCompetitionArray(draws) {
  const competitionArray = [];
  for (const i in draws) {
    const competitionObject = {
      competitionName: draws[i].competitionName,
      checked: true,
    };
    competitionArray.push(competitionObject);
  }
  return competitionArray;
}

function allcompetitionDrawsData(data, hasSubCourtDivision) {
  // let dateDrawsData = data.dates
  const newStructureDateDraws = structureDrawsData(
    data.draws,
    'all',
    data.venues,
    hasSubCourtDivision,
  );
  data.draws = newStructureDateDraws.mainCourtNumberArray;
  data.dateNewArray = newStructureDateDraws.sortedDateArray;
  data.legendsArray = newStructureDateDraws.legendsArray;
  data.notInDraws = newStructureDateDraws.notInDraws;
  return {
    data,
  };
}

// Swipe Array object - draws
function swapedDrawsArrayFunc(drawsArray, sourtXIndex, targetXIndex, sourceYIndex, targetYIndex) {
  const sourceArray = JSON.parse(JSON.stringify(drawsArray));
  const targetArray = JSON.parse(JSON.stringify(drawsArray));
  sourceArray[sourtXIndex].slotsArray[sourceYIndex].isLocked = 1;
  const source = JSON.parse(JSON.stringify(sourceArray[sourtXIndex].slotsArray[sourceYIndex]));
  targetArray[targetXIndex].slotsArray[targetYIndex].isLocked = 1;
  const target = JSON.parse(JSON.stringify(targetArray[targetXIndex].slotsArray[targetYIndex]));
  const sourceCopy = JSON.parse(JSON.stringify(sourceArray[sourtXIndex].slotsArray[sourceYIndex]));
  const targetCopy = JSON.parse(JSON.stringify(targetArray[targetXIndex].slotsArray[targetYIndex]));
  sourceCopy.drawsId = target.drawsId;
  targetCopy.drawsId = source.drawsId;
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

// Swipe Array object - Edit
function swapedDrawsEditArrayFunc(
  drawsArray,
  sourceXIndex,
  targetXIndex,
  sourceYIndex,
  targetYIndex,
  sourceZIndex,
  targetZIndex,
) {
  const sourceArray = JSON.parse(JSON.stringify(drawsArray));
  const targetArray = JSON.parse(JSON.stringify(drawsArray));
  // const sourceItem = sourceArray[sourceXIndex].slotsArray[sourceYIndex].teamArray[sourceZIndex];
  // const targetItem = targetArray[targetXIndex].slotsArray[targetYIndex].teamArray[targetZIndex];
  const source = sourceArray[sourceXIndex].slotsArray[sourceYIndex];
  const target = targetArray[targetXIndex].slotsArray[targetYIndex];

  if (sourceZIndex === '0') {
    if (targetZIndex === '0') {
      drawsArray[sourceXIndex].slotsArray[sourceYIndex].homeTeamId = target.homeTeamId;
      drawsArray[sourceXIndex].slotsArray[sourceYIndex].homeTeamName = target.homeTeamName;
      drawsArray[sourceXIndex].slotsArray[sourceYIndex].teamArray[0].teamId = target.homeTeamId;
      drawsArray[sourceXIndex].slotsArray[sourceYIndex].teamArray[0].teamName = target.homeTeamName;
    } else {
      drawsArray[sourceXIndex].slotsArray[sourceYIndex].homeTeamId = target.awayTeamId;
      drawsArray[sourceXIndex].slotsArray[sourceYIndex].homeTeamName = target.awayTeamName;
      drawsArray[sourceXIndex].slotsArray[sourceYIndex].teamArray[0].teamId = target.awayTeamId;
      drawsArray[sourceXIndex].slotsArray[sourceYIndex].teamArray[0].teamName = target.awayTeamName;
    }
  } else if (targetZIndex === '0') {
    drawsArray[sourceXIndex].slotsArray[sourceYIndex].awayTeamId = target.homeTeamId;
    drawsArray[sourceXIndex].slotsArray[sourceYIndex].awayTeamName = target.homeTeamName;
    drawsArray[sourceXIndex].slotsArray[sourceYIndex].teamArray[1].teamId = target.homeTeamId;
    drawsArray[sourceXIndex].slotsArray[sourceYIndex].teamArray[1].teamName = target.homeTeamName;
  } else {
    drawsArray[sourceXIndex].slotsArray[sourceYIndex].awayTeamId = target.awayTeamId;
    drawsArray[sourceXIndex].slotsArray[sourceYIndex].awayTeamName = target.awayTeamName;
    drawsArray[sourceXIndex].slotsArray[sourceYIndex].teamArray[1].teamId = target.awayTeamId;
    drawsArray[sourceXIndex].slotsArray[sourceYIndex].teamArray[1].teamName = target.awayTeamName;
  }

  if (targetZIndex === '0') {
    if (sourceZIndex === '0') {
      drawsArray[targetXIndex].slotsArray[targetYIndex].homeTeamId = source.homeTeamId;
      drawsArray[targetXIndex].slotsArray[targetYIndex].homeTeamName = source.homeTeamName;
      drawsArray[targetXIndex].slotsArray[targetYIndex].teamArray[0].teamId = source.homeTeamId;
      drawsArray[targetXIndex].slotsArray[targetYIndex].teamArray[0].teamName = source.homeTeamName;
    } else {
      drawsArray[targetXIndex].slotsArray[targetYIndex].homeTeamId = source.awayTeamId;
      drawsArray[targetXIndex].slotsArray[targetYIndex].homeTeamName = source.awayTeamName;
      drawsArray[targetXIndex].slotsArray[targetYIndex].teamArray[0].teamId = source.awayTeamId;
      drawsArray[targetXIndex].slotsArray[targetYIndex].teamArray[0].teamName = source.awayTeamName;
    }
  } else if (sourceZIndex === '0') {
    drawsArray[targetXIndex].slotsArray[targetYIndex].awayTeamId = source.homeTeamId;
    drawsArray[targetXIndex].slotsArray[targetYIndex].awayTeamName = source.homeTeamName;
    drawsArray[targetXIndex].slotsArray[targetYIndex].teamArray[1].teamId = source.homeTeamId;
    drawsArray[targetXIndex].slotsArray[targetYIndex].teamArray[1].teamName = source.homeTeamName;
  } else {
    drawsArray[targetXIndex].slotsArray[targetYIndex].awayTeamId = source.awayTeamId;
    drawsArray[targetXIndex].slotsArray[targetYIndex].awayTeamName = source.awayTeamName;
    drawsArray[targetXIndex].slotsArray[targetYIndex].teamArray[1].teamId = source.awayTeamId;
    drawsArray[targetXIndex].slotsArray[targetYIndex].teamArray[1].teamName = source.awayTeamName;
  }
  return drawsArray;
}

function updateAllDivisions(drawsDivisionArray, value) {
  for (const i in drawsDivisionArray) {
    const divisionArray = drawsDivisionArray[i].legendArray;
    for (const j in divisionArray) {
      divisionArray[j].checked = value;
    }
  }
  return drawsDivisionArray;
}

// insert checked parameter in venue array
function updateCompVenue(venueArray, value) {
  for (const i in venueArray) {
    venueArray[i].checked = value;
  }
  return venueArray;
}
function updateAllTimeslot(timeslots, value) {
  for (const slot of timeslots) {
    slot.checked = value;
  }
  return timeslots;
}
// update all organisations checked
function updateAllOrganisations(orgArray, value) {
  for (const i in orgArray) {
    orgArray[i].checked = value;
  }
  return orgArray;
}

// update all checked competition
function updateCompArray(competitionArray, value) {
  for (const i in competitionArray) {
    competitionArray[i].checked = value;
  }
  return competitionArray;
}

function checkAllCompetitionData(checkedArray, key) {
  let uncheckedArr = [];
  if (checkedArray.length > 0) {
    for (let i in checkedArray) {
      if (checkedArray[i].checked == false) {
        uncheckedArr.push(checkedArray[i][key]);
      }
    }
  }
  return uncheckedArr;
}

function updateRoundsDrawsData(
  filteredRoundsDrawsdata,
  getRoundsDrawsdata,
  competitionVenues,
  drawOrganisations,
  state,
  showOnlyFilters,
) {
  showOnlyFilters = showOnlyFilters || [];
  let uncheckedVenueIds = checkAllCompetitionData(competitionVenues, 'id');
  let divisionList = [];
  if (state.isCompByRound) {
    divisionList = state.divisionGradeNameListForRound;
  } else {
    for (let dd of state.drawDivisions) {
      divisionList = divisionList.concat(dd.legendArray);
    }
  }
  let unCheckedGradeIds = checkAllCompetitionData(divisionList, 'competitionDivisionGradeId');
  state.unCheckedGradeIds = unCheckedGradeIds;
  let unCheckedOrganisations = checkAllCompetitionData(drawOrganisations, 'organisationUniqueKey');
  let unCheckedTimeslots = state.timelsotHourlyList.filter(x => !x.checked);
  getRoundsDrawsdata.forEach((drawData, drawIndex) => {
    let courtDraws = drawData.draws;
    let dateNewArray = drawData.dateNewArray;
    let notInDraws = drawData.notInDraws;

    if (showOnlyFilters.includes(DrawShowOnlyType.SelectedVenues)) {
      courtDraws = drawData.draws.filter(x => !uncheckedVenueIds.includes(x.venueId));
    }
    if (
      showOnlyFilters.some(
        x => x == DrawShowOnlyType.SelectedOrganisations || x == DrawShowOnlyType.SelectedDivisions,
      )
    ) {
      let newDraws = [];
      courtDraws.forEach((courtDraw, divisionIndex) => {
        let allInvisible = true;
        for (let slot of courtDraw.slotsArray) {
          if (
            !slot.drawsId ||
            (showOnlySelectedDivisions(slot, showOnlyFilters, unCheckedGradeIds) &&
              showOnlySelectedOrganisations(slot, showOnlyFilters, unCheckedOrganisations))
          ) {
            //row invisible
            allInvisible = false;
            break;
          }
        }
        if (!allInvisible) {
          newDraws.push(courtDraw);
        }
      });
      courtDraws = newDraws;
    }
    if (unCheckedTimeslots.length > 0) {
      courtDraws = courtDraws.map(x => {
        return { ...x };
      });
      for (let uncheckedTimeslot of unCheckedTimeslots) {
        dateNewArray = dateNewArray.filter(
          x => new Date(x.date).getHours() != uncheckedTimeslot.key,
        );
        for (let courtDraw of courtDraws) {
          courtDraw.slotsArray = courtDraw.slotsArray.filter(
            x => new Date(x.matchDate).getHours() != uncheckedTimeslot.key,
          );
        }
      }
    }
    notInDraws = notInDraws.filter(
      x =>
        !unCheckedGradeIds.includes(x.competitionDivisionGradeId) &&
        !unCheckedOrganisations.includes(x.awayTeamOrganisationId) &&
        !unCheckedOrganisations.includes(x.homeTeamOrganisationId),
    );
    filteredRoundsDrawsdata[drawIndex] = {
      ...drawData,
      draws: courtDraws,
      dateNewArray: dateNewArray.slice(0),
      notInDraws: notInDraws,
    };
  });
  return filteredRoundsDrawsdata;
}

function CompetitionMultiDraws(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_COMPETITION_MULTI_DRAWS_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        updateLoad: false,
        spinLoad: false,
      };

    case ApiConstants.API_COMPETITION_MULTI_DRAWS_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        updateLoad: false,
        spinLoad: false,
      };

    // competition part player grade calculate player grading summary get API
    case ApiConstants.API_GET_COMPETITION_MULTI_DRAWS_LOAD:
      allColorsArray = [...colorsArray];
      divisionGradeColorInfos = [];
      return {
        ...state,
        onLoad: true,
        error: null,
        spinLoad: true,
      };

    case ApiConstants.API_GET_COMPETITION_MULTI_DRAWS_SUCCESS:
      try {
        let resultData;
        let singleCompetitionDivision;
        let divisionGradeNameListForRound = [];
        let hasSubCourtDivision = false;
        if (state.maindivisionGradeNameList) {
          hasSubCourtDivision = state.maindivisionGradeNameList.some(
            x => x.divisionFieldConfigurationId && x.divisionFieldConfigurationId != 1,
          );
        }
        let isCompByRound = action.competitionId === '-1' || action.dateRangeCheck ? false : true;
        if (!isCompByRound) {
          const allCompetiitonDraws = action.result;
          if (isFootball) {
            hasSubCourtDivision = true;
          }
          resultData = allcompetitionDrawsData(allCompetiitonDraws, hasSubCourtDivision);
          state.drawDivisions = resultData.data.legendsArray;
        } else {
          const drawsResultData = action.result;
          let gradeIdInDraws = [];
          for (let roundData of drawsResultData.rounds) {
            let gradeIds = roundData.draws.map(x => x.competitionDivisionGradeId);
            gradeIdInDraws = gradeIdInDraws.concat(gradeIds);
          }
          gradeIdInDraws = uniq(gradeIdInDraws);
          resultData = roundStructureData(drawsResultData, hasSubCourtDivision);
          singleCompetitionDivision = pushColorDivision(
            JSON.parse(JSON.stringify(state.maindivisionGradeNameList)),
            JSON.parse(JSON.stringify(resultData.roundsdata)),
          );

          divisionGradeNameListForRound = singleCompetitionDivision.filter(
            x =>
              !x.isGradeDeleted ||
              (x.isGradeDeleted && gradeIdInDraws.includes(x.competitionDivisionGradeId)),
          );
        }

        state.hasSubCourtDivision = hasSubCourtDivision;
        state.divisionGradeNameListForRound = divisionGradeNameListForRound;
        state.competitionVenues = action.result
          ? action.result.venues
            ? updateCompVenue(action.result.venues, true)
            : state.competitionVenues
          : state.competitionVenues;

        state.publishStatus = action.result.drawsPublish;
        state.isTeamInDraw = action.result.isTeamNotInDraws;
        state.isPastMatchAvailable = action.result.isPastMatchAvailable;
        state.competitionTypeRefId = action.result.competitionTypeRefId;
        // state.drawDivisions = action.competitionId === "-1" || action.dateRangeCheck
        //     ? resultData.data ? resultData.data.legendsArray : []
        //     : []
        // eslint-disable-next-line max-len
        // let singleCompetitionDivision = action.competitionId != "-1" || !action.dateRangeChec && pushColorDivision(JSON.parse(JSON.stringify(state.divisionGradeNameList)), JSON.parse(JSON.stringify(resultData.roundsdata)))
        state.divisionGradeNameList = singleCompetitionDivision || [];
        state.drawsCompetitionArray =
          state.drawDivisions.length > 0 ? getCompetitionArray(state.drawDivisions) : [];
        const orgData = updateAllOrganisations(
          JSON.parse(JSON.stringify(action.result.organisations)),
          true,
        );
        let getRoundsDrawsdata = !isCompByRound ? [resultData.data] : resultData.roundsdata;
        let filteredRoundsDrawsdata = [...getRoundsDrawsdata];
        return {
          ...state,
          getRoundsDrawsdata: getRoundsDrawsdata,
          filteredRoundsDrawsdata: filteredRoundsDrawsdata,
          isCompByRound: isCompByRound,
          drawOrganisations: orgData,
          onLoad: false,
          error: null,
          spinLoad: false,
          updateLoad: false,
          importResult: null,
          timelsotHourlyList: clone(TimeslotHourlyList),
        };
      } catch (ex) {
        console.log('exception:', ex);
      }
      return { ...state };

    // get rounds in the competition draws
    case ApiConstants.API_GET_COMPETITION_MULTI_DRAWS_ROUNDS_LOAD:
      return {
        ...state,
        onLoad: true,
        updateLoad: true,
        error: null,
        drawOrganisations: [],
      };

    case ApiConstants.API_GET_COMPETITION_MULTI_DRAWS_ROUNDS_SUCCESS:
      const { divisionGradeResponse } = action.division_Result;
      const updatedCompetitionVenues = updateCompVenue(action.Venue_Result, true);
      state.competitionVenues = updatedCompetitionVenues;
      state.divisionGradeNameList = JSON.parse(JSON.stringify(divisionGradeResponse));
      state.maindivisionGradeNameList = JSON.parse(JSON.stringify(divisionGradeResponse));
      let nextAvailableGameDay = JSON.parse(
        JSON.stringify(action.division_Result.nextAvailableMatchDay.minMatchDate),
      );

      const DrawsRoundsData = JSON.parse(JSON.stringify(action.result));
      // let venueObject = {
      //     name: "All Venues",
      //     id: 0
      // }
      // let divisionNameObject = {
      //     name: "All Division",
      //     competitionDivisionGradeId: 0
      // }
      const roundNameObject = {
        roundId: 0,
        name: 'All Rounds',
        startDateTime: '',
      };
      // state.competitionVenues.unshift(venueObject)
      // state.divisionGradeNameList.unshift(divisionNameObject)
      DrawsRoundsData.unshift(roundNameObject);
      state.allcompetitionDateRange = action.dateRangeResult;
      state.updateLoad = false;
      return {
        ...state,
        onLoad: false,
        getDrawsRoundsData: DrawsRoundsData,
        nextAvailableGameDay,
        error: null,
      };

    /// Update draws reducer cases
    case ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_LOAD:
      return {
        ...state,
        updateLoad: true,
      };

    case ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_SUCCESS:
      const sourceXIndex = action.sourceArray[0];
      const sourceYIndex = action.sourceArray[1];
      const targetXIndex = action.targetArray[0];
      const targetYIndex = action.targetArray[1];
      if (action.actionType !== 'all') {
        const drawDataIndex = state.getRoundsDrawsdata.findIndex(
          x => x.roundId === action.drawData,
        );
        const drawDataCase = state.getRoundsDrawsdata[drawDataIndex].draws;
        let swapedDrawsArray = state.getRoundsDrawsdata[drawDataIndex].draws;
        if (action.actionType === 'add') {
          swapedDrawsArray = swapedDrawsArrayFunc(
            drawDataCase,
            sourceXIndex,
            targetXIndex,
            sourceYIndex,
            targetYIndex,
          );
        } else {
          swapedDrawsArray = swapedDrawsEditArrayFunc(
            drawDataCase,
            sourceXIndex,
            targetXIndex,
            sourceYIndex,
            targetYIndex,
            action.sourceArray[2],
            action.targetArray[2],
          );
        }
        state.getRoundsDrawsdata[drawDataIndex].draws = swapedDrawsArray;
      } else {
        const allDrawDataCase = state.getRoundsDrawsdata[0].draws;
        let allSwapedDrawsArray = state.getRoundsDrawsdata[0].draws;
        allSwapedDrawsArray = swapedDrawsArrayFunc(
          allDrawDataCase,
          sourceXIndex,
          targetXIndex,
          sourceYIndex,
          targetYIndex,
        );
        state.getRoundsDrawsdata[0].draws = allSwapedDrawsArray;
      }
      return {
        ...state,
        onLoad: false,
        error: null,
        updateLoad: false,
      };

    case ApiConstants.API_GET_LIVE_SCORE_BULK_LOCK_MATCHES_LOAD:
      return {
        ...state,
        updateLoad: true,
      };

    case ApiConstants.API_GET_LIVE_SCORE_BULK_LOCK_MATCHES_SUCCESS:
      return {
        ...state,
        updateLoad: false,
      };

    /// Update draws timeline reducer cases
    case ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_TIMELINE_LOAD:
      return {
        ...state,
        updateLoad: true,
      };

    case ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_TIMELINE_SUCCESS:
      const sourceXIndexT = action.sourceArray[0];
      const sourceYIndexT = action.sourceArray[1];
      const targetXIndexT = action.targetArray[0];
      const targetYIndexT = action.targetArray[1];
      if (action.actionType !== 'all') {
        const drawDataIndex = state.getRoundsDrawsdata.findIndex(
          x => x.roundId === action.drawData,
        );
        const drawDataCase = state.getRoundsDrawsdata[drawDataIndex].draws;
        let swapedDrawsArray = state.getRoundsDrawsdata[drawDataIndex].draws;
        if (action.actionType === 'add') {
          swapedDrawsArray = swapedDrawsArrayFunc(
            drawDataCase,
            sourceXIndexT,
            targetXIndexT,
            sourceYIndexT,
            targetYIndexT,
          );
        } else {
          swapedDrawsArray = swapedDrawsEditArrayFunc(
            drawDataCase,
            sourceXIndexT,
            targetXIndexT,
            sourceYIndexT,
            targetYIndexT,
            action.sourceArray[2],
            action.targetArray[2],
          );
        }
        state.getRoundsDrawsdata[drawDataIndex].draws = swapedDrawsArray;
      } else {
        const allDrawDataCase = state.getRoundsDrawsdata[0].draws;
        let allSwapedDrawsArray = state.getRoundsDrawsdata[0].draws;
        allSwapedDrawsArray = swapedDrawsArrayFunc(
          allDrawDataCase,
          sourceXIndexT,
          targetXIndexT,
          sourceYIndexT,
          targetYIndexT,
        );
        state.getRoundsDrawsdata[0].draws = allSwapedDrawsArray;
      }
      return {
        ...state,
        onLoad: false,
        error: null,
        updateLoad: false,
      };

    case ApiConstants.API_UPDATE_COMPETITION_SAVE_MULTI_DRAWS_LOAD:
      return {
        ...state,
        onLoad: true,
        error: null,
      };

    // Save Draws Success
    case ApiConstants.API_UPDATE_COMPETITION_SAVE_MULTI_DRAWS_SUCCESS:
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    case ApiConstants.API_GET_COMPETITION_VENUES_MULTI_LOAD:
      return {
        ...state,
        nextAvailableGameDay,
        onLoad: true,
      };

    // Competition venues
    case ApiConstants.API_GET_COMPETITION_VENUES_MULTI_SUCCESS:
      return {
        ...state,
        onLoad: false,
        competitionVenues: action.result,
      };

    // update draws court timing where N/A(null) is there
    case ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_COURT_TIMINGS_LOAD:
      return {
        ...state,
        nextAvailableGameDay,
        updateLoad: true,
      };

    case ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_DRAG_LOAD:
      return {
        ...state,
        updateLoad: false,
        swapLoad: true,
      };
    case ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_DRAG_SUCCESS:
      return {
        ...state,
        updateLoad: false,
        swapLoad: false,
      };

    case ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_COURT_TIMINGS_SUCCESS:
      let resultDataNew;
      if (action.competitionId === '-1' || action.dateRangeCheck) {
        const allCompetiitonDraws = action.getResult;
        resultDataNew = allcompetitionDrawsData(allCompetiitonDraws, state.hasSubCourtDivision);
      } else {
        const drawsResultData = action.getResult;
        resultDataNew = roundStructureData(drawsResultData, state.hasSubCourtDivision);
      }

      state.publishStatus = action.getResult.drawsPublish;
      state.isTeamInDraw = action.getResult.isTeamNotInDraws;
      const orgDataNew = JSON.parse(JSON.stringify(action.getResult.organisations));
      let getRoundsDrawsdata =
        action.competitionId === '-1' || action.dateRangeCheck
          ? [resultDataNew.data]
          : resultDataNew.roundsdata;
      let filteredRoundsDrawsdata = [...getRoundsDrawsdata];
      return {
        ...state,
        getRoundsDrawsdata: getRoundsDrawsdata,
        filteredRoundsDrawsdata: filteredRoundsDrawsdata,
        drawOrganisations: orgDataNew,
        onLoad: false,
        error: null,
        updateLoad: false,
      };

    case ApiConstants.clearMultidrawsData:
      state.drawDivisions = [];
      state.isTeamInDraw = null;
      state.publishStatus = 0;
      state.getStaticDrawsData = [];
      state.dateArray = [];
      state.legendsArray = [];
      legendsArray = [];
      state.getRoundsDrawsdata = [];
      state.filteredRoundsDrawsdata = [];
      state.drawOrganisations = [];
      state.isCompByRound = true;
      state.timelsotHourlyList = clone(TimeslotHourlyList);
      if (action.key === 'rounds') {
        state.allcompetitionDateRange = [];
        state.competitionVenues = [];
        state.getDrawsRoundsData = [];
        state.divisionGradeNameList = [];
        state.maindivisionGradeNameList = [];
        state.legendsArray = [];
        legendsArray = [];
        state.drawsCompetitionArray = [];
      }
      return { ...state };

    // draws division grade names list
    case ApiConstants.API_MULTI_DRAWS_DIVISION_GRADE_NAME_LIST_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_MULTI_DRAWS_DIVISION_GRADE_NAME_LIST_SUCCESS:
      return {
        ...state,
        onLoad: false,
        divisionGradeNameList: isArrayNotEmpty(action.result) ? action.result : [],
        maindivisionGradeNameList: isArrayNotEmpty(action.result) ? action.result : [],
      };

    case ApiConstants.API_MULTI_DRAW_PUBLISH_LOAD:
      return {
        ...state,
        onLoad: true,
        updateLoad: true,
        changeStatus: true,
      };

    case ApiConstants.API_MULTI_DRAW_PUBLISH_SUCCESS:
      state.publishStatus = action.result.statusRefId;
      state.isTeamInDraw = null;
      state.updateLoad = false;
      state.teamNames = action.result.teamNames;
      state.liveScoreCompetiton = action.result.liveScoreCompetiton;
      return {
        ...state,
        onLoad: false,
        changeStatus: false,
        teamNames: action.result.teamNames,
        error: null,
      };

    case ApiConstants.API_MULTI_DRAW_MATCHES_LIST_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_MULTI_DRAW_MATCHES_LIST_SUCCESS:
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    case ApiConstants.API_IMPORT_DRAWS_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_IMPORT_DRAWS_SUCCESS:
      let res = action.result;
      let importResult = null;
      if (res.error) {
        importResult = res;
      }
      return {
        ...state,
        onLoad: false,
        error: null,
        importResult: importResult,
      };

    // Competition Dashboard Case
    case ApiConstants.API_GET_DIVISION_MULTI_LOAD:
      return {
        ...state,
        onLoad: true,
        divisionLoad: true,
        error: null,
      };

    case ApiConstants.API_GET_DIVISION_MULTI_SUCCESS:
      state.fixtureDivisionGradeNameList = action.result;
      return { ...state, onLoad: true, divisionLoad: false };

    case ApiConstants.clearFixtureData:
      state.fixtureArray = [];
      if (action.key === 'grades') {
        state.fixtureDivisionGradeNameList = [];
      }
      return { ...state };

    case ApiConstants.API_UPDATE_MULTI_DRAWS_LOCK_LOAD:
      return {
        ...state,
        onLoad: true,
        error: null,
        updateLoad: true,
      };

    case ApiConstants.API_UPDATE_MULTI_DRAWS_LOCK_SUCCESS:
      const getDrawsArray = state.getRoundsDrawsdata;
      if (action.key === 'all') {
        const updatetLockValueIndex = getDrawsArray[0].draws.findIndex(
          x => x.venueCourtId === action.venueCourtId,
        );
        const updateslotsIndex = getDrawsArray[0].draws[updatetLockValueIndex].slotsArray.findIndex(
          x => x.drawsId === action.drawsId,
        );
        getDrawsArray[0].draws[updatetLockValueIndex].slotsArray[updateslotsIndex].isLocked = 0;
        state.getRoundsDrawsdata = getDrawsArray;
      } else {
        const getDrawsArrayIndex = getDrawsArray.findIndex(x => x.roundId === action.roundId);
        const updatetLockValueIndex = getDrawsArray[getDrawsArrayIndex].draws.findIndex(
          x => x.venueCourtId === action.venueCourtId,
        );
        const updateslotsIndex = getDrawsArray[getDrawsArrayIndex].draws[
          updatetLockValueIndex
        ].slotsArray.findIndex(x => x.drawsId === action.drawsId);
        getDrawsArray[getDrawsArrayIndex].draws[updatetLockValueIndex].slotsArray[
          updateslotsIndex
        ].isLocked = 0;
        state.getRoundsDrawsdata = getDrawsArray;
      }
      return {
        ...state,
        onLoad: false,
        updateLoad: false,
      };

    // get rounds in the competition draws
    case ApiConstants.API_GET_MULTI_DRAWS_ACTIVE_ROUNDS_LOAD:
      return { ...state, onActRndLoad: true, error: null };

    case ApiConstants.API_GET_MULTI_DRAWS_ACTIVE_ROUNDS_SUCCESS:
      const activeDrawsRoundsData = JSON.parse(JSON.stringify(action.result));
      return {
        ...state,
        onActRndLoad: false,
        activeDrawsRoundsData,
        error: null,
      };

    case ApiConstants.API_MULTI_CHANGE_DATE_RANGE_GET_VENUE_DIVISIONS_LOAD:
      return {
        ...state,
        onLoad: true,
        updateLoad: true,
        error: null,
        drawOrganisations: [],
      };

    case ApiConstants.API_MULTI_CHANGE_DATE_RANGE_GET_VENUE_DIVISIONS_SUCCESS:
      state.competitionVenues = updateCompVenue(action.Venue_Result, true);
      state.divisionGradeNameList = JSON.parse(
        JSON.stringify(action.division_Result.divisionGradeResponse),
      );
      state.maindivisionGradeNameList = JSON.parse(
        JSON.stringify(action.division_Result.divisionGradeResponse),
      );

      const divisionNameObjectNew = {
        name: 'All Division',
        competitionDivisionGradeId: 0,
      };
      state.divisionGradeNameList.unshift(divisionNameObjectNew);
      state.updateLoad = false;
      return {
        ...state,
        onLoad: false,
        getDrawsRoundsData: [],
        error: null,
      };

    case ApiConstants.ONCHANGE_MULTI_FIELD_DRAWS_CHECKBOX:
      if (action.key === 'singleCompeDivision') {
        state.divisionGradeNameList[action.index].checked = action.value;
        state.divisionGradeNameListForRound[action.index].checked = action.value;
        state.filteredRoundsDrawsdata = updateRoundsDrawsData(
          state.filteredRoundsDrawsdata,
          state.getRoundsDrawsdata,
          state.competitionVenues,
          state.drawOrganisations,
          state,
          action.additionalData,
        );
      }
      if (action.key === 'competitionVenues') {
        state[action.key][action.index].checked = action.value;
        state.filteredRoundsDrawsdata = updateRoundsDrawsData(
          state.filteredRoundsDrawsdata,
          state.getRoundsDrawsdata,
          state.competitionVenues,
          state.drawOrganisations,
          state,
          action.additionalData,
        );
      }
      if (action.key === 'competition') {
        state.drawsCompetitionArray[action.index].checked = action.value;
      }
      if (action.key === 'division') {
        state.drawDivisions[action.index].legendArray[action.subIndex].checked = action.value;
        state.filteredRoundsDrawsdata = updateRoundsDrawsData(
          state.filteredRoundsDrawsdata,
          state.getRoundsDrawsdata,
          state.competitionVenues,
          state.drawOrganisations,
          state,
          action.additionalData,
        );
      }
      if (action.key === 'allCompetitionVenues') {
        state.competitionVenues = updateCompVenue(
          JSON.parse(JSON.stringify(state.competitionVenues)),
          action.value,
        );
        state.filteredRoundsDrawsdata = updateRoundsDrawsData(
          state.filteredRoundsDrawsdata,
          state.getRoundsDrawsdata,
          state.competitionVenues,
          state.drawOrganisations,
          state,
          action.additionalData,
        );
      }
      if (action.key === 'allCompetition') {
        state.drawsCompetitionArray = updateCompArray(
          JSON.parse(JSON.stringify(state.drawsCompetitionArray)),
          action.value,
        );
      }
      if (action.key === 'allOrganisation') {
        state.drawOrganisations = updateAllOrganisations(
          JSON.parse(JSON.stringify(state.drawOrganisations)),
          action.value,
        );
        state.filteredRoundsDrawsdata = updateRoundsDrawsData(
          state.filteredRoundsDrawsdata,
          state.getRoundsDrawsdata,
          state.competitionVenues,
          state.drawOrganisations,
          state,
          action.additionalData,
        );
      }
      if (action.key === 'organisation') {
        state.drawOrganisations[action.index].checked = action.value;
        state.filteredRoundsDrawsdata = updateRoundsDrawsData(
          state.filteredRoundsDrawsdata,
          state.getRoundsDrawsdata,
          state.competitionVenues,
          state.drawOrganisations,
          state,
          action.additionalData,
        );
      }
      if (action.key === 'allDivisionChecked') {
        state.drawDivisions = updateAllDivisions(
          JSON.parse(JSON.stringify(state.drawDivisions)),
          action.value,
        );
        state.filteredRoundsDrawsdata = updateRoundsDrawsData(
          state.filteredRoundsDrawsdata,
          state.getRoundsDrawsdata,
          state.competitionVenues,
          state.drawOrganisations,
          state,
          action.additionalData,
        );
      }
      if (action.key === 'singleCompDivisionCheked') {
        const singleCompAllDivision = updateAllOrganisations(
          JSON.parse(JSON.stringify(state.divisionGradeNameList)),
          action.value,
        );
        state.divisionGradeNameList = singleCompAllDivision || [];

        const singleCompAllDivisionForRound = updateAllOrganisations(
          JSON.parse(JSON.stringify(state.divisionGradeNameListForRound)),
          action.value,
        );
        state.divisionGradeNameListForRound = singleCompAllDivisionForRound || [];
        state.filteredRoundsDrawsdata = updateRoundsDrawsData(
          state.filteredRoundsDrawsdata,
          state.getRoundsDrawsdata,
          state.competitionVenues,
          state.drawOrganisations,
          state,
          action.additionalData,
        );
      } else if (action.key === 'timeslotHour') {
        state.timelsotHourlyList[action.index].checked = action.value;
        state.filteredRoundsDrawsdata = updateRoundsDrawsData(
          state.filteredRoundsDrawsdata,
          state.getRoundsDrawsdata,
          state.competitionVenues,
          state.drawOrganisations,
          state,
          action.additionalData,
        );
      } else if (action.key === 'allTimeslotHour') {
        updateAllTimeslot(state.timelsotHourlyList, action.value);
        state.filteredRoundsDrawsdata = updateRoundsDrawsData(
          state.filteredRoundsDrawsdata,
          state.getRoundsDrawsdata,
          state.competitionVenues,
          state.drawOrganisations,
          state,
          action.additionalData,
        );
      }
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    case ApiConstants.SET_TIMELINE_MODE:
      return {
        ...state,
        isTimelineMode: action.value,
      };

    case ApiConstants.API_COMPETITION_MULTI_DRAWS_COURT_TIMINGS_UPDATE:
      const updatedGetRoundsDrawsdata = [...state.getRoundsDrawsdata];
      return {
        ...state,
        getRoundsDrawsdata: updatedGetRoundsDrawsdata,
      };

    default:
      return state;
  }
}

export default CompetitionMultiDraws;
