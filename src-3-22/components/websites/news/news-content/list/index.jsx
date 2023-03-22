import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout } from 'antd';
import WebsiteNewsListContent from './content';
import { getPostsAction } from '../../../../../store/actions/strapiAction/strapiAction';

const WebsiteNewsList = ({ editPost, websiteId }) => {
  const dispatch = useDispatch();

  const posts = useSelector(state => state.StrapiReducerState.posts.data);
  const postsPagination = useSelector(state => state.StrapiReducerState.posts.pagination);
  const postsLoading = useSelector(state => state.StrapiReducerState.onLoad);

  useEffect(() => {
    if (websiteId) {
      dispatch(getPostsAction(websiteId));
    }
  }, []);

  const getPostsData = useCallback(
    () =>
      posts.map(post => ({
        id: post.id,
        ...post.attributes,
      })),
    [posts],
  );

  const handlePageChange = (page, pageSize) => {
    dispatch(getPostsAction(websiteId, page, pageSize));
  };

  return (
    <div className="fluid-width default-bg page-list">
      <Layout>
        <Layout.Content>
          <WebsiteNewsListContent
            editPost={editPost}
            loading={postsLoading}
            data={getPostsData()}
            handlePageChange={handlePageChange}
            pagination={postsPagination}
          />
        </Layout.Content>
      </Layout>
    </div>
  );
};

export default WebsiteNewsList;
