import React, { useCallback } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import InputWithHead from '../../../../../../customComponents/InputWithHead';
import AppConstants from '../../../../../../themes/appConstants';
import { uploadImageAction } from '../../../../../../store/actions/strapiAction/strapiAction';
import { useDispatch } from 'react-redux';

const ContentBodyView = ({
  editorState,
  handleEditorChange,
  websiteDomain,
  heading = AppConstants.body,
}) => {
  const dispatch = useDispatch();

  const handleUploadImage = useCallback(
    changeHandler => image => {
      const payload = {
        file: image,
        domain: websiteDomain,
      };

      dispatch(uploadImageAction(payload, changeHandler));
    },
    [websiteDomain],
  );

  const uploadCallback = file => {
    return new Promise(resolve => {
      handleUploadImage(imageUrl => {
        resolve({ data: { link: imageUrl } });
      })(file);
    });
  };

  return (
    <>
      <InputWithHead heading={heading} />
      <div className="fluid-width mt-2" style={{ border: '1px solid rgb(212, 212, 212)' }}>
        <div className="livescore-editor-news col-sm">
          <Editor
            editorState={editorState}
            editorClassName="newsDetailEditor"
            onEditorStateChange={handleEditorChange}
            toolbar={{
              options: [
                'inline',
                'blockType',
                'fontSize',
                'fontFamily',
                'list',
                'textAlign',
                'colorPicker',
                'link',
                'embedded',
                'emoji',
                'remove',
                'history',
                'image',
              ],
              inline: { inDropdown: true },
              list: { inDropdown: true },
              textAlign: { inDropdown: true },
              link: { inDropdown: true },
              history: { inDropdown: true },
              image: {
                urlEnabled: false,
                previewImage: true,
                uploadCallback,
                inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                alt: { present: false, mandatory: false },
                defaultSize: {
                  height: 'auto',
                  width: 'auto',
                },
              },
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ContentBodyView;
