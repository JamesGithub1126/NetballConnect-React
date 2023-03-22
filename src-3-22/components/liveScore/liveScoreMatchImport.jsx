import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Breadcrumb, Button, message, Modal } from 'antd';
// import CSVReader from "react-csv-reader";

import AppConstants from 'themes/appConstants';
import ValidationConstants from 'themes/validationConstant';
import history from 'util/history';
import { getLiveScoreCompetition } from 'util/sessionStorage';
import { showInvalidData } from 'util/showImportResult';
import { exportFilesAction } from 'store/actions/appAction';
import {
  liveScoreMatchImportAction,
  liveScoreMatchResetImportResultAction,
  liveScoreMatchImportWithDeletingAction,
} from 'store/actions/LiveScoreAction/liveScoreMatchAction';
import Loader from 'customComponents/loader';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';

import './liveScore.css';

const { Content, Header, Footer } = Layout;

const columns = [
  {
    title: AppConstants.date,
    dataIndex: 'Date',
    key: 'Date',
  },
  {
    title: AppConstants.time,
    dataIndex: 'Time',
    key: 'Time',
  },
  {
    title: AppConstants.divisionGrade,
    dataIndex: 'Division Grade',
    key: 'Division Grade',
  },
  {
    title: AppConstants.homeTeam,
    dataIndex: 'Home Team',
    key: 'Home Team',
  },
  {
    title: AppConstants.awayTeam,
    dataIndex: 'Away Team',
    key: 'Away Team',
  },
  {
    title: AppConstants.venue,
    dataIndex: 'Venue',
    key: 'Venue',
  },
  {
    title: AppConstants.type,
    dataIndex: 'Type',
    key: 'Type',
  },
  {
    title: AppConstants.matchDuration,
    dataIndex: 'Match Duration',
    key: 'Match Duration',
  },
  {
    title: AppConstants.breakDuration,
    dataIndex: 'Break Duration',
    key: 'Break Duration',
  },
  {
    title: AppConstants.mainBreakDuration,
    dataIndex: 'Main Break Duration',
    key: 'Main Break Duration',
  },
  {
    title: AppConstants.gmtTimezone,
    dataIndex: 'Timezone GMT',
    key: 'Timezone GMT',
  },
  {
    title: AppConstants.round,
    dataIndex: 'Round',
    key: 'Round',
  },
  {
    title: AppConstants.matchID,
    dataIndex: 'mnbMatchId',
    key: 'mnbMatchId',
  },
];

class LiveScoreMatchImport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      csvData: null,
      competitionId: null,
      removeExistingMatchesVisible: false,
    };
  }

  componentDidMount() {
    if (getLiveScoreCompetition()) {
      const { id } = JSON.parse(getLiveScoreCompetition());
      this.setState({ competitionId: id });

      this.props.liveScoreMatchResetImportResultAction();
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  headerView = () => (
    <div className="header-view">
      <Header className="form-header-view d-flex align-items-center bg-transparent">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.importMatch}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </Header>
    </div>
  );

  handleForce = data => {
    this.setState({ csvData: data.target.files[0] });
  };

  onExport = () => {
    let url = AppConstants.matchExport + this.state.competitionId;
    this.props.exportFilesAction(url);
  };

  contentView = () => (
    <div className="content-view pt-4">
      <span className="user-contact-heading">{AppConstants.fileInput}</span>

      <div className="col-sm">
        <div className="row">
          {/* <CSVReader cssClass="react-csv-input" onFileLoaded={this.handleForce} /> */}
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
        </div>
      </div>

      {/* <span className="user-contact-heading">{AppConstants.exampleBlock}</span> */}

      <div className="col-sm mt-10">
        <div className="row">
          <div className="reg-add-save-button">
            <Button onClick={this.onUploadBtn} className="primary-add-comp-form" type="primary">
              {AppConstants.upload}
            </Button>
          </div>

          <div className="reg-add-save-button ml-3">
            <NavLink to="/templates/wsa-livescore-import-match.csv" target="_blank" download>
              <Button className="primary-add-comp-form" type="primary">
                {AppConstants.downloadTemplate}
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );

  onUploadBtn = () => {
    if (this.state.csvData) {
      this.setState({ removeExistingMatchesVisible: true });
    } else {
      message.config({ duration: 0.9, maxCount: 1 });
      message.error(ValidationConstants.csvField);
    }
  };

  handleYesBtnClick = () => {
    const { id } = JSON.parse(getLiveScoreCompetition());
    this.setState({ removeExistingMatchesVisible: false });
    const isWithFiltration = true;
    this.props.liveScoreMatchImportWithDeletingAction(id, this.state.csvData, isWithFiltration);
    this.setState(
      {
        csvData: null,
      },
      () => {
        this.filesInput.value = null;
      },
    );
  };

  handleNoBtnClick = () => {
    const { id } = JSON.parse(getLiveScoreCompetition());
    this.setState({ removeExistingMatchesVisible: false });
    this.props.liveScoreMatchImportAction(id, this.state.csvData);
    this.setState(
      {
        csvData: null,
      },
      () => {
        this.filesInput.value = null;
      },
    );
  };

  render() {
    const {
      liveScoreMatchListState: { importResult, onLoad },
    } = this.props;
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />

        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="2" />

        <Loader visible={onLoad || this.props.appState.onLoad} />

        <Layout>
          {this.headerView()}

          <Content>
            <div className="formView">{this.contentView()}</div>

            {showInvalidData(columns, importResult)}
          </Content>

          <Footer>{/* <div className="formView"></div> */}</Footer>
        </Layout>
        <Modal
          className="add-membership-type-modal"
          visible={this.state.removeExistingMatchesVisible}
          onCancel={() => this.setState({ removeExistingMatchesVisible: false })}
          footer={[
            <div className="d-flex justify-content-between">
              <Button key="yes" onClick={this.handleYesBtnClick} type="secondary">
                {AppConstants.yes}
              </Button>
              <Button key="no" onClick={this.handleNoBtnClick} type="primary">
                {AppConstants.no}
              </Button>
            </div>
          ]}
        >
          <p>{AppConstants.removeExistingMatches}</p>
        </Modal>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      liveScoreMatchImportAction,
      liveScoreMatchImportWithDeletingAction,
      liveScoreMatchResetImportResultAction,
      exportFilesAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    liveScoreMatchListState: state.LiveScoreMatchState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreMatchImport);
