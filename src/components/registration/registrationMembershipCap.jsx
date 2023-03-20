import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getCurrentYear, routePermissionForMembership } from 'util/permissions';
import {
  Layout,
  Select,
  Checkbox,
  DatePicker,
  Button,
  Radio,
  Form,
  Breadcrumb,
  message,
} from 'antd';
import CustomToolTip from 'react-png-tooltip';
import moment from 'moment';

import './product.scss';
import InputWithHead from '../../customComponents/InputWithHead';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import {} from '../../store/actions/registrationAction/registration';
import { setYearRefId, getOnlyYearListAction } from '../../store/actions/appAction';
import ValidationConstants from '../../themes/validationConstant';
import { getOrganisationData } from '../../util/sessionStorage';
import Loader from '../../customComponents/loader';
import {
  updateMembershipFeeCapListAction,
  getMembershipCapListAction,
  updateMembershipFeeCapAction,
} from '../../store/actions/registrationAction/registration';
import { getDefaultCompFeesMembershipProductTabAction } from '../../store/actions/registrationAction/competitionFeeAction';
import AppImages from '../../themes/appImages';
import { deepCopyFunction, isArrayNotEmpty } from '../../util/helpers';
import { ValidityPeriodType } from 'enums/registrationEnums';
import { OrganisationType } from 'util/enums';

const { Footer, Content } = Layout;
const { Option } = Select;

// let this_Obj = null;

class RegistrationMembershipCap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      onYearLoad: false,
      yearRefId: null,
      organisationUniqueKey: getOrganisationData().organisationUniqueKey,
      getMembershipProductsOnLoad: false,
      getMembershipCapListOnLoad: false,
      updateMembershipFeeCapOnLoad: false,
      capState: {
        capEndDate: null,
        validityPeriodTypeRefId: 0,
        validityDays: null,
      },
      isAssociation: false,
    };
    // this_Obj = this;
    this.formRef = React.createRef();
  }

  componentDidMount() {
    this.getYears();
  }

  getYears = () => {
    try {
      this.props.getOnlyYearListAction(this.props.appState.yearList);
      this.setState({ onYearLoad: true });
    } catch (ex) {
      console.log('Error in apiCalls::' + ex);
    }
  };

  componentDidUpdate() {
    try {
      const orgItem = getOrganisationData();
      let isAssociation = false;
      if (orgItem) {
        routePermissionForMembership();
        if (orgItem && orgItem.organisationTypeRefId > 2) {
          isAssociation = true;
        }
      }

      if (this.state.onYearLoad == true && this.props.appState.onLoad == false) {
        if (this.props.appState.yearList.length > 0) {
          let mainYearRefId =
            this.props.appState.yearRefId !== -1
              ? this.props.appState.yearRefId
              : getCurrentYear(this.props.appState.yearList);
          let hasRegistration = 1;
          this.props.getDefaultCompFeesMembershipProductTabAction(
            hasRegistration,
            mainYearRefId,
            isAssociation ? 1 : 0,
          );
          this.props.setYearRefId(mainYearRefId);
          this.setState({
            onYearLoad: false,
            yearRefId: mainYearRefId,
            getMembershipProductsOnLoad: true,
            isAssociation: isAssociation,
          });
        }
      }
      if (
        this.props.competitionFeesState.onLoad == false &&
        this.state.getMembershipProductsOnLoad == true
      ) {
        this.props.getMembershipCapListAction(
          this.state.organisationUniqueKey,
          this.state.yearRefId,
        );
        this.setState({ getMembershipProductsOnLoad: false, getMembershipCapListOnLoad: true });
      }
      if (
        this.props.registrationState.onLoad == false &&
        this.state.getMembershipCapListOnLoad == true
      ) {
        this.setMembershipCapListFormFieldsValue();
        this.setState({ getMembershipCapListOnLoad: false });
      }
      if (
        this.props.registrationState.updateMembershipFeeCapOnLoad == false &&
        this.state.updateMembershipFeeCapOnLoad == true
      ) {
        this.props.getMembershipCapListAction(
          this.state.organisationUniqueKey,
          this.state.yearRefId,
        );
        this.setState({ updateMembershipFeeCapOnLoad: false, getMembershipCapListOnLoad: true });
      }
      if (this.props.registrationState.isAllMembershipProductChanged == true) {
        this.setMembershipCapListFormFieldsValue();
        this.props.updateMembershipFeeCapListAction(false, 'isAllMembershipProductChanged');
      }
    } catch (ex) {
      console.log('Error in componentDidUpdate::' + ex);
    }
  }

  setMembershipCapListFormFieldsValue = () => {
    try {
      const { membershipFeeCapList, stateCap } = this.props.registrationState;
      for (let i in membershipFeeCapList) {
        this.formRef.current.setFieldsValue({
          [`membershipProducts${i}`]: membershipFeeCapList[i].productsInfo
            ? membershipFeeCapList[i].productsInfo
            : null,
        });
        for (let j in membershipFeeCapList[i].feeCaps) {
          this.formRef.current.setFieldsValue({
            [`dobFrom${i}${j}`]: membershipFeeCapList[i].feeCaps[j].dobFrom
              ? moment(membershipFeeCapList[i].feeCaps[j].dobFrom)
              : null,
            [`dobTo${i}${j}`]: membershipFeeCapList[i].feeCaps[j].dobTo
              ? moment(membershipFeeCapList[i].feeCaps[j].dobTo)
              : null,
            [`membershipFeeAmount${i}${j}`]: membershipFeeCapList[i].feeCaps[j].amount
              ? membershipFeeCapList[i].feeCaps[j].amount
              : null,
          });
        }
        if (i == 0) {
          let firstCap = membershipFeeCapList[0];
          if (this.state.isAssociation && stateCap) {
            firstCap = stateCap;
          }
          let capEndDate = firstCap.endDate;
          let capState = this.state.capState;
          if (capEndDate) {
            capEndDate = capEndDate.replace('Z', '');
            capState.validityPeriodTypeRefId = ValidityPeriodType.EndDate;
            capState.validityDays = null;
          } else {
            capState.validityPeriodTypeRefId = ValidityPeriodType.NumberOfDays;
            capState.validityDays = firstCap.validityDays;
          }
          capState.capEndDate = capEndDate;
          this.setState({ updateUI: true });
        }
      }
    } catch (ex) {
      console.log('Error in setMembershipCapListFormfieldsValue::' + ex);
    }
  };

  onChangeMembershipProductValue = (value, key, index, subKey, subIndex) => {
    this.props.updateMembershipFeeCapListAction(value, key, index, subKey, subIndex);
  };

  dateConversion = (value, key, index, subKey, subIndex) => {
    try {
      let date = moment(value, 'DD-MM-YYYY').format('MM-DD-YYYY');
      this.onChangeMembershipProductValue(date, key, index, subKey, subIndex);
    } catch (ex) {
      console.log('Error in dateConversion::' + ex);
    }
  };

  getMembershipProductObj = () => {
    let obj = {
      membershipCapId: 0,
      organisationId: '',
      isAllMembershipProduct: 0,
      productsInfo: [],
      products: [],
      productsTemp: [],
      feeCaps: [
        {
          membershipFeeCapId: 0,
          dobFrom: null,
          dobTo: null,
          amount: null,
        },
      ],
    };
    return obj;
  };

  addOrRemoveMembershipProductBox = (key, index) => {
    try {
      const { membershipFeeCapList } = this.props.registrationState;
      if (key == 'add') {
        membershipFeeCapList.push(deepCopyFunction(this.getMembershipProductObj()));
      } else if (key == 'remove') {
        membershipFeeCapList.splice(index, 1);
      }
      this.props.updateMembershipFeeCapListAction(membershipFeeCapList, 'membershipFeeCapList');
      setTimeout(() => {
        this.setMembershipCapListFormFieldsValue();
      }, 100);
    } catch (ex) {
      console.log('Error in addOrRemoveMembershipProductBox::' + ex);
    }
  };

  addOrRemoveAnoterProduct = (key, index, feeCapIndex) => {
    try {
      const { membershipFeeCapList } = this.props.registrationState;
      if (key == 'add') {
        let feeCapObj = {
          membershipFeeCapId: 0,
          dateFrom: null,
          dateTo: null,
          amount: null,
        };
        membershipFeeCapList[index].feeCaps.push(feeCapObj);
      } else if ('remove') {
        membershipFeeCapList[index].feeCaps.splice(feeCapIndex, 1);
      }
      this.props.updateMembershipFeeCapListAction(membershipFeeCapList, 'membershipFeeCapList');
    } catch (ex) {
      console.log('Error in addOrRemoveAnoterProduct::' + ex);
    }
  };

  getEnabledMembershipProducts = (defProdctIndex, membershipFeeCapIndex) => {
    try {
      const { membershipFeeCapList } = this.props.registrationState;
      const { defaultCompFeesMembershipProduct } = this.props.competitionFeesState;
      let defMembershipProduct = defaultCompFeesMembershipProduct[defProdctIndex];
      for (let i in membershipFeeCapList) {
        let exist = membershipFeeCapList[i].productsInfo.find(
          x => x == defMembershipProduct.membershipProductUniqueKey,
        );
        if (exist) {
          if (i == membershipFeeCapIndex) {
            return false;
          } else {
            return true;
          }
        }
      }
    } catch (ex) {
      console.log('Error in getEnabledMembershipProducts::' + ex);
    }
  };

  getEnabledDates = (date, feeCapIndex, membershipFeeCapIndex) => {
    try {
      const { membershipFeeCapList } = this.props.registrationState;
      let dateFormat = moment(date);
      // for(let i in membershipFeeCapList){
      for (let j in membershipFeeCapList[membershipFeeCapIndex].feeCaps) {
        let dobFrom = moment(membershipFeeCapList[membershipFeeCapIndex].feeCaps[j].dobFrom);
        let dobTo = moment(membershipFeeCapList[membershipFeeCapIndex].feeCaps[j].dobTo);
        // console.log(JSON.stringify(dobFrom),JSON.stringify(dobTo),JSON.stringify(dateFormat))
        // console.log("date",date.isSameOrAfter(dobFrom),date.isSameOrBefore(dobTo))
        if (dateFormat.isSameOrAfter(dobFrom) && dateFormat.isSameOrBefore(dobTo)) {
          if (j != feeCapIndex) {
            // console.log(JSON.stringify(dobFrom),JSON.stringify(dobTo),JSON.stringify(dateFormat))
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
      // }
    } catch (ex) {
      console.log('Error in getEnabledDates::' + ex);
    }
  };
  onValidityPeriodChange = value => {
    let item = this.state.capState;
    item.validityPeriodTypeRefId = value;
    if (value == ValidityPeriodType.EndDate) {
      item.validityDays = null;
    } else if (value == ValidityPeriodType.NumberOfDays) {
      item.capEndDate = null;
      // this.formRef.current.setFieldsValue({
      //   [`capEndDate`]: null,
      // });
    }
    this.setState({ updateUI: true });
  };
  onValidityDaysChange = value => {
    let item = this.state.capState;
    item.validityDays = value;
    this.setState({ updateUI: true });
  };
  onCapEndDateChange = e => {
    let item = this.state.capState;
    let date = null;
    if (e) {
      date = e.format('YYYY-MM-DD');
    }
    item.capEndDate = date;
    // this.formRef.current.setFieldsValue({
    //   [`capEndDate`]: e,
    // });
    this.setState({ updateUI: true });
  };

  saveMembershipFeeCap = () => {
    try {
      const { membershipFeeCapList } = this.props.registrationState;
      let capState = this.state.capState;
      if (capState.validityPeriodTypeRefId == ValidityPeriodType.EndDate && !capState.capEndDate) {
        message.error(ValidationConstants.capEndDateIsRequired);
        return;
      }
      if (this.state.isAssociation) {
        if (!capState.capEndDate && !capState.validityDays) {
          message.error(ValidationConstants.contactStateMembership);
          return;
        }
      } else if (
        capState.validityPeriodTypeRefId == ValidityPeriodType.NumberOfDays &&
        !capState.validityDays
      ) {
        message.error(ValidationConstants.daysRequired);
        return;
      }
      if (isArrayNotEmpty(membershipFeeCapList)) {
        for (let cap of membershipFeeCapList) {
          cap.endDate = capState.capEndDate;
          cap.validityDays = capState.validityDays;
        }
        this.props.updateMembershipFeeCapAction(
          this.state.organisationUniqueKey,
          this.state.yearRefId,
          membershipFeeCapList,
        );
        this.setState({ updateMembershipFeeCapOnLoad: true });
      }
    } catch (ex) {
      console.log('Error in saveMembershipFeeCap::' + ex);
    }
  };

  headerView = () => {
    return (
      <div className="membership-cap-heading-view">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.membershipFeeCap}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </div>
    );
  };

  dropdownView = () => {
    return (
      <div className="comp-venue-courts-dropdown-view mt-5">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <div className="w-ft d-flex flex-row align-items-center">
                <span className="year-select-heading required-field">{AppConstants.year}:</span>
                <Select
                  onChange={e => {
                    this.props.getDefaultCompFeesMembershipProductTabAction(
                      1,
                      e,
                      this.state.isAssociation ? 1 : 0,
                    );
                    this.setState({ yearRefId: e, getMembershipProductsOnLoad: true });
                    this.props.setYearRefId(e);
                  }}
                  value={this.state.yearRefId}
                  className="year-select reg-filter-select1 ml-2"
                  style={{ maxWidth: 80 }}
                >
                  {this.props.appState.yearList.map(item => (
                    <Option key={'year_' + item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  capEndDateView = () => {
    let item = this.state.capState;
    return (
      <div className="mb-5">
        <div className="membership-cap">
          <div className="row">
            <div className="col-md-4">
              <div className="membership-cap-check-box-lbl mb-2 required-field">
                {AppConstants.capEndDate}:
              </div>
              <Radio.Group
                className="reg-competition-radio"
                onChange={e => this.onValidityPeriodChange(e.target.value)}
                value={item.validityPeriodTypeRefId}
                disabled={this.state.isAssociation}
              >
                <div className="validity-period-bg">
                  <div className="">
                    <Radio key={'validityperiod_1'} value={1}>
                      {AppConstants.endDate}
                    </Radio>
                    {item.validityPeriodTypeRefId == ValidityPeriodType.EndDate && (
                      <div className="row" style={{ marginLeft: 3 }}>
                        <div className="col-md-6">
                          {/* <Form.Item
                            name={`capEndDate`}
                            rules={[
                              { required: true, message: ValidationConstants.capEndDateIsRequired },
                            ]}
                          > */}
                          <DatePicker
                            className="membership-cap-date-picker"
                            value={item.capEndDate ? moment(item.capEndDate) : null}
                            size="large"
                            placeholder={'dd-mm-yyyy'}
                            style={{ width: '100%' }}
                            onChange={(e, f) => {
                              this.onCapEndDateChange(e);
                            }}
                            format={'DD-MM-YYYY'}
                            showTime={false}
                            // disabledDate={date => this.getEnabledDates(date, feeCapIndex, index)}
                          />
                          <CustomToolTip>
                            <span>{AppConstants.membershipCapExtendMsg}</span>
                          </CustomToolTip>
                          {/* </Form.Item> */}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-2">
                    <Radio key={'validityperiod_2'} value={2}>
                      {AppConstants.noOfDays}
                    </Radio>
                  </div>
                  {item.validityPeriodTypeRefId == ValidityPeriodType.NumberOfDays && (
                    <div>
                      <div className="row" style={{ marginTop: 10, alignItems: 'center' }}>
                        <div className="col-md-6">
                          {/* <Form.Item
                                                            name={`validityDays${index}`}
                                                            rules={[{ required: true, message: ValidationConstants.daysRequired }]}
                                                        > */}
                          <InputWithHead
                            value={item.validityDays}
                            placeholder={AppConstants._days}
                            onChange={e =>
                              this.onValidityDaysChange(e.target.value > -1 ? e.target.value : null)
                            }
                            // onBlur={(e) => {
                            //     this.formRef.current.setFieldsValue({
                            //         [`validityDays${index}`]: e.target.value >= 0 ? e.target.value : ""
                            //     })
                            // }}
                            disabled={this.state.isAssociation}
                            type={'number'}
                            min={1}
                          />
                          {/* </Form.Item> */}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Radio.Group>
            </div>
          </div>
        </div>
      </div>
    );
  };

  membershipProductView = (item, index) => {
    try {
      const { membershipFeeCapList } = this.props.registrationState;
      const { defaultCompFeesMembershipProduct } = this.props.competitionFeesState;
      return (
        <div className="membership-cap">
          <div className="d-flex">
            <div className="membership-cap-heading font-18">
              {AppConstants.applyMembershipProducts}
            </div>
            {membershipFeeCapList.length > 1 && (
              <img
                className="pointer membership-cap-cloase"
                src={AppImages.crossImage}
                onClick={() => this.addOrRemoveMembershipProductBox('remove', index)}
                alt=""
              />
            )}
          </div>
          <Checkbox
            className="membership-cap-check-box-lbl"
            onChange={e =>
              this.onChangeMembershipProductValue(
                e.target.checked ? 1 : 0,
                'isAllMembershipProduct',
                index,
              )
            }
            checked={item.isAllMembershipProduct == 1 ? true : false}
            style={{ margin: '15px 0px' }}
          >
            {AppConstants.allMembershipProducts}
          </Checkbox>
          <Form.Item
            name={`membershipProducts${index}`}
            rules={[
              {
                required: item.isAllMembershipProduct == 1 ? false : true,
                message: ValidationConstants.membershipProductsRequired,
              },
            ]}
          >
            <Select
              disabled={item.isAllMembershipProduct == 1 ? true : false}
              mode="multiple"
              showArrow
              showSearch
              optionFilterProp="children"
              style={{ width: '100%' }}
              placeholder={AppConstants.select}
              onChange={products =>
                this.onChangeMembershipProductValue(products, 'productsInfo', index)
              }
              setFieldsValue={item.productsInfo}
            >
              {(defaultCompFeesMembershipProduct || []).map((defProduct, defProductIndex) => (
                <Option
                  //disabled={this.getEnabledMembershipProducts(defProductIndex, index)}
                  key={defProduct.membershipProductUniqueKey}
                  value={defProduct.membershipProductUniqueKey}
                >
                  {' '}
                  {defProduct.membershipProductName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <div className="membership-cap-border mt-4">
            {(item.feeCaps || []).map((feeCap, feeCapIndex) => (
              <div className="row mb-4" style={{ alignItems: 'flex-end' }}>
                <div className="col-md-4">
                  <div className="membership-cap-check-box-lbl mb-2">{AppConstants.fromDob}</div>
                  <Form.Item
                    name={`dobFrom${index}${feeCapIndex}`}
                    rules={[{ required: true, message: ValidationConstants.fromDateIsRequired }]}
                  >
                    <DatePicker
                      className="membership-cap-date-picker"
                      setFieldsValue={
                        feeCap.dateFrom ? moment(feeCap.dateFrom, 'MM-DD-YYYY') : null
                      }
                      size="large"
                      placeholder={'dd-mm-yyyy'}
                      style={{ width: '100%' }}
                      onChange={(e, f) =>
                        this.dateConversion(f, 'feeCaps', index, 'dobFrom', feeCapIndex)
                      }
                      format={'DD-MM-YYYY'}
                      showTime={false}
                      disabledDate={date => this.getEnabledDates(date, feeCapIndex, index)}
                    />
                  </Form.Item>
                </div>
                <div className="col-md-4">
                  <div className="membership-cap-check-box-lbl mb-2">{AppConstants.toDob}</div>
                  <Form.Item
                    name={`dobTo${index}${feeCapIndex}`}
                    rules={[{ required: true, message: ValidationConstants.toDateIsRequired }]}
                  >
                    <DatePicker
                      className="membership-cap-date-picker"
                      setFieldsValue={feeCap.dateTo ? moment(feeCap.dateTo, 'MM-DD-YYYY') : null}
                      size="large"
                      placeholder={'dd-mm-yyyy'}
                      style={{ width: '100%' }}
                      onChange={(e, f) =>
                        this.dateConversion(f, 'feeCaps', index, 'dobTo', feeCapIndex)
                      }
                      format={'DD-MM-YYYY'}
                      showTime={false}
                      disabledDate={date => this.getEnabledDates(date, feeCapIndex, index)}
                    />
                  </Form.Item>
                </div>
                <div className={item.feeCaps.length > 1 ? 'col-md-3' : 'col-md-4'}>
                  <div className="membership-cap-check-box-lbl mb-2">
                    {AppConstants.maxMembershipFeePayable}
                  </div>
                  <Form.Item
                    name={`membershipFeeAmount${index}${feeCapIndex}`}
                    rules={[{ required: true, message: ValidationConstants.membershipFeeRequired }]}
                  >
                    <InputWithHead
                      prefix="$"
                      setFieldsValue={feeCap.amount}
                      style={{ height: 46 }}
                      placeholder=" "
                      onChange={e => {
                        this.onChangeMembershipProductValue(
                          e.target.value >= 0 ? e.target.value : null,
                          'feeCaps',
                          index,
                          'amount',
                          feeCapIndex,
                        );
                        this.formRef.current.setFieldsValue({
                          [`membershipFeeAmount${index}${feeCapIndex}`]:
                            e.target.value >= 0 ? e.target.value : null,
                        });
                      }}
                      type={'number'}
                      min={0}
                    />
                  </Form.Item>
                </div>
                {item.feeCaps.length > 1 && (
                  <div className="col-md-1">
                    <img
                      className="mb-3 pointer"
                      style={{ width: 22 }}
                      src={AppImages.redCross}
                      onClick={() => this.addOrRemoveAnoterProduct('remove', index, feeCapIndex)}
                      alt=""
                    />
                  </div>
                )}
              </div>
            ))}
            <span
              className="orange-action-txt"
              style={{ alignSelf: 'center', marginTop: 10 }}
              onClick={() => this.addOrRemoveAnoterProduct('add', index)}
            >
              +{AppConstants.addAnother}
            </span>
          </div>
        </div>
      );
    } catch (ex) {
      console.log('Error in membershipProductView::' + ex);
    }
  };

  contentView = () => {
    try {
      const { membershipFeeCapList } = this.props.registrationState;
      return (
        <div>
          {this.capEndDateView()}
          {(membershipFeeCapList || []).map((item, index) => (
            <div className="mb-5">{this.membershipProductView(item, index)}</div>
          ))}
          {!membershipFeeCapList.find(x => x.isAllMembershipProduct == 1) && (
            <div className=" center-align-70">
              <span
                className="orange-action-txt"
                style={{ alignSelf: 'center' }}
                onClick={() => this.addOrRemoveMembershipProductBox('add')}
              >
                +{AppConstants.addAnotherMembershipCap}
              </span>
            </div>
          )}
        </div>
      );
    } catch (ex) {
      console.log('Error in contentView::' + ex);
    }
  };

  footerView = () => {
    return (
      <div className="center-align">
        <div className="d-flex">
          <Button
            htmlType="submit"
            className="primary-add-product membership-cap-save"
            type="primary"
          >
            {AppConstants.save}
          </Button>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.registration}
          menuName={AppConstants.registration}
        />
        <InnerHorizontalMenu menu="registration" regSelectedKey="5" />
        <Layout>
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.saveMembershipFeeCap}
            noValidate="noValidate"
            initialValues={{ yearRefId: 1, validityRefId: 1 }}
          >
            {this.headerView()}
            {this.dropdownView()}
            <Content>
              {this.contentView()}
              <Loader
                visible={
                  this.state.onYearLoad ||
                  this.state.getMembershipProductsOnLoad ||
                  this.state.getMembershipCapListOnLoad ||
                  this.state.updateMembershipFeeCapOnLoad
                }
              />
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
      setYearRefId,
      getOnlyYearListAction,
      updateMembershipFeeCapListAction,
      getDefaultCompFeesMembershipProductTabAction,
      getMembershipCapListAction,
      updateMembershipFeeCapAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    registrationState: state.RegistrationState,
    competitionFeesState: state.CompetitionFeesState,
    appState: state.AppState,
    commonReducerState: state.CommonReducerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationMembershipCap);
