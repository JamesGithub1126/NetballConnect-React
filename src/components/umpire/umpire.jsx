import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Input, Layout, Button, Table, Select, Menu, Pagination, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getRefBadgeData, getOnlyYearListAction } from '../../store/actions/appAction';

import AppConstants from 'themes/appConstants';
import AppImages from 'themes/appImages';
import ValidationConstants from 'themes/validationConstant';
// import { entityTypes } from "util/entityTypes";
import { isArrayNotEmpty } from 'util/helpers';
import history from 'util/history';
import { getCurrentYear } from 'util/permissions';
import {
  getUmpireCompetitionId,
  getOrganisationData,
  getGlobalYear,
  setGlobalYear,
  getLiveScoreCompetition,
  setCompDataForAll,
} from 'util/sessionStorage';
import { userExportFilesAction } from 'store/actions/appAction';
import {
  umpireMainListAction,
  setUmpireListPageSizeAction,
  setUmpireListPageNumberAction,
  getUmpireList,
  getRankedUmpiresCount,
  exportUmpireListAction,
  updateUmpireRank,
} from 'store/actions/umpireAction/umpireAction';
import { umpireYearChangedAction } from 'store/actions/umpireAction/umpireDashboardAction';
import { umpireCompetitionListAction } from 'store/actions/umpireAction/umpireCompetetionAction';
import { getUmpireAllocationSettings } from '../../store/actions/umpireAction/umpireSettingAction';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';
import { isEqual } from 'lodash';

import './umpire.css';
import { RegistrationUserRoles } from 'enums/registrationEnums';

const { Content } = Layout;
const { Option } = Select;

let this_obj = null;

const listeners = key => ({
  onClick: () => tableSort(key),
});

function checkUserRoll(rolesArr, index) {
  let isClub = 'NO';
  if (isArrayNotEmpty(rolesArr)) {
    for (let i in rolesArr) {
      let roleId = rolesArr[i].roleId;
      if (roleId === 20) {
        isClub = 'YES';
      }
    }
  }
  return isClub;
}

function checkUmpireUserRoll(rolesArr, key) {
  let isUmpire = 'NO';
  if (isArrayNotEmpty(rolesArr)) {
    for (let i in rolesArr) {
      if (rolesArr[i].roleId === key) {
        isUmpire = 'YES';
      }
    }
  }
  return isUmpire;
}

function checkOtherOfficalRoles(rolesArr) {
  let isOtherOfficial = 'NO';
  if (isArrayNotEmpty(rolesArr)) {
    for (let i in rolesArr) {
      if (rolesArr[i].roleId === RegistrationUserRoles.OtherOfficial) {
        isOtherOfficial = 'YES';
      }
    }
  }
  return isOtherOfficial;
}

function tableSort(key) {
  let sortBy = key;
  let sortOrder = null;
  const { organisationId } = getOrganisationData() || {};
  const { pageSize_Data } = this_obj.props.umpireState;
  if (this_obj.state.sortBy !== key) {
    sortOrder = 'ASC';
  } else if (this_obj.state.sortBy === key && this_obj.state.sortOrder === 'ASC') {
    sortOrder = 'DESC';
  } else if (this_obj.state.sortBy === key && this_obj.state.sortOrder === 'DESC') {
    sortBy = sortOrder = null;
  }

  this_obj.setState({ sortBy, sortOrder });
  if (organisationId && this_obj.state.selectedComp)
    this_obj.props.getUmpireList({
      organisationId,
      competitionId: this_obj.state.selectedComp,
      offset: this_obj.state.offsetData,
      limit: pageSize_Data,
      sortBy,
      sortOrder,
      searchText: this_obj.state.searchText,
    });
}

class Umpire extends Component {
  constructor(props) {
    super(props);

    this.state = {
      yearRefId: getGlobalYear() ? JSON.parse(getGlobalYear()) : null,
      searchText: '',
      selectedComp: null,
      loading: false,
      competitionUniqueKey: null,
      compArray: [],
      offsetData: 0,
      sortBy: null,
      sortOrder: null,
      isCompParent: false,
      compOrganisationId: 0,
      //visible: false,
      umpireRank: null,
      umpireId: null,
      columns: [
        // {
        //   title: 'Rank',
        //   dataIndex: 'rank',
        //   key: 'rank',
        //   sorter: true,
        //   onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        //   render: (rank, record) => {
        //     const { rankedUmpiresCount } = this.props.umpireState;

        //     const { organisationId } = getOrganisationData() || {};

        //     const competitionOrganisationId = JSON.parse(
        //       localStorage.getItem('umpireCompetitionData'),
        //     )?.organisationId;

        //     return (
        //       <Form>
        //         {organisationId === competitionOrganisationId ? (
        //           <Select
        //             onChange={(i, option) => this.handleSelectChange(i, option, record.id)}
        //             value={record.rank ? record.rank : ''}
        //           >
        //             {Array.apply(null, { length: rankedUmpiresCount + 1 }).map((rank, i, arr) => {
        //               return (
        //                 <Option
        //                   style={i === arr.length - 1 ? { backgroundColor: 'lightgreen' } : {}}
        //                   key={i}
        //                 >
        //                   {i + 1}
        //                 </Option>
        //               );
        //             })}
        //           </Select>
        //         ) : (
        //           <div>{record.rank ? record.rank : ''}</div>
        //         )}
        //       </Form>
        //     );
        //   },
        // },
        {
          title: AppConstants.firstName,
          dataIndex: 'firstName',
          key: 'firstsName',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (firstName, record) => {
            const { suspended } = record;

            return (
              <NavLink
                to={{
                  pathname: '/userPersonal',
                  state: {
                    userId: record.id,
                    screenKey: 'umpire',
                    screen: '/umpire',
                  },
                }}
              >
                <span className="input-heading-add-another pt-0">
                  <span className={suspended ? 'suspended' : ''}>{firstName}</span>
                </span>
              </NavLink>
            );
          },
        },
        {
          title: AppConstants.lastName,
          dataIndex: 'lastName',
          key: 'lastName',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (lastName, record) => {
            const { suspended } = record;

            return (
              <NavLink
                to={{
                  pathname: '/userPersonal',
                  state: {
                    userId: record.id,
                    screenKey: 'umpire',
                    screen: '/umpire',
                  },
                }}
              >
                <span className="input-heading-add-another pt-0">
                  <span className={suspended ? 'suspended-suffix' : ''}>{lastName}</span>
                </span>
              </NavLink>
            );
          },
        },
        {
          title: AppConstants.email,
          dataIndex: 'email',
          key: 'email',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        },
        {
          title: AppConstants.contact_No,
          dataIndex: 'mobileNumber',
          key: 'mobileNumber',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        },
        {
          title: AppConstants.accreditation,
          dataIndex: 'accreditationLevelUmpireRefId',
          key: 'accreditationLevelUmpireRefId',
          sorter: false,
          render: (accreditationLevelUmpireRefId, record) => (
            <span>{this_obj.checkAccreditationLevel(accreditationLevelUmpireRefId)}</span>
          ),
        },
        {
          title: AppConstants.organisation,
          dataIndex: 'organisationName',
          key: 'organisationName',
          sorter: false,
          onHeaderCell: () => {},
          render: organisation => <span className="multi-column-text-aligned">{organisation}</span>,
        },
        {
          title: AppConstants.umpire,
          dataIndex: 'umpire',
          key: 'umpire',
          sorter: false,
          onHeaderCell: () => {},
          render: (umpireCoach, record) => (
            <span>{checkUmpireUserRoll(record.userRoleEntities, 15)}</span>
          ),
        },
        {
          title: AppConstants.umpireCoach,
          dataIndex: 'umpireCoach',
          key: 'umpireCoach',
          sorter: false,
          onHeaderCell: () => {},
          render: (umpireCoach, record, index) => (
            <span>{checkUserRoll(record.userRoleEntities, index)}</span>
          ),
        },
        {
          title: AppConstants.otherOfficial,
          dataIndex: 'otherOfficial',
          key: 'otherOfficial',
          sorter: false,
          onHeaderCell: () => {},
          render: (otherOfficial, record) => (
            <span>{checkOtherOfficalRoles(record.userRoleEntities)}</span>
          ),
        },
        {
          title: AppConstants.action,
          dataIndex: 'action',
          key: 'action',
          render: (data, record) => (
            <Menu
              className="action-triple-dot-submenu"
              theme="light"
              mode="horizontal"
              style={{ lineHeight: '25px' }}
            >
              <Menu.SubMenu
                key="sub1"
                style={{ borderBottomStyle: 'solid', borderBottom: 0 }}
                title={
                  <img
                    className="dot-image"
                    src={AppImages.moreTripleDot}
                    width="16"
                    height="16"
                    alt=""
                  />
                }
              >
                <Menu.Item key="1">
                  <NavLink to={node => this.onEditUmpire(record, true)}>
                    <span>Edit</span>
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="2">
                  <NavLink
                    to={{
                      pathname: './assignUmpire',
                      state: { record },
                    }}
                  >
                    <span>Assign to match</span>
                  </NavLink>
                </Menu.Item>
              </Menu.SubMenu>
            </Menu>
          ),
        },
      ],
      teamColumn: {
        title: AppConstants.team,
        dataIndex: 'teamName',
        key: 'teamName',
        sorter: false,
        onHeaderCell: () => {},
        render: (teamName, record) => {
          let teamArray = record.selectedTeams || [];
          return (
            <div>
              {teamArray.map((item, index) => (
                <span key={`teamName` + index} className="multi-column-text-aligned">
                  {item.name}
                </span>
              ))}
            </div>
          );
        },
      },
    };

    this_obj = this;
  }

  // handleSelectChange = (i, option, id) => {
  //   const { rankedUmpiresCount, pageSize_Data } = this.props.umpireState;
  //   const { organisationId } = getOrganisationData() || {};
  //   const competitionId = getUmpireCompetitionId();
  //   if (competitionId && organisationId && option.children === rankedUmpiresCount + 1) {
  //     this.props.updateUmpireRank({
  //       competitionId,
  //       umpireRank: option.children,
  //       organisationId,
  //       umpireId: id,
  //       offset: this.state.offsetData,
  //       sortBy: this.state.sortBy,
  //       sortOrder: this.state.sortOrder,
  //       limit: pageSize_Data,
  //     });
  //   } else {
  //     this.setState({
  //       visible: true,
  //       umpireRank: option.children,
  //       umpireId: id,
  //     });
  //   }
  // };

  // switchShiftHandler = updateRankType => {
  //   const { organisationId } = getOrganisationData() || {};
  //   const { umpireRank, umpireId } = this.state;
  //   const competitionId = getUmpireCompetitionId();
  //   const { pageSize_Data } = this.props.umpireState;
  //   if (competitionId)
  //     this.props.updateUmpireRank({
  //       competitionId,
  //       umpireRank,
  //       organisationId,
  //       umpireId,
  //       updateRankType,
  //       offset: this.state.offsetData,
  //       sortOrder: this.state.sortOrder,
  //       sortBy: this.state.sortBy,
  //       limit: pageSize_Data,
  //     });
  //   this.setState({ visible: false });
  // };

  // ModalView() {
  //   return (
  //     <Modal
  //       visible={this.state.visible}
  //       cancelButtonProps={{ style: { display: 'none' } }}
  //       okButtonProps={{ style: { display: 'none' } }}
  //       centered
  //       closable
  //       footer={false}
  //       onCancel={() => this.setState({ visible: false })}
  //       style={{ maxWidth: 400 }}
  //     >
  //       <div className="umpire-modal">
  //         <span className="umpire-modal-text">Would you like to</span>
  //         <div className="umpire-modal-button-group">
  //           <Button
  //             className="primary-add-comp-form umpire-modal-button"
  //             type="primary"
  //             onClick={() => this.switchShiftHandler('replace')}
  //           >
  //             Switch ratings
  //           </Button>
  //           <Button
  //             className="primary-add-comp-form umpire-modal-button"
  //             type="primary"
  //             onClick={() => this.switchShiftHandler('shift')}
  //           >
  //             Shift ratings
  //           </Button>
  //         </div>
  //       </div>
  //     </Modal>
  //   );
  // }

  async componentDidMount() {
    const { umpireListActionObject } = this.props.umpireState;
    let sortBy = this.state.sortBy;
    let sortOrder = this.state.sortOrder;
    if (umpireListActionObject) {
      let offsetData = umpireListActionObject.offset;
      let searchText = umpireListActionObject.userName ? umpireListActionObject.userName : '';
      sortBy = umpireListActionObject.sortBy;
      sortOrder = umpireListActionObject.sortOrder;
      await this.setState({ sortBy, sortOrder, offsetData, searchText });
    }

    this.props.getOnlyYearListAction();

    let { organisationId } = getOrganisationData() || {};
    this.setState({ loading: true });
    if (organisationId)
      this.props.umpireCompetitionListAction(null, this.state.yearRefId, organisationId, 'USERS');
    this.props.getRefBadgeData(this.props.appstate.accreditation);
    const competitionId = getUmpireCompetitionId();
    if (!!competitionId) {
      this.props.getRankedUmpiresCount({ competitionId });
    }
  }

  async componentDidUpdate(prevProps) {
    // const { sortBy, sortOrder } = this.state;
    const { pageSize_Data } = this.props.umpireState;
    if (!isEqual(prevProps.umpireCompetitionState, this.props.umpireCompetitionState)) {
      if (this.state.loading === true && this.props.umpireCompetitionState.onLoad === false) {
        let compList = isArrayNotEmpty(this.props.umpireCompetitionState.umpireComptitionList)
          ? this.props.umpireCompetitionState.umpireComptitionList
          : [];

        const livescoresCompetition = getLiveScoreCompetition()
          ? JSON.parse(getLiveScoreCompetition())
          : null;
        const organisation = getOrganisationData();
        const organisationId = organisation?.organisationId ?? null;
        const globalYear = Number(getGlobalYear());
        const canUseExistingComp =
          !!livescoresCompetition?.id &&
          !!organisationId &&
          livescoresCompetition.yearRefId === globalYear &&
          [
            livescoresCompetition?.competitionOrganisation?.orgId,
            livescoresCompetition.organisationId,
          ].includes(organisationId);

        let competition = null;

        if (canUseExistingComp) {
          competition = compList.find(c => c.id === livescoresCompetition.id);
        }
        if (!competition) {
          //get the first comp in the list
          competition = compList && compList.length ? compList[0] : null;
        }
        const competitionId = competition?.id ?? null;
        const competitionUniqueKey = competition?.uniqueKey ?? null;

        setCompDataForAll(competition ?? null);

        if (competition && organisationId) {
          const { sortBy, sortOrder, searchText } = this.state;
          this.props.getUmpireList({
            organisationId,
            competitionId,
            offset: this.state.offsetData,
            limit: pageSize_Data,
            sortBy,
            sortOrder,
            searchText,
          });
          this.setState({
            selectedComp: competitionId,
            compOrganisationId: competition.competitionOrganisation
              ? competition.competitionOrganisation.id
              : null,
            loading: false,
            competitionUniqueKey,
            compArray: compList,
          });
          this.props.getUmpireAllocationSettings(competitionId);
        } else {
          this.setState({ loading: false, selectedComp: null, compOrganisationId: 0 });
        }
      }
    }

    if (prevProps.appstate.yearList !== this.props.appstate.yearList) {
      if (this.props.appstate.yearList.length > 0) {
        const yearRefId = getGlobalYear()
          ? JSON.parse(getGlobalYear())
          : getCurrentYear(this.props.appstate.yearList);
        setGlobalYear(yearRefId);
      }
    }

    if (
      this.props.umpireSettingState !== prevProps.umpireSettingState &&
      this.props.umpireSettingState.allocationSettingsData &&
      !this.props.umpireSettingState.onLoad
    ) {
      let columns = [...this.state.columns];
      let teamColumnIndex = columns.findIndex(x => x.key == 'teamName');
      if (teamColumnIndex == -1 && this.props.umpireSettingState.allocateViaTeam) {
        columns.splice(6, 0, this.state.teamColumn);
        this.setState({ columns: columns });
      } else if (teamColumnIndex > -1 && !this.props.umpireSettingState.allocateViaTeam) {
        columns.splice(teamColumnIndex, 1);
        this.setState({ columns: columns });
      }
    }
  }

  checkUserId = record => {
    if (record.userId === null) {
      message.config({ duration: 1.5, maxCount: 1 });
      message.warn(ValidationConstants.umpireMessage);
    } else {
      history.push('/userPersonal', {
        userId: record.userId,
        screenKey: 'umpire',
        screen: '/umpire',
      });
    }
  };

  checkAccreditationLevel = accreditation => {
    if (this.props.appstate.accreditation) {
      let accreditationArr = this.props.appstate.accreditation;
      for (let i in accreditationArr) {
        if (accreditationArr[i].id == accreditation) {
          return accreditationArr[i].description;
        }
      }
    }
    return '';
  };

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setUmpireListPageSizeAction(pageSize);
  };

  handlePageChange = async page => {
    await this.props.setUmpireListPageNumberAction(page);
    const { sortBy, sortOrder, searchText } = this.state;
    let { pageSize_Data } = this.props.umpireState;
    let offset = page ? pageSize_Data * (page - 1) : 0;
    this.setState({
      offsetData: offset,
    });

    const { organisationId } = getOrganisationData() || {};
    const competitionId = getUmpireCompetitionId();
    if (organisationId && competitionId)
      this.props.getUmpireList({
        organisationId,
        competitionId,
        offset,
        limit: pageSize_Data,
        sortBy,
        sortOrder,
        searchText,
      });
  };

  contentView = () => {
    const { umpireListDataNew, totalCount_Data, currentPage_Data, pageSize_Data } =
      this.props.umpireState;
    let umpireListResult = isArrayNotEmpty(umpireListDataNew) ? umpireListDataNew : [];
    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={this.props.umpireState.onLoad || this.props.umpireCompetitionState.onLoad}
            className="home-dashboard-table"
            columns={this.state.columns}
            dataSource={umpireListResult}
            pagination={false}
            rowKey={record => 'umpireListResult' + record.id}
          />
        </div>
        <div className="comp-dashboard-botton-view-mobile">
          <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end" />

          <div className="d-flex justify-content-end">
            <Pagination
              className="antd-pagination"
              showSizeChanger
              current={currentPage_Data}
              defaultCurrent={currentPage_Data}
              defaultPageSize={pageSize_Data}
              total={totalCount_Data}
              onChange={this.handlePageChange}
              onShowSizeChange={this.handleShowSizeChange}
            />
          </div>
        </div>
      </div>
    );
  };

  onChangeComp = async competitionId => {
    const { sortBy, sortOrder, searchText } = this.state;
    const { pageSize_Data } = this.props.umpireState;
    const competition = this.state.compArray.find(comp => comp.id === competitionId);
    let orgItem = getOrganisationData();
    let userOrganisationId = orgItem ? orgItem.organisationId : null;
    let compOrgId = competition ? competition.organisationId : null;
    let isCompParent = userOrganisationId === compOrgId;
    let compOrganisationId = competition
      ? competition.competitionOrganisation
        ? competition.competitionOrganisation.id
        : null
      : null;
    this.setState({ isCompParent, compOrganisationId });
    setCompDataForAll(competition);
    if (userOrganisationId && competition.id) {
      this.props.getUmpireAllocationSettings(competition.id);
      this.props.getUmpireList({
        organisationId: userOrganisationId,
        competitionId: competition.id,
        offset: 0,
        limit: pageSize_Data,
        sortBy,
        sortOrder,
        searchText,
      });
    }
    this.setState({ selectedComp: competition.id, competitionUniqueKey: competition.uniqueKey });
  };

  // on change search text
  onChangeSearchText = e => {
    this.setState({ searchText: e.target.value, offsetData: 0 });

    const { sortBy, sortOrder } = this.state;
    const { pageSize_Data } = this.props.umpireState;
    if (e.target.value === null || e.target.value === '') {
      const orgData = getOrganisationData();
      const orgId = orgData && orgData.organisationId ? orgData.organisationId : null;
      const compId = getUmpireCompetitionId();
      this.props.getUmpireList({
        organisationId: orgId,
        competitionId: compId,
        offset: 0,
        limit: pageSize_Data,
        sortBy,
        sortOrder,
        searchText: e.target.value,
      });
    }
  };

  // search key
  onKeyEnterSearchText = e => {
    this.setState({ offsetData: 0 });
    const { sortBy, sortOrder, searchText } = this.state;
    const code = e.keyCode || e.which;
    const { pageSize_Data } = this.props.umpireState;
    if (code === 13) {
      // 13 is the enter keycode
      const { organisationId } = getOrganisationData() || {};
      const competitionId = getUmpireCompetitionId();

      if (organisationId && competitionId)
        this.props.getUmpireList({
          organisationId,
          competitionId,
          offset: 0,
          limit: pageSize_Data,
          sortBy,
          sortOrder,
          searchText,
        });
    }
  };

  // on click of search icon
  onClickSearchIcon = () => {
    this.setState({ offsetData: 0 });
    const { sortBy, sortOrder, searchText } = this.state;
    const { pageSize_Data } = this.props.umpireState;
    if (this.state.searchText === null || this.state.searchText === '') {
    } else {
      const { organisationId } = getOrganisationData() || {};
      const compId = getUmpireCompetitionId();
      if (compId && organisationId) {
        this.props.getUmpireList({
          organisationId,
          competitionId: compId,
          offset: 0,
          limit: pageSize_Data,
          sortBy,
          sortOrder,
          searchText,
        });
      }
    }
  };

  onExport = () => {
    const { organisationId } = getOrganisationData();
    this.props.exportUmpireListAction({
      competitionId: this_obj.state.selectedComp,
      organisationId,
      offset: 0, //making sure offset it's a zero
      limit: 0, //making sure limit it's a zero
      skipAssignedToPools: false,
    });
  };

  setYear = yearRefId => {
    setGlobalYear(yearRefId);
    this.setState({ yearRefId });
    this.setState({ loading: true });

    setCompDataForAll(null);
    this.props.umpireYearChangedAction();

    const { organisationId } = getOrganisationData() || {};
    this.props.umpireCompetitionListAction(null, yearRefId, organisationId, 'USERS');
  };

  headerView = () => {
    let competition = isArrayNotEmpty(this.props.umpireCompetitionState.umpireComptitionList)
      ? this.props.umpireCompetitionState.umpireComptitionList
      : [];
    let { isCompParent } = this.state;
    let isCompetitionAvailable = this.state.selectedComp ? false : true;
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm pt-1 d-flex align-content-center">
              <span className="form-heading">{AppConstants.officialsList}</span>
            </div>

            <div className="col-sm-8 w-100 d-flex flex-row align-items-center justify-content-end">
              <div className="row">
                <div className="col-sm pt-1">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    {/* <NavLink to="/addUmpire" className="text-decoration-none"> */}
                    <Button
                      disabled={isCompetitionAvailable}
                      className="primary-add-comp-form"
                      type="primary"
                      onClick={this.onAddUmpire.bind(this, null, false)}
                    >
                      + {AppConstants.addOfficials}
                    </Button>
                    {/*  </NavLink> */}
                  </div>
                </div>

                <div className="col-sm pt-1">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    <Button
                      className="primary-add-comp-form"
                      type="primary"
                      onClick={this.onExport}
                      disabled={isCompetitionAvailable}
                    >
                      <div className="row">
                        <div className="col-sm">
                          <img className="export-image" src={AppImages.export} alt="" />
                          {AppConstants.export}
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="col-sm pt-1">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    <NavLink
                      className="text-decoration-none"
                      to={{
                        pathname: `/umpireImport`,
                        state: { screenName: 'umpire' },
                      }}
                    >
                      <Button
                        disabled={isCompetitionAvailable}
                        className="primary-add-comp-form"
                        type="primary"
                      >
                        <div className="row">
                          <div className="col-sm">
                            <img className="export-image" src={AppImages.import} alt="" />
                            {AppConstants.import}
                          </div>
                        </div>
                      </Button>
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 d-flex justify-content-between">
            <div className="w-ft d-flex flex-row align-items-center">
              <div className="w-ft d-flex flex-row align-items-center" style={{ marginRight: 50 }}>
                <span className="year-select-heading">{AppConstants.year}:</span>
                <Select
                  className="year-select reg-filter-select-year ml-2"
                  onChange={e => this.setYear(e)}
                  value={this.state.yearRefId}
                >
                  {this.props.appstate.yearList.map(item => (
                    <Option key={'year_' + item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="w-ft d-flex flex-row align-items-center" style={{ marginRight: 50 }}>
                <span className="year-select-heading">{AppConstants.competition}:</span>
                <Select
                  className="year-select reg-filter-select1 ml-2"
                  style={{ minWidth: 200 }}
                  onChange={competitionId => this.onChangeComp(competitionId)}
                  value={this.state.selectedComp || ''}
                  loading={this.props.umpireCompetitionState.onLoad}
                >
                  {!this.state.selectedComp && <Option value="">All</Option>}
                  {competition.map(item => (
                    <Option key={'competition_' + item.id} value={item.id}>
                      {item.longName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="comp-product-search-inp-width">
              <Input
                className="product-reg-search-input"
                onChange={this.onChangeSearchText}
                placeholder="Search..."
                onKeyPress={this.onKeyEnterSearchText}
                value={this.state.searchText}
                prefix={
                  <SearchOutlined
                    style={{ color: 'rgba(0,0,0,.25)', height: 16, width: 16 }}
                    onClick={this.onClickSearchIcon}
                  />
                }
                allowClear
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  onEditUmpire = (tableRecord, isEdit) => {
    const { isCompParent, compOrganisationId } = this.state;
    return {
      pathname: '/addUmpire',
      state: {
        isEdit: isEdit,
        tableRecord: tableRecord,
        isCompParent: isCompParent,
        compOrganisationId: compOrganisationId,
      },
    };
  };

  onAddUmpire = (tableRecord, isEdit) => {
    const { isCompParent, compOrganisationId } = this.state;
    history.push('/addUmpire', {
      isEdit: isEdit,
      tableRecord: tableRecord,
      isCompParent: isCompParent,
      compOrganisationId: compOrganisationId,
    });
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.officials} menuName={AppConstants.officials} />

        <InnerHorizontalMenu menu="umpire" umpireSelectedKey="2" />

        <Layout>
          {this.headerView()}

          <Content>
            {this.contentView()}
            {/* {this.ModalView()} */}
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      umpireCompetitionListAction,
      umpireMainListAction,
      userExportFilesAction,
      getRefBadgeData,
      setUmpireListPageSizeAction,
      setUmpireListPageNumberAction,
      getUmpireList,
      getRankedUmpiresCount,
      updateUmpireRank,
      getUmpireAllocationSettings,
      getOnlyYearListAction,
      umpireYearChangedAction,
      exportUmpireListAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    umpireState: state.UmpireState,
    umpireCompetitionState: state.UmpireCompetitionState,
    appstate: state.AppState,
    rankedUmpiresCount: state.rankedUmpiresCount,
    umpireSettingState: state.UmpireSettingState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Umpire);
