import React from 'react';
import { Button, Layout } from 'antd';
import AppConstants from '../../../../../themes/appConstants';

const MenuListEditorFooter = ({
  handleDeleteClicked,
  handleUnpublishClicked,
  loading,
  showDeleteButton,
  showUnpublishButton,
}) => {
  return (
    <Layout.Footer>
      <div className="fluid-width footer-view">
        <div className="row">
          <div className="col-sm-4 mt-3">
            <div className="reg-add-save-button">
              {showDeleteButton ? (
                <Button
                  className="cancelBtnWidth mr-5"
                  type="cancel-button"
                  onClick={handleDeleteClicked}
                  loading={loading}
                >
                  {AppConstants.delete}
                </Button>
              ) : null}
              {showUnpublishButton ? (
                <Button
                  type="cancel-button"
                  onClick={handleUnpublishClicked}
                  loading={loading}
                >
                  {AppConstants.unpublishButton}
                </Button>
              ) : null}
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
                {AppConstants.publish}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout.Footer>
  );
};

export default MenuListEditorFooter;
