import { MembershipProductStatusEnum, MembershipProductStatusName } from 'enums/registrationEnums';
import AppConstants from 'themes/appConstants';
import { FLAVOUR } from './enums';
import { addDecimal, feeIsNull } from './helpers';
import { getOrganisationData } from './sessionStorage';

export const checkStripeCustomerAccount = () => {
  const organisationData = getOrganisationData();
  return !!(
    organisationData.organisationTypeRefId <= 2 || organisationData.stripeCustomerAccountId
  );
};

export const getCompetitionSeasonFee = (
  competitionFeesData,
  membershipProductUniqueKey,
  competitionMembershipProductTypeId,
  isOrganizer,
) => {
  let affFees = 0;
  let productFee = competitionFeesData.find(
    x => x.membershipProductUniqueKey === membershipProductUniqueKey,
  );
  if (productFee) {
    let seasonalFee = productFee.seasonal;
    if (seasonalFee) {
      let productTypeAllFees = null;
      if (productFee.isAllType === 'allDivisions') {
        productTypeAllFees = seasonalFee.allType;
      } else {
        productTypeAllFees = seasonalFee.perType;
      }
      let productTypeFees = productTypeAllFees.filter(
        x => x.competitionMembershipProductTypeId === competitionMembershipProductTypeId,
      );
      let divisionFees = [];
      if (isOrganizer) {
        divisionFees = productTypeFees.map(x => x.nominationFees + x.nominationGST + x.fee + x.gst);
      } else {
        divisionFees = productTypeFees.map(
          x => x.affNominationFees + x.affNominationGST + x.affiliateFee + x.affiliateGst,
        );
      }
      if (divisionFees.length > 0) {
        affFees = Math.min(...divisionFees);
      }
    }
  }
  return affFees;
};

export const trimName = name => {
  if (!name) {
    return '';
  }
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '');
};

export const getDocumentFileName = data => {
  let filename = unescape(data);
  filename = filename.slice(filename.indexOf('filename=') + 9);
  if (filename.indexOf('/') > -1) {
    filename = filename.slice(filename.lastIndexOf('/') + 1);
  }
  return filename;
};

export const getMembershipProductStatus = statuRefId => {
  let status = MembershipProductStatusName.Draft;
  if (statuRefId == MembershipProductStatusEnum.Published) {
    status = MembershipProductStatusName.Published;
  } else if (statuRefId == MembershipProductStatusEnum.Closed) {
    status = MembershipProductStatusName.Closed;
  }
  return status;
};

export const getChildEmail = (email, firstName) => {
  if (!email) {
    return '';
  }
  return email.toLowerCase().trim() + '.' + trimName(firstName);
};

export const getTransactionFeeMsg = feeStructure => {
  let msg = '';
  if (feeStructure) {
    msg = AppConstants.transactionFeeMsgTemplate;
    let ddPercent = 1.5;
    let ddFixedFee = 60;
    let ddCap = 10;
    let domesticCCPercent = 2.25;
    let domesticCCFixedFee = 60;
    let internationalCCPercent = 3.4;
    let internationCCFixedFee = 60;
    let amexCCPercent = 2.7;
    let amexCCFixedFee = 60;
    let ddFeeType = feeStructure.find(x => x.paymentType == 'au_becs_debit');
    if (ddFeeType) {
      let ddFee = ddFeeType.feeStructure[0].brands[0].fees;
      ddPercent = (ddFee.percentFee * 100).toFixed(2);
      if (ddFee.fixedFee >= 0.5) {
        ddFixedFee = Number(ddFee.fixedFee * 2).toFixed(2);
        ddFixedFee = '$' + ddFixedFee;
      } else {
        ddFixedFee = ddFee.fixedFee * 200 + 'c';
      }
      ddCap = ddFee.feeCap;
    }
    let cardFeeType = feeStructure.find(x => x.paymentType == 'card');
    if (cardFeeType) {
      let domesticCCFee = cardFeeType.feeStructure.find(x => x.country == 'AU');
      if (domesticCCFee) {
        let amexBrandFee = domesticCCFee.brands.find(x => x.brand == 'American Express');
        if (amexBrandFee) {
          amexCCPercent = (amexBrandFee.fees.percentFee * 100).toFixed(2);
          if (amexBrandFee.fees.fixedFee >= 0.5) {
            amexCCFixedFee = Number(amexBrandFee.fees.fixedFee * 2).toFixed(2);
            amexCCFixedFee = '$' + amexCCFixedFee;
          } else {
            amexCCFixedFee = amexBrandFee.fees.fixedFee * 200 + 'c';
          }
        }
        let defualtBrandFee = domesticCCFee.brands.find(x => x.brand == 'default');
        if (defualtBrandFee) {
          domesticCCPercent = (defualtBrandFee.fees.percentFee * 100).toFixed(2);
          if (defualtBrandFee.fees.fixedFee >= 0.5) {
            domesticCCFixedFee = Number(defualtBrandFee.fees.fixedFee * 2).toFixed(2);
            domesticCCFixedFee = '$' + domesticCCFixedFee;
          } else {
            domesticCCFixedFee = defualtBrandFee.fees.fixedFee * 200 + 'c';
          }
        }
      }
      let internationalCCFee = cardFeeType.feeStructure.find(x => x.country == 'default');
      if (internationalCCFee) {
        let internationalBrandFee = internationalCCFee.brands[0].fees;
        internationalCCPercent = (internationalBrandFee.percentFee * 100).toFixed(2);
        if (internationalBrandFee.fixedFee >= 0.5) {
          internationCCFixedFee = Number(internationalBrandFee.fixedFee * 2).toFixed(2);
          internationCCFixedFee = '$' + internationCCFixedFee;
        } else {
          internationCCFixedFee = internationalBrandFee.fixedFee * 200 + 'c';
        }
      }
    }

    msg = msg.replace('_ddPercent_', ddPercent);
    msg = msg.replace('_ddFixedFee_', ddFixedFee);
    msg = msg.replace('_ddCap_', ddCap);
    msg = msg.replace('_domesticCCPercent_', domesticCCPercent);
    msg = msg.replace('_domesticCCFixedFee_', domesticCCFixedFee);
    msg = msg.replace('_internationalCCPercent_', internationalCCPercent);
    msg = msg.replace('_internationCCFixedFee_', internationCCFixedFee);
    msg = msg.replace('_amexCCPercent_', amexCCPercent);
    msg = msg.replace('_amexCCFixedFee_', amexCCFixedFee);
  }
  return msg;
};

export const getMembershipFeeSum = (memberShipProductType, mkey) => {
  let sum = 0;
  if (memberShipProductType) {
    sum = addDecimal(sum, memberShipProductType[mkey]);
    if (
      memberShipProductType.organiserMembership &&
      memberShipProductType.organiserMembership.membershipMappingId
    ) {
      sum = addDecimal(sum, memberShipProductType.organiserMembership[mkey]);
    }
    if (
      memberShipProductType.parentState &&
      memberShipProductType.parentState.membershipMappingId
    ) {
      sum = addDecimal(sum, memberShipProductType.parentState[mkey]);
    }
    if (memberShipProductType.national && memberShipProductType.national.membershipMappingId) {
      sum = addDecimal(sum, memberShipProductType.national[mkey]);
    }
  }
  return sum;
};

export const getMembershipTooltipRows = (this_Obj, record, mKey) => {
  let rows = [];
  let allStates = this_Obj.props.competitionFeesState;
  let membershipPrdArr = allStates.competitionMembershipProductData
    ? allStates.competitionMembershipProductData.membershipProducts
    : [];
  let mProduct = membershipPrdArr.find(
    x => x.membershipProductUniqueKey == record.membershipProductUniqueKey,
  );
  if (!mProduct) {
    return rows;
  }

  let productType = mProduct.membershipProductTypes.find(
    x => x.competitionMembershipProductTypeId == record.competitionMembershipProductTypeId,
  );

  if (productType.national && productType.national.membershipMappingId > 0) {
    rows.push({
      name: AppConstants.nationalSeasonFee,
      fee: '$' + feeIsNull(productType.national[mKey]).toFixed(2),
    });
  }
  if (productType.parentState && productType.parentState.membershipMappingId > 0) {
    rows.push({
      name: AppConstants.parentStateSeasonFee,
      fee: '$' + feeIsNull(productType.parentState[mKey]).toFixed(2),
    });
  }
  rows.push({
    name: AppConstants.stateMembershipFeeExclGst,
    fee: '$' + feeIsNull(productType[mKey]).toFixed(2),
  });
  if (productType.organiserMembership && productType.organiserMembership.membershipMappingId > 0) {
    rows.push({
      name: AppConstants.associationMembership,
      fee: '$' + feeIsNull(productType.organiserMembership[mKey]).toFixed(2),
    });
  }
  return rows;
};

export const getOrgLevelName = orgRefTypeId => {
  let orgTypeRefName = '';
  if (orgRefTypeId == 1) {
    orgTypeRefName = 'Affiliate';
  } else if (orgRefTypeId == 2) {
    orgTypeRefName = 'Association';
  } else if (orgRefTypeId == 3) {
    orgTypeRefName = 'State';
  } else if (orgRefTypeId == 7) {
    orgTypeRefName = 'Parent State';
  } else if (orgRefTypeId == 8) {
    orgTypeRefName = 'National';
  }
  return orgTypeRefName;
};

export const isNetball = AppConstants.flavour === FLAVOUR.Netball;
export const isFootball = AppConstants.flavour === FLAVOUR.Football;
export const isBasketball = AppConstants.flavour === FLAVOUR.Basketball;

export const isNationalProductEnabled = process.env.REACT_APP_NATIONAL_PRODUCT_ENABLED === 'true';
export const isMembershipConcurrencyRuleEnabled =
  process.env.REACT_APP_MEMBERSHIP_CONCURRENCY_RULE_ENABLED === 'true';
export const isProfessionalMembershipEnabled =
  process.env.REACT_APP_PROFESSIONAL_MEMBERSHIP_ENABLED === 'true';
