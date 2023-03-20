//assumes the sportRefId is the same for all records
export function getStatType(matchEvent, gameStatList) {
  const foundGameStat = gameStatList.find(gs => gs.code === matchEvent.type);
  const { isScore, isEnhancedStatistic, isFoul } = foundGameStat || {};

  return { isScore: !!isScore, isEnhancedStatistic: !!isEnhancedStatistic, isFoul: !!isFoul };
}
