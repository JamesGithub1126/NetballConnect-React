// import { DataManager } from './../../Components';
import http from './shopHttp';
import * as moment from 'moment';
import {
  // getUserId,
  getAuthToken,
  getOrganisationData,
} from '../../../util/sessionStorage';
import history from '../../../util/history';
import * as message from '../../../util/messageHandler';

async function logout() {
  await localStorage.clear();
  history.push('/');
}

let token = getAuthToken();
let AxiosApi = {
  /////////////////product listing get API
  async getProductListing(sorterBy, order, offset, filter, limit) {
    let orgItem = await getOrganisationData();
    let organisationUniqueKey = orgItem.organisationUniqueKey;
    var url = `/product/list?organisationUniqueKey=${organisationUniqueKey}&sorterBy=${sorterBy}&order=${order}&offset=${offset}&filter=${filter}&limit=${limit}`;
    return Method.dataGet(url, token);
  },

  /////////////////Add product
  addProduct(payload) {
    let body = payload;
    var url = `/product`;
    return Method.dataPost(url, token, body);
  },

  ////////get reference type in the add product screen
  async getTypesOfProduct() {
    let orgItem = await getOrganisationData();
    let organisationUniqueKey = orgItem.organisationUniqueKey;
    var url = `/type/list?organisationUniqueKey=${organisationUniqueKey}`;
    return Method.dataGet(url, token);
  },

  ////delete product from the product listing API
  deleteProduct(productId) {
    var url = `/product?id=${productId}`;
    return Method.dataDelete(url, token);
  },

  ////delete product from the product listing API
  deleteProductVariant(optionId) {
    var url = `/product/variant?id=${optionId}`;
    return Method.dataDelete(url, token);
  },

  //////add type in the typelist array in from the API
  async addNewType(typeName) {
    let orgItem = await getOrganisationData();
    let organisationUniqueKey = orgItem.organisationUniqueKey;
    let body = {
      typeName: typeName,
      organisationUniqueKey: organisationUniqueKey,
    };
    var url = `/type`;
    return Method.dataPost(url, token, body);
  },

  /////////////////product listing get API
  getProductDetailsById(productId) {
    var url = `/product?id=${productId}`;
    return Method.dataGet(url, token);
  },

  /////////////shop setting get API
  async getShopSetting() {
    let orgItem = await getOrganisationData();
    let organisationUniqueKey = orgItem.organisationUniqueKey;
    var url = `/settings/list?organisationUniqueKey=${organisationUniqueKey}`;
    return Method.dataGet(url, token);
  },

  /////////////shop setting create address API
  createAddress(payload) {
    let body = payload;
    var url = `/settings`;
    return Method.dataPost(url, token, body);
  },

  ///////////shop order summary listing get API
  async getOrderSummaryListing(params) {
    let orgItem = await getOrganisationData();
    let organisationUniqueKey = orgItem.organisationUniqueKey;
    let { limit, offset, search, year, postcode, affiliate, paymentMethod, order, sorterBy } =
      params;
    var url = `/order/summary?currentOrganisation=${organisationUniqueKey}&organisationUniqueKey=${affiliate}&limit=${limit}&offset=${offset}&search=${search}&year=${year}&postcode=${postcode}&paymentMethod=${paymentMethod}&order=${order}&sorterBy=${sorterBy}`;
    return Method.dataGet(url, token);
  },

  // //// //////export order summary  API
  async exportOrderSummary(params) {
    let orgItem = await getOrganisationData();
    let organisationUniqueKey = orgItem.organisationUniqueKey;
    let {
      limit,
      offset,
      search,
      year,
      postcode,
      // affiliate,
      paymentMethod,
      order,
      sorterBy,
    } = params;
    var url = `/order/export/summary?organisationUniqueKey=${organisationUniqueKey}&limit=${limit}&offset=${offset}&search=${search}&year=${year}&postcode=${postcode}&paymentMethod=${paymentMethod}&order=${order}&sorterBy=${sorterBy}`;
    let _now = moment().utc().format('Y-MM-DD');
    return Method.dataGetDownload(url, token, `orderSummary-${_now}`);
  },

  // export order status  API
  async exportOrderStatus(params) {
    const orgItem = await getOrganisationData();
    const { organisationUniqueKey } = orgItem;
    const {
      limit,
      offset,
      search,
      year,
      paymentStatus,
      fulfilmentStatus,
      product,
      order,
      sorterBy,
    } = params;
    const url = `/order/export/status?organisationUniqueKey=${organisationUniqueKey}&limit=${limit}&offset=${offset}&search=${search}&year=${year}&paymentStatus=${paymentStatus}&fulfilmentStatus=${fulfilmentStatus}&product=${product}&order=${order}&sorterBy=${sorterBy}`;
    let _now = moment().utc().format('Y-MM-DD');
    return Method.dataGetDownload(url, token, `orderStatus-${_now}`);
  },

  /////// //order status status listing get API
  async getOrderStatusListing(params) {
    let orgItem = await getOrganisationData();
    let organisationUniqueKey = orgItem.organisationUniqueKey;
    let { limit, offset, search, year, paymentStatus, fulfilmentStatus, product, order, sorterBy } =
      params;
    var url = `/order/statusList?organisationUniqueKey=${organisationUniqueKey}&limit=${limit}&offset=${offset}&search=${search}&year=${year}&paymentStatus=${paymentStatus}&fulfilmentStatus=${fulfilmentStatus}&product=${product}&order=${order}&sorterBy=${sorterBy}`;
    return Method.dataGet(url, token);
  },

  ///////////update order status API
  updateOrderStatus(payload) {
    let body = payload;
    var url = `/order`;
    return Method.dataPut(url, token, body);
  },

  ///////////update order status API
  getOrderDetails(id) {
    var url = `/order?id=${id}`;
    return Method.dataGet(url, token);
  },

  /////// ///order status status listing get API
  getPurchasesListing(params) {
    let { limit, offset, userId, order, sorterBy } = params;
    var url = `/order/statusList?limit=${limit}&offset=${offset}&search=&year=-1&paymentStatus=-1&fulfilmentStatus=-1&product=All&order=${order}&sorterBy=${sorterBy}&userId=${userId}`;
    return Method.dataGet(url, token);
  },

  getShopCart(payload) {
    const url = `/api/shop/cart?shopUniqueKey=${payload.shopUniqueKey}`;
    return Method.dataGet(url, token);
  },
  saveShopCart(payload) {
    const url = '/api/shop/cart/update';
    return Method.dataPost(url, token, payload);
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
          } else if (result.status == 212) {
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
          console.log(err.response);
          if (err.response) {
            if (err.response.status !== null && err.response.status !== undefined) {
              if (err.response.status == 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus == 401) {
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
          } else if (result.status == 212) {
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
          console.log(err.response);
          if (err.response) {
            if (err.response.status !== null && err.response.status !== undefined) {
              if (err.response.status == 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus == 401) {
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
          } else if (result.status == 212) {
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
          console.log(err.response);
          if (err.response) {
            if (err.response.status !== null && err.response.status !== undefined) {
              if (err.response.status == 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus == 401) {
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
  //Put Method
  async dataPut(newurl, authorization, body) {
    const url = newurl;
    return await new Promise((resolve, reject) => {
      http
        .put(url, body, {
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
          } else if (result.status == 212) {
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
          console.log(err.response);
          if (err.response) {
            if (err.response.status !== null && err.response.status !== undefined) {
              if (err.response.status == 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus == 401) {
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
  async dataGetDownload(newurl, authorization, fileName) {
    const url = newurl;
    return await new Promise((resolve, reject) => {
      http
        .get(url, {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/csv',
            Authorization: 'BWSA ' + authorization,
            'Access-Control-Allow-Origin': '*',
            SourceSystem: 'WebAdmin',
          },
        })

        .then(result => {
          if (result.status === 200) {
            const url = window.URL.createObjectURL(new Blob([result.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName + '.csv'); //or any other extension
            document.body.appendChild(link);
            link.click();
            return resolve({
              status: 1,
              result: result,
            });
          } else if (result.status == 212) {
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
              if (err.response.status == 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus == 401) {
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
