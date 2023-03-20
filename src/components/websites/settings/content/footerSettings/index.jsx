import React, { useCallback, useEffect } from 'react';
import { Form, Input, Select } from 'antd';
import InputWithHead from '../../../../../customComponents/InputWithHead';
import AppConstants from '../../../../../themes/appConstants';
import { getOrganisationData } from '../../../../../util/sessionStorage';
import { getWebPagesAction } from '../../../../../store/actions/strapiAction/strapiAction';
import { useDispatch, useSelector } from 'react-redux';

const SiteFooterSettings = () => {
  const dispatch = useDispatch();

  const webPages = useSelector(state => state.StrapiReducerState.webPages.data);
  const webPagesLoaded = useSelector(state => state.StrapiReducerState.webPages.loaded);
  const organisationData = getOrganisationData();
  const { websiteId } = organisationData;

  useEffect(() => {
    if (!webPages.length && !webPagesLoaded) {
      dispatch(getWebPagesAction(websiteId, null, null, true));
    }
  }, [webPages, webPagesLoaded]);

  const webPageOptions = useCallback(() => {
    return webPages.map(page => ({ value: page.id, label: page.attributes.title }));
  }, [webPages]);

  return (
    <div>
      <span className="text-heading-large">{AppConstants.siteFooterSettings}</span>
      <div className="row">
        <div className="col-sm-6">
          <Form.Item name="footerTitle">
            <InputWithHead
              auto_complete="off"
              heading={AppConstants.siteFooterTitle}
              placeholder={AppConstants.siteFooterTitle}
            />
          </Form.Item>
        </div>
        <div className="col-sm-6">
          <Form.Item name="footerCopyright">
            <InputWithHead
              auto_complete="off"
              heading={AppConstants.siteFooterCopyright}
              placeholder={AppConstants.siteFooterCopyright}
            />
          </Form.Item>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <InputWithHead heading={AppConstants.siteFooterContent} />
          <Form.Item name="footerContent">
            <Input.TextArea placeholder={AppConstants.siteFooterContent} rows={4} />
          </Form.Item>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-6">
          <InputWithHead heading={AppConstants.siteFooterTermsAndConditions} />
          <Form.Item name="footerTermsAndConditions">
            <Select
              className="division-age-select w-100"
              style={{ minWidth: 120 }}
              placeholder={AppConstants.siteFooterTermsAndConditions}
            >
              {webPageOptions().map(option => (
                <Select.Option key={'t&c-pageItem_' + option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>
        <div className="col-sm-6">
          <InputWithHead heading={AppConstants.siteFooterPrivacyPolicy} />
          <Form.Item name="footerPrivacyPolicy">
            <Select
              className="division-age-select w-100"
              style={{ minWidth: 120 }}
              placeholder={AppConstants.siteFooterPrivacyPolicy}
            >
              {webPageOptions().map(option => (
                <Select.Option key={'pp-pageItem_' + option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      </div>
    </div>
  );
};

export default SiteFooterSettings;
