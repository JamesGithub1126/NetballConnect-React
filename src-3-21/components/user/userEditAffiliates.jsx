import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Layout, Breadcrumb, Button, Select, Form, Modal, message, Radio } from 'antd';

import './user.css';
import InputWithHead from '../../customComponents/InputWithHead';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import history from '../../util/history';
import {
  getAffiliateToOrganisationAction,
  saveAffiliateAction,
  updateAffiliateAction,
  getUreAction,
  getRoleAction,
  getAffiliateByOrganisationIdAction,
  deleteOrgContact,
} from '../../store/actions/userAction/userAction';
import ValidationConstants from '../../themes/validationConstant';
import { getCommonRefData } from '../../store/actions/commonAction/commonAction';
import { getUserId, getOrganisationData } from '../../util/sessionStorage';
import Loader from '../../customComponents/loader';
import PlacesAutocomplete from '../competition/elements/PlaceAutoComplete';

const { Header, Footer, Content } = Layout;
const { Option } = Select;
// const phoneRegExp = /^((\\+[1,9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

class UserEditAffiliates extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      affiliateOrgId: '',
      loggedInuserOrgTypeRefId: 0,
      loading: false,
      buttonPressed: '',
      getDataLoading: false,
      deleteModalVisible: false,
      currentIndex: 0,
      organisationName: '',
      isSameUserEmailId: '',
      isSameUserEmailChanged: false,
      termsAndCondititionFile: null,
      termAndConditionTemp: null,
      affiliateAddress: null,
      affiliateAddressError: '',
    };
    this.props.getCommonRefData();
    //this.props.getUreAction();
    this.props.getRoleAction();
    //this.addContact();
    this.formRef = React.createRef();
  }

  componentDidMount() {
    this.referenceCalls(this.state.organisationId);
    let affiliateOrgId = this.props.location.state.affiliateOrgId;
    //let orgTypeRefId = this.props.location.state.orgTypeRefId;
    this.setState({
      affiliateOrgId,
    });
    this.apiCalls(affiliateOrgId);
  }

  componentDidUpdate(nextProps) {
    let userState = this.props.userState;
    let affiliateTo = this.props.userState.affiliateTo;
    let affiliateEdit = this.props.userState.affiliateEdit;
    if (userState.onLoad === false && this.state.loading === true) {
      if (!userState.error) {
        this.setState({
          loading: false,
        });

        if (userState.status == 1 && this.state.buttonPressed === 'save') {
          if (this.state.isSameUserEmailChanged) {
            this.logout();
          } else {
            // history.push("/userAffiliatesList");
          }
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
          });
        }
      }
    }
    if (nextProps.userState !== userState) {
      if (userState.affiliateOnLoad === false && this.state.getDataLoading) {
        this.setState({
          getDataLoading: false,
        });
        this.setFormFieldValue();
      }
    }
    if (nextProps.userState.affiliateEdit !== this.props.userState.affiliateEdit) {
      this.setState({
        affiliateAddress: {
          addressOne: affiliateEdit.street1,
          suburb: affiliateEdit.suburb,
          stateRefId: affiliateEdit.stateRefId,
          postcode: affiliateEdit.postalCode,
        },
      });
    }
  }

  logout = () => {
    localStorage.clear();
    history.push('/login');
  };

  referenceCalls = organisationId => {
    this.props.getAffiliateToOrganisationAction(organisationId);
  };

  apiCalls = affiliateOrgId => {
    this.props.getAffiliateByOrganisationIdAction(affiliateOrgId);
    this.setState({ getDataLoading: true });
  };

  setFormFieldValue = () => {
    let affiliate = this.props.userState.affiliateEdit;
    this.formRef.current.setFieldsValue({
      name: affiliate.name,
      addressOne: affiliate.street1,
      suburb: affiliate.suburb,
      stateRefId: affiliate.stateRefId,
      postcode: affiliate.postalCode,
      affiliatedToOrgId: affiliate.affiliatedToOrgId,
      phoneNo: affiliate.phoneNo,
      email: affiliate.email,
    });
    let contacts = affiliate.contacts;
    if (contacts != null && contacts.length > 0) {
      this.updateContactFormFields(contacts);
    }
  };

  onChangeSetValue = (val, key) => {
    if (key === AppConstants.organisationTypeRefId) {
      if (
        !(
          (this.state.loggedInuserOrgTypeRefId == 1 && (val == 3 || val == 4)) ||
          (this.state.loggedInuserOrgTypeRefId == 2 && val == 4)
        )
      ) {
        let orgVal = this.state.organisationId;
        let name = getOrganisationData() ? getOrganisationData().name : null;
        this.props.updateAffiliateAction(orgVal, AppConstants.affiliatedToOrgId);
        this.props.updateAffiliateAction(name, 'affiliatedToOrgName');
      } else {
        this.props.updateAffiliateAction(null, AppConstants.affiliatedToOrgId);
        this.props.updateAffiliateAction(null, 'affiliatedToOrgName');
        this.formRef.current.setFieldsValue({
          affiliatedToOrgId: null,
        });
      }
    }

    this.props.updateAffiliateAction(val, key);
  };

  addContact = () => {
    let affiliate = this.props.userState.affiliateEdit;
    let contacts = affiliate.contacts;
    let obj = {
      userId: 0,
      firstName: '',
      middleName: '',
      lastName: '',
      mobileNumber: '',
      email: '',
      isSameUser: true,
      permissions: [],
    };
    contacts.push(obj);
    this.props.updateAffiliateAction(contacts, 'contacts');
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
    let affiliate = this.props.userState.affiliateEdit;
    let contacts = affiliate.contacts;
    if (contacts != null) {
      let contact = contacts[index];
      contacts.splice(index, 1);
      if (contacts != null && contacts.length > 0) {
        this.updateContactFormFields(contacts);
      }

      this.props.updateAffiliateAction(contacts, 'contacts');
      let obj = {
        id: contact.userId,
        organisationId: this.state.affiliateOrgId,
      };
      this.props.deleteOrgContact(obj);
    }
  };

  updateContactFormFields = contacts => {
    contacts.forEach((item, index) => {
      this.formRef.current.setFieldsValue({
        [`firstName${index}`]: item.firstName,
        [`lastName${index}`]: item.lastName,
        [`email${index}`]: item.email,
      });

      item['isSameUser'] = getUserId() == item.userId;
      if (item.userId == getUserId()) {
        this.setState({ isSameUserEmailId: item.email });
      }
      let permissions = item.permissions;
      permissions.forEach((perm, permIndex) => {
        this.formRef.current.setFieldsValue({
          [`permissions${index}`]: perm.roleId,
        });
      });
    });
  };

  onChangeContactSetValue = (val, key, index) => {
    let contacts = this.props.userState.affiliateEdit.contacts;
    let contact = contacts[index];
    if (key === 'roles') {
      let userRoleEntityId = 0;
      const userRoleEntity = contact.permissions.find(x => x);
      if (userRoleEntity != null && userRoleEntity != undefined && userRoleEntity != '') {
        userRoleEntityId = userRoleEntity.userRoleEntityId;
      }
      let permissions = [];
      let obj = {
        userRoleEntityId: userRoleEntityId,
        roleId: val,
      };
      permissions.push(obj);
      contact.permissions = permissions;
    } else if (key === 'email') {
      if (contact.isSameUser && contact.userId != 0) {
        if (val != this.state.isSameUserEmailId) {
          this.setState({ isSameUserEmailChanged: true });
        } else {
          this.setState({ isSameUserEmailChanged: false });
        }
      }
      contact[key] = val;
    } else {
      contact[key] = val;
    }

    this.props.updateAffiliateAction(contacts, 'contacts');
  };

  handleForce = data => {
    this.setState({ termsAndCondititionFile: data.target.files[0] });
  };

  saveAffiliate = values => {
    let affiliate = this.props.userState.affiliateEdit;

    if (this.state.affiliateAddress === null) {
      this.setState({ affiliateAddressError: ValidationConstants.affiliateAddressRequiredError });
      message.error(AppConstants.affiliateAddressAddressSelect);

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
        let termsAndConditionsValue = null;
        if (affiliate.termsAndConditionsRefId == 1) {
          termsAndConditionsValue = affiliate.termsAndConditionsLink;
        }
        if (this.state.termsAndCondititionFile == null && affiliate.termsAndConditionsRefId == 2) {
          termsAndConditionsValue = affiliate.termsAndConditionsFile;
        }

        formData.append('organisationLogo', null);
        formData.append('organisationLogoId', 1);
        formData.append('affiliateId', affiliate.affiliateId);
        formData.append('affiliateOrgId', affiliate.affiliateOrgId);
        formData.append('organisationTypeRefId', affiliate.organisationTypeRefId);
        formData.append('affiliatedToOrgId', affiliate.affiliatedToOrgId);
        formData.append(
          'organisationId',
          getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
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
        formData.append('termsAndConditionsRefId', affiliate.termsAndConditionsRefId);
        formData.append('termsAndConditions', termsAndConditionsValue);
        formData.append('organisationLogo', this.state.termsAndCondititionFile);
        formData.append('termsAndConditionId', this.state.termsAndCondititionFile == null ? 1 : 0);
        formData.append('lat', affiliate.lat);
        formData.append('lng', affiliate.lng);
        this.setState({ loading: true });
        this.props.saveAffiliateAction(formData);
      }
    }
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
      lat: address.lat,
      lng: address.lng,
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
      this.onChangeSetValue(address.lat, 'lat');
      this.onChangeSetValue(address.lng, 'lng');
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
            <Breadcrumb.Item className="breadcrumb-add">{AppConstants.edit}</Breadcrumb.Item>
          </Breadcrumb>
        </Header>
      </div>
    );
  };

  contentView = () => {
    let affiliateToData = this.props.userState.affiliateTo;
    let affiliate = this.props.userState.affiliateEdit;
    const { stateList } = this.props.commonReducerState;
    if (affiliate.organisationTypeRefId === 0) {
      if (
        affiliateToData.organisationTypes != undefined &&
        affiliateToData.organisationTypes.length > 0
      ) {
        affiliate.organisationTypeRefId = affiliateToData.organisationTypes[0].id;
      }
    }
    let organisationTypeRefId = affiliate.organisationTypeRefId;

    const state =
      stateList.length > 0 && affiliate.stateRefId
        ? stateList.find(state => state.id === affiliate.stateRefId).name
        : null;

    let defaultAffiliateAddress = `${affiliate.street1 ? `${affiliate.street1},` : ''} ${
      affiliate.suburb ? `${affiliate.suburb},` : ''
    } ${state ? `${state},` : ''} Australia`;

    const isValidate = affiliate.suburb ? false : true;

    return (
      <div className="content-view pt-4">
        <InputWithHead heading={AppConstants.organisationType} />
        <Select
          style={{ width: '100%', paddingRight: 1 }}
          onChange={e => this.onChangeSetValue(e, AppConstants.organisationTypeRefId)}
          value={affiliate.organisationTypeRefId}
        >
          {(affiliateToData.organisationTypes || []).map(org => (
            <Option key={'organisationType_' + org.id} value={org.id}>
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
                auto_complete="new-affiliatedTo"
                heading={affiliate.affiliatedToOrgName}
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
                value={affiliate.affiliatedToOrgId}
                onChange={e => this.onChangeSetValue(e, AppConstants.affiliatedToOrgId)}
              >
                {(affiliateToData.affiliatedTo || [])
                  .filter(
                    x =>
                      x.organisationtypeRefId == organisationTypeRefId - 1 &&
                      x.organisationId != this.state.affiliateOrgId,
                  )
                  .map(aff => (
                    <Option key={'organization_' + aff.organisationId} value={aff.organisationId}>
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
            required="required-field pt-0"
            heading={AppConstants.name}
            placeholder={AppConstants.name}
            onChange={e => this.onChangeSetValue(e.target.value, 'name')}
            // value={affiliate.name}
            value={affiliate.name}
          />
        </Form.Item>

        <Form.Item
          className="formLineHeight"
          name="affiliateAddress"
          rules={[
            {
              required: isValidate,
              message: AppConstants.addressSearch,
            },
          ]}
        >
          <PlacesAutocomplete
            defaultValue={defaultAffiliateAddress}
            required="required-field"
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
          rules={[{ required: true, message: ValidationConstants.phoneNumberRequired }]}
        >
          <InputWithHead
            maxLength={10}
            required="required-field"
            heading={AppConstants.phoneNumber}
            placeholder={AppConstants.phoneNumber}
            onChange={e => this.onChangeSetValue(e.target.value, 'phoneNo')}
            value={affiliate.phoneNo}
            auto_complete="new-phoneNo"
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
    let affiliate = this.props.userState.affiliateEdit;
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
              {affiliate.contacts.length === 1 ? null : (
                <div
                  className="transfer-image-view pointer"
                  onClick={() => this.deleteContact(index)}
                >
                  <span className="user-remove-btn">
                    <i className="fa fa-trash-o" aria-hidden="true" />
                  </span>
                  <span className="user-remove-text">{AppConstants.remove}</span>
                </div>
              )}
            </div>

            <Form.Item
              name={`firstName${index}`}
              rules={[{ required: true, message: ValidationConstants.nameField[0] }]}
            >
              <InputWithHead
                auto_complete="new-firstName"
                required="required-field pt-0"
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
              ]}
            >
              <InputWithHead
                auto_complete="new-email"
                required="required-field"
                heading={AppConstants.email}
                placeholder={AppConstants.email}
                disabled={!item.isSameUser}
                onChange={e => this.onChangeContactSetValue(e.target.value, 'email', index)}
                // value={item.email}
                value={item.email}
              />
            </Form.Item>
            {item.isSameUser && this.state.isSameUserEmailChanged && (
              <div className="same-user-validation">{ValidationConstants.emailField[2]}</div>
            )}

            <InputWithHead
              auto_complete="new-mobileNumber"
              heading={AppConstants.phoneNumber}
              maxLength={10}
              placeholder={AppConstants.phoneNumber}
              onChange={e => this.onChangeContactSetValue(e.target.value, 'mobileNumber', index)}
              value={item.mobileNumber}
            />

            <InputWithHead heading={AppConstants.permissionLevel} />
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

  termsAndConditionsView = () => {
    let affiliate = this.props.userState.affiliateEdit;
    return (
      <div className="discount-view pt-5">
        <span className="form-heading">{AppConstants.termsAndConditions}</span>
        <Radio.Group
          className="reg-competition-radio"
          onChange={e => this.onChangeSetValue(e.target.value, 'termsAndConditionsRefId')}
          value={affiliate.termsAndConditionsRefId}
        >
          <Radio value={2}>{AppConstants.fileUploadPdf}</Radio>
          {affiliate.termsAndConditionsRefId == 2 && (
            <div className=" pl-5 pb-5 pt-4">
              <label className="pt-2">
                <input
                  className="pt-2 pb-2 pointer"
                  type="file"
                  id="teamImport"
                  ref={input => {
                    this.filesInput = input;
                  }}
                  name="file"
                  // icon="file text outline"
                  // iconPosition="left"
                  // label="Upload PDF"
                  // labelPosition="right"
                  placeholder="UploadPDF..."
                  onChange={this.handleForce}
                  accept=".pdf"
                />
              </label>
              <div className="pt-4">
                <div className="row">
                  <div className="col-sm" style={{ whiteSpace: 'break-spaces' }}>
                    <a
                      className="user-reg-link"
                      href={affiliate.termsAndConditions}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {affiliate.termsAndConditionsFile}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
          <Radio value={1}>{AppConstants.link}</Radio>
          {affiliate.termsAndConditionsRefId == 1 && (
            <div className="pl-5 pb-5">
              <InputWithHead
                auto_complete="new-termsAndConditionsLink"
                placeholder={AppConstants.termsAndConditions}
                value={affiliate.termsAndConditionsLink}
                onChange={e => this.onChangeSetValue(e.target.value, 'termsAndConditionsLink')}
              />
            </div>
          )}
        </Radio.Group>
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
                  {AppConstants.updateAffiliates}
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
            onFinishFailed={() => {
              message.error(ValidationConstants.requiredMessage);
            }}
            noValidate="noValidate"
          >
            <Content>
              <div className="formView">{this.contentView()}</div>
              <div className="formView">{this.contacts()}</div>
              <div className="formView">{this.termsAndConditionsView()}</div>
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
      updateAffiliateAction,
      getAffiliateByOrganisationIdAction,
      getCommonRefData,
      getUreAction,
      getRoleAction,
      deleteOrgContact,
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

export default connect(mapStateToProps, mapDispatchToProps)(UserEditAffiliates);
