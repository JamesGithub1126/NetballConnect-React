import React from 'react';
import { Button, Layout } from 'antd';
import AppConstants from '../../../../themes/appConstants';

const WebsiteSettingsFooter = ({ loading }) => {
  return (
    <Layout.Footer>
      <div className="fluid-width footer-view">
        <div className="row">
          <div className="col-sm-3 mt-3">
            <div className="reg-add-save-button">
              {/*  <Button className="cancelBtnWidth" type="cancel-button">
                {AppConstants.delete}
              </Button> */}
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

export default WebsiteSettingsFooter;
