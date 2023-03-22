import { TeamFeeType, TeamRegistrationChargeType } from 'enums/registrationEnums';
import { updateTeamRegChargeType } from 'util/competitionFeeHelper';
import ApiConstants from '../../../themes/apiConstants';
import AppConstants from '../../../themes/appConstants';
import { isArrayNotEmpty, isNotNullOrEmptyString } from '../../../util/helpers';
import { getOrganisationData } from '../../../util/sessionStorage';
import { getRegistrationSetting } from '../../objectModel/getRegSettingObject';
import { RegistrationInvitees } from 'util/enums';
import { getMembershipFeeSum } from 'util/registrationHelper';

// dummy object of competition detail
const competitionDetailObject = {
  competitionUniqueKey: '',
  competitionName: '',
  description: '',
  competitionTypeRefId: 1,
  competitionFormatRefId: 1,
  startDate: null,
  noOfRounds: '',
  roundInDays: '7',
  roundInHours: '0',
  roundInMins: '0',
  registrationCloseDate: null,
  competitionLogoUrl: null,
  minimunPlayers: '',
  maximumPlayers: '',
  venues: [],
  nonPlayingDates: [],
  invitees: [],
  selectedVenuesIds: [],
  logoIsDefault: false,
  yearRefId: null,
  statusRefId: 1,
  hasRegistration: 0,
  allowPlayerReplication: false,
  playerPublishTypeRefId: 1,
};

const paymentOptionObject = {
  paymentOptions: [],
  charityRoundUp: [],
};
const discountObject = {
  competitionDiscounts: [],
  govermentVouchers: [],
};

const competitionGradeInitialData = {
  compGradeNamingTemplateId: 0,
  gradeTypeRefId: 1,
  divisions: [],
  selectedDivisions: [],
  customTeamGrades: [],
};

const initialState = {
  onLoad: false,
  getCompAllDataOnLoad: false,
  error: null,
  result: null,
  status: 0,
  regCompetitionFeeListData: [], ////////registration competiton fees list
  regCompetitonFeeListPage: 1,
  regCompetitonFeeListTotalCount: 1,
  competitionDetailData: competitionDetailObject,
  competitionMembershipProductData: null,
  competitionDivisionsData: null,
  competitionFeesData: [],
  competitionDivisionsListData: [],
  competitionGradePoolsData: [{ ...competitionGradeInitialData }],
  isAllDivisionChecked: false,
  competitionPaymentsData: paymentOptionObject,
  competitionDiscountsData: discountObject,
  competitionId: '',
  defaultCompFeesMembershipProduct: null,
  multipleDefaultCompFeesMembershipProduct: [],
  onLoadMultipleMembership: false,
  venueList: [],
  postVenues: [],
  postInvitees: [],
  casualPaymentDefault: [],
  seasonalPaymentDefault: [],
  seasonalTeamPaymentDefault: [],
  perMatchPaymentDefault: [],
  SelectedSeasonalFee: [],
  selectedIndividualPerMatchFee: [],
  selectedCasualFee: [],
  selectedCasualTeamFee: [],
  selectedSeasonalTeamFee: [],
  selectedCasualFeeKey: [],
  SelectedSeasonalFeeKey: [],
  selectedSeasonalTeamFeeKey: [],
  seasonalExpendedKey: null,
  casusalExpendedKey: null,
  seasonalTeamExpendedKey: null,
  charityRoundUp: [],
  govtVoucher: [],
  competionDiscountValue: {
    competitionId: '',
    competitionDiscounts: [
      {
        discounts: [],
      },
    ],
  },
  defaultDiscountType: [],
  selectedInvitees: [],
  selectedVenues: [],
  selectedVenuesAdd: null,
  getCompetitionFeeDetails: [],
  discountMembProductKey: [],
  selectedProductType: [],
  defaultSelectedCasualFee: [],
  defaultSelectedSeasonalFee: [],
  defaultSelectedSeasonalTeamFee: [],
  selectedCharityArray: [],
  defaultChairtyOption: [],
  defaultGovtVoucher: [],
  defaultCompFeesOrgLogo: null,
  defaultCompFeesOrgLogoData: null,
  newVenueObj: {
    id: null,
    name: null,
    street1: null,
    street2: null,
    suburb: null,
    stateRefId: null,
    postalCode: null,
    contactNumber: null,
    statusRefId: 1,
    createdBy: null,
    createdOn: '2020-02-17T05:00:06.000Z',
    updatedBy: null,
    updatedOn: null,
    isDeleted: 0,
    lat: null,
    lng: null,
    isEventSpecific: 0,
  },
  competitionCreator: null,
  associationAffilites: [],
  clubAffilites: [],
  affiliateOrgSelected: [],
  searchLoad: false,
  charityTitle: '',
  charityDescription: '',
  deleteDivisionLoad: false,
  affiliateSelected: null,
  otherSelected: null,
  anyOrgSelected: null,
  nonSelected: null,

  invitedTo: [],
  invitedOrganisation: [],

  associationLeague: [],
  clubSchool: [],

  affiliateNonSelected: null,
  anyOrgNonSelected: 'none2',

  affiliateArray: [],
  anyOrgAffiliateArr: [],
  any_club_Org_AffiliateArr: [],
  createVenue: null,
  selectedTeamSeasonalInstalmentDates: [],
  selectedSeasonalInstalmentDates: [],
  orgRegistrationId: null,
  associationChecked: false,
  clubChecked: false,
  anyOrgAssociationArr: [],
  anyOrgClubArr: [],
  selectedPaymentMethods: [],
  paymentMethodsDefault: [],
  competitionListAction: null,
  pageSize: 10,
  membershipTypeList: [],
  anyOrgAddedAssociationsArr: [],
  anyOrgAddedClubsArr: [],

  addingAssociationChecked: false,
  addingClubChecked: false,
  addedAssociationLeague: [],
  addedClubSchool: [],
  hasInvitedAffiliates: false,
  stateAllowsPlayerReplication: false,
  archiveLoad: false,
  addInviteesLoad: false,
};

/////function to append isselected values in default membership types array
function getDefaultCompMemberhsipProduct(data, apiSelectedData) {
  let compMembershipProductTempArray = [];
  if (data) {
    let getmembershipProducts = data;

    for (let i in getmembershipProducts) {
      let statusData = checkMembershipProductData(
        getmembershipProducts[i],
        apiSelectedData.membershipProducts,
      );

      if (!statusData.status) {
        getmembershipProducts[i]['isProductSelected'] = false;
      } else {
        getmembershipProducts[i]['isProductSelected'] = true;
        getmembershipProducts[i]['competitionMembershipProductId'] =
          statusData.competitionMembershipProductId;
      }

      if (isArrayNotEmpty(getmembershipProducts[i].membershipProductTypes)) {
        for (let j in getmembershipProducts[i].membershipProductTypes) {
          if (
            !checkMembershipProductTypes(
              getmembershipProducts[i].membershipProductTypes[j],
              statusData.types,
            )
          ) {
            getmembershipProducts[i].membershipProductTypes[j]['isTypeSelected'] = false;
            getmembershipProducts[i].membershipProductTypes[j][
              'competitionMembershipProductTypeId'
            ] = 0;
          } else {
            getmembershipProducts[i].membershipProductTypes[j]['isTypeSelected'] = true;
            getmembershipProducts[i].membershipProductTypes[j]['competitionMembershipProductId'] =
              statusData.competitionMembershipProductId;
            for (let k in statusData.types) {
              if (
                statusData.types[k].membershipProductTypeMappingId ==
                getmembershipProducts[i].membershipProductTypes[j].membershipProductTypeMappingId
              ) {
                getmembershipProducts[i].membershipProductTypes[j][
                  'competitionMembershipProductTypeId'
                ] = statusData.types[k].competitionMembershipProductTypeId;

                break;
              }
            }
          }
        }
      }
    }
    compMembershipProductTempArray = getmembershipProducts;
  }
  return compMembershipProductTempArray;
}

////////function for pushing data selected by the user
function checkMembershipProductTypes(productType, typesArray) {
  let status = false;
  for (let i in typesArray) {
    if (
      productType.membershipProductTypeMappingId === typesArray[i].membershipProductTypeMappingId
    ) {
      status = true;
      break;
    }
  }
  return status;
}

//////function for pushing data selected by the user
function checkMembershipProductData(product, apiSelectedData) {
  let status = false;
  let types = [];
  let competitionMembershipProductId = null;

  for (let i in apiSelectedData) {
    if (product.membershipProductUniqueKey === apiSelectedData[i].membershipProductUniqueKey) {
      status = true;
      types = apiSelectedData[i].membershipProductTypes;
      competitionMembershipProductId = apiSelectedData[i].competitionMembershipProductId;
      break;
    }
  }
  return {
    status: status,
    types: types,
    competitionMembershipProductId: competitionMembershipProductId,
  };
}

function checkDivision(divisionArray, membershipProductUniqueKey, parentIndex) {
  let divisions = [];
  for (let i in divisionArray) {
    if (membershipProductUniqueKey === divisionArray[i].membershipProductUniqueKey) {
      if (!isArrayNotEmpty(divisionArray[i].divisions)) {
        divisions = [];
        break;
      } else {
        let tempDivisionArray = divisionArray[i].divisions;
        for (let j in tempDivisionArray) {
          tempDivisionArray[j]['parentIndex'] = parentIndex;
          if (
            isNotNullOrEmptyString(tempDivisionArray[j].fromDate) &&
            isNotNullOrEmptyString(tempDivisionArray[j].toDate)
          ) {
            tempDivisionArray[j]['ageRestriction'] = true;
          } else {
            tempDivisionArray[j]['ageRestriction'] = false;
          }
          if (tempDivisionArray[j].genderRefId !== null) {
            tempDivisionArray[j]['genderRestriction'] = true;
          } else {
            tempDivisionArray[j]['genderRestriction'] = false;
          }
        }
        divisions = tempDivisionArray;

        break;
      }
    }
  }

  return divisions;
}

function isPlayingStatus(productTypesArray) {
  let isPlaying_Status = false;
  for (let k in productTypesArray) {
    if (productTypesArray[k].isPlaying == 1) {
      // array.push(productTypesArray[k])
      isPlaying_Status = true;
    }
  }
  return isPlaying_Status;
}

/////function to append isselected age restriction in the division section table
function getDivisionTableData(data) {
  let compDivisionTempArray = [];
  let selectedMebershipProductArray = data.competitionmembershipproduct.membershipProducts;
  let compDivisionArray = data.competitiondivisions.competitionFeeDivision;
  if (selectedMebershipProductArray) {
    for (let i in selectedMebershipProductArray) {
      let checkIsPlaying = isPlayingStatus(selectedMebershipProductArray[i].membershipProductTypes);
      let defaultNonPlayingArray = [];
      compDivisionTempArray.push({
        divisions:
          checkIsPlaying == false
            ? defaultNonPlayingArray
            : checkDivision(
                compDivisionArray,
                selectedMebershipProductArray[i].membershipProductUniqueKey,
                i,
              ),
        membershipProductName: selectedMebershipProductArray[i].membershipProductName,
        membershipProductUniqueKey: selectedMebershipProductArray[i].membershipProductUniqueKey,
        competitionMembershipProductId:
          selectedMebershipProductArray[i].competitionMembershipProductId,
        isPlayingStatus: checkIsPlaying,
      });
    }
  }
  return compDivisionTempArray;
}

//for check selected Charity
function checkSelectedCharity(selected, data) {
  for (let i in data) {
    if (selected) {
      for (let j in selected) {
        if (data[i].id == selected[j].charityRoundUpRefId) {
          data[i]['isSelected'] = true;

          break;
        } else {
          data[i]['isSelected'] = false;
        }
      }
    } else {
      data[i]['isSelected'] = false;
    }
  }
  return data;
}

//get charity result
function getCharityResult(data) {
  let newCharityResult = [];
  if (isArrayNotEmpty(data)) {
    for (let i in data) {
      data[i]['isSelected'] = false;
    }
    newCharityResult = data;
  }
  return newCharityResult;
}

function checkSelectedVoucher(selected, data) {
  for (let i in data) {
    if (selected) {
      for (let j in selected) {
        if (data[i].id == selected[j].governmentVoucherRefId) {
          data[i]['isSelected'] = true;
          break;
        } else {
          data[i]['isSelected'] = false;
        }
      }
    } else {
      data[i]['isSelected'] = false;
    }
  }
  return data;
}

//for get selected membership product
function getSelectedDiscountProduct(data, productData) {
  let productDataArr = productData.membershipProducts;
  let selectedDiscountProduct = [];
  for (let i in productDataArr) {
    if (productDataArr[i].membershipProductUniqueKey == data) {
      if (isArrayNotEmpty(productDataArr[i].membershipProductTypes)) {
        selectedDiscountProduct = productDataArr[i].membershipProductTypes;
      } else {
        selectedDiscountProduct = [];
      }
    }
  }
  return selectedDiscountProduct;
}

//for get discount data
function discountDataObject(data) {
  let discountArray = [];
  let competitionFeeDiscountsArr = data.competitionDiscounts;
  if (competitionFeeDiscountsArr !== null) {
    if (competitionFeeDiscountsArr[0].discounts) {
      discountArray = competitionFeeDiscountsArr[0].discounts;
    } else {
      discountArray = [];
    }
  } else {
    discountArray = [];
  }
  return discountArray;
}

// for  updated selected seasonal fee array
// function getUpdatedSeasonalFee(value, getUpdatedSeasonalFeeArr) {
//     for (let i in value) {
//         if (value[i] == 5) {
//         } else {
//             let settingObj = {
//                 "subOptions": [],
//                 "feesTypeRefId": '2',
//                 "paymentOptionRefId": value[i]
//             }
//             getUpdatedSeasonalFeeArr.push(settingObj)
//         }
//     }
//     return getUpdatedSeasonalFeeArr
// }

// get selected casual fee payment option key
function checkSelectedCasualFee(
  paymentData,
  casualFee,
  selectedCasualFee,
  selectedCasualFeeKey,
  isEdit,
  feesTypeRefId,
) {
  selectedCasualFeeKey = [];
  selectedCasualFee = [];
  //if (paymentData) {
  for (let item of casualFee) {
    let paymentOptObj = {
      feesTypeRefId: feesTypeRefId,
      isChecked: isEdit === false ? (item.id === 1 ? true : false) : false,
      paymentOptionId: 0,
      paymentOptionRefId: item.id,
      description: item.description,
    };
    let obj = paymentData
      ? paymentData.find(x => x.paymentOptionRefId == item.id && x.feesTypeRefId == feesTypeRefId)
      : null;
    if (obj) {
      paymentOptObj.isChecked = true;
      paymentOptObj.paymentOptionId = obj.paymentOptionId;
      selectedCasualFee.push(paymentOptObj);
    } else {
      selectedCasualFee.push(paymentOptObj);
    }
  }

  // for (let i in paymentData) {
  //     if (paymentData[i].feesTypeRefId == 1) {
  //         selectedCasualFeeKey.push(paymentData[i].paymentOptionRefId)
  //         selectedCasualFee.push(paymentData[i])
  //     }
  // }
  return {
    selectedCasualFeeKey,
    selectedCasualFee,
  };
  // } else {
  //     return {
  //         selectedCasualFeeKey,
  //         selectedCasualFee
  //     }
  // }
}

// get selected Seasonal fee payment option key
function checkSelectedSeasonalFee(
  paymentDataArray,
  seasonalFee,
  selectedSeasonalFee,
  selectedSeasonalFeeKey,
  instalmentDates,
  selectedSeasonalInstalmentDates,
  isEdit,
) {
  selectedSeasonalFeeKey = [];
  selectedSeasonalInstalmentDates = [];
  selectedSeasonalFee = [];
  //if (paymentDataArray) {

  for (let item of seasonalFee) {
    let paymentOptObj = {
      feesTypeRefId: 2,
      isChecked: isEdit === false ? (item.description === 'Pay Full Amount' ? true : false) : false,
      // isChecked: false,
      paymentOptionId: 0,
      paymentOptionRefId: item.id,
      description: item.description,
      organisationId: null,
    };
    let objs = paymentDataArray
      ? paymentDataArray.filter(x => x.paymentOptionRefId == item.id && x.feesTypeRefId == 2)
      : [];
    if (objs.length > 0) {
      for (let obj of objs) {
        let savedOption = { ...paymentOptObj };
        savedOption.isChecked = obj.isChecked;
        savedOption.paymentOptionId = obj.paymentOptionId;
        savedOption.organisationId = obj.organisationId;
        selectedSeasonalFee.push(savedOption);
      }
    } else {
      selectedSeasonalFee.push(paymentOptObj);
    }
  }
  // for (let i in paymentDataArray) {
  //     if (paymentDataArray[i].feesTypeRefId == 2) {
  //         selectedSeasonalFeeKey.push(paymentDataArray[i].paymentOptionRefId)
  //         paymentDataArray[i]["isChecked"] = true;
  //         selectedSeasonalFee.push( paymentDataArray[i])
  //     }
  // }

  if (instalmentDates != null && instalmentDates.length > 0) {
    for (let i in instalmentDates) {
      if (instalmentDates[i].feesTypeRefId == 2) {
        selectedSeasonalInstalmentDates.push(instalmentDates[i]);
      }
    }
  }
  return {
    selectedSeasonalFeeKey,
    selectedSeasonalFee,
    selectedSeasonalInstalmentDates,
  };
  // } else {
  //     return {
  //         selectedSeasonalFeeKey,
  //         selectedSeasonalFee,
  //         selectedSeasonalInstalmentDates
  //     }
  // }
}

// get selected Seasonal Team fee payment option key
function checkSelectedSeasonalTeamFee(
  paymentDataArray,
  seasonalFee,
  selectedSeasonalTeamFee,
  selectedSeasonalTeamFeeKey,
  instalmentdates,
  selectedTeamSeasonalInstalmentDates,
  isEdit,
) {
  selectedSeasonalTeamFeeKey = [];
  selectedTeamSeasonalInstalmentDates = [];
  selectedSeasonalTeamFee = [];
  //if (paymentDataArray) {

  for (let item of seasonalFee) {
    let paymentOptObj = {
      feesTypeRefId: 3,
      isChecked: isEdit === false ? (item.description === 'Pay Full Amount' ? true : false) : false,
      paymentOptionId: 0,
      paymentOptionRefId: item.id,
      description: item.description,
      organisationId: null,
    };
    let objs = paymentDataArray
      ? paymentDataArray.filter(x => x.paymentOptionRefId == item.id && x.feesTypeRefId == 3)
      : [];
    if (objs.length > 0) {
      for (let obj of objs) {
        let savedOption = { ...paymentOptObj };
        savedOption.isChecked = obj.isChecked;
        savedOption.paymentOptionId = obj.paymentOptionId;
        savedOption.organisationId = obj.organisationId;
        selectedSeasonalTeamFee.push(savedOption);
      }
    } else {
      selectedSeasonalTeamFee.push(paymentOptObj);
    }
  }

  // for (let i in paymentDataArray) {
  //     if (paymentDataArray[i].feesTypeRefId == 3) {
  //         selectedSeasonalTeamFeeKey.push(paymentDataArray[i].paymentOptionRefId)
  //         selectedSeasonalTeamFee.push(paymentDataArray[i])
  //     }
  // }
  if (instalmentdates != null && instalmentdates.length > 0) {
    for (let i in instalmentdates) {
      if (instalmentdates[i].feesTypeRefId == 3) {
        selectedTeamSeasonalInstalmentDates.push(instalmentdates[i]);
      }
    }
  }
  return {
    selectedSeasonalTeamFeeKey,
    selectedSeasonalTeamFee,
    selectedTeamSeasonalInstalmentDates,
  };

  // }
  // else {
  //     return {
  //         selectedSeasonalTeamFeeKey,
  //         selectedSeasonalTeamFee,
  //         selectedTeamSeasonalInstalmentDates
  //     }
  // }
}

function checkSelectedCasualTeamFee(paymentDataArray, casualFee, selectedCasualTeamFee) {
  selectedCasualTeamFee = [];
  for (let item of casualFee) {
    let paymentOptObj = {
      feesTypeRefId: 4,
      isChecked: false,
      paymentOptionId: 0,
      paymentOptionRefId: item.id,
      description: item.description,
    };
    let obj = paymentDataArray
      ? paymentDataArray.find(x => x.paymentOptionRefId == item.id && x.feesTypeRefId == 4)
      : null;
    if (obj) {
      paymentOptObj.isChecked = true;
      paymentOptObj.paymentOptionId = obj.paymentOptionId;
      selectedCasualTeamFee.push(paymentOptObj);
    } else {
      selectedCasualTeamFee.push(paymentOptObj);
    }
  }

  return {
    selectedCasualTeamFee,
  };
}

function checkSelectedPaymentMethods(
  paymentMethodArray,
  paymentMethodDefault,
  selectedPaymentMethods,
) {
  selectedPaymentMethods = [];
  for (let item of paymentMethodDefault) {
    let paymentMthObj = {
      isChecked: false,
      paymentMethodId: 0,
      paymentMethodRefId: item.id,
      description: item.description,
    };
    let obj = paymentMethodArray
      ? paymentMethodArray.find(x => x.paymentMethodRefId == item.id)
      : null;
    if (obj) {
      paymentMthObj.isChecked = true;
      paymentMthObj.paymentMethodId = obj.paymentMethodId;
      selectedPaymentMethods.push(paymentMthObj);
    } else {
      selectedPaymentMethods.push(paymentMthObj);
    }
  }

  return {
    selectedPaymentMethods,
  };
}

// for  updated selected Casual fee array
// function getUpdatedSeasonalFee(value, getUpdatedCasualFeeArr, allDataCasualFee, key, instalmentDates) {
//     if (value.length == 0) {
//         instalmentDates = [];
//     }
//     for (let i in value) {
//         if (allDataCasualFee.length > 0) {
//             for (let j in allDataCasualFee) {
//                 if (value[i] == allDataCasualFee[j].paymentOptionRefId) {
//                     if (allDataCasualFee[j].feesTypeRefId == key) {
//                         let object = {
//                             "subOptions": [],
//                             "feesTypeRefId": allDataCasualFee[j].feesTypeRefId,
//                             "paymentOptionRefId": allDataCasualFee[j].paymentOptionRefId,
//                             "paymentOptionId": allDataCasualFee[j].paymentOptionId
//                         }
//                         getUpdatedCasualFeeArr.push(object)
//                         break
//                     } else {
//                         if (value[i] == 5 || value[i] == 1) {
//                         } else {
//                             let object = {
//                                 "subOptions": [],
//                                 "feesTypeRefId": key,
//                                 "paymentOptionRefId": value[i],
//                                 "paymentOptionId": 0
//                             }
//                             getUpdatedCasualFeeArr.push(object)
//                             break
//                         }
//                     }
//                 } else {
//                     if (value[i] == 5 || value[i] == 1) {
//                     } else {
//                         let object = {
//                             "subOptions": [],
//                             "feesTypeRefId": key,
//                             "paymentOptionRefId": value[i],
//                             "paymentOptionId": 0
//                         }
//                         getUpdatedCasualFeeArr.push(object)
//                         break
//                     }
//                 }
//             }
//         } else {
//             if (value[i] == 5 || value[i] == 1) {
//             } else {
//                 let object = {
//                     "subOptions": [],
//                     "feesTypeRefId": key,
//                     "paymentOptionRefId": value[i],
//                     "paymentOptionId": 0,
//                 }
//                 getUpdatedCasualFeeArr.push(object)
//                 //break
//             }
//         }
//     }
//     return { getUpdatedCasualFeeArr, instalmentDates }
// }

// function getUpdatedCasualFee(value, getUpdatedCasualFeeArr, allDataCasualFee, key) {
//     for (let i in value) {
//         if (allDataCasualFee.length > 0) {
//             for (let j in allDataCasualFee) {
//                 if (value[i] == allDataCasualFee[j].paymentOptionRefId) {
//                     let object = {
//                         "subOptions": [],
//                         "feesTypeRefId": allDataCasualFee[j].feesTypeRefId,
//                         "paymentOptionRefId": allDataCasualFee[j].paymentOptionRefId,
//                         "paymentOptionId": allDataCasualFee[j].paymentOptionId
//                     }
//                     getUpdatedCasualFeeArr.push(object)
//                     break
//                 } else {
//                     if (value[i] == 1 || value[i] == 4 || value[i] == 8 || value[i] == 12) {
//                     } else {
//                         let object = {
//                             "subOptions": [],
//                             "feesTypeRefId": key,
//                             "paymentOptionRefId": value[i],
//                             "paymentOptionId": 0
//                         }
//                         getUpdatedCasualFeeArr.push(object)
//                         break
//                     }
//                 }
//             }
//         } else {
//             if (value[i] == 1 || value[i] == 4 || value[i] == 8 || value[i] == 12) {
//             } else {
//                 let object = {
//                     "subOptions": [],
//                     "feesTypeRefId": key,
//                     "paymentOptionRefId": value[i],
//                     "paymentOptionId": 0
//                 }
//                 getUpdatedCasualFeeArr.push(object)
//                 //break
//             }
//         }
//     }
//     return getUpdatedCasualFeeArr
// }

//// selected venues id for display
function checkSelectedVenue(details, venues) {
  let filteredVeneu = [];
  for (let i in venues) {
    for (let j in details) {
      if (venues[i].id == details[j].venueId) {
        filteredVeneu.push(venues[i].id);

        break;
      }
    }
  }
  return filteredVeneu;
}

//// check existing Venues
function checkExistingVenues(venuesArr, venueID) {
  let object = {
    status: false,
    result: [],
  };

  if (venuesArr) {
    for (let i in venuesArr) {
      if (venuesArr[i].venueId == venueID) {
        object = {
          status: true,
          result: venuesArr[i],
        };

        break;
      }
    }
  }

  return object;
}

/// Create velue list object and ids
function createVenuesList(venueList, selectedList, currentArray) {
  let postArr = [];
  for (let i in selectedList) {
    let selectedVenues = checkExistingVenues(currentArray, selectedList[i]);
    let venuesObject = null;

    if (selectedVenues.status == false) {
      venuesObject = {
        competitionVenueId: 0,
        venueId: selectedList[i],
      };
    } else {
      venuesObject = {
        competitionVenueId: selectedVenues.result.competitionVenueId,
        venueId: selectedList[i],
      };
    }

    postArr.push(venuesObject);
  }
  return postArr;
}

function setVenueForAffiliate(state, compVenues) {
  let creatorId = state.competitionCreator;
  let orgData = getOrganisationData() ? getOrganisationData() : null;
  let organisationUniqueKey = orgData ? orgData.organisationUniqueKey : 0;
  let isCreator = creatorId == organisationUniqueKey;
  if (!isCreator && compVenues) {
    state.venueList = compVenues.map(v => {
      return { id: v.venueId, name: v.name };
    });
  }
}

function checkSlectedInvitees(array) {
  let selected = [];
  if (array) {
    for (let i in array) {
      selected.push(array[i].registrationInviteesRefId);
    }
  }
  return selected;
}

function checkExistingInvitees(getInviteesArr, inviteesID) {
  let object = {
    status: false,
    result: [],
  };

  if (getInviteesArr) {
    for (let i in getInviteesArr) {
      if (getInviteesArr[i].registrationInviteesRefId == inviteesID) {
        object = {
          status: true,
          result: getInviteesArr[i],
        };

        break;
      }
    }
  }

  return object;
}

function checkCharity(charityID, defaultCharityArr) {
  let charity = {
    status: false,
    result: [],
  };

  for (let i in defaultCharityArr) {
    if (defaultCharityArr[i].charityRoundUpRefId == charityID) {
      charity = {
        status: true,
        result: defaultCharityArr[i],
      };
    }
  }
  return charity;
}

function checkVoucher(voucherId, defaultVoucher) {
  let vocuher = {
    status: false,
    result: [],
  };
  for (let i in defaultVoucher) {
    if (defaultVoucher[i].governmentVoucherRefId == voucherId) {
      vocuher = {
        status: true,
        result: defaultVoucher[i],
      };
    }
  }
  return vocuher;
}

function checkCharityArray(selectedArr, defaultCharityArr) {
  let slectedArray = [];
  let postCharityArr = [];
  let charityObj = null;
  for (let i in selectedArr) {
    if (selectedArr[i].isSelected) {
      slectedArray.push(selectedArr[i]);
    }
  }

  for (let i in slectedArray) {
    let charityObjectArray = checkCharity(slectedArray[i].id, defaultCharityArr);
    if (charityObjectArray.status) {
      charityObj = {
        charityRoundUpId: charityObjectArray.result.charityRoundUpId,
        charityRoundUpRefId: slectedArray[i].id,
        charityRoundUpDescription: '',
        charityRoundUpName: '',
      };
    } else {
      charityObj = {
        charityRoundUpId: 0,
        charityRoundUpRefId: slectedArray[i].id,
        charityRoundUpDescription: '',
        charityRoundUpName: '',
      };
    }
    postCharityArr.push(charityObj);
  }
  return postCharityArr;
}

function checkVoucherArray(voucherArr, defaultGovtVoucher) {
  let selectedArray = [];
  let postVoucherArr = [];
  let charityObj = null;
  for (let i in voucherArr) {
    if (voucherArr[i].isSelected) {
      selectedArray.push(voucherArr[i]);
    }
  }

  for (let i in selectedArray) {
    let voucherObjectArray = checkVoucher(selectedArray[i].id, defaultGovtVoucher);
    if (voucherObjectArray.status) {
      charityObj = {
        competitionGovernmentVoucherId: voucherObjectArray.result.competitionGovernmentVoucherId,
        governmentVoucherRefId: selectedArray[i].id,
      };
    } else {
      charityObj = {
        competitionGovernmentVoucherId: 0,
        governmentVoucherRefId: selectedArray[i].id,
      };
    }
    postVoucherArr.push(charityObj);
  }

  return postVoucherArr;
}

// function createInviteesPostArray(selectedInvitees, getInvitees) {
//     let invitessObjectArr = []
//     for (let i in selectedInvitees) {
//         // let selectedInviteesArray = checkExistingInvitees(getInvitees, selectedInvitees[i])
//         let inviteesObject = null
//         // if (selectedInviteesArray.status) {
//         inviteesObject = {
//             "inviteesId": isArrayNotEmpty(getInvitees) ? getInvitees[i].inviteesId : 0,
//             "registrationInviteesRefId": selectedInvitees[i],
//             "inviteesOrg": isArrayNotEmpty(getInvitees) ? getInvitees[i].inviteesOrg : []
//         }
//         // } else {
//         //     inviteesObject = {
//         //         "inviteesId": 0,
//         //         "registrationInviteesRefId": selectedInvitees[i]
//         //     }
//         // }

//         invitessObjectArr.push(inviteesObject)
//     }
//     return invitessObjectArr
// }

function removeDirect(affiliateArray) {
  if (affiliateArray != null && affiliateArray.length > 0) {
    return affiliateArray.filter(x => x.registrationInviteesRefId != 5);
  }
}

function createInviteesPostArray(selectedInvitees, getInvitees) {
  let invitessObjectArr = [];
  if (isArrayNotEmpty(getInvitees)) {
    // for (let i in getInvitees) {
    let selectedInviteesArray = checkExistingInvitees(getInvitees, selectedInvitees);
    let inviteesObject = null;
    if (selectedInviteesArray.status) {
      inviteesObject = {
        inviteesId: selectedInviteesArray.result.inviteesId,
        registrationInviteesRefId: selectedInvitees,
        inviteesOrg: isArrayNotEmpty(selectedInviteesArray.result.inviteesOrg)
          ? selectedInviteesArray.result.inviteesOrg
          : [],
      };
    } else {
      inviteesObject = {
        inviteesId: 0,
        registrationInviteesRefId: selectedInvitees,
        inviteesOrg: [],
      };
    }

    invitessObjectArr.push(inviteesObject);
    // }
  } else {
    let invitees_Object = {
      inviteesId: 0,
      registrationInviteesRefId: selectedInvitees,
      inviteesOrg: [],
    };
    invitessObjectArr.push(invitees_Object);
  }
  return invitessObjectArr;
}

function checkOrgKeysSelection(key, orgArray) {
  let object = {
    status: false,
    result: null,
  };
  for (let i in orgArray) {
    if (orgArray[i].organisationUniqueKey == key) {
      object = {
        status: true,
        result: orgArray[i],
      };
      break;
    }
  }

  return object;
}

function createInviteesOrgArray(selectedInvitees, orgKeys) {
  let invitessObjectArr = [];
  let requiredObject = {
    competitionInviteesOrgId: 0,
    organisationUniqueKey: null,
  };
  let orgArray = isArrayNotEmpty(selectedInvitees) ? selectedInvitees : [];
  for (let i in orgKeys) {
    let details = checkOrgKeysSelection(orgKeys[i], orgArray);
    if (details.status) {
      requiredObject = {
        competitionInviteesOrgId: details.result.competitionInviteesOrgId,
        organisationUniqueKey: details.result.organisationUniqueKey,
      };
    } else {
      requiredObject = {
        competitionInviteesOrgId: 0,
        organisationUniqueKey: orgKeys[i],
      };
    }
    invitessObjectArr.push(requiredObject);
  }

  return invitessObjectArr;
}

// function getAffiliateOrgSelectedArr(invitees) {
//     let orgInvitees = isArrayNotEmpty(invitees) ? invitees[0].inviteesOrg : []
//     let slectedAffilitesArray = []
//     for (let i in orgInvitees) {
//         slectedAffilitesArray.push(orgInvitees[i].organisationUniqueKey)
//     }
//     return slectedAffilitesArray
// }

function getAffiliateOrgSelectedArr(invitees, id) {
  let slectedAffilitesArray = [];
  let selecetdOrgArray = [];
  for (let j in invitees) {
    if (invitees[j].registrationInviteesRefId == id) {
      let orgInvitees = isArrayNotEmpty(invitees[j].inviteesOrg) ? invitees[j].inviteesOrg : [];

      for (let i in orgInvitees) {
        slectedAffilitesArray.push(orgInvitees[i].organisationUniqueKey);
        let object = {
          competitionInviteesOrgId: orgInvitees[i].competitionInviteesOrgId,
          organisationUniqueKey: orgInvitees[i].organisationUniqueKey,
        };
        selecetdOrgArray.push(object);
      }

      break;
    }
  }
  return { slectedAffilitesArray, selecetdOrgArray };
}

function getMemberShipProductTypes(key, productsArr) {
  let productTypes = [];
  for (let i in productsArr) {
    if (productsArr[i].membershipProductUniqueKey === key) {
      productTypes = productsArr[i].membershipProductTypes;
    }
  }
  return productTypes;
}

function checkFeeDivisionType(data, uniqueKey) {
  let array = [];
  for (let i in data) {
    if (data[i].membershipProductUniqueKey == uniqueKey) {
      array = data[i].fees;
    }
  }
  return array;
}

function checkStatus(getCompetitionFeeArray, item, divisionId, feeTypeRefId) {
  let object = {
    status: false,
    result: [],
  };
  for (let i in getCompetitionFeeArray) {
    if (
      getCompetitionFeeArray[i].competitionMembershipProductTypeId ==
        item.competitionMembershipProductTypeId &&
      getCompetitionFeeArray[i].feeTypeRefId == feeTypeRefId &&
      (item.isPlaying == 0 ||
        getCompetitionFeeArray[i].competitionMembershipProductDivisionId == divisionId)
    ) {
      object = {
        status: true,
        result: getCompetitionFeeArray[i],
      };
      break;
    }
  }

  return object;
}

function removeDuplicacyInFeeArray(feeArray) {
  let feesProductArray = feeArray;
  for (let i in feeArray) {
    let feesList = isArrayNotEmpty(feeArray[i].fees) ? feeArray[i].fees : [];
    const filteredArr = feesList.reduce((acc, current) => {
      const x = acc.find(item => {
        return (
          item.competitionMembershipProductTypeId === current.competitionMembershipProductTypeId &&
          item.competitionMembershipProductDivisionId ===
            current.competitionMembershipProductDivisionId &&
          item.feeTypeRefId === current.feeTypeRefId &&
          item.organisationId === current.organisationId
        );
      });

      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

    feesProductArray[i].fees = filteredArr;
  }
  return feesProductArray;
}

function childFeesMapping(getFeeData) {
  let mainFeeArray = getFeeData;
  for (let i in mainFeeArray) {
    let parentFeesList = isArrayNotEmpty(mainFeeArray[i].fees) ? mainFeeArray[i].fees : [];
    let childrenFeesList = isArrayNotEmpty(mainFeeArray[i].childFees)
      ? isArrayNotEmpty(mainFeeArray[i].childFees)
        ? mainFeeArray[i].childFees
        : []
      : [];
    let childFeeLength = childrenFeesList.length;
    let parentFeeLength = parentFeesList.length;
    let childFeeMathching = childFeeLength == parentFeeLength;

    childrenFeesList.forEach((childItem, childIndex) => {
      childItem['affiliateFee'] = childItem.Fees;
      childItem['affiliateGst'] = childItem.GST;
      childItem['affNominationFees'] = childItem.nominationFees;
      childItem['affNominationGST'] = childItem.nominationGST;

      let parentFee = parentFeesList[childIndex];
      if (!childFeeMathching) {
        parentFee = parentFeesList.find(
          x =>
            x.competitionMembershipProductDivisionId ==
              childItem.competitionMembershipProductDivisionId &&
            x.competitionMembershipProductTypeId == childItem.competitionMembershipProductTypeId &&
            x.feeTypeRefId == childItem.feeTypeRefId,
        );
      }
      if (parentFee) {
        childItem['nominationFees'] = parentFee.nominationFees;
        childItem['nominationGST'] = parentFee.nominationGST;
        childItem['Fees'] = parentFee.Fees;
        childItem['GST'] = parentFee.GST;
        childItem['feeTypeRefId'] = parentFee.feeTypeRefId;
        childItem['competitionMembershipProductDivisionId'] =
          parentFee.competitionMembershipProductDivisionId;
        childItem['teamRegChargeTypeRefId'] = parentFee.teamRegChargeTypeRefId;
        childItem.individualChargeTypeRefId = parentFee.individualChargeTypeRefId;
      }
    });
    mainFeeArray[i].fees = mainFeeArray[i].childFees;
  }
  return mainFeeArray;
}

/////get the all total fees
function getTotalFees(feesOwner, data, mFees) {
  let totalFees = 0;
  let dataFees = data.Fees ? Number(data.Fees) : 0;
  let dataGst = data.GST ? Number(data.GST) : 0;
  let dataAffiliateFees = data.affiliateFee == null ? 0 : Number(data.affiliateFee);
  let dataAffiliateGst = data.affiliateGst == null ? 0 : Number(data.affiliateGst);
  let nomFees = data.nominationFees ? Number(data.nominationFees) : 0;
  let nomGst = data.nominationGST ? Number(data.nominationGST) : 0;
  let nomAffiliateFees = data.affNominationFees == null ? 0 : Number(data.affNominationFees);
  let nomAffiliateGst = data.affNominationGST == null ? 0 : Number(data.affNominationGST);

  if (!feesOwner) {
    totalFees =
      dataFees +
      dataGst +
      dataAffiliateFees +
      dataAffiliateGst +
      mFees +
      nomFees +
      nomGst +
      nomAffiliateFees +
      nomAffiliateGst;
    return totalFees.toFixed(2);
  } else {
    totalFees = dataFees + dataGst + mFees + nomFees + nomGst;
    return totalFees.toFixed(2);
  }
}

///// check Fee Type ----

function checkFeeType(feeArray) {
  for (let i in feeArray) {
    if (feeArray[i].checkBoxOption == null || feeArray[i].checkBoxOption == 1) {
      return true;
    }
  }
  return false;
}

function checkTeamChargeType(feeArray) {
  for (let i in feeArray) {
    if (feeArray[i].teamRegChargeTypeRefId == 1) {
      return 1;
    } else {
      return feeArray[i].teamRegChargeTypeRefId;
    }
  }
}

///// check Fee Type ----

function checkIsDivisionAllType(productArray) {
  let filteredArr = productArray.find(x => x.competitionMembershipProductDivisionId != null);
  return filteredArr;
  // for (let i in productArray) {
  //     if(productArray[i].isPlaying == 1){
  //         if (productArray[i].competitionMembershipProductDivisionId == null) {
  //             return null
  //         } else {
  //             return productArray[i].competitionMembershipProductDivisionId
  //         }
  //     }
  //     else{

  //     }

  // }
}

function setTeamInitFee(isPlaying, statusteamSeasonal) {
  if (isPlaying) {
    if (!statusteamSeasonal.result.Fees) {
      statusteamSeasonal.result.Fees = 0;
    }
    if (!statusteamSeasonal.result.GST) {
      statusteamSeasonal.result.GST = 0;
    }
    if (!statusteamSeasonal.result.nominationFees) {
      statusteamSeasonal.result.nominationFees = 0;
    }
    if (!statusteamSeasonal.result.nominationGST) {
      statusteamSeasonal.result.nominationGST = 0;
    }
  }
}

/// create product array

function createProductFeeArr(data) {
  var getFeeData = isArrayNotEmpty(data.competitionfees) ? data.competitionfees : [];
  // let creatorId = data.competitiondetail.competitionCreator
  // let userId = getUserId();
  let creatorId = data.competitiondetail.competitionCreatorOrgUniqueKey;
  // let statusRefId = data.competitiondetail.statusRefId;
  let orgData = getOrganisationData();
  let organisationUniqueKey = orgData ? orgData.organisationUniqueKey : 0;
  let feesOwner = creatorId !== organisationUniqueKey ? false : true;
  if (!feesOwner) {
    let childFeesMappedArray = isArrayNotEmpty(data.competitionfees)
      ? childFeesMapping(data.competitionfees)
      : [];
    getFeeData = childFeesMappedArray;
  }

  let product = data.competitionmembershipproduct.membershipProducts;
  let divisions = data.competitiondivisions.competitionFeeDivision;

  let removeDuplicacyFeeArray = removeDuplicacyInFeeArray(getFeeData);
  getFeeData = removeDuplicacyFeeArray;

  let productArray = [];
  for (let i in divisions) {
    let tempDivisionArray = checkFeeDivisionType(
      getFeeData,
      divisions[i].membershipProductUniqueKey,
    );
    let getDivisionsArray = isArrayNotEmpty(tempDivisionArray) ? tempDivisionArray : [];

    let memberShipProductType = getMemberShipProductTypes(
      divisions[i].membershipProductUniqueKey,
      product,
    );
    let alltypeArraySeasonal = [];
    let perTypeArraySeasonal = [];
    let alltypeArrayCasual = [];
    let perTypeArrayCasual = [];
    let allTypeTeamArraySeasonal = [];
    let allTypeTeamArrayCasual = [];
    let perTypeTeamArraySeasonal = [];
    let perTypeTeamArrayCasual = [];

    for (let j in memberShipProductType) {
      let statusSeasonal = checkStatus(getDivisionsArray, memberShipProductType[j], null, 2);
      let statusCasual = checkStatus(getDivisionsArray, memberShipProductType[j], null, 1);
      let statusteamSeasonal = checkStatus(getDivisionsArray, memberShipProductType[j], null, 3);
      let statusTeamCasual = checkStatus(getDivisionsArray, memberShipProductType[j], null, 4);
      let type_Object_casual = null;
      let type_Object_seasonal = null;
      let type_object_team_seasonal = null;
      let type_object_team_casual = null;
      let isPlaying = memberShipProductType[j].isPlaying == 1;
      ////// CASUAL OBJECT
      let membershipCasual = getMembershipFeeSum(memberShipProductType[j], 'mCasualFee');
      let membershipCasualGst = getMembershipFeeSum(memberShipProductType[j], 'mCasualGst');
      let mFeesCasual = Number(membershipCasual) + Number(membershipCasualGst);
      if (statusCasual.status) {
        type_Object_casual = {
          competitionMembershipProductFeeId: statusCasual.result.competitionMembershipProductFeeId,
          competitionMembershipProductTypeId:
            statusCasual.result.competitionMembershipProductTypeId,
          competitionMembershipProductDivisionId: null,
          fee: statusCasual.result.Fees,
          gst: statusCasual.result.GST,
          affiliateFee: statusCasual.result.affiliateFee ? statusCasual.result.affiliateFee : 0,
          affiliateGst: statusCasual.result.affiliateGst ? statusCasual.result.affiliateGst : 0,
          nominationFees: null,
          nominationGST: null,
          affNominationFees: null,
          affNominationGST: null,
          feeTypeRefId: statusCasual.result.feeTypeRefId,
          membershipProductTypeName: memberShipProductType[j].membershipProductTypeName,
          membershipProductUniqueKey: divisions[i].membershipProductUniqueKey,
          total: getTotalFees(feesOwner, statusCasual.result, mFeesCasual),
          mFees: mFeesCasual,
          membershipCasual: membershipCasual,
          membershipGst: membershipCasualGst,
          checkBoxOption: statusCasual.result.isCasual,
          isPlayer: memberShipProductType[j].isPlaying,
        };
      } else {
        type_Object_casual = {
          competitionMembershipProductFeeId: 0,
          competitionMembershipProductTypeId:
            memberShipProductType[j].competitionMembershipProductTypeId,
          competitionMembershipProductDivisionId: null,
          fee: 0,
          gst: 0,
          affiliateFee: 0,
          affiliateGst: 0,
          nominationFees: null,
          nominationGST: null,
          affNominationFees: null,
          affNominationGST: null,
          feeTypeRefId: 1,
          membershipProductTypeName: memberShipProductType[j].membershipProductTypeName,
          membershipProductUniqueKey: divisions[i].membershipProductUniqueKey,
          total: null,
          mFees: mFeesCasual,
          membershipCasual: membershipCasual,
          membershipGst: membershipCasualGst,
          checkBoxOption: 0, //statusRefId == 1 ? 1 : 0,
          isPlayer: memberShipProductType[j].isPlaying,
        };
      }

      let membershipSeasonal = getMembershipFeeSum(memberShipProductType[j], 'mSeasonalFee');
      let membershipGst = getMembershipFeeSum(memberShipProductType[j], 'mSeasonalGst');
      let mFeesSeasonal = Number(membershipSeasonal) + Number(membershipGst);
      //// SEASONAL OBJECT
      if (statusSeasonal.status) {
        type_Object_seasonal = {
          competitionMembershipProductFeeId:
            statusSeasonal.result.competitionMembershipProductFeeId,
          competitionMembershipProductTypeId:
            memberShipProductType[j].competitionMembershipProductTypeId,
          competitionMembershipProductDivisionId: null,
          fee: statusSeasonal.result.Fees,
          gst: statusSeasonal.result.GST,
          affiliateFee: statusSeasonal.result.affiliateFee ? statusSeasonal.result.affiliateFee : 0,
          affiliateGst: statusSeasonal.result.affiliateGst ? statusSeasonal.result.affiliateGst : 0,
          nominationFees:
            memberShipProductType[j].isPlaying == 1 ? statusSeasonal.result.nominationFees : null,
          nominationGST:
            memberShipProductType[j].isPlaying == 1 ? statusSeasonal.result.nominationGST : null,
          affNominationFees:
            memberShipProductType[j].isPlaying == 1
              ? statusSeasonal.result.affNominationFees
                ? statusSeasonal.result.affNominationFees
                : 0
              : null,
          affNominationGST:
            memberShipProductType[j].isPlaying == 1
              ? statusSeasonal.result.affNominationGST
                ? statusSeasonal.result.affNominationGST
                : 0
              : null,
          feeTypeRefId: statusSeasonal.result.feeTypeRefId,
          membershipProductTypeName: memberShipProductType[j].membershipProductTypeName,
          membershipProductUniqueKey: divisions[i].membershipProductUniqueKey,
          total: getTotalFees(feesOwner, statusSeasonal.result, mFeesSeasonal),
          mFees: mFeesSeasonal,
          membershipSeasonal: membershipSeasonal,
          membershipGst: membershipGst,
          checkBoxOption: statusSeasonal.result.isSeasonal,
          individualChargeTypeRefId: statusSeasonal.result.individualChargeTypeRefId,
          isPlayer: memberShipProductType[j].isPlaying,
        };
      } else {
        type_Object_seasonal = {
          competitionMembershipProductFeeId: 0,
          competitionMembershipProductTypeId:
            memberShipProductType[j].competitionMembershipProductTypeId,
          competitionMembershipProductDivisionId: null,
          fee: 0,
          gst: 0,
          affiliateFee: 0,
          affiliateGst: 0,
          nominationFees: memberShipProductType[j].isPlaying == 1 ? 0 : null,
          nominationGST: memberShipProductType[j].isPlaying == 1 ? 0 : null,
          affNominationFees: memberShipProductType[j].isPlaying == 1 ? 0 : null,
          affNominationGST: memberShipProductType[j].isPlaying == 1 ? 0 : null,
          feeTypeRefId: 2,
          membershipProductTypeName: memberShipProductType[j].membershipProductTypeName,
          membershipProductUniqueKey: divisions[i].membershipProductUniqueKey,
          total: null,
          mFees: mFeesSeasonal,
          membershipSeasonal: membershipSeasonal,
          membershipGst: membershipGst,
          checkBoxOption: 0, //statusRefId == 1 ? 1 : 0
          individualChargeTypeRefId: 1,
          isPlayer: memberShipProductType[j].isPlaying,
        };
      }

      //// SEASONAL and Casual OBJECT Team
      if (
        memberShipProductType[j].allowTeamRegistrationTypeRefId == 1 ||
        memberShipProductType[j].allowTeamRegistrationTypeRefId == 2
      ) {
        if (statusteamSeasonal.status) {
          setTeamInitFee(isPlaying, statusteamSeasonal);
          type_object_team_seasonal = {
            competitionMembershipProductFeeId:
              statusteamSeasonal.result.competitionMembershipProductFeeId,
            competitionMembershipProductTypeId:
              memberShipProductType[j].competitionMembershipProductTypeId,
            competitionMembershipProductDivisionId: null,
            fee: memberShipProductType[j].isPlaying == 1 ? statusteamSeasonal.result.Fees : null,
            gst: memberShipProductType[j].isPlaying == 1 ? statusteamSeasonal.result.GST : null,
            affiliateFee:
              memberShipProductType[j].isPlaying == 1
                ? statusteamSeasonal.result.affiliateFee
                  ? statusteamSeasonal.result.affiliateFee
                  : 0
                : null,
            affiliateGst:
              memberShipProductType[j].isPlaying == 1
                ? statusteamSeasonal.result.affiliateGst
                  ? statusteamSeasonal.result.affiliateGst
                  : 0
                : null,
            nominationFees:
              memberShipProductType[j].isPlaying == 1
                ? statusteamSeasonal.result.nominationFees
                : null,
            nominationGST:
              memberShipProductType[j].isPlaying == 1
                ? statusteamSeasonal.result.nominationGST
                : null,
            affNominationFees:
              memberShipProductType[j].isPlaying == 1
                ? statusteamSeasonal.result.affNominationFees
                  ? statusteamSeasonal.result.affNominationFees
                  : 0
                : null,
            affNominationGST:
              memberShipProductType[j].isPlaying == 1
                ? statusteamSeasonal.result.affNominationGST
                  ? statusteamSeasonal.result.affNominationGST
                  : 0
                : null,
            feeTypeRefId: statusteamSeasonal.result.feeTypeRefId,
            membershipProductTypeName: memberShipProductType[j].membershipProductTypeName,
            membershipProductUniqueKey: divisions[i].membershipProductUniqueKey,
            total: getTotalFees(feesOwner, statusteamSeasonal.result, mFeesSeasonal),
            mFees: mFeesSeasonal,
            membershipSeasonal: membershipSeasonal,
            membershipGst: membershipGst,
            checkBoxOption: statusteamSeasonal.result.isTeamSeasonal,
            teamRegChargeTypeRefId: statusteamSeasonal.result.teamRegChargeTypeRefId,
            individualChargeTypeRefId: statusteamSeasonal.result.individualChargeTypeRefId,
            isPlayer: memberShipProductType[j].isPlaying,
            allowTeamRegistrationTypeRefId: memberShipProductType[j].allowTeamRegistrationTypeRefId,
            membershipCasual: membershipCasual,
            membershipCasualGst: membershipCasualGst,
          };
        } else {
          type_object_team_seasonal = {
            competitionMembershipProductFeeId: 0,
            competitionMembershipProductTypeId:
              memberShipProductType[j].competitionMembershipProductTypeId,
            competitionMembershipProductDivisionId: null,
            fee: memberShipProductType[j].isPlaying == 1 ? 0 : null,
            gst: memberShipProductType[j].isPlaying == 1 ? 0 : null,
            affiliateFee: memberShipProductType[j].isPlaying == 1 ? 0 : null,
            affiliateGst: memberShipProductType[j].isPlaying == 1 ? 0 : null,
            nominationFees: memberShipProductType[j].isPlaying == 1 ? 0 : null,
            nominationGST: memberShipProductType[j].isPlaying == 1 ? 0 : null,
            affNominationFees: memberShipProductType[j].isPlaying == 1 ? 0 : null,
            affNominationGST: memberShipProductType[j].isPlaying == 1 ? 0 : null,
            feeTypeRefId: 3,
            membershipProductTypeName: memberShipProductType[j].membershipProductTypeName,
            membershipProductUniqueKey: divisions[i].membershipProductUniqueKey,
            total: null,
            mFees: mFeesSeasonal,
            membershipSeasonal: membershipSeasonal,
            membershipGst: membershipGst,
            checkBoxOption: 0, //statusRefId == 1 ? 1 : 0,
            teamRegChargeTypeRefId: null, // 1,
            individualChargeTypeRefId: 1,
            isPlayer: memberShipProductType[j].isPlaying,
            allowTeamRegistrationTypeRefId: memberShipProductType[j].allowTeamRegistrationTypeRefId,
            membershipCasual: membershipCasual,
            membershipCasualGst: membershipCasualGst,
          };
        }

        if (statusTeamCasual.status) {
          let mFeesCasual =
            Number(memberShipProductType[j].mCasualFee) +
            Number(memberShipProductType[j].mCasualGst);
          setTeamInitFee(isPlaying, statusTeamCasual);
          type_object_team_casual = {
            competitionMembershipProductFeeId:
              statusTeamCasual.result.competitionMembershipProductFeeId,
            competitionMembershipProductTypeId:
              memberShipProductType[j].competitionMembershipProductTypeId,
            competitionMembershipProductDivisionId: null,
            fee: memberShipProductType[j].isPlaying == 1 ? statusTeamCasual.result.Fees : null,
            gst: memberShipProductType[j].isPlaying == 1 ? statusTeamCasual.result.GST : null,
            affiliateFee:
              memberShipProductType[j].isPlaying == 1
                ? statusTeamCasual.result.affiliateFee
                  ? statusTeamCasual.result.affiliateFee
                  : 0
                : null,
            affiliateGst:
              memberShipProductType[j].isPlaying == 1
                ? statusTeamCasual.result.affiliateGst
                  ? statusTeamCasual.result.affiliateGst
                  : 0
                : null,
            nominationFees:
              memberShipProductType[j].isPlaying == 1
                ? statusTeamCasual.result.nominationFees
                : null,
            nominationGST:
              memberShipProductType[j].isPlaying == 1
                ? statusTeamCasual.result.nominationGST
                : null,
            affNominationFees:
              memberShipProductType[j].isPlaying == 1
                ? statusTeamCasual.result.affNominationFees
                  ? statusTeamCasual.result.affNominationFees
                  : 0
                : null,
            affNominationGST:
              memberShipProductType[j].isPlaying == 1
                ? statusTeamCasual.result.affNominationGST
                  ? statusTeamCasual.result.affNominationGST
                  : 0
                : null,
            feeTypeRefId: statusTeamCasual.result.feeTypeRefId,
            membershipProductTypeName: memberShipProductType[j].membershipProductTypeName,
            membershipProductUniqueKey: divisions[i].membershipProductUniqueKey,
            total: getTotalFees(feesOwner, statusTeamCasual.result, mFeesCasual),
            mFees: mFeesCasual,
            membershipCasual: membershipCasual,
            membershipGst: membershipCasualGst,
            checkBoxOption: statusTeamCasual.result.isTeamCasual,
            isPlayer: memberShipProductType[j].isPlaying,
          };
        } else {
          type_object_team_casual = {
            competitionMembershipProductFeeId: 0,
            competitionMembershipProductTypeId:
              memberShipProductType[j].competitionMembershipProductTypeId,
            competitionMembershipProductDivisionId: null,
            fee: memberShipProductType[j].isPlaying == 1 ? 0 : null,
            gst: memberShipProductType[j].isPlaying == 1 ? 0 : null,
            affiliateFee: memberShipProductType[j].isPlaying == 1 ? 0 : null,
            affiliateGst: memberShipProductType[j].isPlaying == 1 ? 0 : null,
            nominationFees: memberShipProductType[j].isPlaying == 1 ? 0 : null,
            nominationGST: memberShipProductType[j].isPlaying == 1 ? 0 : null,
            affNominationFees: memberShipProductType[j].isPlaying == 1 ? 0 : null,
            affNominationGST: memberShipProductType[j].isPlaying == 1 ? 0 : null,
            feeTypeRefId: 4,
            membershipProductTypeName: memberShipProductType[j].membershipProductTypeName,
            membershipProductUniqueKey: divisions[i].membershipProductUniqueKey,
            total: null,
            mFees: mFeesCasual,
            membershipCasual: membershipCasual,
            membershipGst: membershipCasualGst,
            checkBoxOption: 0, // statusRefId == 1 ? 1 : 0
            isPlayer: memberShipProductType[j].isPlaying,
          };
        }

        allTypeTeamArraySeasonal.push(type_object_team_seasonal);
        allTypeTeamArrayCasual.push(type_object_team_casual);
      }

      alltypeArraySeasonal.push(type_Object_seasonal);
      alltypeArrayCasual.push(type_Object_casual);
    }

    let divisionProductType = divisions[i].divisions;
    for (let j in divisionProductType) {
      for (let k in memberShipProductType) {
        let statusSeasonal = checkStatus(
          getDivisionsArray,
          memberShipProductType[k],
          divisionProductType[j].competitionMembershipProductDivisionId,
          2,
        );
        let statusCasual = checkStatus(
          getDivisionsArray,
          memberShipProductType[k],
          divisionProductType[j].competitionMembershipProductDivisionId,
          1,
        );
        let statusTeamSeasonal = checkStatus(
          getDivisionsArray,
          memberShipProductType[k],
          divisionProductType[j].competitionMembershipProductDivisionId,
          3,
        );
        let statusTeamCasual = checkStatus(
          getDivisionsArray,
          memberShipProductType[k],
          divisionProductType[j].competitionMembershipProductDivisionId,
          4,
        );
        let type_Object_casual = null;
        let type_Object_seasonal = null;
        let type_object_team_seasonal = null;
        let type_object_team_casual = null;
        let isPlaying = memberShipProductType[k].isPlaying == 1;
        let membershipCasual = getMembershipFeeSum(memberShipProductType[k], 'mCasualFee');
        let membershipCasualGst = getMembershipFeeSum(memberShipProductType[k], 'mCasualGst');
        let mFeesCasual = Number(membershipCasual) + Number(membershipCasualGst);
        ///// CASUAL TYPE -  DIVIVSION
        if (statusCasual.status) {
          type_Object_casual = {
            competitionMembershipProductFeeId:
              statusCasual.result.competitionMembershipProductFeeId,
            competitionMembershipProductTypeId:
              memberShipProductType[k].competitionMembershipProductTypeId,
            competitionMembershipProductDivisionId:
              divisionProductType[j].competitionMembershipProductDivisionId,
            fee: statusCasual.result.Fees,
            gst: statusCasual.result.GST,
            affiliateFee: statusCasual.result.affiliateFee ? statusCasual.result.affiliateFee : 0,
            affiliateGst: statusCasual.result.affiliateGst ? statusCasual.result.affiliateGst : 0,
            nominationFees: null,
            nominationGST: null,
            affNominationFees: null,
            affNominationGST: null,
            feeTypeRefId: 1,
            membershipProductTypeName: memberShipProductType[k].membershipProductTypeName,
            divisionName:
              memberShipProductType[k].isPlaying == 1 ? divisionProductType[j].divisionName : 'N/A',
            membershipProductUniqueKey: divisions[i].membershipProductUniqueKey,
            total: getTotalFees(feesOwner, statusCasual.result, mFeesCasual),
            mFees: mFeesCasual,
            membershipCasual: membershipCasual,
            membershipGst: membershipCasualGst,
            checkBoxOption: statusCasual.result.isCasual,
            isPlayer: memberShipProductType[k].isPlaying,
          };
        } else {
          type_Object_casual = {
            competitionMembershipProductFeeId: 0,
            competitionMembershipProductTypeId:
              memberShipProductType[k].competitionMembershipProductTypeId,
            competitionMembershipProductDivisionId:
              divisionProductType[j].competitionMembershipProductDivisionId,
            fee: 0,
            gst: 0,
            affiliateFee: 0,
            affiliateGst: 0,
            nominationFees: null,
            nominationGST: null,
            affNominationFees: null,
            affNominationGST: null,
            feeTypeRefId: 1,
            membershipProductTypeName: memberShipProductType[k].membershipProductTypeName,
            divisionName:
              memberShipProductType[k].isPlaying == 1 ? divisionProductType[j].divisionName : 'N/A',
            membershipProductUniqueKey: divisions[i].membershipProductUniqueKey,
            total: null,
            mFees: mFeesCasual,
            membershipCasual: membershipCasual,
            membershipGst: membershipCasualGst,
            checkBoxOption: 0, //statusRefId == 1 ? 1 : 0
            isPlayer: memberShipProductType[k].isPlaying,
          };
        }

        let membershipSeasonal = getMembershipFeeSum(memberShipProductType[k], 'mSeasonalFee');
        let membershipGst = getMembershipFeeSum(memberShipProductType[k], 'mSeasonalGst');
        let mFeesSeasonal = Number(membershipSeasonal) + Number(membershipGst);
        if (statusSeasonal.status) {
          type_Object_seasonal = {
            competitionMembershipProductFeeId:
              statusSeasonal.result.competitionMembershipProductFeeId,
            competitionMembershipProductTypeId:
              memberShipProductType[k].competitionMembershipProductTypeId,
            competitionMembershipProductDivisionId:
              divisionProductType[j].competitionMembershipProductDivisionId,
            fee: statusSeasonal.result.Fees,
            gst: statusSeasonal.result.GST,
            affiliateFee: statusSeasonal.result.affiliateFee
              ? statusSeasonal.result.affiliateFee
              : 0,
            affiliateGst: statusSeasonal.result.affiliateGst
              ? statusSeasonal.result.affiliateGst
              : 0,
            nominationFees:
              memberShipProductType[k].isPlaying == 1 ? statusSeasonal.result.nominationFees : null,
            nominationGST:
              memberShipProductType[k].isPlaying == 1 ? statusSeasonal.result.nominationGST : null,
            affNominationFees:
              memberShipProductType[k].isPlaying == 1
                ? statusSeasonal.result.affNominationFees
                  ? statusSeasonal.result.affNominationFees
                  : 0
                : null,
            affNominationGST:
              memberShipProductType[k].isPlaying == 1
                ? statusSeasonal.result.affNominationGST
                  ? statusSeasonal.result.affNominationGST
                  : 0
                : null,
            feeTypeRefId: 2,
            membershipProductTypeName: memberShipProductType[k].membershipProductTypeName,
            divisionName:
              memberShipProductType[k].isPlaying == 1 ? divisionProductType[j].divisionName : 'N/A',
            membershipProductUniqueKey: divisions[i].membershipProductUniqueKey,
            total: getTotalFees(feesOwner, statusSeasonal.result, mFeesSeasonal),
            mFees: mFeesSeasonal,
            membershipSeasonal: membershipSeasonal,
            membershipGst: membershipGst,
            checkBoxOption: statusSeasonal.result.isSeasonal,
            individualChargeTypeRefId: statusSeasonal.result.individualChargeTypeRefId,
            isPlayer: memberShipProductType[k].isPlaying,
          };
        } else {
          type_Object_seasonal = {
            competitionMembershipProductFeeId: 0,
            competitionMembershipProductTypeId:
              memberShipProductType[k].competitionMembershipProductTypeId,
            competitionMembershipProductDivisionId:
              divisionProductType[j].competitionMembershipProductDivisionId,
            fee: 0,
            gst: 0,
            affiliateFee: 0,
            affiliateGst: 0,
            nominationFees: memberShipProductType[k].isPlaying == 1 ? 0 : null,
            nominationGST: memberShipProductType[k].isPlaying == 1 ? 0 : null,
            affNominationFees: memberShipProductType[k].isPlaying == 1 ? 0 : null,
            affNominationGST: memberShipProductType[k].isPlaying == 1 ? 0 : null,
            feeTypeRefId: 2,
            membershipProductTypeName: memberShipProductType[k].membershipProductTypeName,
            divisionName:
              memberShipProductType[k].isPlaying == 1 ? divisionProductType[j].divisionName : 'N/A',
            membershipProductUniqueKey: divisions[i].membershipProductUniqueKey,
            total: null,
            mFees: mFeesSeasonal,
            membershipSeasonal: membershipSeasonal,
            membershipGst: membershipGst,
            checkBoxOption: 0, //statusRefId == 1 ? 1 : 0
            individualChargeTypeRefId: 1,
            isPlayer: memberShipProductType[k].isPlaying,
          };
        }

        if (
          memberShipProductType[k].allowTeamRegistrationTypeRefId == 1 ||
          memberShipProductType[k].allowTeamRegistrationTypeRefId == 2
        ) {
          if (statusTeamSeasonal.status) {
            setTeamInitFee(isPlaying, statusTeamSeasonal);
            type_object_team_seasonal = {
              competitionMembershipProductFeeId:
                statusTeamSeasonal.result.competitionMembershipProductFeeId,
              competitionMembershipProductTypeId:
                memberShipProductType[k].competitionMembershipProductTypeId,
              competitionMembershipProductDivisionId:
                divisionProductType[j].competitionMembershipProductDivisionId,
              fee: memberShipProductType[k].isPlaying == 1 ? statusTeamSeasonal.result.Fees : null,
              gst: memberShipProductType[k].isPlaying == 1 ? statusTeamSeasonal.result.GST : null,
              affiliateFee:
                memberShipProductType[k].isPlaying == 1
                  ? statusTeamSeasonal.result.affiliateFee
                    ? statusTeamSeasonal.result.affiliateFee
                    : 0
                  : null,
              affiliateGst:
                memberShipProductType[k].isPlaying == 1
                  ? statusTeamSeasonal.result.affiliateGst
                    ? statusTeamSeasonal.result.affiliateGst
                    : 0
                  : null,
              nominationFees:
                memberShipProductType[k].isPlaying == 1
                  ? statusTeamSeasonal.result.nominationFees
                  : null,
              nominationGST:
                memberShipProductType[k].isPlaying == 1
                  ? statusTeamSeasonal.result.nominationGST
                  : null,
              affNominationFees:
                memberShipProductType[k].isPlaying == 1
                  ? statusTeamSeasonal.result.affNominationFees
                    ? statusTeamSeasonal.result.affNominationFees
                    : 0
                  : null,
              affNominationGST:
                memberShipProductType[k].isPlaying == 1
                  ? statusTeamSeasonal.result.affNominationGST
                    ? statusTeamSeasonal.result.affNominationGST
                    : 0
                  : null,
              feeTypeRefId: 3,
              membershipProductTypeName: memberShipProductType[k].membershipProductTypeName,
              divisionName:
                memberShipProductType[k].isPlaying == 1
                  ? divisionProductType[j].divisionName
                  : 'N/A',
              membershipProductUniqueKey: divisions[i].membershipProductUniqueKey,
              total: getTotalFees(feesOwner, statusTeamSeasonal.result, mFeesSeasonal),
              mFees: mFeesSeasonal,
              membershipSeasonal: membershipSeasonal,
              membershipGst: membershipGst,
              checkBoxOption: statusTeamSeasonal.result.isTeamSeasonal,
              teamRegChargeTypeRefId: statusTeamSeasonal.result.teamRegChargeTypeRefId,
              individualChargeTypeRefId: statusTeamSeasonal.result.individualChargeTypeRefId,
              isPlayer: memberShipProductType[k].isPlaying,
              allowTeamRegistrationTypeRefId:
                memberShipProductType[k].allowTeamRegistrationTypeRefId,
              membershipCasual: membershipCasual,
              membershipCasualGst: membershipCasualGst,
            };
          } else {
            type_object_team_seasonal = {
              competitionMembershipProductFeeId: 0,
              competitionMembershipProductTypeId:
                memberShipProductType[k].competitionMembershipProductTypeId,
              competitionMembershipProductDivisionId:
                divisionProductType[j].competitionMembershipProductDivisionId,
              fee: memberShipProductType[k].isPlaying == 1 ? 0 : null,
              gst: memberShipProductType[k].isPlaying == 1 ? 0 : null,
              affiliateFee: memberShipProductType[k].isPlaying == 1 ? 0 : null,
              affiliateGst: memberShipProductType[k].isPlaying == 1 ? 0 : null,
              nominationFees: memberShipProductType[k].isPlaying == 1 ? 0 : null,
              nominationGST: memberShipProductType[k].isPlaying == 1 ? 0 : null,
              affNominationFees: memberShipProductType[k].isPlaying == 1 ? 0 : null,
              affNominationGST: memberShipProductType[k].isPlaying == 1 ? 0 : null,
              feeTypeRefId: 3,
              membershipProductTypeName: memberShipProductType[k].membershipProductTypeName,
              divisionName:
                memberShipProductType[k].isPlaying == 1
                  ? divisionProductType[j].divisionName
                  : 'N/A',
              membershipProductUniqueKey: divisions[i].membershipProductUniqueKey,
              total: null,
              mFees: mFeesSeasonal,
              membershipSeasonal: membershipSeasonal,
              membershipGst: membershipGst,
              checkBoxOption: 0, //statusRefId == 1 ? 1 : 0,
              teamRegChargeTypeRefId: 1,
              individualChargeTypeRefId: 1,
              isPlayer: memberShipProductType[k].isPlaying,
              allowTeamRegistrationTypeRefId:
                memberShipProductType[k].allowTeamRegistrationTypeRefId,
              membershipCasual: membershipCasual,
              membershipCasualGst: membershipCasualGst,
            };
          }

          if (statusTeamCasual.status) {
            setTeamInitFee(isPlaying, statusTeamCasual);
            type_object_team_casual = {
              competitionMembershipProductFeeId:
                statusTeamCasual.result.competitionMembershipProductFeeId,
              competitionMembershipProductTypeId:
                memberShipProductType[k].competitionMembershipProductTypeId,
              competitionMembershipProductDivisionId:
                divisionProductType[j].competitionMembershipProductDivisionId,
              fee: memberShipProductType[k].isPlaying == 1 ? statusTeamCasual.result.Fees : null,
              gst: memberShipProductType[k].isPlaying == 1 ? statusTeamCasual.result.GST : null,
              affiliateFee:
                memberShipProductType[k].isPlaying == 1
                  ? statusTeamCasual.result.affiliateFee
                    ? statusTeamCasual.result.affiliateFee
                    : 0
                  : null,
              affiliateGst:
                memberShipProductType[k].isPlaying == 1
                  ? statusTeamCasual.result.affiliateGst
                    ? statusTeamCasual.result.affiliateGst
                    : 0
                  : null,
              nominationFees:
                memberShipProductType[k].isPlaying == 1
                  ? statusTeamCasual.result.nominationFees
                  : null,
              nominationGST:
                memberShipProductType[k].isPlaying == 1
                  ? statusTeamCasual.result.nominationGST
                  : null,
              affNominationFees:
                memberShipProductType[k].isPlaying == 1
                  ? statusTeamCasual.result.affNominationFees
                    ? statusTeamCasual.result.affNominationFees
                    : 0
                  : null,
              affNominationGST:
                memberShipProductType[k].isPlaying == 1
                  ? statusTeamCasual.result.affNominationGST
                    ? statusTeamCasual.result.affNominationGST
                    : 0
                  : null,
              feeTypeRefId: 4,
              membershipProductTypeName: memberShipProductType[k].membershipProductTypeName,
              divisionName:
                memberShipProductType[k].isPlaying == 1
                  ? divisionProductType[j].divisionName
                  : 'N/A',
              membershipProductUniqueKey: divisions[i].membershipProductUniqueKey,
              total: getTotalFees(feesOwner, statusTeamCasual.result, mFeesCasual),
              mFees: mFeesCasual,
              membershipCasual: membershipCasual,
              membershipGst: membershipCasualGst,
              checkBoxOption: statusTeamCasual.result.isTeamCasual,
              isPlayer: memberShipProductType[k].isPlaying,
            };
          } else {
            type_object_team_casual = {
              competitionMembershipProductFeeId: 0,
              competitionMembershipProductTypeId:
                memberShipProductType[k].competitionMembershipProductTypeId,
              competitionMembershipProductDivisionId:
                divisionProductType[j].competitionMembershipProductDivisionId,
              fee: memberShipProductType[k].isPlaying == 1 ? 0 : null,
              gst: memberShipProductType[k].isPlaying == 1 ? 0 : null,
              affiliateFee: memberShipProductType[k].isPlaying == 1 ? 0 : null,
              affiliateGst: memberShipProductType[k].isPlaying == 1 ? 0 : null,
              nominationFees: memberShipProductType[k].isPlaying == 1 ? 0 : null,
              nominationGST: memberShipProductType[k].isPlaying == 1 ? 0 : null,
              affNominationFees: memberShipProductType[k].isPlaying == 1 ? 0 : null,
              affNominationGST: memberShipProductType[k].isPlaying == 1 ? 0 : null,
              feeTypeRefId: 4,
              membershipProductTypeName: memberShipProductType[k].membershipProductTypeName,
              divisionName:
                memberShipProductType[k].isPlaying == 1
                  ? divisionProductType[j].divisionName
                  : 'N/A',
              membershipProductUniqueKey: divisions[i].membershipProductUniqueKey,
              total: null,
              mFees: mFeesCasual,
              membershipCasual: membershipCasual,
              membershipGst: membershipCasualGst,
              checkBoxOption: 0, //statusRefId == 1 ? 1 : 0
              isPlayer: memberShipProductType[k].isPlaying,
            };
          }

          if (memberShipProductType[k].isPlaying == 1) {
            perTypeTeamArraySeasonal.push(type_object_team_seasonal);
            perTypeTeamArrayCasual.push(type_object_team_casual);
          } else {
            if (j == 0) {
              perTypeTeamArraySeasonal.push(type_object_team_seasonal);
              perTypeTeamArrayCasual.push(type_object_team_casual);
            }
          }
        }

        if (memberShipProductType[k].isPlaying == 1) {
          perTypeArrayCasual.push(type_Object_casual);
          perTypeArraySeasonal.push(type_Object_seasonal);
        } else {
          if (j == 0) {
            perTypeArrayCasual.push(type_Object_casual);
            perTypeArraySeasonal.push(type_Object_seasonal);
          }
        }
      }
    }

    let productArrayToCheckAllType = isArrayNotEmpty(getFeeData) ? getFeeData : [];
    let divisionIdToCheckAllType = null;
    for (let x in productArrayToCheckAllType) {
      if (
        product[i].membershipProductUniqueKey ==
        productArrayToCheckAllType[x].membershipProductUniqueKey
      ) {
        divisionIdToCheckAllType = checkIsDivisionAllType(productArrayToCheckAllType[x].fees);
        product[i]['isProductTypeALL'] = divisionIdToCheckAllType ? true : false;
        break;
      }
    }
    let isSeasonalFeeTypeAvailable = null;
    let isCasualFeeTypeAvailable = null;
    let isSeasonalTeamFeeTypeAvailable = null;
    let isCasualTeamFeeTypeAvailable = null;
    let teamRegChargeTypeRefId = null;
    let allowTeamRegistrationTypeRefId = 1;
    let individualChargeTypeRefId = 1;

    if (product[i].isProductTypeALL == false) {
      isSeasonalFeeTypeAvailable = checkFeeType(alltypeArraySeasonal);
      isCasualFeeTypeAvailable = checkFeeType(alltypeArrayCasual);
      isSeasonalTeamFeeTypeAvailable = checkFeeType(allTypeTeamArraySeasonal);
      isCasualTeamFeeTypeAvailable = checkFeeType(allTypeTeamArrayCasual);
      teamRegChargeTypeRefId = checkTeamChargeType(allTypeTeamArraySeasonal);
      if (alltypeArraySeasonal.length > 0) {
        individualChargeTypeRefId = alltypeArraySeasonal[0].individualChargeTypeRefId;
      }
      if (allTypeTeamArraySeasonal.length > 0) {
        allowTeamRegistrationTypeRefId = allTypeTeamArraySeasonal[0].allowTeamRegistrationTypeRefId;
      }
    } else {
      isSeasonalFeeTypeAvailable = checkFeeType(perTypeArraySeasonal);
      isCasualFeeTypeAvailable = checkFeeType(perTypeArrayCasual);
      isSeasonalTeamFeeTypeAvailable = checkFeeType(perTypeTeamArraySeasonal);
      isCasualTeamFeeTypeAvailable = checkFeeType(perTypeTeamArrayCasual);
      teamRegChargeTypeRefId = checkTeamChargeType(perTypeTeamArraySeasonal);
      if (perTypeTeamArraySeasonal.length > 0) {
        allowTeamRegistrationTypeRefId = perTypeTeamArraySeasonal[0].allowTeamRegistrationTypeRefId;
        individualChargeTypeRefId = perTypeTeamArraySeasonal[0].individualChargeTypeRefId;
      }
    }
    let teamFeeType = null;
    if (
      teamRegChargeTypeRefId == TeamRegistrationChargeType.TeamFullSeason ||
      teamRegChargeTypeRefId == TeamRegistrationChargeType.TeamPerMatch
    ) {
      teamFeeType = TeamFeeType.WholeTeam;
    }
    if (
      teamRegChargeTypeRefId == TeamRegistrationChargeType.IndividualFullSeason ||
      teamRegChargeTypeRefId == TeamRegistrationChargeType.IndividualPerMatchPlayed
    ) {
      teamFeeType = TeamFeeType.PerPlayer;
    }
    let object = {
      membershipProductName: product[i].membershipProductName,
      competitionMembershipProductId: product[i].competitionMembershipProductId,
      membershipProductUniqueKey: product[i].membershipProductUniqueKey,
      seasonal: { allType: alltypeArraySeasonal, perType: perTypeArraySeasonal },
      casual: { allType: alltypeArrayCasual, perType: perTypeArrayCasual },
      seasonalTeam: { allType: allTypeTeamArraySeasonal, perType: perTypeTeamArraySeasonal },
      casualTeam: { allType: allTypeTeamArrayCasual, perType: perTypeTeamArrayCasual },
      isAllType: product[i].isProductTypeALL === false ? 'allDivisions' : 'perDivision',
      isSeasonal: isSeasonalFeeTypeAvailable,
      isCasual: isCasualFeeTypeAvailable,
      isTeamSeasonal:
        isSeasonalTeamFeeTypeAvailable == undefined ? false : isSeasonalTeamFeeTypeAvailable,
      isTeamCasual:
        isCasualTeamFeeTypeAvailable == undefined ? false : isCasualTeamFeeTypeAvailable,
      isIndividualReg:
        isSeasonalFeeTypeAvailable == true || isCasualFeeTypeAvailable == true ? true : false,
      isTeamReg: isSeasonalTeamFeeTypeAvailable || isCasualTeamFeeTypeAvailable,
      teamFeeType: teamFeeType,
      teamRegChargeTypeRefId: teamRegChargeTypeRefId,
      individualChargeTypeRefId: individualChargeTypeRefId,
      allowTeamRegistrationTypeRefId: allowTeamRegistrationTypeRefId,
    };
    productArray.push(object);
  }
  return productArray;
}

/////addd membership product key to the division tab
// function competitionMembershipProduct_Id(array, key) {
//     let keyValue = null
//     let index = array.findIndex(x => x.membershipProductUniqueKey == key)
//     if (index > -1) {
//         keyValue = array[index].competitionMembershipProductId
//     }
//     return keyValue
// }

///// check selected discount membership product
function checkDiscountProduct(discountStateData, selectedDiscount) {
  let object = {
    status: false,
    result: [],
  };
  for (let i in selectedDiscount) {
    if (
      selectedDiscount[i].competitionTypeDiscountId === discountStateData.competitionTypeDiscountId
    ) {
      object = {
        status: true,
        result: selectedDiscount[i],
      };
      break;
    }
  }
  return object;
}

// function getSeasonalExpandedKey(existingValue, newValue) {
//     for (let i in existingValue) {
//         if (newValue.indexOf(existingValue[i]) == -1) {
//         }
//     }
// }

// adding object to seasonal payemnt
// function getSeasonalOptions(datalist) {
//     let paymentOptions = datalist.filter(x => x.id != 9);
//     let instalmentDates = [];
//     paymentOptions.map((item) => {
//         let subReferences = item.subReferences
//         if (subReferences.length > 0) {
//             for (let i = 0; i < subReferences.length; i++) {
//                 subReferences[i]["instalmentDates"] = instalmentDates
//             }
//         }
//     })
//     return paymentOptions;
// }

// function getPerMatchPaymentOptions(datalist) {
//     return datalist.filter(x => x.id = 2);
// }

function addInstalmentDate(selectedSeasonalInstalmentDatesArray) {
  let newInstalmentDateObj = {
    paymentOptionRefId: 5,
    paymentInstalmentId: 0,
    instalmentDate: '',
    feesTypeRefId: 2,
  };
  selectedSeasonalInstalmentDatesArray.push(newInstalmentDateObj);
}

function removeInstalmentDate(removeObj) {
  let selectedSeasonalInstalmentDatesArray = removeObj.selectedSeasonalInstalmentDatesArray;
  let index = removeObj.index;
  selectedSeasonalInstalmentDatesArray.splice(index, 1);
}

function updateInstalmentDate(value) {
  let instalmentDate = value.instalmentDate;
  let selectedSeasonalInstalmentDatesArrayItem = value.selectedSeasonalInstalmentDatesArrayItem;
  selectedSeasonalInstalmentDatesArrayItem.instalmentDate = instalmentDate;
}

function addSeasonalTeamInstalmentDate(selectedSeasonalTeamInstalmentDatesArray) {
  let newInstalmentDateObj = {
    paymentOptionRefId: 5,
    paymentInstalmentId: 0,
    instalmentDate: '',
    feesTypeRefId: 3,
  };
  selectedSeasonalTeamInstalmentDatesArray.push(newInstalmentDateObj);
}

function populatePaymentOptions(state, allData, action) {
  state.competitionPaymentsData = allData.competitionpayments;
  let selectedCasualFee = checkSelectedCasualFee(
    allData.competitionpayments.paymentOptions,
    state.casualPaymentDefault,
    state.selectedCasualFee,
    state.selectedCasualFeeKey,
    action.isEdit,
    1,
  );
  state.selectedCasualFee = selectedCasualFee.selectedCasualFee;
  state.selectedCasualFeeKey = selectedCasualFee.selectedCasualFeeKey;
  state.defaultSelectedCasualFee = selectedCasualFee.selectedCasualFee;
  let selectedFee = checkSelectedCasualFee(
    allData.competitionpayments.paymentOptions,
    state.perMatchPaymentDefault,
    state.selectedIndividualPerMatchFee,
    [],
    action.isEdit,
    5,
  );
  state.selectedIndividualPerMatchFee = selectedFee.selectedCasualFee;

  let selectedSeasonalFee = checkSelectedSeasonalFee(
    allData.competitionpayments.paymentOptions,
    state.seasonalPaymentDefault,
    state.SelectedSeasonalFee,
    state.SelectedSeasonalFeeKey,
    allData.competitionpayments.instalmentDates,
    state.selectedSeasonalInstalmentDates,
    action.isEdit,
  );
  state.SelectedSeasonalFee = selectedSeasonalFee.selectedSeasonalFee;
  state.SelectedSeasonalFeeKey = selectedSeasonalFee.selectedSeasonalFeeKey;
  state.defaultSelectedSeasonalFee = selectedSeasonalFee.selectedSeasonalFee;
  state.selectedSeasonalInstalmentDates = selectedSeasonalFee.selectedSeasonalInstalmentDates;
  let selectedSeasonalTeamFee = checkSelectedSeasonalTeamFee(
    allData.competitionpayments.paymentOptions,
    state.seasonalTeamPaymentDefault,
    state.selectedSeasonalTeamFee,
    state.selectedSeasonalTeamFeeKey,
    allData.competitionpayments.instalmentDates,
    state.selectedTeamSeasonalInstalmentDates,
    action.isEdit,
  );
  state.selectedSeasonalTeamFee = selectedSeasonalTeamFee.selectedSeasonalTeamFee;
  state.selectedSeasonalTeamFeeKey = selectedSeasonalTeamFee.selectedSeasonalTeamFeeKey;
  state.defaultSelectedSeasonalTeamFee = selectedSeasonalTeamFee.selectedSeasonalTeamFee;
  state.selectedTeamSeasonalInstalmentDates =
    selectedSeasonalTeamFee.selectedTeamSeasonalInstalmentDates;
  let selectedCasualTeamFee = checkSelectedCasualTeamFee(
    allData.competitionpayments.paymentOptions,
    state.casualPaymentDefault,
    state.selectedCasualTeamFee,
  );
  state.selectedCasualTeamFee = selectedCasualTeamFee.selectedCasualTeamFee;
  let selectedPaymentMethods = checkSelectedPaymentMethods(
    allData.competitionpayments.paymentMethods,
    state.paymentMethodsDefault,
    state.selectedPaymentMethods,
  );
  state.selectedPaymentMethods = selectedPaymentMethods.selectedPaymentMethods;
}

// function removeSeasonalTeamInstalmentDate(removeObj) {
//     let selectedSeasonalTeamInstalmentDatesArray = removeObj.selectedSeasonalTeamInstalmentDatesArray;
//     let selectedSeasonalTeamInstalmentDatesArrayItem = removeObj.selectedSeasonalTeamInstalmentDatesArrayItem;
//     let index = selectedSeasonalTeamInstalmentDatesArray.indexOf(selectedSeasonalTeamInstalmentDatesArrayItem);
//     selectedSeasonalTeamInstalmentDatesArray.splice(index, 1);
// }

// function updateSeasonalTeamInstalmentDate(value) {
//     let seasonalTeamInstalmentDate = value.seasonalTeamInstalmentDate;
//     let selectedSeasonalTeamInstalmentDatesArrayItem = value.selectedSeasonalTeamInstalmentDatesArrayItem;
//     selectedSeasonalTeamInstalmentDatesArrayItem.instalmentDate = seasonalTeamInstalmentDate;
// }

function competitionFees(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_COMPETITION_FEES_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_COMPETITION_FEES_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    // get the competition fees list in registration
    case ApiConstants.API_REG_COMPETITION_LIST_LOAD:
      return { ...state, onLoad: true, error: null, competitionListAction: action };

    case ApiConstants.API_REG_COMPETITION_LIST_SUCCESS:
      let competitionListData = action.result;
      state.selectedVenuesAdd = null;
      state.selectedVenues = [];
      return {
        ...state,
        onLoad: false,
        regCompetitionFeeListData: competitionListData.competitionFees,
        regCompetitonFeeListTotalCount: competitionListData.page.totalCount,
        regCompetitonFeeListPage: competitionListData.page
          ? competitionListData.page.currentPage
          : 1,
        status: action.status,
        error: null,
      };

    //////delete the competition list product
    case ApiConstants.API_REG_COMPETITION_LIST_DELETE_LOAD:
    case ApiConstants.API_REG_COMPETITION_LIST_ARCHIVE_LOAD:
      return { ...state, onLoad: true, archiveLoad: true, error: null };

    case ApiConstants.API_REG_COMPETITION_LIST_DELETE_SUCCESS:
    case ApiConstants.API_REG_COMPETITION_LIST_ARCHIVE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        archiveLoad: false, //competition archive status
        error: null,
      };

    ///get casual feees
    case ApiConstants.GET_CASUAL_FEE_DETAIL_API_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.GET_CASUAL_FEE_DETAIL_API_SUCCESS:
      const casualPayment = getRegistrationSetting(action.casualPaymentOptionResult);
      return {
        ...state,
        onLoad: false,
        status: action.status,
        casualPaymentDefault: casualPayment,
        error: null,
      };

    ///get casual feees
    case ApiConstants.API_GET_PAYMENT_METHOD_REF_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_PAYMENT_METHOD_REF_SUCCESS:
      const paymentMethods = action.result;
      return {
        ...state,
        onLoad: false,
        status: action.status,
        paymentMethodsDefault: paymentMethods,
        error: null,
      };

    ////get seasoonal fees
    case ApiConstants.GET_SEASONAL_FEE_DETAIL_API_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.GET_SEASONAL_FEE_DETAIL_API_SUCCESS:
      const seasonalPayment = getRegistrationSetting(action.seasonalPaymentOptionResult);
      let teamSeasonalPayment = seasonalPayment.filter(x => x.id != 10);
      return {
        ...state,
        onLoad: false,
        status: action.status,
        seasonalPaymentDefault: seasonalPayment,
        seasonalTeamPaymentDefault: teamSeasonalPayment,
        error: null,
      };

    ////get per match payment options
    case ApiConstants.GET_PER_MATCH_FEE_OPTIONS_API_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.GET_PER_MATCH_FEE_OPTIONS_API_SUCCESS:
      const perMatchOptions = getRegistrationSetting(action.perMatchOptionResult);
      return {
        ...state,
        onLoad: false,
        status: action.status,
        perMatchPaymentDefault: perMatchOptions,
        error: null,
      };

    ////get default competition membershipproduct tab details
    case ApiConstants.API_GET_DEFAULT_COMPETITION_FEES_MEMBERSHIP_PRODUCT_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_DEFAULT_COMPETITION_FEES_MEMBERSHIP_PRODUCT_SUCCESS:
      return {
        ...state,
        status: action.status,
        defaultCompFeesMembershipProduct: getDefaultCompMemberhsipProduct(
          action.result.data.membershipProducts,
          [],
        ),
        error: null,
        onLoad: false,
      };

    case ApiConstants.API_GET_DEFAULT_COMPETITION_FEES_MEMBERSHIP_PRODUCT_FOR_MULTI_YEAR_LOAD:
      return { ...state, onLoadMultipleMembership: true };

    case ApiConstants.API_GET_DEFAULT_COMPETITION_FEES_MEMBERSHIP_PRODUCT_FOR_MULTI_YEAR_SUCCESS:
      const products = action.result;
      const membershipProducts = [];
      products.forEach(product => {
        let year = product.year;
        let products = product.membershipProducts;
        membershipProducts.push({
          year,
          membershipProducts: getDefaultCompMemberhsipProduct(products, []),
        });
      });
      return {
        ...state,
        status: action.status,
        multipleDefaultCompFeesMembershipProduct: membershipProducts,
        error: null,
        onLoadMultipleMembership: false,
      };

    /////get the competition fees all the data in one API
    case ApiConstants.API_GET_COMPETITION_FEES_DETAILS_LOAD:
      return { ...state, onLoad: true, error: null, getCompAllDataOnLoad: true };

    case ApiConstants.API_GET_COMPETITION_FEES_DETAILS_SUCCESS:
      let allData = action.result.data;
      state.stateAllowsPlayerReplication = allData.stateAllowsPlayerReplication;
      state.competitionCreator = allData.competitiondetail.competitionCreatorOrgUniqueKey;
      let selectedInvitees = checkSlectedInvitees(allData.competitiondetail.invitees);
      state.hasInvitedAffiliates =
        selectedInvitees.length &&
        !(selectedInvitees.length == 1 && selectedInvitees[0] == RegistrationInvitees.Direct);
      for (let o in selectedInvitees) {
        if (
          selectedInvitees[o] == RegistrationInvitees.Affiliates_Level_1 ||
          selectedInvitees[o] == RegistrationInvitees.Affiliates_Level_2
        ) {
          state.affiliateSelected = selectedInvitees[o];
          let affiliate_Object = {
            inviteesId: allData.competitiondetail.invitees[o].inviteesId,
            registrationInviteesRefId: selectedInvitees[o],
            inviteesOrg: [],
          };
          state.affiliateArray = [affiliate_Object];
          state.anyOrgNonSelected = 'none2';
        } else if (
          selectedInvitees[o] == RegistrationInvitees.Associations_Leagues ||
          selectedInvitees[o] == RegistrationInvitees.Clubs_Schools
        ) {
          state.anyOrgSelected = selectedInvitees[o];
          let affiliateObject = null;
          if (selectedInvitees[o] == RegistrationInvitees.Associations_Leagues) {
            /// any-org association
            let affiliateOrgSelectedArr = getAffiliateOrgSelectedArr(
              allData.competitiondetail.invitees,
              selectedInvitees[o],
            );
            state.associationLeague = affiliateOrgSelectedArr.slectedAffilitesArray;
            state.any_club_Org_AffiliateArr = [
              ...state.any_club_Org_AffiliateArr,
              ...affiliateOrgSelectedArr.selecetdOrgArray,
            ];
            affiliateObject = {
              inviteesId: allData.competitiondetail.invitees[o].inviteesId,
              registrationInviteesRefId: selectedInvitees[o],
              inviteesOrg: affiliateOrgSelectedArr.selecetdOrgArray,
            };
            state.anyOrgAffiliateArr = [affiliateObject];
            //state.anyOrgNonSelected = null
            state.associationChecked = true;
            state.anyOrgAssociationArr = [affiliateObject];
          } else {
            // club
            let affiliate_Org_SelectedArr = getAffiliateOrgSelectedArr(
              allData.competitiondetail.invitees,
              selectedInvitees[o],
            );
            state.clubSchool = affiliate_Org_SelectedArr.slectedAffilitesArray;
            state.any_club_Org_AffiliateArr = [
              ...state.any_club_Org_AffiliateArr,
              ...affiliate_Org_SelectedArr.selecetdOrgArray,
            ];
            affiliateObject = {
              inviteesId: allData.competitiondetail.invitees[o].inviteesId,
              registrationInviteesRefId: selectedInvitees[o],
              inviteesOrg: affiliate_Org_SelectedArr.selecetdOrgArray,
            };
            state.anyOrgAffiliateArr = [affiliateObject];
            state.clubChecked = true;
            state.anyOrgClubArr = [affiliateObject];
          }

          state.anyOrgNonSelected = null;
        } else {
          state.affiliateArray = allData.competitiondetail.invitees;
          state.otherSelected = selectedInvitees[o];
        }
      }

      setVenueForAffiliate(state, allData.competitiondetail.venues);
      let selectedVenues = checkSelectedVenue(allData.competitiondetail.venues, state.venueList);
      if (state.selectedVenuesAdd == null) {
        state.selectedVenues = selectedVenues;
      }
      state.selectedInvitees = selectedInvitees;
      populatePaymentOptions(state, allData, action);
      let finalDiscountData = discountDataObject(allData.competitiondiscounts);
      state.competionDiscountValue.competitionDiscounts[0].discounts = finalDiscountData;

      let selectedCharity = checkSelectedCharity(
        allData.competitionpayments.charityRoundUp,
        state.charityRoundUp,
      );
      let selectedGovtVoucher = checkSelectedVoucher(
        allData.competitiondiscounts.govermentVouchers,
        state.govtVoucher,
      );
      state.charityRoundUp = selectedCharity;
      state.govtVoucher = selectedGovtVoucher;
      state.getCompetitionFeeDetails = allData.competitionfees;
      let divisionGetSuccesData = getDivisionTableData(allData);
      state.competitionDivisionsData = divisionGetSuccesData;
      state.defaultCompFeesMembershipProduct = getDefaultCompMemberhsipProduct(
        state.defaultCompFeesMembershipProduct,
        allData.competitionmembershipproduct,
      );
      if (allData.competitiondetail.hasRegistration == 1) {
        let competitionFeeProducts = createProductFeeArr(allData);
        state.competitionFeesData = competitionFeeProducts;
      }
      if (isArrayNotEmpty(allData.competitiondiscounts.competitionDiscounts)) {
        let selectDiscountArray = allData.competitiondiscounts.competitionDiscounts[0].discounts;
        let discountslist = state.competionDiscountValue.competitionDiscounts[0].discounts;
        let memberShipDiscountProduct = [];
        for (let i in discountslist) {
          let selectedProductDiscount = checkDiscountProduct(discountslist[i], selectDiscountArray);
          if (selectedProductDiscount.status) {
            memberShipDiscountProduct = getSelectedDiscountProduct(
              selectedProductDiscount.result.membershipProductUniqueKey,
              allData.competitionmembershipproduct,
            );
            discountslist[i].competitionMembershipProductTypeId =
              selectedProductDiscount.result.competitionMembershipProductTypeId;
          }
          discountslist[i].membershipProductTypes = memberShipDiscountProduct;
        }
      }
      state.postInvitees = allData.competitiondetail.invitees;
      if (state.selectedVenuesAdd == null) state.postVenues = allData.competitiondetail.venues;

      if (state.createVenue) {
        let defaultPostVenueObject = {
          competitionVenueId: 0,
          venueId: state.createVenue.venueId,
        };
        state.postVenues.push(defaultPostVenueObject);
      }

      state.charityTitle = isArrayNotEmpty(allData.competitionpayments.charityRoundUp)
        ? allData.competitionpayments.charityRoundUp[0].charityRoundUpName
        : '';
      state.charityDescription = isArrayNotEmpty(allData.competitionpayments.charityRoundUp)
        ? allData.competitionpayments.charityRoundUp[0].charityRoundUpDescription
        : '';
      state.onLoad = false;
      state.getCompAllDataOnLoad = false;
      state.isAllDivisionChecked = false;
      if (allData.competitiongradenamingdivisions.length === 1) {
        state.isAllDivisionChecked = allData.competitiongradenamingdivisions[0].allDivisions
          ? true
          : false;
      }
      let divisionList = [];
      for (let product of state.competitionDivisionsData) {
        divisionList = divisionList.concat(product.divisions);
      }
      return {
        ...state,
        status: action.status,
        competitionDetailData: { ...allData.competitiondetail, loaded: true },
        competitionMembershipProductData: allData.competitionmembershipproduct,
        competitionDiscountsData: allData.competitiondiscounts,
        competitionDivisionsListData: divisionList,
        competitionGradePoolsData: allData.competitiongradenamingdivisions,
        competitionId: allData.competitiondetail.competitionUniqueKey,
        defaultChairtyOption: allData.competitionpayments.charityRoundUp,
        defaultGovtVoucher: allData.competitiondiscounts.govermentVouchers,
        error: null,
      };

    ///////get the venue list in the first tab
    case ApiConstants.API_REG_FORM_VENUE_SUCCESS:
      let venue = action.result;
      state.selectedVenuesIds = venue.id;
      state.venueList = venue;
      return {
        ...state,
        error: null,
      };

    ////save the competition membership tab details
    case ApiConstants.API_SAVE_COMPETITION_FEES_MEMBERSHIP_TAB_LOAD:
      //s state.defaultCompFeesMembershipProduct = null
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_SAVE_COMPETITION_FEES_MEMBERSHIP_TAB_SUCCESS:
      let savemembershipAllData = action.result.data;
      let divisionGetMembershipSuccesData = getDivisionTableData(savemembershipAllData);
      state.competitionDivisionsData = divisionGetMembershipSuccesData;
      state.defaultCompFeesMembershipProduct = getDefaultCompMemberhsipProduct(
        state.defaultCompFeesMembershipProduct,
        savemembershipAllData.competitionmembershipproduct,
      );
      if (savemembershipAllData.competitiondetail.hasRegistration == 1) {
        let competitionFee_Products = createProductFeeArr(savemembershipAllData);
        state.competitionFeesData = competitionFee_Products;
      }
      state.onLoad = false;
      return {
        ...state,
        status: action.status,
        competitionId: savemembershipAllData.competitiondetail.competitionUniqueKey,
        competitionMembershipProductData: savemembershipAllData.competitionmembershipproduct,
        error: null,
      };

    ////membership product selected action tochange membership typearray data
    case ApiConstants.COMPETITION_FEES_MEMBERSHIP_PRODUCT_SELECTED_ONCHANGE:
      let membershipProductobj = state.defaultCompFeesMembershipProduct.find(
        x => x.membershipProductUniqueKey == action.membershipProductUniqueKey,
      );
      if (membershipProductobj) {
        membershipProductobj.isProductSelected = action.checked;
        membershipProductobj.competitionMembershipProductId = null;
        let membershipProductTypesList = membershipProductobj.membershipProductTypes;
        membershipProductTypesList.forEach(item => {
          item.competitionMembershipProductId = null;
          item.competitionMembershipProductTypeId = 0;
        });
      }
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    //////membership types in competition fees onchhange function
    case ApiConstants.COMPETITION_FEES_MEMBERSHIP_TYPES_SELECTED_ONCHANGE:
      state.defaultCompFeesMembershipProduct[action.membershipIndex].membershipProductTypes[
        action.typeIndex
      ].isTypeSelected = action.checked;
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    /////save the division table data  in the competition fees section
    case ApiConstants.API_SAVE_COMPETITION_FEES_DIVISION_TAB_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_SAVE_COMPETITION_FEES_DIVISION_TAB_SUCCESS:
      let saveDivisionData = action.result.data;
      let divisionSaveSuccessData = getDivisionTableData(saveDivisionData);
      state.competitionDivisionsData = divisionSaveSuccessData;
      if (saveDivisionData.competitiondetail.hasRegistration == 1) {
        let competitionFeeProductsDivision = createProductFeeArr(saveDivisionData);
        state.competitionFeesData = competitionFeeProductsDivision;
      }
      return {
        ...state,
        onLoad: false,
        status: action.status,
        competitionMembershipProductData: saveDivisionData.competitionmembershipproduct,
        error: null,
      };

    /////onchange the division table data on change
    case ApiConstants.COMPETITION_FEES_DIVISION_TABLE_DATA_ONCHANGE:
      let onChangeDivisionIndex = state.competitionDivisionsData.findIndex(
        data => data.membershipProductUniqueKey == action.record.membershipProductUniqueKey,
      );
      state.competitionDivisionsData[onChangeDivisionIndex].divisions[action.index][
        action.keyword
      ] = action.checked;
      // state.competitionDivisionsData[onChangeDivisionIndex].divisions[action.index]["parentIndex"] = onChangeDivisionIndex
      if (action.keyword === 'ageRestriction') {
        if (action.checked == false) {
          state.competitionDivisionsData[onChangeDivisionIndex].divisions[action.index][
            'fromDate'
          ] = null;
          state.competitionDivisionsData[onChangeDivisionIndex].divisions[action.index]['toDate'] =
            null;
        }
      }
      if (action.keyword === 'genderRestriction') {
        if (action.checked == false) {
          state.competitionDivisionsData[onChangeDivisionIndex].divisions[action.index][
            'genderRefId'
          ] = null;
        }
      }
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    //////add or remove another division in the division tab
    case ApiConstants.COMPETITION_FEES_DIVISION_ADD_REMOVE:
      // let key = competitionMembershipProduct_Id(state.defaultCompFeesMembershipProduct, action.item.membershipProductUniqueKey)
      if (action.keyword === 'add') {
        let defaultDivisionObject = {
          toDate: null,
          fromDate: null,
          divisionName: '',
          genderRefId: null,
          membershipProductUniqueKey: action.item.membershipProductUniqueKey,
          competitionMembershipProductId: action.item.competitionMembershipProductId,
          competitionMembershipProductDivisionId: 0,
          competitionDivisionId: 0,
          ageRestriction: false,
          genderRestriction: false,
          parentIndex: action.index,
          isPlaying: 0,
        };
        state.competitionDivisionsData[action.index].divisions = [
          ...state.competitionDivisionsData[action.index].divisions,
          defaultDivisionObject,
        ];
      }
      if (action.keyword === 'remove') {
        let removeDivisionIndex = state.competitionDivisionsData.findIndex(
          x => x.membershipProductUniqueKey == action.item.membershipProductUniqueKey,
        );
        if (removeDivisionIndex >= 0) {
          state.competitionDivisionsData[removeDivisionIndex].divisions.splice(action.index, 1);
        }
      } else if (action.keyword === 'removeDivision') {
        state.competitionDivisionsData[0].divisions.splice(action.index, 1);
      }
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    ////save the competition fees details
    case ApiConstants.API_SAVE_COMPETITION_FEES_DETAILS_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_SAVE_COMPETITION_FEES_DETAILS_SUCCESS:
      state.selectedVenuesAdd = null;
      let detailsSuccessData = action.result.data;
      state.competitionId = detailsSuccessData.competitiondetail.competitionUniqueKey;
      state.defaultCompFeesOrgLogoData = detailsSuccessData.competitiondetail.organisationLogo;
      state.defaultCompFeesOrgLogo = detailsSuccessData.competitiondetail.organisationLogo
        ? detailsSuccessData.competitiondetail.organisationLogo.logoUrl
        : null;
      state.postInvitees = detailsSuccessData.competitiondetail.invitees;
      let divisionGetSucces_Data = getDivisionTableData(detailsSuccessData);
      state.competitionDivisionsData = divisionGetSucces_Data;
      state.onLoad = false;

      if (state.selectedPaymentMethods.length == 0) {
        let selectedCasualFee = checkSelectedCasualFee(
          null,
          state.casualPaymentDefault,
          state.selectedCasualFee,
          null,
          action.isEdit,
          1,
        );
        let selectedSeasonalFee = checkSelectedSeasonalFee(
          null,
          state.seasonalPaymentDefault,
          state.SelectedSeasonalFee,
          null,
          null,
          state.selectedSeasonalInstalmentDates,
          action.isEdit,
        );
        let selectedIndividualPerMatchFee = checkSelectedCasualFee(
          null,
          state.perMatchPaymentDefault,
          state.selectedIndividualPerMatchFee,
          null,
          action.isEdit,
          5,
        );
        let selectedSeasonalTeamFee = checkSelectedSeasonalTeamFee(
          null,
          state.seasonalTeamPaymentDefault,
          state.selectedSeasonalTeamFee,
          null,
          null,
          null,
          action.isEdit,
        );
        let selectedCasualTeamFee = checkSelectedCasualTeamFee(
          null,
          state.casualPaymentDefault,
          state.selectedCasualTeamFee,
        );
        let selectedPaymentMethods = checkSelectedPaymentMethods(
          null,
          state.paymentMethodsDefault,
          state.selectedPaymentMethods,
        );

        state.selectedCasualFee = selectedCasualFee.selectedCasualFee;
        state.SelectedSeasonalFee = selectedSeasonalFee.selectedSeasonalFee;
        state.selectedIndividualPerMatchFee = selectedIndividualPerMatchFee.selectedCasualFee;
        state.selectedSeasonalTeamFee = selectedSeasonalTeamFee.selectedSeasonalTeamFee;
        state.selectedCasualTeamFee = selectedCasualTeamFee.selectedCasualTeamFee;
        state.selectedPaymentMethods = selectedPaymentMethods.selectedPaymentMethods;
      }

      return {
        ...state,
        status: action.status,
        competitionDetailData: { ...detailsSuccessData.competitiondetail, loaded: true },
        competitionMembershipProductData: detailsSuccessData.competitionmembershipproduct,
        error: null,
      };

    case ApiConstants.API_ADD_INVITEES_TO_COMPETITION_FEES_DETAILS:
      if (action.key === 'addingAssociationChecked') {
        state.addingAssociationChecked = action.data;
      } else if (action.key === 'addingClubChecked') {
        state.addingClubChecked = action.data;
      } else if (action.key === 'associationAffilite' || action.key === 'clubAffilite') {
        if (action.key === 'associationAffilite') {
          state.addedAssociationLeague = action.data;
        }
        if (action.key === 'clubAffilite') {
          state.addedClubSchool = action.data;
        }
      }

      return {
        ...state,
      };

    case ApiConstants.API_CANCEL_ADD_INVITEES_TO_COMPETITION_FEES_DETAILS:
      state.addedAssociationLeague = action.data;
      state.addedClubSchool = [];
      state.addingClubChecked = false;
      state.addingAssociationChecked = false;

      return {
        ...state,
      };

    case ApiConstants.API_SAVE_ADDED_INVITEES_TO_COMPETITION_FEES_DETAILS_LOAD:
      return { ...state, onLoad: true, addInviteesLoad: true, error: null };

    case ApiConstants.API_SAVE_ADDED_INVITEES_TO_COMPETITION_FEES_DETAILS_SUCCESS:
      state.addedAssociationLeague = [];
      state.addedClubSchool = [];
      state.addingClubChecked = false;
      state.addingAssociationChecked = false;

      return {
        ...state,
        error: null,
        onLoad: false,
        addInviteesLoad: false,
      };

    ////Add-Edit competition fees details
    case ApiConstants.API_ADD_EDIT_COMPETITION_FEES_DETAILS:
      if (action.key === 'venues') {
        /// add-edit venues
        state.selectedVenues = action.data;
        let venuesForPost = createVenuesList(
          state.venueList,
          action.data,
          state.competitionDetailData.venues,
        );
        state.postVenues = venuesForPost;
      } else if (action.key === 'nonPlayingObjectAdd') {
        /// add non playing dates
        state.competitionDetailData.nonPlayingDates.push(action.data);
        // } else if (action.key === "invitees") { /// add-edit inviteess
        //     state.selectedInvitees = action.data
        //     state.postInvitees = createInviteesPostArray(action.data, state.competitionDetailData.invitees)
        //     state.affiliateOrgSelected = []
        //     state.postInvitees[0]["inviteesOrg"] = []
        // } else if (action.key === "affiliateOrgKey") { /// add-edit inviteess
        //     state.affiliateOrgSelected = action.data
        //     // state.selectedInvitees = action.data
        //     let orgInviteesArray = createInviteesOrgArray(state.postInvitees, action.data)
        //     state.postInvitees[0]["inviteesOrg"] = orgInviteesArray
      } else if (action.key === 'logoIsDefault') {
        state.competitionDetailData[action.key] = action.data;
        if (action.data) {
          state.competitionDetailData.competitionLogoUrl = state.defaultCompFeesOrgLogo;
        }
      } else if (action.key === 'nonPlayingDataRemove') {
        let nonPlayingIndex = action.data;
        state.competitionDetailData.nonPlayingDates.splice(nonPlayingIndex, 1);
      } else if (
        action.key === 'affiliateSelected' ||
        action.key === 'anyOrgSelected' ||
        action.key === 'otherSelected' ||
        action.key === 'affiliateNonSelected' ||
        action.key === 'anyOrgNonSelected'
      ) {
        if (action.key === 'affiliateSelected') {
          state.affiliateSelected = action.data;
          state.affiliateArray = createInviteesPostArray(
            action.data,
            state.competitionDetailData.invitees,
          );
          state.otherSelected = null;
          state.affiliateNonSelected = null;
          state.invitedTo.splice(0, 1, action.data);
        }
        if (action.key === 'anyOrgSelected') {
          state.anyOrgSelected = action.data;
          state.anyOrgAffiliateArr = createInviteesPostArray(
            action.data,
            state.competitionDetailData.invitees,
          );
          state.otherSelected = null;
          state.anyOrgNonSelected = null;
          state.affiliateArray = removeDirect(state.affiliateArray);
        }

        if (action.key === 'otherSelected') {
          state.otherSelected = action.data;
          state.affiliateSelected = null;
          state.anyOrgSelected = null;
          state.affiliateNonSelected = null;
          state.anyOrgNonSelected = null;
          state.invitedTo = [];
          state.invitedTo.push(action.data);
          state.anyOrgAffiliateArr = [];
          state.affiliateArray = [];
          state.affiliateArray = createInviteesPostArray(
            action.data,
            state.competitionDetailData.invitees,
          );
          state.associationChecked = false;
          state.clubChecked = false;
          state.anyOrgAssociationArr = [];
          state.anyOrgClubArr = [];
        }
        if (action.key === 'affiliateNonSelected') {
          state.invitedTo = [];
          state.affiliateSelected = [];
          state.otherSelected = null;
          state.affiliateNonSelected = action.data;
          state.affiliateArray = [];
        }
        if (action.key === 'anyOrgNonSelected') {
          state.invitedTo = [];
          state.anyOrgSelected = [];
          state.otherSelected = null;
          state.anyOrgNonSelected = action.data;
          state.anyOrgAffiliateArr = [];
          state.affiliateArray = removeDirect(state.affiliateArray);
          state.associationChecked = false;
          state.clubChecked = false;
          state.anyOrgAssociationArr = [];
          state.anyOrgClubArr = [];
        }
      } else if (action.key === 'associationChecked') {
        state.associationChecked = action.data;
        state.anyOrgNonSelected = null;
        state.anyOrgSelected = 7;
        state.anyOrgAssociationArr = createInviteesPostArray(
          7,
          state.competitionDetailData.invitees,
        );
        state.otherSelected = null;
        state.affiliateArray = removeDirect(state.affiliateArray);
      } else if (action.key === 'clubChecked') {
        state.clubChecked = action.data;
        state.anyOrgNonSelected = null;
        state.anyOrgClubArr = createInviteesPostArray(8, state.competitionDetailData.invitees);
        state.otherSelected = null;
        state.affiliateArray = removeDirect(state.affiliateArray);
      } else if (action.key === 'associationAffilite' || action.key === 'clubAffilite') {
        if (action.key === 'associationAffilite') {
          state.associationLeague = action.data;
          let orgInviteesArray = createInviteesOrgArray(
            state.any_club_Org_AffiliateArr,
            action.data,
          );
          state.anyOrgAssociationArr[0]['inviteesOrg'] = orgInviteesArray;
        }

        if (action.key === 'clubAffilite') {
          state.clubSchool = action.data;
          let orgInviteesArray = createInviteesOrgArray(
            state.any_club_Org_AffiliateArr,
            action.data,
          );
          state.anyOrgClubArr[0]['inviteesOrg'] = orgInviteesArray;
        }
      } else {
        state.competitionDetailData[action.key] = action.data;
      }
      return {
        ...state,
        error: null,
      };

    //update charity round and update dicount govt voucher
    case ApiConstants.UPDATE_PAYMENTS_COMPETITION_FEES:
      if (action.key === 'charityRoundUp') {
        state.charityRoundUp[action.index].isSelected = action.value;
      }
      if (action.key === 'govermentVouchers') {
        state.govtVoucher[action.index].isSelected = action.value;
        // state.selectedCharityArray.push(charityRoundUp[action.index])
      }
      if (action.key === 'title') {
        state.charityTitle = action.value;
      }
      if (action.key === 'description') {
        state.charityDescription = action.value;
      }
      let postCharityArray = checkCharityArray(state.charityRoundUp, state.defaultChairtyOption);
      let postGovtArray = checkVoucherArray(state.govtVoucher, state.defaultGovtVoucher);
      state.competitionPaymentsData.charityRoundUp = postCharityArray;
      state.competitionDiscountsData.govermentVouchers = postGovtArray;
      if (state.competitionPaymentsData.charityRoundUp.length == 0) {
        state.charityTitle = '';
        state.charityDescription = '';
      }
      return { ...state };

    /// update payment option in competiton fee
    case ApiConstants.UPDATE_PAYMENTS_OPTIONS_COMPETITION_FEES:
      if (action.key === 'casualfee') {
        state.selectedCasualFee[action.index][action.subKey] = action.value;
      } else if (action.key === 'seasonalfee') {
        if (action.subKey === 'isChecked') {
          action.item[action.subKey] = action.value;

          let paymentOptionRefId = action.item['paymentOptionRefId'];
          if (paymentOptionRefId == 5) {
            state.competitionDetailData.isSeasonalUponReg = true;
          }
        }
      } else if (action.key === 'individualPerMatchFee') {
        action.item[action.subKey] = action.value;
      } else if (action.key === 'seasonalteamfee') {
        if (action.subKey === 'isChecked') {
          state.selectedSeasonalTeamFee[action.index][action.subKey] = action.value;

          let id = state.selectedSeasonalTeamFee[action.index]['paymentOptionRefId'];
          if (id == 5) {
            state.competitionDetailData.isTeamSeasonalUponReg = true;
          }
        }
      } else if (action.key === 'casualteamfee') {
        state.selectedCasualTeamFee[action.index][action.subKey] = action.value;
      } else if (action.key === 'paymentmethods') {
        state.selectedPaymentMethods[action.index][action.subKey] = action.value;
      }
      return { ...state };

    // for post api of competition fee
    case ApiConstants.API_POST_COMPETITION_FEE_PAYMENT_LOAD:
      return { ...state, onLoad: true, error: null };
    case ApiConstants.API_POST_COMPETITION_FEE_PAYMENT_SUCCESS:
      let paymentSuccessAllData = action.result.data;
      populatePaymentOptions(state, paymentSuccessAllData, action);
      state.charityTitle = isArrayNotEmpty(paymentSuccessAllData.competitionpayments.charityRoundUp)
        ? paymentSuccessAllData.competitionpayments.charityRoundUp[0].charityRoundUpName
        : '';
      state.charityDescription = isArrayNotEmpty(
        paymentSuccessAllData.competitionpayments.charityRoundUp,
      )
        ? paymentSuccessAllData.competitionpayments.charityRoundUp[0].charityRoundUpDescription
        : '';
      return {
        ...state,
        onLoad: false,
        status: action.status,
        competitionMembershipProductData: action.result.data.competitionmembershipproduct,
        error: null,
      };

    // for add and remove another discount competion fee
    case ApiConstants.ADD_ANOTHER_DISCOUNT_COMPETITION_FEE:
      let orgData = getOrganisationData();
      let currentOrganisationId = orgData ? orgData.organisationId : 0;
      if (action.keyAction === 'add') {
        const newObj = {
          competitionMembershipProductTypeId: [],
          competitionTypeDiscountId: 0,
          membershipProductUniqueKey: [],
          competitionTypeDiscountTypeRefId: [],
          amount: '',
          description: '',
          availableFrom: null,
          availableTo: null,
          discountTypeRefId: 2,
          discountCode: '',
          childDiscounts: [],
          question: '',
          applyDiscount: 0,
          membershipProductTypes: [],
          organisationId: currentOrganisationId,
        };
        state.competionDiscountValue.competitionDiscounts[0].discounts.push(newObj);
      } else if (action.keyAction === 'remove') {
        state.competionDiscountValue.competitionDiscounts[0].discounts.splice(action.index, 1);
      }
      return {
        ...state,
        error: null,
      };

    // update discount data  in  competition fee
    case ApiConstants.UPDATE_DISCOUNT_DATA_COMPETITION_FEES:
      state.competionDiscountValue.competitionDiscounts[0].discounts = action.discountData;
      return {
        ...state,
        error: null,
      };

    // update discount membership product
    case ApiConstants.UPDATE_DISCOUNT_MEMBERSHIP_PRODUCT:
      state.discountMembProductKey = action.value;
      state.competionDiscountValue.competitionDiscounts[0].discounts = action.discountData;
      let selectedProductype = getSelectedDiscountProduct(
        action.value,
        state.competitionMembershipProductData,
      );
      state.competionDiscountValue.competitionDiscounts[0].discounts[
        action.index
      ].membershipProductTypes = selectedProductype;
      state.competionDiscountValue.competitionDiscounts[0].discounts[
        action.index
      ].competitionMembershipProductTypeId = null;
      return { ...state };

    // get default charity and govt voucher
    case ApiConstants.API_REG_COMPETITION_FEE_DEFAULT_CHARITY_SUCCESS:
      let charityData = getCharityResult(action.charityResult);
      let govtVocuherData = getCharityResult(action.govtVoucherResult);
      state.charityRoundUp = charityData;
      state.govtVoucher = govtVocuherData;
      return { ...state };

    // for post api competition fee discount api call
    case ApiConstants.API_POST_COMPETITION_FEE_DISCOUNT_LOAD:
      return { ...state, onLoad: true };
    case ApiConstants.API_POST_COMPETITION_FEE_DISCOUNT_SUCCESS:
      let discountSuccessData = action.result.data;
      state.orgRegistrationId = action.result.orgRegistrationId;
      let discountDataFinal = discountDataObject(discountSuccessData.competitiondiscounts);
      state.competionDiscountValue.competitionDiscounts[0].discounts = discountDataFinal;
      if (isArrayNotEmpty(discountSuccessData.competitiondiscounts.competitionDiscounts)) {
        let selectDiscountArray =
          discountSuccessData.competitiondiscounts.competitionDiscounts[0].discounts;
        let discountslist = state.competionDiscountValue.competitionDiscounts[0].discounts;
        let memberShipDiscountProduct = [];
        for (let i in discountslist) {
          let selectedProductDiscount = checkDiscountProduct(discountslist[i], selectDiscountArray);
          if (selectedProductDiscount.status) {
            memberShipDiscountProduct = getSelectedDiscountProduct(
              selectedProductDiscount.result.membershipProductUniqueKey,
              discountSuccessData.competitionmembershipproduct,
            );
            discountslist[i].competitionMembershipProductTypeId =
              selectedProductDiscount.result.competitionMembershipProductTypeId;
          }
          discountslist[i].membershipProductTypes = memberShipDiscountProduct;
        }
      }
      state.competitionDiscountsData = discountSuccessData;
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_COMPETITION_DISCOUNT_TYPE_LOAD:
      return { ...state, onLoad: true };
    case ApiConstants.API_COMPETITION_DISCOUNT_TYPE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        defaultDiscountType: action.result.id,
        error: null,
      };

    case ApiConstants.CHECK_UNCHECK_COMPETITION_FEES_SECTION:
      let feeData = state.competitionFeesData[action.parentIndex];
      if (action.key === 'isIndividualReg') {
        feeData.isSeasonal = action.data;
        if (feeData.isCasual && !action.data) {
          feeData.isCasual = action.data;
        }
      }
      if (action.key === 'isTeamReg') {
        feeData.isTeamSeasonal = action.data;
        if (feeData.isTeamCasual && !action.data) {
          feeData.isTeamCasual = action.data;
        }
        if (action.data == false) {
          feeData.teamRegChargeTypeRefId = null;
          feeData.teamFeeType = null;
        }
        //When Team Registration is clicked, there should be no default selection i.e. the radio button for “Individual Fee” should not be defaulted
        /*  else {
          feeData.teamRegChargeTypeRefId = TeamRegistrationChargeType.IndividualFullSeason;
          feeData.teamFeeType = TeamFeeType.PerPlayer;
        } */
        updateTeamRegChargeType(feeData, feeData.teamRegChargeTypeRefId);
      }
      if (action.key === 'teamFeeType') {
        //When Individiual or Team Fee is selected,  there should be no default selection i.e. “Charged for Full Season” should not be defaulted
        /* if (action.data == TeamFeeType.WholeTeam) {
          feeData.teamRegChargeTypeRefId = TeamRegistrationChargeType.TeamFullSeason;
        } else {
          feeData.teamRegChargeTypeRefId = TeamRegistrationChargeType.IndividualFullSeason;
        } */
        feeData.teamRegChargeTypeRefId = null;
        updateTeamRegChargeType(feeData, feeData.teamRegChargeTypeRefId);
      }

      feeData[action.key] = action.data;

      if (action.key === 'isSeasonal' || action.key === 'isCasual') {
        let isCasual = feeData['isCasual'];
        let isSeasonal = feeData['isSeasonal'];
        if (isSeasonal && isCasual) feeData['isIndividualReg'] = true;
        else if (isSeasonal == false && isCasual == false) feeData['isIndividualReg'] = false;
      }
      if (action.key === 'isTeamSeasonal' || action.key === 'isTeamCasual') {
        // let isCasual = state.competitionFeesData[action.parentIndex]["isTeamCasual"];
        let isSeasonal = feeData.isTeamSeasonal;
        // if (isSeasonal && isCasual)
        //     state.competitionFeesData[action.parentIndex]["isTeamReg"] = true
        // else if (isSeasonal == false && isCasual == false)
        //     state.competitionFeesData[action.parentIndex]["isTeamReg"] = false

        if (isSeasonal == false) {
          feeData.teamRegChargeTypeRefId = null;
        } else if (isSeasonal) {
          feeData.teamRegChargeTypeRefId = 1;
        }
      }

      if (action.key == 'teamRegChargeTypeRefId') {
        feeData['teamRegChargeTypeRefId'] = action.data;
        updateTeamRegChargeType(feeData, action.data);
      }

      return {
        ...state,
        error: null,
      };

    case ApiConstants.API_ADD_EDIT_COMPETITION_FEES_SECTION:
      let array = JSON.parse(JSON.stringify(state.competitionFeesData));
      let index = array.findIndex(
        x => x.membershipProductUniqueKey == action.record.membershipProductUniqueKey,
      );
      if (index > -1) {
        if (array[index].isAllType === 'allDivisions') {
          if (action.key === 'fee') {
            array[index][action.arrayKey].allType[action.tableIndex].fee = Number(action.data);
            let gstAll = (Number(action.data) / 10).toFixed(2);
            let nominationFees =
              array[index][action.arrayKey].allType[action.tableIndex].nominationFees;
            let nominationGST =
              array[index][action.arrayKey].allType[action.tableIndex].nominationGST;
            array[index][action.arrayKey].allType[action.tableIndex].gst = gstAll ? gstAll : 0;
            array[index][action.arrayKey].allType[action.tableIndex].total = (
              Number(action.data) +
              Number(action.data / 10) +
              Number(action.record.mFees) +
              Number(nominationFees ? nominationFees : 0) +
              Number(nominationGST ? nominationGST : 0)
            ).toFixed(2);
          } else if (action.key === 'gst') {
            let fee = array[index][action.arrayKey].allType[action.tableIndex].fee;
            let nominationFees =
              array[index][action.arrayKey].allType[action.tableIndex].nominationFees;
            let nominationGST =
              array[index][action.arrayKey].allType[action.tableIndex].nominationGST;
            array[index][action.arrayKey].allType[action.tableIndex].gst = action.data
              ? action.data
              : 0;
            array[index][action.arrayKey].allType[action.tableIndex].total = (
              Number(fee) +
              Number(action.data) +
              Number(action.record.mFees) +
              Number(nominationFees) +
              Number(nominationGST)
            ).toFixed(2);
          } else if (action.key === 'affiliateFee') {
            let feesOwner =
              array[index][action.arrayKey].allType[action.tableIndex].fee +
              array[index][action.arrayKey].allType[action.tableIndex].gst +
              array[index][action.arrayKey].allType[action.tableIndex].nominationFees +
              array[index][action.arrayKey].allType[action.tableIndex].nominationGST;

            let affNominationFees =
              array[index][action.arrayKey].allType[action.tableIndex].affNominationFees;
            let affNominationGST =
              array[index][action.arrayKey].allType[action.tableIndex].affNominationGST;
            array[index][action.arrayKey].allType[action.tableIndex].affiliateFee = Number(
              action.data,
            );
            let affiliateGstAll = (Number(action.data) / 10).toFixed(2);
            array[index][action.arrayKey].allType[action.tableIndex].affiliateGst = affiliateGstAll
              ? affiliateGstAll
              : 0;
            array[index][action.arrayKey].allType[action.tableIndex].total = (
              Number(feesOwner) +
              Number(action.data) +
              Number(action.data / 10) +
              Number(action.record.mFees) +
              Number(affNominationFees) +
              Number(affNominationGST)
            ).toFixed(2);
          } else if (action.key === 'affiliateGst') {
            let feesOwner =
              array[index][action.arrayKey].allType[action.tableIndex].fee +
              array[index][action.arrayKey].allType[action.tableIndex].gst +
              array[index][action.arrayKey].allType[action.tableIndex].nominationFees +
              array[index][action.arrayKey].allType[action.tableIndex].nominationGST;
            let affNominationFees =
              array[index][action.arrayKey].allType[action.tableIndex].affNominationFees;
            let affNominationGST =
              array[index][action.arrayKey].allType[action.tableIndex].affNominationGST;
            let feeAffiliate =
              array[index][action.arrayKey].allType[action.tableIndex].affiliateFee;
            array[index][action.arrayKey].allType[action.tableIndex].affiliateGst = action.data
              ? action.data
              : 0;
            array[index][action.arrayKey].allType[action.tableIndex].total = (
              Number(feesOwner) +
              Number(feeAffiliate) +
              Number(action.data) +
              Number(action.record.mFees) +
              Number(affNominationFees) +
              Number(affNominationGST)
            ).toFixed(2);
          } else if (action.key === 'nominationFees') {
            array[index][action.arrayKey].allType[action.tableIndex].nominationFees = Number(
              action.data,
            );
            let gstAll = (Number(action.data) / 10).toFixed(2);
            let fee = array[index][action.arrayKey].allType[action.tableIndex].fee;
            let gst = array[index][action.arrayKey].allType[action.tableIndex].gst;
            array[index][action.arrayKey].allType[action.tableIndex].nominationGST = gstAll
              ? gstAll
              : 0;
            array[index][action.arrayKey].allType[action.tableIndex].total = (
              Number(action.data) +
              Number(action.data / 10) +
              (Number(action.record.mFees) + Number(fee) + Number(gst))
            ).toFixed(2);
          } else if (action.key === 'nominationGST') {
            let nominationFees =
              array[index][action.arrayKey].allType[action.tableIndex].nominationFees;
            let fee = array[index][action.arrayKey].allType[action.tableIndex].fee;
            let gst = array[index][action.arrayKey].allType[action.tableIndex].gst;
            array[index][action.arrayKey].allType[action.tableIndex].nominationGST = action.data
              ? action.data
              : 0;
            array[index][action.arrayKey].allType[action.tableIndex].total = (
              Number(nominationFees) +
              Number(action.data) +
              (Number(action.record.mFees) + Number(fee) + Number(gst))
            ).toFixed(2);
          } else if (action.key === 'affNominationFees') {
            let feesOwner =
              array[index][action.arrayKey].allType[action.tableIndex].fee +
              array[index][action.arrayKey].allType[action.tableIndex].gst +
              array[index][action.arrayKey].allType[action.tableIndex].nominationFees +
              array[index][action.arrayKey].allType[action.tableIndex].nominationGST;

            let affililateFee =
              array[index][action.arrayKey].allType[action.tableIndex].affiliateFee;
            let affiliateGst =
              array[index][action.arrayKey].allType[action.tableIndex].affiliateGst;

            array[index][action.arrayKey].allType[action.tableIndex].affNominationFees = Number(
              action.data,
            );
            let affNominationGstAll = (Number(action.data) / 10).toFixed(2);
            array[index][action.arrayKey].allType[action.tableIndex].affNominationGST =
              affNominationGstAll ? affNominationGstAll : 0;
            array[index][action.arrayKey].allType[action.tableIndex].total = (
              Number(feesOwner) +
              Number(action.data) +
              Number(action.data / 10) +
              Number(action.record.mFees) +
              Number(affililateFee) +
              Number(affiliateGst)
            ).toFixed(2);
          } else if (action.key === 'affNominationGST') {
            let feesOwner =
              array[index][action.arrayKey].allType[action.tableIndex].fee +
              array[index][action.arrayKey].allType[action.tableIndex].gst;
            let affililateFee =
              array[index][action.arrayKey].allType[action.tableIndex].affiliateFee;
            let affiliateGst =
              array[index][action.arrayKey].allType[action.tableIndex].affiliateGst;

            let affNominationFees =
              array[index][action.arrayKey].allType[action.tableIndex].affNominationFees;
            array[index][action.arrayKey].allType[action.tableIndex].affNominationGST = action.data
              ? action.data
              : 0;
            array[index][action.arrayKey].allType[action.tableIndex].total = (
              Number(feesOwner) +
              Number(affNominationFees) +
              Number(action.data) +
              Number(action.record.mFees) +
              Number(affililateFee) +
              Number(affiliateGst)
            ).toFixed(2);
          }
        } else {
          if (action.key === 'fee') {
            array[index][action.arrayKey].perType[action.tableIndex].fee = Number(action.data);
            let gstPer = (Number(action.data) / 10).toFixed(2);
            let nominationFees =
              array[index][action.arrayKey].perType[action.tableIndex].nominationFees;
            let nominationGST =
              array[index][action.arrayKey].perType[action.tableIndex].nominationGST;
            array[index][action.arrayKey].perType[action.tableIndex].gst = gstPer ? gstPer : 0;
            array[index][action.arrayKey].perType[action.tableIndex].total = (
              Number(action.data) +
              Number(action.data / 10) +
              Number(action.record.mFees) +
              Number(nominationFees) +
              Number(nominationGST)
            ).toFixed(2);
          } else if (action.key === 'gst') {
            let fee = array[index][action.arrayKey].perType[action.tableIndex].fee;
            let nominationFees =
              array[index][action.arrayKey].perType[action.tableIndex].nominationFees;
            let nominationGST =
              array[index][action.arrayKey].perType[action.tableIndex].nominationGST;
            array[index][action.arrayKey].perType[action.tableIndex].gst = action.data
              ? action.data
              : 0;
            array[index][action.arrayKey].perType[action.tableIndex].total = (
              Number(fee) +
              Number(action.data) +
              Number(action.record.mFees) +
              Number(nominationFees) +
              Number(nominationGST)
            ).toFixed(2);
          } else if (action.key === 'affiliateFee') {
            let feesOwner =
              array[index][action.arrayKey].perType[action.tableIndex].fee +
              array[index][action.arrayKey].perType[action.tableIndex].gst +
              array[index][action.arrayKey].perType[action.tableIndex].nominationFees +
              array[index][action.arrayKey].perType[action.tableIndex].nominationGST;

            let affNominationFees =
              array[index][action.arrayKey].perType[action.tableIndex].affNominationFees;
            let affNominationGST =
              array[index][action.arrayKey].perType[action.tableIndex].affNominationGST;

            array[index][action.arrayKey].perType[action.tableIndex].affiliateFee = Number(
              action.data,
            );
            let affiliateGstPer = (Number(action.data) / 10).toFixed(2);
            array[index][action.arrayKey].perType[action.tableIndex].affiliateGst = affiliateGstPer
              ? affiliateGstPer
              : 0;
            array[index][action.arrayKey].perType[action.tableIndex].total = (
              Number(feesOwner) +
              Number(action.data) +
              Number(action.data / 10) +
              Number(action.record.mFees) +
              Number(affNominationFees) +
              Number(affNominationGST)
            ).toFixed(2);
          } else if (action.key === 'affiliateGst') {
            let feesOwner =
              array[index][action.arrayKey].perType[action.tableIndex].fee +
              array[index][action.arrayKey].perType[action.tableIndex].gst;
            let feeAffiliate =
              array[index][action.arrayKey].perType[action.tableIndex].affiliateFee;
            let affNominationFees =
              array[index][action.arrayKey].perType[action.tableIndex].affNominationFees;
            let affNominationGST =
              array[index][action.arrayKey].perType[action.tableIndex].affNominationGST;

            array[index][action.arrayKey].perType[action.tableIndex].affiliateGst = action.data
              ? action.data
              : 0;
            array[index][action.arrayKey].perType[action.tableIndex].total = (
              Number(feesOwner) +
              Number(feeAffiliate) +
              Number(action.data) +
              Number(action.record.mFees) +
              Number(affNominationFees) +
              Number(affNominationGST)
            ).toFixed(2);
          } else if (action.key === 'nominationFees') {
            array[index][action.arrayKey].perType[action.tableIndex].nominationFees = Number(
              action.data,
            );
            let gstAll = (Number(action.data) / 10).toFixed(2);
            let fee = array[index][action.arrayKey].perType[action.tableIndex].fee;
            let gst = array[index][action.arrayKey].perType[action.tableIndex].gst;
            array[index][action.arrayKey].perType[action.tableIndex].nominationGST = gstAll
              ? gstAll
              : 0;
            array[index][action.arrayKey].perType[action.tableIndex].total = (
              Number(action.data) +
              Number(action.data / 10) +
              (Number(action.record.mFees) + Number(fee) + Number(gst))
            ).toFixed(2);
          } else if (action.key === 'nominationGST') {
            let nominationFees =
              array[index][action.arrayKey].perType[action.tableIndex].nominationFees;
            let fee = array[index][action.arrayKey].perType[action.tableIndex].fee;
            let gst = array[index][action.arrayKey].perType[action.tableIndex].gst;
            array[index][action.arrayKey].perType[action.tableIndex].nominationGST = action.data
              ? action.data
              : 0;
            array[index][action.arrayKey].perType[action.tableIndex].total = (
              Number(nominationFees) +
              Number(action.data) +
              (Number(action.record.mFees) + Number(fee) + Number(gst))
            ).toFixed(2);
          } else if (action.key === 'affNominationFees') {
            let feesOwner =
              array[index][action.arrayKey].perType[action.tableIndex].fee +
              array[index][action.arrayKey].perType[action.tableIndex].gst +
              array[index][action.arrayKey].perType[action.tableIndex].nominationFees +
              array[index][action.arrayKey].perType[action.tableIndex].nominationGST;
            let affililateFee =
              array[index][action.arrayKey].perType[action.tableIndex].affiliateFee;
            let affiliateGst =
              array[index][action.arrayKey].perType[action.tableIndex].affiliateGst;

            array[index][action.arrayKey].perType[action.tableIndex].affNominationFees = Number(
              action.data,
            );
            let affNominationGstAll = (Number(action.data) / 10).toFixed(2);
            array[index][action.arrayKey].perType[action.tableIndex].affNominationGST =
              affNominationGstAll ? affNominationGstAll : 0;
            array[index][action.arrayKey].perType[action.tableIndex].total = (
              Number(feesOwner) +
              Number(action.data) +
              Number(action.data / 10) +
              Number(action.record.mFees) +
              Number(affililateFee) +
              Number(affiliateGst)
            ).toFixed(2);
          } else if (action.key === 'affNominationGST') {
            let feesOwner =
              array[index][action.arrayKey].perType[action.tableIndex].fee +
              array[index][action.arrayKey].perType[action.tableIndex].gst;
            let affililateFee =
              array[index][action.arrayKey].perType[action.tableIndex].affiliateFee;
            let affiliateGst =
              array[index][action.arrayKey].perType[action.tableIndex].affiliateGst;

            let affNominationFees =
              array[index][action.arrayKey].perType[action.tableIndex].affNominationFees;
            array[index][action.arrayKey].perType[action.tableIndex].affNominationGST = action.data
              ? action.data
              : 0;
            array[index][action.arrayKey].perType[action.tableIndex].total = (
              Number(feesOwner) +
              Number(affNominationFees) +
              Number(action.data) +
              Number(action.record.mFees) +
              Number(affililateFee) +
              Number(affiliateGst)
            ).toFixed(2);
          }
        }
        state.competitionFeesData = array;
      }

      return {
        ...state,
      };

    case ApiConstants.API_COMPETITION_FEE_DEFAULT_CHARITY_LOAD:
      return { ...state, onLoad: true, error: null };

    //get charity and govt voucher  from init api
    case ApiConstants.API_COMPETITION_FEE_DEFAULT_CHARITY_SUCCESS:
      let charityDataArr = getCharityResult(action.charityResult);
      let govtVocuherDataArr = getCharityResult(action.govtVoucherResult);
      state.charityRoundUp = charityDataArr;
      state.govtVoucher = govtVocuherDataArr;
      return {
        ...state,
        charityRoundUp: charityDataArr,
        govtVoucher: govtVocuherDataArr,
        onLoad: false,
        error: null,
      };

    case ApiConstants.API_SAVE_COMPETITION_FEES_SECTION_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_SAVE_COMPETITION_FEES_SECTION_SUCCESS:
      let allData1 = action.result.data;
      return {
        ...state,
        competitionPaymentsData: allData1.competitionpayments,
        onLoad: false,
        status: action.status,
        error: null,
      };

    ///clearing particular reducer data
    case ApiConstants.REG_COMPETITION_FEES_CLEARING_REDUCER_DATA:
      if (action.dataName === 'all') {
        const defaultDetailObj = {
          loaded: null,
          competitionUniqueKey: '',
          competitionName: '',
          description: '',
          competitionTypeRefId: 1,
          competitionFormatRefId: 1,
          startDate: null,
          noOfRounds: '',
          roundInDays: '',
          roundInHours: '',
          roundInMins: '',
          registrationCloseDate: null,
          competitionLogoUrl: null,
          minimunPlayers: '',
          maximumPlayers: '',
          venues: [],
          nonPlayingDates: [],
          invitees: [],
          selectedVenuesIds: [],
          logoIsDefault: false,
          yearRefId: 1,
          statusRefId: 1,
          hasRegistration: 0,
          playerPublishTypeRefId: 1,
        };
        state.competitionDetailData = defaultDetailObj;
        state.competitionId = '';
        state.postVenues = state.selectedVenuesAdd == null ? [] : state.postVenues;
        state.postInvitees = [];
        state.selectedVenues = state.selectedVenuesAdd == null ? [] : state.selectedVenues;
        state.selectedInvitees = [];
        state.competitionDivisionsData = null;
        state.competitionFeesData = [];
        state.selectedCasualFee = [];
        state.selectedCasualTeamFee = [];
        state.SelectedSeasonalFee = [];
        state.selectedSeasonalTeamFee = [];
        state.SelectedSeasonalFeeKey = [];
        state.selectedCasualFeeKey = [];
        state.selectedSeasonalTeamFeeKey = [];
        state.seasonalExpendedKey = null;
        state.casusalExpendedKey = null;
        state.seasonalTeamExpendedKey = null;
        state.selectedPaymentMethods = [];

        // state.charityRoundUp = []
        // state.govtVoucher = []
        state.competionDiscountValue.competitionDiscounts[0].discounts = [];
        state.charityTitle = '';
        state.charityDescription = '';
        const paymentOptionObject = {
          paymentOptions: [],
          charityRoundUp: [],
        };
        state.competitionPaymentsData = paymentOptionObject;
        state.affiliateSelected = null;
        state.otherSelected = null;
        state.anyOrgSelected = null;
        state.nonSelected = null;
        state.invitedTo = [];
        state.invitedOrganisation = [];

        state.associationLeague = [];
        state.clubSchool = [];

        state.affiliateNonSelected = null;
        state.anyOrgNonSelected = 'none2';

        state.affiliateArray = [];
        state.anyOrgAffiliateArr = [];
        state.any_club_Org_AffiliateArr = [];
        state.selectedTeamSeasonalInstalmentDates = [];
        state.selectedSeasonalInstalmentDates = [];
        state.associationChecked = false;
        state.clubChecked = false;
        state.anyOrgAssociationArr = [];
        state.anyOrgClubArr = [];
        state.stateAllowsPlayerReplication = false;
      }
      return {
        ...state,
        error: null,
      };

    //////get the default competition logo api
    case ApiConstants.API_COMPETITION_FEE_DEFAULT_LOGO_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_COMPETITION_FEE_DEFAULT_LOGO_SUCCESS:
      if (state.competitionId.length == 0 || state.competitionId == null) {
        state.competitionDetailData.competitionLogoUrl = action.result.data.logoUrl;
        state.competitionDetailData.logoIsDefault = true;
      }
      return {
        ...state,
        onLoad: false,
        error: null,
        defaultCompFeesOrgLogoData: action.result.data,
        defaultCompFeesOrgLogo: action.result.data.logoUrl,
      };

    case ApiConstants.API_ADD_VENUE_SUCCESS:
      let venueSuccess = action.result;
      if (
        venueSuccess != null &&
        (venueSuccess.screenNavigationKey == AppConstants.competitionFees ||
          venueSuccess.screenNavigationKey == AppConstants.competitionDetails ||
          venueSuccess.screenNavigationKey == AppConstants.dashboard)
      ) {
        let updatedVenue = JSON.parse(JSON.stringify(state.newVenueObj));
        updatedVenue['id'] = venueSuccess.venueId;
        updatedVenue['name'] = venueSuccess.name;
        updatedVenue['street1'] = venueSuccess.street1;
        updatedVenue['street2'] = venueSuccess.street2;
        updatedVenue['suburb'] = venueSuccess.suburb;
        updatedVenue['postalCode'] = venueSuccess.postalCode;
        updatedVenue['stateRefId'] = venueSuccess.stateRefId;
        updatedVenue['statusRefId'] = venueSuccess.statusRefId;
        updatedVenue['contactNumber'] = venueSuccess.contactNumber;
        state.venueList.push(updatedVenue);
        state.selectedVenuesAdd = 'Add';
        state.selectedVenues.push(venueSuccess.venueId);
        state.createVenue = action.result;
      }
      return { ...state };

    case ApiConstants.API_AFFILIATE_TO_ORGANISATION_SUCCESS:
      let affiliateToAllData = action.result;
      let affiliateToData = affiliateToAllData
        ? isArrayNotEmpty(affiliateToAllData.affiliatedTo)
          ? affiliateToAllData.affiliatedTo
          : []
        : [];
      let associationArray = affiliateToData.filter(data => data.organisationtypeRefId == 3);
      let clubArray = affiliateToData.filter(data => data.organisationtypeRefId == 4);
      state.associationAffilites = associationArray;
      state.clubAffilites = clubArray;
      return {
        ...state,
        onLoad: false,
        error: null,
      };

    ///// Invitee Search Reducer
    case ApiConstants.API_COMPETITION_FEE_INVITEES_SEARCH_LOAD:
      return {
        ...state,
        searchLoad: true,
      };

    case ApiConstants.API_COMPETITION_FEE_INVITEES_SEARCH_SUCCESS:
      if (action.inviteesType == 3) {
        state.associationAffilites = action.result;
      } else {
        state.clubAffilites = action.result;
      }

      return {
        ...state,
        searchLoad: false,
      };

    case ApiConstants.API_COMPETITION_DIVISION_DELETE_LOAD:
      return { ...state, deleteDivisionLoad: true };

    case ApiConstants.API_COMPETITION_DIVISION_DELETE_SUCCESS:
      return {
        ...state,
        deleteDivisionLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.UPDATE_INSTALMENT_DATE:
      if (action.key === 'instalmentAddDate' && action.subKey === 'seasonalfee') {
        addInstalmentDate(action.value);
      }
      if (action.key === 'instalmentRemoveDate') {
        removeInstalmentDate(action.value);
      }
      if (action.key === 'instalmentDateupdate') {
        updateInstalmentDate(action.value);
      }
      if (action.key === 'instalmentAddDate' && action.subKey === 'seasonalteamfee') {
        addSeasonalTeamInstalmentDate(action.value);
      }
      if (action.key === 'isSeasonalUponReg' || action.key === 'isTeamSeasonalUponReg') {
        state.competitionDetailData[action.key] = action.value;
      }
      if (action.key === 'teamSeasonalSchoolRegCode') {
        state.competitionDetailData[action.key] = action.value;
      }
      if (action.key === 'seasonalSchoolRegCode') {
        state.competitionDetailData[action.key] = action.value;
      }
      return { ...state };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.competitionListAction = null;
      return { ...state, onLoad: false };

    case ApiConstants.SET_REGISTRATION_COMPETITION_LIST_PAGE_SIZE:
      return {
        ...state,
        pageSize: action.pageSize,
      };

    case ApiConstants.SET_REGISTARTION_COMPETITION_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        regCompetitonFeeListPage: action.pageNum,
      };

    case ApiConstants.UPDATE_COMPETITION_GRADES_POOLS:
      let oldData = state.competitionGradePoolsData;
      let updatedValue = action.updatedData;
      let getKey = action.key;
      let gradePoolId = action.gradePoolId;
      if (getKey === 'addCompetitionGradePool') {
        state.competitionGradePoolsData = [
          ...state.competitionGradePoolsData,
          {
            ...competitionGradeInitialData,
            compGradeNamingTemplateId: -state.competitionGradePoolsData.length,
          },
        ];
      } else if (getKey === 'deleteCompetitionGradePool') {
        state.competitionGradePoolsData = state.competitionGradePoolsData.filter(
          gradePool => gradePool.compGradeNamingTemplateId !== updatedValue,
        );
      } else if (getKey === 'allDivision') {
        state.isAllDivisionChecked = updatedValue;
      } else if (getKey === 'gradeTypeRefId') {
        state.competitionGradePoolsData = oldData.map(data => {
          if (data.compGradeNamingTemplateId === gradePoolId) {
            data[getKey] = updatedValue;
          }
          return data;
        });
      } else if (getKey === 'competitionGradePoolsData') {
        state.competitionGradePoolsData = [...updatedValue];
      } else if (getKey === 'customTeamGrades') {
        state.competitionGradePoolsData = oldData.map(data => {
          if (data.compGradeNamingTemplateId === gradePoolId) {
            if (!data[getKey] || (Array.isArray(data[getKey]) && !isArrayNotEmpty(data[getKey]))) {
              data[getKey] = [updatedValue];
            } else if (isArrayNotEmpty(data[getKey])) {
              const foundCustomTeamGrade = data[getKey].find(
                customTeamGrade => customTeamGrade.gradeRefId === updatedValue.gradeRefId,
              );

              if (!foundCustomTeamGrade) {
                data[getKey] = [...data[getKey], updatedValue];
              } else {
                data[getKey] = data[getKey].map(customTeamGrade => {
                  if (customTeamGrade.gradeRefId === updatedValue.gradeRefId) {
                    customTeamGrade = {
                      ...customTeamGrade,
                      name: updatedValue.name,
                    };
                  }
                  return customTeamGrade;
                });
              }
            }
          }
          return data;
        });
      } else {
        oldData[getKey] = updatedValue;
      }
      return { ...state, error: null };

    default:
      return state;
  }
}

export default competitionFees;
