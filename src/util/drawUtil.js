import moment from 'moment';
import { getWeekDay } from 'themes/dateformate';
import DrawConstant from 'themes/drawConstant';
import { DrawShowOnlyType } from './enums';
const getDate = date => {
  return date.slice(0, -5);
};

const checkDate = (date, index, dateArray) => {
  let mDate = moment(new Date(date));
  if (index == 0) {
    return mDate.format('DD MMM, ddd');
  } else {
    if (getDate(dateArray[index].date) == getDate(dateArray[index - 1].date)) {
      return mDate.format('ddd');
    } else {
      return mDate.format('DD MMM, ddd');
    }
  }
};
const getDiffBetweenStartAndEnd = eventObj => {
  //pass date to moment to fix moment performance
  const startTime = moment(new Date(eventObj.matchDate));
  const endTime = moment(new Date(getDate(eventObj.matchDate) + eventObj.endTime));
  const diffTime = endTime.diff(startTime, 'minutes');

  return diffTime;
};
const getMinuteDuration = draw => {
  let endTime = new Date(getDate(draw.matchDate) + draw.endTime);
  let startTime = new Date(draw.matchDate);
  let diffTime = endTime.getTime() - startTime.getTime();
  return Math.round(diffTime / 60000);
};
const getNextEventForSwap = (data, date, eventIndex) => {
  const dataFiltered = data.filter(slot => getDate(slot.matchDate) === date);

  const nextEvent = data.find(
    (slot, index) => index > eventIndex && slot.drawsId && dataFiltered.includes(slot),
  );
  return nextEvent;
};
const getNextEventForSubCourtSwap = (data, date, eventIndex) => {
  const dataFiltered = data.filter(slot => getDate(slot.matchDate) === date);

  const nextEvent = data.find((slot, index) => {
    let hasEvent = index > eventIndex && slot.drawsId && dataFiltered.includes(slot);
    if (slot.subCourt) {
      hasEvent = hasEvent && moment(slot.matchDate).isAfter(moment(data[eventIndex].matchDate));
    }
    return hasEvent;
  });
  return nextEvent;
};
const checkUnavailableTime = (workingSchedule, startDayTime, endDayTime, date) => {
  const startTime = workingSchedule && workingSchedule.startTime;
  const endTime = workingSchedule && workingSchedule.endTime;

  const newStartTime =
    startTime && startTime !== startDayTime
      ? moment(date + startTime)
      : moment(date + startDayTime);

  const newEndTime =
    endTime && endTime !== endDayTime ? moment(date + endTime) : moment(date + endDayTime);

  return {
    startTime: newStartTime,
    endTime: newEndTime,
  };
};
const sortSlot = slotArray => {
  slotArray.sort((a, b) => {
    let dateDiff = moment(a.matchDate) - moment(b.matchDate);
    if (dateDiff == 0 && a.subCourt && b.subCourt) {
      if (a.subCourt < b.subCourt) {
        return -1;
      }
      if (a.subCourt > b.subCourt) {
        return 1;
      }
      return 0;
    } else {
      return dateDiff;
    }
  });
  return slotArray;
};
const getEndTime = (matchDate, minutes) => {
  return moment(new Date(matchDate)).add(minutes, 'minutes').format('HH:mm');
};
const sortStringArrayAlphabetical = (strArray, direction) => {
  if (!direction) {
    direction = 'asc';
  }
  strArray.sort((a, b) => {
    if (a > b) {
      return direction === 'asc' ? 1 : -1;
    } else if (a < b) {
      return direction === 'asc' ? -1 : 1;
    }
    return 0;
  });
  return strArray;
};
const sortArrayAlphabetical = (objArray, getKey, direction) => {
  if (!direction) {
    direction = 'asc';
  }
  objArray.sort((a, b) => {
    if (getKey(a) > getKey(b)) {
      return direction === 'asc' ? 1 : -1;
    } else if (getKey(a) < getKey(b)) {
      return direction === 'asc' ? -1 : 1;
    }
    return 0;
  });
  return objArray;
};
const compareSortOrder = (a, b) => {
  const bandA = a.sortOrder;
  const bandB = b.sortOrder;

  let comparison = 0;
  if (bandA > bandB) {
    comparison = 1;
  } else if (bandA < bandB) {
    comparison = -1;
  }
  return comparison;
};
const getAllowedSubcourtsForField = fieldConfigurationRefId => {
  switch (fieldConfigurationRefId) {
    case 2:
      return ['A', 'B'];
    case 3:
      return ['A', 'C', 'D'];
    case 4:
      return ['C', 'D', 'E', 'F'];
    case 5:
      return ['A', 'G', 'H', 'I', 'J'];
    case 6:
      return ['C', 'D', 'G', 'H', 'I', 'J'];
    case 7:
      return ['C', 'G', 'H', 'I', 'J', 'K', 'L'];
    case 8:
      return ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
    default:
      return [];
  }
};

const getCustomSubCourt = (subCourtSize, existSubCourts) => {
  let courtBlockArray = DrawConstant.courtSizeMap[subCourtSize];
  if (courtBlockArray) {
    courtBlockArray = courtBlockArray.filter(x => !existSubCourts.includes(x));
    if (courtBlockArray.length > 0) {
      return courtBlockArray[0];
    }
  }
  return null;
};

const generateGradientArray = startingHue => {
  const colorArrays = [];
  let initialHues = [];
  initialHues.push(startingHue, startingHue + 10);

  initialHues.forEach(initialHue => {
    let lightStartIndex = 0;
    for (let h = initialHue; h <= 340; h += 20) {
      const colorArrayForHue = [];
      let initialLight = 5;
      if (lightStartIndex % 2 === 0) initialLight = 10;
      for (let l = initialLight; l <= 95; l += 10) {
        colorArrayForHue.push({ code: `hsl(${h},100%,${l}%)`, bright: l });
      }
      colorArrays.push(colorArrayForHue);
      lightStartIndex++;
    }
  });
  return colorArrays;
};
const getAllowedSubCourtsForDraw = (targetObject, venueData) => {
  const courtConfig = venueData
    .find(venue => venue.id === targetObject.venueId)
    .courts.find(court => court.courtId === targetObject.venueCourtId);
  let courtObj = courtConfig;
  const slotDayOfWeek = getWeekDay(targetObject.matchDate);
  if (courtConfig.availableTimeslots && courtConfig.availableTimeslots.length > 0) {
    let slotConfig = courtConfig.availableTimeslots.findLast(
      s =>
        s.timeslot.day === slotDayOfWeek &&
        s.timeslot.startTime < targetObject.endTime &&
        s.timeslot.endTime > targetObject.startTime,
    );
    if (slotConfig) {
      courtObj = slotConfig.timeslot;
    }
  }
  let fieldIds = courtObj.allowedSubCourt || [];
  return fieldIds;
};
const getSubCourtSize = subCourt => {
  if (DrawConstant.halvesSubCourts.includes(subCourt)) {
    return '1/2';
  } else if (DrawConstant.quartersSubCourts.includes(subCourt)) {
    return '1/4';
  } else if (DrawConstant.eighthsSubCourts.includes(subCourt)) {
    return '1/8';
  }
  return '1/1';
};

export const TimeslotHourlyList = [
  { key: '07', label: '07:00 - 07:59', checked: true },
  { key: '08', label: '08:00 - 08:59', checked: true },
  { key: '09', label: '09:00 - 09:59', checked: true },
  { key: '10', label: '10:00 - 10:59', checked: true },
  { key: '11', label: '11:00 - 11:59', checked: true },
  { key: '12', label: '12:00 - 12:59', checked: true },
  { key: '13', label: '13:00 - 13:59', checked: true },
  { key: '14', label: '14:00 - 14:59', checked: true },
  { key: '15', label: '15:00 - 15:59', checked: true },
  { key: '16', label: '16:00 - 16:59', checked: true },
  { key: '17', label: '17:00 - 17:59', checked: true },
  { key: '18', label: '18:00 - 18:59', checked: true },
  { key: '19', label: '19:00 - 19:59', checked: true },
  { key: '20', label: '20:00 - 20:59', checked: true },
  { key: '21', label: '21:00 - 21:59', checked: true },
  { key: '22', label: '22:00 - 22:59', checked: true },
  { key: '23', label: '23:00 - 23:59', checked: true },
  { key: '00', label: '00:00 - 00:59', checked: true },
  { key: '01', label: '01:00 - 01:59', checked: true },
  { key: '02', label: '02:00 - 02:59', checked: true },
  { key: '03', label: '03:00 - 03:59', checked: true },
  { key: '04', label: '04:00 - 04:59', checked: true },
  { key: '05', label: '05:00 - 05:59', checked: true },
  { key: '06', label: '06:00 - 06:59', checked: true },
];
export const showOnlySelectedOrganisations = (slot, showOnlyFilters, unCheckedOrganisations) => {
  if (
    showOnlyFilters.includes(DrawShowOnlyType.SelectedOrganisations) &&
    unCheckedOrganisations.includes(slot.awayTeamOrganisationId) &&
    unCheckedOrganisations.includes(slot.homeTeamOrganisationId)
  ) {
    return false;
  }
  return true;
};
export const showOnlySelectedDivisions = (slot, showOnlyFilters, unCheckedGradeIds) => {
  if (
    showOnlyFilters.includes(DrawShowOnlyType.SelectedDivisions) &&
    unCheckedGradeIds.includes(slot.competitionDivisionGradeId)
  ) {
    return false;
  }
  return true;
};
export const isVenueFieldConfigurationEnabled =
  process.env.REACT_APP_VENUE_CONFIGURATION_ENABLED === 'true';

export {
  getDate,
  checkDate,
  getDiffBetweenStartAndEnd,
  getMinuteDuration,
  getNextEventForSwap,
  checkUnavailableTime,
  getNextEventForSubCourtSwap,
  sortSlot,
  getEndTime,
  sortStringArrayAlphabetical,
  sortArrayAlphabetical,
  compareSortOrder,
  getAllowedSubCourtsForDraw,
  getAllowedSubcourtsForField,
  getCustomSubCourt,
  getSubCourtSize,
  generateGradientArray,
};
