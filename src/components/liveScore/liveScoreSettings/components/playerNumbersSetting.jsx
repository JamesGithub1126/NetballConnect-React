import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Checkbox, InputNumber } from 'antd';
import AppConstants from 'themes/appConstants';
import { onChangeSettingForm } from 'store/actions/LiveScoreAction/LiveScoreSettingAction';

const PlayerNumbersSetting = () => {
  const dispatch = useDispatch();
  const liveScoreSetting = useSelector(state => state.LiveScoreSetting);
  const [zeroErrorMsg, setZeroErrorMsg] = useState({
    view: false,
    message: '',
  });
  const {
    lineupSelection,
    allowMaximumAttendance,
    maximumAttendance,
    allowMaximumLineup,
    maximumLineup,
  } = liveScoreSetting;

  const changeStateValue = changed => {
    if (changed === true) {
      setZeroErrorMsg({
        view: true,
        message: 'The maximum number needs to be greater than 0 and cannot be left empty',
      });
    } else {
      setZeroErrorMsg({
        view: false,
        message: '',
      });
    }
  };

  const onChangeAllowMatchSheetMaximumNumber = data => {
    changeStateValue(data);
    dispatch(onChangeSettingForm({ key: 'allowMaximumAttendance', data }));
  };
  const onChangeMatchSheetMaximumNumber = data => {
    if (data === null || data === 0) {
      changeStateValue(true);
    } else {
      changeStateValue(false);
      dispatch(onChangeSettingForm({ key: 'maximumAttendance', data }));
    }
  };

  const onChangeAllowLineUpMaximumNumber = data => {
    changeStateValue(data);
    dispatch(onChangeSettingForm({ key: 'allowMaximumLineup', data }));
  };

  const onChangeLineUpMaximumNumber = data => {
    if (data === null || data === 0) {
      changeStateValue(true);
    } else {
      changeStateValue(false);
      dispatch(onChangeSettingForm({ key: 'maximumLineup', data }));
    }
  };

  return (
    <div className="formView content-view pt-4 mb-5">
      <span className="text-heading-large pt-5">{AppConstants.playerNumbers}</span>

      <div className="row">
        <div className="col-sm-12 col-md-6 col-lg-4">
          <Checkbox
            className="single-checkbox justify-content-center"
            onChange={e => onChangeAllowMatchSheetMaximumNumber(e.target.checked)}
            checked={allowMaximumAttendance}
          >
            <span className="checkbox-text">{AppConstants.attendanceMaximumNumber}</span>
          </Checkbox>
        </div>
        <div className="col-sm-12 col-md-4 col-lg-3">
          <InputNumber
            disabled={!allowMaximumAttendance}
            className="single-checkbox"
            value={maximumAttendance}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            onChange={number => onChangeMatchSheetMaximumNumber(number)}
            placeholder="Maximum Number"
          />
        </div>
      </div>
      {lineupSelection && (
        <div className="row">
          <div className="col-sm-12 col-md-6 col-lg-4">
            <Checkbox
              className="single-checkbox justify-content-center"
              onChange={e => onChangeAllowLineUpMaximumNumber(e.target.checked)}
              checked={allowMaximumLineup}
            >
              <span className="checkbox-text">{AppConstants.squadMaximumNumber}</span>
            </Checkbox>
          </div>
          <div className="col-sm-12 col-md-4 col-lg-3">
            <InputNumber
              disabled={!allowMaximumLineup}
              className="single-checkbox"
              value={maximumLineup}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              onChange={number => onChangeLineUpMaximumNumber(number)}
              placeholder="Maximum Number"
            />
          </div>
        </div>
      )}
      <span className="error-warning-span" visible={zeroErrorMsg.view}>
        {zeroErrorMsg.message}
      </span>
    </div>
  );
};

export default PlayerNumbersSetting;
