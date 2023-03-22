import React, { useCallback, useEffect } from 'react';
import { Layout } from 'antd';
import WebsitePageContentList from './content';
import { getWebPagesAction } from '../../../../../store/actions/strapiAction/strapiAction';
import { useDispatch, useSelector } from 'react-redux';

const WebsitePageList = ({ editPage, websiteId }) => {
  const dispatch = useDispatch();

  const webPages = useSelector(state => state.StrapiReducerState.webPages.data);
  const webPagesPagination = useSelector(state => state.StrapiReducerState.webPages.pagination);
  const webPagesLoading = useSelector(state => state.StrapiReducerState.onLoad);

  useEffect(() => {
    if (websiteId) {
      dispatch(getWebPagesAction(websiteId));
    }
  }, []);

  const getWebPagesData = useCallback(
    () =>
      webPages.map(webPage => ({
        id: webPage.id,
        ...webPage.attributes,
      })),
    [webPages],
  );

  const handlePageChange = (page, pageSize) => {
    dispatch(getWebPagesAction(websiteId, page, pageSize));
  };

  return (
    <div className="fluid-width default-bg page-list">
      <Layout>
        <Layout.Content>
          <WebsitePageContentList
            editPage={editPage}
            loading={webPagesLoading}
            data={getWebPagesData()}
            handlePageChange={handlePageChange}
            pagination={webPagesPagination}
          />
        </Layout.Content>
      </Layout>
    </div>
  );
};

export default WebsitePageList;
