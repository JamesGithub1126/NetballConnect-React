import Tooltip from 'react-png-tooltip';
import React, { useState, useEffect } from 'react';
import { Popover } from 'antd';

const TreeLeaf = ({ searchedArray, data, content, setContentPanel }) => {
  const [collapsed, setCollapsed] = useState(false);

  const leaves = [];
  data.forEach(art => {
    if (art.id === content.id) {
      content.subArticles = art.subArticles;
    } else {
      leaves.push({ ...art });
    }
  });

  const onCollapse = e => setCollapsed(e ? true : !collapsed);

  const onShow = e => {
    setContentPanel(e);
    onCollapse();
  };

  useEffect(() => {
    if (!collapsed && searchedArray && searchedArray.indexOf(content.id) > -1) {
      setCollapsed(true);
    } else if (
      collapsed &&
      searchedArray.length === 0 &&
      searchedArray.indexOf(content.id) === -1
    ) {
      setCollapsed(false);
    }
  }, [collapsed, searchedArray, content.id]);

  return (
    <div className="side-bar-item">
      <ul onClick={() => onShow(content.id)}>
        {content.article === 'Home' ? (
          <i className="fa fa-home" />
        ) : (
          <i
            className={`fa ${
              content.subArticles && content.subArticles.length > 0
                ? collapsed
                  ? 'fa-angle-right fa-lg tree-collapse'
                  : 'fa-angle-right fa-lg tree-not-collapse'
                : 'fa-minus fa-sm'
            }
              `}
          />
        )}
        {content.parentArticleId ? (
          <Popover content={content.article}>{content.article}</Popover>
        ) : (
          `${content.article}`
        )}
      </ul>

      <div className={`side-bar-child-item ${collapsed ? 'tree-item-show' : 'tree-item-hide'}`}>
        {content.subArticles &&
          content.subArticles.map(leaf => (
            <TreeLeaf
              key={leaf.article}
              searchedArray={searchedArray}
              data={leaves}
              content={leaf}
              setContentPanel={setContentPanel}
            />
          ))}
      </div>
    </div>
  );
};

export default TreeLeaf;
