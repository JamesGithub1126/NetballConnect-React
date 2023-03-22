import React from 'react';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import AppConstants from 'themes/appConstants';
import { currencyFormat } from '../util/currencyFormat';

const CardTitle = {
  Sales: [
    AppConstants.registration,
    AppConstants.shop,
    AppConstants.offline,
    AppConstants.totalSales,
  ],
  Settlements: [
    AppConstants.paid,
    AppConstants.refunded,
    AppConstants.withdraw,
    AppConstants.netSettled,
  ],
  Refunds: [
    AppConstants.deRegistration,
    AppConstants.partialRefunds,
    AppConstants.shopRefunds,
    AppConstants.totalRefunds,
  ],
  Pending: [
    AppConstants.instalments,
    AppConstants.governmentVoucher,
    AppConstants.other,
    AppConstants.totalPending,
  ],
};

const FinancialSummaryCard = props => {
  const { financialSummaryData } = props.paymentState;

  const CardData = {
    Sales: [
      (!_.isEmpty(financialSummaryData) &&
        !_.isEmpty(financialSummaryData['financial']) &&
        financialSummaryData['financial'][0].salesRegistrations) ||
        0,
      (!_.isEmpty(financialSummaryData) &&
        !_.isEmpty(financialSummaryData['shop']) &&
        financialSummaryData['shop'][0].salesShop) ||
        0,
      (!_.isEmpty(financialSummaryData) &&
        !_.isEmpty(financialSummaryData['financial']) &&
        financialSummaryData['financial'][0].salesOffline) ||
        0,
      (!_.isEmpty(financialSummaryData) &&
        !_.isEmpty(financialSummaryData['financial']) &&
        !_.isEmpty(financialSummaryData['shop']) &&
        Number(financialSummaryData['financial'][0].salesRegistrations) +
          Number(financialSummaryData['shop'][0].salesShop) +
          Number(financialSummaryData['financial'][0].salesOffline)) ||
        0,
    ],
    Settlements: [
      (!_.isEmpty(financialSummaryData) &&
        !_.isEmpty(financialSummaryData['transaction']) &&
        financialSummaryData['transaction'][0].paid) ||
        0,
      (!_.isEmpty(financialSummaryData) &&
        !_.isEmpty(financialSummaryData['transaction']) &&
        financialSummaryData['transaction'][0].refunded) ||
        0,
      (!_.isEmpty(financialSummaryData) &&
        !_.isEmpty(financialSummaryData['withdrawals']) &&
        financialSummaryData['withdrawals'][0].net_withdrawal) ||
        0,
      (!_.isEmpty(financialSummaryData) &&
        !_.isEmpty(financialSummaryData['payouts']) &&
        !_.isEmpty(financialSummaryData['withdrawals']) &&
        Number(financialSummaryData['payouts'][0].total_payouts) -
          Number(financialSummaryData['withdrawals'][0].net_withdrawal)) ||
        0,
    ],
    Refunds: [
      (!_.isEmpty(financialSummaryData) &&
        !_.isEmpty(financialSummaryData['financial']) &&
        financialSummaryData['financial'][0].refundsDeregistrations) ||
        0,
      (!_.isEmpty(financialSummaryData) &&
        !_.isEmpty(financialSummaryData['financial']) &&
        financialSummaryData['financial'][0].refundsPartial) ||
        0,
      (!_.isEmpty(financialSummaryData) &&
        !_.isEmpty(financialSummaryData['shop']) &&
        financialSummaryData['shop'][0].refundedShop) ||
        0,
      (!_.isEmpty(financialSummaryData) &&
        !_.isEmpty(financialSummaryData['financial']) &&
        !_.isEmpty(financialSummaryData['shop']) &&
        Number(financialSummaryData['financial'][0].refundsDeregistrations) +
          Number(financialSummaryData['financial'][0].refundsPartial) +
          Number(financialSummaryData['shop'][0].refundedShop)) ||
        0,
    ],
    Pending: [
      (!_.isEmpty(financialSummaryData) &&
        !_.isEmpty(financialSummaryData['financial']) &&
        financialSummaryData['financial'][0].pendingInstalments) ||
        0,
      (!_.isEmpty(financialSummaryData) &&
        !_.isEmpty(financialSummaryData['financial']) &&
        financialSummaryData['financial'][0].pendingGovernmentVouchers) ||
        0,
      (!_.isEmpty(financialSummaryData) &&
        !_.isEmpty(financialSummaryData['financial']) &&
        financialSummaryData['financial'][0].pendingOwed) ||
        0,
      (!_.isEmpty(financialSummaryData) &&
        !_.isEmpty(financialSummaryData['financial']) &&
        Number(financialSummaryData['financial'][0].pendingInstalments) +
          Number(financialSummaryData['financial'][0].pendingGovernmentVouchers) +
          Number(financialSummaryData['financial'][0].pendingOwed)) ||
        0,
    ],
  };

  return (
    <div className="col-sm-6 col-md-6">
      <div className="financial-summary-card">
        <div className="financial-summary-card-title">{props.title}</div>
        <div className="financial-summary-card-content">
          <div className="financial-summary-card-line">
            <div className="reg-payment-paid-reg-text"> {CardTitle[props.title][0]} </div>
            <div className="financial-summary-price-text">
              {' '}
              {currencyFormat(CardData[props.title][0])}{' '}
            </div>
          </div>
          <div className="financial-summary-card-line">
            <div className="reg-payment-paid-reg-text"> {CardTitle[props.title][1]} </div>
            <div className="financial-summary-price-text">
              {' '}
              {currencyFormat(CardData[props.title][1])}{' '}
            </div>
          </div>
          <div className="financial-summary-card-line">
            <div className="reg-payment-paid-reg-text"> {CardTitle[props.title][2]} </div>
            <div className="financial-summary-price-text">
              {' '}
              {currencyFormat(CardData[props.title][2])}{' '}
            </div>
          </div>
          <div className="financial-summary-card-total">
            <div className="financial-summary-card-total-text">{CardTitle[props.title][3]}</div>
            <div className="financial-summary-card-total-price">
              {currencyFormat(CardData[props.title][3])}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

function mapStateToProps(state) {
  return {
    paymentState: state.StripeState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FinancialSummaryCard);
