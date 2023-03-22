import React, { Component } from 'react';
import { message } from 'antd';
import AppConstants from 'themes/appConstants';
import UserAxiosApi from 'store/http/userHttp/userAxiosApi';
import './index.css';
import { isNotNullAndUndefined } from 'util/helpers';
const OrganisationDisplayTemplate = {
  Venue: 1,
};
class OrganisationInfo extends React.Component {
  constructor(props) {
    super(props);
    this.api = this.props.API;
    this.state = {
      organisation: null,
    };
  }

  componentDidMount() {
    if (this.props.requestBody) {
      this.fetchData(this.props.requestBody);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { organisation } = this.state;
    return isNotNullAndUndefined(this.props.requestBody) && !isNotNullAndUndefined(organisation);
  }

  fetchData = async body => {
    let result = await UserAxiosApi[this.api](body);
    if (result.status === 1) {
      this.setState({ organisation: result.result.data });
    } else {
      message.error(AppConstants.somethingWentWrongErrorMsg);
      this.setState({ organisation: null });
    }
  };

  renderOrganisationInfo = () => {
    const { organisation } = this.state;
    if (!organisation) return null;
    let template = this.props.template;
    switch (template) {
      case OrganisationDisplayTemplate.Venue:
      default:
        return (
          <div className="row org-info">
            {' '}
            <div className="org-label">{AppConstants.venueManagedBy}:</div>{' '}
            <span className="org-value">{` ${organisation.name} - ${organisation.phoneNo}`}</span>
          </div>
        );
    }
  };

  render() {
    return this.renderOrganisationInfo();
  }
}

export default OrganisationInfo;
