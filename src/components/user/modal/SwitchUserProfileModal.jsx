import { Modal, message } from 'antd';
import React from 'react';
import userHttpApi from 'store/http/userHttp/userAxiosApi';
import AppConstants from 'themes/appConstants';

/**
 * @param {object} props
 * @oaram {boolean} props.visible - passing true will change the visibility and will render the Modal on the page.
 * @oaram {function} props.onCancel - Defines what needs to be done when cancel is clicked
 * @oaram {{masterUserId:number, childUserId:number, typeOfSwap:string}} props.usersToSwap - IDs of masterUser and childUser to be used for swapping. typeOfSwap can be either "Primary" or "Secondary"
 * @returns <JSX.Element>
 */
const SwitchUserProfileModal = ({ usersToSwap, visible, onCancel }) => {
  const onOkClicked = async () => {
    try {
      const { result } = await userHttpApi.swapUserAccounts(usersToSwap);
      if (result.data.status === 'error') {
        message.error(result.data.message);
      } else {
        message.success(result.data.message);
      }
    } catch (err) {
      message.error(AppConstants.somethingWentWrong);
    }
    onCancel();
  };

  return (
    <Modal
      title={AppConstants.confirm}
      visible={visible}
      onCancel={onCancel}
      onOk={() => onOkClicked()}
      closable={false}
    >
      <span>{AppConstants.modalProceedMsg} </span>
    </Modal>
  );
};

export default SwitchUserProfileModal;
