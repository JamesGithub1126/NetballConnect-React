import React, { useMemo } from 'react';
import { Form, Input, Layout } from 'antd';
import Loader from '../../../../../customComponents/loader';
import ValidationConstants from '../../../../../themes/validationConstant';
import InputWithHead from '../../../../../customComponents/InputWithHead';
import AppConstants from '../../../../../themes/appConstants';
import ContentBodyView from '../../../content/page-editor/content/content-body-view';
import ImagePicker from '../../../component/imagePicker';
import { uploadImageAction } from '../../../../../store/actions/strapiAction/strapiAction';
import { useDispatch } from 'react-redux';

const WebsiteNewsEditorContent = ({
  loading,
  editorState,
  handleEditorChange,
  domain,
  handleImageChange,
  defaultFeaturedImage,
}) => {
  const dispatch = useDispatch();

  const handleUploadImage = image => {
    const payload = {
      file: image,
      domain,
    };

    dispatch(uploadImageAction(payload, handleImageChange));
  };

  const contentView = useMemo(() => {
    return (
      <div className="content-view pt-4">
        <Form.Item
          name="postTitle"
          rules={[{ required: true, message: ValidationConstants.pageEditValidateMessages[0] }]}
        >
          <InputWithHead
            auto_complete="off"
            required="required-field"
            heading={AppConstants.title}
            placeholder={AppConstants.title}
          />
        </Form.Item>
        <InputWithHead heading={AppConstants.newsShortContent} />
        <Form.Item name="postShortContent">
          <Input.TextArea placeholder={AppConstants.newsShortContent} rows={4} />
        </Form.Item>
        <ContentBodyView
          editorState={editorState}
          handleEditorChange={handleEditorChange}
          websiteDomain={domain}
        />
        <div>&nbsp;</div>
        <ImagePicker
          header={AppConstants.newsFeaturedImages}
          onImageSelect={handleUploadImage}
          imageSrc={defaultFeaturedImage}
        />
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

export default WebsiteNewsEditorContent;
