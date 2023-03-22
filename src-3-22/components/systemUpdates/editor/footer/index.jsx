import React from 'react';
import { Button, Layout } from 'antd';
import AppConstants from '../../../../themes/appConstants';

const SystemUpdatesEditorFooter = ({ loading, onCancel }) => {
  return (
    <Layout.Footer>
      <div className="fluid-width footer-view">
        <div className="row">
          <div className="col-sm-4 mt-3">
            <div className="reg-add-save-button">
              <Button
                className="cancelBtnWidth mr-5"
                type="cancel-button"
                onClick={onCancel}
                loading={loading}
              >
                {AppConstants.cancel}
              </Button>
            </div>
          </div>
          <div className="col-sm mt-3">
            <div className="comp-finals-button-view">
              <Button
                className="publish-button margin-top-disabled-button"
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                {AppConstants.save}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout.Footer>
  );
};

export default SystemUpdatesEditorFooter;
