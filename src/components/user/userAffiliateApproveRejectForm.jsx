import React, { Component } from 'react';
import { Layout, Select, Button, Breadcrumb } from 'antd';
import './user.css';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import HeadDescription from '../../customComponents/headDescription';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';

const { Header, Footer, Content } = Layout;
const { Option } = Select;

class UserAffiliateApproveRejectForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organisationType: 'club',
      affiliatedTo: 'peninsulaNetballAssociation',
    };
  }

  headerView = () => {
    return (
      <Header className="user-affiliate-header-view">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.affiliateApproveReject}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </Header>
    );
  };

  contentView = () => {
    return (
      <div className="user-affilite-approve-reject-form-view mt-0">
        {this.dropDownView()}
        <div className="row">
          <div className="col-sm">
            <div className="user-affiliate-column-form-view">{this.currentView()}</div>
          </div>
          <div className="col-sm">
            <div className="user-affiliate-column-form-view">{this.pendingView()}</div>
          </div>
        </div>
      </div>
    );
  };

  //////dropDownView for the top of the form
  dropDownView = () => {
    return (
      <div className="user-affiliate-dropdown-view">
        <div className="w-100 d-flex flex-row align-items-center" style={{ marginLeft: 7 }}>
          <span className="year-select-heading">{AppConstants.organisationType}</span>
          <Select
            className="year-select"
            // style={{ width: 75 }}
            onChange={organisationType => this.setState({ organisationType })}
            value={this.state.organisationType}
          >
            <Option value="club">{AppConstants.club}</Option>
          </Select>
        </div>

        <div className="w-100 d-flex flex-row align-items-center" style={{ marginLeft: 7 }}>
          <span className="year-select-heading">{AppConstants.affiliatedTo}</span>
          <Select
            className="year-select"
            // style={{ width: 75 }}
            onChange={affiliatedTo => this.setState({ affiliatedTo })}
            value={this.state.affiliatedTo}
          >
            <Option value="peninsulaNetballAssociation">{AppConstants.deprecated}</Option>
          </Select>
        </div>
      </div>
    );
  };

  //////currentView for first column in the screen
  currentView = () => {
    return (
      <div>
        <span className="form-heading">{AppConstants.current}</span>
        <div className="inside-container-view">
          <HeadDescription heading={AppConstants.name} desc={'Collaroy Netball Club'} />
          <HeadDescription heading={AppConstants.address} desc={'Abott Road Curl Curl'} />
          <HeadDescription heading={AppConstants.phoneNumber} desc={'02 9876 5432'} />
        </div>
        <div className="user-affiliate-contacts-text-view">
          <span className="user-affiliate-contacts-text">{AppConstants.contacts}</span>
        </div>
      </div>
    );
  };

  /////pendingView for second column in the screen
  pendingView = () => {
    return (
      <div>
        <span className="form-heading">{AppConstants.pendingForApproval}</span>
        <div className="inside-container-view">
          <HeadDescription heading={AppConstants.name} desc={'Collaroy Netball Club'} />
          <HeadDescription heading={AppConstants.address} desc={'Abott Road Curl Curl'} />
          <HeadDescription heading={AppConstants.phoneNumber} desc={'02 9876 5432'} />
        </div>
        <div className="user-affiliate-contacts-text-view">
          <span className="user-affiliate-contacts-text">{AppConstants.contacts}</span>
        </div>
      </div>
    );
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    return (
      <div className="fluid-width">
        <div className="footer-view">
          <div className="row">
            <div className="col-sm-3">
              <div className="reg-add-save-button">
                <Button type="cancel-button">Cancel</Button>
              </div>
            </div>
            <div className="col-sm-9">
              <div className="comp-buttons-view">
                <Button className="save-draft-text" type="save-draft-text">
                  Reject
                </Button>
                <Button className="open-reg-button" type="primary">
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="container-fluid default-bg">
        <DashboardLayout menuHeading={AppConstants.user} menuName={AppConstants.user} />
        <InnerHorizontalMenu menu="user" userSelectedKey="3" />
        <Layout>
          {this.headerView()}
          <Content>{this.contentView()}</Content>
          <Footer>{this.footerView()}</Footer>
        </Layout>
      </div>
    );
  }
}

export default UserAffiliateApproveRejectForm;
