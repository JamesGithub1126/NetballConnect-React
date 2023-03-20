import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Layout, Button, Form, Alert } from 'antd';

import { loginAction, qrSubmitAction, clearReducerAction } from 'store/actions/authentication';
import history from 'util/history';
import AppConstants from 'themes/appConstants';
import AppImages from 'themes/appImages';
import AppUniqueId from 'themes/appUniqueId';
import Loader from 'customComponents/loader';
import InputWithHead from 'customComponents/InputWithHead';
import { trimSpacesFromUsername } from 'util/helpers';

const { Content } = Layout;
const loginFormSchema = Yup.object().shape({
  userName: Yup.string()
    .min(2, 'Username must be at least 2 characters')
    .required('Username/Email is required'),
  password: Yup.string().min(8, 'Password must be 8 characters').required('Password is required'),
});

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      code: '',
    };
  }

  componentDidMount() {
    localStorage.removeItem('shopUniqueKey');
    if (localStorage.token != null) {
      history.push('/');
    }
  }

  onChangeCode = e => {
    this.setState({
      code: e.target.value,
    });
  };

  contentView = (values, errors, setFieldValue, touched, handleChange, handleBlur) => (
    <div className="content-view login-form">
      <div className="d-flex justify-content-center">
        <NavLink to="/" className="site-brand">
          <img src={AppImages.netballLogo1} alt="" />
        </NavLink>
      </div>

      <InputWithHead
        heading={AppConstants.usernameEmail}
        placeholder={AppConstants.usernameEmail}
        name="userName"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.userName}
        data-testid={AppUniqueId.login_username}
      />
      {errors.userName && touched.userName && <span className="form-err">{errors.userName}</span>}

      <InputWithHead
        heading={AppConstants.password}
        placeholder={AppConstants.password}
        name="password"
        onChange={handleChange}
        onBlur={handleBlur}
        type="password"
        value={values.password}
        data-testid={AppUniqueId.login_password}
      />
      {errors.password && touched.password && <span className="form-err">{errors.password}</span>}

      <NavLink
        onClick={() => this.props.clearReducerAction('forgotPasswordSuccess')}
        to={{ pathname: '/forgotPassword', state: { email: values.userName } }}
      >
        <span
          id={AppUniqueId.login_forgotPasswordLink}
          className="forgot-password-link-text"
          data-testid={AppUniqueId.login_forgotPasswordLink}
        >
          {AppConstants.forgotResetPassword}
        </span>
      </NavLink>

      <div className="row pt-5">
        <div className="col-sm">
          <div className="comp-finals-button-view">
            <Button
              id={AppUniqueId.login_submitButton}
              className="open-reg-button"
              htmlType="submit"
              type="primary"
              data-testid={AppUniqueId.login_submitButton}
              disabled={this.props.loginState.onLoad}
            >
              {AppConstants.login}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  submitCode = () => {
    const { code } = this.state;
    const { loginState, qrSubmitAction } = this.props;

    qrSubmitAction({
      code,
      userName: loginState.result.userName,
      password: loginState.result.password,
    });
  };

  onQRCodePress = () => {
    const { code } = this.state;
    const { loginState } = this.props;
    if (code.length !== 6 || loginState.onLoad) return;
    this.submitCode();
  };

  render() {
    const { code } = this.state;
    const { loginState } = this.props;
    const { validateQRFailed } = loginState;

    return (
      <div className="fluid-width">
        <img src={AppImages.loginImage} className="bg" alt="" />

        <Layout>
          <Content className="container" style={{ zIndex: 15 }}>
            {!loginState.result || !loginState.result.hasOwnProperty('tfaEnabled') ? (
              <Formik
                enableReinitialize
                initialValues={{
                  userName: '',
                  password: '',
                }}
                validationSchema={loginFormSchema}
                onSubmit={values => {
                  if (!loginState.onLoad) {
                    this.props.loginAction({
                      userName: trimSpacesFromUsername(values.userName),
                      password: values.password,
                    });
                  }
                }}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  // isSubmitting,
                  setFieldValue,
                }) => (
                  <Form onFinish={handleSubmit}>
                    <div className="auth-form" style={{ zIndex: 15 }}>
                      {this.contentView(
                        values,
                        errors,
                        setFieldValue,
                        touched,
                        handleChange,
                        handleBlur,
                      )}
                    </div>
                  </Form>
                )}
              </Formik>
            ) : (
              <>
                <div
                  className="auth-form"
                  style={{ fontSize: 14, textAlign: 'center', zIndex: 15 }}
                >
                  {!loginState.result.tfaEnabled && loginState.result.qrCode && (
                    <>
                      <img src={loginState.result.qrCode} alt="" />

                      <p>Scan QR code with your authenticator.</p>
                    </>
                  )}

                  <div className="qr-code-form">
                    <InputWithHead
                      type="number"
                      heading={AppConstants.qrCodeHeader}
                      placeholder={AppConstants.qrCodeHeader}
                      onChange={this.onChangeCode}
                      onPressEnter={this.onQRCodePress}
                      value={code}
                    />

                    <Button
                      className="open-reg-button"
                      type="primary"
                      disabled={code.length !== 6 || loginState.onLoad}
                      onClick={this.submitCode}
                    >
                      {AppConstants.submit}
                    </Button>
                  </div>
                </div>
                {validateQRFailed ? (
                  <div className="qr-code-note">
                    <Alert description={AppConstants.TFAResetNote} type="warning" showIcon />
                  </div>
                ) : null}
              </>
            )}

            <Loader visible={loginState.onLoad} />
          </Content>
        </Layout>
      </div>
    );
  }
}

Login.propTypes = {
  loginState: PropTypes.object.isRequired,
  loginAction: PropTypes.func.isRequired,
  qrSubmitAction: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ loginAction, qrSubmitAction, clearReducerAction }, dispatch);
}

function mapStateToProps(state) {
  return {
    loginState: state.LoginState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
