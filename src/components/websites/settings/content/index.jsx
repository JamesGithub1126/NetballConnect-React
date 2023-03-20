import React, { useEffect } from 'react';
import { Button, Form, Layout } from 'antd';
import ValidationConstants from '../../../../themes/validationConstant';
import InputWithHead from '../../../../customComponents/InputWithHead';
import AppConstants from '../../../../themes/appConstants';
import ImagePicker from '../../component/imagePicker';
import ColorSettings from './colorSettings/index';
import Loader from '../../../../customComponents/loader';
import SiteFooterSettings from './footerSettings';
import SiteSocialLinks from './socialLinks';
import SiteFooterLinks from './footerLinks';
import MenuItemsList from './menu-list';
import history from '../../../../util/history';
import { useDispatch } from 'react-redux';
import {
  getSiteMenusAction,
  uploadImageAction,
} from '../../../../store/actions/strapiAction/strapiAction';
import { resizeFile } from '../../utils';

const LOGO_IMAGE_MAX_WIDTH = 85;
const LOGO_IMAGE_MAX_HEIGHT = 85;

const WebsiteSettingsContent = ({
  loading,
  menuItems,
  setMenuItems,
  colorSettings,
  setColorSettings,
  websiteId,
  websiteDomain,
  handleImageChange,
  handleUseOrgLogoClick,
  logo,
  footerLogo,
  favicon,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (websiteId) {
      dispatch(getSiteMenusAction(websiteId));
    }
  }, []);

  const handleSwitchToEditPage = siteMenuId => {
    history.push(`/sitemenus/${siteMenuId}`);
  };

  const handleUploadFile = type => async file => {
    let formattedFile = file;

    if (type === 'logo') {

      formattedFile = await resizeFile(file, LOGO_IMAGE_MAX_WIDTH, LOGO_IMAGE_MAX_HEIGHT);
    }

    const payload = {
      file: formattedFile,
      domain: websiteDomain,
    };

    dispatch(
      uploadImageAction(payload, url => {
        handleImageChange(url, type);
      }),
    );
  };

  return (
    <Layout.Content>
      <div className="tab-view">
        <div className="tab-formView mt-5">
          <div className="content-view pt-4">
            <InputWithHead heading={AppConstants.websiteUrl} />
            <div>
              <a
                className="user-reg-link"
                href={`${AppConstants.httpsProtocol}${websiteDomain}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {websiteDomain ? `${AppConstants.httpsProtocol}${websiteDomain}` : null}
              </a>
            </div>
            <Form.Item
              name="siteTitle"
              rules={[{ required: true, message: ValidationConstants.siteTitleIsRequired }]}
            >
              <InputWithHead
                auto_complete="off"
                required="required-field"
                heading={AppConstants.siteTitle}
                placeholder={AppConstants.siteTitle}
              />
            </Form.Item>

            <ImagePicker
              header={AppConstants.headerLogo}
              onImageSelect={handleUploadFile('logo')}
              imageSrc={logo}
              button={
                <Button
                  className="publish-button"
                  type="primary"
                  onClick={() => handleUseOrgLogoClick('logo')}
                >
                  {AppConstants.useOrganisationLogo}
                </Button>
              }
            />

            <ImagePicker
              header={AppConstants.footerLogo}
              onImageSelect={handleUploadFile('footerLogo')}
              imageSrc={footerLogo}
              button={
                <Button
                  className="publish-button"
                  type="primary"
                  onClick={() => handleUseOrgLogoClick('footerLogo')}
                >
                  {AppConstants.useOrganisationLogo}
                </Button>
              }
            />

            <ImagePicker
              header={AppConstants.favicon}
              onImageSelect={handleUploadFile('favicon')}
              imageSrc={favicon}
              checkFaviconResolution
              formatText={AppConstants.favicon_Image_Resolution}
            />
            <ColorSettings colorSettings={colorSettings} setColorSettings={setColorSettings} />
          </div>
        </div>
        <div className="tab-formView mt-5">
          <div className="content-view">
            <SiteFooterSettings />
            <SiteFooterLinks siteFooterLinks={menuItems} updateFooterLinks={setMenuItems} />
            <SiteSocialLinks />
          </div>
        </div>
        <div className="tab-formView mt-5">
          <div className="content-view">
            <MenuItemsList editMenuItem={handleSwitchToEditPage} websiteId={websiteId} />
          </div>
        </div>
      </div>
      <Loader visible={loading} />
    </Layout.Content>
  );
};

export default WebsiteSettingsContent;
