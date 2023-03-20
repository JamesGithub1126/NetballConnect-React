import React, { useCallback } from 'react';
import '../../../website.scss';
import { useDispatch, useSelector } from 'react-redux';
import MenuListContent from './content';
import {
  getSiteMenusAction,
  resetSiteMenuFieldsAction,
} from '../../../../../store/actions/strapiAction/strapiAction';
import AppConstants from '../../../../../themes/appConstants';
import { Button } from 'antd';
import { EditHeaderView } from '../../../component/headerView';
import MenuListOrdering from './ordering';

const MenuItemsList = ({ editMenuItem, websiteId }) => {
  const dispatch = useDispatch();

  const menuItems = useSelector(state => state.StrapiReducerState.menuItems.data);
  const menuItemsPagination = useSelector(state => state.StrapiReducerState.menuItems.pagination);
  const loading = useSelector(state => state.StrapiReducerState.menuItems.onLoad);

  const buildMenuItemRow = menuItem => {
    const attrs = menuItem.attributes;
    const freshMenuItem = {
      id: menuItem.id,
      ...attrs,
    };

    if (attrs.web_page && attrs.web_page.data) {
      freshMenuItem.page = attrs.web_page.data.attributes.title;
    }

    if (attrs.parent_menu && attrs.parent_menu.data) {
      freshMenuItem.parentMenu = attrs.parent_menu.data.attributes.name;
    }

    freshMenuItem.status = attrs.is_active ? 'Published' : 'Unpublished';

    return freshMenuItem;
  };

  const getMenuItems = useCallback(() => {
    let menuItemsData = [];

    menuItems.forEach(menuItem => {
      menuItemsData.push(buildMenuItemRow(menuItem));

      const childMenus = menuItem.attributes.child_menus;
      if (childMenus && childMenus.data && childMenus.data.length) {
        childMenus.data.forEach(childMenu => {
          menuItemsData.push(buildMenuItemRow(childMenu));
        });
      }
    });

    return menuItemsData;
  }, [menuItems]);

  const handlePageChange = (page, pageSize) => {
    dispatch(getSiteMenusAction(websiteId, page, pageSize));
  };

  const handleOpenAddNewPage = menuItemId => {
    if (!menuItemId) {
      dispatch(resetSiteMenuFieldsAction());
    }

    editMenuItem(menuItemId);
  };

  return (
    <div className="fluid-width page-list mt-10">
      <EditHeaderView
        header={AppConstants.siteMenus}
        buttonGroup={
          <Button
            className="primary-add-comp-form"
            type="primary"
            onClick={() => handleOpenAddNewPage(0)}
          >
            + {AppConstants.addNew}
          </Button>
        }
      />

      <MenuListContent
        editMenuItem={handleOpenAddNewPage}
        loading={loading}
        data={getMenuItems()}
        handlePageChange={handlePageChange}
        pagination={menuItemsPagination}
      />
        <MenuListOrdering menuItems={menuItems} />
    </div>
  );
};

export default MenuItemsList;
