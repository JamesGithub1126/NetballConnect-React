import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Form } from 'antd';
import { Formik } from 'formik';
import * as Yup from 'yup';

import AppImages from '../../themes/appImages';
import { forgotPasswordAction, clearReducerAction } from '../../store/actions/authentication';
import Loader from '../../customComponents/loader';
import SelectResetType from './SelectResetType';
import ContentView from './ContentView';

import './style.scss';

const { Content } = Layout;
const loginFormSchema = Yup.object().shape({
  userName: Yup.string()
    .min(2, 'Username must be at least 2 characters')
    .required('Username is required'),
});

function ForgotPassword(props) {
  const { loginState, location, forgotPasswordAction } = props;

  let source;
  if (location.search) {
    source = new URLSearchParams(location.search).get('source');
  }

  const [step, setStep] = useState(1);
  const [resetType, setResetType] = useState('email');

  const onSubmitType = type => {
    setResetType(type);
    setStep(2);
  };

  return (
    <div className="fluid-width">
      <img src={AppImages.loginImage} className="bg" alt="" />

      <Layout>
        <Content className="container" style={{ zIndex: 15 }}>
          {step === 1 && <SelectResetType source={source} submitType={onSubmitType} />}

          {step === 2 && (
            <Formik
              enableReinitialize
              initialValues={{
                userName: location.state ? location.state.email : '',
              }}
              validationSchema={loginFormSchema}
              onSubmit={(values, { setSubmitting }) => {
                if (loginState.onLoad === false) {
                  forgotPasswordAction(values.userName, resetType);
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
                    <ContentView
                      values={values}
                      errors={errors}
                      touched={touched}
                      source={source}
                      loginState={loginState}
                      resetType={resetType}
                      setFieldValue={setFieldValue}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                  </div>
                </Form>
              )}
            </Formik>
          )}

          <Loader visible={loginState.onLoad} />
        </Content>
      </Layout>
    </div>
  );
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ forgotPasswordAction, clearReducerAction }, dispatch);
}

function mapStateToProps(state) {
  return {
    loginState: state.LoginState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
