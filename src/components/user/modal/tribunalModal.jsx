import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Input,
  Modal,
  DatePicker,
  Select,
  Checkbox,
} from 'antd';
import InputWithHead from 'customComponents/InputWithHead';
import moment from 'moment';
import AppConstants from 'themes/appConstants';

const { Option } = Select;
const { TextArea } = Input;

const TribunalModal = ({tribunal, showModal, setShowModal}) => {
  const commonReducerState = useSelector(state => state.CommonReducerState);
  const {penaltyTypeList, incidentOffencesTypeList, appealOutcomeList} = commonReducerState;

  const offenceId = useCallback((index) => {
    const t = tribunal;
    return (t && t.offences && t.offences.length > index)? t.offences[index].id : null;
  }, [tribunal])

  const formatDate = date => {
    return date? moment(date, 'YYYY-MM-DD') : null;
  };

  return (
    <Modal
      title={AppConstants.tribunal}
      visible={showModal}
      onCancel={() => setShowModal(false)}
      centered
      footer={null}
    >
      <div className="text-heading-large">{AppConstants.tribunalIncidentDetails}</div>
      <div className="row">
        <div className="col-sm">
          <InputWithHead
            required="required-field"
            heading={`${AppConstants.tribunalChargeOffence} 1`}
          />
          <Select
            name="offence1"
            className="w-100"
            placeholder={AppConstants.tribunalSelectChargeOffence}
            value={offenceId(0)}
            readOnly={true}
          >
            {incidentOffencesTypeList.map(item => (
              <Option key={`offence1Type_${item.id}`} value={item.id}>
                {item.description}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      <div className="row">
        <div className="col-sm">
          <InputWithHead heading={`${AppConstants.tribunalChargeOffence} 2`} />
          <Select
            name="offence2"
            className="w-100"
            placeholder={AppConstants.tribunalSelectChargeOffence}
            value={offenceId(1)}
            allowClear
            readOnly={true}
          >
            {incidentOffencesTypeList.map(item => (
              <Option key={`offenceType2_${item.id}`} value={item.id}>
                {item.description}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      <div className="row">
        <div className="col-sm">
          <InputWithHead heading={`${AppConstants.tribunalChargeOffence} 3`} />
          <Select
            name="offence3"
            className="w-100"
            placeholder={AppConstants.tribunalSelectChargeOffence}
            value={offenceId(2)}
            allowClear
            readOnly={true}
          >
            {incidentOffencesTypeList.map(item => (
              <Option key={`offenceType3_${item.id}`} value={item.id}>
                {item.description}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      <div className="row">
        <div className="col-sm">
          <InputWithHead
            required="required-field"
            heading={AppConstants.tribunalChargeDate}
          />
          <DatePicker
            name="chargeDate"
            className="w-100"
            size="default"
            format="DD-MM-YYYY"
            showTime={false}
            placeholder="dd-mm-yyyy"
            value={formatDate(tribunal?.chargeDate)}
            readOnly={true}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-sm">
          <InputWithHead heading={AppConstants.tribunalChargeOffenceOther} />
          <Input
            name="chargeOffenceOther"
            className="w-100"
            value={tribunal?.chargeOffenceOther}
            allowClear
            readOnly={true}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-sm">
          <InputWithHead heading={AppConstants.tribunalChargeGrading} />
          <Input
            name="chargeGrading"
            className="w-100"
            value={tribunal?.chargeGrading}
            allowClear
            readOnly={true}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-sm">
          <InputWithHead heading={AppConstants.tribunalWitness} />
          <Input
            name="witness"
            className="w-100"
            value={tribunal?.witness}
            allowClear
            readOnly={true}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-sm">
          <InputWithHead
            required="required-field"
            heading={AppConstants.tribunalReporter}
          />
          <Input
            name="reporter"
            className="w-100"
            value={tribunal?.reporter}
            readOnly={true}
          />
        </div>
      </div>
      <div className="text-heading-large pt-5">{AppConstants.tribunalHearingDetails}</div>
      <div className="row">
        <div className="col-sm">
          <InputWithHead required="required-field" heading={AppConstants.tribunalHearingDateTime} />
          <DatePicker
            name="hearingDate"
            className="w-100"
            size="default"
            format="DD-MM-YYYY HH:mm"
            placeholder="dd-mm-yyyy hh:mm"
            value={formatDate(tribunal?.hearingDate)}
            readOnly={true}
            allowClear
            showTime={{ defaultValue: moment('00:00', 'HH:mm') }}
          />
        </div>
      </div>
      <div className="text-heading-large pt-5">{AppConstants.tribunalOutcomeDetails}</div>
      <div className="row">
        <div className="col-sm">
          <InputWithHead heading={AppConstants.tribunalPenaltyType} />
          <Select
            name="penaltyTypeRefId"
            className="w-100"
            placeholder={AppConstants.tribunalSelectPenaltyType}
            value={tribunal?.penaltyTypeRefId}
            allowClear
            readOnly={true}
          >
            {penaltyTypeList.map(item => (
              <Option key={`penaltyType_${item.id}`} value={item.id}>
                {item.description}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      {tribunal?.penaltyTypeRefId === 2 && (
        <div className="row">
          <div className="col-sm">
            <InputWithHead heading={AppConstants.tribunalPenaltyUnits} />
            <Input
              name="penaltyUnits"
              className="w-100"
              value={tribunal?.penaltyUnits}
              allowClear
              readOnly={true}
            />
          </div>
        </div>
      )}
      {tribunal?.penaltyTypeRefId === 1 && (
        <>
          <div className="row">
            <div className="col-sm">
              <InputWithHead heading={AppConstants.tribunalPenaltyStartDate} />
              <DatePicker
                name="penaltyStartDate"
                className="w-100"
                size="default"
                format="DD-MM-YYYY"
                showTime={false}
                placeholder="dd-mm-yyyy"
                value={formatDate(tribunal?.penaltyStartDate)}
                allowClear
                readOnly={true}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-sm">
              <InputWithHead heading={AppConstants.tribunalPenaltyExpiryDate} />
              <DatePicker
                name="penaltyExpiryDate"
                className="w-100"
                size="default"
                format="DD-MM-YYYY"
                showTime={false}
                placeholder="dd-mm-yyyy"
                value={formatDate(tribunal?.penaltyExpiryDate)}
                allowClear
                readOnly={true}
              />
            </div>
          </div>
        </>
      )}
      {tribunal?.penalty2TypeRefId && (
        <>
          {tribunal?.penaltyTypeRefId && (
            <>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.tribunalPenalty2Type} />
                  <Select
                    name="penalty2TypeRefId"
                    className="w-100"
                    placeholder={AppConstants.tribunalSelectPenalty2Type}
                    value={tribunal?.penalty2TypeRefId}
                    allowClear
                    disabled={true}
                    readOnly={true}
                  >
                    {penaltyTypeList.map(item => (
                      <Option key={`suspendedPenaltyType_${item.id}`} value={item.id}>
                        {item.description}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              {tribunal?.penalty2TypeRefId === 2 && (
                <div className="row">
                  <div className="col-sm">
                    <InputWithHead heading={AppConstants.tribunalPenalty2Units} />
                    <Input
                      name="penalty2Units"
                      className="w-100"
                      value={tribunal?.penalty2Units}
                      allowClear
                      readOnly={true}
                    />
                  </div>
                </div>
              )}
              {tribunal?.penalty2TypeRefId === 1 && (
                <>
                  <div className="row">
                    <div className="col-sm">
                      <InputWithHead heading={AppConstants.tribunalPenalty2StartDate} />
                      <DatePicker
                        name="penalty2StartDate"
                        className="w-100"
                        size="default"
                        format="DD-MM-YYYY"
                        showTime={false}
                        placeholder="dd-mm-yyyy"
                        value={formatDate(tribunal?.penalty2StartDate)}
                        allowClear
                        readOnly={true}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm">
                      <InputWithHead heading={AppConstants.tribunalPenalty2ExpiryDate} />
                      <DatePicker
                        name="penalty2ExpiryDate"
                        className="w-100"
                        size="default"
                        format="DD-MM-YYYY"
                        showTime={false}
                        placeholder="dd-mm-yyyy"
                        value={formatDate(tribunal?.penalty2ExpiryDate)}
                        allowClear
                        readOnly={true}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}  
        </>
      )}
      <div className="row">
        <div className="col-sm">
          <InputWithHead heading={AppConstants.tribunalSuspendedPenaltyType} />
          <Select
            name="suspendedPenaltyTypeRefId"
            className="w-100"
            placeholder={AppConstants.tribunalSelectSuspendedPenaltyType}
            value={tribunal?.suspendedPenaltyTypeRefId}
            allowClear
            readOnly={true}
          >
            {penaltyTypeList.map(item => (
              <Option key={`suspendedPenaltyType_${item.id}`} value={item.id}>
                {item.description}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      {tribunal?.suspendedPenaltyTypeRefId === 2 && (
        <div className="row">
          <div className="col-sm">
            <InputWithHead heading={AppConstants.tribunalSuspendedPenaltyUnits} />
            <Input
              name="suspendedPenaltyUnits"
              className="w-100"
              value={tribunal?.suspendedPenaltyUnits}
              allowClear
              readOnly={true}
            />
          </div>
        </div>
      )}
      {tribunal?.suspendedPenaltyTypeRefId === 1 && (
        <div className="row">
          <div className="col-sm">
            <InputWithHead heading={AppConstants.tribunalSuspendedPenaltyExpiryDate} />
            <DatePicker
              name="suspendedPenaltyExpiryDate"
              className="w-100"
              size="default"
              format="DD-MM-YYYY"
              showTime={false}
              placeholder="dd-mm-yyyy"
              value={formatDate(tribunal?.suspendedPenaltyExpiryDate)}
              allowClear
              readOnly={true}
            />
          </div>
        </div>
      )}

      <div className="text-heading-large pt-5">{AppConstants.tribunalAppealDetails}</div>
      <div className="row">
        <div className="col-sm">
          <InputWithHead heading={AppConstants.tribunalAppealed} />
          <Checkbox name="appealed" checked={tribunal?.appealed} readOnly={true}/>
        </div>
      </div>
      <div className="row">
        <div className="col-sm">
          <InputWithHead heading={AppConstants.tribunalAppealOutcome} />
          <Select
            name="appealOutcomeRefId"
            className="w-100"
            placeholder={AppConstants.tribunalSelectAppealOutcome}
            value={tribunal?.appealOutcomeRefId}
            allowClear
            readOnly={true}
          >
            {appealOutcomeList.map(item => (
              <Option key={`appealOutcome_${item.id}`} value={item.id}>
                {item.description}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      <div className="row">
        <div className="col-sm">
          <InputWithHead heading={AppConstants.tribunalAppealDate} />
          <DatePicker
            name="appealDate"
            className="w-100"
            size="default"
            format="DD-MM-YYYY"
            showTime={false}
            placeholder="dd-mm-yyyy"
            value={formatDate(tribunal?.appealDate)}
            allowClear
            readOnly={true}
          />
        </div>
      </div>
      <div className="text-heading-large pt-5">{AppConstants.tribunalOther}</div>
      <div className="row">
        <div className="col-sm">
          <InputWithHead heading={AppConstants.tribunalAllowPublicView} />
          <Checkbox
            name="allowPublicView"
            checked={tribunal?.allowPublicView}
            readOnly={true}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-sm">
          <InputWithHead heading={AppConstants.tribunalNotes} />
          <TextArea
            name="notes"
            allowClear
            value={tribunal?.notes}
            readOnly={true}
          />
        </div>
      </div>
    </Modal>
  );
};

export default TribunalModal;