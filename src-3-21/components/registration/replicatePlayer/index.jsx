import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'antd';

import AppConstants from 'themes/appConstants';
import { replicatePlayersAction } from 'store/actions/replicatePlayerAction';
import Loader from '../../../customComponents/loader';

import Content from './Content';

const ReplicatePlayerModal = ({ selectedPlayers, onChancel }) => {
  const { selections, modalVisible, onLoad } = useSelector(state => state.ReplicatePlayerState);
  const dispatch = useDispatch();

  const handleSubmit = useCallback(() => {
    const registrationIds = selectedPlayers.map(i => ({
      userId: i.userId,
      registrationId: i.registrationId,
    }));
    const payload = {
      ...selections,
      registrationIds,
    };
    dispatch(replicatePlayersAction(payload));
  }, [dispatch, selectedPlayers, selections]);

  return (
    <>
      <Loader visible={onLoad} />
      <Modal
        title={AppConstants.replicatePlayer}
        visible={modalVisible}
        closable={true}
        onCancel={onChancel}
        onOk={handleSubmit}
      >
        <Content />
      </Modal>
    </>
  );
};

export default ReplicatePlayerModal;