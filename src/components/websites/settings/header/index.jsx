import React from 'react';
import { Breadcrumb, Layout } from 'antd';
import AppConstants from '../../../../themes/appConstants';

const WebsiteSettingsHeader = () => {
  return (
    <div className="header-view">
      <Layout.Header className="form-header-view d-flex bg-transparent align-items-center">
        <Breadcrumb separator="">
          <Breadcrumb.Item className="breadcrumb-add">{AppConstants.siteSettings}</Breadcrumb.Item>
        </Breadcrumb>
      </Layout.Header>
    </div>
  );
};

export default WebsiteSettingsHeader;
