import { takeEvery } from 'redux-saga/effects';

import ApiConstants from 'themes/apiConstants';
import { communicationListSaga } from './communicaitonListSaga';
import { communicationAddSaga } from './communicationAddSaga';
import { communicationDeleteSaga } from './communicaitonDeleteSaga';
import { communicationPublishSaga } from './communicationPublishSaga';

export default function* rootCommunicationListSaga() {
  yield takeEvery(ApiConstants.API_COMMUNICATION_LIST_LOAD, communicationListSaga);
  yield takeEvery(ApiConstants.API_ADD_COMMUNICATION_LOAD, communicationAddSaga);
  yield takeEvery(ApiConstants.API_DELETE_COMMUNICATION_LOAD, communicationDeleteSaga);
  yield takeEvery(ApiConstants.API_COMMUNICATION_PUBLISH_LOAD, communicationPublishSaga);
}
