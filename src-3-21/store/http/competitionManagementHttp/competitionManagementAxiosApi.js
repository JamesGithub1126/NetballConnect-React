import competitionManagementHttp from './competitionManagementHttp';
import history from '../../../util/history';
import  * as message  from '../../../util/messageHandler';
import {
  getUserId,
  getAuthToken,
  // getOrganisationData
} from '../../../util/sessionStorage';

async function logout() {
  await localStorage.clear();
  history.push('/');
}

let token = getAuthToken();
// let userId = getUserId()

let CompManagementAxiosApi = {
  async getCompetitionFormat(input) {
    let userId = await getUserId();
    var url = `/api/competitionformat?userId=${userId}`;
    return Method.dataPost(url, token, input.payload);
  },

  async saveCompetitionFormat(input) {
    let userId = await getUserId();
    var url = `/api/competitionformat/save?userId=${userId}`;
    return Method.dataPost(url, token, input);
  },

  async getCompetitonFinals(input) {
    let userId = await getUserId();
    var url = `/api/competitionfinals?userId=${userId}`;
    return Method.dataPost(url, token, input.payload);
  },

  async saveCompetitionFinals(input) {
    let userId = await getUserId();
    var url = `/api/competitionfinals/save?userId=${userId}`;
    return Method.dataPost(url, token, input);
  },

  async getLadderFormat(input) {
    let userId = await getUserId();
    var url = `/api/ladderformat?userId=${userId}`;
    return Method.dataPost(url, token, input.payload);
  },
  async saveLadderFormat(input) {
    let userId = await getUserId();
    var url = `/api/ladderformat/save?userId=${userId}`;
    return Method.dataPost(url, token, input);
  },

  async getTemplateDownload() {
    var url = `/api/template/download`;
    return Method.dataGetDownload(url, token);
  },
};

const Method = {
  async dataPost(newurl, authorization, body) {
    const url = newurl;
    return await new Promise((resolve, reject) => {
      competitionManagementHttp
        .post(url, body, {
          timeout: 180000,
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
                  message.error({status:401});
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
      competitionManagementHttp
        .get(url, {
          timeout: 180000,
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
                  message.error({status:401});
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

  async dataGetDownload(newurl, authorization) {
    const url = newurl;
    return await new Promise((resolve, reject) => {
      competitionManagementHttp
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
            link.setAttribute('download', 'filecsv.csv'); //or any other extension
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
          if (err.response) {
            if (err.response.status !== null && err.response.status !== undefined) {
              if (err.response.status === 401) {
                let unauthorizedStatus = err.response.status;
                if (unauthorizedStatus === 401) {
                  logout();
                  message.error({status:401});
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
      competitionManagementHttp
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
                  message.error({status:401});
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

export default CompManagementAxiosApi;
