import React from 'react';
import { Modal, TimePicker, Select, Button } from 'antd';
import moment from 'moment';

import Loader from './loader';
import InputWithHead from './InputWithHead';
import AppConstants from '../themes/appConstants';
import AppImages from '../themes/appImages';

const { Option } = Select;

class TimeSlotModal extends React.Component {
  onTimeChange = (time, index, timeIndex) => {
    if (time) {
      this.props.updateTimeSlot('changeTime', index, timeIndex, time.format('HH:mm'));
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
      // UpdateTimeSlotsDataManual,
      handleTimeslotNext,
      onTimslotBack,
      onTimeslotLoad,
    } = this.props;
    return (
      <div style={{ backgroundColor: 'red' }}>
        <Modal
          {...this.props}
          className="add-membership-type-modal modalFooter"
          title={modalTitle}
          visible={this.props.visible}
          onOk={timeSlotOK}
          onCancel={onCancel}
          okText={AppConstants.save}
          footer={<div className="d-none" />}
        >
          <div className="inside-container-view">
            {/* <Loader visible={onTimeslotLoad} /> */}
            {timeslots.map((item, index) => (
              <div className="row" key={'timeslot_' + index}>
                <div className="col-sm">
                  <InputWithHead heading={index == 0 ? AppConstants.dayOfTheWeek : ' '} />
                  <Select
                    style={{ width: '70%', minWidth: 100 }}
                    onChange={dayOfTheWeek => changeDay(dayOfTheWeek, index)}
                    value={item.dayRefId}
                    placeholder="Select Week Day"
                  >
                    {weekDays.map(item => (
                      <Option key={'weekDay_' + item.id} value={item.id}>
                        {item.description}
                      </Option>
                    ))}
                  </Select>
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
                          style={{ minWidth: 100 }}
                          className="comp-venue-time-timepicker"
                          onChange={time => this.onTimeChange(time, index, timeIndex)}
                          onBlur={e =>
                            this.onTimeChange(
                              e.target.value && moment(e.target.value, 'HH:mm'),
                              index,
                              timeIndex,
                            )
                          }
                          value={timeItem.startTime != null && moment(timeItem.startTime, 'HH:mm')}
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
                    </div>
                  ))}
                  <span className="input-heading-add-another" onClick={() => addStartTime(index)}>
                    + {AppConstants.add_TimeSlot}
                  </span>
                </div>
                {timeslots.length > 1 && (
                  <div
                    className="col-sm-2 delete-image-timeSlot-view"
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
                  onClick={() => timeSlotOK()}
                >
                  {AppConstants.save}
                </Button>
                {/* <Button
                  className="publish-button"
                  type="primary"
                  onClick={() => handleTimeslotNext()}
                >
                  {AppConstants.next}
                </Button> */}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default TimeSlotModal;
