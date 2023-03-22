import supportHttp from './supportHttp';

let supportHttpApi = {
  // Get Help and Support content

  //
  // The '_limit' query params is a temporary fix, as by default Strapi returns 
  // 100 rows. Which means only the first 100 articles, as defined by the Strapi
  // Content ID, will be loaded. Irrespective of where and artcile sits within 
  // the content tree. E.g. subArticles, parentArticles etc etc....
  //
  // Its probably better to review how we load help articles instead 
  // of loading all articles in one big hit.
  //
  // The _limit=250 allows up to 250 articles be loaded, adjust as required.
  //
  getSupportContent() {
    const url = 'help-and-supports?_limit=250';
    return Method.dataGet(url);
  },
};

let Method = {
  // Method to GET response
  async dataGet(newUrl) {
    const url = newUrl;
    return await new Promise((resolve, reject) => {
      supportHttp
        .get(url, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
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
          console.log(err);

          return reject({
            status: 5,
            error: err,
          });
        });
    });
  },
};

export default supportHttpApi;
