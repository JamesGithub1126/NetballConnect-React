import { isBasketball, isFootball } from 'util/registrationHelper';
import { getStatType } from './getStatType';

export default function canShowBenchFoulOption(record, gameStatList) {
  if (isFootball || isBasketball) {
    const { isFoul } = getStatType(record, gameStatList);
    return !!isFoul;
  }
}
