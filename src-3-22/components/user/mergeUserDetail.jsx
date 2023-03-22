import React, { useState, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Layout,
  Radio,
  Row,
  Typography,
  Modal,
  notification,
  message,
} from 'antd';
import { get } from 'lodash';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { getOrganisationData } from 'util/sessionStorage';
import UserAxiosApi from 'store/http/userHttp/userAxiosApi';
import Loader from 'customComponents/loader';
import { liveScore_formateDate } from 'themes/dateformate';
import { getChildEmail, trimName, isFootball } from 'util/registrationHelper';
import userHttp from '../../store/http/userHttp/userHttp';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import validateUserDetails from './validattion/validateMergeUserDetail';

const { Content } = Layout;
const { Text } = Typography;

const HeaderView = () => (
  <div className="comp-player-grades-header-view-design">
    <div className="row">
      <div className="col-sm d-flex align-content-center">
        <Breadcrumb separator=" > ">
          <Breadcrumb.Item className="breadcrumb-add">{AppConstants.mergeUser}</Breadcrumb.Item>
        </Breadcrumb>
      </div>
    </div>
  </div>
);

const selectAll = 'selectAll';
const userTypes = {
  master: 'master',
  second: 'second',
};
const MatchesDetailView = props => {
  const history = useHistory();
  const masterId = props.location.state ? props.location.state.masterId : null;
  const secondId = props.location.state ? props.location.state.secondId : null;

  const [showAgreeModal, setShowAgreeModal] = useState(false);
  const [requestPayload, setRequestPayload] = useState(null);
  const [masterUserData, setMasterUserData] = useState(null);
  const [secondUserData, setSecondUserData] = useState(null);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);

  const getMasterValue = keyPath => get(masterUserData, keyPath) || '';
  const getSecondValue = keyPath => get(secondUserData, keyPath) || '';
  const getDateTypeValue = value => liveScore_formateDate(value) || '';
  const isMasterSelected = radioKey => values[radioKey] === userTypes.master;
  const isSecondSelected = radioKey => values[radioKey] === userTypes.second;

  const getUserValueByKeys = (valueKey, userTypeKey) => {
    if (!masterUserData || !secondUserData) return '';

    const isMasterValue = userTypeKey === userTypes.master;
    const payloadValue = isMasterValue ? masterUserData[valueKey] : secondUserData[valueKey];

    return payloadValue || '';
  };

  const fields = [
    { key: 'firstName', title: AppConstants.firstName },
    { key: 'lastName', title: AppConstants.lastName },
    { key: 'middleName', title: AppConstants.middleName },
    {
      key: 'dateOfBirth',
      title: AppConstants.dateOfBirth,
      onValueFormat: getDateTypeValue,
    },
    { key: 'email', title: AppConstants.emailAdd },
    { key: 'mobileNumber', title: AppConstants.contactNumber },
    { key: 'gender', title: AppConstants.gender },
    {
      key: 'accreditationUmpireExpiryDate',
      title: AppConstants.nationalAccreditationLevelUmpire,
      getValue: radioValue => {
        const value = getUserValueByKeys('umpireAccreditationLevel', radioValue);
        const dateValue = getDateTypeValue(
          getUserValueByKeys('accreditationUmpireExpiryDate', radioValue),
        );

        return value + ' ' + dateValue;
      },
    },
    {
      key: 'accreditationCoachExpiryDate',
      title: AppConstants.nationalAccreditationLevelCoach,
      getValue: radioValue => {
        const value = getUserValueByKeys('coachAccreditationLevel', radioValue);
        const dateValue = getDateTypeValue(
          getUserValueByKeys('accreditationCoachExpiryDate', radioValue),
        );

        return value + ' ' + dateValue;
      },
    },
    { key: 'childrenCheckNumber', title: AppConstants.childrenNumber },
    {
      key: 'childrenCheckExpiryDate',
      title: AppConstants.checkExpiryDate,
      onValueFormat: getDateTypeValue,
    },
    { key: 'postalCode', title: AppConstants.postalCode },
    { key: 'street1', title: AppConstants.street1 },
    { key: 'street2', title: AppConstants.street2 },
    { key: 'suburb', title: AppConstants.suburb },
    {
      key: 'stripeCustomerAccountId',
      title: AppConstants.stripeCustomerAccountId,
      isDisabled: (value, other) => !value && !!other,
    },
    {
      key: 'stripeAccountId',
      title: AppConstants.stripeAccountId,
      isDisabled: (value, other) => !value && !!other,
    },
    { key: 'emergencyFirstName', title: AppConstants.emergencyFirstName },
    { key: 'emergencyLastName', title: AppConstants.emergencyLastName },
    { key: 'emergencyContactNumber', title: AppConstants.emergencyContactMobile },
    { key: 'externalUserId', title: AppConstants.externalUserId },
    { key: 'photoUrl', title: AppConstants.userPhoto },
  ];

  const getNewValuesByKey = userKey => {
    const newValues = {};
    fields.forEach(field => (newValues[field.key] = userKey));

    return newValues;
  };

  const handleRadioSelected = (radioKey, userTypeKey) => {
    if (radioKey === selectAll) {
      const newValues = {
        [radioKey]: userTypes[userTypeKey],
        ...getNewValuesByKey(userTypes[userTypeKey]),
      };

      setValues(newValues);
    } else {
      setValues({
        ...values,
        selectAll: values.selectAll === userTypes[userTypeKey] ? userTypes[userTypeKey] : null,
        [radioKey]: userTypes[userTypeKey],
      });
    }
  };

  const handleMasterRadioSelected = radioKey => {
    handleRadioSelected(radioKey, userTypes.master);
  };

  const handleSecondRadioSelected = radioKey => {
    handleRadioSelected(radioKey, userTypes.second);
  };

  const getCorrectedUserData = (valueKey, value, userTypeKey) => {
    switch (valueKey) {
      case 'gender': {
        const correctedKey = 'genderRefId';
        const correctedValue = getUserValueByKeys(correctedKey, userTypeKey);

        return {
          correctedKey,
          correctedValue,
        };
      }
      default:
        return {
          correctedKey: valueKey,
          correctedValue: value,
        };
    }
  };

  const mergeUser = async () => {
    const payload = {};
    let isInActive = masterUserData.isInActive;
    if (values.selectAll) {
      const isMasterSelected = values.selectAll === userTypes.master;
      const fromValues = isMasterSelected ? masterUserData : secondUserData;

      fields.forEach(field => {
        const payloadValue = fromValues[field.key];
        const { correctedKey, correctedValue } = getCorrectedUserData(
          field.key,
          payloadValue,
          values.selectAll,
        );

        payload[correctedKey] = correctedValue;
      });
      payload.isInActive = fromValues.isInActive;
      payload.statusRefId = fromValues.isInActive == 1 ? 0 : 1;
      isInActive = fromValues.isInActive;
    } else {
      delete values.selectAll;
      Object.keys(values).forEach(valueKey => {
        const radioValue = values[valueKey];
        const payloadValue = getUserValueByKeys(valueKey, radioValue);
        const { correctedKey, correctedValue } = getCorrectedUserData(
          valueKey,
          payloadValue,
          values.selectAll,
        );

        payload[correctedKey] = correctedValue;
      });
    }
    if (!masterUserData.firstName && secondUserData.firstName && !payload.firstName) {
      message.error(AppConstants.selectFirstName);
      return;
    }
    if (!masterUserData.lastName && secondUserData.lastName && !payload.lastName) {
      message.error(AppConstants.selectLastName);
      return;
    }
    if (!masterUserData.dateOfBirth && secondUserData.dateOfBirth && !payload.dateOfBirth) {
      message.error(AppConstants.selectDateOfBirth);
      return;
    }
    if (!masterUserData.email && secondUserData.email && !payload.email) {
      message.error(AppConstants.email);
      return;
    }
    if (!masterUserData.mobileNumber && secondUserData.mobileNumber && !payload.mobileNumber) {
      message.error(AppConstants.selectContactNumber);
      return;
    }
    if (!masterUserData.genderRefId && secondUserData.genderRefId && !payload.genderRefId) {
      message.error(AppConstants.selectGender);
      return;
    }
    if (!masterUserData.postalCode && secondUserData.postalCode && !payload.postalCode) {
      message.error(AppConstants.selectPostalCode);
      return;
    }
    if (!masterUserData.street1 && secondUserData.street1 && !payload.street1) {
      message.error(AppConstants.selectStreet1);
      return;
    }
    if (!masterUserData.suburb && secondUserData.suburb && !payload.suburb) {
      message.error(AppConstants.selectSuburb);
      return;
    }
    if (
      (masterUserData.stripeCustomerAccountId || secondUserData.stripeCustomerAccountId) &&
      !payload.stripeCustomerAccountId
    ) {
      message.error(AppConstants.selectStripeCustomer);
      return;
    }
    if (
      (masterUserData.stripeAccountId || secondUserData.stripeAccountId) &&
      !payload.stripeAccountId
    ) {
      message.error(AppConstants.selectStripeAccount);
      return;
    }
    if (isFootball) {
      const validationMessage = validateUserDetails(masterUserData, secondUserData, payload);
      if (validationMessage) {
        message.error(validationMessage);
        return validationMessage;
      }
    }
    let firstName = trimName(payload.firstName || masterUserData.firstName);
    if (isInActive == 1 && payload.email && !payload.email.endsWith(firstName)) {
      payload.email = getChildEmail(payload.email, firstName);
    }
    if (values.postalCode === userTypes.second) {
      payload.updatePostalCode = true;
    }
    setRequestPayload(payload);

    if (
      (masterUserData.stripeCustomerAccountId && secondUserData.stripeCustomerAccountId) ||
      (masterUserData.stripeAccountId && secondUserData.stripeAccountId)
    ) {
      setShowAgreeModal(true);
    } else {
      confirmMergeUser(payload);
    }
  };

  const confirmMergeUser = async payload => {
    const openNotificationWithIcon = (type, message) => {
      notification[type]({
        message: type,
        description: message || AppConstants.userMergedSuccessfully,
      });
    };

    const organisationId = get(getOrganisationData(), 'organisationUniqueKey', null);
    try {
      setLoading(true);
      setShowAgreeModal(false);
      await userHttp.post(`${process.env.REACT_APP_URL_API_USERS}/userMerge/merge`, {
        masterUserId: masterId,
        otherUserId: secondId,
        organisationId,
        payload,
      });
      setLoading(false);
      openNotificationWithIcon('success');
      if (props.location.state?.returnUrl) {
        return history.replace(props.location.state.returnUrl);
      }
      return history.replace('/userTextualDashboard');
    } catch (e) {
      setLoading(false);
      console.error(e);
      openNotificationWithIcon('error', AppConstants.somethingWentWrong);
    }
  };

  const agreeModalView = () => {
    return (
      <Modal
        title={AppConstants.mergeUser}
        className="add-membership-type-modal"
        visible={showAgreeModal}
        okText={AppConstants.agree}
        onOk={() => confirmMergeUser(requestPayload)}
        cancelText={AppConstants.cancel}
        onCancel={() => setShowAgreeModal(false)}
      >
        <div>{AppConstants.agreeMergeStripeAccount}</div>
      </Modal>
    );
  };

  const fetchUserData = async userId => {
    const organisationId = get(getOrganisationData(), 'organisationUniqueKey', null);
    const PersonalInfoResultPromise = UserAxiosApi.getUserModulePersonalData({
      userId,
      organisationId,
    });
    const CompInfoResultPromise = UserAxiosApi.getUserModulePersonalByCompData({
      userId,
      organisationId,
      getStripeCustomerID: 1,
    });

    const [PersonalInfoResult, CompInfoResult] = await Promise.all([
      PersonalInfoResultPromise,
      CompInfoResultPromise,
    ]);

    return {
      ...PersonalInfoResult.result.data,
      ...CompInfoResult.result.data[0],
    };
  };

  useEffect(() => {
    async function anyNameFunction() {
      if (!masterId || !secondId) return;

      const masterData = await fetchUserData(masterId);
      const secondData = await fetchUserData(secondId);

      setMasterUserData(masterData);
      setSecondUserData(secondData);
    }

    anyNameFunction();
  }, [masterId, secondId]);

  if (!masterId || !secondId) {
    return history.replace('/userPersonal');
  }

  return (
    <>
      <Loader visible={!(masterUserData && secondUserData) || loading} />

      <div className="comp-dash-table-view">
        <div className="row">
          <div className="col-sm-12">
            <Text type="secondary">{AppConstants.selectUserAndMerge}</Text>
            <Card className="mt-4">
              <Row>
                <Col span={8} className="pr-4">
                  <Text strong>{AppConstants.userInformation}</Text>
                </Col>
                <Col span={8}>
                  <Radio
                    checked={isMasterSelected('selectAll')}
                    onChange={() => handleMasterRadioSelected('selectAll')}
                  >
                    {AppConstants.selectAllFromThisUser}
                  </Radio>
                </Col>
                <Col span={8}>
                  <Radio
                    checked={isSecondSelected('selectAll')}
                    onChange={() => handleSecondRadioSelected('selectAll')}
                  >
                    {AppConstants.selectAllFromThisUser}
                  </Radio>
                </Col>
              </Row>
              <Divider style={{ margin: '8px' }} />

              {fields.map(field => {
                const { getValue, onValueFormat, isDisabled, key } = field;
                let masterValue =
                  key === 'photoUrl' && getMasterValue(key) ? (
                    <img height={70} width={70} src={getMasterValue(key)} alt="user" />
                  ) : (
                    getMasterValue(key)
                  );
                let secondValue =
                  key === 'photoUrl' && getSecondValue(key) ? (
                    <img height={70} width={70} src={getSecondValue(key)} alt="user" />
                  ) : (
                    getSecondValue(key)
                  );

                if (typeof getValue === 'function') {
                  masterValue = getValue(userTypes.master);
                  secondValue = getValue(userTypes.second);
                }

                if (typeof onValueFormat === 'function') {
                  masterValue = onValueFormat(masterValue);
                  secondValue = onValueFormat(secondValue);
                }

                let masterDisabled = false;
                let secondDisabled = false;
                if (typeof isDisabled === 'function') {
                  masterDisabled = isDisabled(masterValue, secondValue);
                  secondDisabled = isDisabled(secondValue, masterValue);
                }

                // if (
                //   isEmpty(masterValue.replace(/\s/g, '')) &&
                //   isEmpty(secondValue.replace(/\s/g, ''))
                // ) {
                //   return null;
                // }

                return (
                  <Row key={field.key}>
                    <Col span={8} className="pr-4">
                      <Text strong>{field.title}</Text>
                    </Col>
                    <Col span={8}>
                      <Radio
                        checked={isMasterSelected(field.key)}
                        onChange={() => handleMasterRadioSelected(field.key)}
                        disabled={masterDisabled}
                      >
                        {masterValue}
                      </Radio>
                    </Col>
                    <Col span={8}>
                      <Radio
                        checked={isSecondSelected(field.key)}
                        onChange={() => handleSecondRadioSelected(field.key)}
                        disabled={secondDisabled}
                      >
                        {secondValue}
                      </Radio>
                    </Col>
                  </Row>
                );
              })}
            </Card>
            <div className="d-flex align-items-center justify-content-between mt-4">
              <Button onClick={history.goBack}>{AppConstants.cancel}</Button>
              <Button onClick={mergeUser} type="primary" className="mr-80" disabled={loading}>
                {AppConstants.merge}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {agreeModalView()}
    </>
  );
};

function MergeUserDetail(props) {
  return (
    <div className="fluid-width default-bg">
      <DashboardLayout menuHeading={AppConstants.user} menuName={AppConstants.user} />
      <InnerHorizontalMenu menu="user" userSelectedKey="1" />
      <Layout>
        <HeaderView />
        <Content>
          <MatchesDetailView {...props} />
        </Content>
      </Layout>
    </div>
  );
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

function mapStateToProps(state) {
  return {
    userState: state.UserState,
    appState: state.AppState,
    commonReducerState: state.CommonReducerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MergeUserDetail);
