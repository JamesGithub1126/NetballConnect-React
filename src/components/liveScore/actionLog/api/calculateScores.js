import { isNotNullAndUndefined } from "util/helpers";

export default function calculateScores(type, eventAttribute1Value, gameStatList) {
  const filteredGameStatList = gameStatList.filter(
    i =>
      i.code === type &&
      i.isScore === true &&
      i.contributionRefId === 1 &&
      i.outcomeRefId === 1 &&
      i.contributionRefId === 1,
  );
  if (filteredGameStatList.length > 0) {
    if (
      filteredGameStatList[0].statValue != 0 &&
      isNotNullAndUndefined(filteredGameStatList[0].statValue)
    ) {
      // this impacts the running score total by the amount specified for this type of gameStat  e.g. (G, S, Pe, OG, G)
      return filteredGameStatList[0].statValue;
    } else if (isNotNullAndUndefined(eventAttribute1Value)) {
      // this impacts the running score total by the amount stored in attribute1Value e.g. P (Points), MP (Missed Points)
      return eventAttribute1Value;
    } else {
      return 0;
    }
  } else {
    // this doesn't impact the running score total (e.g. fouls)
    return 0;
  }
}
