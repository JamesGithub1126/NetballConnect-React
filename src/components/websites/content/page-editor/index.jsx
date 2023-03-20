import React, { useCallback, useEffect, useRef, useState } from 'react';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import '../../website.scss';
import { Form, Layout } from 'antd';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import { IndexHeaderView } from '../../component/headerView';
import AppConstants from '../../../../themes/appConstants';
import WebsitePageEditorFooter from './footer';
import WebsitePageEditorContent from './content';
import { useDispatch, useSelector } from 'react-redux';
import {
  createWebPageAction,
  getStrapiTokenAction,
  getWebPageAction,
  updateWebPageAction,
  deleteWebPageAction,
} from '../../../../store/actions/strapiAction/strapiAction';
import DashboardLayout from '../../../../pages/dashboardLayout';
import InnerHorizontalMenu from '../../../../pages/innerHorizontalMenu';
import { MenuKey } from '../../../../util/enums';
import { useParams } from 'react-router-dom';
import { getOrganisationData } from '../../../../util/sessionStorage';
import history from '../../../../util/history';
import { usePrevious } from '../../../../customHooks';
import {
  buildIframeUrl,
  DEFAULT_CONTACT_TEMPLATE,
  DEFAULT_GENERIC_TEMPLATE,
  DEFAULT_HOME_TEMPLATE,
  DEFAULT_NEWS_TEMPLATE,
  generateIframeForm,
} from '../../dashboard/constants';
import { isArrayNotEmpty } from '../../../../util/helpers';
import { transformSlidersFormToSave } from './utils';
import { draftJSEditorContent } from '../../utils';

const WebsitePageEditor = () => {
  const dispatch = useDispatch();
  const { webPageId: webPageIdParam } = useParams();

  const strapiJWTToken = useSelector(state => state.StrapiReducerState.token);
  const webPagesLoading = useSelector(state => state.StrapiReducerState.onLoad);
  const tokenLoading = useSelector(state => state.StrapiReducerState.tokenLoad);
  const selectedWebPage = useSelector(state => state.StrapiReducerState.selectedWebPage);
  const defaultWebPageSliders = selectedWebPage.Sliders;

  const defaultWebPageTitle = selectedWebPage.title;
  const defaultWebPageTemplate = selectedWebPage.page_template.data;
  const defaultWebPageIFrame = selectedWebPage.iframe;
  const defaultWebPageIFrameTitle = selectedWebPage.iframe_title;
  const defaultWebPageIFrameUrl = selectedWebPage.url;
  const defaultWebPageLocation = selectedWebPage.location;
  const defaultWebPageEmail = selectedWebPage.email;
  const defaultWebPageAbn = selectedWebPage.abn;
  const defaultWebPagePhone = selectedWebPage.phone;
  const defaultWebPageBody = selectedWebPage.page_details;
  const defaultMapImage = selectedWebPage.map_image;
  const defaultBannerImage = selectedWebPage.banner && selectedWebPage.banner.image;
  const defaultBannerContent = selectedWebPage.banner && selectedWebPage.banner.content;
  const defaultFeaturedPosts =
    selectedWebPage.featured_posts && selectedWebPage.featured_posts.data;
  const formRef = useRef(null);

  const pageTemplateId = defaultWebPageTemplate && defaultWebPageTemplate.id;

  const organisationData = getOrganisationData();
  const { websiteId, organisationUniqueKey } = organisationData;

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [bannerEditorState, setBannerEditorState] = useState(EditorState.createEmpty());

  const initialSliderRow = [{featured_posts: {data: []}, image: ''}]
  const slidersDefaultValue = isArrayNotEmpty(defaultWebPageSliders) ? defaultWebPageSliders : initialSliderRow
  const [slidersState, setSliders] = useState(slidersDefaultValue)

  const [mapImage, setMapImage] = useState(defaultMapImage || '');
  const [bannerImage, setBannerImage] = useState(defaultBannerImage || '');
  const webPageId = parseInt(webPageIdParam || '0');

  const previousWebPageId = usePrevious(webPageId);

  useEffect(() => {
    if (defaultWebPageBody) {
      const blocksFromHTML = htmlToDraft(draftJSEditorContent(defaultWebPageBody));

      setEditorState(
        EditorState.createWithContent(
          ContentState.createFromBlockArray(
            blocksFromHTML.contentBlocks,
            blocksFromHTML.entityMap,
          ),
        ),
      );
    }

    if (defaultBannerContent) {
      const blocksFromHTML = htmlToDraft(draftJSEditorContent(defaultBannerContent));

      setBannerEditorState(
        EditorState.createWithContent(
          ContentState.createFromBlockArray(
            blocksFromHTML.contentBlocks,
            blocksFromHTML.entityMap,
          ),
        ),
      );
    }

    if (defaultWebPageTitle) {
      formRef.current.setFieldsValue({
        webPageTitle: defaultWebPageTitle,
        iframe: defaultWebPageIFrame,
        iframeTitle: defaultWebPageIFrameTitle,
        iframeUrl: defaultWebPageIFrameUrl,
        iframeCustomUrl: defaultWebPageLocation,
        location: defaultWebPageLocation,
        email: defaultWebPageEmail,
        abn: defaultWebPageAbn,
        phone: defaultWebPagePhone,
      });
    }

    if (isArrayNotEmpty(defaultWebPageSliders)) {
      setSliders(defaultWebPageSliders)
    }

    if (defaultBannerImage) {
      setBannerImage(defaultBannerImage)
    }

    if (defaultMapImage) {
      setMapImage(defaultMapImage)
    }
  }, [
    defaultWebPageTitle,
    defaultWebPageBody,
    defaultWebPageIFrame,
    defaultWebPageIFrameTitle,
    defaultBannerContent,
    defaultBannerImage,
    defaultFeaturedPosts,
    defaultWebPageLocation,
    defaultWebPageEmail,
    defaultWebPageAbn,
    defaultWebPagePhone,
    defaultMapImage,
    defaultWebPageSliders
  ]);

  useEffect(() => {
    if (!strapiJWTToken && !tokenLoading) {
      dispatch(getStrapiTokenAction());
    }

    if (webPageId && webPageId !== previousWebPageId) {
      dispatch(getWebPageAction(webPageId));
    }
  }, [strapiJWTToken, webPageId, previousWebPageId, selectedWebPage, tokenLoading]);

  const handleOnSwitchToListView = () => {
    history.push('/pagemanagement');
  };

  const handleSave = () => {
    const formInputs = formRef.current.getFieldsValue();
    const pageDetails = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    const bannerContent = draftToHtml(convertToRaw(bannerEditorState.getCurrentContent()));
    const { iframeUrl, iframeTitle, iframeCustomUrl, location, email, abn, phone } = formInputs;

    let payload = {
      strapi_auth_token: strapiJWTToken,
      title: formInputs.webPageTitle,
      iframe_title: iframeTitle,
      page_details: pageDetails,
      site: websiteId,
      map_image: mapImage,
      location,
      email,
      abn,
      phone,
      publishedAt: new Date().toISOString(),
    };

    if (bannerImage || bannerContent) {
      payload.is_banners = true;
      payload.banner = {
        image: bannerImage,
        content: bannerContent,
      };
    }

    if (slidersState || isArrayNotEmpty(slidersState)) {
      payload.is_sliders = true;
      payload.Sliders = transformSlidersFormToSave(slidersState);
    }

    if (iframeUrl) {
      payload.url = iframeUrl;
      // If iframe url is selected and NOT 'Custom' - generate IFrame based on our default settings
      if (iframeUrl !== 'Custom' && iframeTitle) {
        payload.iframe = buildIframeUrl(iframeTitle, iframeUrl, organisationUniqueKey, null);
      }

      // If iframe url is selected and it is 'Custom' - generate IFrame based user chosen custom url
      if (iframeUrl === 'Custom' && iframeCustomUrl && iframeTitle) {
        payload.location = iframeCustomUrl;
        payload.iframe = generateIframeForm(iframeCustomUrl, iframeTitle);
      }
    }

    if (!webPageId) {
      payload = {
        ...payload,
        is_active: true,
        email: null,
        abn: null,
        is_sliders: true,
        phone: '',
        featured_posts_title: '',
        page_template: DEFAULT_GENERIC_TEMPLATE,
      };

      dispatch(createWebPageAction(payload, handleOnSwitchToListView));
    } else {
      dispatch(updateWebPageAction(webPageId, payload, handleOnSwitchToListView));
    }
  };

  const handleUnpublishClicked = useCallback(() => {
    const payload = {
      strapi_auth_token: strapiJWTToken,
      publishedAt: null,
    };

    dispatch(updateWebPageAction(webPageId, payload, handleOnSwitchToListView));
  }, [webPageId, strapiJWTToken]);

  const handleDeleteClicked = () => {
    const data = {
      strapi_auth_token: strapiJWTToken,
    };

    dispatch(deleteWebPageAction(webPageId, data, handleOnSwitchToListView));
  };

  const showDeleteButton =
    webPageId &&
    pageTemplateId !== DEFAULT_HOME_TEMPLATE &&
    pageTemplateId !== DEFAULT_NEWS_TEMPLATE;
  const showUnpublishButton =
    (selectedWebPage.publishedAt && pageTemplateId === DEFAULT_GENERIC_TEMPLATE) ||
    pageTemplateId === DEFAULT_CONTACT_TEMPLATE;

  return (
    <div className="fluid-width default-bg  page-list">
      <DashboardLayout menuHeading={AppConstants.websites} menuName={AppConstants.websites} />
      <InnerHorizontalMenu menu={MenuKey.Websites} userSelectedKey="1" />

      <Layout>
        <div className="fluid-width default-bg">
          <Layout>
            <Form ref={formRef} autoComplete="off" noValidate="noValidate" onFinish={handleSave}>
              <IndexHeaderView header={AppConstants.page} />

              <WebsitePageEditorContent
                loading={webPagesLoading}
                handleEditorChange={setEditorState}
                editorState={editorState}
                bannerEditorState={bannerEditorState}
                handleBannerEditorChange={setBannerEditorState}
                defaultIFrameUrl={defaultWebPageIFrameUrl}
                pageTemplate={pageTemplateId}
                handleMapImageChange={setMapImage}
                defaultMapImage={defaultMapImage}
                handleBannerImageChange={setBannerImage}
                defaultBannerImage={defaultBannerImage}
                sliders={slidersState}
                setSliders={setSliders}
              />
              <WebsitePageEditorFooter
                showUnpublishButton={showUnpublishButton}
                showDeleteButton={showDeleteButton}
                handleDeleteClicked={handleDeleteClicked}
                handleUnpublishClicked={handleUnpublishClicked}
                loading={webPagesLoading}
                webPageId={webPageId}
              />
            </Form>
          </Layout>
        </div>
      </Layout>
    </div>
  );
};

export default WebsitePageEditor;
