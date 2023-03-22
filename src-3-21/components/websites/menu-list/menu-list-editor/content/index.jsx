import React, { useCallback, useState } from 'react';
import { Radio, Select } from 'antd';
import { Form, Layout } from 'antd';
import ValidationConstants from '../../../../../themes/validationConstant';
import InputWithHead from '../../../../../customComponents/InputWithHead';
import AppConstants from '../../../../../themes/appConstants';
import Loader from '../../../../../customComponents/loader';

const MenuListEditorContent = ({
  menuItems,
  webPages,
  disablePageAndUrlFields,
  handleChangePageSelect,
  loading,
}) => {
  const parentMenuOptions = useCallback(() => {
    return menuItems.map(menuItem => ({ value: menuItem.id, label: menuItem.attributes.name }));
  }, [menuItems]);

  const webPageOptions = useCallback(() => {
    return webPages.map(webPage => ({ value: webPage.id, label: webPage.attributes.title }));
  }, [webPages]);

  return (
    <Layout.Content>
      <div className="tab-view">
        <div className="tab-formView mt-25">
          <div className="content-view pt-4">
            <Form.Item
              name="menuName"
              rules={[{ required: true, message: ValidationConstants.pageEditValidateMessages[5] }]}
            >
              <InputWithHead
                auto_complete="off"
                required="required-field"
                heading={AppConstants.name}
                placeholder={AppConstants.name}
              />
            </Form.Item>

            <div className="row">
              <div className="col-sm-6">
                <InputWithHead heading={AppConstants.siteMenuPage} />
                <Form.Item name="page">
                  <Select
                    className="division-age-select w-100"
                    style={{ minWidth: 120 }}
                    placeholder={AppConstants.siteFooterLinkPage}
                    disabled={disablePageAndUrlFields}
                    onChange={pageId => {
                      let title = '';
                      const page = webPages.find(page => page.id === pageId);

                      if (page && page.attributes.title) {
                        title = page.attributes.title;
                      }

                      handleChangePageSelect(title);
                    }}
                  >
                    {webPageOptions().map(option => (
                      <Select.Option key={'webPageItem_' + option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="col-sm-6">
                <InputWithHead heading={AppConstants.url} />
                <Form.Item name="url">
                  <InputWithHead
                    auto_complete="off"
                    required="required-field"
                    placeholder={AppConstants.siteMenuUrl}
                    disabled={disablePageAndUrlFields}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12">
                <InputWithHead heading={AppConstants.parentMenu} />
                <Form.Item name="parentMenu">
                  <Select
                    className="division-age-select w-100"
                    style={{ minWidth: 120 }}
                    placeholder={AppConstants.selectParentMenu}
                  >
                    {parentMenuOptions().map(option => (
                      <Select.Option key={'parentMenuItem_' + option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Loader visible={loading} />
    </Layout.Content>
  );
};

export default MenuListEditorContent;
