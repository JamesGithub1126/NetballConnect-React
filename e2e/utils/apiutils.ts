import { APIRequest, APIResponse, request } from '@playwright/test';

export async function api_Request(
  auth: any,
  url: any,
  headers: any,
  body: any,
  method: any,
): Promise<any> {
  const api_request = await request.newContext();

  let response_data: APIResponse = await api_request[method](url, {
    data: body,
    headers: {
      headers,
      Authorization: auth,
    },
  });

  let allResponse: APIResponse = response_data;
  let response: Buffer = Buffer.from(await response_data.body());
  let status: number = await response_data.status();

  let responseBody: Buffer = response;
  let getResponseBody: string = responseBody.toString('ascii');

  return allResponse;
}
