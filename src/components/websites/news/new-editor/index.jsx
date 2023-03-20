import React, { useCallback, useEffect, useRef, useState } from 'react';
import draftToHtml from 'draftjs-to-html';
import { ContentState, convertToRaw, EditorState } from 'draft-js';
import DashboardLayout from '../../../../pages/dashboardLayout';
import AppConstants from '../../../../themes/appConstants';
import InnerHorizontalMenu from '../../../../pages/innerHorizontalMenu';
import { MenuKey } from '../../../../util/enums';
import { Form, Layout } from 'antd';
import { IndexHeaderView } from '../../component/headerView';
import WebsiteNewsEditorFooter from './footer';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getOrganisationData } from '../../../../util/sessionStorage';
import {
  createPostAction,
  deletePostAction,
  getPostAction,
  getStrapiTokenAction,
  getWebsiteAction,
  updatePostAction,
} from '../../../../store/actions/strapiAction/strapiAction';
import history from '../../../../util/history';
import WebsiteNewsEditorContent from './content';
import { usePrevious } from '../../../../customHooks';
import { generatePostUrlFromTitle } from '../utils';
import htmlToDraft from 'html-to-draftjs';
import { draftJSEditorContent } from '../../utils';

const WebsiteNewsEditor = () => {
  const dispatch = useDispatch();

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [featuredImage, setFeaturedImage] = useState('');
  const { postId: postIdParam } = useParams();
  const formRef = useRef(null);

  const organisationData = getOrganisationData();
  const { websiteId } = organisationData;
  const postId = parseInt(postIdParam || '0');

  const previousPostId = usePrevious(postId);

  const strapiJWTToken = useSelector(state => state.StrapiReducerState.token);
  const postsLoading = useSelector(state => state.StrapiReducerState.onLoad);
  const tokenLoading = useSelector(state => state.StrapiReducerState.tokenLoad);
  const selectedPost = useSelector(state => state.StrapiReducerState.selectedPost);
  const websiteData = useSelector(state => state.StrapiReducerState.websiteData);
  const websiteDomain = websiteData.attributes && websiteData.attributes.domain;
  const defaultPostTitle = selectedPost.title;
  const defaultPostShortContent = selectedPost.short_content;
  const defaultPostBody = selectedPost.post_detail;
  const defaultFeaturedImage = selectedPost.featured_image;

  useEffect(() => {
    dispatch(getWebsiteAction(websiteId));
  }, []);

  useEffect(() => {
    if (defaultPostBody) {
      const blocksFromHTML = htmlToDraft(draftJSEditorContent(defaultPostBody))

      setEditorState(
        EditorState.createWithContent(
          ContentState.createFromBlockArray(
            blocksFromHTML.contentBlocks,
            blocksFromHTML.entityMap,
          ),
        ),
      );
    }
    if (defaultPostTitle) {
      formRef.current.setFieldsValue({
        postTitle: defaultPostTitle,
        postShortContent: defaultPostShortContent,
      });
    }

    if (defaultFeaturedImage) {
        setFeaturedImage(defaultFeaturedImage)
    }
  }, [defaultPostTitle, defaultPostBody, defaultPostShortContent]);

  useEffect(() => {
    if (!strapiJWTToken && !tokenLoading) {
      dispatch(getStrapiTokenAction());
    }

    if (postId && postId !== previousPostId) {
      dispatch(getPostAction(postId));
    }
  }, [strapiJWTToken, postId, previousPostId, tokenLoading, selectedPost]);

  const handleOnSwitchToListView = () => {
    history.push('/newsmanagement');
  };

  const handleDeleteClicked = () => {
    const data = {
      strapi_auth_token: strapiJWTToken,
    };

    dispatch(deletePostAction(postId, data, handleOnSwitchToListView));
  };

  const handleSave = () => {
    const formInputs = formRef.current.getFieldsValue();
    const postDetail = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    let payload = {
      strapi_auth_token: strapiJWTToken,
      title: formInputs.postTitle,
      short_content: formInputs.postShortContent,
      post_detail: postDetail,
      site: websiteId,
      is_active: true,
      featured_image: featuredImage,
      publishedAt: new Date().toISOString(),
    };

    if (!postId) {
      payload = {
        ...payload,
        url: generatePostUrlFromTitle(formInputs.postTitle),
      };

      dispatch(createPostAction(payload, handleOnSwitchToListView));
    } else {
      dispatch(updatePostAction(postId, payload, handleOnSwitchToListView));
    }
  };

  const handleUnpublishClicked = useCallback(() => {
    const payload = {
      strapi_auth_token: strapiJWTToken,
      publishedAt: null,
    };

    dispatch(updatePostAction(postId, payload, handleOnSwitchToListView));
  }, [postId, strapiJWTToken]);

  const showUnpublishButton = postId && selectedPost.publishedAt;

  return (
    <div className="fluid-width default-bg  page-list">
      <DashboardLayout menuHeading={AppConstants.websites} menuName={AppConstants.websites} />
      <InnerHorizontalMenu menu={MenuKey.Websites} userSelectedKey="2" />

      <Layout>
        <div className="fluid-width default-bg">
          <Layout>
            <Form ref={formRef} autoComplete="off" noValidate="noValidate" onFinish={handleSave}>
              <IndexHeaderView header={AppConstants.news} />

              <WebsiteNewsEditorContent
                loading={postsLoading}
                handleEditorChange={setEditorState}
                editorState={editorState}
                handleImageChange={setFeaturedImage}
                domain={websiteDomain}
                defaultFeaturedImage={defaultFeaturedImage}
              />
              <WebsiteNewsEditorFooter
                showUnpublishButton={showUnpublishButton}
                handleUnpublishClicked={handleUnpublishClicked}
                handleDeleteClicked={handleDeleteClicked}
                loading={postsLoading}
                postId={postId}
              />
            </Form>
          </Layout>
        </div>
      </Layout>
    </div>
  );
};

export default WebsiteNewsEditor;
