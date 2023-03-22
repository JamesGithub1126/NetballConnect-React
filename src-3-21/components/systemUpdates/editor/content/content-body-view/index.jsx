import draftToHtml from 'draftjs-to-html';
import { convertToRaw } from 'draft-js';
import InputWithHead from '../../../../../customComponents/InputWithHead';
import AppConstants from '../../../../../themes/appConstants';
import { Editor } from 'react-draft-wysiwyg';
import React from 'react';

const ContentBodyView = ({ editorState, handleEditorChange }) => {
  const onEditorStateChange = editorState => {
    const body = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    handleEditorChange(editorState, body);
  };

  return (
    <>
      <InputWithHead heading={AppConstants.updateDetails} />
      <div className="fluid-width mt-2" style={{ border: '1px solid rgb(212, 212, 212)' }}>
        <div className="livescore-editor-news col-sm">
          <Editor
            editorState={editorState}
            editorClassName="updateDetailEditor"
            onEditorStateChange={onEditorStateChange}
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
              ],
              inline: { inDropdown: true },
              list: { inDropdown: true },
              textAlign: { inDropdown: true },
              link: { inDropdown: true },
              history: { inDropdown: true },
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ContentBodyView;
