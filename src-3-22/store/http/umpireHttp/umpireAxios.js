// import { DataManager } from './../../Components';
import http from './umpireHttp';
import {
  // getUserId,
  getAuthToken,
  // getOrganisationData,
  // getLiveScoreCompetition
} from '../../../util/sessionStorage';
import history from '../../../util/history';
import * as message from '../../../util/messageHandler';
import moment from 'moment';
// import { isArrayNotEmpty } from "../../../util/helpers";
import AppConstants from 'themes/appConstants';

async function logout() {
  await localStorage.clear();
  history.push('/');
}

let token = getAuthToken();
// let userId = getUserId();

let UmpireAxiosApi = {
  umpireTeamsGet(data) {
    const { competitionId, umpireId, organisationId } = data;
    let url = `/competitions/${competitionId}/umpires/details?organisationId=${organisationId}`;
    if (umpireId) url += `&umpireId=${umpireId}`;
    return Method.dataGet(url, token);
  },

  umpireListGet(data) {
    let url = null;
    const {
      competitionId,
      organisationId,
      offset,
      limit,
      skipAssignedToPools = false,
      sortBy,
      sortOrder,
      searchText,
    } = data;
    if (sortBy && sortOrder) {
      url = `/competitions/${competitionId}/umpires?organisationId=${organisationId}&offset=${offset}&limit=${limit}&skipAssignedToPools=${skipAssignedToPools}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    } else {
      url = `/competitions/${competitionId}/umpires?organisationId=${organisationId}&offset=${offset}&limit=${limit}&skipAssignedToPools=${skipAssignedToPools}`;
    }
    if (searchText) {
      url += `&searchText=${searchText}`;
    }
    return Method.dataGet(url, token);
  },

  exportUmpireList(data) {
    let url = null;
    const {
      competitionId,
      organisationId,
      offset = 0, //making sure it's a zero
      limit = 0, //making sure it's a zero
      skipAssignedToPools = false,
    } = data;
    url = `/competitions/${competitionId}/umpires/export?organisationId=${organisationId}&offset=${offset}&limit=${limit}&skipAssignedToPools=${skipAssignedToPools}`;

    return Method.dataGetDownload(url, token);
  },

  umpirePaymentSettingsGet(data) {
    const { competitionId, organisationId } = data;
    const url = `/competitions/${competitionId}/umpires/payment/settings?organisationId=${organisationId}`;
    return Method.dataGet(url, token);
  },

  umpireAllocationSettingsPost(data) {
    const competitionId = JSON.stringify(data.competitionId);
    const organisationId = JSON.stringify(data.organisationId);
    const url = `/competitions/${competitionId}/umpires/settings/allocation?organisationId=${organisationId}`;
    return Method.dataPost(url, token, data.body);
  },

  umpireAllocationSettingsGet(competitionId) {
    const url = `/competitions/${competitionId}/umpires/settings/allocation`;
    return Method.dataGet(url, token);
  },

  umpirePaymentSettingsPost(data) {
    const competitionId = JSON.stringify(data.competitionId);
    const organisationId = JSON.stringify(data.organisationId);
    const url = `/competitions/${competitionId}/umpires/payment/settings/${data.type}?organisationId=${organisationId}`;
    return Method.dataPost(url, token, data.body);
  },

  getUmpirePoolAllocation(payload) {
    const url =
      `/competitions/` + payload.compId + `/umpires/pools?organisationId=${payload.orgId}`;
    return Method.dataGet(url, token);
  },

  getUmpirePoolAvailability(payload) {
    const url =
      `/competitions/` + payload.competitionId + `/umpires/availability`;
    return Method.dataGet(url, token, payload);
  },

  umpireAvailabilityExport(payload) {
    const url =
      `/competitions/` + payload.competitionId + `/umpires/availability/export`;
    return Method.dataGetDownload(url, token, payload);
  },

  saveUmpirePoolAllocation(payload) {
    const url =
      `competitions/` +
      payload.compId +
      `/umpires/pools?competitionId=${payload.compId}&organisationId=${payload.orgId}`;
    return Method.dataPost(url, token, payload.poolObj);
  },

  deleteUmpirePoolAllocation(payload) {
    const url =
      `/competitions/` +
      payload.compId +
      `/umpires/pools/${payload.umpirePoolId}?organisationId=${payload.orgId}`;
    return Method.dataDelete(url, token);
  },

  updateUmpirePoolAllocation(payload) {
    const url =
      `/competitions/` +
      payload.compId +
      `/umpires/pools/${payload.umpirePoolId}/add?organisationId=${payload.orgId}`;
    return Method.dataPost(url, token, payload.body);
  },

  updateUmpirePoolAllocationMany(payload) {
    const url =
      `/competitions/` +
      payload.compId +
      `/umpires/pools/batch?organisationId=${payload.orgId}&version=2`;
    return Method.dataPatch(url, token, payload.body);
  },

  updateUmpirePoolAllocationToDivision(payload) {
    const url = `/competitions/` + payload.compId + `/umpires/pools/divisions`;
    return Method.dataPatch(url, token, payload.body);
  },

  getRankedUmpiresCount(payload) {
    const url = `/competitions/id/${payload.competitionId}/ranked-umpires-count`;
    return Method.dataGet(url, token);
  },

  updateUmpireRank(payload) {
    const url = `/competitions/${payload.competitionId}/umpires/${payload.umpireId}/rank?organisationId=${payload.organisationId}`;
    return Method.dataPatch(url, token, {
      rank: payload.umpireRank,
      updateRankType: payload.updateRankType,
    });
  },

  applyUmpireAllocationAlgorithm(payload) {
    const url = `/competitions/` + payload.compId + `/umpires/allocation`;
    return Method.dataPost(url, token, payload.body);
  },

  getAdminList(data) {
    const url = `/users/admin?organisationId=${data.organisationId}`;
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
          if (result.status === 200 || result.status === 201) {
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
            if (err.response.status !== null || err.response.status !== undefined) {
              if (err.response.status === 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus === 401) {
                  logout();
                  message.error({ status: 401 });
                }
              } else if (err.response.status === 400) {
                message.config({
                  duration: 1.5,
                  maxCount: 1,
                });
                message.error({ content: err.response.data.message });
                return reject({
                  status: 5,
                  error: err.response.data.message,
                });
              } else {
                return reject({
                  status: 5,
                  error: err.response && err.response.data.message,
                });
              }
            }
          } else {
            return reject({
              status: 5,
              error: err.response && err.response.data.message,
            });
          }
        });
    });
  },

  // Method to GET response

  async dataGet(newurl, authorization, params = {}) {
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
          params
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
              } else if (err.response.status === 500) {
                // message.error(err.response.data.message)
                return reject({
                  status: 5,
                  error: 'Something went wrong.',
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

  async dataPatch(newUrl, authorization, body) {
    const url = newUrl;
    return await new Promise((resolve, reject) => {
      http
        .patch(url, body, {
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
            if (err.response.status !== null || err.response.status !== undefined) {
              if (err.response.status === 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus === 401) {
                  logout();
                  message.error({ status: 401 });
                }
              } else if (err.response.status === 400) {
                message.config({
                  duration: 1.5,
                  maxCount: 1,
                });
                message.error({ content: err.response.data.message });
                return reject({
                  status: 5,
                  error: err.response.data.message,
                });
              } else {
                return reject({
                  status: 5,
                  error: err.response && err.response.data.message,
                });
              }
            }
          } else {
            return reject({
              status: 5,
              error: err.response && err.response.data.message,
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

  async dataGetDownload(newurl, authorization, params = {}) {
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
          params,
        })

        .then(result => {
          if (result.status === 200) {
            const url = window.URL.createObjectURL(new Blob([result.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'filecsv.csv'); //or any other extension
            let filename = 'filename.csv';
            let _now = moment().utc().format('Y-MM-DD');
            if (newurl.includes('/umpires/export')) {
              link.setAttribute('download', `${AppConstants.umpires} list - ${_now}.csv`);
            } else {
              link.setAttribute('download', filename); //or any other extension
            }

            document.body.appendChild(link);
            link.click();
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
          console.log(err.response);
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
export default UmpireAxiosApi;
