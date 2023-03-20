import { cloneDeep } from 'lodash';
import ApiConstants from '../../../themes/apiConstants';
// import history from "../../../util/history";
import { deepCopyFunction, isArrayNotEmpty, isNotNullOrEmptyString } from '../../../util/helpers';
import { FLAVOUR, OrganisationType, REGISTRATION_QUESTIONS } from '../../../util/enums';
import { isNationalProductEnabled } from 'util/registrationHelper';

const GstKeyArray = ['casualGst', 'seasonalGst'];

const FeeKeyArray = ['casualFee', 'seasonalFee'];

const membershipCapListDefObj = {
  membershipCapId: 0,
  organisationId: '',
  isAllMembershipProduct: 0,
  productsInfo: [],
  products: [],
  productsTemp: [],
  feeCaps: [
    {
      membershipFeeCapId: 0,
      dobFrom: null,
      dobTo: null,
      amount: null,
    },
  ],
};

const newObjvalue = {
  orgRegistrationId: 0,
  yearRefId: 1,
  statusRefId: '',
  competitionUniqueKeyId: '',
  registrationOpenDate: '',
  registrationCloseDate: '',
  membershipProductTypes: [],
  specialNote: '',
  replyName: '',
  replyRole: '',
  replyEmail: '',
  replyPhone: '',
  trainingDaysAndTimes: '',
  trainingVenueId: null,
  trainingVenueText: null,
  registerMethods: [],
  registrationSettings: [],
  registrationDisclaimer: [],
  hardShipCodes: [],
};
const regFormChecked = {
  replyName: false,
  replyRole: false,
  replyEmail: false,
  replyPhone: false,
  venueVisible: false,
  venueListVisible: false,
  venueTextVisible: false,
  daysVisible: false,
  replyContactVisible: false,
  trainingVisible: false,
};
const initialState = {
  onLoad: false,
  onloadRegSettings: false,
  onLoadMembership: false,
  onLoadMembershipProduct: false,
  onRegistrationSaveLoad: false,
  error: null,
  result: null,
  status: 0,
  regMembershipFeeListData: [], ////////registration membership fees list
  regMembershipFeeListPage: 1,
  regMembershipFeeListTotalCount: 1,
  regMembershipFeeListPageSize: 10,
  getMembershipProductDetails: null, ////get membership product details
  getDefaultMembershipProductTypes: [],
  getRegFormCompetition: [], /// get registration form
  registrationFormData: JSON.parse(JSON.stringify([newObjvalue])),
  sendRegistrationFormData: JSON.parse(JSON.stringify([newObjvalue])),
  membershipProductFeesTableData: null,
  membershipProductDiscountType: [],
  membershipDiscountObject: {
    membershipProductTypeMappingId: 'Select',
    membershipProductTypeDiscountId: 0,
    membershipPrdTypeDiscountTypeRefId: 0,
    amount: '',
    description: '',
    availableFrom: null,
    availableTo: null,
    discountTypeRefId: 1,
    discountCode: '',
    applyDiscount: 0,
    question: '',
    childDiscounts: [],
  },
  membershipProductDiscountData: {
    membershipProductId: 'c282f3c0-6a98-457f-8feb-0eb33e5cd364',
    statusRefId: 1,
    membershipProductDiscounts: [
      {
        discounts: [],
      },
    ],
  },
  membershipProductId: '',
  membershipProductCategoryRefId: null,
  applyRegistrationDates: false,
  atMatchFeesEnabled: false,
  registrationDates: {
    fromDate: null,
    toDate: null,
  },
  parentMembershipProductsDetail: [],
  parentOrganisationTypeRefId: null,
  selectedYearForParentMembershipProducts: null,
  selectedParentMembershipProduct: null,
  selectedMemberShipType: [],
  membershipProductTypes: [],
  selectedProductName: [],
  defaultChecked: regFormChecked,
  defaultCompetitionID: '',
  allDivisionsData: [],
  selectedInvitees: [],
  expendKeyArr: [],
  defaultRegistrationSettings: [],
  defaultRegistrationMethod: [],
  selectedMethod: [],
  defaultMembershipProduct: [],
  selectedDemographic: [],
  selectedNetballQuestions: [],
  SelectedOtherQuestions: [],
  reg_settings: [],
  reg_demoSetting: [],
  reg_NetballSetting: [],
  reg_QuestionsSetting: [],
  teamRegistrationTableData: {
    page: {},
    teamRegistrations: [],
  },
  teamRegistrationTableListPageSize: 10,
  teamRegListAction: null,
  regMembershipListAction: null,
  canInviteSend: 0,
  membershipFeeCapList: [],
  membershipFeeCapListCopy: [],
  updateMembershipFeeCapOnLoad: false,
  isAllMembershipProductChanged: false,
  stateCap: null,
  loadingExternalMembershipTypes: false,
  externalMembership: null,
  externalRegistrations: {
    loading: false,
    registrations: [],
    totalCount: 0,
    filters: {
      offset: 0,
      limit: 10,
    },
    page: {
      currentPage: 1,
      pageSize: 10,
    },
  },
};

//get selected expendable key
// function getExpendableKey(keyArray) {
//   let keyArr = []
//   for (let i in keyArray) {
//     if (keyArray[i] == "2" || keyArray[i] == "3" || keyArray[i] == "4") {
//       keyArr.push("1")
//       break
//     }

//   }
//   return keyArr
// }

// selected methods

function checkSlectedMethod(array) {
  let selectedMethodArr = [];
  if (array) {
    for (let i in array) {
      selectedMethodArr.push(array[i].registrationMethodRefId);
    }
  }
  return selectedMethodArr;
}

//get selected invitees
function checkSlectedInvitees(
  result,
  reg_demoSetting,
  reg_NetballSetting,
  reg_QuestionsSetting,
  reg_settings,
) {
  let selectedAdvanceSettings = [];
  let selectedDemographic = [];
  let selectedNetballQuestions = [];
  let SelectedOtherQuestions = [];

  if (result) {
    for (let i in result) {
      // if (result[i].registrationSettingsRefId == 13 || result[i].registrationSettingsRefId == 14
      //   || result[i].registrationSettingsRefId == 15 || result[i].registrationSettingsRefId == 16) {
      //   selectedDemographic.push(result[i].registrationSettingsRefId)
      //   reg_demoSetting.push(result[i])

      // }
      if (result[i].registrationSettingsRefId >= 7 && result[i].registrationSettingsRefId <= 14) {
        selectedNetballQuestions.push(result[i].registrationSettingsRefId.toString());
        reg_NetballSetting.push(result[i]);
      }
      // else if (result[i].registrationSettingsRefId == 8 || result[i].registrationSettingsRefId == 9 ||
      //   result[i].registrationSettingsRefId == 12 || result[i].registrationSettingsRefId == 11) {
      //   SelectedOtherQuestions.push(result[i].registrationSettingsRefId)
      //   reg_QuestionsSetting.push(result[i])
      // }
      else if (
        result[i].registrationSettingsRefId == 1 ||
        result[i].registrationSettingsRefId == 5 ||
        result[i].registrationSettingsRefId == 7 ||
        result[i].registrationSettingsRefId == 2 ||
        result[i].registrationSettingsRefId == 3 ||
        result[i].registrationSettingsRefId == 4
      ) {
        selectedAdvanceSettings.push(result[i].registrationSettingsRefId.toString());
        reg_settings.push(result[i]);
      }
    }
  }
  return {
    selectedAdvanceSettings,
    selectedDemographic,
    selectedNetballQuestions,
    SelectedOtherQuestions,
  };
}
//update registration form method
function getRegistrationFormMethod(selectedMethod, reg_method) {
  let postMethodArr = [];
  for (let i in selectedMethod) {
    let selected_Method = checkExistingMethod(reg_method, selectedMethod[i]);
    let MethodObject = null;
    if (selected_Method.status == false) {
      MethodObject = {
        registrationMethodId: 0,
        registrationMethodRefId: selectedMethod[i],
      };
    } else {
      MethodObject = {
        registrationMethodId: selected_Method.result.registrationMethodId,
        registrationMethodRefId: selectedMethod[i],
      };
    }

    postMethodArr.push(MethodObject);
  }
  return postMethodArr;
}

///check exisiting method

function checkExistingMethod(reg_method, selectedMethodId) {
  let methodObj = {
    status: false,
    result: [],
  };

  if (reg_method) {
    for (let i in reg_method) {
      if (reg_method[i].registrationMethodRefId == selectedMethodId) {
        methodObj = {
          status: true,
          result: reg_method[i],
        };

        break;
      }
    }
  }

  return methodObj;
}

//checkExistingSettings
function checkExistingSettings(settingArr, settingID) {
  let object = {
    status: false,
    result: [],
  };

  if (settingArr) {
    for (let i in settingArr) {
      if (settingArr[i].registrationSettingsRefId == settingID) {
        object = {
          status: true,
          result: settingArr[i],
        };

        break;
      }
    }
  }

  return object;
}

//get registration form setting
function getResitrationFormSettings(selectedSettings, reg_settings) {
  let postArr = [];
  for (let i in selectedSettings) {
    let selected_settings = checkExistingSettings(reg_settings, selectedSettings[i]);
    let settingObject = null;

    if (selected_settings.status == false) {
      settingObject = {
        registrationSettingsId: 0,
        registrationSettingsRefId: selectedSettings[i],
      };
    } else {
      settingObject = {
        registrationSettingsId: selected_settings.result.registrationSettingsId,
        registrationSettingsRefId: selectedSettings[i],
      };
    }
    postArr.push(settingObject);
  }
  return postArr;
}

// get selection of cheked in reg form
function getSelectedCheck(obj, regFormData) {
  if (regFormData[0].trainingDaysAndTimes.length > 0) {
    obj.trainingVisible = true;
    obj.daysVisible = true;
  }
  if (regFormData[0].trainingVenueId !== null) {
    obj.trainingVisible = true;
    obj.venueVisible = true;
    obj.venueListVisible = true;
  } else if (regFormData[0].trainingVenueText !== null) {
    obj.trainingVisible = true;
    obj.venueVisible = true;
    obj.venueTextVisible = true;
  }
  if (regFormData[0].replyName.length > 0) {
    obj.replyContactVisible = true;
    obj.replyName = true;
  }
  if (regFormData[0].replyEmail.length > 0) {
    obj.replyContactVisible = true;
    obj.replyEmail = true;
  }
  if (regFormData[0].replyPhone.length > 0) {
    obj.replyContactVisible = true;
    obj.replyPhone = true;
  }
  if (regFormData[0].replyRole.length > 0) {
    obj.replyContactVisible = true;
    obj.replyRole = true;
  }
  return obj;
}
//\make  product array
function makeProducrTypeArr(data, selected) {
  for (let i in data) {
    if (selected.length > 0) {
      let selectedType = selected.find(x => x.id == data[i].id);
      if (selectedType) {
        data[i]['isSelected'] = true;
        data[i].registrationLock = selectedType.registrationLock;
        data[i].registrationCap = selectedType.registrationCap;
        data[i].teamRegistrationCap = selectedType.teamRegistrationCap;
        data[i].isPublic = selectedType.isPublic;
        data[i].isTeamPublic = selectedType.isTeamPublic;
      } else {
        data[i]['isSelected'] = false;
      }
    } else {
      data[i]['isSelected'] = false;
    }
  }

  return data;
}

// for check is selected in table of form or not
function getProductArr(value, selected) {
  let newArr = [];
  for (let i in value) {
    let object = {
      membershipProductName: value[i].membershipProductName,
      membershipProductId: value[i].membershipProductId,
      membershipProductTypes: makeProducrTypeArr(value[i].membershipProductTypes, selected),
    };
    newArr.push(object);
  }
  return newArr;
}
// for updated and fillter Data of membership product
function getNewProdcutData(productArr, valueData) {
  let filterObject = productArr.filter(function (o1) {
    return valueData.some(function (o2) {
      return o1.membershipProductId === o2;
    });
  });
  return filterObject;
}

/// for check product exist in Array or not
function checkExistngProductId(productArr, id) {
  // let status = false;
  for (let i in productArr) {
    if (productArr[i] === id) {
      return true;
    }
  }
  return false;
}

/////fillter Data of membership Product
function getFillteredData(getFormData, productListArray, selectedMemberShipType) {
  let memberShipSelectedArr = getFormData ? getFormData[0].membershipProductTypes : [];

  let productArr = [];
  if (productListArray.length > 0) {
    if (memberShipSelectedArr.length > 0) {
      for (let i in memberShipSelectedArr) {
        if (productArr.length == 0) {
          productArr.push(memberShipSelectedArr[i].membershipProductId);
          let matchIndex = productListArray.findIndex(
            x => x.membershipProductId == memberShipSelectedArr[i].membershipProductId,
          );
          selectedMemberShipType.push(productListArray[matchIndex]);
        } else {
          if (!checkExistngProductId(productArr, memberShipSelectedArr[i].membershipProductId)) {
            productArr.push(memberShipSelectedArr[i].membershipProductId);
            let matchIndex = productListArray.findIndex(
              x => x.membershipProductId == memberShipSelectedArr[i].membershipProductId,
            );
            selectedMemberShipType.push(productListArray[matchIndex]);
          }
        }
      }
    } else {
    }
  }
  return productArr;
}

function checkDefaultProduct(checkProduct, defaultProductArr) {
  let prd_obj = {
    status: false,
    result: [],
  };
  for (let i in defaultProductArr) {
    if (defaultProductArr[i].id == checkProduct) {
      prd_obj = {
        status: true,
        result: defaultProductArr[i],
      };
      break;
    }
  }
  return prd_obj;
}

//// Final selected product arr

function makeFinalProductArr(arr, defaultMembershipProduct) {
  let array = [];
  let selectedObj;
  for (let i in arr) {
    let typesArray = arr[i].membershipProductTypes;
    for (let j in typesArray) {
      if (typesArray[j].isSelected) {
        let matchDefaultProduct = checkDefaultProduct(typesArray[j].id, defaultMembershipProduct);
        if (matchDefaultProduct.status) {
          selectedObj = {
            orgRegMemProTypeId: matchDefaultProduct.result.orgRegMemProTypeId,
            divisionId: typesArray[j].divisionId,
            divisionName: typesArray[j].divisionName,
            registrationLock: typesArray[j].registrationLock,
            membershipProductId: typesArray[j].membershipProductId,
            membershipProductTypeId: typesArray[j].membershipProductTypeId,
            membershipProductTypeMappingId: typesArray[j].membershipProductTypeMappingId,
            id: typesArray[j].id,
            isIndividualRegistration: typesArray[j].isIndividualRegistration,
            isTeamRegistration: typesArray[j].isTeamRegistration,
            registrationCap: typesArray[j].registrationCap,
            teamRegistrationCap: typesArray[j].teamRegistrationCap,
            isPublic: typesArray[j].isPublic,
            isTeamPublic: typesArray[j].isTeamPublic,
          };
        } else {
          selectedObj = {
            orgRegMemProTypeId: 0,
            divisionId: typesArray[j].divisionId,
            divisionName: typesArray[j].divisionName,
            registrationLock: typesArray[j].registrationLock,
            membershipProductId: typesArray[j].membershipProductId,
            membershipProductTypeId: typesArray[j].membershipProductTypeId,
            membershipProductTypeMappingId: typesArray[j].membershipProductTypeMappingId,
            id: typesArray[j].id,
            isIndividualRegistration: typesArray[j].isIndividualRegistration,
            isTeamRegistration: typesArray[j].isTeamRegistration,
            registrationCap: typesArray[j].registrationCap,
            teamRegistrationCap: typesArray[j].teamRegistrationCap,
            isPublic: typesArray[j].isPublic,
            isTeamPublic: typesArray[j].isTeamPublic,
          };
        }
        array.push(selectedObj);
      }
    }
  }
  return array;
}

function getAffiliateProduct(state, payload) {
  if (
    state.getMembershipProductDetails?.membershipproduct?.parentMembershipProductId &&
    !state.selectedParentMembershipProduct &&
    payload
  ) {
    return (
      payload.find(
        ({ membershipproduct }) =>
          membershipproduct.id ===
          state.getMembershipProductDetails?.membershipproduct?.parentMembershipProductId,
      ) || null
    );
  }
  return null;
}

//////function for adding default fees object in the fees table array
function feesDataObject(allMembershipData, membershipProductName, selectedParentMembershipProduct) {
  let feesTableData = [];
  let membershipTypesSelected = allMembershipData.membershipproduct.membershipProductTypes;
  let feesApiData = allMembershipData.membershipproductfee.membershipFees;
  let affiliateMembershipFees = [];
  let isParentState = false;
  if (selectedParentMembershipProduct) {
    affiliateMembershipFees = selectedParentMembershipProduct.membershipproductfee.membershipFees;
    isParentState =
      selectedParentMembershipProduct.membershipproduct.organisationTypeRefId ==
      OrganisationType.State;
  }

  const feeKeys = [...GstKeyArray, ...FeeKeyArray];
  let data = membershipTypesSelected;
  for (let i in data) {
    let feesTableObject = null;
    if (feesApiData == null) {
      let affiliateFee;
      if (affiliateMembershipFees.length > 0) {
        affiliateFee = affiliateMembershipFees.find(
          item => item.membershipProductTypeRefName === data[i].membershipProductTypeRefName,
        );
      }
      feesTableObject = {
        casualFee: 0,
        casualGst: 0,
        seasonalFee: 0,
        seasonalGst: 0,
        validityDays: affiliateFee ? affiliateFee.validityDays : null,
        extendEndDate: affiliateFee ? affiliateFee.extendEndDate : null,
        extendToEndOfCompetition: affiliateFee ? affiliateFee.extendToEndOfCompetition : 0,
        allowOneTimeRegistrationOnly: affiliateFee ? affiliateFee.allowOneTimeRegistrationOnly : 0,
        organisationId: 1,
        membershipProductName: membershipProductName,
        membershipProductFeesId: 0,
        membershipProductTypeRefName: data[i].membershipProductTypeRefName,
        isPlaying: data[i].isPlaying,
        isOfficial: data[i].isOfficial,
        membershipProductFeesTypeRefId: 1,
        membershipProductTypeMappingId: data[i].membershipProductTypeMappingId,
        editableIndex: parseInt(i),
        parentState: getEmptyOrgFee(),
        national: null,
        stateFee: null,
      };
      feesTableObject.parentMembershipProductFeesId = affiliateFee
        ? affiliateFee.membershipProductFeesId
        : null;
      if (isNationalProductEnabled) {
        if (isParentState) {
          feesTableObject.national = affiliateFee ? affiliateFee.national : getEmptyOrgFee();
        } else {
          feesTableObject.national = getEmptyOrgFee();
          setParentOrgFee(feesTableObject.national, affiliateFee);
        }
      }
      if (affiliateFee && isParentState) {
        setParentOrgFee(feesTableObject.parentState, affiliateFee);
      }

      feesTableData.push(feesTableObject);
    } else {
      let item = data[i];
      let mappedMembershipTypeIndex = feesApiData.findIndex(
        x => x.membershipProductTypeMappingId == item.membershipProductTypeMappingId,
      );
      if (mappedMembershipTypeIndex > -1) {
        feesApiData[mappedMembershipTypeIndex]['editableIndex'] = parseInt(i);

        feesApiData[mappedMembershipTypeIndex].validityDays =
          feesApiData[mappedMembershipTypeIndex].validityDays == 0
            ? null
            : feesApiData[mappedMembershipTypeIndex].validityDays;

        const membershipFee = { ...feesApiData[mappedMembershipTypeIndex] };
        feeKeys.forEach(key => {
          const fee = membershipFee[key];
          if (fee) {
            membershipFee[key] = Math.max(0, Number(fee));
          }
        });
        feesTableData.push(membershipFee);
      } else {
        feesTableObject = {
          casualFee: 0,
          casualGst: 0,
          seasonalFee: 0,
          seasonalGst: 0,
          organisationId: 1,
          membershipProductName: membershipProductName,
          membershipProductFeesId: 0,
          membershipProductTypeRefName: data[i].membershipProductTypeRefName,
          isPlaying: data[i].isPlaying,
          isOfficial: data[i].isOfficial,
          membershipProductFeesTypeRefId: 1,
          membershipProductTypeMappingId: data[i].membershipProductTypeMappingId,
          editableIndex: parseInt(i),
          parentState: getEmptyOrgFee(),
        };
        feesTableObject.parentMembershipProductFeesId = null;
        if (process.env.REACT_APP_FLAVOUR === FLAVOUR.Football) {
          feesTableObject.national = getEmptyOrgFee();
        }
        feesTableData.push(feesTableObject);
      }
    }
  }
  return feesTableData;
}
function getEmptyOrgFee() {
  return {
    organisationId: null,
    casualFee: 0,
    casualGst: 0,
    seasonalFee: 0,
    seasonalGst: 0,
    membershipProductName: '',
  };
}
function setParentOrgFee(orgFeeObj, affiliateFee) {
  orgFeeObj.casualFee = affiliateFee ? affiliateFee.casualFee : 0;
  orgFeeObj.casualGst = affiliateFee ? affiliateFee.casualGst : 0;
  orgFeeObj.seasonalFee = affiliateFee ? affiliateFee.seasonalFee : 0;
  orgFeeObj.seasonalGst = affiliateFee ? affiliateFee.seasonalGst : 0;
  orgFeeObj.organisationId = affiliateFee ? affiliateFee.organisationId : null;
  orgFeeObj.membershipProductName = affiliateFee?.membershipProductName;
}
//////function for adding default discount object in the discount table array
function discountDataObject(data) {
  let discountArray = [];
  let membershipProductDiscountsArr = data.membershipproductdiscount.membershipProductDiscounts;
  if (membershipProductDiscountsArr) {
    if (membershipProductDiscountsArr[0].discounts) {
      discountArray = membershipProductDiscountsArr[0].discounts;
    } else {
      discountArray = [];
    }
  } else {
    discountArray = [];
  }
  return discountArray;
}
function getFeeTableData(state, allMembershipData) {
  let membershipProductName = allMembershipData.membershipproduct.membershipProductName;
  state.membershipProductId = allMembershipData.membershipproduct.membershipProductId;
  if (!state.selectedParentMembershipProduct && state.parentMembershipProductsDetail.length) {
    state.selectedParentMembershipProduct = getAffiliateProduct(
      state,
      state.parentMembershipProductsDetail,
    );
  }
  let feesDeafultobj = {
    membershipProductId: state.membershipProductId,
    paymentOptionRefId: allMembershipData.membershipproduct.paymentOptionRefId
      ? allMembershipData.membershipproduct.paymentOptionRefId
      : 1,
    membershipFees: feesDataObject(
      allMembershipData,
      membershipProductName,
      state.selectedParentMembershipProduct,
    ),
  };
  return feesDeafultobj;
}
// function updatedSettingsData(result) {
//   let updatedAdvanceSettings = []
//   let updatedDemographic = []
//   let updatedNetballQuestions = []
//   let updatedOtherQuestions = []

//   if (result) {
//     for (let i in result) {
//       if (result[i] == 13 || result[i] == 14
//         || result[i] == 15 || result[i] == 16) {
//         updatedDemographic.push(result[i])
//       } else if (result[i] == 7 || result[i] == 6 || result[i] == 10) {
//         updatedNetballQuestions.push(result[i])
//       }
//       else if (result[i] == 8 || result[i] == 9 ||
//         result[i] == 12 || result[i] == 11) {
//         updatedOtherQuestions.push(result[i])
//       }
//       else if (result[i] == 2 || result[i] == 17 ||
//         result[i] == 18 || result[i] == 3 || result[i] == 4) {
//         updatedAdvanceSettings.push(result[i])
//       }
//     }
//   }
//   return {
//     updatedAdvanceSettings,
//     updatedDemographic,
//     updatedNetballQuestions,
//     updatedOtherQuestions,
//   }
// }

/////function to check membership types in the membership product section tab in membership fees
function getDefaultMembershipType(data, deleteId) {
  let membershipProductTypesTempArray = [];
  if (data) {
    if (data.membershipproducttypes) {
      let getMembershipType = data.membershipproducttypes.MembershipProductTypes;
      for (let i in getMembershipType) {
        if (
          isNotNullOrEmptyString(getMembershipType[i].dobFrom) &&
          isNotNullOrEmptyString(getMembershipType[i].dobTo)
        ) {
          getMembershipType[i]['isMandate'] = true;
        } else {
          getMembershipType[i]['isMandate'] = false;
        }
        if (getMembershipType[i].membershipProductTypeMappingId > 0) {
          getMembershipType[i]['isMemebershipType'] = true;
        } else {
          getMembershipType[i]['isMemebershipType'] = false;
        }

        if (
          getMembershipType[i].allowTeamRegistrationTypeRefId != null &&
          getMembershipType[i].allowTeamRegistrationTypeRefId != 0
        ) {
          getMembershipType[i]['isAllow'] = true;
        } else {
          getMembershipType[i]['isAllow'] = false;
        }
        if (deleteId) {
          getMembershipType[i]['membershipProductTypeMappingId'] = null;
        }
      }
      membershipProductTypesTempArray = getMembershipType;
    }
  }
  return membershipProductTypesTempArray;
}

function getSelectedQuestions(stateRegistrationSettings, orgRegistrationSettings) {
  let selectedAdvanceSettings = [],
    selectedNetballQuestions = [];
  let shop = orgRegistrationSettings.find(
    r => r.registrationSettingsRefId == REGISTRATION_QUESTIONS.SHOP,
  );
  if (shop) {
    selectedAdvanceSettings.push(REGISTRATION_QUESTIONS.SHOP.toString());
  }
  if (!isArrayNotEmpty(stateRegistrationSettings) || !isArrayNotEmpty(orgRegistrationSettings))
    return { selectedAdvanceSettings, selectedNetballQuestions };

  for (let orgRegSetting of orgRegistrationSettings) {
    let stateSetting = stateRegistrationSettings.find(
      setting => setting.registrationSettingRefId == orgRegSetting.registrationSettingsRefId,
    );
    if (stateSetting) {
      let questionRefId = stateSetting.registrationSettingRefId.toString();
      if (questionRefId == 5) {
        //shop
        selectedAdvanceSettings.push(questionRefId);
      }
      if (stateSetting.isAffiliateChoosing == 1) {
        selectedNetballQuestions.push(questionRefId);
      }
    }
  }
  return { selectedAdvanceSettings, selectedNetballQuestions };
}

function updateExternalRegistrationState(state, payload) {
  return {
    ...state,
    externalRegistrations: {
      ...state.externalRegistrations,
      ...payload,
    },
  };
}

function registration(state = initialState, action) {
  switch (action.type) {
    //////get the membership fee list in registration
    case ApiConstants.API_REG_MEMBERSHIP_LIST_LOAD:
      return { ...state, onLoad: true, error: null, regMembershipListAction: action };

    case ApiConstants.API_REG_MEMBERSHIP_LIST_SUCCESS:
      let membershipListData = action.result;
      return {
        ...state,
        onLoad: false,
        regMembershipFeeListData: membershipListData.membershipFees,
        regMembershipFeeListTotalCount: membershipListData.page.totalCount,
        regMembershipFeeListPage: membershipListData.page ? membershipListData.page.currentPage : 1,
        status: action.status,
        error: null,
      };

    //////save the Registration Form
    case ApiConstants.API_REG_FORM_LOAD:
      return { ...state, onRegistrationSaveLoad: true, error: null };

    case ApiConstants.API_REG_FORM_SUCCESS:
      state.registrationFormData = [action.payload];

      return {
        ...state,
        onRegistrationSaveLoad: false,
        status: action.status,
        error: null,
      };

    ///////////get the default membership  product types in registartion membership fees
    case ApiConstants.API_REG_GET_DEFAULT_MEMBERSHIP_PRODUCT_TYPES__LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_REG_GET_DEFAULT_MEMBERSHIP_PRODUCT_TYPES_SUCCESS:
      let membershipProductDefaultTypesTempArray = [];
      if (action.result) {
        if (action.result.membershipproducttypes) {
          if (action.result.membershipproducttypes.MembershipProductTypes) {
            let defaultMembershipType = action.result.membershipproducttypes.MembershipProductTypes;
            for (let i in defaultMembershipType) {
              defaultMembershipType[i]['isMandate'] = false;
              defaultMembershipType[i]['isMemebershipType'] = false;
            }
            membershipProductDefaultTypesTempArray = defaultMembershipType;
          }
        }
      }
      return {
        ...state,
        onLoad: false,
        status: action.status,
        getDefaultMembershipProductTypes: membershipProductDefaultTypesTempArray,
        error: null,
      };

    //////delete the membership list product
    case ApiConstants.API_REG_MEMBERSHIP_LIST_DELETE_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_REG_MEMBERSHIP_LIST_DELETE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    //////get the membership  product details
    case ApiConstants.API_REG_GET_MEMBERSHIP_PRODUCT_LOAD:
      return { ...state, onLoad: true, error: null, onLoadMembership: true };

    case ApiConstants.API_REG_GET_MEMBERSHIP_PRODUCT_SUCCESS:
      let finalDiscountData = discountDataObject(action.result);
      const { membershipproduct } = action.result;
      state.membershipProductDiscountData.membershipProductDiscounts[0].discounts =
        finalDiscountData;
      state.membershipProductId = membershipproduct.membershipProductId;
      state.membershipProductCategoryRefId = membershipproduct.membershipProductCategoryRefId;
      state.registrationDates.fromDate = membershipproduct.fromDate;
      state.registrationDates.toDate = membershipproduct.toDate;
      state.applyRegistrationDates = !!(membershipproduct.fromDate && membershipproduct.toDate);
      state.atMatchFeesEnabled = membershipproduct.atMatchFeesEnabled;

      if (!state.selectedParentMembershipProduct && state.parentMembershipProductsDetail.length) {
        state.selectedParentMembershipProduct = getAffiliateProduct(
          state,
          state.parentMembershipProductsDetail,
        );
      }

      let feesDeafultobj1 = {
        isAlreadyRegistered: action.result.membershipproductfee.isAlreadyRegistered
          ? action.result.membershipproductfee.isAlreadyRegistered
          : 0,
        membershipProductId: state.membershipProductId,
        paymentOptionRefId: action.result.membershipproduct.paymentOptionRefId
          ? action.result.membershipproduct.paymentOptionRefId
          : 1,
        membershipFees: feesDataObject(
          action.result,
          action.result.membershipproduct.membershipProductName,
          state.selectedParentMembershipProduct,
        ),
      };
      state.membershipProductFeesTableData = feesDeafultobj1;
      return {
        ...state,
        onLoad: false,
        status: action.status,
        getMembershipProductDetails: action.result,
        getDefaultMembershipProductTypes: getDefaultMembershipType(action.result),
        error: null,
        onLoadMembership: false,
      };

    case ApiConstants.ON_CHANGE_PARENT_MEMBERSHIP_PRODUCT: {
      const { membershipproduct } = action.result;
      state.registrationDates.fromDate = membershipproduct.fromDate;
      state.registrationDates.toDate = membershipproduct.toDate;
      state.applyRegistrationDates = !!(membershipproduct.fromDate && membershipproduct.toDate);
      state.atMatchFeesEnabled = membershipproduct.atMatchFeesEnabled;

      const getMembershipProductDetails = cloneDeep(action.result);

      getMembershipProductDetails.membershipproducttypes.MembershipProductTypes =
        getMembershipProductDetails.membershipproduct.membershipProductTypes;

      return {
        ...state,
        selectedParentMembershipProduct: action.result,
        getMembershipProductDetails: {
          ...state.getMembershipProductDetails,
          membershipproduct: {
            ...state.getMembershipProductDetails?.membershipproduct,
            parentMembershipProductId: membershipproduct.id,
            membershipProductTypes:
              getMembershipProductDetails.membershipproduct.membershipProductTypes,
          },
          membershipproducttypes: getMembershipProductDetails.membershipproducttypes,
        },
        getDefaultMembershipProductTypes: getDefaultMembershipType(
          getMembershipProductDetails,
          true,
        ),
      };
    }

    //////save the membership  product details
    case ApiConstants.API_REG_SAVE_MEMBERSHIP_PRODUCT__LOAD:
      state.membershipProductFeesTableData = null;
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_REG_SAVE_MEMBERSHIP_PRODUCT_SUCCESS:
      state.membershipProductFeesTableData = getFeeTableData(state, action.result.data);
      return {
        ...state,
        onLoad: false,
        status: action.status,
        getMembershipProductDetails: action.result.data,
        getDefaultMembershipProductTypes: getDefaultMembershipType(action.result.data),
        error: null,
        // membershipProductDiscountData: finalDiscountData1,
      };

    //////save the membership  product Fees
    case ApiConstants.API_REG_SAVE_MEMBERSHIP_PRODUCT_FEES__LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_REG_SAVE_MEMBERSHIP_PRODUCT_FEES_SUCCESS:
      state.membershipProductFeesTableData = getFeeTableData(state, action.result.data);
      return {
        ...state,
        onLoad: false,
        status: action.status,
        getMembershipProductDetails: action.result.data,
        getDefaultMembershipProductTypes: getDefaultMembershipType(action.result.data),
        error: null,
      };

    //////save the membership  product discount
    case ApiConstants.API_REG_SAVE_MEMBERSHIP_PRODUCT_DISCOUNT__LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_REG_SAVE_MEMBERSHIP_PRODUCT_DISCOUNT_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    ///////////chnage the membership fees table data
    case ApiConstants.CHANGE_MEMBERSHIP_FEES_TABLE_INPUT:
      let data = state.membershipProductFeesTableData.membershipFees;
      let recordId = action.record.editableIndex;
      let key = action.key;
      let onChangeIndex = data.findIndex(data => data.editableIndex == recordId);
      if (GstKeyArray.includes(key)) {
        let gst = Number(action.value);
        data[onChangeIndex][key] = gst > 0 ? gst : 0;
      } else {
        data[onChangeIndex][key] = Number(action.value);
      }
      if (FeeKeyArray.includes(key)) {
        let fee = Number(action.value);
        data[onChangeIndex][key] = fee > 0 ? fee : 0;
        const Gst = Number(fee / 10).toFixed(2);
        const GstKey = `${key.slice(0, -3)}Gst`;
        data[onChangeIndex][GstKey] = Gst > 0 ? Gst : 0;
      }
      return {
        ...state,
        error: null,
      };

    case ApiConstants.API_GET_PARENT_MEMBERSHIP_PRODUCT_LOAD:
      return {
        ...state,
        onLoadMembershipProduct: true,
        selectedYearForParentMembershipProducts: action.payload.yearRefId,
      };

    case ApiConstants.API_GET_PARENT_MEMBERSHIP_PRODUCT_SUCCESS: {
      state.parentOrganisationTypeRefId = 0;
      if (action.payload.length > 0) {
        state.parentOrganisationTypeRefId =
          action.payload[0].membershipproduct.organisationTypeRefId;
      }
      if (!state.selectedParentMembershipProduct) {
        state.selectedParentMembershipProduct = getAffiliateProduct(state, action.payload);
      }

      if (
        state.selectedParentMembershipProduct &&
        state.getMembershipProductDetails?.membershipproduct?.membershipProductId &&
        state.membershipProductFeesTableData
      ) {
        state.membershipProductFeesTableData.membershipFees = feesDataObject(
          state.getMembershipProductDetails,
          state.getMembershipProductDetails.membershipproduct.membershipProductName,
          state.selectedParentMembershipProduct,
        );
      }

      return {
        ...state,
        onLoadMembershipProduct: false,
        parentMembershipProductsDetail: action.payload,
      };
    }

    ///////////add new membership type in the membership form
    case ApiConstants.ADD_NEW_MEMBERSHIP_TYPE:
      state.getDefaultMembershipProductTypes.push(action.newObject);
      return {
        ...state,
        error: null,
      };

    /////get the membership product discount Types
    case ApiConstants.API_MEMBERSHIP_PRODUCT_DISCOUNT_TYPE__LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_MEMBERSHIP_PRODUCT_DISCOUNT_TYPE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        membershipProductDiscountType: action.result.id,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_GET_REG_FORM_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_REG_FORM_SUCCESS:
      let productList = action.MembershipProductList.id ? action.MembershipProductList.id : [];
      let objValue = JSON.parse(JSON.stringify([newObjvalue]));
      let formData = action.result.length > 0 ? action.result : objValue;
      state.defaultRegistrationSettings =
        formData[0].registrationSettings !== null ? formData[0].registrationSettings : [];
      state.defaultRegistrationMethod =
        formData[0].registerMethods !== null
          ? JSON.parse(JSON.stringify(formData[0].registerMethods))
          : [];
      let selected_Method = checkSlectedMethod(
        JSON.parse(JSON.stringify(formData[0].registerMethods)),
      );
      state.selectedMethod = selected_Method;
      let stateRegistrationSettings = state.stateRegistrationSettings || [];
      let selectedInvitees = checkSlectedInvitees(
        formData[0].registrationSettings,
        state.reg_demoSetting,
        state.reg_NetballSetting,
        state.reg_QuestionsSetting,
        state.reg_settings,
      );
      state.defaultMembershipProduct = JSON.parse(
        JSON.stringify(formData[0].membershipProductTypes),
      );
      const { selectedAdvanceSettings, selectedNetballQuestions } = getSelectedQuestions(
        stateRegistrationSettings,
        state.defaultRegistrationSettings,
      );

      //selectedNetballQuestions is used for tree datasource only ,but state.reg_NetballSetting will be used when save,
      //so we need to initialize it when get configured data
      let NetballQuestionsData = getResitrationFormSettings(
        selectedNetballQuestions,
        state.defaultRegistrationSettings,
      );
      state.reg_NetballSetting = NetballQuestionsData;

      state.selectedInvitees = selectedAdvanceSettings; //selectedInvitees.selectedAdvanceSettings;
      state.selectedDemographic = selectedInvitees.selectedDemographic;
      state.SelectedOtherQuestions = selectedInvitees.SelectedOtherQuestions;
      state.selectedNetballQuestions = selectedNetballQuestions; //selectedInvitees.selectedNetballQuestions;
      state.hardShipCodes = formData[0].hardShipCodes !== null ? formData[0].hardShipCodes : [];
      state.canInviteSend = formData[0].canInviteSend;

      let productListValue = getProductArr(productList, formData[0].membershipProductTypes);
      let SelectedProduct = getFillteredData(
        formData,
        productListValue,
        state.selectedMemberShipType,
      );
      let trainingSelection = getSelectedCheck(regFormChecked, formData);
      state.defaultChecked = trainingSelection;
      newObjvalue.competitionUniqueKeyId = state.defaultCompetitionID;
      state.sendRegistrationFormData = JSON.parse(JSON.stringify([newObjvalue]));

      return {
        ...state,
        onLoad: false,
        getRegFormCompetition: action.result,
        membershipProductTypes: productListValue,
        selectedProductName: SelectedProduct,
        error: null,
        registrationFormData:
          action.result.length > 0 ? action.result : state.sendRegistrationFormData,
      };

    case ApiConstants.API_UPDATE_REG_FORM_LOAD:
      if (state.registrationFormData == 0) {
        state.registrationFormData = JSON.parse(JSON.stringify([newObjvalue]));
      }
      if (action.key === 'registrationSettings') {
        state.selectedInvitees = action.updatedData;
        let updatedObjData = getResitrationFormSettings(
          action.updatedData,
          state.defaultRegistrationSettings,
        );
        state.reg_settings = updatedObjData;
      } else if (action.key === 'demographicSettings') {
        state.selectedDemographic = action.updatedData;
        let updatedDemoData = getResitrationFormSettings(
          action.updatedData,
          state.defaultRegistrationSettings,
        );
        state.reg_demoSetting = updatedDemoData;
      } else if (action.key === 'NetballQuestions') {
        state.selectedNetballQuestions = action.updatedData;
        let NetballQuestionsData = getResitrationFormSettings(
          action.updatedData,
          state.defaultRegistrationSettings,
        );
        state.reg_NetballSetting = NetballQuestionsData;
      } else if (action.key === 'OtherQuestions') {
        state.SelectedOtherQuestions = action.updatedData;
        let updatedQuestionsData = getResitrationFormSettings(
          action.updatedData,
          state.defaultRegistrationSettings,
        );
        state.reg_QuestionsSetting = updatedQuestionsData;
      } else if (action.key === 'registerMethods') {
        state.selectedMethod = action.updatedData;
        let updateRegistrationMethod = getRegistrationFormMethod(
          action.updatedData,
          JSON.parse(JSON.stringify(state.defaultRegistrationMethod)),
        );
        state.registrationFormData[0]['registerMethods'] = updateRegistrationMethod;
      } else if (action.key === 'addHardshipCode') {
        if (isArrayNotEmpty(state.registrationFormData[0].hardShipCodes)) {
          state.registrationFormData[0].hardShipCodes.push(action.updatedData);
        } else {
          state.registrationFormData[0].hardShipCodes = [];
          state.registrationFormData[0].hardShipCodes.push(action.updatedData);
        }
      } else if (action.key === 'addHardshipCodeValueChange') {
        let { value, index } = action.updatedData;
        state.registrationFormData[0].hardShipCodes[index].code = value;
      } else if (action.key === 'membershipProductTypes') {
        let index = -1;
        for (let i in state.selectedMemberShipType) {
          let membershipProductType = state.selectedMemberShipType[i].membershipProductTypes.find(
            x =>
              x.membershipProductTypeId ==
                action.getMembershipproductItem.membershipProductTypeId &&
              x.membershipProductTypeMappingId ==
                action.getMembershipproductItem.membershipProductTypeMappingId,
          );
          if (membershipProductType) {
            index = i;
            break;
          }
        }
        state.selectedMemberShipType[index][action.key][
          action.membershipProductTypeIndex
        ].isSelected = true;
        state.selectedMemberShipType[index][action.key][action.membershipProductTypeIndex][
          action.subKey
        ] = action.updatedData;
        let sample = state.registrationFormData[0][action.key].find(
          x => x.id == action.getMembershipproductItem.id,
        );
        if (
          state.selectedMemberShipType[index][action.key][action.membershipProductTypeIndex]
            .isSelected &&
          !sample
        ) {
          state.registrationFormData[0][action.key].push(
            state.selectedMemberShipType[index][action.key][action.membershipProductTypeIndex],
          );
        } else {
          sample[action.subKey] = action.updatedData;
        }
      } else {
        let oldData = state.registrationFormData;
        let updatedValue = action.updatedData;
        let getKey = action.key;
        oldData[0][getKey] = updatedValue;
      }
      return { ...state, error: action.error };

    ///******fail and error handling */
    case ApiConstants.API_REGISTRATION_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };
    case ApiConstants.API_REGISTRATION_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    /******** */
    ///clearing particular reducer data
    case ApiConstants.REG_CLEARING_PARTICULAR_REDUCER_DATA:
      if (action.dataName === 'getMembershipProductDetails') {
        state.getMembershipProductDetails = null;
        state.getDefaultMembershipProductTypes = [];
        state.membershipProductId = '';
        state.membershipProductFeesTableData = null;
        state.membershipProductDiscountData.membershipProductDiscounts[0].discounts = [];
      }
      if (action.dataName === 'getRegistrationFormDetails') {
        state.selectedMemberShipType = [];
        state.membershipProductTypes = [];
        state.selectedProductName = [];
        state.registrationFormData = JSON.parse(JSON.stringify([newObjvalue]));
        state.defaultChecked['replyName'] = false;
        state.defaultChecked['replyRole'] = false;
        state.defaultChecked['replyEmail'] = false;
        state.defaultChecked['replyPhone'] = false;
        state.defaultChecked['replyContactVisible'] = false;
        state.defaultChecked['venueVisible'] = false;
        state.defaultChecked['daysVisible'] = false;
        state.defaultChecked['trainingVisible'] = false;
        state.reg_demoSetting = [];
        state.reg_NetballSetting = [];
        state.reg_QuestionsSetting = [];
        state.reg_settings = [];
        state.selectedDemographic = [];
        state.selectedInvitees = [];
        state.selectedNetballQuestions = [];
        state.SelectedOtherQuestions = [];
        state.defaultRegistrationMethod = [];
        state.defaultRegistrationSettings = [];
        state.canInviteSend = 0;
      }
      if (action.dataName === 'allDivisionsData') {
        state.allDivisionsData = [];
      }
      return {
        ...state,
        error: null,
      };

    ////////
    case ApiConstants.API_COMPETITION_TYPE_LIST_SUCCESS:
      if (isArrayNotEmpty(action.result)) {
        state.registrationFormData[0].competitionUniqueKeyId =
          action.result.length > 0 ? action.result[0].competitionId : '';
      } else {
        state.registrationFormData[0].competitionUniqueKeyId = '';
      }
      return {
        ...state,
        error: null,
      };

    case ApiConstants.ON_CHANGE_MEMBERSHIP_PRODUCT_CATEGORY_TYPES:
      if (
        state.selectedParentMembershipProduct &&
        state.selectedParentMembershipProduct.membershipproduct.membershipProductCategoryRefId !==
          action.payload
      ) {
        return {
          ...state,
          getMembershipProductDetails: {
            ...state.getMembershipProductDetails,
            membershipproduct: {
              ...state.getMembershipProductDetails.membershipproduct,
              parentMembershipProductId: null,
              membershipProductTypes: [],
            },
          },
          selectedParentMembershipProduct: null,
          getDefaultMembershipProductTypes: [],
          membershipProductCategoryRefId: action.payload,
          applyRegistrationDates: false,
          atMatchFeesEnabled: false,
          registrationDates: {
            fromDate: null,
            toDate: null,
          },
        };
      }
      return {
        ...state,
        membershipProductCategoryRefId: action.payload,
      };

    case ApiConstants.ON_CHANGE_APPLY_REGISTRATION_DATES_CHECKBOX:
      return {
        ...state,
        applyRegistrationDates: action.payload,
      };

    case ApiConstants.ON_CHANGE_REGISTRATION_DATES:
      return {
        ...state,
        registrationDates: {
          ...state.registrationDates,
          [action.payload.key]: action.payload.date,
        },
      };

    case ApiConstants.ON_CHANGE_ALLOW_AT_MATCH_FEES_CHECKBOX:
      return {
        ...state,
        atMatchFeesEnabled: action.payload,
      };

    case ApiConstants.CLEAR_REGISTRATION_MEMBERSHIP_FEE_FORM:
      const {
        applyRegistrationDates,
        atMatchFeesEnabled,
        membershipProductCategoryRefId,
        getDefaultMembershipProductTypes,
      } = initialState;

      return {
        ...state,
        registrationDates: { toDate: null, fromDate: null },
        applyRegistrationDates,
        atMatchFeesEnabled,
        membershipProductCategoryRefId,
        getDefaultMembershipProductTypes,
        parentMembershipProductsDetail: [],
        selectedYearForParentMembershipProducts: null,
        selectedParentMembershipProduct: null,
      };

    case ApiConstants.API_REG_FORM_MEMBERSHIP_PRODUCT_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_REG_FORM_MEMBERSHIP_PRODUCT_SUCCESS:
      return {
        ...state,
        onLoad: false,
        membershipProductTypes: action.result.id,
        status: action.status,
        error: null,
      };

    case ApiConstants.REG_FORM_UPDATE_MEMBERSHIP_CATEGORY:
      // let selectedKeyArr = state.selectedProductName;
      let categoryData = state.membershipProductTypes;
      let updatedTypesData = getNewProdcutData(categoryData, action.selectedCategory);
      state.selectedMemberShipType = updatedTypesData;
      state.selectedProductName = action.selectedCategory;

      return { ...state, error: null };

    ////add another discount in the membership fees
    case ApiConstants.ADD_ANOTHER_DISCOUNT_MEMBERSHIP_FEES:
      if (action.keyAction === 'add') {
        const newObj = {
          membershipProductTypeMappingId: 'Select',
          membershipProductTypeDiscountId: 0,
          membershipPrdTypeDiscountTypeRefId: 0,
          amount: '',
          description: '',
          availableFrom: null,
          availableTo: null,
          discountTypeRefId: 1,
          discountCode: '',
          applyDiscount: 0,
          question: '',
          childDiscounts: [],
        };
        state.membershipProductDiscountData.membershipProductDiscounts[0].discounts.push(newObj);
      } else if (action.keyAction === 'remove') {
        state.membershipProductDiscountData.membershipProductDiscounts[0].discounts.splice(
          action.index,
          1,
        );
      }
      return {
        ...state,
        error: null,
      };

    ///updated discount in membership fees section
    case ApiConstants.UPDATE_DISCOUNT_DATA_MEMBERSHIP_FEES:
      state.membershipProductDiscountData.membershipProductDiscounts[0].discounts =
        action.discountData;
      return {
        ...state,
        error: null,
      };

    ///membership fees radip apply fees on change
    case ApiConstants.ON_CHANGE_RADIO_APPLY_FEES_MEMBERSHIP_FEES:
      // console.log("state.membershipProductFeesTableData",state.membershipProductFeesTableData)
      if (action.key) {
        if (action.key == 'isNeedExtendedDate' && action.radioApplyId == false) {
          state.membershipProductFeesTableData.membershipFees[action.feesIndex].extendEndDate =
            null;
        }
        state.membershipProductFeesTableData.membershipFees[action.feesIndex][action.key] =
          action.radioApplyId;
      } else {
        state.membershipProductFeesTableData.membershipFees[
          action.feesIndex
        ].membershipProductFeesTypeRefId = action.radioApplyId;
      }
      return {
        ...state,
        error: null,
      };

    ///membership fees radip apply fees on change
    // case ApiConstants.ON_CHANGE_RADIO_APPLY_FEES_MEMBERSHIP_FEES:
    //   state.membershipProductFeesTableData.membershipFees[action.feesIndex].membershipProductFeesTypeRefId = action.radioApplyId
    //   return {
    //     ...state,
    //     error: null
    //   };

    ////age mandate and membershipTypes onchange selection checkbox
    case ApiConstants.ON_CHANGE_SELECTION_MEM_TYPE_AGE_MANDATE_CHECKBOX:
      if (action.keyword === 'isMandate') {
        state.getDefaultMembershipProductTypes[action.index].isMandate = action.checkedValue;
      }
      if (action.keyword === 'isAllow') {
        state.getDefaultMembershipProductTypes[action.index]['isAllow'] = action.checkedValue;
        if (action.checkedValue) {
          state.getDefaultMembershipProductTypes[action.index][
            'allowTeamRegistrationTypeRefId'
          ] = 1;
        } else {
          state.getDefaultMembershipProductTypes[action.index]['allowTeamRegistrationTypeRefId'] =
            null;
        }
      }
      if (action.keyword === 'isMemebershipType') {
        state.getDefaultMembershipProductTypes[action.index].isMemebershipType =
          action.checkedValue;
      }
      if (action.keyword === 'isPlaying') {
        const productTypes = state.getDefaultMembershipProductTypes[action.index];
        if (action.checkedValue) {
          productTypes.isPlaying = 1;
          productTypes.isOfficial = 0;
          productTypes.roleId = action.roleId;
        } else {
          productTypes.isPlaying = 0;
        }
      } else if (action.keyword === 'isOfficial') {
        const productTypes = state.getDefaultMembershipProductTypes[action.index];
        if (action.checkedValue) {
          productTypes.isOfficial = 1;
          productTypes.isPlaying = 0;
          productTypes.roleId = action.roleId;
        } else {
          productTypes.isOfficial = 0;
        }
      } else if (action.keyword === 'isNonPlayingOptions') {
        const productTypes = state.getDefaultMembershipProductTypes[action.index];
        if (action.checkedValue) {
          productTypes.isOfficial = 0;
          productTypes.isPlaying = 0;
          productTypes.roleId = action.roleId;
        } else {
          productTypes.isOfficial = 0;
          productTypes.isPlaying = 0;
        }
      } else if (action.keyword === 'isChildrenCheckNumber') {
        state.getDefaultMembershipProductTypes[action.index].isChildrenCheckNumber =
          action.checkedValue;
      } else if (action.keyword === 'isClearanceEnabled') {
        const productTypes = state.getDefaultMembershipProductTypes[action.index];
        productTypes.isClearanceEnabled = action.checkedValue;
        if (productTypes.isClearanceEnabled && !productTypes.clearanceTypeRefId) {
          productTypes.clearanceTypeRefId = 1;
        }
        if (!productTypes.isClearanceEnabled) {
          productTypes.isITCClearanceEnabled = false;
        }
      } else if (action.keyword === 'isITCClearanceEnabled') {
        const productTypes = state.getDefaultMembershipProductTypes[action.index];
        productTypes.isITCClearanceEnabled = action.checkedValue;
      } else if (action.keyword === 'clearanceTypeRefId') {
        const productTypes = state.getDefaultMembershipProductTypes[action.index];
        productTypes.clearanceTypeRefId = action.checkedValue;
        if (productTypes.clearanceTypeRefId === 2) {
          productTypes.isITCClearanceEnabled = false;
        }
      }
      return {
        ...state,
        error: null,
      };

    ///////onchange date data in age restriction in the membership types
    case ApiConstants.ON_CHANGE_DATE_AGE_MANDATE_MEMBERSHIP_TYPES:
      state.getDefaultMembershipProductTypes = action.data;
      return {
        ...state,
        error: null,
      };

    //////////remove custom membership type from the membership fees
    case ApiConstants.REMOVE_CUSTOM_MEMBERSHIP_FEES_TYPE:
      state.getDefaultMembershipProductTypes.splice(action.index, 1);
      return {
        ...state,
        error: null,
      };
    case ApiConstants.REG_FORM_UPDATE_MEMBERSHIP_PRODUCT_TYPES_RECORD:
      let productsData1 = [...state.selectedMemberShipType];
      let getFormValue1 = state.registrationFormData;
      let selectedArray1 = makeFinalProductArr(productsData1, state.defaultMembershipProduct);
      getFormValue1[0].membershipProductTypes = [...selectedArray1];
      return {
        ...state,
        registrationFormData: getFormValue1,
        selectedMemberShipType: [...productsData1],
        error: null,
      };
    case ApiConstants.REG_FORM_UPDATE_MEMBERSHIP_PRODUCT_TYPES:
      let productsData = [...state.selectedMemberShipType];
      let getFormValue = state.registrationFormData;
      let tableValue = action.tableKey;
      let matchIndexKey = action.matchkey;
      let subKey = action.subKey;
      productsData[matchIndexKey].membershipProductTypes[tableValue].isSelected = action.isSelected;
      productsData[matchIndexKey].membershipProductTypes[tableValue].registrationLock =
        action.registrationLock;
      if (!action.isSelected) {
        productsData[matchIndexKey].membershipProductTypes[tableValue][subKey] = null;
      }
      let selectedArray = makeFinalProductArr(productsData, state.defaultMembershipProduct);
      getFormValue[0].membershipProductTypes = [...selectedArray];
      return {
        ...state,
        registrationFormData: getFormValue,
        selectedMemberShipType: [...productsData],
        error: null,
      };

    case ApiConstants.REG_FORM_UPDATE_MEMBERSHIP_REGISTRATIONLOCK:
      let Form_Value = state.registrationFormData;
      let product_Data = [...state.selectedMemberShipType];
      let table_Value = action.table_key;
      let match_Key = action.matchValue;
      product_Data[match_Key].membershipProductTypes[table_Value].isSelected = action.isSelected;
      product_Data[match_Key].membershipProductTypes[table_Value].registrationLock =
        action.registrationLock;
      let selected_Array = makeFinalProductArr(product_Data, state.defaultMembershipProduct);
      Form_Value[0].membershipProductTypes = selected_Array;
      return {
        ...state,
        selectedMemberShipType: [...product_Data],
        error: null,
      };

    case ApiConstants.API_YEAR_LIST_SUCCESS:
      if (isArrayNotEmpty(action.competetionListResult)) {
        let defaultCompetition = action.competetionListResult[0].competitionId;
        state.defaultCompetitionID = defaultCompetition;
        if (newObjvalue.competitionUniqueKeyId.length > 0) {
          newObjvalue.competitionUniqueKeyId = defaultCompetition;
        }
      }
      return { ...state, error: null };

    case ApiConstants.REG_FORM_UPDATE_DISCLAIMER_TEXT:
      state.registrationFormData[0].registrationDisclaimer[action.index][action.key] = action.value;
      return { ...state, error: null };

    case ApiConstants.REG_FORM_CHECKED_VISIBLE:
      let visibleKey = action.key;
      if (visibleKey === 'trainingVisible') {
        state.defaultChecked[visibleKey] = action.checked;
        state.defaultChecked['venueVisible'] = false;
        state.defaultChecked['venueListVisible'] = false;
        state.defaultChecked['venueTextVisible'] = false;
        state.defaultChecked['daysVisible'] = false;
        state.registrationFormData[0]['trainingDaysAndTimes'] = '';
        state.registrationFormData[0]['trainingVenueId'] = null;
        state.registrationFormData[0]['trainingVenueText'] = null;
      } else {
        state.defaultChecked[visibleKey] = action.checked;
        if (visibleKey === 'daysVisible') {
          state.registrationFormData[0]['trainingDaysAndTimes'] = '';
        } else if (visibleKey === 'venueListVisible') {
          state.defaultChecked['venueTextVisible'] = false;
          state.registrationFormData[0]['trainingVenueText'] = null;
        } else if (visibleKey === 'venueTextVisible') {
          state.defaultChecked['venueListVisible'] = false;
          state.registrationFormData[0]['trainingVenueId'] = null;
        } else {
          state.registrationFormData[0]['trainingVenueId'] = null;
          state.registrationFormData[0]['trainingVenueText'] = null;
        }
      }
      return { ...state, error: null };

    case ApiConstants.REG_FORM_REPLY_CHECKED_VISIBLE:
      let replyVisibleKey = action.key;
      if (replyVisibleKey === 'replyContactVisible') {
        state.defaultChecked[replyVisibleKey] = action.checked;
        state.defaultChecked['replyName'] = false;
        state.defaultChecked['replyRole'] = false;
        state.defaultChecked['replyEmail'] = false;
        state.defaultChecked['replyPhone'] = false;
        state.registrationFormData[0]['replyName'] = '';
        state.registrationFormData[0]['replyRole'] = '';
        state.registrationFormData[0]['replyEmail'] = '';
        state.registrationFormData[0]['replyPhone'] = '';
      } else {
        state.defaultChecked[replyVisibleKey] = action.checked;
        state.registrationFormData[0][replyVisibleKey] = '';
      }
      return { ...state, error: null };

    ////////get the divisions list on the basis of year and competition
    case ApiConstants.API_GET_DIVISIONS_LIST_ON_YEAR_AND_COMPETITION_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_DIVISIONS_LIST_ON_YEAR_AND_COMPETITION_SUCCESS:
      return {
        ...state,
        onLoad: false,
        allDivisionsData: isArrayNotEmpty(action.result) ? action.result : [],
        status: action.status,
        error: null,
      };

    case ApiConstants.API_GET_TEAM_REGISTRATIONS_DATA_LOAD:
      return {
        ...state,
        onLoad: true,
        teamRegListAction: action,
      };

    case ApiConstants.API_GET_TEAM_REGISTRATIONS_DATA_SUCCESS:
      return {
        ...state,
        onLoad: false,
        teamRegistrationTableData: action.result,
        status: action.status,
      };

    case ApiConstants.API_EXPORT_TEAM_REGISTRATIONS_DATA_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_EXPORT_TEAM_REGISTRATIONS_DATA_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.teamRegListAction = null;
      state.regMembershipListAction = null;
      return { ...state, onLoad: false };

    case ApiConstants.API_GET_MEMBERSHIP_FEE_CAP_LIST_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_GET_MEMBERSHIP_FEE_CAP_LIST_SUCCESS:
      let membershipCapListTemp = [];
      if (isArrayNotEmpty(action.result.capList)) {
        membershipCapListTemp = action.result.capList;
        for (let item of membershipCapListTemp) {
          item['productsInfo'] = [];
          item['productsTemp'] = deepCopyFunction(item.products);
          for (let product of item.products) {
            item.productsInfo.push(product.membershipProductId);
          }
        }
      } else {
        membershipCapListTemp[0] = deepCopyFunction(membershipCapListDefObj);
      }
      return {
        ...state,
        status: action.status,
        membershipFeeCapList: membershipCapListTemp,
        membershipFeeCapListCopy: deepCopyFunction(membershipCapListTemp),
        stateCap: action.result.stateCap,
        onLoad: false,
      };

    case ApiConstants.API_UPDATE_MEMBERSHIP_FEE_CAP_LOAD:
      return { ...state, updateMembershipFeeCapOnLoad: true };

    case ApiConstants.API_UPDATE_MEMBERSHIP_FEE_CAP_SUCCESS:
      return {
        ...state,
        status: action.status,
        updateMembershipFeeCapOnLoad: false,
      };

    case ApiConstants.UPDATE_MEMBERSHIP_FEE_CAP_LIST:
      if (action.key == 'membershipFeeCapList') {
        state.membershipFeeCapList = action.value;
        state.membershipFeeCapListCopy = deepCopyFunction(action.value);
      } else if (action.key == 'isAllMembershipProductChanged') {
        state.isAllMembershipProductChanged = action.value;
      } else if (action.key == 'productsInfo') {
        let productList = action.value;
        state.membershipFeeCapList[action.index].productsInfo = productList;
        // console.log("state.membershipFeeCapList[action.index].productsTemp",state.membershipFeeCapList[action.index].productsTemp);
        // console.log("state.membershipFeeCapList[action.index].productsInfo",state.membershipFeeCapList[action.index].productsInfo);
        state.membershipFeeCapList[action.index].products = [];
        for (let product of productList) {
          let existingProductTemp = state.membershipFeeCapList[action.index].productsTemp.find(
            x => x.membershipProductId == product,
          );
          let obj = {
            membershipCapProductId: existingProductTemp
              ? existingProductTemp.membershipCapProductId
              : 0,
            membershipProductId: product,
          };
          state.membershipFeeCapList[action.index].products.push(obj);
          state.membershipFeeCapList[action.index].productsTemp.push(obj);
        }
        // console.log("state.membershipFeeCapList[action.index].products",state.membershipFeeCapList[action.index].products)
      } else if (action.key == 'feeCaps') {
        state.membershipFeeCapList[action.index][action.key][action.subIndex][action.subKey] =
          action.value;
      } else if (action.key == 'isAllMembershipProduct') {
        if (action.value == 1) {
          state.membershipFeeCapList = [];
          state.membershipFeeCapList[0] = deepCopyFunction(
            state.membershipFeeCapListCopy[action.index],
          );
          state.membershipFeeCapList[0].products = [];
          state.membershipFeeCapList[0].productsInfo = [];
          state.membershipFeeCapList[0][action.key] = action.value;
        } else {
          state.membershipFeeCapList = deepCopyFunction(state.membershipFeeCapListCopy);
          state.membershipFeeCapList[0][action.key] = action.value;
        }
        state.isAllMembershipProductChanged = true;
      } else {
        state.membershipFeeCapList[action.index][action.key] = action.value;
      }
      return {
        ...state,
      };

    case ApiConstants.SET_REGISTRATION_MEMBERSHIP_LIST_PAGE_SIZE:
      return {
        ...state,
        regMembershipFeeListPageSize: action.pageSize,
      };

    case ApiConstants.SET_TEAM_REGISTRATION_LIST_PAGE_SIZE:
      return {
        ...state,
        teamRegistrationTableListPageSize: action.pageSize,
      };

    case ApiConstants.SET_TEAM_REGISTRATION_LIST_PAGE_CURRENT_NUMBER:
      state.teamRegistrationTableData.page.currentPage = action.pageNum;
      return {
        ...state,
      };

    case ApiConstants.ADD_HARDSHIP_CODE_LOAD:
      return { ...state, addHardshipCodeLoad: true };

    case ApiConstants.API_UPDATE_MEMBERSHIP_FEE_CAP_SUCCESS:
      return {
        ...state,
        status: action.status,
        addHardshipCodeLoad: false,
      };

    case ApiConstants.SET_REGISTRATION_MEMBERSHIP_LIST_PAGE_SIZE:
      return {
        ...state,
        regMembershipFeeListPageSize: action.pageSize,
      };

    case ApiConstants.API_SAVE_STATE_REGISTRATION_SETTING_LOAD_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        //stateRegistrationSettings: { ...action.result },
      };

    case ApiConstants.API_SAVE_STATE_REGISTRATION_SETTING_LOAD_LOAD:
      return {
        ...state,
        onloadRegSettings: true,
      };

    case ApiConstants.API_STATE_REGISTRATION_SETTING_BY_ORGANISATION_LOAD:
      return {
        ...state,
        stateRegistrationSettings: action.result,
        onloadRegSettings: false,
      };
    case ApiConstants.API_STATE_REGISTRATION_SETTING_BY_ORGANISATION_SUCCESS:
      const {
        selectedAdvanceSettings: advanceSettings,
        selectedNetballQuestions: netballQuestions,
      } = getSelectedQuestions(action.result, state.defaultRegistrationSettings);
      state.selectedInvitees = advanceSettings;
      state.selectedNetballQuestions = netballQuestions;
      return {
        ...state,
        stateRegistrationSettings: action.result,
        onloadOrgDetail: false,
      };

    case ApiConstants.API_GET_MEMBERSHIPTYPEMAPPING_BY_ORGANISATION_SUCCESS:
      return {
        ...state,
        membershipTypeMappings: action.result,
        onloadOrgDetail: false,
      };

    case ApiConstants.API_GET_EXTERNAL_MEMBERSHIP_TYPES_LOAD:
      return {
        ...state,
        loadingExternalMembershipTypes: true,
      };

    case ApiConstants.API_GET_EXTERNAL_MEMBERSHIP_TYPES_SUCCESS:
      return {
        ...state,
        loadingExternalMembershipTypes: false,
        externalMembership: action.result,
      };

    case ApiConstants.API_GET_EXTERNAL_REGISTRATIONS_LOAD:
    case ApiConstants.API_EXPORT_EXTERNAL_REGISTRATIONS_LOAD:
      return updateExternalRegistrationState(state, { loading: true });

    case ApiConstants.API_GET_EXTERNAL_REGISTRATIONS_SUCCESS:
      return updateExternalRegistrationState(state, {
        loading: false,
        registrations: action.result.registrations,
        totalCount: action.result.page.totalCount,
      });

    case ApiConstants.API_EXPORT_EXTERNAL_REGISTRATIONS_SUCCESS:
      return updateExternalRegistrationState(state, { loading: false });

    case ApiConstants.API_UPDATE_EXTERNAL_REGISTRATION_PAGE: {
      const page = { ...state.externalRegistrations.page, ...action.payload };
      return updateExternalRegistrationState(state, { page });
    }

    case ApiConstants.API_UPDATE_EXTERNAL_REGISTRATION_FILTERS: {
      const filters = { ...state.externalRegistrations.filters, ...action.payload };
      return updateExternalRegistrationState(state, {
        filters,
        page: {
          ...state.externalRegistrations.page,
          currentPage: 1,
        },
      });
    }

    default:
      return state;
  }
}

export default registration;
