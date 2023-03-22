import moment from 'moment';
const weekdayDef = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const shortWeekdayDef = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function liveScore_MatchFormate(date) {
  let formatedDate = moment(date).format('DD/MM/YYYY HH:mm');
  return formatedDate;
}

function liveScore_formateDateTime(date) {
  let formatedDate = moment(date).format('DD/MM/YYYY HH:mm');
  return formatedDate;
}

function liveScore_formateDate(date) {
  if (!date) return null;

  let formatedDate = moment(date).format('DD/MM/YYYY');
  return formatedDate;
}

function formateTime(time) {
  let formatedDate = time.format('HH:mm');
  return formatedDate;
}

function getDayName(date) {
  let dayName = shortWeekdayDef[new Date(date).getDay()];
  return dayName;
}
function getWeekDay(date) {
  return weekdayDef[new Date(date).getDay()].toLowerCase();
}

function getTime(date) {
  let time = moment(date).format('HH:mm');
  return time;
}

function isDateSame(date1, date2) {
  let status = moment(new Date(date1)).isSame(new Date(date2));
  return status;
}

function sortArrayByDate(dateArray) {
  const sortedArray = dateArray.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  return sortedArray;
}
function formatDateTime(startDate, startTime) {
  let endDate = moment(startDate).format('DD-MMM-YYYY');
  let endTime = moment(startTime).format('HH:mm');
  let date_time = endDate + ' ' + endTime + ' UTC';
  var dt = new Date(date_time);
  let formatedValue = dt.toISOString();

  return formatedValue;
}

export {
  liveScore_formateDate,
  formateTime,
  liveScore_formateDateTime,
  getDayName,
  getTime,
  isDateSame,
  getWeekDay,
  sortArrayByDate,
  formatDateTime,
  liveScore_MatchFormate,
  weekdayDef,
};
