import React from 'react';
import { Breadcrumb } from 'antd';
import { Header } from 'antd/es/layout/layout';

const IndexHeaderView = ({ header }) => {
  return (
    <div className="header-view">
      <Header
        className="form-header-view"
        style={{
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Breadcrumb separator=" > ">
          <Breadcrumb.Item className="breadcrumb-add">{header}</Breadcrumb.Item>
        </Breadcrumb>
      </Header>
    </div>
  );
};

export default IndexHeaderView;
