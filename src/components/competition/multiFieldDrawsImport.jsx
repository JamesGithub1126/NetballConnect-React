import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Breadcrumb, Button, Layout, message } from 'antd';

import AppConstants from 'themes/appConstants';
import ValidationConstants from 'themes/validationConstant';
import history from 'util/history';
import { showInvalidData } from 'util/showImportResult';
import { exportFilesAction } from 'store/actions/appAction';
import { importDrawsAction } from 'store/actions/competitionModuleAction/competitionMultiDrawsAction';
import Loader from 'customComponents/loader';
import DashboardLayout from 'pages/dashboardLayout';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import { isFootball } from 'util/registrationHelper';

const { Content, Header, Footer } = Layout;

const columns = [
  {
    title: AppConstants.round,
    dataIndex: 'Round',
    key: 'Round',
  },
  {
    title: AppConstants.division,
    dataIndex: AppConstants.division,
    key: AppConstants.division,
  },
  {
    title: AppConstants.grade,
    dataIndex: AppConstants.grade,
    key: AppConstants.grade,
  },
  {
    title: AppConstants.date,
    dataIndex: 'Date',
    key: 'Date',
  },
  {
    title: AppConstants.startTime,
    dataIndex: 'Start Time',
    key: 'Start Time',
  },
  {
    title: AppConstants.endTime,
    dataIndex: 'End Time',
    key: 'End Time',
  },
  {
    title: AppConstants.team1,
    dataIndex: 'Team 1',
    key: 'Team 1',
  },
  // {
  //   title: AppConstants.team1Organisation,
  //   dataIndex: 'Team 1 Organisation',
  //   key: 'Team 1 Organisation',
  // },
  {
    title: AppConstants.team2,
    dataIndex: 'Team 2',
    key: 'Team 2',
  },
  // {
  //   title: AppConstants.team2Organisation,
  //   dataIndex: 'Team 2 Organisation',
  //   key: 'Team 2 Organisation',
  // },
  {
    title: AppConstants.venueName,
    dataIndex: 'Venue Name',
    key: 'Venue Name',
  },
  {
    title: AppConstants.courtName,
    dataIndex: AppConstants.courtName,
    key: AppConstants.courtName,
  },
];
if (isFootball) {
  columns.push({
    title: AppConstants.subCourt,
    dataIndex: AppConstants.subCourt,
    key: AppConstants.subCourt,
  });
}
class MultiFieldDrawsImport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      csvData: null,
      competitionId: null,
      organisationId: null,
    };
  }

  componentDidMount() {
    if (
      parseInt(this.props.location.state?.competitionId, 10) !== -1 &&
      this.props.location.state?.competitionId &&
      this.props.location.state?.organisationId
    ) {
      this.setState({
        competitionId: this.props.location.state?.competitionId,
        organisationId: this.props.location.state?.organisationId,
      });
    } else {
      history.push('./competitionDraws');
    }
  }

  headerView = () => (
    <div className="header-view">
      <Header className="form-header-view d-flex align-items-center bg-transparent">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.importDraws}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </Header>
    </div>
  );

  handleForce = data => {
    this.setState({
      csvData: data.target.files[0],
    });
  };

  onUploadBtn = () => {
    if (this.state.csvData) {
      this.props.importDrawsAction(
        this.state.csvData,
        this.state.competitionId,
        this.state.organisationId,
      );

      this.setState(
        {
          csvData: null,
        },
        () => {
          this.filesInput.value = null;
        },
      );
    } else {
      message.config({
        duration: 0.9,
        maxCount: 1,
      });
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
              placeholder="UploadCSV..."
              onChange={this.handleForce}
              accept=".csv"
            />
          </label>
        </div>
      </div>

      <div className="col-sm mt-10">
        <div className="row">
          <div className="reg-add-save-button">
            <Button className="primary-add-comp-form" type="primary" onClick={this.onUploadBtn}>
              {AppConstants.upload}
            </Button>
          </div>

          <div className="reg-add-save-button ml-3">
            <NavLink
              to={`/templates/wsa-competition-import-draw${isFootball ? '-subfield' : ''}.csv`}
              target="_blank"
              download
            >
              <Button className="primary-add-comp-form" type="primary">
                {AppConstants.downloadTemplate}
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );

  render() {
    const {
      drawsState: { importResult, onLoad },
    } = this.props;
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.competitions}
          menuName={AppConstants.competitions}
          onMenuHeadingClick={() => history.push('./competitionDraws')}
        />

        <InnerHorizontalMenu menu="competition" compSelectedKey="18" />

        <Loader visible={onLoad || this.props.appState.onLoad} />

        <Layout>
          {this.headerView()}

          <Content>
            <div className="formView">{this.contentView()}</div>

            {showInvalidData(columns, importResult)}
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
      importDrawsAction,
      exportFilesAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    drawsState: state.CompetitionMultiDrawsState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MultiFieldDrawsImport);
