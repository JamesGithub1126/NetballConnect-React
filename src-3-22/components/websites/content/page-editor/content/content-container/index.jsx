import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Loader from '../../../../../../customComponents/loader';
import { Form, Layout, Select } from 'antd';
import ValidationConstants from '../../../../../../themes/validationConstant';
import InputWithHead from '../../../../../../customComponents/InputWithHead';
import AppConstants from '../../../../../../themes/appConstants';
import ContentBodyView from '../content-body-view';
import { EDITOR_PAGE_FIELDS, IFRAME_URL_LIST } from '../../contants';
import {
  getPostsAction,
  getWebsiteAction,
  uploadImageAction,
} from '../../../../../../store/actions/strapiAction/strapiAction';
import { useDispatch, useSelector } from 'react-redux';
import ImagePicker from '../../../../component/imagePicker';
import { getOrganisationData } from '../../../../../../util/sessionStorage';
import Sliders from '../content-slider';

const FormItemHOC = ({ children, show }) => (show ? children : <></>);

const PageEditorContainer = ({
  loading,
  sliders,
  setSliders,
  editorState,
  handleEditorChange,
  bannerEditorState,
  handleBannerEditorChange,
  defaultIFrameUrl,
  allowedFields,
  handleBannerImageChange,
  handleMapImageChange,
  defaultBannerImage,
  defaultMapImage,
}) => {
  const dispatch = useDispatch();
  const websiteData = useSelector(state => state.StrapiReducerState.websiteData);
  const posts = useSelector(state => state.StrapiReducerState.posts.data);

  const [iframeUrl, setIframeUrl] = useState(defaultIFrameUrl);

  const websiteDomain = websiteData.attributes && websiteData.attributes.domain;
  const organisationData = getOrganisationData();
  const { websiteId } = organisationData;

  useEffect(() => {
    if (allowedFields.includes(EDITOR_PAGE_FIELDS.sliders)) {
      dispatch(getPostsAction(websiteId, null, null, true));
    }
  }, [allowedFields]);

  useEffect(() => {
    dispatch(getWebsiteAction(websiteId));
  }, []);

  useEffect(() => {
    if (defaultIFrameUrl) setIframeUrl(defaultIFrameUrl);
  }, [defaultIFrameUrl]);

  const handleUploadImage = changeHandler => image => {
    const payload = {
      file: image,
      domain: websiteDomain,
    };

    dispatch(uploadImageAction(payload, changeHandler));
  };

  const postOptions = useCallback(() => {
    return posts.map(post => ({ value: post.id, label: post.attributes.title }));
  }, [posts]);

  const contentView = useMemo(() => {
    return (
      <div className="content-view pt-4">
        <FormItemHOC show={allowedFields.includes(EDITOR_PAGE_FIELDS.pageTitle)}>
          <Form.Item
            name={EDITOR_PAGE_FIELDS.pageTitle}
            rules={[{ required: true, message: ValidationConstants.pageEditValidateMessages[0] }]}
          >
            <InputWithHead
              auto_complete="off"
              required="required-field"
              heading={AppConstants.title}
              placeholder={AppConstants.title}
            />
          </Form.Item>
        </FormItemHOC>
        <div>&nbsp;</div>
        <FormItemHOC show={allowedFields.includes(EDITOR_PAGE_FIELDS.editorBody)}>
          <ContentBodyView
            websiteDomain={websiteDomain}
            editorState={editorState}
            handleEditorChange={handleEditorChange}
          />
        </FormItemHOC>
        <FormItemHOC show={allowedFields.includes(EDITOR_PAGE_FIELDS.sliders)}>
          <Sliders sliders={sliders} updateSliders={setSliders} websiteDomain={websiteDomain} />
        </FormItemHOC>
        <FormItemHOC show={allowedFields.includes(EDITOR_PAGE_FIELDS.location)}>
          <Form.Item name={EDITOR_PAGE_FIELDS.location}>
            <InputWithHead
              auto_complete="off"
              heading={AppConstants.location}
              placeholder={AppConstants.location}
            />
          </Form.Item>
        </FormItemHOC>
        <FormItemHOC show={allowedFields.includes(EDITOR_PAGE_FIELDS.email)}>
          <Form.Item name={EDITOR_PAGE_FIELDS.email}>
            <InputWithHead
              auto_complete="off"
              heading={AppConstants.email}
              placeholder={AppConstants.email}
            />
          </Form.Item>
        </FormItemHOC>
        <FormItemHOC show={allowedFields.includes(EDITOR_PAGE_FIELDS.abn)}>
          <Form.Item name={EDITOR_PAGE_FIELDS.abn}>
            <InputWithHead
              auto_complete="off"
              heading={AppConstants.abn}
              placeholder={AppConstants.abn}
            />
          </Form.Item>
        </FormItemHOC>
        <FormItemHOC show={allowedFields.includes(EDITOR_PAGE_FIELDS.phone)}>
          <Form.Item name={EDITOR_PAGE_FIELDS.phone}>
            <InputWithHead
              auto_complete="off"
              heading={AppConstants.phone}
              placeholder={AppConstants.phone}
            />
          </Form.Item>
        </FormItemHOC>
        <FormItemHOC show={allowedFields.includes(EDITOR_PAGE_FIELDS.mapImage)}>
          <ImagePicker
            header={AppConstants.mapImage}
            onImageSelect={handleUploadImage(handleMapImageChange)}
            imageSrc={defaultMapImage}
          />
        </FormItemHOC>

        <FormItemHOC show={allowedFields.includes(EDITOR_PAGE_FIELDS.bannerImage)}>
          <ImagePicker
            header={AppConstants.bannerImage}
            onImageSelect={handleUploadImage(handleBannerImageChange)}
            imageSrc={defaultBannerImage}
          />
        </FormItemHOC>
        <FormItemHOC show={allowedFields.includes(EDITOR_PAGE_FIELDS.bannerText)}>
          <ContentBodyView
            heading={AppConstants.bannerText}
            editorState={bannerEditorState}
            handleEditorChange={handleBannerEditorChange}
          />
        </FormItemHOC>

        <div className="row mt-10">
          <FormItemHOC show={allowedFields.includes(EDITOR_PAGE_FIELDS.iframeUrl)}>
            <div className="col-sm">
              <InputWithHead heading={AppConstants.iframeURL} />
              <Form.Item name={EDITOR_PAGE_FIELDS.iframeUrl}>
                <Select
                  className="division-age-select w-100"
                  style={{ minWidth: 120 }}
                  placeholder={AppConstants.iframeURL}
                  onChange={setIframeUrl}
                >
                  {IFRAME_URL_LIST.map(option => (
                    <Select.Option key={'iframeURLItem_' + option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </FormItemHOC>
          <FormItemHOC show={allowedFields.includes(EDITOR_PAGE_FIELDS.iframeTitle)}>
            <div className="col-sm">
              <Form.Item name={EDITOR_PAGE_FIELDS.iframeTitle}>
                <InputWithHead
                  auto_complete="off"
                  heading={AppConstants.iframeTitle}
                  placeholder={AppConstants.iframeTitle}
                />
              </Form.Item>
            </div>
          </FormItemHOC>
        </div>

        <FormItemHOC show={allowedFields.includes(EDITOR_PAGE_FIELDS.iframeTitle)}>
          {iframeUrl === 'Custom' ? (
            <div className="row">
              <div className="col-sm">
                <Form.Item name={EDITOR_PAGE_FIELDS.iframeCustomUrl}>
                  <InputWithHead
                    auto_complete="off"
                    heading={AppConstants.iframeCustomURL}
                    placeholder={AppConstants.iframeCustomURL}
                  />
                </Form.Item>
              </div>
            </div>
          ) : (
            <></>
          )}
        </FormItemHOC>
      </div>
    );
  }, [
    editorState,
    bannerEditorState,
    iframeUrl,
    allowedFields,
    defaultBannerImage,
    defaultMapImage,
    postOptions,
    sliders
  ]);

  return (
    <Layout.Content>
      <div className="tab-view">
        <div className="tab-formView mt-5">{contentView}</div>
      </div>
      <Loader visible={loading} />
    </Layout.Content>
  );
};

export default PageEditorContainer;
