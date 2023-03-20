import React from 'react';
import { Modal, Button, message, Table } from 'antd';
import AppConstants from '../themes/appConstants';
import { NavLink } from 'react-router-dom';
import Loader from './loader';
import { getOrganisationData } from '../util/sessionStorage';
import ValidationConstants from '../themes/validationConstant';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  quickCompImportDataCleanUpAction,
  quickCompetitionPlayerImportAction,
  updateSelectedTeamPlayer,
} from '../store/actions/competitionModuleAction/competitionQuickCompetitionAction';
const columns = [
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'firstName',
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'lastName',
    key: 'lastName',
  },
  {
    title: AppConstants.dateOfBirth,
    dataIndex: 'dateOfBirth',
    key: 'dateOfBirth',
  },
  {
    title: AppConstants.phoneNumber,
    dataIndex: 'mobileNumber',
    key: 'mobileNumber',
  },
  {
    title: AppConstants.email,
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: AppConstants.team,
    dataIndex: 'team',
    key: 'team',
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
  {
    title: AppConstants.historicalGrade,
    dataIndex: 'historicalGrade',
    key: 'historicalGrade',
  },
  {
    title: AppConstants.historicalResult,
    dataIndex: 'historicalResult',
    key: 'historicalResult',
  },
];
class ImportTeamPlayerModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonPressed: '',
      loading: false,
      isProceed: 0,
      csvdata: null,
    };
  }

  componentDidMount() {
    // this.props.quickCompImportDataCleanUpAction("team");
  }

  componentDidUpdate(nextProps) {
    let teamsImportData = this.props.quickCompetitionState.teamsImportData;
    if (nextProps.quickCompetitionState != this.props.quickCompetitionState) {
      if (this.props.quickCompetitionState.onLoad == false && this.state.loading === true) {
        this.setState({ loading: false });
        if (
          !this.props.quickCompetitionState.error &&
          this.props.quickCompetitionState.status == 1
        ) {
          if (this.state.buttonPressed === 'upload') {
            if (teamsImportData.length === 0) {
              this.setState({ isProceed: 0 });
              this.props.updateSelectedTeamPlayer('', 'importModalVisible');
            } else {
              this.setState({ isProceed: 1 });
            }
          }
        }
      }
    }
  }

  onUploadBtn() {
    let payload = {
      competitionUniqueKey: this.props.competitionId,
      organisationUniqueKey: getOrganisationData()
        ? getOrganisationData().organisationUniqueKey
        : null,
      csvFile: this.state.csvdata,
      isProceed: this.state.isProceed,
    };
    if (this.state.csvdata) {
      this.props.quickCompetitionPlayerImportAction(payload);
      this.setState({ buttonPressed: 'upload', loading: true });
      let e = document.getElementById('quickPlayerImport');
      e.value = null;
    } else {
      message.config({ duration: 0.9, maxCount: 1 });
      message.error(ValidationConstants.csvField);
    }
  }
  handleForce = data => {
    this.setState({ csvdata: data.target.files[0], isProceed: 0 });
  };

  invalidPlayerView = () => {
    let invalidPlayers = this.props.quickCompetitionState.teamsImportData;
    return (
      <div className="comp-dash-table-view mt-2">
        <span className="user-contact-heading">{AppConstants.invalidPlayers}</span>
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={invalidPlayers}
            pagination={false}
          />
        </div>
        <div className="d-flex justify-content-end" style={{ marginTop: 20 }}>
          <div className="reg-add-save-button">
            <Button
              onClick={() => this.onUploadBtn()}
              className="primary-add-comp-form"
              type="primary"
            >
              {AppConstants.proceed}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { modalTitle, onOK, onCancel } = this.props;
    return (
      <div style={{ backgroundColor: 'red' }}>
        <Modal
          {...this.props}
          className="add-membership-type-modal modalFooter"
          title={modalTitle}
          visible={this.props.visible}
          onOk={onOK}
          onCancel={onCancel}
          footer={<div className="d-none" />}
        >
          {this.props.quickCompetitionState.onLoad && (
            <Loader visible={this.props.quickCompetitionState.onLoad} />
          )}
          <div className="inside-container-view mt-3">
            <span className="user-contact-heading">{AppConstants.fileInput}</span>
            <div className="col-sm">
              <div className="row">
                <input
                  className="pt-2 pb-2 pointer"
                  type="file"
                  id="quickPlayerImport"
                  ref={input => {
                    this.filesInput = input;
                  }}
                  name="file"
                  icon="file text outline"
                  iconposition="left"
                  label="Upload CSV"
                  labelposition="right"
                  placeholder="UploadCSV..."
                  onChange={this.handleForce}
                  accept=".csv"
                />
              </div>
            </div>

            <div className="col-sm" style={{ marginTop: 10 }}>
              <div className="row">
                <div className="reg-add-save-button">
                  <Button
                    onClick={() => this.onUploadBtn()}
                    className="primary-add-comp-form"
                    type="primary"
                  >
                    {AppConstants.upload}
                  </Button>
                </div>
                <div className="reg-add-save-button" style={{ marginLeft: 20 }}>
                  <NavLink
                    to="/templates/wsa-quickCompetition-import-player.csv"
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

            {this.state.isProceed ? this.invalidPlayerView() : null}
          </div>
        </Modal>
      </div>
    );
  }
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      quickCompImportDataCleanUpAction,
      quickCompetitionPlayerImportAction,
      updateSelectedTeamPlayer,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    quickCompetitionState: state.QuickCompetitionState,
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ImportTeamPlayerModal);
