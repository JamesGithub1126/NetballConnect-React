export const DBqueries = {
  GET_EMAILS:
    'select id, emailID, content from wsa_common.communicationTrack where emailID="spurqlabs@test.com" order by id desc limit 10',
};
