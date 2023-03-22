import React, { useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Radio } from 'antd';

import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';

function SelectResetType(props) {
  const { source, submitType } = props;
  const [resetType, setResetType] = useState('email');

  const onChangeType = useCallback(e => {
    setResetType(e.target.value);
  }, []);

  const onSubmitType = useCallback(() => {
    submitType(resetType);
  }, [submitType, resetType]);

  return (
    <div className="auth-form text-center" style={{ fontSize: 14, zIndex: 15 }}>
      <div className="content-view">
        <div className="d-flex justify-content-center">
          <NavLink to="/" className="site-brand">
            <img src={AppImages.netballLogo1} alt="" />
          </NavLink>
        </div>

        <p className="mt-4" style={{ fontSize: 18 }}>
          {AppConstants.chooseYourResetPasswordMethod}
        </p>

        <Radio.Group
          className="forgot-password-radio"
          onChange={e => onChangeType(e)}
          value={resetType}
        >
          <Radio value="email">
            <label className="mt-2" htmlFor="email">
              {AppConstants.email}
            </label>
          </Radio>
          <Radio value="sms">
            <label className="mt-2" htmlFor="sms">
              SMS
            </label>
          </Radio>
        </Radio.Group>

        <div
          className={`comp-finals-button-view d-flex justify-content-${
            source !== 'mobile' ? 'between' : 'center'
          } mt-4 pt-4`}
        >
          {source !== 'mobile' && (
            <div className="pr-5">
              <NavLink to={{ pathname: '/login' }}>
                <Button className="forgot-password-button" type="cancel-button">
                  {AppConstants.returnToLogin}
                </Button>
              </NavLink>
            </div>
          )}

          <Button className="forgot-password-button" type="primary" onClick={onSubmitType}>
            {AppConstants.next}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SelectResetType;
