import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../../pages/dashboardLayout';
import AppConstants from '../../../themes/appConstants';
import InnerHorizontalMenu from '../../../pages/innerHorizontalMenu';
import EditHeaderView from '../components/editHeaderView';
import { Layout, Button } from 'antd';
import SystemUpdatesList from './list';
import history from '../../../util/history';
import { getOrganisationData } from '../../../util/sessionStorage';
import userHttpApi from '../../../store/http/userHttp/userAxiosApi';

const PLATFORM_ORGANISATION_ID = process.env.REACT_APP_PLATFORM_ORGANISATION_ID;

const SystemUpdatesContent = () => {
  const [websiteId, setWebsiteId] = useState(0);
  const [orgLoading, setOrgLoading] = useState(false);
  const organisationData = getOrganisationData();
  const { organisationUniqueKey } = organisationData;

  useEffect(() => {
    if (!websiteId) {
      setOrgLoading(true);

      userHttpApi
        .organisationDetails({
          organisationUniqueKey: PLATFORM_ORGANISATION_ID,
        })
        .then(response => {
          const { result } = response;
          setOrgLoading(false);

          if (result && result.data && result.data.websiteId) {
            setWebsiteId(result.data.websiteId);
          }
        });
    }
  }, [websiteId]);

  const getButtonGroup = useMemo(() => {
    if (organisationUniqueKey !== PLATFORM_ORGANISATION_ID) {
      return <></>;
    }

    return (
      <Button
        className="primary-add-comp-form"
        type="primary"
        onClick={() => {
          history.push('/createSystemUpdate');
        }}
      >
        + {AppConstants.addUpdate}
      </Button>
    );
  }, [organisationUniqueKey]);

  return (
    <div className="fluid-width default-bg">
      <DashboardLayout
        menuId={AppConstants.home_page_heading}
        menuHeading={AppConstants.home}
        menuName={AppConstants.home}
      />

      <InnerHorizontalMenu menu="home" userSelectedKey="3" />

      <Layout>
        <EditHeaderView buttonGroup={getButtonGroup} />
      </Layout>

      <SystemUpdatesList websiteId={websiteId} orgLoading={orgLoading} />
    </div>
  );
};

export default SystemUpdatesContent;
