import React, { Component } from 'react';
import { Layout, Button, Table, Select, Tag, Menu } from 'antd';
import { NavLink } from 'react-router-dom';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppUniqueId from 'themes/appUniqueId';
import AppConstants from '../../themes/appConstants';
import { connect } from 'react-redux';
import AppImages from 'themes/appImages';
import { CompetitionStatus } from 'enums/enums';
import { bindActionCreators } from 'redux';
import { setYearRefId, getOnlyYearListAction } from '../../store/actions/appAction';
import { isArrayNotEmpty } from '../../util/helpers';
import {
  registrationMainDashboardListAction,
  dashCompetitionListArchiveAction,
} from '../../store/actions/registrationAction/registrationDashboardAction';
import { checkRegistrationType, getCurrentYear } from '../../util/permissions';
import {
  clearCompReducerDataAction,
  regCompetitionListDeleteAction,
} from '../../store/actions/registrationAction/competitionFeeAction';
import history from '../../util/history';
import WizardModel from '../../customComponents/registrationWizardModel';
import { getOrganisationData } from '../../util/sessionStorage';
import StripeKeys from '../stripe/stripeKeys';
import { getAllCompetitionAction } from '../../store/actions/registrationAction/registrationDashboardAction';
import SubMenu from 'antd/lib/menu/SubMenu';
import { Modal } from 'antd';

const { confirm } = Modal;
const { Content } = Layout;
const { Option } = Select;
let this_Obj = null;

const listeners = (key, tableName) => ({
  onClick: () => tableSort(key, tableName),
});

/////function to sort table column
function tableSort(key, tableName) {
  let sortBy = key;
  let sortOrder = null;
  if (this_Obj.state.sortBy !== key) {
    sortOrder = 'ASC';
  } else if (this_Obj.state.sortBy === key && this_Obj.state.sortOrder === 'ASC') {
    sortOrder = 'DESC';
  } else if (this_Obj.state.sortBy === key && this_Obj.state.sortOrder === 'DESC') {
    sortBy = sortOrder = null;
  }
  this_Obj.setState({ sortBy, sortOrder });
  this_Obj.props.registrationMainDashboardListAction(
    this_Obj.state.year,
    sortBy,
    sortOrder,
    tableName,
  );
}

function getRegistrationTypeFromInviteesRefId(invitees) {
  const inviteesRegType = isArrayNotEmpty(invitees) ? invitees : [];
  const registrationInviteesRefId = isArrayNotEmpty(inviteesRegType)
    ? inviteesRegType[0].registrationInviteesRefId
    : 0;

  return checkRegistrationType(registrationInviteesRefId);
}

function tableSortByRegistrationType(a, b) {
  return getRegistrationTypeFromInviteesRefId(a['invitees']).localeCompare(
    getRegistrationTypeFromInviteesRefId(b['invitees']),
  );
}

const columns = [
  {
    title: AppConstants.competitionName,
    dataIndex: 'competitionName',
    key: 'competitionName',
    className: 'dashboard-link-color',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('pcompetitionName', 'part'),
    onCell: record => ({
      onClick: () =>
        history.push('/registrationCompetitionFee', {
          id: record.competitionId,
          isEdit: true,
        }),
    }),
  },

  {
    title: AppConstants.registrationDivisions,
    dataIndex: 'divisions',
    key: 'divisions',
    render: divisions => {
      let divisionList = isArrayNotEmpty(divisions) ? divisions : [];
      return (
        <span key="part1">
          {divisionList.map(item => (
            <Tag className="comp-dashboard-table-tag" color={item.color} key={'part' + item.id}>
              {item.divisionName}
            </Tag>
          ))}
        </span>
      );
    },
  },
  {
    title: AppConstants.registrationType,
    dataIndex: 'invitees',
    key: 'invitees',
    render: invitees => {
      const registrationTypeName = getRegistrationTypeFromInviteesRefId(invitees);
      return <span>{registrationTypeName}</span>;
    },
    sorter: (a, b) => tableSortByRegistrationType(a, b),
  },
  {
    title: AppConstants.status,
    dataIndex: 'statusName',
    key: 'statusName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('pstatus', 'part'),
  },
  {
    title: AppConstants.action,
    dataIndex: 'isUsed',
    key: 'isUsed',
    render: (isUsed, record) => (
      // isUsed == false ? <Menu
      <Menu
        className="action-triple-dot-submenu"
        theme="light"
        mode="horizontal"
        style={{ lineHeight: '25px' }}
      >
        <SubMenu
          key="sub1"
          title={
            <img
              className="dot-image"
              src={AppImages.moreTripleDot}
              alt=""
              width="16"
              height="16"
            />
          }
        >
          <Menu.Item key="1">
            <NavLink
              to={{
                pathname: '/registrationCompetitionFee',
                state: {
                  id: record.competitionUniqueKey,
                  affiliateOrgId: record.affiliateOrgId,
                  yearRefId: this_Obj.state.yearRefId,
                  isEdit: true,
                },
              }}
            >
              <span>Edit</span>
            </NavLink>
          </Menu.Item>
          {record.statusRefId === CompetitionStatus.Published ? (
            <Menu.Item
              key="3"
              onClick={() => this_Obj.setState({ archiveModalVisible: true, teamRecord: record })}
            >
              <span>{AppConstants.archive}</span>
            </Menu.Item>
          ) : (
            <Menu.Item
              key="2"
              onClick={() =>
                this_Obj.showDeleteConfirm(record.competitionId, record.competitionName)
              }
            >
              <span>{AppConstants.delete}</span>
            </Menu.Item>
          )}
          {record.statusRefId === CompetitionStatus.Archived && (
            <Menu.Item
              key="4"
              onClick={() => this_Obj.setState({ unarchiveModalVisible: true, teamRecord: record })}
            >
              <span>{AppConstants.unArchive}</span>
            </Menu.Item>
          )}
        </SubMenu>
      </Menu>
    ),
  },
];

const columnsOwned = [
  {
    title: AppConstants.competitionName,
    dataIndex: 'competitionName',
    key: 'competitionName',
    className: 'dashboard-link-color',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('ocompetitionName', 'own'),
    onCell: record => ({
      onClick: () =>
        record.statusRefId !== 3 &&
        history.push('/registrationCompetitionFee', {
          id: record.competitionId,
          isEdit: true,
        }),
    }),
  },
  {
    title: AppConstants.registrationDivisions,
    dataIndex: 'divisions',
    key: 'divisions',
    render: divisions => {
      let divisionList = isArrayNotEmpty(divisions) ? divisions : [];
      return (
        <span key="owned1">
          {divisionList.map(item => (
            <Tag className="comp-dashboard-table-tag" color={item.color} key={'owned' + item.id}>
              {item.divisionName}
            </Tag>
          ))}
        </span>
      );
    },
  },
  {
    title: AppConstants.registrationType,
    dataIndex: 'invitees',
    key: 'invitees',
    render: invitees => {
      const registrationTypeName = getRegistrationTypeFromInviteesRefId(invitees);
      return <span>{registrationTypeName}</span>;
    },
    sorter: (a, b) => tableSortByRegistrationType(a, b),
  },
  {
    title: AppConstants.status,
    dataIndex: 'statusName',
    key: 'statusName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('ostatus', 'own'),
  },
  {
    title: AppConstants.action,
    dataIndex: 'isUsed',
    key: 'isUsed',
    render: (isUsed, record) => (
      // isUsed == false ? <Menu
      <Menu
        className="action-triple-dot-submenu"
        theme="light"
        mode="horizontal"
        style={{ lineHeight: '25px' }}
      >
        <SubMenu
          key="sub1"
          title={
            <img
              className="dot-image"
              src={AppImages.moreTripleDot}
              alt=""
              width="16"
              height="16"
            />
          }
        >
          <Menu.Item key="1">
            <NavLink
              to={{
                pathname: '/registrationCompetitionFee',
                state: {
                  id: record.competitionId,
                  affiliateOrgId: record.affiliateOrgId,
                  yearRefId: this_Obj.state.yearRefId,
                  isEdit: true,
                },
              }}
            >
              <span>Edit</span>
            </NavLink>
          </Menu.Item>
          {record.statusRefId === CompetitionStatus.Published ? (
            <Menu.Item
              key="3"
              onClick={() => this_Obj.setState({ archiveModalVisible: true, teamRecord: record })}
            >
              <span>{AppConstants.archive}</span>
            </Menu.Item>
          ) : (
            <Menu.Item
              key="2"
              onClick={() =>
                this_Obj.showDeleteConfirm(record.competitionId, record.competitionName)
              }
            >
              <span>{AppConstants.delete}</span>
            </Menu.Item>
          )}
          {record.statusRefId === CompetitionStatus.Archived && (
            <Menu.Item
              key="4"
              onClick={() => this_Obj.setState({ unarchiveModalVisible: true, teamRecord: record })}
            >
              <span>{AppConstants.unArchive}</span>
            </Menu.Item>
          )}
        </SubMenu>
      </Menu>
    ),
  },
];

class RegistrationMainDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: null,
      loading: false,
      visible: false,
      competitionId: '',
      publishStatus: 0,
      orgRegistratinId: 0,
      registrationCloseDate: '',
      wizardYear: null,
      isDirect: false,
      inviteeStatus: 0,
      competitionCreatorOrganisation: 0,
      compFeeStatus: 0,
      compName: '',
      regStatus: false,
      sortBy: null,
      sortOrder: null,
      archiveModalVisible: false,
      unarchiveModalVisible: false,
      teamRecord: [],
    };
    this_Obj = this;
  }

  closeModal = () => {
    const this_ = this;
    this.setState({ archiveModalVisible: false });
    this.setState({ unarchiveModalVisible: false });
  };
  archiveProduct = async (competitionId, statusRefId) => {
    await this.props.dashCompetitionListArchiveAction(competitionId, statusRefId);
    this.setState({ deleteLoading: true });
    this.setState({ archiveModalVisible: false });
    // history.push('/registrationDashboard');
  };

  showArchiveConfirm = competitionId => {
    const this_ = this;
    this_.archiveProduct(competitionId, CompetitionStatus.Archived);
  };

  unarchiveProduct = async (competitionId, statusRefId) => {
    await this.props.dashCompetitionListArchiveAction(competitionId, CompetitionStatus.Published);
    this.setState({ deleteLoading: true });
    this.setState({ unarchiveModalVisible: false });
    // history.push('/registrationDashboard');
  };

  showUnArchiveConfirm = (competitionId, statusRefId) => {
    const this_ = this;
    this_.unarchiveProduct(competitionId, statusRefId);
  };

  deleteProduct = competitionId => {
    this.props.regCompetitionListDeleteAction(competitionId);
    this.setState({ deleteLoading: true });
  };

  showDeleteConfirm = (competitionId, competitionName) => {
    const this_ = this;
    confirm({
      title: AppConstants.competitionDeleteAlertTextHeader.replace('(COMP_NAME)', competitionName),
      content: AppConstants.competitionDeleteAlertText,
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk() {
        this_.deleteProduct(competitionId);
      },
      onCancel() {
        // console.log("Cancel");
      },
    });
  };

  async componentDidMount() {
    let yearId = this.props.appState.yearRefId;
    const { regDashboardListAction } = this.props.registrationDashboardState;
    this.props.getOnlyYearListAction(this.props.appState.yearList);
    this.setState({ loading: true });
    let sortBy = this.state.sortBy;
    let sortOrder = this.state.sortOrder;
    if (regDashboardListAction) {
      sortBy = regDashboardListAction.sortBy;
      sortOrder = regDashboardListAction.sortOrder;
      let year = JSON.parse(yearId);
      let key = regDashboardListAction.key;
      await this.setState({ sortBy, sortOrder, year });
      this.props.registrationMainDashboardListAction(year, sortBy, sortOrder, key);
      this.props.getAllCompetitionAction(year);
    }
  }

  componentDidUpdate(prevProps) {
    const { yearList } = this.props.appState;
    if (this.state.loading && this.props.appState.onLoad == false) {
      if (yearList.length > 0) {
        let storedYearID = this.props.appState.yearRefId;
        let yearRefId = null;
        if (storedYearID == null || storedYearID == 'null') {
          yearRefId = getCurrentYear(yearList);
        } else {
          yearRefId = storedYearID;
        }
        this.props.setYearRefId(yearRefId);
        this.props.registrationMainDashboardListAction(
          yearRefId,
          this.state.sortBy,
          this.state.sortOrder,
          'all',
        );
        this.props.getAllCompetitionAction(yearRefId);
        this.setState({ loading: false, year: JSON.parse(yearRefId) });
      }
    }
    let competitionTypeList = this.props.registrationDashboardState.competitionTypeList;
    if (prevProps.registrationDashboardState !== this.props.registrationDashboardState) {
      if (prevProps.registrationDashboardState.competitionTypeList !== competitionTypeList) {
        if (competitionTypeList.length > 0) {
          let competitionId = competitionTypeList[0].competitionId;
          let publishStatus = competitionTypeList[0].competitionStatusId;
          let orgRegistratinId = competitionTypeList[0].orgRegistratinId;
          let wizardYear = competitionTypeList[0].yearId;
          let registrationCloseDate = competitionTypeList[0].registrationCloseDate;
          let inviteeStatus = competitionTypeList[0].inviteeStatus;
          let competitionCreatorOrganisation =
            competitionTypeList[0].competitionCreatorOrganisation;
          let isDirect = competitionTypeList[0].isDirect;
          let compFeeStatus = competitionTypeList[0].creatorFeeStatus;
          let compName = competitionTypeList[0].competitionName;
          let regStatus = competitionTypeList[0].orgRegistrationStatusId;
          this.setState({
            competitionId,
            publishStatus: publishStatus,
            orgRegistratinId: orgRegistratinId,
            wizardYear: wizardYear,
            registrationCloseDate: registrationCloseDate,
            inviteeStatus: inviteeStatus,
            competitionCreatorOrganisation: competitionCreatorOrganisation,
            isDirect: isDirect,
            compFeeStatus,
            compName,
            regStatus,
          });
        }
      }
    }
    if (prevProps.competitionFeeState !== this.props.competitionFeeState) {
      if (
        prevProps.competitionFeeState.archiveLoad !== this.props.competitionFeeState.archiveLoad &&
        this.props.competitionFeeState.archiveLoad === false
      ) {
        if (yearList.length > 0) {
          let storedYearID = this.props.appState.yearRefId;
          let yearRefId = null;
          if (storedYearID == null || storedYearID == 'null') {
            yearRefId = getCurrentYear(yearList);
          } else {
            yearRefId = storedYearID;
          }
          this.props.setYearRefId(yearRefId);
          this.props.registrationMainDashboardListAction(
            yearRefId,
            this.state.sortBy,
            this.state.sortOrder,
            'all',
          );
        }
      }
    }
  }

  onChange = e => {
    this.setState({
      value: e.target.value,
    });
  };

  onYearClick(yearId) {
    let { sortBy, sortOrder } = this.state;
    this.props.setYearRefId(yearId);
    this.setState({ year: yearId });
    this.props.registrationMainDashboardListAction(yearId, sortBy, sortOrder, 'all');
    this.props.getAllCompetitionAction(yearId);
  }

  openwizardmodel() {
    let competitionData = this.props.registrationDashboardState.competitionTypeList;
    if (competitionData.length > 0) {
      let competitionId = competitionData[0].competitionId;
      let publishStatus = competitionData[0].competitionStatusId;
      let orgRegistrationId = competitionData[0].orgRegistratinId;
      let wizardYear = competitionData[0].yearId;
      let registrationCloseDate = competitionData[0].registrationCloseDate;
      let inviteeStatus = competitionData[0].inviteeStatus;
      let competitionCreatorOrganisation = competitionData[0].competitionCreatorOrganisation;
      let isDirect = competitionData[0].isDirect;
      let compFeeStatus = competitionData[0].creatorFeeStatus;
      let compName = competitionData[0].competitionName;
      let regStatus = competitionData[0].orgRegistrationStatusId;
      this.setState({
        competitionId,
        publishStatus,
        orgRegistrationId,
        wizardYear,
        registrationCloseDate,
        inviteeStatus,
        competitionCreatorOrganisation,
        isDirect,
        visible: true,
        compFeeStatus,
        compName,
        regStatus,
      });
    } else {
      this.setState({
        visible: true,
      });
    }
  }

  userEmail = () => {
    let orgData = getOrganisationData() ? getOrganisationData() : null;
    let email = orgData && orgData.email ? encodeURIComponent(orgData.email) : '';
    return email;
  };

  stripeConnected = () => {
    let orgData = getOrganisationData() ? getOrganisationData() : null;
    let stripeAccountID = orgData ? orgData.stripeAccountID : null;
    return stripeAccountID;
  };

  dropdownView = () => {
    const {
      yearList,
      // selectedYear
    } = this.props.appState;
    let stripeConnected = this.stripeConnected();
    let userEmail = this.userEmail();
    const url = process.env.REACT_APP_URL_STRIPE_CONNECT;
    const stripeConnectURL = url
      .replaceAll('#STRIPE_URL#', StripeKeys.url)
      .replaceAll('#STRIPE_CLIENT_ID#', StripeKeys.clientId)
      .replaceAll('#USER_EMAIL#', userEmail);

    let registrationCompetition = this.props.registrationDashboardState.competitionTypeList;
    return (
      <div className="comp-player-grades-header-drop-down-view" style={{ marginTop: 15 }}>
        <div className="row">
          <div className="col-sm-2">
            <div className="year-select-heading-view pb-3">
              <div className="reg-filter-col-cont">
                <span className="year-select-heading">{AppConstants.year}:</span>
                <Select
                  className="year-select reg-filter-select-year ml-2"
                  style={{ width: 90 }}
                  onChange={yearId => this.onYearClick(yearId)}
                  value={JSON.parse(this.state.year)}
                >
                  {yearList.map(item => (
                    <Option key={'year_' + item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
          <div className="col-sm pb-3 d-flex align-content-center justify-content-end">
            {/* <Button
                            className="open-reg-button"
                            type="primary"
                            onClick={() => this.openwizardmodel()}
                        >
                            {AppConstants.registrationWizard}
                        </Button> */}
          </div>
        </div>
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm-6 d-flex flex-row align-items-center">
              <span className="form-heading">{AppConstants.ownedCompetitionsReg}</span>
            </div>
            <div className="col-sm">
              <div className="row">
                <div className="col-sm">
                  <div
                    className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end"
                    onClick={() => this.props.clearCompReducerDataAction('all')}
                  >
                    <NavLink
                      to={{
                        pathname: `/registrationCompetitionFee`,
                        state: { id: null, isEdit: false, isNewComp: true },
                      }}
                      className="text-decoration-none"
                    >
                      <Button
                        className="primary-add-comp-form"
                        type="primary"
                        data-testid={AppUniqueId.NEWCOMPETITION_REGISTRATION}
                      >
                        + {AppConstants.newCompetitionReg}
                      </Button>
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <WizardModel
          modalTitle={AppConstants.registrationWizard}
          visible={this.state.visible}
          onCancel={() => this.setState({ visible: false })}
          wizardCompetition={registrationCompetition}
          competitionChange={competitionId => this.changeCompetition(competitionId)}
          competitionId={this.state.competitionId}
          stripeConnected={stripeConnected}
          stripeConnectURL={stripeConnectURL}
          publishStatus={this.state.publishStatus}
          competitionClick={() => this.clickCompetition()}
          registrationClick={() => this.state.publishStatus == 2 && this.onClickRegistration()}
          registrationStatus={this.regStatus()}
          competitionStatus={this.competitionStatus()}
        />
      </div>
    );
  };

  regStatus() {
    if (this.state.regStatus == 2) {
      return true;
    } else {
      return false;
    }
  }

  //wizard  registration click
  onClickRegistration() {
    if (this.state.isDirect && this.state.competitionCreatorOrganisation == 1) {
      history.push('/registrationForm', {
        id: this.state.competitionId,
        year: this.state.wizardYear,
        orgRegId: this.state.orgRegistrationId,
        compCloseDate: this.state.registrationCloseDate,
        compName: this.state.compName,
      });
    } else if (this.state.inviteeStatus == 1) {
      history.push('/registrationForm', {
        id: this.state.competitionId,
        year: this.state.wizardYear,
        orgRegId: this.state.orgRegistrationId,
        compCloseDate: this.state.registrationCloseDate,
        compName: this.state.compName,
      });
    }
  }

  competitionStatus() {
    // let feeStatus = false
    if (this.state.compFeeStatus == 1) {
      return true;
    } else if (this.state.inviteeStatus == 1) {
      return true;
    } else {
      return false;
    }
  }

  ///wizard competition click
  clickCompetition() {
    if (this.state.competitionId !== 0) {
      history.push('/registrationCompetitionFee', { id: this.state.competitionId, isEdit: true });
    } else {
      history.push('/registrationCompetitionFee', { id: null, isEdit: false });
    }
  }

  changeCompetition(competitionId) {
    let competitionData = this.props.registrationDashboardState.competitionTypeList;
    let competitionIndex = competitionData.findIndex(x => x.competitionId === competitionId);
    let publishStatus = competitionData[competitionIndex].competitionStatusId;
    let orgRegistrationId = competitionData[competitionIndex].orgRegistratinId;
    let wizardYear = competitionData[competitionIndex].yearId;
    let registrationCloseDate = competitionData[competitionIndex].registrationCloseDate;
    let inviteeStatus = competitionData[competitionIndex].inviteeStatus;
    let competitionCreatorOrganisation =
      competitionData[competitionIndex].competitionCreatorOrganisation;
    let isDirect = competitionData[competitionIndex].isDirect;
    let compFeeStatus = competitionData[competitionIndex].creatorFeeStatus;
    let compName = competitionData[competitionIndex].competitionName;
    let regStatus = competitionData[competitionIndex].orgRegistrationStatusId;
    this.setState({
      competitionId,
      publishStatus,
      orgRegistrationId,
      wizardYear,
      registrationCloseDate,
      inviteeStatus,
      competitionCreatorOrganisation,
      isDirect,
      compFeeStatus,
      compName,
      regStatus,
    });
  }

  ///dropdown view containing dropdown and next screen navigation button/text
  dropdownButtonView = () => {
    // const { yearList, selectedYear } = this.props.appState
    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm-6 d-flex flex-row align-items-center">
              <span className="form-heading">{AppConstants.participateInCompReg}</span>
              {/* <div className="mt-n10">
                                <Tooltip placement="top">
                                    <span>{AppConstants.ownedCompetitionMsg}</span>
                                </Tooltip>
                            </div> */}
            </div>
          </div>
        </div>
      </div>
    );
  };

  ////////participatedView view for competition
  participatedView = () => {
    return (
      <div className="comp-dash-table-view">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={this.props.registrationDashboardState.partLoad && true}
            className="home-dashboard-table"
            columns={columns}
            dataSource={this.props.registrationDashboardState.participatingInRegistrations}
            pagination={false}
            rowKey={record => 'participatingInRegistrations' + record.competitionId}
            onRow={record => ({
              onClick: () =>
                history.push('/registrationCompetitionFee', {
                  id: record.competitionId,
                  isEdit: true,
                }),
            })}
          />
        </div>
      </div>
    );
  };

  ////////ownedView view for competition
  ownedView = () => {
    return (
      <div className="comp-dash-table-view" style={{ paddingBottom: 100 }}>
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={this.props.registrationDashboardState.ownedLoad === true && true}
            className="home-dashboard-table"
            columns={columnsOwned}
            dataSource={this.props.registrationDashboardState.ownedRegistrations}
            pagination={false}
            rowKey={record => `ownedRegistrations${record.competitionId}`}
            // onRow={record => ({
            //   onClick: () =>
            //     history.push('/registrationCompetitionFee', {
            //       id: record.competitionId,
            //       isEdit: true,
            //     }),
            // })}
          />
          <Modal
            key="isArchiveModal"
            className="add-membership-type-modal"
            title={AppConstants.archiveCompetitionAlertTextHeader.replace(
              '(COMP_NAME)',
              this_Obj.state.teamRecord.competitionName,
            )}
            visible={this_Obj.state.archiveModalVisible}
            onOk={() => this_Obj.showArchiveConfirm(this_Obj.state.teamRecord.competitionId)}
            okText={AppConstants.yes}
            onCancel={this_Obj.closeModal}
            cancelText={AppConstants.no}
          >
            <p>{AppConstants.archiveCompetitionAlertText}</p>
          </Modal>

          <Modal
            key="isunArchiveModal"
            className="add-membership-type-modal"
            title={AppConstants.unArchiveCompetitionAlertTextHeader.replace(
              '(COMP_NAME)',
              this_Obj.state.teamRecord.competitionName,
            )}
            visible={this_Obj.state.unarchiveModalVisible}
            onOk={() => this_Obj.showUnArchiveConfirm(this_Obj.state.teamRecord.competitionId)}
            okText={AppConstants.yes}
            onCancel={this_Obj.closeModal}
            cancelText={AppConstants.no}
          >
            <p>{AppConstants.unArchiveCompetitionAlertText}</p>
          </Modal>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.registration}
          menuName={AppConstants.registration}
        />
        <InnerHorizontalMenu menu="registration" regSelectedKey="1" />
        <Layout>
          <Content>
            {this.dropdownView()}
            {this.ownedView()}
            {this.dropdownButtonView()}
            {this.participatedView()}
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setYearRefId,
      getOnlyYearListAction,
      registrationMainDashboardListAction,
      clearCompReducerDataAction,
      getAllCompetitionAction,
      regCompetitionListDeleteAction,
      dashCompetitionListArchiveAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    registrationDashboardState: state.RegistrationDashboardState,
    competitionFeeState: state.CompetitionFeesState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationMainDashboard);
