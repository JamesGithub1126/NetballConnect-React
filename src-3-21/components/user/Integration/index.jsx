import React from 'react';
import { Checkbox } from 'antd';
import AppConstants from '../../../themes/appConstants';
import './style.css';
import { handleError } from 'util/messageHandler';
import CommonAxiosApi from 'store/http/commonHttp/commonAxiosApi';
import UserAxiosApi from 'store/http/userHttp/userAxiosApi';
import { getOrganisationData } from 'util/sessionStorage';
import history from '../../../util/history';
import { ErrorType } from 'util/enums';
import Loader from '../../../customComponents/loader';
import { isArrayNotEmpty } from 'util/helpers';
export default class Integration extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      orgIntegrations: [],
      IntegrationTypeList: [],
      isRestricted: false,
      loading: false,
      refLoading: false,
    };
    let org = getOrganisationData();
    this.stripeConnectAccount = org?.stripeAccountID;
    this.stripeWithdrawalAccount = org?.stripeCustomerAccountId;

    this.initializedForm = false;
  }

  async componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    this.fetch();
    this.referenceCall();
  }

  fetch = async () => {
    try {
      await this.setState({ loading: true })
      const result = await UserAxiosApi.integrationsByOrganisationId(
        getOrganisationData()?.organisationUniqueKey,
      );

      if (result.status === 1) {
        const data = result.result.data || {};
        const updated = {
          isRestricted: data.organisation.isRestricted,
          orgIntegrations: data.orgIntegrations || [],
        }
        this.setState(updated, () => {
          const { IntegrationTypeList } = this.state;
          this.initialCheckbox(IntegrationTypeList, data.orgIntegrations);
        });
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    } finally {
      await this.setState({ loading: false })
    }
  };

  referenceCall = async () => {
    try {
      this.setState({ refLoading: true });
      const result = await CommonAxiosApi.getGenericCommanData({
        IntegrationType: 'IntegrationType',
      });
      if (result.status === 1) {
        console.log(result.result.data);
        let IntegrationTypeList = result.result.data.IntegrationType;
        if (!isArrayNotEmpty(IntegrationTypeList)) {
          IntegrationTypeList = [];
        }
        this.setState({ IntegrationTypeList }, () => {
          const { orgIntegrations } = this.state;
          this.initialCheckbox(IntegrationTypeList, orgIntegrations);
        });
        if (IntegrationTypeList.length && this.props.toggleButton) {
          this.props.toggleButton(true);
        }
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
    this.setState({ refLoading: false });
  };

  componentWillReceiveProps(nextProps) {}

  //#region method
  getFormValues = () => {
    const { IntegrationTypeList } = this.state;
    let selectedIntegrations = [];
    for (let integration of IntegrationTypeList) {
      if (integration.checked) {
        selectedIntegrations.push(integration.id);
      }
    }
    return { values: selectedIntegrations };
  };

  submit = async () => {
    const { loading } = this.state;
    if (loading) return;
    let formResult = this.getFormValues();
    let values = formResult.values;
    let formBody = {
      integrationTypes: JSON.stringify(values),
      organisationUniqueKey: getOrganisationData()?.organisationUniqueKey,
      isRestricted: this.state.isRestricted,
    };
    this.setState({ loading: true });
    try {
      let result = await UserAxiosApi.saveIntegrations(formBody);

      if (result.status === 1) {
        history.push('/userAffiliatesList');
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
    this.setState({ loading: false });
  };

  initialCheckbox = (integrationRefs, orgIntegrations) => {
    if (!integrationRefs.length || !orgIntegrations.length) {
      return;
    }
    for (let orgIntegration of orgIntegrations) {
      let integrationRef = integrationRefs.find(
        item => item.id == orgIntegration.integrationTypeRefId,
      );
      if (integrationRef) {
        integrationRef.checked = true;
      }
    }
    this.setState({ IntegrationTypeList: [...integrationRefs] });
  };

  //#endregion

  //#region  event
  onChange = (id, e) => {
    const { IntegrationTypeList } = this.state;
    let item = IntegrationTypeList.find(i => i.id == id);
    if (item) {
      item.checked = e.target.checked;
      this.setState({ IntegrationTypeList: [...IntegrationTypeList] });
    }
  };
  //#endregion

  render() {
    const { IntegrationTypeList, loading, refLoading } = this.state;
    let showLoading = false;
    if (loading) {
      showLoading = true;
    }
    if (refLoading) {
      showLoading = true;
    }
    return (
      <>
        <div className="tab-formView mt-5">
          <div className="fees-view pt-5">
            <span className="form-heading">{AppConstants.paymentGateway}</span>
            <div className="card-info">
              <div className="info-label">{AppConstants.stripeConnectAccount}</div>
              <div className="info-value">
                {this.stripeConnectAccount ? (
                  this.stripeConnectAccount
                ) : (
                  <span>{AppConstants.setupStripeConnectAccount}</span>
                )}
              </div>
              <Checkbox
                className="simple-checkbox mt-1"
                checked={this.state.isRestricted}
                onChange={e => this.setState({ isRestricted: e.target.checked })}
              >
                {AppConstants.restrictedOrganisation}
              </Checkbox>
            </div>
            <div className="card-info card-info-line">
              <div className="info-label">{AppConstants.stripeWithdrawalAccount}</div>
              <div className="info-value">
                {this.stripeWithdrawalAccount ? (
                  this.stripeWithdrawalAccount
                ) : (
                  <span>{AppConstants.setupStripeWithdrawalsAccount}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        {IntegrationTypeList.length ? (
          <div className="tab-formView mt-5">
            <div className="fees-view pt-5">
              <span className="form-heading">{AppConstants.integrations}</span>
              <div className="card-info card-info-line">
                <div className="info-label">{AppConstants.enableIntegrationWith}</div>
                <div className="info-value">
                  {IntegrationTypeList.map(item => (
                    <div>
                      {' '}
                      <Checkbox
                        key={item.id}
                        checked={item.checked}
                        onChange={this.onChange.bind(this, item.id)}
                      >
                        {item.description}
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <Loader visible={showLoading} />
      </>
    );
  }
}
