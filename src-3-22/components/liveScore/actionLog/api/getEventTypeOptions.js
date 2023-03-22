import isPointType from "./isPointType";

export default function getEventTypeOptions(showPointTypes = false, gameStatList = []) {
  let options = [];
  const namesMap = new Map();
  gameStatList.forEach(gs => {
    if (showPointTypes && !!gs.sportRefId && !gs.gameStatCategory) {
      //we only want to show Points, Missed Points and gameStatCategory types
      return;
    }
    if(!showPointTypes && isPointType(gs.code)){
      return;
    }
    const gameStatCategory = gs.gameStatCategory;
    const name = gameStatCategory?.name ?? gs.name;

    const isVisible = !!gameStatCategory
      ? true
      : !!gs.isScore || !!gs.isFoul || !!gs.isEnhancedStatistics;

    if (isVisible && !namesMap.get(name)) {
      namesMap.set(name, true);
      options.push({
        type: gs.code,
        name,
        gameStatCategoryId: gameStatCategory?.id ?? null,
        sortOrder: gameStatCategory?.sortOrder ?? gs.sortOrder,
      });
    }
  });

  options.sort((a, b) => {
    const value = (a.isGameStatCategory ? 1 : 0) - (b.isGameStatCategory ? 1 : 0);
    if (value === 0) {
      return a.sortOrder - b.sortOrder;
    }
    return value;
  });

  return options;
}
