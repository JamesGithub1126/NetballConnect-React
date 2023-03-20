export default function getEventTypeValue(eventTypeOptions, matchEvent, gameStatList) {
  if (!matchEvent.type) {
    return null;
  }
  const gameStat = gameStatList.find(gs => gs.code === matchEvent.type);
  if (!gameStat) {
    return null;
  }
  const gameStatCategoryId = gameStat.gameStatCategory?.id;
  if (gameStatCategoryId) {
    return eventTypeOptions.find(eto => eto.gameStatCategoryId === gameStatCategoryId)?.type;
  } else {
    return eventTypeOptions.find(eto => eto.type === matchEvent.type)?.type;
  }
}
