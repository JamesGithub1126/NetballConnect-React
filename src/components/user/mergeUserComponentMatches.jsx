import React from 'react';
import AppConstants from '../../themes/appConstants';
import { Breadcrumb, Layout } from 'antd';
import DashboardLayout from '../../pages/dashboardLayout';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
const { Header, Footer, Content } = Layout;

const headerView = () => {
  return (
    <Header className="comp-player-grades-header-view container-fluid mb-n3">
      <div className="row">
        <div className="col-sm d-flex align-items-center align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.personalDetails}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
    </Header>
  );
};

export default function MergeUserMatches() {
  return (
    <div className="fluid-width default-bg">
      <DashboardLayout menuHeading={AppConstants.user} menuName={AppConstants.user} />
      <InnerHorizontalMenu menu="user" userSelectedKey="1" />
      {headerView()}
      <Layout className="live-score-player-profile-layout">
        <Content className="">
          <div className="fluid-width">
            <div className="row">
              <h5>User to Merge</h5>
            </div>
          </div>
        </Content>
      </Layout>
    </div>
  );
}
