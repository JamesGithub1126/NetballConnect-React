import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Form, message } from 'antd';

import AppConstants from 'themes/appConstants';
import ValidationConstants from 'themes/validationConstant';
import { userPasswordUpdateAction } from 'store/actions/userAction/userAction';
import InputWithHead from 'customComponents/InputWithHead';
import Loader from 'customComponents/loader';

function Password(props) {
  const { userState, userPasswordUpdateAction } = props;

  const [form] = Form.useForm();

  const handleSubmit = useCallback(
    values => {
      if (values[AppConstants.newPassword] !== values[AppConstants.confirmPassword]) {
        message.error('Password does not match');
        return;
      }

      userPasswordUpdateAction({
        password: values[AppConstants.password],
        newPassword: values[AppConstants.newPassword],
      });
    },
    [userPasswordUpdateAction],
  );

  return (
    <div className="inside-table-view">
      <Form form={form} colon={false} onFinish={handleSubmit}>
        <div className="fluid-width">
          <Form.Item
            name={AppConstants.password}
            rules={[
              {
                min: 8,
                message: ValidationConstants.passwordVerification,
              },
            ]}
          >
            <InputWithHead
              required="required-field"
              heading={AppConstants.currentPassword}
              type="password"
              name="password"
              min={8}
              placeholder={AppConstants.enterCurrentPassword}
            />
          </Form.Item>

          <Form.Item
            name={AppConstants.newPassword}
            rules={[
              {
                min: 8,
                message: ValidationConstants.passwordVerification,
              },
            ]}
          >
            <InputWithHead
              required="required-field"
              heading={AppConstants.newPassword}
              type="password"
              name="newPassword"
              min={8}
              placeholder={AppConstants.enterNewPassword}
            />
          </Form.Item>

          <Form.Item
            name={AppConstants.confirmPassword}
            rules={[
              {
                min: 8,
                message: ValidationConstants.passwordVerification,
              },
            ]}
          >
            <InputWithHead
              required="required-field"
              heading={AppConstants.confirmPassword}
              type="password"
              name="confirmPassword"
              min={8}
              placeholder={AppConstants.enterConfirmPassword}
            />
          </Form.Item>

          <div className="d-flex justify-content-end mt-4">
            <Button className="publish-button" type="primary" htmlType="submit">
              {AppConstants.save}
            </Button>
          </div>
        </div>
      </Form>

      <Loader visible={userState.userPasswordUpdate} />
    </div>
  );
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      userPasswordUpdateAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    userState: state.UserState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Password);
