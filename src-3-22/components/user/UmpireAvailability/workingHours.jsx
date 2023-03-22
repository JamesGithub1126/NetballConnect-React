import React, { useState, useCallback, useMemo, useEffect, Fragment } from 'react';
import { Select, Checkbox, TimePicker, Button, message } from 'antd';
import AppConstants from 'themes/appConstants';
import moment from 'moment';
import { groupBy, flatten } from "lodash";
import UserAxiosApi from "../../../store/http/userHttp/userAxiosApi";
import ValidationConstants from "../../../themes/validationConstant";

const {Option} = Select;

const weekNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WorkingHours = ({userId, availability, userVenueGroupId}) => {
  const [availabilityGroupByDate, setAvailabilityGroupByDate] = useState({});
  const [saving, setSaving] = useState(false);
  const [dayCheckedStates, setDayCheckedStates] = useState([]);

  useEffect(() => {
    const newAvailability = groupBy(availability, 'dayRefId');
    setAvailabilityGroupByDate(newAvailability);
    setDayCheckedStates(weekNames.map((weekName, index) => {
      return newAvailability[index + 1]?.length > 0;
    }));
  }, [availability]);

  const isValid = useMemo(() => {
    const allAvailability = flatten(Object.values(availabilityGroupByDate));
    return allAvailability.every(availability => availability.startTime < availability.endTime);
  }, [availabilityGroupByDate])

  const onTimeChange = (time, dayIndex, index, field) => {
    setAvailabilityGroupByDate({
      ...availabilityGroupByDate,
      [dayIndex + 1]: (availabilityGroupByDate[dayIndex + 1] ?? []).map((availability, currentIndex) => {
        if (currentIndex === index) {
          return {
            ...availability,
            [field]: time,
          };
        }
        return availability;
      }),
    });
  };

  const onDayChecked = (checked, index) => {
    const updatedCheckedStates = [...dayCheckedStates];
    updatedCheckedStates[index] = checked;
    setDayCheckedStates(updatedCheckedStates);
    if (checked) {
      addTimeManualPerDay(index);
    } else {
      setAvailabilityGroupByDate({
        ...availabilityGroupByDate,
        [index + 1]: [],
      });
    }
  };

  const addTimeManualPerDay = index => {
    setAvailabilityGroupByDate({
      ...availabilityGroupByDate,
      [index + 1]: (availabilityGroupByDate[index + 1] ?? []).concat({
        startTime: '09:00',
        endTime: '12:00',
      }),
    });
  };

  const onSave = async () => {
    try {
      setSaving(true);
      const allAvailability = flatten(Object.entries(availabilityGroupByDate).map(([dayRefId, arr]) => arr.map(item => ({
        ...item,
        dayRefId: parseInt(dayRefId, 10),
      }))));
      await UserAxiosApi.saveUserAvailability(userId, userVenueGroupId, allAvailability);
      message.success(AppConstants.saveUserAvailabilitySuccess);
    } catch(err) {
      message.error('Something went wrong.')
    } finally {
      setSaving(false);
    }
  }

  const workingHourViewPerDay = (week, dayIndex) => {
    return (
      <div className="mb-5">
        <div className="row mb-2 flex-row align-items-center">
          <div className="col-sm-3 d-flex">
            <Checkbox
              className="single-checkbox-radio-style"
              checked={dayCheckedStates[dayIndex]}
              onChange={e => onDayChecked(e.target.checked, dayIndex)}
            >
              {week}
            </Checkbox>
          </div>
          {
            !dayCheckedStates[dayIndex] && (
              <div className="col-sm-3 d-flex flex-row align-items-center">
                <div className="other-info-label">{AppConstants.notWorking}</div>
              </div>
            )
          }
          {!!dayCheckedStates[dayIndex] && (
            <div className="col-sm-6 d-flex flex-column">
              {(availabilityGroupByDate[dayIndex + 1] ?? []).map((availability, index) => (
                <div className="row my-2" key={index}>
                  <div className="d-flex flex-row align-items-center">
                    <TimePicker
                      key="startTime"
                      className="comp-venue-time-timepicker w-100"
                      onChange={time => onTimeChange(
                        moment(time).format('HH:mm'),
                        dayIndex,
                        index,
                        'startTime',
                      )}
                      allowClear={false}
                      value={availability.startTime ? moment(availability.startTime, 'HH:mm') : undefined}
                      format="HH:mm"
                      use12Hours={false}
                    />
                  </div>
                  <div className="ml-10 d-flex flex-row align-items-center">
                    <TimePicker
                      key="endTime"
                      className="comp-venue-time-timepicker w-100"
                      allowClear={false}
                      onChange={time => onTimeChange(
                        moment(time).format('HH:mm'),
                        dayIndex,
                        index,
                        'endTime',
                      )}
                      value={availability.endTime ? moment(availability.endTime, 'HH:mm') : undefined}
                      format="HH:mm"
                      use12Hours={false}
                    />
                  </div>
                  {availability.startTime >= availability.endTime && <div><span className="form-err">{ValidationConstants.endTimeValidation}</span></div>}
                </div>
              ))}
            </div>
          )}
        </div>
        {!!dayCheckedStates[dayIndex] && (
          <div className="row">
            <div className="col-sm-3 d-flex flex-row align-items-center"></div>
            <div className="col-sm-3 d-flex flex-row align-items-center">
                <span
                  className="input-heading-add-another mt-n20"
                  style={{cursor: 'pointer'}}
                  onClick={() => addTimeManualPerDay(dayIndex)}
                >
                  + {AppConstants.add_TimeSlot}
                </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const availabilityView = () => {
    return <div>{weekNames.map((week, index) => workingHourViewPerDay(week, index))}</div>;
  };

  return (
    <>
      <div className="umpire-availability-working-hours-view">
        <div className="user-module-row-heading">{AppConstants.selectWorkingHours}</div>
        {availabilityView()}
        <div className="row fluid-width">
          <div className="col-sm">
            <div
              className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
              <Button
                className="schedule-approval-button"
                type="primary"
                htmlType="submit"
                disabled={saving || !isValid}
                style={{float: 'right'}}
                onClick={onSave}
              >
                {AppConstants.save}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkingHours;
