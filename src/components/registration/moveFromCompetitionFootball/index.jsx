import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'antd';

import AppConstants from 'themes/appConstants';
import { moveModalButtonClicked } from 'store/actions/moveFAPlayerAction';
import Loader from '../../../customComponents/loader';

import validate from '../replicatePlayer/validation';
import Content from './Content';

const MovePlayerModal = ({ selectedPlayers, onChancel }) => {
  const dispatch = useDispatch();
  const { finalMovePlayersList, modalVisible, onLoad } = useSelector(
    state => state.MovePlayerState,
  );

  const handleSubmit = useCallback(() => {
    if (!validate(finalMovePlayersList)) {
      return;
    }
    const registrationIds = selectedPlayers.map(i => i.registrationId);
    const payload = {
      ...finalMovePlayersList,
      registrationIds,
    };
    dispatch(moveModalButtonClicked(payload));
    Modal.destroyAll();
  }, [dispatch, selectedPlayers, finalMovePlayersList]);

  if (!modalVisible) {
    return <></>;
  }

  return (
    <>
      <Loader visible={onLoad} />
      <Modal
        title={AppConstants.footballAustraliaMoveCompetition}
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

export default MovePlayerModal;
