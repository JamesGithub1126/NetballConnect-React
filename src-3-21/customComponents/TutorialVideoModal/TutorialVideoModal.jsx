import React from 'react';
import { Modal } from 'antd';
import ReactPlayer from 'react-player';

const TutorialVideoModal = ({ visible, url, onOK, onCancel }) => {
  if (visible === false || !url) {
    return null;
  }

  return (
    <Modal
      className="add-membership-type-modal"
      visible={visible}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
      onOk={onOK}
      onCancel={onCancel}
      width={800}
      closable={false}
      centered
      footer={null}
      bodyStyle={{
        background: 'rgba(0, 0, 0, 0.2)',
        padding: '10px',
      }}
    >
      <ReactPlayer url={url} width="100%" height="calc(100vh - 300px)" playing={visible} controls />
    </Modal>
  );
};

export default TutorialVideoModal;
