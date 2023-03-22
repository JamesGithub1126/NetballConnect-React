function getPlayerListData(data) {
  var PlayerArray = [];
  for (let i in data) {
    var object = this.getPlayerListObject(data[i]);
    PlayerArray.push(object);
  }
  return PlayerArray;
}

function getPlayerListObject(data) {
  return {
    playerId: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    profilePicture: data.photoUrl ? data.photoUrl : null,
    phoneNumber: data.phoneNumber,
    dob: data.dateOfBirth,
    team: data.team,
    competitionOrganisation: data.competitionOrganisation,
    competitionOrganisationId: data.competitionOrganisationId,
    division: data.team?.division,
    userId: data.userId,
    mnbPlayerId: data.mnbPlayerId,
    user: data.user,
    suspended: data.suspended,
    statusRefId: data.statusRefId,
  };
}

module.exports = { getPlayerListData, getPlayerListObject };
