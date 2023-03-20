function entityTypes(enitityName) {
  let enitityArray = [
    {
      id: 1,
      name: 'COMPETITION',
    },
    {
      id: 2,
      name: 'ORGANISATION',
    },
    {
      id: 5,
      name: 'PLAYER',
    },
    {
      id: 3,
      name: 'TEAM',
    },
    {
      id: 4,
      name: 'USER',
    },
  ];
  let enitityId = null;
  for (let i in enitityArray) {
    if (enitityName == enitityArray[i].name) {
      enitityId = enitityArray[i].id;
    }
  }
  return enitityId;
}

module.exports = { entityTypes };
