import React from 'react';

// import ReactMarkdown from "react-markdown";
import ReactMarkdownWithHtml from 'react-markdown/with-html';

const ContentPanel = ({ content }) => (
  <div className="support-content-panel">
    <ReactMarkdownWithHtml
      children={content}
      transformImageUri={ uri => 
        /^https:/.test(uri)
          ? uri
          : `${process.env.REACT_APP_URL_API_CONTENT}${uri}`
      }
      allowDangerousHtml
    />
  </div>
);

export default ContentPanel;
