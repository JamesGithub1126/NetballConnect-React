import React from 'react';
import InputWithHead from '../../../../../customComponents/InputWithHead';
import AppConstants from '../../../../../themes/appConstants';
import { Form } from 'antd';

const SiteSocialLinks = () => {
  return (
    <div>
      <div className="row">
        <div className="col-sm-6">
          <Form.Item name="siteFacebookLink" rules={[{ required: false }]}>
            <InputWithHead
              heading={AppConstants.siteFacebookLink}
              placeholder={AppConstants.siteFacebookLink}
              addonBefore={AppConstants.facebookPreTab}
            />
          </Form.Item>
        </div>
        <div className="col-sm-6">
          <Form.Item name="siteInstagramLink" rules={[{ required: false }]}>
            <InputWithHead
              heading={AppConstants.siteInstagramLink}
              placeholder={AppConstants.siteInstagramLink}
              addonBefore={AppConstants.instagramPreTab}
            />
          </Form.Item>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-6">
          <Form.Item name="siteTwitterLink" rules={[{ required: false }]}>
            <InputWithHead
              heading={AppConstants.siteTwitterLink}
              placeholder={AppConstants.siteTwitterLink}
              addonBefore={AppConstants.twitterPreTab}
            />
          </Form.Item>
        </div>
        <div className="col-sm-6">
          <Form.Item name="siteYoutubeLink" rules={[{ required: false }]}>
            <InputWithHead
              heading={AppConstants.siteYoutubeLink}
              placeholder={AppConstants.siteYoutubeLink}
              addonBefore={AppConstants.youtubePreTab}
            />
          </Form.Item>
        </div>
      </div>
    </div>
  );
};

export default SiteSocialLinks;
