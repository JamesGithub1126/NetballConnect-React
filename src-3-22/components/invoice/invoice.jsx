import React, { Component } from 'react';
import { Layout, Descriptions, Divider } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavLink } from 'react-router-dom';
import AppConstants from '../../themes/appConstants';
import InputWithHead from '../../customComponents/InputWithHead';
import AppImages from '../../themes/appImages';
import {
  getInvoice,
  getInvoiceStatusAction,
  getShopInvoice,
  clearInvoiceDataAction,
} from '../../store/actions/stripeAction/stripeAction';
import Loader from '../../customComponents/loader';
import { isArrayNotEmpty, getTaxPortion } from '../../util/helpers';
import history from '../../util/history';
import Doc from '../../util/DocService';

import PdfContainer from '../../util/PdfContainer';
import { netSetGoTshirtSizeAction } from '../../store/actions/commonAction/commonAction';
import { SHOPDELIVERYTYPE } from 'util/enums';
import './invoice.css';
import { PaymentMethodType } from 'themes/stripeConstants';

const { Header, Content } = Layout;

class RegistrationInvoice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: '2019winter',
      value: 'playingMember',
      competition: 'all',
      loading: false,
      checkStatusLoad: false,
      invoiceDisabled: false,
    };
    this.props.netSetGoTshirtSizeAction();
  }

  componentDidMount() {
    const invoicePageData = JSON.parse(localStorage.getItem('invoicePage'));
    if (invoicePageData) {
      localStorage.removeItem('invoicePage');
      history.replace('invoice', invoicePageData);
    } else {
      const paymentSuccess = this.props.location.state
        ? this.props.location.state.paymentSuccess
        : false;
      this.setState({ invoiceDisabled: paymentSuccess });
      this.getInvoiceStatusAPI();
    }
  }

  componentDidUpdate() {
    try {
      const { stripeState } = this.props;
      if (stripeState.onLoad === false && this.state.loading === true) {
        this.setState({ loading: false });
        if (!stripeState.error) {
          history.push('/checkoutPayment', {
            registrationId: this.props.location.state
              ? this.props.location.state.registrationId
              : null,
            invoiceId: this.props.stripeState.invoiceId,
          });
        }
      }
      if (
        stripeState.onLoad === false &&
        this.state.checkStatusLoad === true &&
        !this.props.stripeState.invoiceData
      ) {
        this.setState({ checkStatusLoad: false });
        const registrationId = this.props.location.state
          ? this.props.location.state.registrationId
          : null;
        const teamMemberRegId = this.props.location.state
          ? this.props.location.state.teamMemberRegId
          : null;
        const userRegId = this.props.location.state ? this.props.location.state.userRegId : null;
        const invoiceId = this.props.location.state ? this.props.location.state.invoiceId : null;
        const transactionId = this.props.location.state
          ? this.props.location.state.transactionId
          : null;
        const shopUniqueKey = this.props.location.state
          ? this.props.location.state.shopUniqueKey
          : null;

        if (shopUniqueKey) {
          this.props.getShopInvoice(shopUniqueKey, invoiceId);
        } else {
          this.props.getInvoice(
            registrationId,
            userRegId,
            invoiceId,
            teamMemberRegId,
            transactionId,
          );
        }
      }
    } catch (ex) {
      console.log(`Error in componentDidUpdate::${ex}`);
    }
  }

  componentWillUnmount() {
    this.props.clearInvoiceDataAction();
  }

  getInvoiceStatusAPI = () => {
    const registrationId = this.props.location.state
      ? this.props.location.state.registrationId
      : null;
    const teamMemberRegId = this.props.location.state
      ? this.props.location.state.teamMemberRegId
      : null;
    const userRegId = this.props.location.state ? this.props.location.state.registrationId : null;
    const invoiceId = this.props.location.state ? this.props.location.state.invoiceId : null;

    this.props.getInvoiceStatusAction(registrationId, userRegId, invoiceId, teamMemberRegId);
    this.setState({ checkStatusLoad: true });
  };

  /// ////view for breadcrumb
  headerView = () => (
    <Header className="comp-player-grades-header-view container  mt-0">
      <div className="row">
        <div className="col-sm" style={{ display: 'flex', alignContent: 'center' }} />
      </div>
    </Header>
  );

  /// top header view
  topView = () => {
    const { invoiceData, getAffiliteDetailData } = this.props.stripeState;
    const userDetail = invoiceData != null ? invoiceData.yourInfo : null;
    const invoiceInfo = invoiceData != null ? invoiceData.billTo : null;
    const organisationLogo = invoiceData != null ? invoiceData.organisationLogo : null;
    let invoiceDate = '';
    if (invoiceData?.invoiceCreatedDate) {
      invoiceDate = new Date(invoiceData.invoiceCreatedDate).toLocaleDateString();
    }
    return (
      <div className="content-view pt-4 pb-0 ">
        <div className="drop-reverse">
          <div className="col-sm pt-3 pl-0">
            <label className="invoice-description">
              <img
                src={organisationLogo || AppImages.squareImage}
                alt="squareImage"
                height="120"
                width="120"
                name="image"
                onError={ev => {
                  ev.target.src = AppImages.squareImage;
                }}
              />
            </label>
            <div className="invoice-receipt-date">
              {AppConstants.date}:&nbsp;&nbsp;
              {invoiceDate}
            </div>
            <div className="invoice-receipt">
              <div className="invoice-receipt-num">
                {AppConstants.receiptNo}:&nbsp;&nbsp;
                {invoiceInfo && (invoiceInfo.receiptId ? invoiceInfo.receiptId : '100000')}
              </div>
            </div>
            {userDetail && userDetail.firstName && (
              <Descriptions>
                <Descriptions.Item className="pb-0" label="Bill To">
                  {userDetail.firstName} {userDetail.middleName} {userDetail.lastName}
                </Descriptions.Item>
              </Descriptions>
            )}
            {userDetail && userDetail.street1 && (
              <Descriptions>
                <Descriptions.Item className="pb-0">{userDetail.street1}</Descriptions.Item>
              </Descriptions>
            )}
            {userDetail && userDetail.street2 && (
              <Descriptions>
                <Descriptions.Item className="pb-0">{userDetail.street2}</Descriptions.Item>
              </Descriptions>
            )}
            {userDetail && (
              <Descriptions>
                <Descriptions.Item>
                  {userDetail.suburb}
                  {userDetail.suburb ? ', ' : ''}
                  {userDetail.state}
                  {userDetail.state ? ', ' : ''}
                  {userDetail.postalCode}
                </Descriptions.Item>
              </Descriptions>
            )}
          </div>

          <div className="col-sm-5 mb-5 pl-0">
            <div>
              {getAffiliteDetailData.map((item, index) => (
                <div key={index} className="affiliate-detail-View-Invoice">
                  <div className="pt-3">
                    <span className="roundUpDescription-text">{item.organisationName}</span>
                    <Descriptions>
                      <Descriptions.Item className="pb-0" label="E">
                        {item.organiationEmailId ? item.organiationEmailId : 'N/A'}
                      </Descriptions.Item>
                    </Descriptions>
                    <Descriptions>
                      <Descriptions.Item className="pb-0" label="Ph">
                        {item.organiationPhoneNo ? item.organiationPhoneNo : 'N/A'}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  membershipProductView = (membershipDetail, membershipProductName = '', mTypeName) => {
    const mOrganisationName = membershipDetail != null ? membershipDetail.name : '';
    const childDiscountsToDeduct =
      membershipDetail.childDiscountsToDeduct != null ? membershipDetail.childDiscountsToDeduct : 0;
    const governmentVoucherAmount =
      membershipDetail.governmentVoucherAmount != null
        ? membershipDetail.governmentVoucherAmount
        : 0;

    return (
      <div className="row">
        <div className="col-md-3 col-8 pb-0 pr-0 pl-0 ">
          <InputWithHead
            heading={`${mOrganisationName} - (${membershipProductName}) Fees - ${mTypeName} `}
            required="pr-3 justify-content-start"
          />
        </div>

        <div className="col-md-9 col-4 pb-0 pl-0 pr-0">
          <div>
            <div className="row flex-nowrap">
              <div className="col-sm invoice-description">
                <InputWithHead heading="1.00" required="input-align-right" />
              </div>
              <div className="col-sm invoice-description">
                <InputWithHead
                  heading={`$${Number(membershipDetail.feesToPay).toFixed(2)}`}
                  required="input-align-right"
                />
              </div>
              <div className="col-sm invoice-description">
                <InputWithHead
                  heading={`$${(
                    parseFloat(membershipDetail.discountsToDeduct.toFixed(2)) +
                    parseFloat(childDiscountsToDeduct.toFixed(2))
                  ).toFixed(2)}`}
                  required="input-align-right"
                />
              </div>
              <div className="col-sm invoice-description">
                <InputWithHead
                  heading={`$${parseFloat(governmentVoucherAmount.toFixed(2)).toFixed(2)}`}
                  required="input-align-right"
                />
              </div>
              <div className="col-sm invoice-description">
                <InputWithHead
                  heading={`$${Number(membershipDetail.feesToPayGST).toFixed(2)}`}
                  required="input-align-right"
                />
              </div>
              <div className="col-sm invoice-right-column">
                <InputWithHead
                  required="invoice input-align-right"
                  heading={`$${(
                    parseFloat(membershipDetail.feesToPay.toFixed(2)) +
                    parseFloat(membershipDetail.feesToPayGST.toFixed(2)) -
                    parseFloat(membershipDetail.discountsToDeduct.toFixed(2)) -
                    parseFloat(childDiscountsToDeduct.toFixed(2)) -
                    parseFloat(governmentVoucherAmount.toFixed(2))
                  ).toFixed(2)}`}
                />
              </div>
            </div>
          </div>
        </div>
        <Divider className="mt-0 mb-0" />
      </div>
    );
  };

  competitionOrganiserView = competitionDetails => {
    const childDiscountsToDeduct =
      competitionDetails.childDiscountsToDeduct != null
        ? competitionDetails.childDiscountsToDeduct
        : 0;
    const governmentVoucherAmount =
      competitionDetails.governmentVoucherAmount != null
        ? competitionDetails.governmentVoucherAmount
        : 0;
    return (
      <div className="row">
        <div className="col-md-3 col-8 pb-0 pr-0 pl-0 ">
          {competitionDetails && competitionDetails.name && (
            <InputWithHead
              heading={`${competitionDetails.name} - Fees`}
              required="pr-3 justify-content-start"
            />
          )}
        </div>
        <div className="col-md-9 col-4 pb-0 pl-0 pr-0">
          <div>
            <div className="row flex-nowrap">
              <div className="col-sm invoice-description">
                <InputWithHead heading="1.00" required="input-align-right" />
              </div>
              <div className="col-sm invoice-description">
                <InputWithHead
                  heading={`$${Number(competitionDetails.feesToPay).toFixed(2)}`}
                  required="input-align-right"
                />
              </div>
              <div className="col-sm invoice-description">
                <InputWithHead
                  heading={`$${(
                    parseFloat(competitionDetails.discountsToDeduct.toFixed(2)) +
                    parseFloat(childDiscountsToDeduct.toFixed(2))
                  ).toFixed(2)}`}
                  required="input-align-right"
                />
              </div>
              <div className="col-sm invoice-description">
                <InputWithHead
                  heading={`$${parseFloat(governmentVoucherAmount.toFixed(2)).toFixed(2)}`}
                  required="input-align-right"
                />
              </div>
              <div className="col-sm invoice-description">
                <InputWithHead
                  heading={`$${Number(competitionDetails.feesToPayGST).toFixed(2)}`}
                  required="input-align-right"
                />
              </div>
              <div className="col-sm invoice-right-column">
                <InputWithHead
                  required="invoice input-align-right"
                  heading={`$${(
                    parseFloat(competitionDetails.feesToPay.toFixed(2)) +
                    parseFloat(competitionDetails.feesToPayGST.toFixed(2)) -
                    parseFloat(competitionDetails.discountsToDeduct.toFixed(2)) -
                    parseFloat(childDiscountsToDeduct.toFixed(2)) -
                    parseFloat(governmentVoucherAmount.toFixed(2))
                  ).toFixed(2)}`}
                />
              </div>
            </div>
          </div>
        </div>
        <Divider className="mt-0 mb-0" />
      </div>
    );
  };

  nominationCompOrgView = competitionDetails => {
    const nominationGVAmount =
      competitionDetails.nominationGVAmount != null ? competitionDetails.nominationGVAmount : 0;
    const nomDiscountsToDeduct = competitionDetails.nomDiscountsToDeduct
      ? competitionDetails.nomDiscountsToDeduct
      : 0;
    const childDiscountsToDeduct =
      competitionDetails.nomChildDiscountsToDeduct != null
        ? competitionDetails.nomChildDiscountsToDeduct
        : 0;
    return (
      <div className="row">
        <div className="col-md-3 col-8 pb-0 pr-0 pl-0 ">
          {competitionDetails && competitionDetails.name && (
            <InputWithHead heading={`${competitionDetails.name} - Nomination Fees`} />
          )}
        </div>
        <div className="col-md-9 col-4 pb-0 pl-0 pr-0">
          <div>
            <div className="row flex-nowrap">
              <div className="col-sm invoice-description">
                <InputWithHead heading="1.00" required="input-align-right" />
              </div>
              <div className="col-sm invoice-description">
                <InputWithHead
                  heading={`$${Number(competitionDetails.nominationFeeToPay).toFixed(2)}`}
                  required="input-align-right"
                />
              </div>
              <div className="col-sm invoice-description">
                <InputWithHead
                  heading={`$${(
                    parseFloat(nomDiscountsToDeduct.toFixed(2)) +
                    parseFloat(childDiscountsToDeduct.toFixed(2))
                  ).toFixed(2)}`}
                  required="input-align-right"
                />
              </div>
              <div className="col-sm invoice-description">
                <InputWithHead
                  heading={`$${parseFloat(nominationGVAmount.toFixed(2)).toFixed(2)}`}
                  required="input-align-right"
                />
              </div>
              <div className="col-sm invoice-description">
                <InputWithHead
                  heading={`$${Number(competitionDetails.nominationGSTToPay).toFixed(2)}`}
                  required="input-align-right"
                />
              </div>
              <div className="col-sm invoice-right-column">
                <InputWithHead
                  required="invoice input-align-right"
                  heading={`$${(
                    parseFloat(competitionDetails.nominationFeeToPay.toFixed(2)) +
                    parseFloat(competitionDetails.nominationGSTToPay.toFixed(2)) -
                    (parseFloat(nominationGVAmount.toFixed(2)) +
                      parseFloat(nomDiscountsToDeduct.toFixed(2)) +
                      parseFloat(childDiscountsToDeduct.toFixed(2)))
                  ).toFixed(2)}`}
                />
              </div>
            </div>
          </div>
        </div>
        <Divider className="mt-0 mb-0" />
      </div>
    );
  };

  competitionAffiliateView = affiliateDetail => {
    const childDiscountsToDeduct =
      affiliateDetail.childDiscountsToDeduct != null ? affiliateDetail.childDiscountsToDeduct : 0;
    const governmentVoucherAmount =
      affiliateDetail.governmentVoucherAmount != null ? affiliateDetail.governmentVoucherAmount : 0;
    return (
      <div className="row">
        <div className="col-md-3 col-8 pb-0 pr-0 pl-0 ">
          {affiliateDetail && affiliateDetail.name && (
            <InputWithHead
              heading={`${affiliateDetail.name} - Fees`}
              required="pr-3 justify-content-start"
            />
          )}
        </div>
        <div className="col-md-9 col-4 pb-0 pl-0 pr-0">
          <div>
            <div className="row flex-nowrap">
              <div className="col-sm invoice-description">
                {affiliateDetail && <InputWithHead heading="1.00" required="input-align-right" />}
              </div>
              <div className="col-sm invoice-description">
                {affiliateDetail && (
                  <InputWithHead
                    heading={`$${Number(affiliateDetail.feesToPay).toFixed(2)}`}
                    required="input-align-right"
                  />
                )}
              </div>
              <div className="col-sm invoice-description">
                {affiliateDetail && (
                  <InputWithHead
                    heading={`$${(
                      parseFloat(affiliateDetail.discountsToDeduct.toFixed(2)) +
                      parseFloat(childDiscountsToDeduct.toFixed(2))
                    ).toFixed(2)}`}
                    required="input-align-right"
                  />
                )}
              </div>
              <div className="col-sm invoice-description">
                {affiliateDetail && (
                  <InputWithHead
                    heading={`$${parseFloat(governmentVoucherAmount.toFixed(2)).toFixed(2)}`}
                    required="input-align-right"
                  />
                )}
              </div>
              <div className="col-sm invoice-description">
                {affiliateDetail && (
                  <InputWithHead
                    heading={`$${Number(affiliateDetail.feesToPayGST).toFixed(2)}`}
                    required="input-align-right"
                  />
                )}
              </div>
              <div className="col-sm invoice-right-column">
                {affiliateDetail && (
                  <InputWithHead
                    required="invoice input-align-right"
                    heading={`$${(
                      parseFloat(affiliateDetail.feesToPay.toFixed(2)) +
                      parseFloat(affiliateDetail.feesToPayGST.toFixed(2)) -
                      parseFloat(affiliateDetail.discountsToDeduct.toFixed(2)) -
                      parseFloat(childDiscountsToDeduct.toFixed(2)) -
                      parseFloat(governmentVoucherAmount.toFixed(2))
                    ).toFixed(2)}`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <Divider className="mt-0 mb-0" />
      </div>
    );
  };

  nominationAffiliateView = affiliateDetail => {
    const nominationGVAmount =
      affiliateDetail.nominationGVAmount != null ? affiliateDetail.nominationGVAmount : 0;
    const nomDiscountsToDeduct = affiliateDetail.nomDiscountsToDeduct
      ? affiliateDetail.nomDiscountsToDeduct
      : 0;
    const childDiscountsToDeduct =
      affiliateDetail.nomChildDiscountsToDeduct != null
        ? affiliateDetail.nomChildDiscountsToDeduct
        : 0;
    return (
      <div className="row">
        <div className="col-md-3 col-8 pb-0 pr-0 pl-0 ">
          {affiliateDetail && affiliateDetail.name && (
            <InputWithHead
              heading={`${affiliateDetail.name} - Nomination Fees`}
              required="justify-content-start"
            />
          )}
        </div>
        <div className="col-md-9 col-4 pb-0 pl-0 pr-0">
          <div>
            <div className="row flex-nowrap">
              <div className="col-sm invoice-description">
                {affiliateDetail && <InputWithHead heading="1.00" required="input-align-right" />}
              </div>
              <div className="col-sm invoice-description">
                {affiliateDetail && (
                  <InputWithHead
                    heading={`$${Number(affiliateDetail.nominationFeeToPay).toFixed(2)}`}
                    required="input-align-right"
                  />
                )}
              </div>
              <div className="col-sm invoice-description">
                {affiliateDetail && (
                  <InputWithHead
                    heading={`$${(
                      parseFloat(nomDiscountsToDeduct.toFixed(2)) +
                      parseFloat(childDiscountsToDeduct.toFixed(2))
                    ).toFixed(2)}`}
                    required="input-align-right"
                  />
                )}
              </div>
              <div className="col-sm invoice-description">
                {affiliateDetail && (
                  <InputWithHead
                    heading={`$${parseFloat(nominationGVAmount.toFixed(2)).toFixed(2)}`}
                    required="input-align-right"
                  />
                )}
              </div>
              <div className="col-sm invoice-description">
                {affiliateDetail && (
                  <InputWithHead
                    heading={`$${Number(affiliateDetail.nominationGSTToPay).toFixed(2)}`}
                    required="input-align-right"
                  />
                )}
              </div>
              <div className="col-sm invoice-right-column">
                {affiliateDetail && (
                  <InputWithHead
                    required="invoice input-align-right"
                    heading={`$${(
                      parseFloat(affiliateDetail.nominationFeeToPay.toFixed(2)) +
                      parseFloat(affiliateDetail.nominationGSTToPay.toFixed(2)) -
                      (parseFloat(nominationGVAmount.toFixed(2)) +
                        parseFloat(nomDiscountsToDeduct.toFixed(2)) +
                        parseFloat(childDiscountsToDeduct.toFixed(2)))
                    ).toFixed(2)}`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <Divider className="mt-0 mb-0" />
      </div>
    );
  };

  /// /////form content view
  contentView = () => {
    const { tShirtSizeList } = this.props.commonReducerState;
    const { invoiceData } = this.props.stripeState;
    const data = invoiceData != null ? invoiceData.compParticipants : [];
    const shopUniqueKey = this.props.location.state
      ? this.props.location.state.shopUniqueKey
      : null;

    return (
      <div className="content-view pt-0 pb-0">
        <div className="invoice-row-view">
          <div className="col-md-3 col-8 pb-0 pr-0 pl-0 ">
            <InputWithHead heading="Description" required="justify-content-start" />
          </div>
          <div className="col-md-9 col-4 pb-0 pl-0 pr-0">
            <div className="invoice-row-view flex-nowrap">
              <div className="col-sm invoice-description">
                <InputWithHead heading="Quantity" required="input-align-right" />
              </div>
              <div className="col-sm invoice-description">
                <InputWithHead heading="Unit Price" required="input-align-right" />
              </div>
              <div className="col-sm invoice-description">
                <InputWithHead heading="Discount" required="input-align-right" />
              </div>
              {!shopUniqueKey && (
                <div className="col-sm invoice-description">
                  <InputWithHead heading="Government Voucher" required="input-align-right" />
                </div>
              )}
              <div className="col-sm invoice-description">
                <InputWithHead heading="GST" required="input-align-right" />
              </div>
              <div className="col-sm invoice-right-column">
                <InputWithHead heading="Amount AUD" required="input-align-right" />
              </div>
            </div>
          </div>
          <Divider className="mt-0 mb-0" />
        </div>

        {data &&
          data.length > 0 &&
          data.map((item, participantIndex) => {
            const isTeamReg = item.isTeamRegistration != undefined ? item.isTeamRegistration : 0;
            const regName =
              isTeamReg == 1 ? AppConstants.teamRegistration : AppConstants.registration;
            const tShirtDetails = tShirtSizeList
              ? tShirtSizeList.find(x => x.id == item.tShirtSizeRefId)
              : null;
            const tShirtName = tShirtDetails ? tShirtDetails.name : null;
            let toPayOfflineTxt = (
              <span className="schoolInvoiceTxt">
                {' (' + AppConstants.toBeInvoicedViaSchool + ')'}
              </span>
            );
            return (
              <div key={participantIndex}>
                {(item.membershipProducts || []).map((mem, memIndex) => {
                  const competitionDetails = mem && mem.fees.competitionOrganisorFee;
                  const membershipDetail = mem && mem.fees.membershipFee;
                  let parentStateMembershipFee = mem && mem.fees.parentStateMembershipFee;
                  let organiserMembershipFee = mem && mem.fees.organiserMembershipFee;
                  let nationalMembership = mem && mem.fees.nationalMembershipFee;
                  const affiliateDetail = mem && mem.fees.affiliateFee;
                  const totalAmount =
                    mem &&
                    Number(mem.feesToPay) -
                      Number(mem.discountsToDeduct) -
                      Number(mem.childDiscountsToDeduct != null ? mem.childDiscountsToDeduct : 0) -
                      Number(mem.governmentVoucherAmount != null ? mem.governmentVoucherAmount : 0);
                  const mTypeName =
                    mem && mem.membershipTypeName != null ? mem.membershipTypeName : '';

                  const mProductName =
                    mem && mem.membershipProductName != null ? mem.membershipProductName : '';
                  return (
                    <div key={memIndex}>
                      <div className="invoice-row-view">
                        <div className="invoice-col-View pb-0 pl-0">
                          <div className="invoice-col-View pb-0 pl-0 pr-0">
                            {item && item.firstName && (
                              <InputWithHead
                                heading={this.getHeading(
                                  isTeamReg,
                                  regName,
                                  tShirtName,
                                  mTypeName,
                                  mem,
                                  item,
                                )}
                                required="justify-content-start input-align-right"
                              />
                            )}
                          </div>
                        </div>
                        <Divider className="mt-0 mb-0" />
                      </div>
                      {affiliateDetail && this.competitionAffiliateView(affiliateDetail)}
                      {affiliateDetail &&
                        affiliateDetail.nominationFeeToPay > 0 &&
                        this.nominationAffiliateView(affiliateDetail)}

                      {competitionDetails && this.competitionOrganiserView(competitionDetails)}
                      {competitionDetails &&
                        competitionDetails.nominationFeeToPay > 0 &&
                        this.nominationCompOrgView(competitionDetails)}
                      {organiserMembershipFee != null &&
                        this.membershipProductView(
                          organiserMembershipFee,
                          organiserMembershipFee.membershipProductName,
                          mTypeName,
                        )}
                      {membershipDetail != null &&
                        this.membershipProductView(membershipDetail, mProductName, mTypeName)}
                      {parentStateMembershipFee != null &&
                        this.membershipProductView(
                          parentStateMembershipFee,
                          parentStateMembershipFee.membershipProductName,
                          mTypeName,
                        )}
                      {nationalMembership != null &&
                        this.membershipProductView(
                          nationalMembership,
                          nationalMembership.membershipProductName,
                          mTypeName,
                        )}
                      <div className="d-flex row d-flex justify-content-end">
                        <div className="col-sm " />
                        <div className="col-sm pl-0 pr-0 d-flex justify-content-end p-0">
                          <div
                            className="col-8 pr-0"
                            style={{ display: 'flex', justifyContent: 'flex-end' }}
                          >
                            <InputWithHead
                              heading={
                                <>
                                  <span>{AppConstants.total}</span>
                                  {!!item.isSchoolRegistrationApplied && toPayOfflineTxt}
                                </>
                              }
                            />
                          </div>
                          <div className="col-sm invoice-right-column pr-0">
                            <InputWithHead
                              required="invoice input-align-right"
                              heading={totalAmount ? `$${totalAmount.toFixed(2)}` : '$0.00'}
                            />
                          </div>
                        </div>
                        {data.length - 1 !== participantIndex && <Divider className="mt-0 mb-0" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        {this.shopView()}
      </div>
    );
  };

  totalInvoiceView = result => {
    let { invoiceData } = this.props.stripeState;
    let total = invoiceData != null ? invoiceData.total : null;
    let paymentType = this.props.location?.state?.paymentType
      ? this.props.location.state.paymentType
      : !!invoiceData && !!invoiceData.paymentType
      ? invoiceData.paymentType
      : null;
    let chargeSucceeded = invoiceData != null ? invoiceData.chargeSucceeded : false;
    let userDetail = invoiceData != null ? invoiceData.billTo : null;

    const isLogoVisible = invoiceData?.compParticipants?.find(compParticipant => {
      return !!compParticipant?.membershipProducts?.find(
        memberShipProduct =>
          memberShipProduct?.fees?.membershipFee?.organisationId ===
          process.env.REACT_APP_INVOICE_LOGO_ORGANISATION_ID,
      );
    });
    let paymentPlanAmountDue = total ? total.paymentPlanAmountDue : 0;

    return (
      <div className="content-view">
        <div className="drop-reverse">
          <div className="col-sm " />
          <div className="col-sm pl-0 pr-0">
            <div className="col-sm d-flex justify-content-end p-0">
              <div className="col-8 pr-0" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <InputWithHead required="pt-0 input-align-right" heading={'Subtotal'} />
              </div>
              <div className="col-sm invoice-right-column pr-0">
                <InputWithHead
                  required="pt-0 input-align-right"
                  heading={total ? '$' + Number(total.subTotal).toFixed(2) : '$0.00'}
                />
              </div>
            </div>
            <div className="col-sm d-flex justify-content-end p-0">
              <div className="col-8  pr-0" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <InputWithHead required="pt-0 input-align-right" heading={'GST'} />
              </div>
              <div className="col-sm invoice-right-column pr-0">
                <InputWithHead
                  required="pt-0 input-align-right"
                  heading={total ? '$' + Number(total.gst).toFixed(2) : '$0.00'}
                />
              </div>
            </div>
            {!!total && !!total.charityValue && (
              <div className="col-sm d-flex justify-content-end p-0">
                <div className="col-8 pr-0" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <InputWithHead required="pt-0 input-align-right" heading={'Charity'} />
                </div>

                <div className="col-sm invoice-right-column pr-0">
                  <InputWithHead
                    required="pt-0 input-align-right"
                    heading={total ? '$' + Number(total.charityValue).toFixed(2) : '$0.00'}
                  />
                </div>
              </div>
            )}
            <div className="col-sm d-flex justify-content-end p-0">
              <div className="invoice-amount-border col-8 px-0 d-flex justify-content-end">
                <InputWithHead required="pt-3 input-align-right" heading={'Total'} />
              </div>
              <div className="invoice-amount-border col-sm invoice-right-column pr-0">
                <InputWithHead
                  required="pt-3 input-align-right"
                  heading={total ? '$' + Number(total.total).toFixed(2) : '$0.00'}
                />
              </div>
            </div>
            <div className="col-sm d-flex justify-content-end p-0">
              <div className="col-8 px-0  d-flex justify-content-end">
                <InputWithHead required="pt-3 input-align-right" heading={'Transaction Fee'} />
              </div>
              <div className="col-sm invoice-right-column pr-0">
                <InputWithHead
                  required="pt-3 input-align-right"
                  heading={total ? '$' + Number(total.transactionFee).toFixed(2) : '$0.00'}
                />
              </div>
            </div>
            <div className="col-sm d-flex justify-content-end p-0">
              <div className="invoice-amount-border col-8 pr-0 d-flex justify-content-end">
                <InputWithHead
                  required="pt-3 input-align-right"
                  heading={
                    paymentType == 'card' || chargeSucceeded
                      ? AppConstants.amountPaid
                      : AppConstants.amountDue
                  }
                />
              </div>
              <div className="invoice-amount-border col-sm invoice-right-column pr-0">
                <InputWithHead
                  required="pt-3 input-align-right"
                  heading={total ? '$' + Number(total.targetValue).toFixed(2) : '$0.00'}
                />
              </div>
            </div>
            {paymentPlanAmountDue > 0 && (
              <div className="col-sm d-flex justify-content-end p-0">
                <div className="col-8 pr-0 d-flex justify-content-end">
                  <InputWithHead required={'pt-3'} heading={AppConstants.paymentPlanAmountDue} />
                </div>
                <div className="col-sm invoice-right-column pr-0">
                  <InputWithHead
                    required="pt-3 input-align-right"
                    heading={'$' + Number(paymentPlanAmountDue).toFixed(2)}
                  />
                </div>
              </div>
            )}
            <div>
              {!!total && !!total.refund && Number(total.refund) > 0 && (
                <div className="col-sm d-flex justify-content-end p-0">
                  <div
                    className="col-8  pr-0"
                    style={{ display: 'flex', justifyContent: 'flex-end' }}
                  >
                    <InputWithHead required={'pt-0'} heading={AppConstants.invoiceRefunds} />
                  </div>
                  <div className="col-sm invoice-right-column pr-0">
                    <InputWithHead
                      required={'pt-0 input-align-right'}
                      style={{ display: 'flex', justifyContent: 'flex-start' }}
                      heading={total ? '$' + Number(total.refund).toFixed(2) : '$0.00'}
                    />
                  </div>
                </div>
              )}
              {!!total && !!total.totalOffline && Number(total.totalOffline) > 0 && (
                <div
                  className="col-sm d-flex justify-content-end"
                  style={{ padding: '13px 0px 0px 0px' }}
                >
                  <div
                    className="col-8  pr-0"
                    style={{ display: 'flex', justifyContent: 'flex-end' }}
                  >
                    <InputWithHead required={'pt-0'} heading={AppConstants.offlineAmount} />
                  </div>
                  <div className="col-sm invoice-right-column pr-0">
                    <InputWithHead
                      required={'pt-0 input-align-right'}
                      style={{ display: 'flex', justifyContent: 'flex-start' }}
                      heading={total ? '$' + Number(total.totalOffline).toFixed(2) : '$0.00'}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm pt-5 px-0 d-flex invoiceImage">
            <label className="d-flex align-items-center">
              {!!isLogoVisible && (
                <img
                  src={AppImages.netballImages}
                  name={'image'}
                  onError={ev => {
                    ev.target.src = AppImages.netballImages;
                  }}
                />
              )}
            </label>
          </div>
          <div className="col-sm pt-5 px-0 invoiceImageMain ">
            <label className="d-flex align-items-center">
              <NavLink to={{ pathname: '/' }} className="site-brand">
                <img
                  src={AppImages.netballLogoMain}
                  name={'image'}
                  onError={ev => {
                    ev.target.src = AppImages.netballLogoMain;
                  }}
                />
              </NavLink>
            </label>
          </div>
        </div>
      </div>
    );
  };

  getHeading(isTeamReg, regName, tShirtName, mTypeName, mem, item) {
    let heading = '';
    const typeName = mTypeName;
    if (isTeamReg == 1 || item.isTeamRegistration == null) {
      heading = `${regName} - ${typeName}`;
      if (typeName != 'Team Registration Fee') {
        heading += ` ${mem.firstName} ${mem.lastName}`;
      }
      heading += `, ${item.teamName ? ' Team - ' + item.teamName + ',' : ''} ${
        item.competitionName
      }`;
      if (mem.divisionName) {
        heading += ` - ${mem.divisionName}`;
      }
    } else {
      if (mem.divisionName) {
        if (mem.membershipTypeName == 'Player - NetSetGo') {
          heading =
            `${regName} - ${typeName} ` +
            `T Shirt` +
            ` - ${mem.firstName} ${mem.lastName} - ${tShirtName}, ${item.competitionName} - ${mem.divisionName}`;
        } else {
          heading = `${regName} - ${typeName} ${mem.firstName} ${mem.lastName}, ${item.competitionName} - ${mem.divisionName}`;
        }
      } else {
        if (mem.membershipTypeName == 'Player - NetSetGo') {
          heading =
            `${regName} - ${typeName} ` +
            `T Shirt` +
            ` - ${mem.firstName} ${mem.lastName} - ${tShirtName}, ${item.competitionName}`;
        } else {
          heading = `${regName} - ${typeName} ${mem.firstName} ${mem.lastName}, ${item.competitionName}`;
        }
      }
    }
    return heading;
  }

  getShopProductDescription = product => {
    const shopUniqueKey = this.props.location.state
      ? this.props.location.state.shopUniqueKey
      : null;
    let result;
    if (shopUniqueKey) {
      let instruction = '';
      let address = '';
      if (product.deliveryType === SHOPDELIVERYTYPE.Pickup) {
        instruction = `${
          product.pickupInstruction
            ? ` ${AppConstants.pickupInstruction} - ${product.pickupInstruction},`
            : ''
        }`;
        address = `${AppConstants.address} - ${product.address}, ${product.suburb}, ${product.postcode}, ${product.state}`;
        result = `${AppConstants.pickupDescription}, ${instruction} ${address}`;
      } else if (product.deliveryType === SHOPDELIVERYTYPE.Shipping) {
        address = `${AppConstants.address} - ${product.address}, ${product.suburb}, ${product.postcode}, ${product.state}`;
        result = `${AppConstants.shippingDescription}, ${address}`;
      }
    } else {
      result = 'Shop Product Fees';
    }
    return `${product.organisationName} - ${product.productName} ${
      product.variantName ? `- ${product.variantName}` : ''
    }${product.optionName ? `(${product.optionName})` : ''} - ${result}`;
  };

  shopView = () => {
    const { invoiceData } = this.props.stripeState;
    const shopUniqueKey = this.props.location.state
      ? this.props.location.state.shopUniqueKey
      : null;
    const shopProducts = invoiceData != null ? invoiceData.shopProducts : [];
    let totalAmount = 0;
    (shopProducts || []).map(x => {
      totalAmount += x.totalAmt;
    });

    return (
      <div>
        {(shopProducts || []).map((item, index) => (
          <div className="row" key={index}>
            <div className="col-md-3 col-8 pb-0 pr-0 pl-0 ">
              {item.productName && (
                <InputWithHead
                  heading={this.getShopProductDescription(item)}
                  required="pr-3 justify-content-start"
                />
              )}
            </div>
            <div className="col-md-9 col-4 pb-0 pl-0 pr-0">
              <div>
                <div className="row flex-nowrap">
                  <div className="col-sm invoice-description">
                    <InputWithHead
                      heading={Number(item.quantity).toFixed(2)}
                      required="input-align-right"
                    />
                  </div>
                  <div className="col-sm invoice-description">
                    <InputWithHead
                      heading={`$${(Number(item.amount) / Number(item.quantity)).toFixed(2)}`}
                      required="input-align-right"
                    />
                  </div>
                  <div className="col-sm invoice-description">
                    <InputWithHead heading="0.00" required="input-align-right" />
                  </div>
                  {!shopUniqueKey && (
                    <div className="col-sm invoice-description">
                      <InputWithHead heading="0.00" required="input-align-right" />
                    </div>
                  )}
                  <div className="col-sm invoice-description">
                    <InputWithHead
                      heading={`$${Number(getTaxPortion(item.amount, item.tax)).toFixed(2)}`}
                      required="input-align-right"
                    />
                  </div>
                  <div className="col-sm invoice-right-column">
                    <InputWithHead
                      required="invoice input-align-right"
                      heading={`$${Number(item.totalAmt).toFixed(2)}`}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Divider className="mt-0 mb-0" />
          </div>
        ))}
        {isArrayNotEmpty(shopProducts) && (
          <div className="d-flex row d-flex justify-content-end">
            <div className="col-sm " />
            <div className="col-sm pl-0 pr-0  d-flex justify-content-end p-0">
              <div className="col-8 pr-0 d-flex justify-content-end">
                <InputWithHead heading="Total" />
              </div>
              <div className="col-sm invoice-right-column pr-0">
                <InputWithHead
                  required="invoice input-align-right"
                  heading={totalAmount ? `$${totalAmount.toFixed(2)}` : 'N/A'}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  createPdf = html => Doc.createPdf(html);

  render() {
    const shopUniqueKey = this.props.location.state
      ? this.props.location.state.shopUniqueKey
      : null;

    return (
      <div className="fluid-width" style={{ backgroundColor: '#f7fafc' }}>
        <Layout>
          {/* {this.headerView()} */}
          <Content className="registration-form-wrapper mt-5">
            <div className="formView mb-4" style={{ width: '100%' }}>
              <PdfContainer createPdf={this.createPdf} showPdfButton>
                {!shopUniqueKey && this.topView()}
                {this.contentView()}
                {this.totalInvoiceView()}
              </PdfContainer>
            </div>
            <Loader visible={this.props.stripeState.onLoad} />
          </Content>
          {/* {this.footerView()} */}
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getInvoice,
      getInvoiceStatusAction,
      netSetGoTshirtSizeAction,
      getShopInvoice,
      clearInvoiceDataAction,
    },
    dispatch,
  );
}

function mapStatetoProps(state) {
  return {
    stripeState: state.StripeState,
    commonReducerState: state.CommonReducerState,
  };
}
export default connect(mapStatetoProps, mapDispatchToProps)(RegistrationInvoice);
