import { getDataFromDb } from '../utils/dbConnect';

export interface Query {
  (Query: string): Promise<any>;
}

export let dbQueries: Query;
dbQueries = async function (Query: string): Promise<any> {
  return Promise.resolve(getDataFromDb(Query));
};
