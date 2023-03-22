import React, { useMemo } from 'react';
import Loader from '../../../../customComponents/loader';
import { Form, Layout } from 'antd';
import InputWithHead from '../../../../customComponents/InputWithHead';
import AppConstants from '../../../../themes/appConstants';
import ContentBodyView from './content-body-view/index';
import ValidationConstants from '../../../../themes/validationConstant';

const SystemUpdatesEditorContent = ({ editorState, handleEditorChange, loading }) => {
  const contentView = useMemo(() => {
    return (
      <div className="content-view pt-4">
        <ContentBodyView editorState={editorState} handleEditorChange={handleEditorChange} />
        <Form.Item name="updatePath" rules={[{ required: true, message: ValidationConstants.pageEditValidateMessages[0] }]}>
          <InputWithHead
            auto_complete="off"
            required="required-field"
            heading={AppConstants.helpAndSupport}
            placeholder={AppConstants.helpAndSupport}
          />
        </Form.Item>
      </div>
    );
  }, [editorState]);

  return (
    <Layout.Content>
      <div className="tab-view">
        <div className="tab-formView mt-5">{contentView}</div>
      </div>
      <Loader visible={loading} />
    </Layout.Content>
  );
};

export default SystemUpdatesEditorContent;
