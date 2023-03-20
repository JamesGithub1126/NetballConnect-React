import { DBqueries } from '@helpers/sql-queries';

import { expect, test } from '@playwright/test';

import { dbQueries } from '@fixtures/db-queries';
test('Verify if user is able to retrive data from database', async () => {
  let response = await dbQueries(DBqueries.GET_EMAILS);
  expect(response[0].emailID).toContain('spurqlabs@test.com');
});
