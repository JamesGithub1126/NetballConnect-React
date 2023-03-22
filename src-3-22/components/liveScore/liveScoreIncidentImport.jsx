import React, { Component } from 'react';
import { Layout, Breadcrumb, Button, message } from 'antd';
import './liveScore.css';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
// import CSVReader from 'react-csv-reader'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Loader from '../../customComponents/loader';
import ValidationConstants from '../../themes/validationConstant';
import { getLiveScoreCompetition } from '../../util/sessionStorage';
import history from '../../util/history';
import { NavLink } from 'react-router-dom';

const { Content, Header, Footer } = Layout;

class LiveScoreIncidentImport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      csvdata: null,
    };
  }

  componentDidMount() {
    if (!getLiveScoreCompetition()) {
      history.push('/matchDayCompetitions');
    }
  }

  headerView = () => {
    return (
      <div className="header-view">
        <Header className="form-header-view bg-transparent d-flex align-items-center">
          <div className="row">
            <div className="col-sm d-flex align-content-center">
              <Breadcrumb separator=" > ">
                <Breadcrumb.Item className="breadcrumb-add">
                  {AppConstants.importIncident}
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>
        </Header>
      </div>
    );
  };

  handleForce = data => {
    this.setState({ csvdata: data.target.files[0] });
  };

  contentView = () => {
    return (
      <div className="content-view pt-4">
        <span className="user-contact-heading">{AppConstants.fileInput}</span>
        <div className="col-sm">
          <div className="row">
            {/* <CSVReader
                            cssClass="react-csv-input"
                            onFileLoaded={this.handleForce}
                        /> */}
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
              <Button className="primary-add-comp-form" type="primary">
                {AppConstants.upload}
              </Button>
            </div>

            <div className="reg-add-save-button ml-3">
              <NavLink to="/templates/wsa-livescore-import-incident.csv" target="_blank" download>
                <Button className="primary-add-comp-form" type="primary">
                  {AppConstants.downloadTemplate}
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    );
  };

  onUploadBtn() {
    const { id } = JSON.parse(getLiveScoreCompetition());

    if (this.state.csvdata) {
      this.props.liveScoreMatchImportAction(id, this.state.csvdata);
    } else {
      message.config({ duration: 0.9, maxCount: 1 });
      message.error(ValidationConstants.csvField);
    }
  }

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey={'17'} />
        <Loader visible={this.props.liveScoreMatchListState.onLoad} />
        <Layout>
          {this.headerView()}
          <Content>
            <div className="formView">{this.contentView()}</div>
          </Content>
          <Footer>{/* <div className="formView"></div> */}</Footer>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

function mapStateToProps(state) {
  return {
    liveScoreMatchListState: state.LiveScoreMatchState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreIncidentImport);
