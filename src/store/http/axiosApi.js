// import { DataManager } from './../../Components';
import http from '../http/http';
import {
  // getUserId,
  getAuthToken,
  getOrganisationData,
} from '../../util/sessionStorage';
import history from '../../util/history';
import * as message from '../../util/messageHandler';

async function logout() {
  await localStorage.clear();
  history.push('/');
}
let token = getAuthToken();
let AxiosApi = {
  // /login Api call
  Login(payload) {
    var base64 = require('base-64');
    var md5 = require('md5');
    let authorization = base64.encode(payload.userName + ':' + md5(payload.password));
    var url = '/users/loginWithEmailPassword';
    return Method.dataGet(url, authorization);
  },

  // //role Api
  // role() {
  //   var url = "/ref/roles";
  //   return Method.dataGet(url, token);
  // },

  // // User Role Entity Api
  // ure() {
  //   var url = "/ure";
  //   return Method.dataGet(url, token);
  // },

  ////registrationMembershipFeeList in membership table in the registration tab
  registrationCompetitionFeeList(offset, yearRefId) {
    let body = {
      paging: {
        offset,
        limit: 10,
      },
    };
    var url = `/api/competitionfee/listing/${yearRefId}`;
    return Method.dataPost(url, token, body);
  },

  ////registrationMembershipFeeList in membership table in the registration tab
  registrationMembershipFeeList(offset, yearRefId) {
    let body = {
      paging: {
        offset,
        limit: 10,
      },
    };
    var url = `/api/membershipproductfee/${yearRefId}`;
    return Method.dataPost(url, token, body);
  },

  ///registration Competition fee list product delete
  registrationCompetitionFeeListDelete(competitionId) {
    var url = `/api/competitionfee/${competitionId}`;
    return Method.dataDelete(url, token);
  },

  ///registration membership fee list product delete
  registrationMembershipFeeListDelete(payload) {
    let productId = payload.productId;
    var url = `/api/membershipproduct/${productId}`;
    return Method.dataDelete(url, token);
  },

  //////get the membership  product details
  // regGetMembershipProductDetails(payload) {
  //   let productId = payload.productId;
  //   var url = `/api/membershipproduct/${productId}`;
  //   return Method.dataGet(url, token);
  // },

  //////get the membership  product details
  regGetMembershipProductDetails(payload) {
    const productId = payload.productId;
    const url = `api/membershipproduct/details/${productId}`;
    return Method.dataGet(url, token);
  },

  //////save the membership  product details
  regSaveMembershipProductDetails(payload) {
    var url = `/api/membershipproduct`;
    return Method.dataPost(url, token, payload);
  },

  regSaveRegistrationForm(payload) {
    var url = `/api/orgregistration`;
    return Method.dataPost(url, token, payload);
  },

  /////get the common year list reference
  getYearList() {
    var url = `/common/reference/year`;
    return Method.dataGet(url, token);
  },

  getMembershipProductCategory() {
    const url = '/common/reference/membershipProductCategory';
    return Method.dataGet(url, token);
  },

  /////get fee types
  getFeeList() {
    var url = `/common/reference/FinanceFeeType`;
    return Method.dataGet(url, token);
  },

  /////get payment options
  getPaymentOptionsList() {
    var url = `/common/reference/PaymentOptions`;
    return Method.dataGet(url, token);
  },

  /////get payment methods
  getPaymentMethodsList() {
    var url = `/common/reference/PaymentMethod`;
    return Method.dataGet(url, token);
  },

  /////get the common membership product validity type list reference
  getProductValidityList() {
    var url = `/common/reference/MembershipProductValidity`;
    return Method.dataGet(url, token);
  },

  /////get the common Competition type list reference
  getCompetitionTypeList(year) {
    var url = `/api/orgregistration/competitionyear/${year}`;
    return Method.dataGet(url, token);
  },

  async getVenue() {
    let organisationId = await getOrganisationData().organisationUniqueKey;
    var url = `/api/venue/all?organisationUniqueKey=${organisationId}`;
    return Method.dataGet(url, token);
  },
  getRegFormSetting() {
    var url = '/common/reference/RegistrationSettings';
    return Method.dataGet(url, token);
  },
  getRegFormMethod() {
    var url = '/common/reference/RegistrationMethod';
    return Method.dataGet(url, token);
  },
  getMembershipProductList(CompetitionId) {
    var url = `/api/details/membershipproduct/${CompetitionId}`;
    return Method.dataGet(url, token);
  },
  getRegistrationForm(year, CompetitionId) {
    let body = {
      yearRefId: year,
      competitionUniqueKey: CompetitionId,
    };
    var url = '/api/orgregistration/details';
    return Method.dataPost(url, token, body);
  },
  ///////////get the default membership  product types in registartion membership fees
  regDefaultMembershipProductTypes() {
    var url = `api/membershipproducttype/default`;
    return Method.dataGet(url, token);
  },

  //////save the membership  product Fees
  regSaveMembershipProductFee(payload) {
    var url = `/api/membershipproduct/fees`;
    return Method.dataPost(url, token, payload);
  },
  //////save the membership  product Discount
  regSaveMembershipProductDiscount(payload) {
    var url = `/api/membershipproduct/discount`;
    return Method.dataPost(url, token, payload);
  },
  /////get the membership product discount Types
  membershipProductDiscountTypes() {
    var url = `/api/membershipproductdiscounttype/default`;
    return Method.dataGet(url, token);
  },

  /////get the common Membership Product Fees Type
  getMembershipProductFeesType() {
    var url = `/common/reference/MembershipProductFeesType`;
    return Method.dataGet(url, token);
  },
  ////get commom reference discount type
  getCommonDiscountTypeType() {
    var url = `/common/reference/discountType`;
    return Method.dataGet(url, token);
  },

  getRegistrationInvitees() {
    var url = '/common/reference/RegistrationInvitees';
    return Method.dataGet(url, token);
  },

  getCharityRoundUp() {
    var url = '/common/reference/CharityRoundUp';
    return Method.dataGet(url, token);
  },
  getPaymentOption() {
    var url = '/common/reference/PaymentOption';
    return Method.dataGet(url, token);
  },

  getGovtVouchers() {
    var url = '/common/reference/GovernmentVoucher';
    return Method.dataGet(url, token);
  },

  ////get the competition fees all the data in one API
  async getAllCompetitionFeesDeatils(competitionId) {
    let orgItem = await getOrganisationData();
    let organisationUniqueKey = orgItem ? orgItem.organisationUniqueKey : 1;
    var url = `/api/competitionfee/competitiondetails?competitionUniqueKey=${competitionId}&organisationUniqueKey=${organisationUniqueKey}`;
    return Method.dataGet(url, token);
  },

  ///////////save the competition fees deatils
  async saveCompetitionFeesDetails(payload) {
    let orgItem = await getOrganisationData();
    let organisationUniqueKey = orgItem ? orgItem.organisationUniqueKey : 1;
    var url = `/api/competitionfee/detail?organisationUniqueKey=${organisationUniqueKey}`;
    return Method.dataPost(url, token, payload);
  },

  /////save the competition membership tab details
  async saveCompetitionFeesMembershipTab(payload, competitionId) {
    let orgItem = await getOrganisationData();
    let organisationUniqueKey = orgItem ? orgItem.organisationUniqueKey : 1;
    var url = `api/competitionfee/membership?competitionUniqueKey=${competitionId}&organisationUniqueKey=${organisationUniqueKey}`;
    return Method.dataPost(url, token, payload);
  },

  ////get default competition membershipproduct tab details
  async getDefaultCompFeesMembershipProduct() {
    let orgItem = await getOrganisationData();
    let organisationUniqueKey = orgItem ? orgItem.organisationUniqueKey : 1;
    var url = `/api/competitionfee/membershipdetails?organisationUniqueKey=${organisationUniqueKey}`;
    return Method.dataGet(url, token);
  },

  /////save the division table data  in the competition fees section
  async saveCompetitionFeesDivisionAction(payload, competitionId) {
    let orgItem = await getOrganisationData();
    let organisationUniqueKey = orgItem ? orgItem.organisationUniqueKey : 1;
    var url = `/api/competitionfee/division?competitionUniqueKey=${competitionId}&organisationUniqueKey=${organisationUniqueKey}`;
    return Method.dataPost(url, token, payload);
  },
  //casual PaymentOption
  getCasualPayment() {
    var url = '/common/reference/CasualPaymentOption';
    return Method.dataGet(url, token);
  },

  //seasonal PaymentOption
  getSeasonalPayment() {
    var url = '/common/reference/SeasonalPaymentOption';
    return Method.dataGet(url, token);
  },

  //per match PaymentOption
  getPerMatchOption() {
    var url = '/common/reference/PerMatchPaymentOption';
    return Method.dataGet(url, token);
  },

  //post payment
  async postCompetitionPayment(payload, competitionId, organisationKey) {
    let orgItem = await getOrganisationData();
    let organisationUniqueKey = orgItem ? orgItem.organisationUniqueKey : 1;
    var url = `/api/competitionfee/paymentoption?competitionUniqueKey=${competitionId}&organisationUniqueKey=${organisationUniqueKey}`;
    return Method.dataPost(url, token, payload);
  },

  // Post competition fee section
  async postCompetitionFeeSection(payload, competitionId, organisationKey) {
    let orgItem = await getOrganisationData();
    let organisationUniqueKey = orgItem ? orgItem.organisationUniqueKey : 1;
    var url = `/api/competitionfee/fees?competitionUniqueKey=${competitionId}&organisationUniqueKey=${organisationUniqueKey}`;
    return Method.dataPost(url, token, payload);
  },
  //post competition fee discount
  async postCompetitonFeeDiscount(payload, competitionId, organisationKey) {
    let orgItem = await getOrganisationData();
    let organisationUniqueKey = orgItem ? orgItem.organisationUniqueKey : 1;
    var url = `/api/competitionfee/discount?competitionUniqueKey=${competitionId}&organisationUniqueKey=${organisationUniqueKey}`;
    return Method.dataPost(url, token, payload);
  },

  /////get the membership product discount Types
  competitionFeeDiscountTypes() {
    var url = `/api/competitionfee/competitiondiscounttype/default`;
    return Method.dataGet(url, token);
  },
  //Payment Methods
  getPaymentMethods() {
    var url = '/common/reference/PaymentMethod';
    return Method.dataGet(url, token);
  },
  getRegBadgeData() {
    var url = `/common/reference/AccreditationUmpire`;
    return Method.dataGet(url, token);
  },

  getDiscountMethodList() {
    var url = `/common/reference/discountMethod`;
    return Method.dataGet(url, token);
  },
};

const Method = {
  async dataPost(newurl, authorization, body) {
    const url = newurl;
    return await new Promise((resolve, reject) => {
      http
        .post(url, body, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            Authorization: 'BWSA ' + authorization,
            SourceSystem: 'WebAdmin',
          },
        })

        .then(result => {
          if (result.status === 200) {
            return resolve({
              status: 1,
              result: result,
            });
          } else if (result.status === 212) {
            return resolve({
              status: 4,
              result: result,
            });
          } else {
            if (result) {
              return reject({
                status: 3,
                error: result.data.message,
              });
            } else {
              return reject({
                status: 4,
                error: 'Something went wrong.',
              });
            }
          }
        })
        .catch(err => {
          if (err.response) {
            if (err.response.status !== null && err.response.status !== undefined) {
              if (err.response.status === 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus === 401) {
                  logout();
                  message.error({ status: 401 });
                }
              } else {
                return reject({
                  status: 5,
                  error: err,
                });
              }
            }
          } else {
            return reject({
              status: 5,
              error: err,
            });
          }
        });
    });
  },

  // Method to GET response

  async dataGet(newurl, authorization) {
    const url = newurl;
    return await new Promise((resolve, reject) => {
      http
        .get(url, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'BWSA ' + authorization,
            'Access-Control-Allow-Origin': '*',
            SourceSystem: 'WebAdmin',
          },
        })

        .then(result => {
          if (result.status === 200) {
            return resolve({
              status: 1,
              result: result,
            });
          } else if (result.status === 212) {
            return resolve({
              status: 4,
              result: result,
            });
          } else {
            if (result) {
              return reject({
                status: 3,
                error: result.data.message,
              });
            } else {
              return reject({
                status: 4,
                error: 'Something went wrong.',
              });
            }
          }
        })
        .catch(err => {
          if (err.response) {
            if (err.response.status !== null && err.response.status !== undefined) {
              if (err.response.status === 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus === 401) {
                  logout();
                  message.error({ status: 401 });
                }
              } else {
                return reject({
                  status: 5,
                  error: err,
                });
              }
            }
          } else {
            return reject({
              status: 5,
              error: err,
            });
          }
        });
    });
  },

  async dataDelete(newurl, authorization) {
    const url = newurl;
    return await new Promise((resolve, reject) => {
      http
        .delete(url, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'BWSA ' + authorization,
            'Access-Control-Allow-Origin': '*',
            SourceSystem: 'WebAdmin',
          },
        })

        .then(result => {
          if (result.status === 200) {
            return resolve({
              status: 1,
              result: result,
            });
          } else if (result.status === 212) {
            return resolve({
              status: 4,
              result: result,
            });
          } else {
            if (result) {
              return reject({
                status: 3,
                error: result.data.message,
              });
            } else {
              return reject({
                status: 4,
                error: 'Something went wrong.',
              });
            }
          }
        })
        .catch(err => {
          if (err.response) {
            if (err.response.status !== null && err.response.status !== undefined) {
              if (err.response.status === 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus === 401) {
                  logout();
                  message.error({ status: 401 });
                }
              } else {
                return reject({
                  status: 5,
                  error: err,
                });
              }
            }
          } else {
            return reject({
              status: 5,
              error: err,
            });
          }
        });
    });
  },
};

export default AxiosApi;
