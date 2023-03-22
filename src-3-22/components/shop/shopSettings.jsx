import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Select, Breadcrumb, Button, Form, Modal, message } from 'antd';

import './shop.css';

import AppConstants from 'themes/appConstants';
import AppImages from 'themes/appImages';
import ValidationConstants from 'themes/validationConstant';
import { isArrayNotEmpty, isNotNullOrEmptyString } from 'util/helpers';
import { checkOrganisationLevel } from 'util/permissions';
import { getOrganisationData } from 'util/sessionStorage';
import {
  getStateReferenceAction,
  checkVenueDuplication,
  getCommonRefData,
} from 'store/actions/commonAction/commonAction';
import {
  getShopSettingAction,
  createAddressAction,
  onChangeSettingsData,
} from 'store/actions/shopAction/shopSettingAction';
import Loader from 'customComponents/loader';
import InputWithHead from 'customComponents/InputWithHead';
import DashboardLayout from 'pages/dashboardLayout';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import TextArea from 'antd/lib/input/TextArea';
import PlacesAutocomplete from '../competition/elements/PlaceAutoComplete';

const { Header, Footer, Content } = Layout;
const { Option } = Select;
const { confirm } = Modal;

class ShopSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      getLoad: false,
      orgLevel: AppConstants.state,
      venueAddressError: '',
      manualAddress: false,
      validation: true,
    };
    this.formRef = React.createRef();
    this.props.getCommonRefData();
  }

  componentDidMount() {
    this.apiCalls();
    this.setDetailsFieldValue();
    checkOrganisationLevel().then(value => this.setState({ orgLevel: value }));
  }

  componentDidUpdate(nextProps) {
    let { getDetailsLoad } = this.props.shopSettingState;
    if (getDetailsLoad === false && this.state.getLoad === true) {
      this.setDetailsFieldValue();
      this.setState({ getLoad: false });
    }
  }

  apiCalls = () => {
    let body = {
      State: 'State',
    };
    this.props.getStateReferenceAction(body);
    this.getSettingScreenData();
  };

  getSettingScreenData = () => {
    this.props.getShopSettingAction();
    this.setState({ getLoad: true });
  };

  setDetailsFieldValue() {
    let { settingDetailsData } = this.props.shopSettingState;
    this.formRef.current.setFieldsValue({
      address: settingDetailsData.address,
      addressSearch: settingDetailsData.address,
      suburb: settingDetailsData.suburb,
      state: isNotNullOrEmptyString(settingDetailsData.state) ? settingDetailsData.state : [],
      postcode: settingDetailsData.postcode,
      pickupInstruction: settingDetailsData.pickupInstruction,
    });
  }

  ///////post api
  saveSettings = values => {
    let { settingDetailsData } = JSON.parse(JSON.stringify(this.props.shopSettingState));
    let payload = settingDetailsData;
    let orgData = getOrganisationData() ? getOrganisationData() : null;
    let organisationUniqueKey = orgData ? orgData.organisationUniqueKey : 0;
    payload.organisationUniqueKey = organisationUniqueKey;
    let key = 'update';

    const types = settingDetailsData.types;
    let existSameTypes = false;
    types.forEach(item => {
      const duplicated = types.filter(t => t.typeName === item.typeName);
      if (duplicated && duplicated.length > 1) {
        message.config({ duration: 1.5, maxCount: 1 });
        message.error(ValidationConstants.addShopSameTypesInTheSameState);
        existSameTypes = true;
        return;
      }
    });
    if (existSameTypes) {
      return;
    }
    // if (this.state.venueAddressError) {
    //     message.config({ duration: 1.5, maxCount: 1, });
    //     message.error(this.state.venueAddressError);
    //     return;
    // }

    if (payload.id == 0) {
      delete payload.id;
      key = 'add';
    }
    this.props.createAddressAction(payload, key);
  };

  //////delete the type
  showDeleteConfirm = index => {
    let this_ = this;
    confirm({
      title: AppConstants.deleteProductType,
      content: AppConstants.deleteProductTypeDescription,
      okText: AppConstants.confirm,
      okType: AppConstants.primary,
      cancelText: AppConstants.cancel,
      onOk() {
        let { settingDetailsData } = this_.props.shopSettingState;
        let types = settingDetailsData.types;
        types.splice(index, 1);
        this_.props.onChangeSettingsData(types, 'types');
      },
      onCancel() {},
    });
  };

  ///////add remove type
  addRemoveTypeOption = (index, key) => {
    let { settingDetailsData } = this.props.shopSettingState;
    let defaultTypeObject = {
      typeName: '',
    };
    let types = settingDetailsData.types;
    if (key === 'add') {
      types.push(defaultTypeObject);
    }
    if (key === 'remove') {
      this.showDeleteConfirm(index);
    }
    this.props.onChangeSettingsData(types, 'types');
  };

  headerView = () => {
    return (
      <div className="header-view">
        <Header
          className="form-header-view d-flex align-items-center"
          style={{ backgroundColor: 'transparent' }}
        >
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">{AppConstants.settings}</Breadcrumb.Item>
          </Breadcrumb>
        </Header>
      </div>
    );
  };

  userPublicShopLinkView = () => {
    const publicShopLink = `${
      process.env.REACT_APP_URL_WEB_USER_REGISTRATION
    }/shop?organisationKey=${getOrganisationData().organisationUniqueKey}`;
    return (
      <div>
        <div className="formView">
          <div className="content-view pt-4 mb-20">
            <div className="row">
              <div className="col-sm">
                <InputWithHead heading={AppConstants.endUserPublicShopUrl} />
                <div>
                  <a
                    className="user-reg-link"
                    href={publicShopLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {publicShopLink}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  handlePlacesAutocomplete = data => {
    // const { stateList } = this.props.commonState;
    const address = data;
    this.props.checkVenueDuplication(address);

    if (!address || !address.suburb) {
      this.setState({
        venueAddressError: ValidationConstants.venueAddressDetailsError,
      });
    } else {
      this.setState({
        venueAddressError: '',
      });
    }

    this.setState({
      venueAddress: address,
      validation: false,
    });

    // const stateRefId = stateList.length > 0 && address.state ? stateList.find((state) => state.name === address.state).name : null;

    this.formRef.current.setFieldsValue({
      state: address.state,
      // address: address.addressOne || null,
      addressSearch: address.addressOne || null,
      suburb: address.suburb || null,
      postcode: address.postcode || null,
    });
    if (address) {
      this.props.onChangeSettingsData(address.addressOne, 'address');
      this.props.onChangeSettingsData(address.state, 'state');
      this.props.onChangeSettingsData(address.suburb, 'suburb');
      this.props.onChangeSettingsData(address.postcode, 'postcode');
    }
  };

  contentView = () => {
    let stateList = this.props.commonState.stateData;
    const { settingDetailsData } = this.props.shopSettingState;
    let state =
      stateList.length > 0 && settingDetailsData.state
        ? stateList.find(state => state.name == settingDetailsData.state).name
        : null;

    let defaultVenueAddress = null;
    if (settingDetailsData.address) {
      defaultVenueAddress = `${settingDetailsData.address && `${settingDetailsData.address},`} ${
        settingDetailsData.suburb && `${settingDetailsData.suburb},`
      } ${state && `${state},`} `;
    } else if (settingDetailsData.suburb) {
      defaultVenueAddress = `${settingDetailsData.suburb && `${settingDetailsData.suburb},`} ${
        state && `${state},`
      } `;
    }

    let isValidate = settingDetailsData.suburb ? false : true;

    return (
      <div className="content-view pt-4">
        <span className="form-heading">{AppConstants.pickUpAddress}</span>
        <div
          className="orange-action-txt"
          style={{ marginTop: '10px' }}
          onClick={() => this.setState({ manualAddress: !this.state.manualAddress })}
        >
          {this.state.manualAddress && AppConstants.returnAddressSearch}
        </div>
        {this.state.manualAddress ? (
          <Form.Item
            name="address"
            rules={[
              {
                required: true,
                message: ValidationConstants.enterAddress,
              },
            ]}
          >
            <InputWithHead
              auto_complete="new-address"
              required="required-field"
              heading={AppConstants.address}
              placeholder={AppConstants.address}
              onChange={e => this.props.onChangeSettingsData(e.target.value, 'address')}
            />
          </Form.Item>
        ) : (
          <Form.Item
            name="addressSearch"
            rules={[
              {
                required: isValidate,
                message: AppConstants.addressSearch,
              },
            ]}
          >
            <PlacesAutocomplete
              defaultValue={defaultVenueAddress && `${defaultVenueAddress}Australia`}
              heading={AppConstants.addressSearch}
              required
              error={this.state.venueAddressError}
              onSetData={this.handlePlacesAutocomplete}
            />
          </Form.Item>
        )}

        <div
          className="orange-action-txt"
          style={{ marginTop: '10px' }}
          onClick={() => this.setState({ manualAddress: !this.state.manualAddress })}
        >
          {!this.state.manualAddress && AppConstants.enterAddressManually}
        </div>

        {this.state.manualAddress && (
          <Form.Item
            name="suburb"
            rules={[
              {
                required: true,
                message: ValidationConstants.suburbRequired,
              },
            ]}
          >
            <InputWithHead
              auto_complete="new-suburb"
              required="required-field"
              heading={AppConstants.suburb}
              placeholder={AppConstants.suburb}
              onChange={e => this.props.onChangeSettingsData(e.target.value, 'suburb')}
              // readOnly
            />
          </Form.Item>
        )}
        {this.state.manualAddress && (
          <InputWithHead heading={AppConstants.stateHeading} required="required-field" />
        )}
        {this.state.manualAddress && (
          <Form.Item
            name="state"
            rules={[
              {
                required: true,
                message: ValidationConstants.stateRequired,
              },
            ]}
          >
            <Select
              className="w-100"
              placeholder={AppConstants.select}
              onChange={value => this.props.onChangeSettingsData(value, 'state')}
              // disabled
            >
              {stateList.map(item => (
                <Option key={`state_${item.name}`} value={item.name}>
                  {item.name}
                </Option>
                // <Option key={'state_' + item.id} value={item.id}>{item.name}</Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {this.state.manualAddress && (
          <Form.Item
            name="postcode"
            rules={[
              {
                required: true,
                message: ValidationConstants.postcodeRequired,
              },
            ]}
          >
            <InputWithHead
              auto_complete="new-postCode"
              required="required-field"
              heading={AppConstants.postCode}
              placeholder={AppConstants.postcode}
              onChange={e => this.props.onChangeSettingsData(e.target.value, 'postcode')}
              type="number"
              min={0}
              maxLength={4}
              // readOnly
            />
          </Form.Item>
        )}

        <span className="input-heading">{AppConstants.pickupInstructions}</span>
        <Form.Item name="pickupInstruction">
          <TextArea
            onChange={e => this.props.onChangeSettingsData(e.target.value, 'pickupInstruction')}
          ></TextArea>
        </Form.Item>
      </div>
    );
  };

  productTypesView = () => {
    let { settingDetailsData } = this.props.shopSettingState;
    return (
      <div className="discount-view pt-5">
        <span className="form-heading">{AppConstants.productTypes}</span>
        {isArrayNotEmpty(settingDetailsData.types) &&
          settingDetailsData.types.map((item, index) => (
            <div className="row mt-4" key={`settingDetailsData${index}`}>
              <div className=" col-sm">
                <InputWithHead
                  auto_complete="new-productType"
                  required="required-field"
                  placeholder={AppConstants.productTypes}
                  onChange={e => this.props.onChangeSettingsData(e.target.value, 'typeName', index)}
                  value={item.typeName}
                />
              </div>
              <div className="col-sm-2 d-flex justify-content-center align-items-center">
                <span className="user-remove-btn pl-2" style={{ cursor: 'pointer' }}>
                  <img
                    className="dot-image"
                    src={AppImages.redCross}
                    alt=""
                    width="16"
                    height="16"
                    onClick={() => this.addRemoveTypeOption(index, 'remove')}
                  />
                </span>
              </div>
            </div>
          ))}
        <span
          style={{ cursor: 'pointer' }}
          className="input-heading-add-another"
          onClick={() => this.addRemoveTypeOption(-1, 'add')}
        >
          + {AppConstants.addType}
        </span>
      </div>
    );
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    return (
      <div className="footer-view">
        <div className="row">
          <div className="col-sm">
            <div className="reg-add-save-button"></div>
          </div>
          <div className="col-sm">
            <div className="comp-buttons-view">
              <Button className="publish-button" type="primary" htmlType="submit">
                {AppConstants.save}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    let { orgLevel } = this.state;
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.shop} menuName={AppConstants.shop} />
        <InnerHorizontalMenu menu="shop" shopSelectedKey="4" />
        <Layout>
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.saveSettings}
            noValidate="noValidate"
          >
            <Content>
              {this.headerView()}
              {this.userPublicShopLinkView()}
              <div className="formView">{this.contentView()}</div>
              {orgLevel === AppConstants.state && (
                <div className="formView">{this.productTypesView()}</div>
              )}
            </Content>
            <Loader visible={this.props.commonState.onLoad || this.props.shopSettingState.onLoad} />
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
      getStateReferenceAction,
      getShopSettingAction,
      createAddressAction,
      onChangeSettingsData,
      checkVenueDuplication,
      getCommonRefData,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    commonState: state.CommonReducerState,
    shopSettingState: state.ShopSettingState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ShopSettings);
