import React, { useState } from 'react';
import { Modal, message, Button } from 'antd';
import AppConstants from 'themes/appConstants';
import InputWithHead from './InputWithHead';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveBlockDeclineAction } from 'store/actions/umpireAction/umpireDashboardAction';

const BlockDeclineModal = ({ onSave, onCancel, competitionName, compUniqueKey }) => {
  const { contact } = useSelector(state => state.UmpireDashboardState.competitionData);
  const dispatch = useDispatch();
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const onDeleteBlockDecline = () => {
    return Modal.confirm({
      title: AppConstants.umpireBlockDeclineModalTitle,
      content: AppConstants.umpireBlockDeclineDltMsg,
      cancelText: AppConstants.cancel,
      okText: AppConstants.save,
      onOk: () =>
        dispatch(saveBlockDeclineAction({ id: compUniqueKey, contact: null })) && onCancel(),
      onCancel: () => onCancel(),
    });
  };

  useEffect(() => {
    if (contact?.umpireDeclineThresholdMinutes) {
      const minutes = contact.umpireDeclineThresholdMinutes % 60;
      const hours = Math.floor(contact.umpireDeclineThresholdMinutes / 60);
      setMinutes(minutes);
      setHours(hours % 24);
      setDays(Math.floor(hours / 24));
      setName(contact.name);
      setPhone(contact.phone);
    }
  }, [contact]);

  const getRecordingTime = (days = 0, hours = 0, minutes = 0) => {
    const dayToMinutes = days * 24 * 60;
    const hoursToMinutes = hours * 60;
    const totalMinutes = dayToMinutes + hoursToMinutes + +minutes;
    return totalMinutes;
  };

  return (
    <Modal
      className="add-membership-type-modal"
      title={AppConstants.blockingDeclineForOfficials}
      visible={true}
      maskClosable={false}
      closable={false}
      focusTriggerAfterClose={false}
      footer={[
        <div className="d-flex">
          <Button
            className="flex-start"
            onClick={() => onDeleteBlockDecline()}
            disabled={contact === null}
          >
            {AppConstants.deleteBlockDecline}
          </Button>
          <div className="flex-end ml-auto">
            <Button
              onClick={() => {
                const totalMinutes = getRecordingTime(Number(days), Number(hours), Number(minutes));
                onSave({ umpireDeclineThresholdMinutes: totalMinutes, name, phone });
              }}
              className="ant-btn-primary"
            >
              {AppConstants.save}
            </Button>
            <Button onClick={onCancel} className="ant-btn">
              {AppConstants.cancel}
            </Button>
          </div>
        </div>,
      ]}
    >
      <div className="modal-publish-popup">
        <div className="d-flex">
          <div
            className="breadcrumb-add"
            style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}
          >
            {competitionName}
          </div>
        </div>
        <div className="d-flex">
          <div
            className="breadcrumb-add"
            style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}
          >
            {AppConstants.howLongBeforeMatch}
          </div>
        </div>
        <div className="row mb-5">
          <div className="col-sm">
            <InputWithHead
              heading={AppConstants._days}
              placeholder={AppConstants._days}
              value={days}
              onChange={e => setDays(e.target.value)}
            />
          </div>
          <div className="col-sm">
            <InputWithHead
              heading={AppConstants._hours}
              placeholder={AppConstants._hours}
              value={hours}
              onChange={e => setHours(e.target.value)}
            />
          </div>
          <div className="col-sm">
            <InputWithHead
              heading={AppConstants._minutes}
              placeholder={AppConstants._minutes}
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
            />
          </div>
        </div>
        <div className="d-flex">
          <div className="breadcrumb-add" style={{ fontSize: 15, fontWeight: 700 }}>
            {AppConstants.contact}
          </div>
        </div>
        <div className="mb-2">
          <InputWithHead
            heading={AppConstants.name}
            placeholder={AppConstants.name}
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <InputWithHead
            heading={AppConstants.phone}
            placeholder={AppConstants.phone}
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default BlockDeclineModal;
