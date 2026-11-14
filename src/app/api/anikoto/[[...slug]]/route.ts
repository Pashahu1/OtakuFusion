import { anikotoGoneResponse } from '@/server/anikoto/routeHelpers';

function gone(): Response {
  return anikotoGoneResponse();
}

export {
  gone as DELETE,
  gone as GET,
  gone as OPTIONS,
  gone as PATCH,
  gone as POST,
  gone as PUT,
};
