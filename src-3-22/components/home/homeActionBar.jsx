import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import Tooltip from 'react-png-tooltip';
import AppConstants from 'themes/appConstants';
import { useOrganisation, useWindowSize } from 'customHooks/hooks';
import { ApiSource } from 'util/enums';
import ActionCard from 'customComponents/ActionCard';
import './homeActionBar.scss';
import { isFootball } from '../../util/registrationHelper';
import { DATE_RANGES } from '../../themes/common/appConstants';

const PLATFORM_ORGANISATION_ID = process.env.REACT_APP_PLATFORM_ORGANISATION_ID;
const isSuspensionEnabled = process.env.REACT_APP_SUSPENSIONS == 'true';

const HomeActionBar = () => {
  const { organisationSettings } = useSelector(state => state.HomeDashboardState);
  const allUserOrganisationData = useSelector(state => state.UserState.allUserOrganisationData);

  const [websiteId, setWebsiteId] = useState(0);
  const { organisationUniqueKey: organisationId } = useOrganisation();
  const actionScrollRef = useRef();
  const extraCardRef = useRef();
  const windowSize = useWindowSize();

  useEffect(() => {
    if (allUserOrganisationData.length) {
      const foundOrganisation = allUserOrganisationData.find(
        item => item.organisationUniqueKey === PLATFORM_ORGANISATION_ID,
      );

      if (foundOrganisation && !websiteId) {
        setWebsiteId(foundOrganisation.websiteId);
      }
    }
  }, [allUserOrganisationData, websiteId]);

  const hideScroll = useMemo(() => {
    if (actionScrollRef.current && windowSize.width) {
      let scrollWidth = actionScrollRef.current.scrollWidth;
      if (extraCardRef.current) {
        scrollWidth -= extraCardRef.current.offsetWidth;
      }
      return scrollWidth < windowSize.width;
    }
    return true;
  }, [windowSize, actionScrollRef.current?.scrollWidth]);

  const onScrollChange = direction => {
    if (actionScrollRef.current) {
      actionScrollRef.current.scrollLeft += (direction * windowSize.width) / 4;
    }
  };

  const getLastWeeksDate = () => {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  };

  return (
    <>
      <div className="row text-view" style={{ paddingTop: '3%' }}>
        <div className="col-sm d-flex align-items-center">
          <span className="home-dash-left-text">{AppConstants.actionsRequired}</span>
        </div>
      </div>
      <div className="home-action-bar-container">
        <div className={`action-bar-scroll-button scroll-left ${hideScroll ? 'hidden' : ''}`}>
          <div className="action-bar-scroll-icon">
            <LeftOutlined style={{ height: 40, width: 40 }} onClick={() => onScrollChange(-1)} />
          </div>
        </div>
        <div className={`action-bar-scroll-button scroll-right ${hideScroll ? 'hidden' : ''}`}>
          <div className="action-bar-scroll-icon">
            <RightOutlined style={{ height: 40, width: 40 }} onClick={() => onScrollChange(1)} />
          </div>
        </div>
        <div ref={actionScrollRef} className="home-action-bar-row">
          <div className="action-card-wrap">
            <ActionCard
              apiSource={ApiSource.Common}
              api="getActionBoxCount"
              payload={{ organisationId, isNotReady: !organisationId }}
              ActionTitle={AppConstants.actions}
              path="/actionBox"
              key={organisationId + 'ActionBoxCount'}
              ActionSubTitle={'   '}
            />
          </div>
          <div className="action-card-wrap">
            <ActionCard
              apiSource={ApiSource.Registration}
              api="getRegistrationChangeStatistic"
              payload={{
                organisationId,
                competitionId: '-1',
                regChangeTypeRefId: 1,
                statusRefId: '0',
                yearRefId: -1,
              }}
              ActionTitle={AppConstants.deRegistration}
              ActionSubTitle={AppConstants.awatingApproval}
              path="/registrationChange"
              key={`regChangeTypeRefId_1_${organisationId}`}
            />
          </div>
          <div className="action-card-wrap">
            <ActionCard
              apiSource={ApiSource.Registration}
              api="getRegistrationChangeStatistic"
              payload={{
                organisationId,
                competitionId: '-1',
                regChangeTypeRefId: 2,
                statusRefId: '0',
                yearRefId: -1,
              }}
              ActionTitle={AppConstants.transfer}
              ActionSubTitle={AppConstants.awatingApproval}
              path="/registrationChange"
              key={`regChangeTypeRefId_2_${organisationId}`}
            />
          </div>
          <div className="action-card-wrap">
            <ActionCard
              apiSource={ApiSource.Registration}
              api="getRegistrationChangeStatistic"
              payload={{
                organisationId,
                competitionId: '-1',
                regChangeTypeRefId: -1,
                statusRefId: '1',
                yearRefId: -1,
              }}
              ActionTitle={AppConstants.dayofRefund}
              ActionSubTitle={AppConstants.awatingRefund}
              path="/registrationChange"
              key={`regChangeTypeRefId_-1_${organisationId}`}
            />
          </div>
          {isFootball && (
            <div className="action-card-wrap">
              <ActionCard
                apiSource={ApiSource.LiveScore}
                api="getNumberOfOfficialsAmendedAtMatch"
                payload={{
                  organisationId,
                }}
                ActionTitle={AppConstants.officialsAmendedAtMatch}
                ActionSubTitle={DATE_RANGES.last_7_days.description}
                key={`officialsAmendedAtMatch_${organisationId}`}
              />
            </div>
          )}
          {organisationSettings.isClearanceEnabled ? (
            <div className="action-card-wrap">
              <ActionCard
                apiSource={ApiSource.Registration}
                api="getRegistrationClearanceStatistic"
                payload={{
                  organisationId,
                  yearRefId: -1,
                  pendingCurrentOrganisation: true,
                }}
                ActionTitle={AppConstants.clearances}
                ActionSubTitle={AppConstants.pendingReview}
                path="/clearances"
                key={`clearances_${organisationId}`}
              />
            </div>
          ) : (
            <></>
          )}
          <div className="action-card-wrap">
            <ActionCard
              apiSource={ApiSource.Registration}
              api="getGovernmentVoucherStatistic"
              payload={{
                organisationId,
                governmentVoucherPending: 1,
                yearRefId: '-1',
                teamId: -1,
              }}
              ActionTitle={AppConstants.governmentVouchers}
              ActionSubTitle={AppConstants.pending}
              path="/registration"
              key={`governmentVouchersPending_${organisationId}`}
            />
          </div>
          <div className="action-card-wrap">
            <ActionCard
              apiSource={ApiSource.User}
              api="getRestrictedAccounts"
              payload={{
                organisationId,
                restrictedAccounts: 1,
              }}
              renderContent={data => (
                <div className="restricted-accounts">
                  {data?.countRestricted}
                  {data && Number(data.selfRestricted) > 0 && (
                    <div className="restricted-asterix">*</div>
                  )}
                </div>
              )}
              ActionTitle={AppConstants.restrictedAccounts}
              ActionSubTitle={data => {
                if (data && Number(data.selfRestricted) > 0) {
                  return (
                    <>
                      <span>* includes own </span>
                      <Tooltip>
                        <span>{AppConstants.yourAccountIsRestricted}</span>
                      </Tooltip>
                    </>
                  );
                } else {
                  return <></>;
                }
              }}
              path="/userAffiliatesList"
              key={`restrictedAccounts_${organisationId}`}
            />
          </div>
          {websiteId ? (
            <div className="action-card-wrap">
              <ActionCard
                apiSource={ApiSource.Strapi}
                payload={{
                  organisationId: websiteId,
                  websiteId,
                  dateFrom: getLastWeeksDate().toISOString(),
                  dateTo: new Date().toISOString(),
                }}
                renderContent={({ count }) => count}
                api="fetchWebPagesCount"
                ActionTitle={AppConstants.systemUpdates}
                ActionSubTitle="Last 7 days"
                path="/systemUpdates"
                key={`systemUpdatesPending_${PLATFORM_ORGANISATION_ID}`}
              />
            </div>
          ) : null}
          {isSuspensionEnabled && (
            <div className="action-card-wrap">
              <ActionCard
                apiSource={ApiSource.LiveScore}
                api="liveScoreSuspensionStatistic"
                payload={{
                  organisationId,
                  competitionUniqueKey: -1,
                  affiliate: -1,
                  yearRefId: -1,
                  pendingSuspension: true,
                }}
                ActionTitle={AppConstants.suspensions}
                ActionSubTitle={' '}
                path="/matchDaySuspensions"
                key={`suspensions_${organisationId}`}
              />
            </div>
          )}
          <div className="action-card-wrap">
            <ActionCard
              apiSource={ApiSource.LiveScore}
              api="fetchOrganisationForfeits"
              payload={{
                organisationId
              }}
              renderContent={({ total }) => total}
              ActionTitle={AppConstants.forfeits}
              ActionSubTitle="Last 7 days"
              path="/"
              key={`forfeits_${organisationId}`}
            />
          </div>
          {!hideScroll && <div ref={extraCardRef} className="action-card-extra"></div>}
        </div>
      </div>
    </>
  );
};

export default HomeActionBar;
