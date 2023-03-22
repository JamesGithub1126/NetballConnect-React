import React from 'react';
import { ALLOWED_FIELDS } from '../contants';
import PageEditorContainer from './content-container';
import { DEFAULT_GENERIC_TEMPLATE } from '../../../dashboard/constants';

const WebsitePageEditorContent = ({ pageTemplate, ...props }) => {
  const allowedFields = ALLOWED_FIELDS[pageTemplate] || ALLOWED_FIELDS[DEFAULT_GENERIC_TEMPLATE];

  return <PageEditorContainer allowedFields={allowedFields} {...props} />;
};

export default WebsitePageEditorContent;
