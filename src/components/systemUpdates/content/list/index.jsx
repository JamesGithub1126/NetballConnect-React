import React, { useCallback, useEffect } from 'react';
import { Layout } from 'antd';
import SystemUpdatesListContent from './content';
import { getWebPagesAction } from '../../../../store/actions/strapiAction/strapiAction';
import { useDispatch, useSelector } from 'react-redux';
import { getLast3MonthsDate } from '../../utils';

const PAGE = 1;
const PAGE_SIZE = 10;

const SystemUpdatesList = ({ websiteId, orgLoading }) => {
  const dispatch = useDispatch();

  const webPages = useSelector(state => state.StrapiReducerState.webPages.data);
  const webPagesPagination = useSelector(state => state.StrapiReducerState.webPages.pagination);
  const webPagesLoading = useSelector(state => state.StrapiReducerState.onLoad);

  useEffect(() => {
    if (websiteId) {
      dispatch(
        getWebPagesAction(websiteId, PAGE, PAGE_SIZE, false, getLast3MonthsDate().toISOString()),
      );
    }
  }, [websiteId]);

  const getWebPagesData = useCallback(
    () =>
      webPages.map(webPage => ({
        id: webPage.id,
        ...webPage.attributes,
      })),
    [webPages],
  );

  const handlePageChange = (page, pageSize) => {
    dispatch(
      getWebPagesAction(websiteId, page, pageSize, false, getLast3MonthsDate().toISOString()),
    );
  };

  return (
    <div className="fluid-width default-bg page-list">
      <Layout>
        <Layout.Content>
          <SystemUpdatesListContent
            loading={webPagesLoading || orgLoading}
            data={getWebPagesData()}
            pagination={webPagesPagination}
            handlePageChange={handlePageChange}
          />
        </Layout.Content>
      </Layout>
    </div>
  );
};

export default SystemUpdatesList;
