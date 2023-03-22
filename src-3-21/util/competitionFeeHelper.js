import { getOrganisationData } from './sessionStorage';
export const updateTeamRegChargeType = (feeData, typeRefId) => {
  let seasonalTeamTemp = feeData.seasonalTeam;
  for (let allType of seasonalTeamTemp.allType) {
    allType.teamRegChargeTypeRefId = typeRefId;
  }
  for (let perType of seasonalTeamTemp.perType) {
    perType.teamRegChargeTypeRefId = typeRefId;
  }
};

export const checkIsTeamSeasonal = feeDetails => {
  let isSeasonalValue = false;
  for (let i in feeDetails) {
    if (feeDetails[i].isTeamSeasonal && [1, 4].includes(feeDetails[i].teamRegChargeTypeRefId)) {
      isSeasonalValue = true;
      break;
    }
  }
  return isSeasonalValue;
};

export const checkIsTeamCasual = feeDetails => {
  let isCasualValue = false;
  for (let i in feeDetails) {
    if (feeDetails[i].isTeamSeasonal && [2, 5].includes(feeDetails[i].teamRegChargeTypeRefId)) {
      isCasualValue = true;
      break;
    }
  }
  return isCasualValue;
};
export const checkIsSeasonal = feeDetails => {
  let isSeasonalValue = false;
  for (let i in feeDetails) {
    if (feeDetails[i].isSeasonal) {
      isSeasonalValue = true;
      break;
    }
  }
  return isSeasonalValue;
};

export const checkIsCasual = feeDetails => {
  let isCasualValue = false;
  for (let i in feeDetails) {
    if (feeDetails[i].isCasual) {
      isCasualValue = true;
      break;
    }
  }
  return isCasualValue;
};

export const checkIsTeamReg = feeDetails => {
  let isSeasonalValue = false;
  for (let i in feeDetails) {
    if (feeDetails[i].isTeamSeasonal) {
      isSeasonalValue = true;
      break;
    }
  }
  return isSeasonalValue;
};

export const checkHasNegativeFee = feeDetails => {
  let hasNegativeFee = false;
  if (feeDetails && feeDetails.length > 0) {
    for (let feeDetail of feeDetails) {
      if (feeDetail.isSeasonal) {
        hasNegativeFee = checkHasNegativeFeeForFeeType(feeDetail, 'seasonal');
        if (hasNegativeFee) {
          break;
        }
      }
      if (feeDetail.isCasual) {
        hasNegativeFee = checkHasNegativeFeeForFeeType(feeDetail, 'casual');
        if (hasNegativeFee) {
          break;
        }
      }
      if (feeDetail.isTeamSeasonal) {
        hasNegativeFee = checkHasNegativeFeeForFeeType(feeDetail, 'seasonalTeam');
        if (hasNegativeFee) {
          break;
        }
      }
      if (feeDetail.isTeamCasual) {
        hasNegativeFee = checkHasNegativeFeeForFeeType(feeDetail, 'casualTeam');
        if (hasNegativeFee) {
          break;
        }
      }
    }
  }
  return hasNegativeFee;
};

function checkHasNegativeFeeForFeeType(feeDetail, key) {
  let hasNegativeFee = false;
  let feeData =
    feeDetail.isAllType === 'allDivisions' ? feeDetail[key].allType : feeDetail[key].perType;
  if (feeData) {
    hasNegativeFee = feeData.some(
      x =>
        x.affiliateFee < 0 ||
        x.affiliateGst < 0 ||
        x.affNominationFees < 0 ||
        x.affNominationGST < 0 ||
        x.fee < 0 ||
        x.gst < 0 ||
        x.nominationFees < 0 ||
        x.nominationGST < 0,
    );
  }
  return hasNegativeFee;
}

export const updateTeamSeasonFeeFields = (item, sameTypeFee) => {
  item['teamSeasonalFees'] = sameTypeFee.fee;
  item['teamSeasonalGST'] = sameTypeFee.gst;
  item['affiliateTeamSeasonalFees'] = sameTypeFee.affiliateFee;
  item['affiliateTeamSeasonalGST'] = sameTypeFee.affiliateGst;
  item['nominationTeamSeasonalFee'] = sameTypeFee.nominationFees;
  item['nominationTeamSeasonalGST'] = sameTypeFee.nominationGST;
  item['affNominationTeamSeasonalFee'] = sameTypeFee.affNominationFees;
  item['affNominationTeamSeasonalGST'] = sameTypeFee.affNominationGST;
};
export const updateSeasonFeeFields = seasonFee => {
  seasonFee['seasonalFees'] = seasonFee.fee;
  seasonFee['seasonalGST'] = seasonFee.gst;
  seasonFee['affiliateSeasonalFees'] = seasonFee.affiliateFee;
  seasonFee['affiliateSeasonalGST'] = seasonFee.affiliateGst;
  seasonFee['nominationSeasonalFee'] = seasonFee.nominationFees;
  seasonFee['nominationSeasonalGST'] = seasonFee.nominationGST;
  seasonFee['affNominationSeasonalFee'] = seasonFee.affNominationFees;
  seasonFee['affNominationSeasonalGST'] = seasonFee.affNominationGST;
};
export const updateCasualFeeFields = (casualFee, sameTypeFee) => {
  casualFee['casualFees'] = sameTypeFee.fee;
  casualFee['casualGST'] = sameTypeFee.gst;
  casualFee['affiliateCasualFees'] = sameTypeFee.affiliateFee;
  casualFee['affiliateCasualGST'] = sameTypeFee.affiliateGst;
};
export const updateTeamCasualFeeFields = (casualFee, sameTypeFee) => {
  casualFee['teamCasualFees'] = sameTypeFee.fee;
  casualFee['teamCasualGST'] = sameTypeFee.gst;
  casualFee['affiliateTeamCasualFees'] = sameTypeFee.affiliateFee;
  casualFee['affiliateTeamCasualGST'] = sameTypeFee.affiliateGst;
};
export const updateTeamFeeForPerDvision = (seasonFee, feeSeasonalTeamData) => {
  let sameTypeFee = feeSeasonalTeamData.find(
    x =>
      seasonFee.competitionMembershipProductTypeId == x.competitionMembershipProductTypeId &&
      seasonFee.competitionMembershipProductDivisionId == x.competitionMembershipProductDivisionId,
  );
  if (sameTypeFee) {
    updateTeamSeasonFeeFields(seasonFee, sameTypeFee);
  }
};
export const updateTeamFeeForAllDvision = (seasonFee, feeSeasonalTeamData) => {
  let sameTypeFee = feeSeasonalTeamData.find(
    x => x.competitionMembershipProductTypeId == seasonFee.competitionMembershipProductTypeId,
  );
  if (sameTypeFee) {
    updateTeamSeasonFeeFields(seasonFee, sameTypeFee);
  }
};

export const updateAllTeamFeeForPerDvision = (feeSeasonalData, feeSeasonalTeamData) => {
  for (let seasonFee of feeSeasonalData) {
    updateTeamFeeForPerDvision(seasonFee, feeSeasonalTeamData);
  }
};
export const updateCasualFeeForAllDvision = (seasonFee, feeCasualData) => {
  let sameTypeFee = feeCasualData.find(
    x => x.competitionMembershipProductTypeId == seasonFee.competitionMembershipProductTypeId,
  );
  if (sameTypeFee) {
    updateCasualFeeFields(seasonFee, sameTypeFee);
  }
};
export const updateCasualFeeForPerDvision = (seasonFee, feeCasualData) => {
  let sameTypeFee = feeCasualData.find(
    x =>
      x.competitionMembershipProductTypeId == seasonFee.competitionMembershipProductTypeId &&
      x.competitionMembershipProductDivisionId == seasonFee.competitionMembershipProductDivisionId,
  );
  if (sameTypeFee) {
    updateCasualFeeFields(seasonFee, sameTypeFee);
  }
};
export const updateTeamCasualFeeForPerDvision = (casualFee, feeCasualTeamData) => {
  let sameTypeFee = feeCasualTeamData.find(
    x =>
      x.competitionMembershipProductTypeId == casualFee.competitionMembershipProductTypeId &&
      x.competitionMembershipProductDivisionId == casualFee.competitionMembershipProductDivisionId,
  );
  if (sameTypeFee) {
    updateTeamCasualFeeFields(casualFee, sameTypeFee);
  }
};
export const updateTeamCasualFeeForAllDvision = (casualFee, feeCasualTeamData) => {
  let sameTypeFee = feeCasualTeamData.find(
    x => x.competitionMembershipProductTypeId == casualFee.competitionMembershipProductTypeId,
  );
  if (sameTypeFee) {
    updateTeamCasualFeeFields(casualFee, sameTypeFee);
  }
};
