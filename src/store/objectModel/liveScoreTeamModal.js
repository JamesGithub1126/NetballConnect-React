function getTeamViewPlayerListData(playerData) {
  var playerArray = [];
  for (let i in playerData) {
    var object = this.getTeamViewPlayerListObject(playerData[i]);
    playerArray.push(object);
  }
  return playerArray;
}

function getTeamViewPlayerListObject(playerData) {
  return {
    // profilePic: playerData.photoUrl,
    name: playerData.firstName + ' ' + playerData.lastName,
    dob: playerData.dateOfBirth,
    number: playerData.phoneNumber,
  };
}

//action.result

module.exports = { getTeamViewPlayerListData, getTeamViewPlayerListObject };
