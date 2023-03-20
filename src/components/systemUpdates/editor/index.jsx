import DashboardLayout from '../../../pages/dashboardLayout';
import AppConstants from '../../../themes/appConstants';
import InnerHorizontalMenu from '../../../pages/innerHorizontalMenu';
import { Form, Layout } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import IndexHeaderView from '../components/headerView';
import SystemUpdatesEditorContent from './content';
import SystemUpdatesEditorFooter from './footer';
import { convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { DEFAULT_GENERIC_TEMPLATE } from '../../websites/dashboard/constants';
import {
  createWebPageAction,
  getStrapiTokenAction,
} from '../../../store/actions/strapiAction/strapiAction';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../../util/history';
import { getOrganisationData } from '../../../util/sessionStorage';
import userHttpApi from '../../../store/http/userHttp/userAxiosApi';

const PLATFORM_ORGANISATION_ID = process.env.REACT_APP_PLATFORM_ORGANISATION_ID;

const SystemUpdatesEditor = () => {
  const dispatch = useDispatch();
  const formRef = useRef(null);

  const [websiteId, setWebsiteId] = useState(0);

  const strapiJWTToken = useSelector(state => state.StrapiReducerState.token);
  const loading = useSelector(state => state.StrapiReducerState.onLoad);
  const tokenLoading = useSelector(state => state.StrapiReducerState.tokenLoad);

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const organisationData = getOrganisationData();
  const { organisationUniqueKey } = organisationData;

  useEffect(() => {
    if (PLATFORM_ORGANISATION_ID !== organisationUniqueKey) {
      history.push('/systemUpdates');
    }
  }, []);

  useEffect(() => {
    if (!strapiJWTToken && !tokenLoading) {
      dispatch(getStrapiTokenAction());
    }
  }, [strapiJWTToken, tokenLoading]);

  useEffect(() => {
    if (!websiteId) {
      userHttpApi
        .organisationDetails({
          organisationUniqueKey: PLATFORM_ORGANISATION_ID,
        })
        .then(response => {
          const { result } = response;

          if (result && result.data && result.data.websiteId) {
            setWebsiteId(result.data.websiteId);
          }
        });
    }
  }, [websiteId]);

  // Redirect user to main page, if organisation has not allowed to create system updates
  useEffect(() => {
    if (organisationUniqueKey !== PLATFORM_ORGANISATION_ID) handleOnSwitchToListView();
  }, [organisationUniqueKey]);

  const handleOnSwitchToListView = () => {
    history.push('/systemUpdates');
  };

  const handleSave = () => {
    const formInputs = formRef.current.getFieldsValue();
    const pageDetails = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    let payload = {
      strapi_auth_token: strapiJWTToken,
      title: formInputs.updatePath,
      page_details: pageDetails,
      site: websiteId,
      publishedAt: new Date().toISOString(),
      is_active: true,
      page_template: DEFAULT_GENERIC_TEMPLATE,
    };

    dispatch(createWebPageAction(payload, handleOnSwitchToListView));
  };

  return (
    <div className="fluid-width default-bg  page-list">
      <DashboardLayout
        menuId={AppConstants.home_page_heading}
        menuHeading={AppConstants.home}
        menuName={AppConstants.home}
      />

      <InnerHorizontalMenu menu="home" userSelectedKey="3" />

      <Layout>
        <div className="fluid-width default-bg">
          <Layout>
            <Form ref={formRef} autoComplete="off" onFinish={handleSave}>
              <IndexHeaderView header={AppConstants.addUpdate} />
              <SystemUpdatesEditorContent
                handleEditorChange={setEditorState}
                editorState={editorState}
                loading={loading}
              />
              <SystemUpdatesEditorFooter loading={loading} onCancel={handleOnSwitchToListView} />
            </Form>
          </Layout>
        </div>
      </Layout>
    </div>
  );
};

export default SystemUpdatesEditor;
