function getData(data) {
  var arr = [];
  for (let i in data) {
    var object = this.getMatchDivisionObject(data[i]);
    arr.push(object);
  }
  return arr;
}

function getMatchDivisionObject(data) {
  return {
    id: data.id,
    name: data.name,
  };
}

function getMatchViewData(data) {
  var arr = [];
  for (let i in data) {
    var object = this.getMatchViewObject(data[i]);
    arr.push(object);
  }
  return arr;
}

function getMatchViewObject(data) {
  return {
    playerId: data.playerId,
    photoUrl: data.photoUrl,
    name: data.firstName ? data.firstName + ' ' + data.lastName : '',
    team: data.team?.name,
    teamId: data.team?.id,
    attended: data.played === 0 || data.played === null ? false : true,
    lineup: data.lineup ? data.lineup : null,
    attendance: data.attendance,
    played: data.played,
    suspended: data.suspended,
    statusRef: data.statusRef,
    attendanceTypeId: data.attendanceTypeId,
  };
}
module.exports = { getData, getMatchDivisionObject, getMatchViewData, getMatchViewObject };
