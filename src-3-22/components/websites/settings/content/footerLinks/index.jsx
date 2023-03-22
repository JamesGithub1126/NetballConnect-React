import React, { useCallback } from 'react';
import InputWithHead from '../../../../../customComponents/InputWithHead';
import AppConstants from '../../../../../themes/appConstants';
import { Form, Select } from 'antd';
import ValidationConstants from '../../../../../themes/validationConstant';
import { useSelector } from 'react-redux';
import { getRandomNumber } from '../../utils';

const SiteFooterLinks = ({ siteFooterLinks, updateFooterLinks }) => {
  const menuItems = useSelector(state => state.StrapiReducerState.menuItems.data);

  const removeFooterLink = item => {
    let index = siteFooterLinks.findIndex(f => f.id === item.id);
    if (index > -1) {
      siteFooterLinks.splice(index, 1);
      updateFooterLinks([...siteFooterLinks]);
    }
  };

  const addFooterLink = () => {
    siteFooterLinks.push({
      id: getRandomNumber(1000),
      title: '',
      site_menus: [],
    });
    updateFooterLinks([...siteFooterLinks]);
  };

  const handleChangeMenuLinks = (field, menuIDs, linkId) => {
    const updatedFooterLinks = siteFooterLinks.map(footerLink => {
      if (footerLink.id === linkId) {
        return {
          ...footerLink,
          [field]: menuIDs,
        };
      }

      return footerLink;
    });

    updateFooterLinks([...updatedFooterLinks]);
  };

  const menuItemOptions = useCallback(() => {
    return menuItems.map(menuItem => ({ value: menuItem.id, label: menuItem.attributes.name }));
  }, [menuItems]);

  const footerLinkView = item => {
    return (
      <div key={item.id} className="fluid-width mt-3">
        <div className="row">
          <div className="col-sm">
            <Form.Item
              name={`title_${item.id}`}
              rules={[{ required: true, message: ValidationConstants.pageEditValidateMessages[0] }]}
              initialValue={item.title}
            >
              <InputWithHead
                placeholder={AppConstants.siteFooterLinkTitle}
                onChange={e => handleChangeMenuLinks('title', e.target.value, item.id)}
              />
            </Form.Item>
          </div>
          <div className="col-sm">
            <Form.Item
              name={`page_${item.id}`}
              rules={[{ required: true, message: ValidationConstants.pageEditValidateMessages[4] }]}
              initialValue={item.site_menus}
            >
              <Select
                mode="multiple"
                className="division-age-select w-100"
                style={{ minWidth: 120 }}
                placeholder={AppConstants.siteFooterLinkPage}
                onChange={menuIDs => handleChangeMenuLinks('site_menus', menuIDs, item.id)}
              >
                {menuItemOptions().map(option => (
                  <Select.Option key={'menuItem_' + option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div className="col-sm-2 transfer-image-view" onClick={() => removeFooterLink(item)}>
            <a className="transfer-image-view">
              <span className="user-remove-btn">
                <i className="fa fa-trash-o" aria-hidden="true" />
              </span>
              <span className="user-remove-text mr-0">{AppConstants.remove}</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="inside-container-view pt-4">
      <InputWithHead heading={AppConstants.siteFooterLinks} />
      <div className="fluid-width mt-3">
        <div className="row">
          <div className="col-sm">
            <InputWithHead heading={AppConstants.siteFooterLinkTitle} required="required-field" />
          </div>
          <div className="col-sm">
            <InputWithHead heading={AppConstants.siteFooterLinkPage} required="required-field" />
          </div>
          <div className="col-sm-2 transfer-image-view">
            <a className="transfer-image-view">
              <span className="user-remove-btn" />
              <span className="user-remove-text mr-0" />
            </a>
          </div>
        </div>
      </div>
      {siteFooterLinks.map(item => footerLinkView(item))}
      <a>
        <span onClick={addFooterLink} className="input-heading-add-another">
          + {AppConstants.addLink}
        </span>
      </a>
    </div>
  );
};

export default SiteFooterLinks;
