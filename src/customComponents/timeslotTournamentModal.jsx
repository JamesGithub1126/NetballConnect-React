import React from 'react';
import { Modal, TimePicker, Select, Button, InputNumber, Form, DatePicker } from 'antd';
import moment from 'moment';

import Loader from './loader';
import InputWithHead from './InputWithHead';
import AppConstants from '../themes/appConstants';
import AppImages from '../themes/appImages';
import ValidationConstants from '../themes/validationConstant';
const { Option } = Select;

class TimeSlotTournamentModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.formRef = React.createRef();
  }
  onStartTimeChange = (time, index, timeIndex) => {
    if (time) {
      this.props.updateTimeSlot('changeTime', index, timeIndex, time.format('HH:mm'));
    }
  };
  onEndTimeChange = (time, index, timeIndex) => {
    if (time) {
      const { timeslots } = this.props;
      //this.props.updateTimeSlot('changeEndTime', index, timeIndex, time.format('HH:mm'))
      timeslots[index].startTime[timeIndex].endTime = time.format('HH:mm');
      this.setState({ updateUI: true });
    }
  };
  onGradeChange = (grades, timeItem) => {
    if (grades) {
      timeItem.grades = grades;
      this.setState({ updateUI: true });
    }
  };
  onNumberOfRoundChange = (noOfRounds, timeItem) => {
    if (noOfRounds) {
      timeItem.noOfRounds = noOfRounds;
      this.setState({ updateUI: true });
    }
  };
  onChangeDate = (date, item) => {
    if (date) {
      item.dayRefId = date.isoWeekday();
      item.matchDate = date.format('YYYY-MM-DD');
      this.setState({ updateUI: true });
    }
  };
  render() {
    const {
      weekDays,
      timeslots,
      modalTitle,
      timeSlotOK,
      onCancel,
      addTimeSlot,
      addStartTime,
      removetimeSlotDay,
      changeDay,
      removeStartTime,
      //handleTimeslotNext,
      onTimslotBack,
      // onTimeslotLoad,
      division,
    } = this.props;
    let allGrades = [];
    for (let divObj of division) {
      let gradeObjs = divObj.grades.map(x => {
        return {
          competitionDivisionGradeId: x.competitionDivisionGradeId,
          displayName: divObj.divisionName + ' - ' + x.gradeName,
        };
      });
      allGrades = allGrades.concat(gradeObjs);
    }

    return (
      <div style={{ backgroundColor: 'red' }}>
        <Modal
          {...this.props}
          className="add-membership-type-modal modalFooter"
          title={modalTitle}
          visible={this.props.visible}
          //onOk={timeSlotOK}
          //onCancel={onCancel}
          okText={AppConstants.save}
          footer={<div className="d-none" />}
          width={950}
        >
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={timeSlotOK}
            onFinishFailed={({ errorFields }) =>
              this.formRef.current.scrollToField(errorFields[0].name)
            }
            noValidate="noValidate"
          >
            <b>{AppConstants.finaliseTimeslot}</b>
            <div className="inside-container-view">
              {/* <Loader visible={onTimeslotLoad} /> */}
              {timeslots.map((item, index) => (
                <div className="row" key={'timeslot_' + index}>
                  <div className="col-sm-3">
                    <InputWithHead heading={index == 0 ? AppConstants.date : ' '} />
                    <DatePicker
                      style={{ minWidth: 100 }}
                      onChange={date => this.onChangeDate(date, item)}
                      value={item.matchDate && moment(item.matchDate)}
                      placeholder="Select Date"
                      format={'YYYY-MM-DD ddd'}
                    />
                  </div>
                  <div className="col-sm">
                    {item.startTime.map((timeItem, timeIndex) => (
                      <div className="row" key={'timevalue' + timeIndex}>
                        <div className="col-sm">
                          <InputWithHead
                            heading={index == 0 && timeIndex == 0 ? AppConstants.startTime : ' '}
                          />
                          <TimePicker
                            key="startTime"
                            style={{ width: 80 }}
                            className="comp-venue-time-timepicker"
                            onChange={time => this.onStartTimeChange(time, index, timeIndex)}
                            onBlur={e =>
                              this.onStartTimeChange(
                                e.target.value && moment(e.target.value, 'HH:mm'),
                                index,
                                timeIndex,
                              )
                            }
                            value={
                              timeItem.startTime != null && moment(timeItem.startTime, 'HH:mm')
                            }
                            format="HH:mm"
                            // minuteStep={15}
                          />
                          {item.startTime.length > 1 && (
                            <span
                              className="user-remove-btn pl-2"
                              onClick={() => removeStartTime(index, timeIndex)}
                              style={{ cursor: 'pointer' }}
                            >
                              <img
                                className="dot-image"
                                src={AppImages.redCross}
                                alt=""
                                width="16"
                                height="16"
                              />
                            </span>
                          )}
                        </div>
                        <div className="col-sm">
                          <InputWithHead
                            heading={index == 0 && timeIndex == 0 ? AppConstants.endTime : ' '}
                          />
                          <TimePicker
                            key="endTime"
                            style={{ width: 80 }}
                            className="comp-venue-time-timepicker"
                            onChange={time => this.onEndTimeChange(time, index, timeIndex)}
                            onBlur={e =>
                              this.onEndTimeChange(
                                e.target.value && moment(e.target.value, 'HH:mm'),
                                index,
                                timeIndex,
                              )
                            }
                            value={timeItem.endTime != null && moment(timeItem.endTime, 'HH:mm')}
                            format="HH:mm"
                            // minuteStep={15}
                          />
                        </div>
                        <div className="col-sm">
                          <InputWithHead
                            heading={index == 0 && timeIndex == 0 ? AppConstants.grades : ' '}
                          />
                          <Select
                            style={{ minWidth: 100 }}
                            mode="multiple"
                            onChange={grades => this.onGradeChange(grades, timeItem)}
                            value={timeItem.grades}
                            placeholder="Select Grade"
                          >
                            {allGrades.map(item => (
                              <Option
                                key={'grade' + item.competitionDivisionGradeId}
                                value={item.competitionDivisionGradeId}
                              >
                                {item.displayName}
                              </Option>
                            ))}
                          </Select>
                        </div>
                        <div className="col-sm">
                          {index == 0 && timeIndex == 0 ? (
                            <InputWithHead
                              heading={'# Rounds'}
                              conceptulHelp
                              conceptulHelpMsg={AppConstants.numberOfRoundsForGradeHelpMessage}
                            />
                          ) : (
                            <InputWithHead heading={' '} />
                          )}
                          {/* <Form.Item name={`noOfRounds${index}${timeIndex}`}> */}
                          <InputNumber
                            className="quick_comp_ant_number"
                            type="number"
                            style={{ width: 50 }}
                            value={timeItem.noOfRounds}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => `${value}`.replace(/\$\s?|(,*)/g, '')}
                            onChange={e => this.onNumberOfRoundChange(e, timeItem)}
                            min={0}
                          />
                          {/* </Form.Item> */}
                        </div>
                      </div>
                    ))}
                    <span className="input-heading-add-another" onClick={() => addStartTime(index)}>
                      + {AppConstants.add_TimeRange}
                    </span>
                  </div>
                  {timeslots.length > 1 && (
                    <div
                      className="col-sm-1 delete-image-timeSlot-view"
                      onClick={() => removetimeSlotDay(index)}
                    >
                      <div className="transfer-image-view pt-0 pointer ml-auto">
                        <span className="user-remove-btn">
                          <i className="fa fa-trash-o" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <span className="input-heading-add-another pointer" onClick={addTimeSlot}>
                {' '}
                + {AppConstants.addAnotherDay}
              </span>
            </div>
            <div className="row">
              <div className="col-sm d-flex w-100" style={{ paddingTop: 10 }}>
                <div className="col-sm-6 d-flex w-50 justify-content-start">
                  <Button
                    className="cancelBtnWidth"
                    type="cancel-button"
                    onClick={onTimslotBack}
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
                    // onClick={() => timeSlotOK()}
                  >
                    {AppConstants.save}
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

export default TimeSlotTournamentModal;
