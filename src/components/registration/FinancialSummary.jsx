import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Breadcrumb,
  Select,
} from 'antd';
import Loader from 'customComponents/loader';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import FinancialSummaryCard from 'customComponents/FinancialSummaryCard';
import {
  getFinancialSummaryAction,
  accountBalanceAction,
} from '../../store/actions/stripeAction/stripeAction';
import { getOnlyYearListAction } from 'store/actions/appAction';
import { getOrganisationData, getImpersonation } from '../../util/sessionStorage';
import { currencyFormat } from '../../util/currencyFormat';

const { Content } = Layout;
const { Option } = Select;

class FinancialSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      yearRefId: 1,
    };
  }

  async componentDidMount() {
    this.props.getOnlyYearListAction();
    await this.props.getFinancialSummaryAction(this.state.yearRefId);
    this.props.accountBalanceAction();
  }

  onChangeDropDownValue = async (value) => {
    this.setState({ yearRefId: value });
    await this.props.getFinancialSummaryAction(value);
  }

  stripeConnected = () => {
    let orgData = getOrganisationData() ? getOrganisationData() : null;
    let stripeAccountID = orgData ? orgData.stripeAccountID : null;
    return stripeAccountID;
  };

  headerView = () => {
    const stripeConnected = this.stripeConnected();
    const accountBalance = this.props.stripeState.accountBalance ? this.props.stripeState.accountBalance.pending : "N/A";

    return (
      <div className="comp-player-grades-header-view-design" style={{ marginBottom: -10 }}>
        <div className="row">
          <div className="col-lg-8 col-md-8 d-flex align-items-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.financialSummary}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="col-lg-4 col-md-4 d-flex flex-row align-items-center justify-content-end">
            <span className="reg-payment-price-text">{stripeConnected ? currencyFormat(accountBalance) : null}</span>
          </div>
        </div>
      </div>
    )
  };

  contentView = () => {
    return (
      <div className="comp-dash-table-view mt-2">
        <div>
          <div className="row">
            <div className="col-lg-3 col-md-4 col-sm-6 financial-summary-year-filter">
              <div className="financial-summary-year-select-heading" style={{ marginRight: 35 }}>{AppConstants.year}</div>
              <Select
                className="financial-summary-year-select"
                name="yearRefId"
                onChange={yearRefId => this.onChangeDropDownValue(yearRefId)}
                value={this.state.yearRefId}
              >
                {this.props.appState.yearList.map(item => (
                  <Option key={`year_${item.id}`} value={item.id}>
                    {item.description}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="row">
            <FinancialSummaryCard title={AppConstants.sales} />
            <FinancialSummaryCard title={AppConstants.settlements} />
            <FinancialSummaryCard title={AppConstants.refunds} />
            <FinancialSummaryCard title={AppConstants.pending} />
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.finance} menuName={AppConstants.finance} />
        <InnerHorizontalMenu menu="finance" finSelectedKey="7" />
        <Loader visible={false} />
        <Layout>
          {this.headerView()}
          <Content>{this.contentView()}</Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getFinancialSummaryAction,
      getOnlyYearListAction,
      accountBalanceAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    stripeState: state.StripeState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FinancialSummary);
