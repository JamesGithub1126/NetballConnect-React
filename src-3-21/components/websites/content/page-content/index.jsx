import React from 'react';
import '../../website.scss';

import { Button, Layout } from 'antd';
import { getOrganisationData } from '../../../../util/sessionStorage';
import { EditHeaderView } from '../../component/headerView';
import AppConstants from '../../../../themes/appConstants';
import DashboardLayout from '../../../../pages/dashboardLayout';
import InnerHorizontalMenu from '../../../../pages/innerHorizontalMenu';
import { MenuKey } from '../../../../util/enums';
import WebsitePageList from './list';
import history from '../../../../util/history';
import { useDispatch } from 'react-redux';
import { resetWebPageFieldsAction } from '../../../../store/actions/strapiAction/strapiAction';

const WebsitePageContent = () => {
  const dispatch = useDispatch();

  const organisationData = getOrganisationData();
  const { websiteId } = organisationData;

  const handleAddPage = webPageId => {
    if (!webPageId) {
      dispatch(resetWebPageFieldsAction());
    }

    history.push(`/pagemanagement/${webPageId}`);
  };

  return (
    <div className="fluid-width default-bg  page-list">
      <DashboardLayout menuHeading={AppConstants.websites} menuName={AppConstants.websites} />
      <InnerHorizontalMenu menu={MenuKey.Websites} userSelectedKey="1" />

      <Layout>
        <EditHeaderView
          header={AppConstants.pages}
          buttonGroup={
            <Button
              className="primary-add-comp-form"
              type="primary"
              onClick={() => handleAddPage(0)}
            >
              + {AppConstants.addPage}
            </Button>
          }
        />
        <WebsitePageList editPage={handleAddPage} websiteId={websiteId} />
      </Layout>
    </div>
  );
};

export default WebsitePageContent;
