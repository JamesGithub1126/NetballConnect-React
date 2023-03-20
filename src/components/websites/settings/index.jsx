import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Form, Layout } from 'antd';
import AppConstants from '../../../themes/appConstants';
import DashboardLayout from '../../../pages/dashboardLayout';
import InnerHorizontalMenu from '../../../pages/innerHorizontalMenu';
import { MenuKey } from '../../../util/enums';
import WebsiteSettingsHeader from './header';
import WebsiteSettingsContent from './content';
import WebsiteSettingsFooter from './footer';
import { getOrganisationData } from '../../../util/sessionStorage';
import { useDispatch, useSelector } from 'react-redux';
import {
  getSiteSettingAction,
  getStrapiTokenAction,
  getWebsiteAction,
  updateSiteSettingAction,
} from '../../../store/actions/strapiAction/strapiAction';
import { getAffiliateOurOrganisationIdAction } from '../../../store/actions/userAction/userAction';
import { buildFooterMenusInitialState, removeSocialMediaDomains } from './utils';

const WebsiteSettingsPage = () => {
  const dispatch = useDispatch();

  const strapiJWTToken = useSelector(state => state.StrapiReducerState.token);
  const siteSettingLoading = useSelector(state => state.StrapiReducerState.onLoad);
  const tokenLoading = useSelector(state => state.StrapiReducerState.tokenLoad);
  const siteSetting = useSelector(state => state.StrapiReducerState.siteSetting);
  const websiteData = useSelector(state => state.StrapiReducerState.websiteData);
  const affliate = useSelector(state => state.UserState.affiliateOurOrg);
  const siteSettingId = siteSetting.id;
  const siteSettingLogo = siteSetting.logo;
  const siteSettingFavicon = siteSetting.favicon;
  const siteSettingFooterMenus = siteSetting.footer_menus;
  const siteSettingSecondaryLogo = siteSetting.secondary_logo;
  const websiteDomain = websiteData.attributes && websiteData.attributes.domain;

  const formRef = useRef(null);
  const [menuItemsState, setMenuItems] = useState(
    buildFooterMenusInitialState(siteSettingFooterMenus),
  );
  const [colorSettings, setColorSettings] = useState({});
  const [logo, setLogo] = useState('');
  const [footerLogo, setFooterLogo] = useState('');
  const [favicon, setFavicon] = useState('');

  const organisationData = getOrganisationData();
  const { websiteId, orgLogoUrl, name: orgName, organisationUniqueKey } = organisationData;

  useEffect(() => {
    if (!strapiJWTToken && !tokenLoading) {
      dispatch(getStrapiTokenAction());
    }
  }, [tokenLoading, strapiJWTToken]);

  useEffect(() => {
    if (siteSettingLogo) {
      setLogo(siteSettingLogo);
    }

    if (siteSettingFavicon) {
      setFavicon(siteSettingFavicon);
    }

    if (siteSettingSecondaryLogo) {
      setFooterLogo(siteSettingSecondaryLogo);
    }
  }, [siteSettingLogo, siteSettingFavicon, siteSettingSecondaryLogo]);

  useEffect(() => {
    window.scrollTo(0, 0);

    dispatch(
      getWebsiteAction(websiteId, (site, siteSettingsId) => {
        dispatch(getSiteSettingAction(siteSettingsId));
      }),
    );

    dispatch(getAffiliateOurOrganisationIdAction(organisationUniqueKey));
  }, []);

  useEffect(() => {
    if (siteSetting.id) {
      const footerContent = siteSetting.footer_content;
      const socialLinks = siteSetting.social_media_links;
      const defaultFooterContent = `${affliate.street1}\n${affliate.suburb} ${affliate.postalCode}`;
      const termsAndConditions = siteSetting.terms_and_conditions.data;
      const privacyPolicy = siteSetting.privacy_policy.data;

      formRef.current.setFieldsValue({
        siteTitle: siteSetting.title || orgName,
        footerTitle: footerContent && footerContent.title ? footerContent.title : orgName,
        footerContent:
          footerContent && footerContent.content ? footerContent.content : defaultFooterContent,
        footerCopyright: siteSetting.footer_copyright || `(c) ${orgName}. All Rights Reserved `,
        siteFacebookLink: socialLinks ? removeSocialMediaDomains(socialLinks.facebook) : '',
        siteInstagramLink: socialLinks ? removeSocialMediaDomains(socialLinks.instagram) : '',
        siteTwitterLink: socialLinks ? removeSocialMediaDomains(socialLinks.twitter) : '',
        siteYoutubeLink: socialLinks ? removeSocialMediaDomains(socialLinks.youtube) : '',
        footerTermsAndConditions: termsAndConditions ? termsAndConditions.id : null,
        footerPrivacyPolicy: privacyPolicy ? privacyPolicy.id : null,
      });

      setMenuItems(buildFooterMenusInitialState(siteSetting.footer_menus));
      setColorSettings(siteSetting.color_settings);
    }
  }, [siteSetting, affliate]);

  const handleSaveSettings = useCallback(() => {
    const formInputs = formRef.current.getFieldsValue();

    const updatingFields = {
      strapi_auth_token: strapiJWTToken,
      title: formInputs.siteTitle,
      footer_menus: menuItemsState.map(({ title, site_menus }) => ({ title, site_menus })),
      footer_content: {
        title: formInputs.footerTitle,
        content: formInputs.footerContent,
      },
      social_media_links: {
        facebook: formInputs.siteFacebookLink
          ? `${AppConstants.facebookPreTab}${formInputs.siteFacebookLink}`
          : '',
        instagram: formInputs.siteInstagramLink
          ? `${AppConstants.instagramPreTab}${formInputs.siteInstagramLink}`
          : '',
        twitter: formInputs.siteTwitterLink
          ? `${AppConstants.twitterPreTab}${formInputs.siteTwitterLink}`
          : '',
        youtube: formInputs.siteYoutubeLink
          ? `${AppConstants.youtubePreTab}${formInputs.siteYoutubeLink}`
          : '',
      },
      footer_copyright: formInputs.footerCopyright,
      color_settings: colorSettings,
      logo,
      favicon,
      secondary_logo: footerLogo,
      terms_and_conditions: formInputs.footerTermsAndConditions,
      privacy_policy: formInputs.footerPrivacyPolicy,
    };

    dispatch(
      updateSiteSettingAction(siteSettingId, updatingFields, siteSetting => {
        console.log('updated site setting::', siteSetting);
      }),
    );
  }, [strapiJWTToken, menuItemsState, colorSettings, siteSettingId, logo, favicon, footerLogo]);

  const handleImageChange = (url, type) => {
    if (type === 'logo') setLogo(url);
    if (type === 'favicon') setFavicon(url);
    if (type === 'footerLogo') setFooterLogo(url);
  };

  const handleUseOrgLogoClick = type => {
    if (orgLogoUrl) {
      if (type === 'logo') setLogo(orgLogoUrl);
      if (type === 'footerLogo') setFooterLogo(orgLogoUrl);
    }
  };

  const images = {
    logo,
    footerLogo,
    favicon,
  };

  return (
    <div className="fluid-width default-bg">
      <DashboardLayout menuHeading={AppConstants.websites} menuName={AppConstants.websites} />
      <InnerHorizontalMenu menu={MenuKey.Websites} userSelectedKey="3" />
      <Layout>
        <Form
          ref={formRef}
          autoComplete="off"
          noValidate="noValidate"
          onFinish={handleSaveSettings}
        >
          <WebsiteSettingsHeader />
          <WebsiteSettingsContent
            websiteId={websiteId}
            websiteDomain={websiteDomain}
            loading={siteSettingLoading || tokenLoading}
            menuItems={menuItemsState}
            setMenuItems={setMenuItems}
            colorSettings={colorSettings}
            setColorSettings={setColorSettings}
            handleImageChange={handleImageChange}
            handleUseOrgLogoClick={handleUseOrgLogoClick}
            {...images}
          />
          <WebsiteSettingsFooter loading={siteSettingLoading} />
        </Form>
      </Layout>
    </div>
  );
};

export default WebsiteSettingsPage;
