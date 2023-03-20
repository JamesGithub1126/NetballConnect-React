import { MatchType } from 'util/enums';

export function numberOfPeriods(type) {
  switch (type) {
    case MatchType.FOUR_QUARTERS:
      return 4;
    case MatchType.TWO_HALVES:
      return 2;
    case MatchType.SINGLE_PERIOD:
      return 1;
    default:
      return 0;
  }
}
