import { Checkbox } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onChangeSettingForm } from 'store/actions/LiveScoreAction/LiveScoreSettingAction';
import AppConstants from 'themes/appConstants';
import LiveScoreSettingsHeader from './LiveScoreSettingsHeader';

/**
 *Component for allow forfeit settings for managers to be able to lodge forfeit.
 * @returns <JSX.Element>
 */
const AllowForfeitSetting = () => {
  const { allowForfeit } = useSelector(state => state.LiveScoreSetting);
  const dispatch = useDispatch();

  const handleOnChange = e => {
    const data = e.target.checked;
    dispatch(onChangeSettingForm({ key: 'allowForfeit', data }));
  };
  return (
    <div>
      <LiveScoreSettingsHeader>{AppConstants.forfeits}</LiveScoreSettingsHeader>
      <Checkbox
        className="single-checkbox-radio-style w-100"
        onChange={handleOnChange}
        checked={allowForfeit}
      >
        {AppConstants.allowManagerForfeitCheckboxText}
      </Checkbox>
    </div>
  );
};

export default AllowForfeitSetting;
