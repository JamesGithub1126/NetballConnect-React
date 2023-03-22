import React, { useRef, useState } from 'react';
import { Button, Form, Modal } from 'antd';
import ValidationConstants from '../../../../themes/validationConstant';
import InputWithHead from '../../../../customComponents/InputWithHead';
import AppConstants from '../../../../themes/appConstants';
import { validateWebsiteDomainAction } from '../../../../store/actions/strapiAction/strapiAction';
import { useDispatch, useSelector } from 'react-redux';

const createDefaultDomain = organisationName => {
  if (organisationName) {
    return organisationName
      .trim()
      .toLowerCase()
      .replace(/'/g, '')
      .replace(/[^a-zA-Z0-9-]/g, '-');
  }
  return '';
};

const CreateWebsiteModal = ({
  handleOK,
  visible,
  onCancel,
  onSubmit,
  organisationName,
  loading,
  ...props
}) => {
  const dispatch = useDispatch();

  const validationLoading = useSelector(state => state.StrapiReducerState.onLoad);

  const formRef = useRef(null);
  const [websiteName, setWebsiteName] = useState(organisationName.trim());
  const [domain, setDomain] = useState(createDefaultDomain(organisationName));

  const handleSubmit = () => {
    if (loading || validationLoading) return null;

    dispatch(
      validateWebsiteDomainAction({
        domain,
        onSuccess: () => onSubmit(websiteName, domain),
        onFailure: response => {
          const errorMessage = response.data.message;

          formRef.current.setFields([
            {
              name: 'websiteDomain',
              errors: [errorMessage],
            },
          ]);
        },
      }),
    );
  };

  return (
    <div className="bg-danger">
      <Modal
        {...props}
        className="add-membership-type-modal modalFooter"
        title={AppConstants.createWebsite}
        visible={visible}
        onOk={handleOK}
        onCancel={onCancel}
        footer={<div className="d-none" />}
      >
        <Form
          ref={formRef}
          autoComplete="off"
          onFinish={handleSubmit}
          onFinishFailed={({ errorFields }) => formRef.current.scrollToField(errorFields[0].name)}
          noValidate="noValidate"
        >
          <div className="row mt-3 pl-3 pr-1">
            <div className="col-sm pl-0 pb-2">
              <Form.Item
                name="organisationName"
                rules={[
                  { required: true, message: ValidationConstants.organisationNameIsRequired },
                ]}
                initialValue={websiteName}
              >
                <InputWithHead
                  name="organisationName"
                  required="required-field pt-0"
                  heading={AppConstants.organisationName}
                  placeholder="Enter website name"
                  onChange={e => setWebsiteName(e.target.value.trim())}
                  value={websiteName}
                />
              </Form.Item>
            </div>
          </div>
          <div className="row mt-3 pl-3 pr-1">
            <div className="col-sm pl-0 pb-2">
              <Form.Item
                name="websiteDomain"
                rules={[
                  { required: true, message: ValidationConstants.websiteDomainIsRequired },
                  {
                    pattern: new RegExp(/^[a-z0-9][a-z0-9-](?!--)[a-z0-9-]{0,60}[a-z0-9]$/),
                    message: ValidationConstants.websiteDomainFormatMsg,
                  },
                ]}
                initialValue={domain}
              >
                <InputWithHead
                  name="websiteName"
                  required="required-field pt-0"
                  minLength={2}
                  maxLength={63}
                  heading={AppConstants.websiteDomain}
                  placeholder="Enter website domain"
                  onChange={e => setDomain(e.target.value)}
                  value={domain}
                  addonBefore={AppConstants.httpsProtocol}
                  addonAfter={AppConstants.squadiDomainName}
                />
              </Form.Item>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-sm d-flex w-100" style={{ paddingTop: 10 }}>
              <div className="col-sm-6 d-flex w-50 justify-content-start">
                <Button
                  className="cancelBtnWidth"
                  type="cancel-button"
                  onClick={onCancel}
                  style={{ marginRight: 20 }}
                >
                  {AppConstants.cancel}
                </Button>
              </div>
              <div className="col-sm-6 d-flex w-50 justify-content-end">
                <Button
                  className="publish-button save-draft-text"
                  type="primary"
                  htmlType="submit"
                  loading={loading || validationLoading}
                >
                  {AppConstants.create}
                </Button>
              </div>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CreateWebsiteModal;
