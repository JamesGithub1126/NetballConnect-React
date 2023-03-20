import React from 'react';
import { Layout, Breadcrumb } from 'antd';

const { Header } = Layout;

export class IndexHeaderView extends React.PureComponent {
  render = () => {
    const { header } = this.props;
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
}

export const EditHeaderView = ({ header, buttonGroup }) => {
  return (
    <div className="comp-player-grades-header-drop-down-view mt-4">
      <div className="row">
        <div className="col-sm" style={{ display: 'flex', alignContent: 'center' }}>
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">{header}</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <div className="col-sm head-btn-group">
          <div className="row">
            <div className="col-sm">
              <div className="comp-dashboard-botton-view-mobile head-btn-group">{buttonGroup}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
