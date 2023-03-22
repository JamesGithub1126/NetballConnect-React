import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import React, { useCallback, useEffect, useRef } from 'react';
import { getOrganisationData } from '../../../../util/sessionStorage';
import {
  createSiteMenuAction,
  deleteSiteMenuAction,
  getSiteMenuAction,
  getSiteMenusAction,
  getStrapiTokenAction,
  getWebPagesAction,
  updateSiteMenuAction,
} from '../../../../store/actions/strapiAction/strapiAction';
import history from '../../../../util/history';
import DashboardLayout from '../../../../pages/dashboardLayout';
import AppConstants from '../../../../themes/appConstants';
import { Form, Layout } from 'antd';
import { IndexHeaderView } from '../../component/headerView';
import MenuListEditorContent from './content';
import MenuListEditorFooter from './footer';
import { usePrevious } from '../../../../customHooks';
import { DEFAULT_GENERIC_TEMPLATE } from '../../dashboard/constants';
import { generatePostUrlFromTitle } from '../../news/utils';

const MenuListEditor = () => {
  const dispatch = useDispatch();
  const { menuItemId: menuItemIdParam } = useParams();

  const strapiJWTToken = useSelector(state => state.StrapiReducerState.token);
  const loading = useSelector(state => state.StrapiReducerState.onLoad);
  const tokenLoading = useSelector(state => state.StrapiReducerState.tokenLoad);
  const menuItems = useSelector(state => state.StrapiReducerState.menuItems.data);
  const webPages = useSelector(state => state.StrapiReducerState.webPages.data);
  const selectedMenuItem = useSelector(state => state.StrapiReducerState.selectedMenuItem);
  const formRef = useRef(null);

  const organisationData = getOrganisationData();
  const { websiteId } = organisationData;

  const menuItemId = parseInt(menuItemIdParam || '0');
  const previousMenuItemId = usePrevious(menuItemId);

  useEffect(() => {
      dispatch(getSiteMenusAction(websiteId, null, null, true));
      dispatch(getWebPagesAction(websiteId, null, null, true));
  }, []);

  useEffect(() => {
    if (selectedMenuItem.id) {
      const page = selectedMenuItem.web_page.data;
      const parentMenu = selectedMenuItem.parent_menu.data;

      formRef.current.setFieldsValue({
        menuName: selectedMenuItem.name,
        page: page ? page.id : null,
        url: selectedMenuItem.url,
        parentMenu: parentMenu ? parentMenu.id : null,
      });
    }
  }, [selectedMenuItem]);

  useEffect(() => {
    if (!strapiJWTToken && !tokenLoading) {
      dispatch(getStrapiTokenAction());
    }

    if (menuItemId && menuItemId !== previousMenuItemId) {
      dispatch(getSiteMenuAction(menuItemId));
    }
  }, [strapiJWTToken, menuItemId, selectedMenuItem, previousMenuItemId, tokenLoading]);

  const handleOnSwitchToSettingsView = () => {
    history.push('/websitesettings');
  };

  const handleSave = useCallback(() => {
    const formInputs = formRef.current.getFieldsValue();
    const { url, menuName, page, parentMenu } = formInputs;

    let payload = {
      strapi_auth_token: strapiJWTToken,
      name: menuName,
      url: !url ? '/' : url,
      web_page: page,
      parent_menu: parentMenu,
      is_active: true,
      publishedAt: new Date().toISOString(),
    };

    if (!menuItemId) {
      payload = {
        ...payload,
        page_template: DEFAULT_GENERIC_TEMPLATE,
        menu_type: 'header',
        site: websiteId,
        menu_order: menuItems.length
      };

      dispatch(createSiteMenuAction(payload, handleOnSwitchToSettingsView));
    } else {
      dispatch(updateSiteMenuAction(menuItemId, payload, handleOnSwitchToSettingsView));
    }
  }, [websiteId, menuItemId, strapiJWTToken, menuItems]);

  const handleUnpublishClicked = useCallback(() => {
    const payload = {
      strapi_auth_token: strapiJWTToken,
      publishedAt: null,
    };

    dispatch(updateSiteMenuAction(menuItemId, payload, handleOnSwitchToSettingsView));
  }, [menuItemId, strapiJWTToken]);

  const handleDeleteClicked = useCallback(() => {
    const data = {
      strapi_auth_token: strapiJWTToken,
    };

    dispatch(deleteSiteMenuAction(menuItemId, data, handleOnSwitchToSettingsView));
  }, [menuItemId, strapiJWTToken]);

  const handleChangePageSelect = page => {
    formRef.current.setFieldsValue({
      url: generatePostUrlFromTitle(page, '/'),
    });
  };

  const pageTemplate = selectedMenuItem.page_template;
  const pageTemplateIsGeneric = pageTemplate && pageTemplate.data.id === DEFAULT_GENERIC_TEMPLATE;
  const showDeleteButton = menuItemId && pageTemplateIsGeneric;
  const disablePageAndUrlFields = menuItemId && !pageTemplateIsGeneric;

  const showUnpublishButton = menuItemId && selectedMenuItem.publishedAt;

  return (
    <div className="fluid-width default-bg  page-list">
      <DashboardLayout menuHeading={AppConstants.websites} menuName={AppConstants.websites} />

      <Layout>
        <div className="fluid-width default-bg">
          <Layout>
            <Form ref={formRef} autoComplete="off" noValidate="noValidate" onFinish={handleSave}>
              <IndexHeaderView header={AppConstants.siteMenus} />
              <MenuListEditorContent
                menuItems={menuItems}
                webPages={webPages}
                disablePageAndUrlFields={disablePageAndUrlFields}
                handleChangePageSelect={handleChangePageSelect}
                loading={loading}
              />
              <MenuListEditorFooter
                showDeleteButton={showDeleteButton}
                showUnpublishButton={showUnpublishButton}
                handleDeleteClicked={handleDeleteClicked}
                handleUnpublishClicked={handleUnpublishClicked}
                loading={loading}
                menuItemId={menuItemId}
              />
            </Form>
          </Layout>
        </div>
      </Layout>
    </div>
  );
};
export default MenuListEditor;
