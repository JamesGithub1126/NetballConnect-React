import { Modal } from 'antd';
import React, { useEffect } from 'react';
import MoveModal from './MoveModal';
import AppConstants from 'themes/appConstants';
import { useDispatch, useSelector } from 'react-redux';
import {
  moveModalButtonClicked,
  setFinalPlayersList,
} from 'store/actions/moveFAPlayerAction/movePlayerAction';
const MoveModalComponentWrapper = ({ organisationUniqueKey, visible, handleOnModalClick }) => {
  const { finalMovePlayersList, playersToMove, modalVisible } = useSelector(
    state => state.MovePlayerState,
  );
  const dispatch = useDispatch();
  const registrationIdsArray = [];

  const handleOnOk = () => {
    dispatch(moveModalButtonClicked(finalMovePlayersList));
    Modal.destroyAll();
  };

  useEffect(() => {
    for (let i of playersToMove) {
      registrationIdsArray.push(i.registrationId);
    }
    dispatch(
      setFinalPlayersList({
        ...finalMovePlayersList,
        registrationIds: registrationIdsArray,
      }),
    );
  }, [playersToMove]);
  return (
    <Modal
      title={AppConstants.footballAustraliaMoveCompetition}
      visible={modalVisible}
      closable={true}
      onCancel={handleOnModalClick}
      onOk={handleOnOk}
    >
      <MoveModal organisationUniqueKey={organisationUniqueKey} />
      {/** This is the player Move Modal, bad varibale name ? :(  */}
    </Modal>
  );
};

export default MoveModalComponentWrapper;
