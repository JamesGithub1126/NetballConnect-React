/* eslint-disable react/no-did-update-set-state */
/* eslint-disable no-restricted-syntax */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Menu, Select, message } from 'antd';

import {
  isBasketball,
  isFootball,
  isNetball,
} from 'components/liveScore/liveScoreSettings/liveScoreSettingsUtils';
import { isReadOnlyRole } from 'util/permissions';
import AppConstants from '../themes/appConstants';
import {
  checkOrganisationLevel,
  checkLivScoreCompIsParent,
  getUserRoleId,
  checkUserSuperAdmin,
} from '../util/permissions';
import AccountMenu from './InnerHorizontalMenu/AccountMenu';
import './layout.css';
import AppUniqueId from '../themes/appUniqueId';
import { isArrayNotEmpty } from '../util/helpers';
import {
  innerHorizontalCompetitionListAction,
  updateInnerHorizontalData,
  initializeCompData,
} from '../store/actions/LiveScoreAction/liveScoreInnerHorizontalAction';
import {
  getLiveScoreCompetition,
  getGlobalYear,
  setGlobalYear,
  getOrganisationData,
} from '../util/sessionStorage';
import history from '../util/history';
import { getOnlyYearListAction, CLEAR_OWN_COMPETITION_DATA } from '../store/actions/appAction';
import { clearDataOnCompChangeAction } from '../store/actions/LiveScoreAction/liveScoreMatchAction';
import { FLAVOUR, OrganisationType, MenuKey } from '../util/enums';
import { TeamRegistrationChargeType } from '../enums/registrationEnums';

const { SubMenu } = Menu;
const { Option } = Select;

class InnerHorizontalMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      organisationLevel: '',
      selectedComp: null,
      loading: false,
      orgId: null,
      orgState: false,
      liveScoreCompIsParent: false,
      yearId: null,
      yearLoading: false,
      defaultYear: null,
      userAccessPermission: '',
      userRoleId: getUserRoleId(),
      count: 0,
      isImpersonation: false,
      isUserSuperAdmin: false,
    };
  }

  async componentDidMount() {
    const impersonation = localStorage.getItem('Impersonation') === 'true';
    this.setState({
      isImpersonation: impersonation,
    });
    if (getLiveScoreCompetition()) {
      const { id } = JSON.parse(getLiveScoreCompetition());
      const yearRefId = getGlobalYear() ? getGlobalYear() : localStorage.getItem('yearId');
      this.setState({ selectedComp: id, yearId: yearRefId });
    }
    if (this.props.menu === 'liveScore') {
      this.props.getOnlyYearListAction(this.props.appState.yearList);
      this.setState({ yearLoading: true });
    }

    checkOrganisationLevel().then(value =>
      this.setState({ organisationLevel: value, orgState: true }),
    );
    checkUserSuperAdmin().then(value => {
      this.setState({ isUserSuperAdmin: value });
    });
    this.setLivScoreCompIsParent();
    if (this.props) {
      if (this.props.compSelectedKey !== '18') {
        localStorage.removeItem('draws_roundTime');
        localStorage.removeItem('draws_round');
        localStorage.removeItem('draws_venue');
      }
    }
  }

  async componentDidUpdate(nextProps) {
    if (this.props.userState.onLoad === false && this.state.orgState) {
      const { organisationId } = getOrganisationData() || {};
      if (organisationId) {
        if (this.props.menu === 'liveScore') {
          if (nextProps.appState === this.props.appState) {
            if (this.props.appState.onLoad === false && this.state.yearLoading === true) {
              const yearId =
                this.props.appState.yearList.length > 0 && this.props.appState.yearList[0].id;
              const yearRefId = getGlobalYear() ? getGlobalYear() : localStorage.getItem('yearId');
              if (yearRefId) {
                if (!this.props.innerHorizontalState.error) {
                  this.props.innerHorizontalCompetitionListAction(
                    organisationId,
                    yearRefId,
                    this.props.innerHorizontalState.competitionList,
                  );
                }

                this.setState({
                  yearLoading: false,
                  loading: true,
                  orgId: organisationId,
                  orgState: false,
                  yearId: yearRefId,
                });
              } else {
                if (!this.props.innerHorizontalState.error) {
                  this.props.innerHorizontalCompetitionListAction(
                    organisationId,
                    yearId,
                    this.props.innerHorizontalState.competitionList,
                  );
                }
                this.setState({
                  yearLoading: false,
                  loading: true,
                  orgId: organisationId,
                  orgState: false,
                  yearId,
                });
              }
            }
          }
        }
      }
    }

    if (nextProps.innerHorizontalState !== this.props.innerHorizontalState) {
      if (this.state.loading && this.props.innerHorizontalState.onLoad === false) {
        const compList = isArrayNotEmpty(this.props.innerHorizontalState.competitionList)
          ? this.props.innerHorizontalState.competitionList
          : [];
        const { organisationId } = getOrganisationData() || {};
        if (!isArrayNotEmpty(compList)) {
          message.config({
            duration: 1.5,
            maxCount: 1,
          });
          if (this.state.count < 1) {
            message.info(AppConstants.noCompetitionYear, 1.5);
          }

          const defaultYear = localStorage.getItem('defaultYearId');
          // let defaultYear = getGlobalYear()
          this.setState({ yearId: defaultYear, loading: true });
          localStorage.setItem('yearId', defaultYear);
          setGlobalYear(defaultYear);
          if (!this.props.innerHorizontalState.error && this.state.count < 1) {
            if (organisationId && defaultYear) {
              this.props.innerHorizontalCompetitionListAction(
                organisationId,
                defaultYear,
                this.props.innerHorizontalState.competitionList,
              );
            }
            this.setState({ count: this.state.count + 1 });
          }
          return;
        }

        let firstComp = 1;
        const isCompetition = await getLiveScoreCompetition();
        const yearValue = localStorage.getItem('yearValue');

        if (yearValue === 'true') {
          firstComp = compList.length > 0 && compList[0].id;
          localStorage.setItem('yearValue', 'false');
          localStorage.setItem('LiveScoreCompetition', JSON.stringify(compList[0]));
        } else if (isCompetition) {
          const { id } = JSON.parse(isCompetition);
          firstComp = id;
        } else {
          firstComp = compList.length > 0 && compList[0].id;
        }

        this.setState({ selectedComp: firstComp, compArray: compList, loading: false });
        this.setLivScoreCompIsParent();
      }
    }
  }

  setLivScoreCompIsParent = () => {
    const liveScoreCompIsParent = checkLivScoreCompIsParent();
    this.setState({ liveScoreCompIsParent });
  };

  setCompetitionID = compId => {
    this.setState({ selectedComp: compId });
    let compObj = null;
    for (const i in this.state.compArray) {
      if (compId === this.state.compArray[i].id) {
        compObj = this.state.compArray[i];
        break;
      }
    }
    this.props.clearDataOnCompChangeAction();
    localStorage.setItem('LiveScoreCompetition', JSON.stringify(compObj));
    history.push('/matchDayDashboard');
  };

  setYearId = yearId => {
    this.props.updateInnerHorizontalData();
    localStorage.setItem('yearValue', 'true');
    this.setState({ yearId, loading: true });
    // localStorage.setItem("LiveScoreCompetition", undefined);
    localStorage.setItem('yearId', yearId);
    setGlobalYear(yearId);
    const { organisationId } = getOrganisationData() || {};
    this.props.clearDataOnCompChangeAction();
    if (organisationId) {
      this.props.innerHorizontalCompetitionListAction(
        organisationId,
        yearId,
        this.props.innerHorizontalState.competitionList,
      );
    }

    history.push('/matchDayDashboard');
  };

  handleMenuClick = async () => {
    await this.props.clearDataOnCompChangeAction();
    await this.props.CLEAR_OWN_COMPETITION_DATA('all');
  };

  render() {
    const orgLevel = this.state.organisationLevel;
    const { menu, selectedKey } = this.props;
    const { competitionList } = this.props.innerHorizontalState;
    const compList = isArrayNotEmpty(competitionList) ? competitionList : [];
    const { liveScoreCompIsParent } = this.state;
    const { yearList } = this.props.appState;
    const { userRoleId } = this.state;
    const showQuickComp = process.env.REACT_APP_SHOW_QUICKCOMPETITION === 'true';
    let isSingleGameEnabled = 0;
    let hasIndividualPerMatchFee = true;
    let hasTeamPerMatchFee = false;
    let liveScoreCompetition = getLiveScoreCompetition();
    if (liveScoreCompetition) {
      liveScoreCompetition = JSON.parse(liveScoreCompetition);
      isSingleGameEnabled = liveScoreCompetition.isSingleGameEnabled;
      // hasIndividualPerMatchFee =
      //   liveScoreCompetition.teamRegChargeTypeRefId ==
      //   TeamRegistrationChargeType.IndividualPerMatchPlayed;
      hasTeamPerMatchFee =
        liveScoreCompetition.teamRegChargeTypeRefId == TeamRegistrationChargeType.TeamPerMatch;
    }
    const showTeamPreference = process.env.REACT_APP_TEAM_PREFERENCES_FOR_DRAW === 'true';

    const { organisationTypeRefId, hasMembershipFees } = getOrganisationData() || {};
    const hasAssociationMembership = organisationTypeRefId > 2 && hasMembershipFees == 1;

    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <div className="menu-root">
        {menu === 'competition' && (
          <Menu
            // className="nav-collapse collapse"
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
            selectedKeys={[this.props.compSelectedKey]}
            onClick={() => this.props.clearDataOnCompChangeAction()}
          >
            <Menu.Item key="1">
              <NavLink
                onClick={() => this.props.CLEAR_OWN_COMPETITION_DATA('all')}
                to="/competitionDashboard"
              >
                Dashboard
              </NavLink>
            </Menu.Item>

            <SubMenu
              key="sub1"
              data-testid={AppUniqueId.own_Competitions}
              title={<span id={AppUniqueId.own_comp_tab}>Own Competitions</span>}
            >
              {showQuickComp ? (
                <Menu.Item key="2">
                  <NavLink to="/quickCompetition">
                    <span
                      onClick={() => this.props.CLEAR_OWN_COMPETITION_DATA('all')}
                      id={AppUniqueId.quick_comp_subtab}
                    >
                      Quick Competition
                    </span>
                  </NavLink>
                </Menu.Item>
              ) : null}

              <Menu.Item key="3">
                <NavLink to="/competitionOpenRegForm">
                  <span
                    id={AppUniqueId.comp_details_subtab}
                    data-testid={AppUniqueId.COMPETITION_DETAILS_SUBMENU}
                  >
                    {' '}
                    Competition Details
                  </span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="4">
                <NavLink to="/competitionPlayerGrades">
                  <span
                    id={AppUniqueId.player_grad_subtab}
                    data-testid={AppUniqueId.own_CompetitionsPlayerGrading}
                  >
                    Player Grading
                  </span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="5">
                <NavLink to="/competitionPartTeamGradeCalculate">
                  <span id={AppUniqueId.team_grad_subtab}>Team Grading</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="6">
                <NavLink to="/competitionCourtAndTimesAssign">
                  <span id={AppUniqueId.timeslots_subtab}>Time Slots</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="7">
                <NavLink to="/competitionVenueTimesPrioritisation">
                  <span id={AppUniqueId.venues_subtab}>Venues</span>
                </NavLink>
              </Menu.Item>
              {showTeamPreference && (
                <Menu.Item key="comp_19">
                  <NavLink to="/competitionTeamPreference">
                    <span>{AppConstants.preferences}</span>
                  </NavLink>
                </Menu.Item>
              )}
              {/*
                            <Menu.Item key="8">
                                <NavLink to="/competitionLadder">
                                    <span>Ladder</span>
                                </NavLink>
                            </Menu.Item>
                            */}
              <Menu.Item key="9">
                <NavLink to="/competitionFormat">
                  <span id={AppUniqueId.comp_formats_subtab}>Competition Format</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="10">
                <NavLink to="/competitionFinals">
                  <span id={AppUniqueId.finals_subtab}>Finals</span>
                </NavLink>
              </Menu.Item>
              {/*
                            <Menu.Item key="11">
                                <a href="http://clixlogix.org/test/netball/fixtures.html">Fixtures</a>
                                <NavLink to="competitionFixtures">
                                    Fixtures
                                </NavLink>
                            </Menu.Item>
                            */}
              <Menu.Item key="18">
                {/* <a href="https://comp-management-test.firebaseapp.com/competitions-draws.html">Draws</a> */}
                <NavLink to="/competitionDraws">
                  {/* <span id={AppUniqueId.draws_subtab}>Draws</span> */}
                  <span>Draws</span>
                </NavLink>
              </Menu.Item>
              {/*
                            <SubMenu
                                key="sub2"
                                title={
                                    <span>Draw</span>
                                }
                            >
                                <Menu.Item key="13">
                                    <NavLink to="/competitionReGrading">
                                        <span>Re-grading</span>
                                    </NavLink>
                                </Menu.Item>
                                <Menu.Item key="18">
                                    <a href="https://comp-management-test.firebaseapp.com/competitions-draws.html">Draws</a>
                                    <NavLink to="/competitionDraws">
                                        <span>Draws</span>
                                    </NavLink>
                                </Menu.Item>
                            </SubMenu> */}
            </SubMenu>

            <SubMenu
              key="sub3"
              title={
                <span id={AppUniqueId.participating_in_comp_tab}>
                  Participating-In Competitions
                </span>
              }
            >
              <Menu.Item key="14">
                <NavLink to="/competitionPartPlayerGrades">
                  <span id={AppUniqueId.playergrad_particip_tab}>Player Grading</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="15">
                <NavLink to="/competitionPartProposedTeamGrading">
                  <span id={AppUniqueId.teamgrad_particip_tab}>Team Grading</span>
                </NavLink>
              </Menu.Item>
              {showTeamPreference && (
                <Menu.Item key="comp_20">
                  <NavLink to="/competitionPartTeamPreference">
                    <span>{AppConstants.preferences}</span>
                  </NavLink>
                </Menu.Item>
              )}
            </SubMenu>
          </Menu>
        )}

        {menu === 'registration' && (
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
            selectedKeys={[this.props.regSelectedKey]}
            onClick={this.handleMenuClick}
          >
            <Menu.Item key="1">
              <NavLink to="/registrationDashboard">
                <span>Dashboard</span>
              </NavLink>
            </Menu.Item>
            <SubMenu key="sub4" title={<span>Registrations</span>}>
              <Menu.Item key="2">
                <NavLink to="/registration">
                  <span>Registrations</span>
                </NavLink>
              </Menu.Item>
              {!!isFootball && (
                <Menu.Item key="12">
                  <NavLink to="/externalRegistrations">
                    <span>{AppConstants.externalRegistrations}</span>
                  </NavLink>
                </Menu.Item>
              )}
              <Menu.Item key="11">
                <NavLink to="/clearances">
                  <span>{AppConstants.registrationClearances}</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="10">
                <NavLink to="/teamRegistrations">
                  <span>Team Registrations</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="9">
                <NavLink to="/registrationChange">
                  <span>Registration Change</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="8">
                <NavLink to="/netSetGo">
                  <span>{AppConstants.netSetGo}</span>
                </NavLink>
              </Menu.Item>
            </SubMenu>
            {(orgLevel === AppConstants.national ||
              orgLevel === AppConstants.state ||
              hasAssociationMembership) && (
              // <Menu.Item key="6">
              //     <NavLink to="/registrationMembershipList">
              //         <span>Membership</span>
              //     </NavLink>
              // </Menu.Item>
              // (orgLevel === AppConstants.state ?
              <SubMenu key="sub5" title={<span>{AppConstants.dashboardMembershipHeader}</span>}>
                <Menu.Item key="4">
                  <NavLink to="/registrationMembershipList">
                    <span>{AppConstants.dashboardMemberShipFeesHeader}</span>
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="5">
                  <NavLink to="/registrationMembershipCap">
                    <span>{AppConstants.dashboardMemberShipCapHeader}</span>
                  </NavLink>
                </Menu.Item>
              </SubMenu>
              // )
              // : (
              //   <Menu.Item key="4">
              //     <NavLink to="/registrationMembershipList">
              //       <span>Membership</span>
              //     </NavLink>
              //   </Menu.Item>
              // )
            )}
            <SubMenu key="sub1" title={<span>Competition</span>}>
              <Menu.Item key="7">
                <NavLink to="/registrationCompetitionList">
                  <span>Competition</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="3">
                <NavLink to="/registrationFormList">
                  <span>Registration Form</span>
                </NavLink>
              </Menu.Item>
            </SubMenu>

            {/* <Menu.Item key="9">De-registration forms</Menu.Item> */}
          </Menu>
        )}

        {menu === 'liveScore' && (
          <div className="row mr-0">
            <div className="col-sm pr-0">
              <Menu
                theme="light"
                mode="horizontal"
                defaultSelectedKeys={['1']}
                style={{ lineHeight: '64px' }}
                selectedKeys={[this.props.liveScoreSelectedKey]}
                onClick={this.handleMenuClick}
              >
                <Menu.Item key="1">
                  <NavLink to="/matchDayDashboard">
                    <span>Dashboard</span>
                  </NavLink>
                </Menu.Item>
                <SubMenu
                  key="sub1"
                  title={<span>Competition Details</span>}
                  data-testid={AppUniqueId.MENU_COMPETITION_DETAILS}
                >
                  <Menu.Item key="2" data-testid={AppUniqueId.SUBMENU_MATCHES}>
                    <NavLink to={{ pathname: '/matchDayMatches' }}>
                      <span>Matches</span>
                    </NavLink>
                  </Menu.Item>
                  <Menu.Item key="3">
                    <NavLink to="/matchDayTeam">
                      <span>Teams</span>
                    </NavLink>
                  </Menu.Item>
                  <Menu.Item key="4">
                    <NavLink to="/matchDayManagerList">
                      <span>Managers</span>
                    </NavLink>
                  </Menu.Item>
                  <Menu.Item key="23">
                    <NavLink to="/matchDayCoaches">
                      <span>Coaches</span>
                    </NavLink>
                  </Menu.Item>
                  <Menu.Item key="5">
                    <NavLink to="/matchDayScorerList">
                      <span>Scorers</span>
                    </NavLink>
                  </Menu.Item>
                  <Menu.Item key="6">
                    <NavLink
                      to={{
                        pathname: '/umpireDashboard',
                        state: {
                          liveScoreUmpire: 'liveScoreUmpire',
                          isParticipate: !liveScoreCompIsParent,
                        },
                      }}
                    >
                      <span>{AppConstants.umpires}</span>
                    </NavLink>
                  </Menu.Item>
                  <Menu.Item key="7">
                    <NavLink to="/matchDayPlayerList">
                      <span>Players</span>
                    </NavLink>
                  </Menu.Item>
                  <Menu.Item key="8">
                    <NavLink to="/userAffiliatesList">
                      <span>Affiliates</span>
                    </NavLink>
                  </Menu.Item>
                  <Menu.Item key="9">
                    <NavLink to="/matchDayDivisionList">
                      <span>{AppConstants.divisions}</span>
                    </NavLink>
                  </Menu.Item>
                  <Menu.Item key="10">
                    <NavLink to="/venuesList">
                      <span>Venues</span>
                    </NavLink>
                  </Menu.Item>
                  <Menu.Item key="11">
                    <NavLink to="/matchDayLadderList">
                      <span>Ladder</span>
                    </NavLink>
                  </Menu.Item>
                </SubMenu>
                <SubMenu
                  key="sub2"
                  data-testid={AppUniqueId.MATCH_DAY_MENU}
                  title={<span>Match Day</span>}
                >
                  {liveScoreCompIsParent && (
                    <Menu.Item key="12">
                      <NavLink to="/matchDayBulkChange">
                        <span>Bulk Match Change</span>
                      </NavLink>
                    </Menu.Item>
                  )}
                  {liveScoreCompIsParent && (
                    <Menu.Item key="13">
                      <NavLink to="/matchDayVenueChange">
                        <span>{AppConstants.courtChange}</span>
                      </NavLink>
                    </Menu.Item>
                  )}
                  <Menu.Item key="14" data-testid={AppUniqueId.SUBMENU_TEAM_ATTENDANCE}>
                    <NavLink to="/matchDayTeamAttendance">
                      <span>{AppConstants.teamAttendance}</span>
                    </NavLink>
                  </Menu.Item>
                  <SubMenu key="sub3" title={<span>Statistics</span>}>
                    <Menu.Item key="15">
                      <NavLink to="/matchDayGameTimeList">
                        <span>Game Time</span>
                      </NavLink>
                    </Menu.Item>
                    {/*
                    <Menu.Item key="16">
                        <NavLink to="/liveScoreShooting">
                            <span>Shooting</span>
                        </NavLink>
                    </Menu.Item>
                    */}
                    <Menu.Item key="matchDayGoalsList">
                      <NavLink to="/matchDayGoalsList">
                        <span>{AppConstants.menuGoals}</span>
                      </NavLink>
                    </Menu.Item>
                    {!!isFootball && (
                      <Menu.Item key="matchDayFoulsList">
                        <NavLink to="/matchDayFoulsList">
                          <span>{AppConstants.menuFouls}</span>
                        </NavLink>
                      </Menu.Item>
                    )}

                    {isNetball && (
                      <Menu.Item key="24">
                        <NavLink to="/matchDayPositionTrackReport">
                          <span>Position Tracking</span>
                        </NavLink>
                      </Menu.Item>
                    )}
                    {isFootball && (
                      <Menu.Item key="25">
                        <NavLink to="/matchDayEnhancedStatistics">
                          <span>Enhanced Statistics</span>
                        </NavLink>
                      </Menu.Item>
                    )}
                    {/* {isFootball && (
                      <Menu.Item key="26">
                        <NavLink to="/matchDayPlayerStatistics">
                          <span>{AppConstants.playerStatistics}</span>
                        </NavLink>
                      </Menu.Item>
                    )} */}
                  </SubMenu>
                  <Menu.Item key="17">
                    <NavLink to="/matchDayIncidentList">
                      <span>Incidents</span>
                    </NavLink>
                  </Menu.Item>
                  <Menu.Item key="bestOnCourt">
                    <NavLink
                      to={{
                        pathname: '/bestOnCourt',
                        typeRefId: 1,
                      }}
                    >
                      <span>{AppConstants.bestAndFairest}</span>
                    </NavLink>
                  </Menu.Item>
                  <Menu.Item key="votedAwardBestAndFairest">
                    <NavLink
                      to={{
                        pathname: '/bestAndFairest',
                        typeRefId: 2,
                      }}
                    >
                      <span>{AppConstants.votedAwardBestAndFairest}</span>
                    </NavLink>
                  </Menu.Item>
                  {!liveScoreCompIsParent && (
                    <Menu.Item key="organisationAwards">
                      <NavLink
                        to={{
                          pathname: '/bestAndFairest',
                          typeRefId: 3,
                        }}
                      >
                        <span>{AppConstants.ourOrganisationAwards}</span>
                      </NavLink>
                    </Menu.Item>
                  )}
                </SubMenu>

                <SubMenu
                  key="sub4"
                  title={<span>Settings</span>}
                  data-testid={AppUniqueId.MENU_SETTINGS}
                >
                  {liveScoreCompIsParent && (
                    <Menu.Item key="18" data-testid={AppUniqueId.SUBMENU_SETTINGS}>
                      <NavLink
                        to={{
                          pathname: '/matchDaySettingsView',
                          state: 'edit',
                        }}
                      >
                        <span>Settings</span>
                      </NavLink>
                    </Menu.Item>
                  )}

                  {!liveScoreCompIsParent && (
                    <Menu.Item key="18">
                      <NavLink
                        to={{
                          pathname: '/matchDaySettingsViewForAffiliate',
                          state: 'edit',
                        }}
                      >
                        <span>Settings</span>
                      </NavLink>
                    </Menu.Item>
                  )}

                  {liveScoreCompIsParent && (
                    <Menu.Item key="19">
                      <NavLink to="/matchDayLadderSettings">
                        <span>Ladder/Draw</span>
                      </NavLink>
                    </Menu.Item>
                  )}

                  {liveScoreCompIsParent && (
                    <Menu.Item key="20">
                      <NavLink to="/matchDayBanners">
                        <span>Banners</span>
                      </NavLink>
                    </Menu.Item>
                  )}

                  <Menu.Item key="22">
                    <NavLink to="/matchDayMatchSheet">
                      <span>Match Sheets</span>
                    </NavLink>
                  </Menu.Item>
                </SubMenu>

                {liveScoreCompIsParent && (
                  <Menu.Item key="21">
                    <NavLink to="/matchDayNewsList">
                      <span>News & Messages</span>
                    </NavLink>
                  </Menu.Item>
                )}

                <SubMenu key="payments" title={<span>{AppConstants.payments}</span>}>
                  <Menu.Item key="payments_1">
                    <NavLink to="/feesDue">
                      <span>{AppConstants.feesDue}</span>
                    </NavLink>
                  </Menu.Item>

                  {isSingleGameEnabled == 1 && (
                    <Menu.Item key="payments_2">
                      <NavLink to="/matchDaySingleGameFee">
                        <span>{AppConstants.singleGameFees}</span>
                      </NavLink>
                    </Menu.Item>
                  )}
                  {liveScoreCompIsParent && hasIndividualPerMatchFee && (
                    <Menu.Item key="payments_3">
                      <NavLink to="/matchDayFeesPerMatch">
                        <span>{AppConstants.feesPerMatch}</span>
                      </NavLink>
                    </Menu.Item>
                  )}
                  {liveScoreCompIsParent && hasTeamPerMatchFee && (
                    <Menu.Item key="teamPerMatchFee">
                      <NavLink to="/teamPerMatchFee">
                        <span>{AppConstants.teamPerMatchFees}</span>
                      </NavLink>
                    </Menu.Item>
                  )}
                </SubMenu>
              </Menu>
            </div>

            <div className="inner-horizontal-Comp-year-dropdown-div">
              <div className="inner-horizontal-dropdown-marginTop">
                <Select
                  style={{ width: 90 }}
                  className="year-select reg-filter-select1 ml-5"
                  // onChange={this.setYearId}
                  onChange={yearId => this.setYearId(yearId)}
                  value={JSON.parse(this.state.yearId)}
                >
                  {yearList.map(item => (
                    <Option key={`year_${item.id}`} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="col-sm-2 pr-5 inner-horizontal-dropdown-marginTop inner-horizontal-Comp-dropdown-div">
                <Select
                  style={{ width: 'fit-content', minWidth: 190, maxWidth: 220 }}
                  className="year-select reg-filter-select1 innerSelect-value"
                  onChange={this.setCompetitionID}
                  value={compList.length ? this.state.selectedComp : ''}
                >
                  {compList.map(item => (
                    <Option key={`competition_${item.id}`} value={item.id}>
                      {item.longName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        )}

        {menu === 'umpire' && (
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
            selectedKeys={[this.props.umpireSelectedKey]}
            onClick={this.handleMenuClick}
          >
            <Menu.Item key="1">
              <NavLink to="/umpireDashboard">
                <span>{AppConstants.dashboard}</span>
              </NavLink>
            </Menu.Item>
            <SubMenu key="Umpires" title={<span>{AppConstants.officials}</span>}>
              <Menu.Item key="2">
                <NavLink to="/umpire">
                  <span>{AppConstants.officials}</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="3">
                <NavLink to="/umpireRoster">
                  <span>{AppConstants.umpireRoster}</span>
                </NavLink>
              </Menu.Item>
              {process.env.REACT_APP_FLAVOUR !== FLAVOUR.Netball && (
                <Menu.Item key="10">
                  <NavLink to="/umpireActivity">
                    <span>{AppConstants.umpireActivity}</span>
                  </NavLink>
                </Menu.Item>
              )}
              <Menu.Item key="umpireAvailability">
                <NavLink to="/umpireAvailability">
                  <span>{AppConstants.umpireAvailability}</span>
                </NavLink>
              </Menu.Item>
              <SubMenu key="umpireAllocation" title={<span>{AppConstants.umpireAllocation}</span>}>
                <Menu.Item key="6">
                  <NavLink to="/umpireSetting">
                    <span>{AppConstants.settings}</span>
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="5">
                  <NavLink to="/umpirePoolAllocation">
                    <span>{AppConstants.umpirePools}</span>
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="4">
                  <NavLink to="/umpireDivisions">
                    <span>{AppConstants.divisions}</span>
                  </NavLink>
                </Menu.Item>
              </SubMenu>
            </SubMenu>
            <SubMenu key="payments" title={<span>{AppConstants.payments}</span>}>
              <Menu.Item key="7">
                <NavLink to="/umpirePayment">
                  <span>{AppConstants.payments}</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="9">
                <NavLink to="/umpirePaymentSetting">
                  <span>{AppConstants.settings}</span>
                </NavLink>
              </Menu.Item>
            </SubMenu>
          </Menu>
        )}

        {menu === 'user' && (
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
            selectedKeys={[this.props.userSelectedKey]}
            onClick={this.handleMenuClick}
          >
            <Menu.Item key="1">
              <NavLink to="/userTextualDashboard">
                <span>{AppConstants.dashboard}</span>
              </NavLink>
            </Menu.Item>
            {!isReadOnlyRole() ? (
              <>
                <SubMenu key="sub2" title={<span>{AppConstants.users}</span>}>
                  <Menu.Item key="5">
                    <NavLink to="/playWithFriend">
                      <span>{AppConstants.playWithAFriend}</span>
                    </NavLink>
                  </Menu.Item>
                  <Menu.Item key="6">
                    <NavLink to="/referFriend">
                      <span>{AppConstants.referaFriend}</span>
                    </NavLink>
                  </Menu.Item>
                  <Menu.Item key="8">
                    <NavLink to="/duplicateUsers">
                      <span>{AppConstants.duplicateUsers}</span>
                    </NavLink>
                  </Menu.Item>
                  {organisationTypeRefId === OrganisationType.National && (
                    <Menu.Item key="7">
                      <NavLink to="/registrationFormSubmissions">
                        <span>{AppConstants.registrationFormSubmissions}</span>
                      </NavLink>
                    </Menu.Item>
                  )}
                </SubMenu>

                <SubMenu
                  key="sub1"
                  title={<span>{AppConstants.administrators} </span>}
                  data-testid={AppUniqueId.ADMINISTRATORS_MENU}
                >
                  <Menu.Item key="2">
                    <NavLink to="/userAffiliatesList">
                      <span>{AppConstants.affiliates}</span>
                    </NavLink>
                  </Menu.Item>
                  <Menu.Item key="3" data-testid={AppUniqueId.OUR_ORGANIZATION_SUBMENU}>
                    <NavLink to="/userOurOrganisation">
                      <span>{AppConstants.ourOrganisation}</span>
                    </NavLink>
                  </Menu.Item>
                  {!isFootball ? (
                    <Menu.Item key="4">
                      <NavLink to="/affiliateDirectory">
                        <span>{AppConstants.affiliateDirectory}</span>
                      </NavLink>
                    </Menu.Item>
                  ) : (
                    <> </>
                  )}
                </SubMenu>
              </>
            ) : null}
          </Menu>
        )}

        {menu === 'home' && userRoleId === 2 && (
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
            selectedKeys={[this.props.userSelectedKey]}
            onClick={this.handleMenuClick}
          >
            <Menu.Item key="1">
              <NavLink to="/homeDashboard">
                <span id={AppConstants.homeTab}>{AppConstants.home}</span>
              </NavLink>
            </Menu.Item>
            <SubMenu
              key="sub1"
              title={<span id={AppConstants.maintain_tab}>{AppConstants.maintain}</span>}
            >
              <Menu.Item key="2">
                <NavLink to="/venuesList">
                  <span id={AppConstants.venue_courtId}>{AppConstants.venueAndCourts}</span>
                </NavLink>
              </Menu.Item>
            </SubMenu>
            <Menu.Item key="3">
              <NavLink to="/systemUpdates">
                <span id={AppConstants.systemUpdatesTab}>{AppConstants.systemUpdates}</span>
              </NavLink>
            </Menu.Item>
          </Menu>
        )}

        {menu === 'shop' && (
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
            selectedKeys={[this.props.shopSelectedKey]}
            onClick={this.handleMenuClick}
          >
            {/* <Menu.Item key="1">
                            <NavLink to="/shopDashboard">
                                <span>{AppConstants.dashboard}</span>
                            </NavLink>
                        </Menu.Item> */}

            <SubMenu key="sub2" title={<span>{AppConstants.orders}</span>}>
              <Menu.Item key="3">
                <NavLink to="/orderSummary">
                  <span>{AppConstants.orderSummary}</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="5">
                <NavLink to="/orderStatus">
                  <span>{AppConstants.orderStatus}</span>
                </NavLink>
              </Menu.Item>
            </SubMenu>
            <Menu.Item key="2">
              <NavLink to="/listProducts">
                <span>{AppConstants.products}</span>
              </NavLink>
            </Menu.Item>
            <Menu.Item key="4">
              <NavLink to="/shopSettings">
                <span>{AppConstants.settings}</span>
              </NavLink>
            </Menu.Item>
          </Menu>
        )}

        {menu === 'finance' && (
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
            selectedKeys={[this.props.finSelectedKey]}
            onClick={this.handleMenuClick}
          >
            <SubMenu key="sub2" title={<span>Dashboard</span>}>
              <Menu.Item key="6">
                <NavLink to="/SummaryByParticipantAggregate">
                  <span>Dashboard</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="1">
                <NavLink to="/paymentDashboard">
                  <span>{AppConstants.payments}</span>
                </NavLink>
              </Menu.Item>
              {this.state.isUserSuperAdmin && (
                <Menu.Item key="7">
                  <NavLink to="/paymentSummary">
                    <span>{AppConstants.financialSummary}</span>
                  </NavLink>
                </Menu.Item>
              )}
              <Menu.Item key="27">
                <NavLink to="/paymentPlanDashboard">
                  <span>{AppConstants.paymentPlan}</span>
                </NavLink>
              </Menu.Item>
            </SubMenu>
            <Menu.Item key="2" disabled={this.state.isImpersonation}>
              <NavLink to="/registrationPayments">
                <span>Payment Gateway</span>
              </NavLink>
              {/* <a href="https://comp-management-test.firebaseapp.com/payment-dashboard.html">Payments</a> */}
            </Menu.Item>
            <Menu.Item key="3" disabled={this.state.isImpersonation}>
              <NavLink to="/registrationSettlements">
                <span>Payouts</span>
              </NavLink>
            </Menu.Item>
            {/* <Menu.Item key="4" disabled={this.state.isImpersonation}>
                            <NavLink to="/registrationRefunds">
                                <span>Refunds</span>
                            </NavLink>
                        </Menu.Item> */}
          </Menu>
        )}

        {menu === 'account' && <AccountMenu selectedKey={selectedKey} />}

        {menu === 'liveScoreNews' && (
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
            selectedKeys={[this.props.liveScoreNewsSelectedKey]}
            onClick={this.handleMenuClick}
          >
            <Menu.Item key="21">
              <NavLink to="/matchDayNewsList">
                <span>News & Messages</span>
              </NavLink>
            </Menu.Item>
          </Menu>
        )}

        {menu === 'communication' && (
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
            selectedKeys={[this.props.userSelectedKey]}
            onClick={this.handleMenuClick}
          >
            <Menu.Item key="1">
              <NavLink to="/CommunicationList">
                <span>{AppConstants.dashboard}</span>
              </NavLink>
            </Menu.Item>
            {/* {orgLevel === AppConstants.state && (
              <Menu.Item key="2">
                <NavLink to="/communication">
                  <span>{AppConstants.banners}</span>
                </NavLink>
              </Menu.Item>
            )} */}
          </Menu>
        )}
        {menu === 'advertising' && (
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
            selectedKeys={[this.props.userSelectedKey]}
            onClick={this.handleMenuClick}
          >
            <Menu.Item key="1">
              <NavLink to="/engagementList">
                <span>{AppConstants.engagement}</span>
              </NavLink>
            </Menu.Item>
            <Menu.Item key="2">
              <NavLink to="/advertising">
                <span>{AppConstants.banners}</span>
              </NavLink>
            </Menu.Item>
          </Menu>
        )}
        {menu === MenuKey.Websites && (
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
            selectedKeys={[this.props.userSelectedKey]}
            onClick={this.handleMenuClick}
          >
            <Menu.Item key="1">
              <NavLink to="/pagemanagement">
                <span>{AppConstants.content}</span>
              </NavLink>
            </Menu.Item>
            <Menu.Item key="2">
              <NavLink to="/newsmanagement">
                <span>{AppConstants.news}</span>
              </NavLink>
            </Menu.Item>
            <Menu.Item key="3">
              <NavLink to="/websitesettings">
                <span>{AppConstants.settings}</span>
              </NavLink>
            </Menu.Item>
          </Menu>
        )}
        {menu === 'matchDay' && (
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
            selectedKeys={[this.props.userSelectedKey]}
            onClick={this.handleMenuClick}
          >
            <Menu.Item key="1">
              <NavLink to="/matchDayCompetitions">
                <span>{AppConstants.dashboard}</span>
              </NavLink>
            </Menu.Item>
            {process.env.REACT_APP_SUSPENSIONS === 'true' && (
              <Menu.Item key="2">
                <NavLink to="/matchDaySuspensions">
                  <span>{AppConstants.suspensions}</span>
                </NavLink>
              </Menu.Item>
            )}
          </Menu>
        )}
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      innerHorizontalCompetitionListAction,
      getOnlyYearListAction,
      updateInnerHorizontalData,
      initializeCompData,
      clearDataOnCompChangeAction,
      CLEAR_OWN_COMPETITION_DATA,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    innerHorizontalState: state.InnerHorizontalState,
    userState: state.UserState,
    appState: state.AppState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(InnerHorizontalMenu);
