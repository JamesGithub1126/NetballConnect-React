function getPositionTrackListData(data, reporting) {
  var arr = [];
  for (let i in data) {
    var object = this.getPositionTrackListObject(data[i], reporting);
    arr.push(object);
  }
  return arr;
}

function getPositionTrackListObject(data, reporting) {
  let playDurationInSecond = data.playDuration * 60;
  return {
    matchId: data?.match?.id,
    roundName: data?.round?.name,
    teamName: data?.team?.name,
    teamId: data?.team?.id,
    userId: data?.player?.userId,
    firstName: data?.player?.firstName,
    lastName: data?.player?.lastName,
    gs: getPointsValue(data.gs, data.play, reporting),
    ga: getPointsValue(data.ga, data.play, reporting),
    wa: getPointsValue(data.wa, data.play, reporting),
    c: getPointsValue(data.c, data.play, reporting),
    wd: getPointsValue(data.wd, data.play, reporting),
    gd: getPointsValue(data.gd, data.play, reporting),
    gk: getPointsValue(data.gk, data.play, reporting),
    i: getPointsValue(data.i, data.play, reporting),
    played: getPointsValue(data.play, playDurationInSecond, reporting),
    bench: getPointsValue(data.bench, playDurationInSecond, reporting),
    benchOrInjured: getPointsValue(data.benchOrInjured, playDurationInSecond, reporting),
    noPlay: getPointsValue(data.noplay, playDurationInSecond, reporting),
  };
}

function getPointsValue(point_1, point_2, reporting) {
  let point1 = JSON.parse(point_1);
  let point2 = JSON.parse(point_2);

  let division = 0;

  if (point2 === 0) {
    division = 0;
  } else {
    division = point1 / point2;
  }
  return reporting === 'PERCENT'
    ? (division * 100).toFixed(2) + '%'
    : reporting === 'MINUTE'
      ? Number(point1)
      : Number(point1);
}

module.exports = {
  getPositionTrackListData,
  getPositionTrackListObject,
};
