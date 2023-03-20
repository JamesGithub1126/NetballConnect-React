import React from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Modal, Select } from 'antd';

import AppConstants from 'themes/appConstants';
import AppImages from 'themes/appImages';
import history from 'util/history';
import AppUniqueId from 'themes/appUniqueId';
import {
  setOrganisationData,
  getOrganisationData,
  clearUmpireStorage,
  setPrevUrl,
  setImpersonation,
  setUmpireCompetitionId,
} from 'util/sessionStorage';
import {
  showRoleLevelPermission,
  getUserRoleId,
  isReadOnlyRole,
  checkOrgTypeAccess,
  isAdminRole,
} from 'util/permissions';
import { isArrayNotEmpty, randomKeyGen } from '../util/helpers';
import { clearHomeDashboardData } from 'store/actions/homeAction/homeAction';
import {
  getAffiliatesListingAction,
  getOrganisationAction,
  getUserOrganisationAction,
  impersonationAction,
  onOrganisationChangeAction,
  getUreAction,
} from 'store/actions/userAction/userAction';
import { clearDataOnCompChangeAction } from 'store/actions/LiveScoreAction/liveScoreMatchAction';
import Loader from 'customComponents/loader';
import './layout.css';
import { UserRole } from 'util/enums';
import ReactPlayer from 'react-player';
import TutorialConstants from 'themes/tutorialConstants';
import { readOnlyRole } from '../pages/routeAccess';

const { Option } = Select;

class DashboardLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      windowMobile: false,
      dataOnload: false,
      impersonationLoad: true,
      openImpersonationModal: false,
      openShowTutorial: false,
      openQuitOrganisationModal: false,
      impersonationAffiliateOrgId: null,
      impersonationOrgData: null,
      logout: false,
      userRoleId: getUserRoleId(),
      readonlyKey: randomKeyGen(32),
      adminKey: randomKeyGen(32),
      organisationTypeRefId: '-1',
    };
  }

  async componentDidUpdate(nextProps, prevState) {
    const { userState } = this.props;
    const { dataOnload, userRoleId } = this.state;

    if (userState !== nextProps.userState) {
      if (userState.onOrgLoad === false && dataOnload === true) {
        const organisationData = userState.allUserOrganisationData;

        if (organisationData.length > 0) {
          const impersonationRole = userState.userRoleEntity.find(
            role => role.roleId === UserRole.WebImpersonatedAdmin,
          );
          const isImpersonation = !!impersonationRole;
          let entityId = impersonationRole?.entityId;
          const currentOrg = getOrganisationData();
          if (!entityId) {
            entityId = currentOrg?.organisationId;
          }
          const presetOrganisation = organisationData.find(org => org.organisationId === entityId);
          const orgData = presetOrganisation || currentOrg;
          const organisationItem = orgData || organisationData[0];

          await setOrganisationData(organisationItem);
          this.props.onOrganisationChangeAction(organisationItem, 'organisationChange');
          setImpersonation(!!isImpersonation);
          let { readonlyKey, adminKey } = this.state;
          if (userRoleId !== organisationItem.userRoleId) {
            readonlyKey = randomKeyGen(32);
            adminKey = randomKeyGen(32);
          }
          this.setState({
            dataOnload: false,
            impersonationAffiliateOrgId: isImpersonation ? entityId : null,
            userRoleId: organisationItem.userRoleId,
            readonlyKey,
            adminKey,
            organisationTypeRefId: organisationItem.organisationTypeRefId,
          });
        }
      }

      if (userState.impersonation !== nextProps.userState.impersonation) {
        const { impersonationAffiliateOrgId } = this.state;
        if (userState.impersonation) {
          const impersonationAffiliate = impersonationAffiliateOrgId
            ? userState.affiliateList.find(
                affiliate => affiliate.affiliateOrgId === impersonationAffiliateOrgId,
              )
            : null;

          this.setState({
            impersonationOrgData: impersonationAffiliate,
            impersonationAffiliateOrgId,
          });

          if (!userState.impersonationLoad) {
            history.push('/');
          }
          window.location.reload();
        }
      }

      if (userState.impersonation && this.state.impersonationLoad && !userState.impersonationLoad) {
        if (this.state.logout) {
          localStorage.clear();
          history.push('/login');
        } else if (!this.state.dataOnload) {
          this.props.getUserOrganisationAction();
          this.setState({
            dataOnload: true,
            impersonationLoad: false,
          });
        }
      }

      if (userState.userRoleEntity !== nextProps.userState.userRoleEntity) {
        const isImpersonation =
          userState.userRoleEntity.findIndex(
            role => role.roleId === UserRole.WebImpersonatedAdmin,
          ) > -1;

        const orgData = await getOrganisationData();
        setImpersonation(!!isImpersonation);
        this.setState({
          impersonationOrgData: isImpersonation ? orgData : null,
        });
      }
    }
    if (
      prevState.impersonationOrgData !== this.state.impersonationOrgData &&
      isArrayNotEmpty(userState.allUserOrganisationData)
    ) {
      const orgData = await getOrganisationData();
      const findOrg = userState.allUserOrganisationData.find(
        item => item.organisationId === orgData.organisationId,
      );
      if (!findOrg) {
        const impersonationRole = userState.userRoleEntity.find(
          role => role.roleId === UserRole.WebImpersonatedAdmin,
        );
        const isImpersonation = !!impersonationRole;
        const currentOrg = userState.allUserOrganisationData[0];
        setOrganisationData(currentOrg);
        this.props.onOrganisationChangeAction(currentOrg, 'organisationChange');
        setImpersonation(!!isImpersonation);
      }
    }
    this.checkPageAccess();
  }

  checkPageAccess = () => {
    const pathname = window.location.pathname.toLowerCase();
    let redirectToReadOnlyPage = isReadOnlyRole() && !readOnlyRole.includes(pathname);
    redirectToReadOnlyPage && history.push('/userTextualDashboard');
  };

  componentDidMount() {
    this.setOrganisationKey();
    this.props.getUreAction();
    window.addEventListener('storage', this.localStorageUpdated);
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.localStorageUpdated);
  }

  localStorageUpdated = () => {
    const { userState } = this.props;
    const organisationData = getOrganisationData();
    if (
      userState.organisationUniqueKey &&
      userState.organisationUniqueKey != organisationData?.organisationUniqueKey
    ) {
      this.setState({ openQuitOrganisationModal: true });
    }
  };

  setOrganisationKey = () => {
    const { userState, getUserOrganisationAction } = this.props;

    if (
      userState.getUserOrganisation.length === 0 ||
      window.location.pathname.toLowerCase().includes('registrationpayments')
    ) {
      getUserOrganisationAction();
    }
    this.setState({ dataOnload: true });
  };

  endImpersonation = async () => {
    const { impersonationOrgData } = this.state;

    if (impersonationOrgData) {
      this.props.impersonationAction({
        orgId: impersonationOrgData.organisationUniqueKey,
        access: false,
      });

      await this.setState({
        impersonationOrgData: null,
        impersonationAffiliateOrgId: null,
        impersonationLoad: true,
      });

      await setOrganisationData(null);
      setUmpireCompetitionId(null);
    }
  };

  logout = async () => {
    const { impersonationOrgData } = this.state;

    if (impersonationOrgData) {
      this.props.impersonationAction({
        orgId: impersonationOrgData.organisationUniqueKey,
        access: false,
      });

      this.setState({ logout: true });
    } else {
      localStorage.clear();
      history.push('/login');
    }
  };

  changeId = menuName => {
    switch (menuName) {
      case AppConstants.home:
        return AppConstants.home_icon;
      default:
        return AppConstants.home_icon;
    }
  };

  menuImageChange = menuName => {
    switch (menuName) {
      case AppConstants.home:
        return AppImages.homeIcon;

      case AppConstants.account:
        return AppImages.accountIcon;

      case AppConstants.user:
        return AppImages.userIcon;

      case AppConstants.registration:
        return AppImages.regIcon;

      case AppConstants.competitions:
        return AppImages.compIcon;

      case AppConstants.liveScores:
        return AppImages.liveScoreIcon;

      case AppConstants.Communication:
        return AppImages.chatIcon;

      case AppConstants.shop:
        return AppImages.shopIcon;

      case AppConstants.officials:
        return AppImages.umpireIcon;

      case AppConstants.incidents:
        return AppImages.incidentIcon;

      case AppConstants.finance:
        return AppImages.financeIcon;
      case AppConstants.advertising:
        return AppImages.advertisingIcon;
      default:
        return AppImages.homeIcon;
    }
  };

  searchView = () => {
    this.setState({ windowMobile: !this.state.windowMobile });
  };

  onOrganisationChange = async organisationData => {
    this.props.onOrganisationChangeAction(organisationData, 'organisationChange');
    setOrganisationData(organisationData);
    this.props.clearHomeDashboardData('user');
    clearUmpireStorage();
    setPrevUrl(history.location);
    history.push('/homeDashboard', { orgChange: 'changeOrg' });
    window.location.reload();
  };

  handleImpersonation = () => {
    const organisationData = getOrganisationData();
    this.props.getAffiliatesListingAction({
      organisationId: organisationData.organisationUniqueKey,
      affiliatedToOrgId: -1,
      organisationTypeRefId: -1,
      statusRefId: -1,
      paging: { limit: -1, offset: 0 },
      stateOrganisations: false,
    });
    this.setState({ openImpersonationModal: true });
  };

  handleImpersonationModal = button => {
    if (button === 'ok') {
      const orgData = this.props.userState.impersonationList.find(
        affiliate => affiliate.affiliateOrgId === this.state.impersonationAffiliateOrgId,
      );
      if (orgData) {
        this.props.impersonationAction({
          orgId: orgData.affiliateOrgId,
          access: true,
        });
      }
      this.setState({ openImpersonationModal: false });
    } else {
      this.setState({ openImpersonationModal: false });
    }
  };

  handleImpersonationOrg = e => {
    this.setState({ impersonationAffiliateOrgId: e });
  };

  handleQuitOrganisationModal = () => {
    const organisationData = getOrganisationData();
    this.onOrganisationChange(organisationData);
    this.setState({ openQuitOrganisationModal: false });
  };

  userProfileDropdown = () => {
    const { menuName, userState } = this.props;
    const userData = userState.getUserOrganisation;
    const selectedOrgData = getOrganisationData();
    const userImage =
      selectedOrgData && selectedOrgData.photoUrl
        ? selectedOrgData.photoUrl
        : AppImages.defaultUser;

    return (
      <div className="dropdown">
        <button className="dropdown-toggle" type="button" data-toggle="dropdown">
          <img
            id={AppConstants.user_profile_icon}
            data-testid={AppUniqueId.USER_PROFILE_ICON}
            src={userImage}
            alt=""
          />
        </button>

        <ul className="dropdown-menu">
          <li>
            <div className="media">
              <div className="media-left">
                <figure className="user-img-wrap">
                  <img src={userImage} alt="" />
                </figure>
              </div>

              <div className="media-body">
                {selectedOrgData && (
                  <span className="user-name">
                    {`${selectedOrgData.firstName} ${selectedOrgData.lastName}`}
                  </span>
                )}

                <span className="user-name-btm pt-3">
                  {selectedOrgData && (
                    <span style={{ textTransform: 'capitalize' }}>
                      {`${selectedOrgData.name} (${selectedOrgData.roleDescription})`}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </li>

          {userData.length > 0 && (
            <div className="acc-help-support-list-view">
              {userData.map((item, index) => (
                <li key={`user${index}`} data-testid={`${AppUniqueId.USER_ACCOUNT}${item.name}`}>
                  <a onClick={() => this.onOrganisationChange(item)}>
                    <span
                      style={{ textTransform: 'capitalize' }}
                    >{`${item.name} (${item.userRole})`}</span>
                  </a>
                </li>
              ))}
            </div>
          )}

          <div className="acc-help-support-list-view">
            {!this.state.impersonationOrgData && !isReadOnlyRole() && (
              <li>
                <a id={AppConstants.impersonation} onClick={this.handleImpersonation}>
                  {AppConstants.impersonation}
                </a>
              </li>
            )}

            <li className={menuName === AppConstants.account ? 'active' : ''}>
              <NavLink id={AppConstants.acct_settings_label} to="/account/profile">
                Account Settings
              </NavLink>
            </li>

            {!isReadOnlyRole() && (
              <li>
                <NavLink id={AppConstants.help_support_label} to="/support">
                  Help & Support
                </NavLink>
              </li>
            )}
          </div>

          {!isReadOnlyRole() && (
            <li className="acc-help-support-list-view">
              <NavLink
                to={{ pathname: process.env.REACT_APP_URL_WEB_USER_REGISTRATION }}
                target="_blank"
              >
                {AppConstants.myProfile}
              </NavLink>
            </li>
          )}

          <li className="log-out">
            <a id={AppConstants.log_out} onClick={this.logout}>
              Log Out
            </a>
          </li>
        </ul>
      </div>
    );
  };

  checkShowTutorialIcon = () => {
    return !!TutorialConstants.find(t => t.sitePath && t.sitePath === history.location.pathname);
  };

  clickShowTutorialVideo = () => {
    this.setState({ openShowTutorial: true });
  };

  handleTutorialVideoModal = () => {
    this.setState({ openShowTutorial: false });
  };

  showTutorialVideo = button => {
    const tutorial = TutorialConstants.find(
      t => t.sitePath && t.sitePath === history.location.pathname,
    );

    if (this.state.openShowTutorial === false) {
      return <></>;
    }

    return (
      <Modal
        className="add-membership-type-modal"
        visible={this.state.openShowTutorial}
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { display: 'none' } }}
        onOk={() => this.handleTutorialVideoModal('ok')}
        onCancel={() => this.handleTutorialVideoModal('cancel')}
        width={800}
        closable={false}
        centered
        footer={null}
        bodyStyle={{
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '10px',
        }}
      >
        <ReactPlayer
          url={tutorial ? tutorial.videoUrl : ''}
          width="100%"
          height="calc(100vh - 300px)"
          playing={this.state.openShowTutorial}
          controls
        />
      </Modal>
    );
  };

  render() {
    const { menuName, userState } = this.props;
    const { userRoleId, impersonationOrgData, impersonationLoad, readonlyKey, adminKey } =
      this.state;

    return (
      <>
        {this.state.impersonationOrgData && (
          <div className="col-sm-12 d-flex impersonation-bar">
            {`You are impersonating access to ${impersonationOrgData.name}.`}
            <a onClick={this.endImpersonation}>End access</a>
          </div>
        )}

        <header
          className={`site-header ${
            impersonationLoad && impersonationOrgData ? 'impersonation-site-header' : ''
          }`}
        >
          <div className="header-wrap">
            <div className="row m-0-res">
              <div className="col-sm-12 d-flex">
                <div className="logo-box">
                  <NavLink to="/" className="site-brand">
                    <img src={AppImages.netballLogo1} alt="" />
                  </NavLink>

                  <div
                    className="col-sm dashboard-layout-menu-heading-view"
                    onClick={this.props.onMenuHeadingClick}
                  >
                    <span id={this.props.menuId} className="dashboard-layout-menu-heading">
                      {this.props.menuHeading}
                    </span>
                  </div>
                </div>

                <div className="user-right">
                  <ul className="d-flex">
                    <li>
                      <div className="site-menu">
                        {this.props.isManuNotVisible !== true && this.checkShowTutorialIcon() && (
                          <img
                            id="question_icon"
                            src={AppImages.questionIcon}
                            alt=""
                            onClick={() => this.clickShowTutorialVideo()}
                            width={'25px'}
                            height={'25px'}
                            style={{ cursor: 'pointer' }}
                          />
                        )}
                      </div>
                    </li>
                    <li>
                      <div className="site-menu">
                        <div className="dropdown">
                          {this.props.isManuNotVisible !== true && (
                            <button
                              className="dropdown-toggle"
                              type="button"
                              data-toggle="dropdown"
                              data-testid={AppUniqueId.home_Icon}
                            >
                              <img
                                id={this.changeId(menuName)}
                                src={this.menuImageChange(menuName)}
                                alt=""
                                data-testid={AppUniqueId.home_Icon}
                              />
                            </button>
                          )}
                          {isReadOnlyRole() ? (
                            <ul className="dropdown-menu readonly-menu" key={readonlyKey}>
                              {' '}
                              <li className={menuName === AppConstants.user ? 'active' : ''}>
                                <div className="user-menu menu-wrap">
                                  <NavLink to="/userTextualDashboard">
                                    <span className="icon" />
                                    {AppConstants.user}
                                  </NavLink>
                                </div>
                              </li>
                            </ul>
                          ) : (
                            <ul className="dropdown-menu" key={adminKey}>
                              <li className={menuName === AppConstants.home ? 'active' : ''}>
                                <div
                                  className="home-menu menu-wrap"
                                  data-testid={AppUniqueId.HOME_MENU}
                                >
                                  <NavLink to="/homeDashboard">
                                    <span className="icon" />
                                    {AppConstants.home}
                                  </NavLink>
                                </div>
                              </li>
                              <li
                                className={menuName === AppConstants.user ? 'active' : ''}
                                style={{
                                  display: showRoleLevelPermission(userRoleId, 'user')
                                    ? 'visible'
                                    : 'none',
                                }}
                              >
                                <div
                                  className="user-menu menu-wrap"
                                  data-testid={AppUniqueId.USER_ICON}
                                >
                                  <NavLink to="/userTextualDashboard">
                                    <span className="icon" />
                                    {AppConstants.user}
                                  </NavLink>
                                </div>
                              </li>
                              <li
                                className={menuName === AppConstants.registration ? 'active' : ''}
                                style={{
                                  display: showRoleLevelPermission(userRoleId, 'registration')
                                    ? 'visible'
                                    : 'none',
                                }}
                              >
                                <div
                                  id={AppConstants.registration_icon}
                                  data-testid={AppUniqueId.REGISTRATION_ICON}
                                  onClick={() => this.props.clearDataOnCompChangeAction()}
                                  className="registration-menu menu-wrap"
                                >
                                  <NavLink to="/registrationDashboard">
                                    <span id={AppConstants.registrations_label} className="icon" />
                                    {AppConstants.registration}
                                  </NavLink>
                                </div>
                              </li>

                              <li
                                className={menuName === AppConstants.competitions ? 'active' : ''}
                                style={{
                                  display: showRoleLevelPermission(userRoleId, 'competitions')
                                    ? 'visible'
                                    : 'none',
                                }}
                              >
                                <div
                                  id={AppConstants.competition_icon}
                                  className="competitions-menu menu-wrap"
                                >
                                  <NavLink to="/competitionDashboard">
                                    <span
                                      id={AppConstants.competitions_label}
                                      className="icon"
                                      data-testid={AppUniqueId.competition_Icon}
                                    />
                                    {AppConstants.competitions}
                                  </NavLink>
                                </div>
                              </li>

                              <li
                                className={menuName === AppConstants.liveScores ? 'active' : ''}
                                style={{
                                  display: showRoleLevelPermission(userRoleId, 'liveScores')
                                    ? 'visible'
                                    : 'none',
                                }}
                              >
                                <div
                                  className="lives-cores menu-wrap"
                                  onClick={() => this.props.clearDataOnCompChangeAction()}
                                >
                                  <NavLink to="/matchDayCompetitions">
                                    <span className="icon" data-testid={AppUniqueId.MATCH_DAY} />
                                    {AppConstants.matchDay}
                                  </NavLink>
                                </div>
                              </li>
                              <li
                                className={menuName === AppConstants.Communication ? 'active' : ''}
                                style={{
                                  display: showRoleLevelPermission(userRoleId, 'events')
                                    ? 'visible'
                                    : 'none',
                                }}
                              >
                                <div className="events-menu menu-wrap">
                                  {/* <NavLink to="/communication"> */}
                                  <NavLink to="/communicationList">
                                    <span className="icon" />
                                    {AppConstants.Communication}
                                  </NavLink>
                                </div>
                              </li>

                              <li
                                className={menuName === AppConstants.shop ? 'active' : ''}
                                style={{
                                  display: showRoleLevelPermission(userRoleId, 'shop')
                                    ? 'visible'
                                    : 'none',
                                }}
                              >
                                <div className="shop-menu menu-wrap">
                                  <NavLink to="/orderSummary">
                                    <span className="icon" />
                                    {AppConstants.shop}
                                  </NavLink>
                                </div>
                              </li>

                              <li
                                className={menuName === AppConstants.umpires ? 'active' : ''}
                                style={{
                                  display: showRoleLevelPermission(userRoleId, 'umpires')
                                    ? 'visible'
                                    : 'none',
                                }}
                              >
                                <div className="umpires-menu menu-wrap">
                                  <NavLink to="/umpireDashboard">
                                    <span className="icon" />
                                    {AppConstants.officials}
                                  </NavLink>
                                </div>
                              </li>

                              <li
                                className={menuName === AppConstants.finance ? 'active' : ''}
                                style={{
                                  display: showRoleLevelPermission(userRoleId, 'finance')
                                    ? 'visible'
                                    : 'none',
                                }}
                              >
                                <div
                                  className="finance-menu menu-wrap"
                                  onClick={() => this.props.clearDataOnCompChangeAction()}
                                >
                                  <NavLink to="/SummaryByParticipantAggregate">
                                    <span className="icon" />
                                    {AppConstants.finance}
                                  </NavLink>
                                </div>
                              </li>
                              {isAdminRole() && (
                                <li
                                  key={this.state.organisationTypeRefId}
                                  className={menuName === AppConstants.advertising ? 'active' : ''}
                                  style={{
                                    display: checkOrgTypeAccess('advertising') ? 'visible' : 'none',
                                  }}
                                >
                                  <div className="advertising-menu menu-wrap">
                                    <NavLink to="/engagementList">
                                      <span className="icon" />
                                      {AppConstants.advertising}
                                    </NavLink>
                                  </div>
                                </li>
                              )}
                              {process.env.REACT_APP_WEBSITES_ENABLED === 'true' && (
                                <li className={menuName === AppConstants.websites ? 'active' : ''}>
                                  <div className="websites-menu menu-wrap">
                                    <NavLink to="/websiteDashboard">
                                      <span className="icon" />
                                      {AppConstants.websites}
                                    </NavLink>
                                  </div>
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                      </div>
                    </li>

                    <li>
                      {this.props.isManuNotVisible !== true && (
                        <div className="user-profile-box">{this.userProfileDropdown()}</div>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Modal
            className="add-membership-type-modal"
            title={AppConstants.impersonationOrgSelect}
            visible={this.state.openImpersonationModal}
            onOk={() => this.handleImpersonationModal('ok')}
            onCancel={() => this.handleImpersonationModal('cancel')}
          >
            <Select
              className="w-100 reg-filter-select-competition"
              onChange={this.handleImpersonationOrg}
              data-testid="Organisation"
              placeholder="Organisation"
              showSearch
              filterOption={(input, data) =>
                data.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              loading={userState.onImpersonationLoad}
            >
              {(userState.impersonationList || []).map(affiliate => (
                <Option
                  key={`organization_${affiliate.affiliateOrgId}`}
                  value={affiliate.affiliateOrgId}
                >
                  {affiliate.affiliateName}
                </Option>
              ))}
            </Select>
          </Modal>

          <Modal
            className="add-membership-type-modal"
            title="Please reload your screen"
            visible={this.state.openQuitOrganisationModal}
            onOk={this.handleQuitOrganisationModal}
            onCancel={this.handleQuitOrganisationModal}
            okText="Reload"
            cancelButtonProps={{ style: { display: 'none' } }}
            closable={false}
            centered
          >
            You were signed out of this organisation as you switched to another organisation. Press
            'Reload' to continue.
          </Modal>
          {this.showTutorialVideo()}

          <Loader visible={userState.impersonationLoad} />
        </header>
      </>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getUreAction,
      getUserOrganisationAction,
      onOrganisationChangeAction,
      clearHomeDashboardData,
      getOrganisationAction,
      impersonationAction,
      getAffiliatesListingAction,
      clearDataOnCompChangeAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    userState: state.UserState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardLayout);
