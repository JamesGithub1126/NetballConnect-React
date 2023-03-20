import React, { Component } from 'react';
import { Layout, Button, Select, Breadcrumb, Form, Modal, Radio } from 'antd';
import './liveScore.css';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import InputWithHead from '../../customComponents/InputWithHead';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  updateLadderSetting,
  ladderAdjustmentPostData,
  ladderAdjustmentGetData,
  resetLadderAction,
} from '../../store/actions/LiveScoreAction/liveScoreLadderAction';
import { isArrayNotEmpty } from '../../util/helpers';
import { getLiveScoreCompetition } from '../../util/sessionStorage';
import { getliveScoreTeams } from '../../store/actions/LiveScoreAction/liveScoreTeamAction';
import { getLiveScoreDivisionList } from '../../store/actions/LiveScoreAction/liveScoreDivisionAction';
import Loader from '../../customComponents/loader';
import ValidationConstants from '../../themes/validationConstant';
import history from '../../util/history';
import CustomToolTip from 'react-png-tooltip';

const { Header, Footer } = Layout;
const { Option } = Select;

class LiveScoreLadderAdjustment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      competitionId: null,
      loadding: true,
      divisionId: props.location
        ? props.location.state
          ? props.location.state.divisionId
            ? props.location.state.divisionId
            : null
          : null
        : null,
      compUniqueKey: null,
      getLoad: false,
      modalVisible: false,
      resetOptionId: 1,
      resetLoad: false,
      compOrgId: 0,
    };
    this.formRef = React.createRef();
  }

  componentDidMount() {
    let divisionId = this.props.location
      ? this.props.location.state
        ? this.props.location.state.divisionId
        : null
      : null;
    if (getLiveScoreCompetition()) {
      this.props.updateLadderSetting({ key: 'refresh' });

      const { id, uniqueKey, competitionOrganisation, competitionOrganisationId } = JSON.parse(
        getLiveScoreCompetition(),
      );
      let compOrgId = competitionOrganisation
        ? competitionOrganisation.id
        : competitionOrganisationId
        ? competitionOrganisationId
        : 0;

      this.setState({ competitionId: id, compUniqueKey: uniqueKey, compOrgId });
      if (id !== null) {
        this.props.getLiveScoreDivisionList(id);
        this.setState({ loadding: true });
      }
    } else {
      history.push('/matchDayCompetitions');
    }

    if (getLiveScoreCompetition()) {
      if (!divisionId) {
        history.push('/matchDayLadderList');
      }
    }
  }

  componentDidUpdate(nextProps) {
    if (
      nextProps.liveScoreLadderState.liveScoreLadderDivisionData !==
      this.props.liveScoreLadderState.liveScoreLadderDivisionData
    ) {
      if (this.state.loadding === true && this.props.liveScoreLadderState.onLoad === false) {
        const { id, uniqueKey } = JSON.parse(getLiveScoreCompetition());
        this.props.getliveScoreTeams(id, this.state.divisionId, this.state.compOrgId);

        let divisionId = this.props.location
          ? this.props.location.state
            ? this.props.location.state.divisionId
            : null
          : null;
        if (divisionId) {
          this.props.ladderAdjustmentGetData({
            uniqueKey: uniqueKey,
            divisionId: this.props.location.state.divisionId,
          });
        }
        // this.setInitalFiledValue()
        this.setState({ loadding: false, getLoad: true });
      }
    }

    if (this.state.getLoad === true && this.props.liveScoreLadderState.onLoading === false) {
      this.setInitalFiledValue();
      this.setState({ getLoad: false });
    }

    if (this.state.resetLoad && this.props.liveScoreLadderState.onResetLoad == false) {
      this.setState({ resetLoad: false });
      history.push('/matchDayLadderList');
    }
  }

  setInitalFiledValue() {
    const { ladderData } = this.props.liveScoreLadderState;
    let data = isArrayNotEmpty(ladderData) ? ladderData : [];
    data.forEach((item, index) => {
      let teamId = `teamId${index}`;
      let points = `points${index}`;
      let adjustmentReason = `adjustmentReason${index}`;
      this.formRef.current.setFieldsValue({
        [teamId]: item.teamId ? item.teamId : undefined,
        [points]: item.points,
        [adjustmentReason]: item.adjustmentReason,
      });
    });
  }

  headerView = () => {
    return (
      <div className="header-view">
        <Header className="form-header-view d-flex bg-transparent align-items-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.ladderAdjustment}
              <CustomToolTip>
                <span>{AppConstants.ladderAdjustmentContextual}</span>
              </CustomToolTip>
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
      </div>
    );
  };

  changeDivision(divisionId) {
    this.props.updateLadderSetting({ data: divisionId, key: 'divisionId' });
    this.props.getliveScoreTeams(this.state.competitionId, divisionId, this.state.compOrgId);
    this.props.ladderAdjustmentGetData({ uniqueKey: this.state.compUniqueKey, divisionId });
    this.setState({ divisionId, getLoad: true });
  }

  dropdownView = () => {
    const { ladderDivisionList } = this.props.liveScoreLadderState;
    let divisionListArr = isArrayNotEmpty(ladderDivisionList) ? ladderDivisionList : [];
    return (
      <div className="comp-venue-courts-dropdown-view mt-0">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <div className="w-ft d-flex flex-row align-items-center">
                <span className="year-select-heading">{AppConstants.division}:</span>

                <Select
                  className="year-select"
                  style={{ minWidth: 80 }}
                  onChange={divisionId => this.changeDivision(divisionId)}
                  value={this.state.divisionId}
                >
                  {divisionListArr.map(item => (
                    <Option key={'division_' + item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  deleteItem(index) {
    this.props.updateLadderSetting({ index, key: 'removeItem' });
  }

  confirmationModal(key, compUniqueKey, resetOptionId) {
    if (key === 'show') {
      this.setState({
        modalVisible: true,
      });
    } else if (key === 'ok') {
      let divisionId = null;
      if (this.state.resetOptionId == 1) {
        divisionId = this.state.divisionId;
      }

      let obj = {
        competitionUniqueKey: compUniqueKey,
        resetOptionId: resetOptionId,
        divisionId,
      };
      this.props.resetLadderAction(obj);
      this.setState({
        modalVisible: false,
        compUniqueKey: compUniqueKey,
        resetLoad: true,
      });
    } else if (key === 'cancel') {
      this.setState({
        modalVisible: false,
        resetOptionId: 1,
      });
    }
  }

  onChangeSetValue = targetValue => {
    this.setState({
      resetOptionId: targetValue,
    });
  };

  contentView = () => {
    const { ladderData, teamResult } = this.props.liveScoreLadderState;
    let addNewLadder = isArrayNotEmpty(ladderData) ? ladderData : [];
    let teamList = isArrayNotEmpty(teamResult) ? teamResult : [];

    return (
      <div className="content-view pt-4 pb-3">
        {addNewLadder.map((ladder, index) => (
          <div className="inside-container-view">
            <div
              className="transfer-image-view pt-0 pointer ml-auto"
              onClick={() => this.deleteItem(index)}
            >
              <span className="user-remove-btn">
                <i className="fa fa-trash-o" aria-hidden="true" />
              </span>
              <span className="user-remove-text">{AppConstants.remove}</span>
            </div>

            <div className="row pt-3">
              <div className="col-sm-3 division-table-field-view">
                <InputWithHead required="required-field pb-0" heading={AppConstants.teamName} />
              </div>
              <div className="col-sm">
                <Form.Item
                  name={`teamId${index}`}
                  rules={[{ required: true, message: ValidationConstants.teamName }]}
                >
                  <Select
                    placeholder={AppConstants.selectTeam}
                    className="w-100"
                    onChange={teamId =>
                      this.props.updateLadderSetting({
                        data: teamId,
                        index,
                        key: 'teamId',
                      })
                    }
                    // value={ladderData[index] ? ladderData[index].teamId : undefined}
                    showSearch
                    optionFilterProp="children"
                  >
                    {teamList.map(item => (
                      <Option key={'team_' + item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>

            <div className="row pt-3">
              <div className="col-sm-3 division-table-field-view">
                <InputWithHead required="required-field pb-0" heading={AppConstants.points} />
              </div>
              <div className="col-sm">
                <Form.Item
                  name={`points${index}`}
                  rules={[{ required: true, message: ValidationConstants.point }]}
                >
                  <InputWithHead
                    auto_complete="off"
                    placeholder={AppConstants.points}
                    onChange={e =>
                      this.props.updateLadderSetting({
                        data: e.target.value,
                        index,
                        key: 'points',
                      })
                    }
                    // value={ladderData[index] && ladderData[index].points}
                  />
                </Form.Item>
              </div>
            </div>

            <div className="row pt-3">
              <div className="col-sm-3 division-table-field-view">
                <InputWithHead
                  required="required-field pb-0"
                  heading={AppConstants.reasonForChange}
                />
              </div>
              <div className="col-sm">
                <Form.Item
                  name={`adjustmentReason${index}`}
                  rules={[{ required: true, message: ValidationConstants.reasonChange }]}
                >
                  <InputWithHead
                    auto_complete="off"
                    placeholder={AppConstants.reasonForChange}
                    onChange={e =>
                      this.props.updateLadderSetting({
                        data: e.target.value,
                        index,
                        key: 'adjustmentReason',
                      })
                    }
                    // value={ladderData[index] && ladderData[index].reasonforChange}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        ))}

        <div>
          <span
            onClick={() =>
              this.props.updateLadderSetting({ data: null, key: 'addLadderAdjustment' })
            }
            className="input-heading-add-another pointer"
          >
            + {AppConstants.addNewAdjustment}
          </span>
        </div>
        <div style={{ paddingBottom: 24 }}>
          <span
            onClick={() => this.confirmationModal('show', null)}
            className="input-heading-add-another pointer reset-ladder-font"
          >
            {AppConstants.resetLadder}
          </span>
        </div>

        <Modal
          className="add-membership-type-modal"
          title={AppConstants.resetLadder}
          visible={this.state.modalVisible}
          onOk={() =>
            this.confirmationModal('ok', this.state.compUniqueKey, this.state.resetOptionId)
          }
          onCancel={() => this.confirmationModal('cancel', null)}
        >
          <div>
            <p>{AppConstants.resetLadderConformation}</p>
            <Radio.Group
              className="reg-competition-radio customize-radio-text"
              onChange={e => this.onChangeSetValue(e.target.value)}
              value={this.state.resetOptionId}
            >
              <Radio value={1}>{AppConstants.selectedDivision}</Radio>
              <Radio value={2}>{AppConstants.fullReset}</Radio>
            </Radio.Group>
          </div>
        </Modal>
      </div>
    );
  };

  footerView = isSubmitting => {
    return (
      <div className="fluid-width">
        {!this.state.membershipIsUsed && (
          <div className="footer-view">
            <div className="row">
              {/* <div className="col-sm">
                                <div className="reg-add-save-button">
                                    <Button type="cancel-button">{AppConstants.cancel}</Button>
                                </div>
                            </div> */}
              <div className="col-sm">
                <div className="comp-buttons-view">
                  <Button
                    className="publish-button save-draft-text"
                    type="primary"
                    htmlType="submit"
                  >
                    {AppConstants.save}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  ////Api call after on save click
  onSaveClick = values => {
    const { ladderData } = this.props.liveScoreLadderState;
    let body = {
      competitionUniqueKey: this.state.compUniqueKey,
      divisionId: this.state.divisionId,
      adjustments: ladderData,
    };
    this.props.ladderAdjustmentPostData({ body });
  };

  render = () => {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.matchDay} menuName={AppConstants.liveScores} />
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="11" />
        <Loader
          visible={
            this.props.liveScoreLadderState.onLoading || this.props.liveScoreLadderState.onResetLoad
          }
        />
        <Layout>
          {this.headerView()}
          {this.dropdownView()}
          <Form ref={this.formRef} autoComplete="off" onFinish={this.onSaveClick}>
            <div className="formView">{this.contentView()}</div>
            <Footer>{this.footerView()}</Footer>
          </Form>
        </Layout>
      </div>
    );
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      updateLadderSetting,
      getliveScoreTeams,
      getLiveScoreDivisionList,
      ladderAdjustmentPostData,
      ladderAdjustmentGetData,
      resetLadderAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreLadderState: state.LiveScoreLadderState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreLadderAdjustment);
