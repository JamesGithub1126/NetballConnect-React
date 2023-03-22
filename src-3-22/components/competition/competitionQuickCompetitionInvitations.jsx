import React, { Component } from 'react';
import { Layout, Breadcrumb, Button, Radio, Select, message, Modal } from 'antd';
// import { NavLink } from 'react-router-dom';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import history from '../../util/history';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import Loader from "../../customComponents/loader";
import {
  updateSelectedTeamPlayer,
  getMergeCompetitionAction,
  quickCompImportDataCleanUpAction,
  validateMergeCompetitionaction,
  mergeCompetitionProceed,
} from '../../store/actions/competitionModuleAction/competitionQuickCompetitionAction';
import ImportTeamPlayerModal from '../../customComponents/importTeamPlayerModal';
import {
  // getYearAndCompetitionOwnAction,
  CLEAR_OWN_COMPETITION_DATA,
} from '../../store/actions/appAction';
import ValidationConstants from '../../themes/validationConstant';
const { Option } = Select;
const { Header, Footer, Content } = Layout;
// const { confirm } = Modal

class QuickCompetitionInvitations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      competition: '2019winter',
      importModalVisible: false,
      yearRefId: null,
      competitionId: null,
      importPlayer: 0,
      selectedMergeComptition: null,
      invitationLoad: false,
      mergeValidateVisible: false,
      onProcessMergeCompetition: false,
      modalVisible: false,
      teamOptionId: 1,
      playerOptionId: 1,
      divisionGradeOptionId: 1,
      venueOptionId: 1,
      compNameOptionId: 1,
      competitionMismatchModalVisible: false,
    };
  }

  componentDidMount() {
    this.props.quickCompImportDataCleanUpAction('all');
    let competitionId = this.props.location.state
      ? this.props.location.state.competitionUniqueKey
      : null;
    let year = this.props.location.state && this.props.location.state.year;
    let importPlayerValue = this.props.location.state && this.props.location.state.importPlayer;
    if (competitionId && importPlayerValue) {
      this.props.getMergeCompetitionAction();
      this.setState({
        competitionId,
        yearRefId: year,
        importPlayer: importPlayerValue,
      });
    } else {
      history.push('/quickCompetition');
    }
  }

  componentDidUpdate(nextprops) {
    let mergeValidateState = this.props.quickCompetitionState.mergeValidate;
    if (this.props.quickCompetitionState.onInvitationLoad == false && this.state.invitationLoad) {
      if (nextprops.mergeValidateState != this.props.quickCompetitionState.mergeValidate) {
        this.setState({
          mergeValidateVisible: mergeValidateState,
        });
        this.showPropsConfirm(null);
      }
      this.setState({
        invitationLoad: false,
      });
    }
    if (
      this.props.quickCompetitionState.onInvitationLoad == false &&
      this.state.onProcessMergeCompetition
    ) {
      this.setState({
        onProcessMergeCompetition: false,
      });
      history.push('/quickCompetitionMatchFormat', {
        competitionUniqueKey: this.props.quickCompetitionState.newSelectedCompetition,
        year: this.state.yearRefId,
      });
    }
  }

  showPropsConfirm = key => {
    if (key === 'cancel') {
      this.setState({ modalVisible: false });
    } else {
      this.setState({ modalVisible: true });
    }
  };

  ValidateProceed = () => {
    const { mergeCompetitionTypeSelection } = this.props.quickCompetitionState;
    const typeSelection =
      mergeCompetitionTypeSelection == null ? ' ' : mergeCompetitionTypeSelection;
    if (mergeCompetitionTypeSelection.venueMismatch != 1) {
      let payload = {
        registrationCompetitionId: this.state.selectedMergeComptition,
        quickCompetitionId: this.state.competitionId,
        teamOptionId: typeSelection.teamMismatch == 0 ? null : this.state.teamOptionId,
        playerOptionId: typeSelection.playerMismatch == 0 ? null : this.state.playerOptionId,
        divisionGradeOptionId:
          typeSelection.divisionGradesMismatch == 0 ? null : this.state.divisionGradeOptionId,
        //"venueOptionId": typeSelection.venueMismatch == 0 ? null : this.state.venueOptionId,
        venueOptionId: 1,
        compNameOptionId: this.state.compNameOptionId,
      };

      this.props.mergeCompetitionProceed(payload);
      this.setState({
        onProcessMergeCompetition: true,
        modalVisible: false,
      });
    } else {
      this.setState({ competitionMismatchModalVisible: true });
    }
  };

  mismatchModalOk = key => {
    if (key === 'ok') {
      const { mergeCompetitionTypeSelection } = this.props.quickCompetitionState;
      const typeSelection =
        mergeCompetitionTypeSelection == null ? ' ' : mergeCompetitionTypeSelection;
      let payload = {
        registrationCompetitionId: this.state.selectedMergeComptition,
        quickCompetitionId: this.state.competitionId,
        teamOptionId: typeSelection.teamMismatch == 0 ? null : this.state.teamOptionId,
        playerOptionId: typeSelection.playerMismatch == 0 ? null : this.state.playerOptionId,
        divisionGradeOptionId:
          typeSelection.divisionGradesMismatch == 0 ? null : this.state.divisionGradeOptionId,
        //"venueOptionId": typeSelection.venueMismatch == 0 ? null : this.state.venueOptionId,
        venueOptionId: 1,
        compNameOptionId: this.state.compNameOptionId,
      };

      this.props.mergeCompetitionProceed(payload);
      this.setState({
        onProcessMergeCompetition: true,
        modalVisible: false,
      });
      this.setState({ competitionMismatchModalVisible: false });
    } else if (key === 'cancel') {
      this.setState({ competitionMismatchModalVisible: false });
    }
  };

  competitionTypeSelection = (value, key) => {
    if (key === 'divisioAndGrades') {
      this.setState({ divisionGradeOptionId: value });
    } else if (key === 'teams') {
      this.setState({ teamOptionId: value });
    } else if (key === 'players') {
      this.setState({ playerOptionId: value });
    } else if (key === 'venues') {
      this.setState({ venueOptionId: value });
    } else if (key === 'competitionName') {
      this.setState({ compNameOptionId: value });
    }
  };

  headerView = () => {
    return (
      <Header className="comp-venue-courts-header-view">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.quickCompetition2}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </Header>
    );
  };

  //merge with existing competition
  mergeExistingCompetition = (subItem, selectedOption) => {
    const {
      mergeCompetitionList,
      mergeCompetitionTypeSelection,
    } = this.props.quickCompetitionState;
    const mergeCompetitionSelection =
      mergeCompetitionTypeSelection == null ? '' : mergeCompetitionTypeSelection;

    if (subItem.id == 2 && selectedOption == 2) {
      return (
        <div>
          <div className="pt-4 pl-4">
            <Select
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182, maxWidth: 300 }}
              onChange={selectedMergeComptition => this.setState({ selectedMergeComptition })}
              value={this.state.selectedMergeComptition}
              placeholder={AppConstants.selectCompetition}
            >
              {mergeCompetitionList.map(item => (
                <Option key={'competition_' + item.competitionId} value={item.competitionId}>
                  {item.competitionName}
                </Option>
              ))}
            </Select>
          </div>
          <Modal
            className="add-membership-type-modal"
            width={672}
            title={AppConstants.mergeCompetition}
            visible={this.state.modalVisible}
            okText="Proceed"
            onOk={e => this.ValidateProceed()}
            onCancel={e => this.showPropsConfirm('cancel')}
          >
            <div>
              <div style={{ fontWeight: 500 }}>
                <div>
                  {/* {AppConstants.differencesBetween + " "}
                                    {mergeCompetitionSelection.quickCompetition + " " + "and" + " "}
                                    {mergeCompetitionSelection.registrationCompetition + '.'} {AppConstants.oneHasPreference} */}
                  {AppConstants.whichCompetitionSettingPrecedence}
                </div>
              </div>
              {mergeCompetitionSelection.divisionGradesMismatch == 1 && (
                <div>
                  <div className="popup-text-color">{AppConstants.divisionAndGrades}</div>
                  <Radio.Group
                    className="reg-competition-radio"
                    onChange={e =>
                      this.competitionTypeSelection(e.target.value, 'divisioAndGrades')
                    }
                    value={this.state.divisionGradeOptionId}
                  >
                    <Radio value={1}>{mergeCompetitionSelection.quickCompetition}</Radio>
                    <Radio value={2}>{mergeCompetitionSelection.registrationCompetition}</Radio>
                  </Radio.Group>
                </div>
              )}
              {mergeCompetitionSelection.teamMismatch == 1 && (
                <div>
                  <div className="popup-text-color">{AppConstants.teams}</div>
                  <Radio.Group
                    className="reg-competition-radio"
                    onChange={e => this.competitionTypeSelection(e.target.value, 'teams')}
                    value={this.state.teamOptionId}
                  >
                    <Radio value={1}>{mergeCompetitionSelection.quickCompetition}</Radio>
                    <Radio value={2}>{mergeCompetitionSelection.registrationCompetition}</Radio>
                  </Radio.Group>
                </div>
              )}
              {mergeCompetitionSelection.playerMismatch == 1 && (
                <div>
                  <div className="popup-text-color">{AppConstants.players}</div>
                  <Radio.Group
                    className="reg-competition-radio"
                    onChange={e => this.competitionTypeSelection(e.target.value, 'players')}
                    value={this.state.playerOptionId}
                  >
                    <Radio value={1}>{mergeCompetitionSelection.quickCompetition}</Radio>
                    <Radio value={2}>{mergeCompetitionSelection.registrationCompetition}</Radio>
                    <Radio value={3}>{AppConstants.combine}</Radio>
                  </Radio.Group>
                </div>
              )}
              {/* {mergeCompetitionSelection.venueMismatch == 1 && (
                                <div>
                                    <div className="popup-text-color">
                                        {AppConstants.venues}
                                    </div>
                                    <Radio.Group
                                        className="reg-competition-radio"
                                        onChange={(e) => this.competitionTypeSelection(e.target.value, 'venues')}
                                        value={this.state.venueOptionId}
                                    >
                                        <Radio value={1}>{mergeCompetitionSelection.quickCompetition}</Radio>
                                        <Radio value={2}>{mergeCompetitionSelection.registrationCompetition}</Radio>
                                    </Radio.Group>
                                </div>
                            )} */}
              <div>
                <div className="popup-text-color">{AppConstants.competitionName}</div>
                <Radio.Group
                  className="reg-competition-radio"
                  onChange={e => this.competitionTypeSelection(e.target.value, 'competitionName')}
                  value={this.state.compNameOptionId}
                >
                  <Radio value={1}>{mergeCompetitionSelection.quickCompetition}</Radio>
                  <Radio value={2}>{mergeCompetitionSelection.registrationCompetition}</Radio>
                </Radio.Group>
              </div>
            </div>
          </Modal>

          <Modal
            className="add-membership-type-modal"
            width={672}
            title={AppConstants.mergeCompetition}
            visible={this.state.competitionMismatchModalVisible}
            okText="Proceed"
            onOk={e => this.mismatchModalOk('ok')}
            onCancel={e => this.mismatchModalOk('cancel')}
          >
            <div>
              <div style={{ fontWeight: 500 }}>{AppConstants.quickCompetitionMismatchMsg}</div>
            </div>
          </Modal>
        </div>
      );
    }
  };

  contentView = () => {
    const {
      teamPlayerArray,
      selectedTeamPlayer,
      importModalVisible,
      // importPlayer
    } = this.props.quickCompetitionState;
    return (
      <div className="content-view pt-5 mt-0">
        <span className="form-heading">{AppConstants.how_Add_teams_players}</span>
        <Radio.Group
          className="reg-competition-radio"
          onChange={e => this.props.updateSelectedTeamPlayer(e.target.value, 'selectedTeamPlayer')}
          value={selectedTeamPlayer}
        >
          {(teamPlayerArray || []).map(item => (
            <div key={'teamPlayer_' + item.id}>
              <Radio disabled={item.id == 1 && this.state.importPlayer == 1} value={item.id}>
                {item.value}
              </Radio>
              {this.mergeExistingCompetition(item, selectedTeamPlayer)}
            </div>
          ))}
        </Radio.Group>
        <ImportTeamPlayerModal
          onCancel={() => this.props.updateSelectedTeamPlayer('', 'importModalVisible')}
          visible={importModalVisible}
          modalTitle={AppConstants.importTeamPlayer}
          competitionId={this.state.competitionId}
        />
      </div>
    );
  };

  //on back button pressed
  onBackButton = () => {
    history.push('/quickCompetition');
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    return (
      <div className="fluid-width">
        <div className="footer-view">
          <div className="row">
            <div className="col-sm-3">
              <div className="reg-add-save-button">
                <Button
                  className="cancelBtnWidth"
                  type="cancel-button"
                  htmlType="submit"
                  onClick={() => this.onBackButton()}
                >
                  {AppConstants.back}
                </Button>
              </div>
            </div>
            <div className="col-sm-9">
              <div className="comp-buttons-view">
                <Button
                  className="save-draft-text"
                  type="save-draft-text"
                  onClick={() => this.onCompFormatPress()}
                >
                  {AppConstants.saveAsDraft}
                </Button>
                <Button
                  className="open-reg-button"
                  type="primary"
                  onClick={() => this.onCompFormatPress()}
                >
                  {AppConstants.addCompetitionFormat}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  onCompFormatPress() {
    const { selectedTeamPlayer } = this.props.quickCompetitionState;
    if (selectedTeamPlayer !== 0 || this.state.importPlayer == 1) {
      if (this.state.selectedMergeComptition !== null && selectedTeamPlayer == 2) {
        let payload = {
          registrationCompetitionId: this.state.selectedMergeComptition,
          quickCompetitionId: this.state.competitionId,
        };
        this.props.validateMergeCompetitionaction(payload);
        this.setState({
          invitationLoad: true,
          mergeValidateVisible: false,
        });
      } else if (selectedTeamPlayer == 2 && this.state.selectedMergeComptition == null) {
        message.config({
          maxCount: 1,
          duration: 0.9,
        });
        message.warn(ValidationConstants.pleaseSelectCompetition);
      } else if (selectedTeamPlayer == 1) {
        history.push('/quickCompetitionMatchFormat', {
          competitionUniqueKey: this.state.competitionId,
          year: this.state.yearRefId,
        });
      }
    } else {
      message.config({
        maxCount: 1,
        duration: 0.9,
      });
      message.warn(ValidationConstants.pleaseSelectOneOption);
    }
    this.props.CLEAR_OWN_COMPETITION_DATA('all');
  }

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.competitions}
          menuName={AppConstants.competitions}
        />
        <InnerHorizontalMenu menu="competition" compSelectedKey="2" />
        <Layout>
          {this.headerView()}
          <Content>
            <div className="formView">{this.contentView()}</div>
          </Content>
          <Footer>{this.footerView()}</Footer>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      updateSelectedTeamPlayer,
      getMergeCompetitionAction,
      quickCompImportDataCleanUpAction,
      validateMergeCompetitionaction,
      mergeCompetitionProceed,
      CLEAR_OWN_COMPETITION_DATA,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    quickCompetitionState: state.QuickCompetitionState,
    appState: state.AppState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(QuickCompetitionInvitations);
