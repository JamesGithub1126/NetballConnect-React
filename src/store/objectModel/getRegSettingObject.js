function getRegistrationSetting(data) {
  var settingArray = [];
  for (let i in data) {
    var object = getRegistrationObject(data[i]);
    settingArray.push(object);
  }
  return settingArray;
}

function getRegistrationObject(data) {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    sortOrder: data.sortOrder,
    subReferences: data.subReferences === null ? [] : getRegSubRefrenceData(data.subReferences),
  };
}

function getRegSubRefrenceData(data) {
  var subArray = [];
  for (let i in data) {
    var object = getRegSubRefrence(data[i]);
    subArray.push(object);
  }
  return subArray;
}

function getRegSubRefrence(data) {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    sortOrder: data.sortOrder,
    subReferences: data.subReferences ? data.subReferences : [],
  };
}

export { getRegistrationSetting };
