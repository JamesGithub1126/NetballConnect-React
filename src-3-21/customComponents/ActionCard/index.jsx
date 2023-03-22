import React, { Component } from 'react';
import { Spin, message } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import './index.css';
import { ApiSource } from 'util/enums';
import CommonAxiosApi from 'store/http/commonHttp/commonAxiosApi';
import UserAxiosApi from 'store/http/userHttp/userAxiosApi';
import RegistrationApi from 'store/http/registrationHttp/registrationAxiosApi';
import history from 'util/history';
import AppConstants from 'themes/appConstants';
import StrapiAxiosApi from '../../store/http/strapiHttp/axiosApi';
import LiveScoreAxiosApi from '../../store/http/liveScoreHttp/liveScoreAxiosApi';

export default class ActionCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isApiNotProvided: false,
      hasError: false,
      data: this.props.value || '',
      loading: false,
    };
  }

  async componentDidMount() {
    let result = null;
    if (this.props.useStatic || !this.props.payload.organisationId) return;

    try {
      let request = RegistrationApi;
      if (!this.props.apiSource) {
        this.setState({ isApiNotProvided: true, hasError: true });
        return;
      }
      this.setState({ loading: true });
      switch (this.props.apiSource) {
        case ApiSource.Common:
          request = CommonAxiosApi;
          break;
        case ApiSource.User:
          request = UserAxiosApi;
          break;
        case ApiSource.LiveScore:
          request = LiveScoreAxiosApi;
          break;
        case ApiSource.Strapi:
          request = StrapiAxiosApi;
          break;
        default:
          break;
      }
      result = await request[this.props.api](this.props.payload);
      if (result.status === 1) {
        this.setState({ data: result.result.data.data, loading: false });
      } else {
        this.setState({ hasError: true, loading: false });
      }
    } catch (e) {
      this.setState({ data: null, hasError: true, loading: false });
      message.error({ key: 'errorkey', content: AppConstants.somethingWentWrong });
    }
  }

  onCardClicked = () => {
    if (this.props.path) {
      history.push({
        pathname: this.props.path,
        state: {
          ...this.props.payload,
        },
      });
    }
  };

  render() {
    const hasSubTitle = !!this.props.ActionSubTitle;
    return (
      <div className="action-card">
        <div className="action-card-header card-flex">
          <div className={`card-flex-main ${hasSubTitle ? '' : 'card-title-normal'}`}>
            {this.props.ActionTitle}
          </div>
        </div>
        <div className="action-card-body card-flex">
          <div className="card-flex-main">
            {this.state.loading ? (
              <Spin size="default" />
            ) : this.state.hasError ? (
              <CloseCircleOutlined style={{ color: 'red' }} />
            ) : this.props.renderContent ? (
              <div className="reg-payment-price-text">
                {this.props.renderContent(this.state.data)}
              </div>
            ) : (
              <div className="reg-payment-price-text">{this.state.data}</div>
            )}
          </div>
          {this.props.path ? (
            <div className="card-nav home-dash-white-box-view card-navigator">
              <div
                className="col-sm-2 d-flex align-items-center justify-content-end"
                onClick={this.onCardClicked}
              >
                <div className="view-more-btn pt-0 pointer ml-auto">
                  <i className="fa fa-angle-right" aria-hidden="true" />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {hasSubTitle ? (
          <div className="action-card-footer">
            <div className="card-flex-main">
              {typeof this.props.ActionSubTitle === 'string'
                ? this.props.ActionSubTitle
                : this.props.ActionSubTitle(this.state.data)}
            </div>
            <div className="card-flex-secondary"></div>
          </div>
        ) : null}
      </div>
    );
  }
}
