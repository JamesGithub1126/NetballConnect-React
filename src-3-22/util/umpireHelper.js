import {UmpireAllocationTypeEnum, UmpireSequence} from 'enums/enums';
import AppColor from 'themes/appColor';
import {FLAVOUR, PaymentTypeName} from './enums';
import AppConstants from "../themes/appConstants";
import {isNotNullAndUndefined} from "./helpers";
export const umpireStatusColor = data => {
  if (data.verifiedBy || data.status === 'YES') {
    return AppColor.umpireTextGreen;
  } else if (data.status === 'NO') {
    return AppColor.umpireTextRed;
  } else {
    return AppColor.standardTxtColor;
  }
};

export const getUmpireSequencesFromSettings = (umpireSequenceSetting, sort = false) => {
  let sequences =
    AppConstants.flavour === FLAVOUR.Netball
      ? [0, 1, 2, 5]
      : AppConstants.flavour === FLAVOUR.Basketball
        ? [0, 1, 2]
        : [0, 1, 2, 3, 5];
  if (
    isNotNullAndUndefined(umpireSequenceSetting) &&
    umpireSequenceSetting != 'null' &&
    umpireSequenceSetting != 'undefined'
  ) {
    sequences = [];
    let sequenceSetting = {};
    if (Object.prototype.toString.call(umpireSequenceSetting) === '[object String]') {
      sequenceSetting = JSON.parse(umpireSequenceSetting);
    } else {
      Object.assign(sequenceSetting, umpireSequenceSetting);
    }
    let numberOfUmpires = sequenceSetting.NumberOfUmpires || 0;
    for (let index = 1; index <= numberOfUmpires; index++) {
      sequences.push(index);
    }
    sequenceSetting.CoachEnabled && sequences.push(5);
    sequenceSetting.ReserveEnabled && sequences.push(0);
  }

  if (sort) {
    let sortedSettings = sequences.concat().sort();
    let zeroIndex = sortedSettings.findIndex(s => s == UmpireSequence.UmpireReserve);
    if (zeroIndex === 0) {
      sortedSettings.shift();
      sortedSettings.push(UmpireSequence.UmpireReserve);
    }
    return sortedSettings;
  }

  return sequences;
}

export const getPaymentTypeDescription = type => {
  if (!type) return '';
  switch (type) {
    case PaymentTypeName.DirectDebit:
      return 'Direct Debit';
    case PaymentTypeName.Card:
      return 'Card';
    case PaymentTypeName.Cash:
      return 'Cash';
    case PaymentTypeName.Offline:
      return 'Offline';
    default:
      return '';
  }
};
export const getAllocateionTypes = umpireAllocationSettings => {
  let hasPoolAllocation = false;
  let hasTeamAllocation = false;
  if (umpireAllocationSettings && umpireAllocationSettings.length) {
    hasPoolAllocation = umpireAllocationSettings.some(
      setting => setting.umpireAllocationTypeRefId === UmpireAllocationTypeEnum.VIA_POOLS,
    );
    hasTeamAllocation = umpireAllocationSettings.some(
      setting => setting.umpireAllocationTypeRefId === UmpireAllocationTypeEnum.OWN_TEAM,
    );
  }
  return { hasPoolAllocation, hasTeamAllocation };
};
