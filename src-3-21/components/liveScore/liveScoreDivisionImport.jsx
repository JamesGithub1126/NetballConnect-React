import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Breadcrumb, Button, message } from 'antd';
// import CSVReader from "react-csv-reader";

import AppConstants from 'themes/appConstants';
import ValidationConstants from 'themes/validationConstant';
import history from 'util/history';
import { getLiveScoreCompetition } from 'util/sessionStorage';
import { showInvalidData } from 'util/showImportResult';
import {
  liveScoreDivisionImportAction,
  liveScoreDivisionResetImportResultAction,
} from 'store/actions/LiveScoreAction/liveScoreDivisionAction';
import Loader from 'customComponents/loader';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';

import './liveScore.css';

const { Content, Header, Footer } = Layout;

const columns = [
  {
    title: AppConstants.name,
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: AppConstants.division,
    dataIndex: 'division',
    key: 'division',
  },
  {
    title: AppConstants.grade,
    dataIndex: 'grade',
    key: 'grade',
  },
];

class LiveScoreDivisionImport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      csvData: null,
    };
  }

  componentDidMount() {
    this.props.liveScoreDivisionResetImportResultAction();
    if (getLiveScoreCompetition()) {
      const { sourceId } = JSON.parse(getLiveScoreCompetition());
      if (sourceId) {
        history.push('/matchDayDivisionList');
      }
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
                {AppConstants.importDivision}
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

  onUploadBtn = () => {
    const { id } = JSON.parse(getLiveScoreCompetition());

    if (this.state.csvData) {
      this.props.liveScoreDivisionImportAction({ id, csvFile: this.state.csvData });

      this.setState(
        {
          csvData: null,
        },
        () => {
          this.filesInput.value = null;
        },
      );
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

      <div className="col-sm" style={{ marginTop: 10 }}>
        <div className="row">
          <div className="reg-add-save-button">
            <Button onClick={this.onUploadBtn} className="primary-add-comp-form" type="primary">
              {AppConstants.upload}
            </Button>
          </div>

          <div className="reg-add-save-button ml-3">
            <NavLink to="/templates/wsa-livescore-import-division.csv" target="_blank" download>
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
      liveScoreDivisionState: { importResult, onLoad },
    } = this.props;
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />

        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="9" />

        <Loader visible={onLoad} />

        <Layout>
          {this.headerView()}

          <Content>
            <div className="formView">{this.contentView()}</div>

            {showInvalidData(columns, importResult)}
          </Content>

          <Footer>{/* <div className="formView" /> */}</Footer>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      liveScoreDivisionImportAction,
      liveScoreDivisionResetImportResultAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreDivisionState: state.LiveScoreDivisionState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreDivisionImport);
