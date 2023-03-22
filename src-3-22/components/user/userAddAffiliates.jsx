import React, { Component } from 'react';
import { Layout, Breadcrumb, Button, Select, Form, Modal, message } from 'antd';
import './user.css';
import InputWithHead from '../../customComponents/InputWithHead';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import { NavLink } from 'react-router-dom';
// import * as Yup from "yup";
import { bindActionCreators } from 'redux';
import history from '../../util/history';
import { connect } from 'react-redux';
import {
  getAffiliateToOrganisationAction,
  saveAffiliateAction,
  updateNewAffiliateAction,
  getUreAction,
  getRoleAction,
} from '../../store/actions/userAction/userAction';
import ValidationConstants from '../../themes/validationConstant';
import { getCommonRefData } from '../../store/actions/commonAction/commonAction';
import { getOrganisationData } from '../../util/sessionStorage';
import Loader from '../../customComponents/loader';
import PlacesAutocomplete from '../competition/elements/PlaceAutoComplete';

const { Header, Footer, Content } = Layout;
const { Option } = Select;
// const phoneRegExp = /^((\\+[1,9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

// const userAddAffiliatesSchema = Yup.object().shape({
//   name: Yup.string().required("Name is Required"),
//   phone: Yup.string()
//     .matches(phoneRegExp, "Please Enter Valid Phone Number")
//     .required("Phone Number is Required"),
//   address: Yup.string().required("Address is Required"),
// });

class UserAddAffiliates extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      loggedInuserOrgTypeRefId: 0,
      loading: false,
      buttonPressed: '',
      deleteModalVisible: false,
      currentIndex: 0,
      organisationName: '',
      whatIsTheLowestOrgThatCanAddChild: 3,
      whatIsTheLowestOrgThatCanAddVenue: 4,
      affiliateAddress: null,
      affiliateAddressError: '',
    };
    this.props.getCommonRefData();
    //this.props.getUreAction();
    this.referenceCalls(this.state.organisationId);
    this.props.getRoleAction();
    this.clearContact();
    // this.addContact();
    this.formRef = React.createRef();
  }

  componentDidMount() {
    let isEdit = this.props.location.state ? this.props.location.state.isEdit : false;
    if (isEdit) {
      this.props.updateNewAffiliateAction(null, 'addAffiliate');
      this.addContact();
    }
  }

  componentDidUpdate(nextProps) {
    let userState = this.props.userState;
    let affiliateTo = this.props.userState.affiliateTo;
    if (userState.onLoad === false && this.state.loading === true) {
      if (!userState.error) {
        this.setState({
          loading: false,
        });
      }

      if (nextProps.userState != userState) {
        if (userState.status === 1 && this.state.buttonPressed === 'save') {
          history.push('/userAffiliatesList');
        }
      }
    }
    if (this.state.buttonPressed === 'cancel') {
      history.push('/userAffiliatesList');
    }

    if (nextProps.userState.affiliateTo != affiliateTo) {
      if (userState.affiliateToOnLoad == false) {
        if (affiliateTo.organisationName != '' && affiliateTo.organisationTypeRefId != 0) {
          this.setState({
            loggedInuserOrgTypeRefId: affiliateTo.organisationTypeRefId,
            organisationName: affiliateTo.organisationName,
            whatIsTheLowestOrgThatCanAddChild: affiliateTo.whatIsTheLowestOrgThatCanAddChild,
            whatIsTheLowestOrgThatCanAddVenue: affiliateTo.whatIsTheLowestOrgThatCanAddVenue,
          });
        }
      }
    }
  }

  referenceCalls = organisationId => {
    this.props.getAffiliateToOrganisationAction(organisationId);
  };

  onChangeSetValue = (val, key) => {
    if (key === AppConstants.organisationTypeRefId) {
      if (
        !(
          (this.state.loggedInuserOrgTypeRefId == 1 && (val == 3 || val == 4)) ||
          (this.state.loggedInuserOrgTypeRefId == 2 && val == 4)
        )
      ) {
        this.props.updateNewAffiliateAction(val, AppConstants.affiliatedToOrgId);

        let orgVal = this.state.organisationId;
        let name = getOrganisationData() ? getOrganisationData().name : null;
        this.props.updateNewAffiliateAction(orgVal, AppConstants.affiliatedToOrgId);
        this.props.updateNewAffiliateAction(name, 'affiliatedToOrgName');
      } else {
        this.props.updateNewAffiliateAction(null, AppConstants.affiliatedToOrgId);
        this.props.updateNewAffiliateAction(null, 'affiliatedToOrgName');
        this.formRef.current.setFieldsValue({
          affiliatedToOrgId: null,
        });
      }
    }
    this.props.updateNewAffiliateAction(val, key);
  };

  clearContact = () => {
    let contacts = [];
    this.props.updateNewAffiliateAction(contacts, 'contacts');
  };

  addContact = () => {
    let affiliate = this.props.userState.affiliate.affiliate;
    let contacts = affiliate.contacts;
    let obj = {
      userId: 0,
      firstName: '',
      middleName: '',
      lastName: '',
      mobileNumber: '',
      email: '',
      permissions: [],
    };
    contacts.push(obj);
    this.props.updateNewAffiliateAction(contacts, 'contacts');
  };

  deleteContact = index => {
    this.setState({ deleteModalVisible: true, currentIndex: index });
  };

  removeModalHandle = key => {
    if (key === 'ok') {
      this.removeContact(this.state.currentIndex);
      this.setState({ deleteModalVisible: false });
    } else {
      this.setState({ deleteModalVisible: false });
    }
  };

  removeContact = index => {
    let affiliate = this.props.userState.affiliate.affiliate;
    let contacts = affiliate.contacts;
    contacts.splice(index, 1);
    this.props.updateNewAffiliateAction(contacts, 'contacts');
  };

  onChangeContactSetValue = (val, key, index) => {
    let contacts = this.props.userState.affiliate.affiliate.contacts;
    let contact = contacts[index];
    if (key === 'roles') {
      let permissions = [];
      let obj = {
        userRoleEntityId: 0,
        roleId: val,
      };
      permissions.push(obj);
      contact.permissions = permissions;
    } else {
      contact[key] = val;
    }

    this.props.updateNewAffiliateAction(contacts, 'contacts');
  };

  saveAffiliate = values => {
    let affiliate = this.props.userState.affiliate.affiliate;

    if (this.state.affiliateAddress === null) {
      message.error(ValidationConstants.affiliateAddressRequiredError);

      return;
    }

    if (
      affiliate.contacts === null ||
      affiliate.contacts === undefined ||
      affiliate.contacts.length === 0
    ) {
      message.error(ValidationConstants.affiliateContactRequired[0]);
    } else {
      let data = affiliate.contacts.find(x => x.permissions.find(y => y.roleId == 2));
      if (data == undefined || data == null || data == '') {
        message.error(ValidationConstants.affiliateContactRequired[0]);
      } else {
        let affiliateToOrgId = affiliate.affiliatedToOrgId;
        let contacts = JSON.stringify(affiliate.contacts);
        let formData = new FormData();
        if (affiliateToOrgId == 0) {
          affiliate.affiliatedToOrgId = this.state.organisationId;
          affiliate.organisationId = this.state.organisationId;
        }
        affiliate.whatIsTheLowestOrgThatCanAddChild = this.state.whatIsTheLowestOrgThatCanAddChild;
        affiliate.whatIsTheLowestOrgThatCanAddVenue = this.state.whatIsTheLowestOrgThatCanAddVenue;
        formData.append('organisationLogo', null);
        formData.append('affiliateId', affiliate.affiliateId);
        formData.append('affiliateOrgId', affiliate.affiliateOrgId);
        formData.append('organisationTypeRefId', affiliate.organisationTypeRefId);
        formData.append('affiliatedToOrgId', affiliate.affiliatedToOrgId);
        formData.append(
          'organisationId',
          getOrganisationData() ? getOrganisationData().organisationUniqueKey : '',
        );
        formData.append('name', affiliate.name);
        formData.append('street1', affiliate.street1);
        formData.append('street2', affiliate.street2);
        formData.append('suburb', affiliate.suburb);
        formData.append('phoneNo', affiliate.phoneNo);
        formData.append('email', affiliate.email);
        formData.append('city', affiliate.city);
        formData.append('postalCode', affiliate.postalCode);
        formData.append('stateRefId', affiliate.stateRefId);
        formData.append(
          'whatIsTheLowestOrgThatCanAddChild',
          affiliate.whatIsTheLowestOrgThatCanAddChild,
        );
        formData.append(
          'whatIsTheLowestOrgThatCanAddVenue',
          affiliate.whatIsTheLowestOrgThatCanAddVenue,
        );
        formData.append('contacts', contacts);

        this.setState({ loading: true });
        this.props.saveAffiliateAction(formData);
      }
    }
  };

  headerView = () => {
    return (
      <div className="header-view">
        <Header className="form-header-view d-flex align-items-center bg-transparent">
          <Breadcrumb separator=" > ">
            <NavLink to="/userAffiliatesList">
              <Breadcrumb.Item separator=" > " className="breadcrumb-product">
                {AppConstants.affiliates}
              </Breadcrumb.Item>
            </NavLink>
            {/* <Breadcrumb.Item className="breadcrumb-product">{AppConstants.user}</Breadcrumb.Item> */}
            <Breadcrumb.Item className="breadcrumb-add">{AppConstants.add}</Breadcrumb.Item>
          </Breadcrumb>
        </Header>
      </div>
    );
  };

  // Handle address autocomplete
  handlePlacesAutocomplete = data => {
    const { stateList } = this.props.commonReducerState;
    const address = data;

    this.setState({
      affiliateAddress: null,
    });

    if (!address.addressOne && !address.suburb) {
      this.setState({
        affiliateAddressError: ValidationConstants.affiliateAddressRequiredError,
        affiliateAddress: null,
      });
    } else {
      this.setState({
        affiliateAddressError: '',
      });
    }

    this.setState({
      affiliateAddress: address,
    });

    const stateRefId =
      stateList.length > 0 && address.state
        ? stateList.find(state => state.name === address.state).id
        : null;

    const newAddress = {
      stateRefId,
      addressOne: address.addressOne || null,
      suburb: address.suburb || null,
      postcode: address.postcode || null,
    };

    this.formRef.current.setFieldsValue(newAddress);

    if (address.addressOne && address.suburb) {
      this.setState({
        affiliateAddress: newAddress,
      });

      this.onChangeSetValue(newAddress.stateRefId, 'stateRefId');
      this.onChangeSetValue(newAddress.addressOne, 'street1');
      this.onChangeSetValue(newAddress.suburb, 'suburb');
      this.onChangeSetValue(newAddress.postcode, 'postalCode');
    }
  };

  contentView = () => {
    let affiliateToData = this.props.userState.affiliateTo;
    let affiliate = this.props.userState.affiliate.affiliate;
    // const { stateList } = this.props.commonReducerState;
    if (affiliate.organisationTypeRefId === 0) {
      if (
        affiliateToData.organisationTypes != undefined &&
        affiliateToData.organisationTypes.length > 0
      )
        affiliate.organisationTypeRefId = affiliateToData.organisationTypes[0].id;
    }

    return (
      <div className="content-view pt-4">
        <InputWithHead
          heading={AppConstants.organisationType}
          conceptulHelp
          conceptulHelpMsg={AppConstants.orgTypeMsg}
          marginTop={5}
        />
        <Select
          style={{ width: '100%', paddingRight: 1 }}
          onChange={e => this.onChangeSetValue(e, AppConstants.organisationTypeRefId)}
          value={affiliate.organisationTypeRefId}
        >
          {(affiliateToData.organisationTypes || []).map(org => (
            <Option key={'organisation_' + org.id} value={org.id}>
              {org.name}
            </Option>
          ))}
        </Select>

        {!(
          (this.state.loggedInuserOrgTypeRefId == 1 &&
            (affiliate.organisationTypeRefId == 3 || affiliate.organisationTypeRefId == 4)) ||
          (this.state.loggedInuserOrgTypeRefId == 2 && affiliate.organisationTypeRefId == 4)
        ) ? (
          <div className="row mt-3">
            <div className="col-sm">
              <InputWithHead heading={AppConstants.affiliatedTo} />
            </div>
            <div className="col-sm d-flex align-items-center">
              <InputWithHead
                auto_complete="new-organisationName"
                heading={affiliateToData.organisationName}
                onChange={e => this.onChangeSetValue(e, AppConstants.organisationTypeRefId)}
              />
            </div>
          </div>
        ) : (
          <div>
            <InputWithHead heading={AppConstants.affiliatedTo} required="required-field" />

            <Form.Item
              name="affiliatedToOrgId"
              rules={[
                {
                  required: true,
                  message: ValidationConstants.affiliateToRequired,
                },
              ]}
            >
              <Select
                style={{ width: '100%', paddingRight: 1 }}
                onChange={e => this.onChangeSetValue(e, AppConstants.affiliatedToOrgId)}
              >
                {(affiliateToData.affiliatedTo || [])
                  .filter(x => x.organisationtypeRefId == affiliate.organisationTypeRefId - 1)
                  .map(aff => (
                    <Option key={'organisation_' + aff.organisationId} value={aff.organisationId}>
                      {aff.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </div>
        )}

        <Form.Item
          name="name"
          rules={[{ required: true, message: ValidationConstants.nameField[2] }]}
        >
          <InputWithHead
            auto_complete="new-name"
            required="required-field"
            heading={AppConstants.name}
            placeholder={AppConstants.name}
            onChange={e => this.onChangeSetValue(e.target.value, 'name')}
            value={affiliate.name}
          />
        </Form.Item>
        <Form.Item name="affiliateAddress">
          <PlacesAutocomplete
            heading={AppConstants.address}
            required
            error={this.state.affiliateAddressError}
            onBlur={() => {
              this.setState({
                affiliateAddressError: '',
              });
            }}
            onSetData={this.handlePlacesAutocomplete}
          />
        </Form.Item>

        <Form.Item
          name="phoneNo"
          rules={[
            {
              required: true,
              message: ValidationConstants.phoneNumberRequired,
            },
          ]}
        >
          <InputWithHead
            maxLength={10}
            required="required-field"
            heading={AppConstants.phoneNumber}
            placeholder={AppConstants.phoneNumber}
            onChange={e => this.onChangeSetValue(e.target.value, 'phoneNo')}
            value={affiliate.phoneNo}
            auto_complete="new-phoneNumber"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: ValidationConstants.emailField[0],
            },
            {
              type: 'email',
              pattern: new RegExp(AppConstants.emailExp),
              message: ValidationConstants.email_validation,
            },
          ]}
        >
          <InputWithHead
            heading={AppConstants.email}
            required="required-field"
            placeholder={AppConstants.email}
            onChange={e => this.onChangeSetValue(e.target.value, 'email')}
            value={affiliate.email}
            auto_complete="new-email"
          />
        </Form.Item>
      </div>
    );
  };

  contacts = () => {
    let userState = this.props.userState;
    let affiliate = this.props.userState.affiliate.affiliate;
    let roles = this.props.userState.roles.filter(x => x.applicableToWeb == 1);

    return (
      <div className="discount-view pt-5">
        <span className="form-heading">{AppConstants.contacts}</span>

        {(affiliate.contacts || []).map((item, index) => (
          <div className="prod-reg-inside-container-view pt-4" key={'Contact' + (index + 1)}>
            <div className="row">
              <div className="col-sm">
                <span className="user-contact-heading">{AppConstants.contact + (index + 1)}</span>
              </div>
              <div
                className="transfer-image-view pointer"
                onClick={() => this.deleteContact(index)}
              >
                <span className="user-remove-btn">
                  <i className="fa fa-trash-o" aria-hidden="true" />
                </span>
                <span className="user-remove-text">{AppConstants.remove}</span>
              </div>
            </div>

            <Form.Item
              name={`firstName${index}`}
              rules={[{ required: true, message: ValidationConstants.nameField[0] }]}
            >
              <InputWithHead
                auto_complete="new-firstName"
                required="required-field"
                heading={AppConstants.firstName}
                placeholder={AppConstants.firstName}
                onChange={e => this.onChangeContactSetValue(e.target.value, 'firstName', index)}
                // value={item.firstName}
                value={item.firstName}
              />
            </Form.Item>

            <InputWithHead
              auto_complete="new-middleName"
              heading={AppConstants.middleName}
              placeholder={AppConstants.middleName}
              onChange={e => this.onChangeContactSetValue(e.target.value, 'middleName', index)}
              value={item.middleName}
            />

            <Form.Item
              name={`lastName${index}`}
              rules={[{ required: true, message: ValidationConstants.nameField[1] }]}
            >
              <InputWithHead
                auto_complete="new-lastName"
                required="required-field"
                heading={AppConstants.lastName}
                placeholder={AppConstants.lastName}
                onChange={e => this.onChangeContactSetValue(e.target.value, 'lastName', index)}
                value={item.lastName}
              />
            </Form.Item>

            <Form.Item
              name={`email${index}`}
              rules={[
                {
                  required: true,
                  message: ValidationConstants.emailField[0],
                },
                {
                  type: 'email',
                  pattern: new RegExp(AppConstants.emailExp),
                  message: ValidationConstants.email_validation,
                },
              ]}
            >
              <InputWithHead
                auto_complete="new-email"
                required="required-field"
                heading={AppConstants.email}
                placeholder={AppConstants.email}
                onChange={e => this.onChangeContactSetValue(e.target.value, 'email', index)}
                value={item.email}
              />
            </Form.Item>

            <InputWithHead
              auto_complete="off"
              heading={AppConstants.phoneNumber}
              maxLength={10}
              placeholder={AppConstants.phoneNumber}
              onChange={e => this.onChangeContactSetValue(e.target.value, 'mobileNumber', index)}
              value={item.mobileNumber}
            />

            <InputWithHead
              heading={AppConstants.permissionLevel}
              conceptulHelp
              conceptulHelpMsg={AppConstants.addAffiliatePermissionLevelMsg}
              marginTop={5}
            />

            <Form.Item
              name={`permissions${index}`}
              rules={[
                {
                  required: true,
                  message: ValidationConstants.rolesField[0],
                },
              ]}
            >
              <Select
                style={{ width: '100%', paddingRight: 1 }}
                onChange={e => this.onChangeContactSetValue(e, 'roles', index)}
                value={item.roleId}
              >
                {(roles || []).map(role => (
                  <Option key={'role_' + role.id} value={role.id}>
                    {role.description}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        ))}

        {this.deleteConfirmModalView()}

        <div className="transfer-image-view mt-2 pointer" onClick={() => this.addContact()}>
          <span className="user-remove-text">+ {AppConstants.addContact}</span>
        </div>

        {userState.error && userState.status == 4 && (
          <div style={{ color: 'red' }}>{userState.error.result.data.message}</div>
        )}
      </div>
    );
  };

  deleteConfirmModalView = () => {
    return (
      <div>
        <Modal
          title="Affiliate"
          visible={this.state.deleteModalVisible}
          onOk={() => this.removeModalHandle('ok')}
          onCancel={() => this.removeModalHandle('cancel')}
        >
          <p>Are you sure you want to remove the contact?</p>
        </Modal>
      </div>
    );
  };

  ///footer view containing all the buttons like submit and cancel
  footerView = isSubmitting => {
    return (
      <div className="fluid-width">
        <div className="footer-view">
          <div className="row">
            <div className="col-sm">
              <div className="reg-add-save-button">
                <Button
                  type="cancel-button"
                  onClick={() => this.setState({ buttonPressed: 'cancel' })}
                >
                  {AppConstants.cancel}
                </Button>
              </div>
            </div>
            <div className="col-sm">
              <div className="comp-buttons-view">
                <Button
                  className="user-approval-button"
                  type="primary"
                  htmlType="submit"
                  disabled={isSubmitting}
                  onClick={() => {
                    this.setState({ buttonPressed: 'save' });
                  }}
                >
                  {AppConstants.addAffiliate}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    let userState = this.props.userState;
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.user} menuName={AppConstants.user} />
        <InnerHorizontalMenu menu="user" userSelectedKey="2" />
        <Layout>
          {this.headerView()}
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.saveAffiliate}
            onFinishFailed={err => {
              message.error(ValidationConstants.requiredMessage);
            }}
            noValidate="noValidate"
          >
            <Content>
              <div className="formView">{this.contentView()}</div>
              <div className="formView">{this.contacts()}</div>
              <Loader visible={userState.onLoad} />
            </Content>
            <Footer>{this.footerView()}</Footer>
          </Form>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getAffiliateToOrganisationAction,
      saveAffiliateAction,
      updateNewAffiliateAction,
      getCommonRefData,
      getUreAction,
      getRoleAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    userState: state.UserState,
    appState: state.AppState,
    commonReducerState: state.CommonReducerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserAddAffiliates);
