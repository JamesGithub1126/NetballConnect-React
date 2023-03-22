import { DEFAULT_POINTS } from './constants';
import isPointType from './isPointType';

export default function getEventSubTypeOptions(
  eventType = null,
  gameStatList = [],
  pointScheme = [],
) {
  const gameStat = gameStatList.find(gs => gs.code === eventType);

  if (isPointType(gameStat?.code)) {
    return getPointSchemeOptions(pointScheme, gameStat.id);
  } else {
    return getGameStatOptions(gameStat?.gameStatCategory?.id, gameStatList);
  }
}

function getGameStatOptions(gameStatCategoryId = null, gameStatList = []) {
  return gameStatList
    .filter(gs => gs.gameStatCategory?.id === gameStatCategoryId)
    .map(gs => {
      return { type: gs.code, name: gs.name, gameStatCategoryId };
    });
}

function getPointSchemeOptions(pointScheme = [], gameStatId = null) {
  const pointObject = pointScheme.find(ps => ps.id === gameStatId);
  const options = (pointObject?.value || []).map(point => {
    return { type: point, name: point, gameStatCategoryId: null };
  });
  if (!options.length) {
    return DEFAULT_POINTS;
  }
  return options;
}
