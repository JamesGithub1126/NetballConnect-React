function getLadderSettingData(data) {
  var goalArray = [];
  for (let i in data) {
    var object = this.getLadderSettingObject(data[i]);
    goalArray.push(object);
  }
  return goalArray;
}

function getLadderData(data) {
  var goalArray = [];
  for (let i in data) {
    var object = this.getObject(data[i]);
    goalArray.push(object);
  }
  return goalArray;
}

function getLadderSettingObject(data) {
  return {
    id: data.id,
    resultTypeId: data.code,
    points: '',
  };
}

function getObject(data) {
  // let { id } = JSON.parse(localStorage.getItem('LiveScoreCompetition'))
  return {
    competitionId: 1,
    resultTypeId: data.id,
    points: '',
  };
}

module.exports = { getLadderSettingData, getLadderSettingObject, getLadderData, getObject };
