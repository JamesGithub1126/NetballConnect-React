import { Button, Input, Modal } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppConstants from 'themes/appConstants';

export const ConfirmModal = ({
  confirmText,
  content,
  title,
  visible,
  onOk,
  onCancel,
  okText,
  cancelText,
}) => {
  const [state, setState] = useState({
    inputText: '',
    canConfirm: false,
    confirmText:
      confirmText && confirmText !== '' ? confirmText : AppConstants.confirm.toUpperCase(),
  });

  useEffect(() => {
    if (!visible) {
      setState({
        ...state,
        inputText: '',
        canConfirm: false,
      });
    }
  }, [visible]);

  const handleTextChange = e => {
    const text = e.target.value;
    const confirm = text === confirmText;
    setState({ inputText: text, canConfirm: confirm });
  };
  const confirmBox = (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <div>{`Type "${confirmText}" in the box below to proceed.`}</div>
      <div>
        <Input
          value={state.inputText}
          onChange={e => handleTextChange(e)}
          title={title}
          visible={visible}
          width={'100px'}
        ></Input>
      </div>
    </div>
  );

  const this_content = (
    <div>
      {content ? <div className="mb-5">{content}</div> : null}
      <div>{confirmBox}</div>
    </div>
  );

  const modal = (
    <Modal
      title={title}
      visible={visible}
      closable={false}
      maskClosable={false}
      footer={[
        <Button key="cancel" onClick={onCancel ? onCancel : null}>
          {cancelText ? cancelText : AppConstants.cancel}
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!state.canConfirm}
          onClick={onOk ? onOk : null}
        >
          {okText ? okText : AppConstants.confirm}
        </Button>,
      ]}
    >
      {this_content}
    </Modal>
  );

  return modal;
};
