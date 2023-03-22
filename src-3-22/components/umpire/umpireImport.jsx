import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Breadcrumb, Button, message } from 'antd';

import AppConstants from 'themes/appConstants';
import ValidationConstants from 'themes/validationConstant';
import { showInvalidData } from 'util/showImportResult';
import {
  getUmpireCompetitionId,
  getOrganisationData,
  getUmpireCompetitionData,
} from 'util/sessionStorage';
import { exportFilesAction } from 'store/actions/appAction';
import {
  umpireDashboardImportAction,
  umpireDashboardResetImportResultAction,
} from 'store/actions/umpireAction/umpireDashboardAction';
import Loader from 'customComponents/loader';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';

import './umpire.css';

const { Content, Header, Footer } = Layout;

const columns = [
  {
    title: AppConstants.firstName,
    dataIndex: 'First Name',
    key: 'First Name',
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'Last Name',
    key: 'Last Name',
  },
  {
    title: AppConstants.email,
    dataIndex: 'Email',
    key: 'Email',
  },
  {
    title: AppConstants.contact_No,
    dataIndex: 'Contact No',
    key: 'Contact No',
  },
  {
    title: AppConstants.organisation,
    dataIndex: 'Organisation',
    key: 'Organisation',
  },
];

const columnsDashboard = [
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'Match Id',
    key: 'Match Id',
  },
  {
    title: AppConstants.startTime,
    dataIndex: 'Start Time',
    key: 'Start Time',
  },
  {
    title: 'Home',
    dataIndex: 'Home',
    key: 'Home',
  },
  {
    title: 'Away',
    dataIndex: 'Away',
    key: 'Away',
  },
  {
    title: AppConstants.round,
    dataIndex: 'Round',
    key: 'Round',
  },
  {
    title: AppConstants.umpire1Id,
    dataIndex: 'Umpire 1 Id',
    key: 'Umpire 1 Id',
  },
  {
    title: AppConstants.umpire1,
    dataIndex: 'Umpire 1',
    key: 'Umpire 1',
  },
  {
    title: AppConstants.umpire1Response,
    dataIndex: 'Umpire 1 Response',
    key: 'Umpire 1 Response',
  },
  {
    title: AppConstants.umpire1Club,
    dataIndex: 'Umpire 1 Organisation',
    key: 'Umpire 1 Organisation',
  },
  {
    title: AppConstants.umpire2Id,
    dataIndex: 'Umpire 2 Id',
    key: 'Umpire 2 Id',
  },
  {
    title: AppConstants.umpire2,
    dataIndex: 'Umpire 2',
    key: 'Umpire 2',
  },
  {
    title: AppConstants.umpire2Response,
    dataIndex: 'Umpire 2 Response',
    key: 'Umpire 2 Response',
  },
  {
    title: AppConstants.umpire2Club,
    dataIndex: 'Umpire 2 Organisation',
    key: 'Umpire 2 Organisation',
  },
];

class UmpireImport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      csvData: null,
      screenName:
        props.location && props.location.state && props.location.state.screenName
          ? props.location.state.screenName
          : null,
      organisationId: null,
      competitionId: null,
      isCompParent: false,
    };
  }

  componentDidMount() {
    let { organisationId } = getOrganisationData() || {};
    let compId = getUmpireCompetitionId();
    let sessionCompetition = getUmpireCompetitionData();
    const storedCompData = sessionCompetition ? JSON.parse(sessionCompetition) : null;
    let compOrgId = storedCompData?.organisationId;
    //let compOrganisationId = storedCompData?.competitionOrganisation?.id;
    let isCompParent = organisationId == compOrgId;
    this.setState({ organisationId, competitionId: compId, isCompParent });

    this.props.umpireDashboardResetImportResultAction();
  }

  onExport = () => {
    const url =
      AppConstants.umpireDashboardExport +
      `competitionId=${this.state.competitionId}&organisationId=${this.state.organisationId}`;
    this.props.exportFilesAction(url);
  };

  headerView = () => (
    <div className="header-view">
      <Header className="form-header-view d-flex align-items-center bg-transparent">
        <Breadcrumb separator=" > ">
          <Breadcrumb.Item className="breadcrumb-add">
            {this.state.screenName === 'umpireDashboard'
              ? AppConstants.assignUmpireToMatch
              : AppConstants.importOfficials}
          </Breadcrumb.Item>
        </Breadcrumb>
      </Header>
    </div>
  );

  titleView = () => (
    <div className="comp-venue-courts-dropdown-view mt-0">
      <div className="fluid-width">
        <div className="row">
          <div className="col-sm">
            <div className="w-ft d-flex flex-row align-items-center">
              <span className="input-heading">{AppConstants.downLoadImportHeading}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  handleForce = data => {
    this.setState({ csvData: data.target.files[0] });
  };

  onUploadBtn = () => {
    let compId = getUmpireCompetitionId();
    const { screenName, isCompParent, organisationId } = this.state;
    if (this.state.csvData) {
      this.props.umpireDashboardImportAction({
        id: compId,
        csvFile: this.state.csvData,
        screenName: this.state.screenName,
        organisationId: !isCompParent ? organisationId : 0,
      });
    } else {
      message.config({ duration: 0.9, maxCount: 1 });
      message.error(ValidationConstants.csvField);
    }
  };

  contentView = () => (
    <div className="content-view pt-4">
      <span className="user-contact-heading">{AppConstants.fileInput}</span>

      <div className="col-sm">
        <div className="row">
          <label>
            <input
              className="pt-2 pb-2 pointer"
              type="file"
              ref={input => {
                this.filesInput = input;
              }}
              name="file"
              // icon="file text outline"
              // iconPosition="left"
              // label="Upload CSV"
              // labelPosition="right"
              placeholder="UploadCSV..."
              onChange={this.handleForce}
              accept=".csv"
            />
          </label>
        </div>
      </div>

      <div className="col-sm" style={{ marginTop: 10 }}>
        <div className="row">
          <div className="reg-add-save-button" style={{ marginRight: 10 }}>
            {this.state.screenName === 'umpireRoster' ? (
              <Button className="primary-add-comp-form" type="primary">
                {AppConstants.upload}
              </Button>
            ) : (
              <Button onClick={this.onUploadBtn} className="primary-add-comp-form" type="primary">
                {AppConstants.upload}
              </Button>
            )}
          </div>
          {/**
             *      {this.state.screenName === 'umpireDashboard' && (
            <div className="reg-add-save-button">
              <Button onClick={this.onExport} className="primary-add-comp-form" type="primary">
                {AppConstants.downloadTemplate}
              </Button>
            </div>
          )}

          {this.state.screenName === 'umpire' && (
            <div className="reg-add-save-button">
              <NavLink to="/templates/wsa-livescore-import-umpire.csv" target="_blank" download>
                <Button className="primary-add-comp-form" type="primary">
                  {AppConstants.downloadTemplate}
                </Button>
              </NavLink>
            </div>
          )}
             */}

          {this.state.screenName === 'umpireDashboard' && (
            <div className="reg-add-save-button">
              <Button onClick={this.onExport} className="primary-add-comp-form" type="primary">
                {AppConstants.downloadTemplate}
              </Button>
            </div>
          )}
          {this.state.screenName === 'umpire' && (
            <div className="reg-add-save-button">
              <NavLink
                to={`/templates/wsa-import-${AppConstants.umpires.toLowerCase()}-dashboard.csv`}
                target="_blank"
                download
              >
                <Button className="primary-add-comp-form" type="primary">
                  {AppConstants.downloadTemplate}
                </Button>
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  render() {
    const { screenName } = this.state;
    const {
      umpireDashboardState: { importResult, onLoad },
    } = this.props;

    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.importOfficials}
          menuName={AppConstants.importOfficials}
        />

        <InnerHorizontalMenu
          menu="umpire"
          umpireSelectedKey={
            screenName === 'umpire' ? '2' : screenName === 'umpireRoster' ? '3' : '1'
          }
        />

        <Loader visible={onLoad || this.props.appState.onLoad} />

        <Layout>
          {this.headerView()}

          {screenName === 'umpireDashboard' && this.titleView()}

          <Content>
            <div className="formView">{this.contentView()}</div>

            {showInvalidData(
              screenName === 'umpireDashboard' ? columnsDashboard : columns,
              importResult,
            )}
          </Content>

          <Footer />
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      umpireDashboardImportAction,
      umpireDashboardResetImportResultAction,
      exportFilesAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    umpireDashboardState: state.UmpireDashboardState,
    appState: state.AppState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UmpireImport);
