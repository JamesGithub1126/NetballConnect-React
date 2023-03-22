import React from 'react';
import '../../website.scss';

import { getOrganisationData } from '../../../../util/sessionStorage';
import history from '../../../../util/history';
import DashboardLayout from '../../../../pages/dashboardLayout';
import AppConstants from '../../../../themes/appConstants';
import InnerHorizontalMenu from '../../../../pages/innerHorizontalMenu';
import { MenuKey } from '../../../../util/enums';
import { Button, Layout } from 'antd';
import { EditHeaderView } from '../../component/headerView';
import WebsiteNewsList from './list';
import { useDispatch } from 'react-redux';
import { resetPostFieldsAction } from '../../../../store/actions/strapiAction/strapiAction';

const WebsiteNewsContent = () => {
  const dispatch = useDispatch();

  const organisationData = getOrganisationData();
  const { websiteId } = organisationData;

  const handleAddPost = postId => {
    if (!postId) {
      dispatch(resetPostFieldsAction());
    }

    history.push(`/newsmanagement/${postId}`);
  };

  return (
    <div className="fluid-width default-bg  page-list">
      <DashboardLayout menuHeading={AppConstants.websites} menuName={AppConstants.websites} />
      <InnerHorizontalMenu menu={MenuKey.Websites} userSelectedKey="2" />

      <Layout>
        <EditHeaderView
          header={AppConstants.news}
          buttonGroup={
            <Button
              className="primary-add-comp-form"
              type="primary"
              onClick={() => handleAddPost(0)}
            >
              + {AppConstants.addNews}
            </Button>
          }
        />

        <WebsiteNewsList editPost={handleAddPost} websiteId={websiteId} />
      </Layout>
    </div>
  );
};

export default WebsiteNewsContent;
