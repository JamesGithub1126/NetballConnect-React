import React from 'react';
import { useSelector } from 'react-redux';
import {
  Button,
  Modal,
  DatePicker,
  Select,
  InputNumber,
  Radio,
} from 'antd';
import { upperCase } from 'lodash';
import InputWithHead from 'customComponents/InputWithHead';
import moment from 'moment';
import AppConstants from 'themes/appConstants';

const { Option } = Select;

const SuspensionModal = ({suspension, showModal, setShowModal}) => {
  const commonReducerState = useSelector(state => state.CommonReducerState);
  const {suspensionApplyToList} = commonReducerState;

  const formatDate = date => {
    return date? moment(date, 'YYYY-MM-DD') : null;
  };

  return (
    <Modal
      title={AppConstants.suspension}
      visible={showModal}
      onCancel={() => setShowModal(false)}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
      centered
      footer={null}
    >
      <div className="row">
        <div className="col-sm-6">
          <InputWithHead required="pt-0" heading={AppConstants.dateFrom} />
          <DatePicker
            className="reg-payment-datepicker w-100"
            size="default"
            style={{ minWidth: 160 }}
            format="DD-MM-YYYY"
            showTime={false}
            placeholder="dd-mm-yyyy"
            value={formatDate(suspension?.suspendedFrom)}
            readonly
            disabled={true}
          />
        </div>

        <div className="col-sm-6">
          <InputWithHead required="pt-0" heading={AppConstants.dateTo} />
          <DatePicker
            className="reg-payment-datepicker w-100"
            size="default"
            style={{ minWidth: 160 }}
            format="DD-MM-YYYY"
            showTime={false}
            placeholder="dd-mm-yyyy"
            value={formatDate(suspension?.suspendedTo)}
            readonly
            disabled={true}
          />
        </div>
      </div>
      <div className="row justify-content-between">
        <div className="col-sm-6">
          <span className="text-heading-large pt-5">{AppConstants.applyToRole}</span>
          <Radio.Group
            className="reg-competition-radio w-100"
            name="applySuspensionTo"
            value={suspension?.suspensionTypeRefId}
          >
            {suspensionApplyToList.map(item => (
              <div className="row mt-0 ml-0" key={item.id}>
                <Radio
                  style={{
                    marginRight: 0,
                    paddingRight: 0,
                  }}
                  value={item.id}
                >
                  {item.description}
                </Radio>
              </div>
            ))}
          </Radio.Group>
        </div>

        <div className="col-sm-6">
          <span className="text-heading-large pt-5">{upperCase(AppConstants.or)}</span>
          <InputWithHead required="pt-0" heading={AppConstants.numberOfMatches} />
          <InputNumber
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            value={suspension?.suspendedMatches}
            placeholder="0"
            disabled={!!suspension?.suspendedTo}
          />
        </div>
      </div>

      {/* {suspension?.suspensionTypeRefId === 2 && (
        <div className="d-flex pt-5">
          <Select
            name="offence1"
            className="w-100"
            placeholder={AppConstants.selectUser}
            value={suspendedRoleFullName}
          >
            {incidentPlayers.length ? (
              incidentPlayers.map(item => (
                <Option key={`offence1Type_${item.player.userId}`} value={item.player.userId}>
                  {`${item.player.firstName} ${item.player.lastName}`}
                </Option>
              ))
            ) : (
              <Option key={`offence1Type_${foulUser.id}`} value={foulUser.id}>
                {`${foulUser.firstName} ${foulUser.lastName}`}
              </Option>
            )}
          </Select>
        </div>
      )} */}

      {/* <div
        className="comp-dashboard-botton-view-mobile d-flex justify-content-between"
        style={{ paddingTop: 24 }}
      >
        <Button onClick={() => setShowModal(false)} type="cancel-button">
          {AppConstants.cancel}
        </Button>
        <Button onClick={this.submitSuspensionDialog} type="primary" disabled={!isSubmitActive}>
          {AppConstants.confirm}
        </Button>
      </div> */}
    </Modal>
  );
};

export default SuspensionModal;