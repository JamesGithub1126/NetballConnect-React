import React from 'react';
import { Modal, DatePicker, Form, Button, Radio, InputNumber } from 'antd';

import AppConstants from '../themes/appConstants';
import ValidationConstants from '../themes/validationConstant';
import { captializedString } from '../util/helpers';
import InputWithHead from './InputWithHead';
import CustomToolTip from 'react-png-tooltip';
import { CompetitionFormatType, CompetitionType } from 'util/enums';
import AppUniqueId from '../themes/appUniqueId';
import moment from 'moment';
class CompetitionModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      competitionState: true,
      buttonClicked: '',
    };
    this.formRef = React.createRef();
  }

  componentDidUpdate() {
    if (this.props.visible === true && this.state.competitionState === true) {
      this.setState({ competitionState: false });
      this.setFieldValues();
    }
    if (this.props.visible === false && this.state.competitionState === false) {
      this.setState({ competitionState: true });
    }
  }

  setFieldValues = () => {
    if (this.formRef.current) {
      let quickCompetitionState = this.props.quickCompetitionState;
      let date = quickCompetitionState.competitionDate;
      if (date) {
        date = moment(date);
      }
      this.formRef.current.setFieldsValue({
        compName: quickCompetitionState.competitionName,
        date: date,
        competitionTypeRefId: quickCompetitionState.competitionTypeRefId,
        competitionFormatRefId: quickCompetitionState.competitionFormatRefId,
        numberOfRounds: quickCompetitionState.noOfRounds,
        roundInDays: quickCompetitionState.roundInDays,
        roundInHours: quickCompetitionState.roundInHours,
        roundInMins: quickCompetitionState.roundInMins,
      });
    }
  };

  onSubmit = () => {
    if (this.state.buttonClicked === 'save') {
      this.props.handleOK();
    } else {
      this.props.handleCompetitionNext();
    }
  };

  render() {
    const {
      modalTitle,
      handleOK,
      onCancel,
      competitionChange,
      updateDate,
      appState,
      quickCompetitionState,
      updateCompetition,
    } = this.props;
    let competitionFormatTypes = appState.competitionFormatTypes.filter(t => t.id > 1);

    return (
      <div className="bg-danger">
        <Modal
          {...this.props}
          className="add-membership-type-modal modalFooter"
          title={modalTitle}
          visible={this.props.visible}
          onOk={handleOK}
          onCancel={onCancel}
          footer={<div className="d-none" />}
        >
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.onSubmit}
            onFinishFailed={({ errorFields }) =>
              this.formRef.current.scrollToField(errorFields[0].name)
            }
            noValidate="noValidate"
          >
            {/* <div className="d-flex">
                            <span className="comment-heading" style={{ fontSize: 16 }}>
                                {'"Enter competition Name"'} {" "} {'or'}{" "}   {'Select an existing competition'}
                            </span>
                        </div> */}
            <div className="inside-container-view mt-3">
              <div className="col-sm pl-0 pb-2">
                <Form.Item
                  name="compName"
                  rules={[
                    { required: true, message: ValidationConstants.competitionNameIsRequired },
                  ]}
                >
                  <InputWithHead
                    required="required-field pt-0"
                    heading={AppConstants.competitionName}
                    placeholder="Enter competition Name"
                    onChange={e => competitionChange(e)}
                    onBlur={i =>
                      this.formRef.current.setFieldsValue({
                        compName: captializedString(i.target.value),
                      })
                    }
                  />
                </Form.Item>
              </div>
              <div className="col-sm pl-0 pb-2">
                <InputWithHead
                  required="required-field"
                  heading={AppConstants.competitionStartDate}
                />
                <Form.Item
                  name="date"
                  rules={[{ required: true, message: ValidationConstants.dateField }]}
                >
                  <DatePicker
                    // size="large"
                    className="w-100"
                    onChange={date => updateDate(date)}
                    format="DD-MM-YYYY"
                    placeholder="dd-mm-yyyy"
                    showTime={false}
                  />
                </Form.Item>
              </div>
              <span className="applicable-to-heading required-field">
                {AppConstants.typeOfCompetition}
              </span>
              <Form.Item
                name="competitionTypeRefId"
                rules={[
                  { required: true, message: ValidationConstants.pleaseSelectCompetitionType },
                ]}
              >
                <Radio.Group
                  className="reg-competition-radio"
                  onChange={e => {
                    this.formRef.current.setFieldsValue({
                      competitionFormatRefId: CompetitionFormatType.RoundRobin,
                      numberOfRounds: null,
                    });
                    updateCompetition(e.target.value, 'competitionTypeRefId');
                  }}
                  // value={detailsData.competitionTypeRefId}
                  // disabled={disabledStatus || compDetailDisable}
                >
                  {appState.typesOfCompetition.map(item => (
                    <Radio key={'competitionType_' + item.id} value={item.id}>
                      {item.description}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
              {quickCompetitionState.competitionTypeRefId == CompetitionType.Tournament && (
                <>
                  <span className="applicable-to-heading required-field">
                    {AppConstants.competitionFormat}
                  </span>
                  <Form.Item
                    name="competitionFormatRefId"
                    rules={[
                      {
                        required: true,
                        message: ValidationConstants.pleaseSelectCompetitionFormat,
                      },
                    ]}
                  >
                    <Radio.Group
                      className="reg-competition-radio"
                      onChange={e => updateCompetition(e.target.value, 'competitionFormatRefId')}
                      //value={quickCompetitionState.competitionFormatRefId}
                      // disabled={disabledStatus || compDetailDisable}
                    >
                      {competitionFormatTypes.map(item => (
                        <div className="contextualHelp-RowDirection" key={item.id}>
                          <Radio key={item.id} value={item.id}>
                            {item.description}
                          </Radio>
                          <div className="ml-n20 mt-3">
                            <CustomToolTip>
                              <span>{item.helpMsg}</span>
                            </CustomToolTip>
                          </div>
                        </div>
                      ))}
                    </Radio.Group>
                  </Form.Item>
                  {quickCompetitionState.competitionFormatRefId ==
                    CompetitionFormatType.EnhancedRoundRobin && (
                    <div>
                      <InputWithHead
                        heading={AppConstants.numberOfRounds}
                        required="required-field pb-1"
                      />
                      <Form.Item
                        name="numberOfRounds"
                        rules={[
                          {
                            required: true,
                            message: ValidationConstants.numberOfRoundsNameIsRequired,
                          },
                        ]}
                      >
                        <InputNumber
                          className="w-100"
                          style={{ paddingRight: 1, minWidth: 182 }}
                          onKeyDown={e => e.key === '.' && e.preventDefault()}
                          onChange={e => updateCompetition(e, 'noOfRounds')}
                          placeholder={AppConstants.selectRound}
                          min={1}
                          max={50}
                          //value={detailsData.competitionDetailData.noOfRounds}
                          //disabled={disabledStatus || compDetailDisable}
                        />
                      </Form.Item>
                    </div>
                  )}

                  <InputWithHead heading={AppConstants.timeBetweenRounds} />
                  <div className="fluid-width">
                    <div className="row">
                      <div id={AppUniqueId.time_rounds_days} className="col-sm">
                        <Form.Item name="roundInDays">
                          <InputWithHead
                            auto_complete="off"
                            placeholder={AppConstants.days}
                            //value={detailsData.competitionDetailData.roundInDays}
                            onChange={e => updateCompetition(e.target.value, 'roundInDays')}
                            //disabled={disabledStatus || compDetailDisable}
                            heading={AppConstants._days}
                            required={'pt-0'}
                          />
                        </Form.Item>
                      </div>
                      <div id={AppUniqueId.time_rounds_hrs} className="col-sm">
                        <Form.Item name="roundInHours">
                          <InputWithHead
                            auto_complete="off"
                            placeholder={AppConstants.hours}
                            //value={detailsData.competitionDetailData.roundInHours}
                            onChange={e => updateCompetition(e.target.value, 'roundInHours')}
                            //disabled={disabledStatus || compDetailDisable}
                            heading={AppConstants._hours}
                            required={'pt-0'}
                          />
                        </Form.Item>
                      </div>
                      <div id={AppUniqueId.time_rounds_mins} className="col-sm">
                        <Form.Item name="roundInMins">
                          <InputWithHead
                            auto_complete="off"
                            placeholder={AppConstants.mins}
                            //value={detailsData.competitionDetailData.roundInMins}
                            onChange={e => updateCompetition(e.target.value, 'roundInMins')}
                            //disabled={disabledStatus || compDetailDisable}
                            heading={AppConstants._minutes}
                            required={'pt-0'}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="row">
              <div className="col-sm d-flex w-100" style={{ paddingTop: 10 }}>
                <div className="col-sm-6 d-flex w-50 justify-content-start">
                  {/* <Button onClick={() => this.props.addVenueAction(venuData)} className="open-reg-button" type="primary"> */}
                  <Button
                    className="cancelBtnWidth"
                    type="cancel-button"
                    onClick={onCancel}
                    style={{ marginRight: 20 }}
                  >
                    {AppConstants.back}
                  </Button>
                </div>
                <div className="col-sm-6 d-flex w-50 justify-content-end">
                  <Button
                    className="publish-button save-draft-text"
                    type="primary"
                    htmlType="submit"
                    onClick={() => this.setState({ buttonClicked: 'save' })}
                  >
                    {AppConstants.save}
                  </Button>
                  <Button
                    className="publish-button"
                    type="primary"
                    htmlType="submit"
                    onClick={() => this.setState({ buttonClicked: 'next' })}
                  >
                    {AppConstants.next}
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default CompetitionModal;
