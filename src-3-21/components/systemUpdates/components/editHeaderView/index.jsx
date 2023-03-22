import { Breadcrumb } from 'antd';
import React from 'react';
import '../../../competition/competition.css';

const EditHeaderView = ({ header, buttonGroup }) => {
  return (
    <div className="comp-player-grades-header-drop-down-view mt-4">
      <div className="row">
        <div className="col-sm-6" style={{ display: 'flex', alignContent: 'center' }}>
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">{header}</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <div className="col-sm-6 head-btn-group">
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

export default EditHeaderView;
