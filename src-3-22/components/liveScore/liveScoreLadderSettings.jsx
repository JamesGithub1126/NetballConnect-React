import React, { Component } from 'react';
import {
  Layout,
  Breadcrumb,
  Select,
  Checkbox,
  Button,
  Form,
  Modal,
  message,
  Table,
  Radio,
  Space,
} from 'antd';
import InputWithHead from '../../customComponents/InputWithHead';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  ladderSettingGetMatchResultAction,
  ladderSettingGetDATA,
  updateLadderSetting,
  ladderSettingPostDATA,
} from '../../store/actions/LiveScoreAction/liveScoreLadderSettingAction';
import { getLadderReferenceListAction } from '../../store/actions/commonAction/commonAction';
import { isArrayNotEmpty } from '../../util/helpers';
import {
  getLiveScoreCompetition,
  getOrganisationData,
  getGlobalYear,
} from '../../util/sessionStorage';
import Loader from '../../customComponents/loader';
import history from '../../util/history';
import ValidationConstants from '../../themes/validationConstant';
import AppImages from '../../themes/appImages';
import { liveScoreExcludedRoundListAction } from '../../store/actions/LiveScoreAction/liveScoreRoundAction';

const { Header, Footer } = Layout;
const { Option } = Select;
const { confirm } = Modal;
class LiveScoreLadderSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      venueData: [],
      deleteModalVisible: false,
      handleAllDivisionModal: false,
      ladderIndex: null,
      saveLoad: false,
      ladderCalculationType: 1,
      hideAllDivisions: false,
      hiddenDivisionIds: [],
      hideAllRounds: false,
      hiddenRoundNames: [],
      ladderCalcDivs: [],
      clickedSave: false,
      ladderEndRefId: 2,
      showRegenLadderModal: false,
      regenLadderPointsForAllRounds: false,
      roundIdsForInclude: [],
      regenOptionValue: 2,
      hideAllDivisionsForLadder: false,
      hiddenDivisionIdsForLadder: [],
      hideAllRoundsForLadder: false,
      hiddenRoundNamesForLadder: [],
    };
  }

  columns = [
    {
      title: AppConstants.divisionName,
      dataIndex: 'rowKey',
      key: 'rowKey',
      width: 150,
      render: (rowKey, record) => {
        const { clickedSave } = this.state;
        return (
          <>
            <div>
              <Select
                onChange={divId => this.updateLadderCalcDiv(divId, rowKey, 'divisionId')}
                value={record.divisionId}
                className={`w-100 ${
                  clickedSave && !record.divisionId && record.ladderCalculationTypeId
                    ? 'ant-select-error'
                    : ''
                }`}
              >
                {record.selectableDivs.map(div => (
                  <Option key={div.divisionId} value={div.divisionId}>
                    {div.divisionName}
                  </Option>
                ))}
              </Select>
            </div>
          </>
        );
      },
    },
    {
      title: AppConstants.ladderCalculationType,
      dataIndex: 'rowKey',
      key: 'rowKey',

      render: (rowKey, record) => {
        const { ladderCalculationTypeList } = this.props;
        const { clickedSave } = this.state;
        return (
          <div>
            <Select
              onChange={ladderCalculationTypeId =>
                this.updateLadderCalcDiv(ladderCalculationTypeId, rowKey, 'ladderCalculationTypeId')
              }
              value={record.ladderCalculationTypeId}
              className={`w-100 ${
                clickedSave && !record.ladderCalculationTypeId && record.divisionId
                  ? 'ant-select-error'
                  : ''
              }`}
            >
              {ladderCalculationTypeList.map(l => (
                <Option key={l.id} value={l.id}>
                  {l.description}
                </Option>
              ))}
            </Select>
          </div>
        );
      },
    },
    {
      title: '',
      dataIndex: 'rowKey',
      key: 'rowKey',
      width: 42,
      render: (rowKey, record, index) => {
        return (
          <span
            className="d-flex justify-content-center w-100"
            role="button"
            style={{ cursor: 'pointer' }}
          >
            <img
              className="dot-image"
              src={AppImages.redCross}
              alt="delete"
              width="16"
              height="16"
              onClick={() => this.removeLadderCalcDiv(rowKey)}
            />
          </span>
        );
      },
    },
  ];

  componentDidMount() {
    this.props.getLadderReferenceListAction();
    if (getLiveScoreCompetition()) {
      const { uniqueKey, ladderCalculationTypeId, ladderEndRefId, id } = JSON.parse(
        getLiveScoreCompetition(),
      );
      //this.props.ladderSettingGetMatchResultAction()
      this.props.ladderSettingGetDATA(uniqueKey);
      this.setState({
        ladderCalculationType: ladderCalculationTypeId || 1,
        ladderEndRefId: ladderEndRefId,
        competitionId: id,
      });
      this.props.liveScoreExcludedRoundListAction(id);
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  componentDidUpdate(prevProps) {
    const { competitionId } = this.state;
    let ladderSettingState = this.props.ladderSettingState;
    if (prevProps.ladderSettingState != ladderSettingState) {
      if (ladderSettingState.loader == false && this.state.saveLoad) {
        this.setState({ saveLoad: false });
        this.props.ladderSettingGetDATA();
        this.props.liveScoreExcludedRoundListAction(competitionId);
      }
      if (ladderSettingState.onLoad == false && prevProps.ladderSettingState.onLoad == true) {
        const drawSettings = ladderSettingState.drawSettings;
        const hideLadderSettings = ladderSettingState.hideLadderSettings;
        const { divisions } = ladderSettingState;
        this.setState({
          hideAllDivisions: drawSettings.hideAllDivisions,
          hiddenDivisionIds: drawSettings.hiddenDivisionIds,
          hideAllRounds: drawSettings.hideAllRounds,
          hiddenRoundNames: drawSettings.hiddenRoundNames,
          ladderCalcDivs: divisions ? this.initLadderCalcDivs(divisions) : [],
        });
        if (hideLadderSettings) {
          this.setState({
            hideAllDivisionsForLadder: hideLadderSettings.hideAllDivisions,
            hiddenDivisionIdsForLadder: hideLadderSettings.hiddenDivisionIds,
            hideAllRoundsForLadder: hideLadderSettings.hideAllRounds,
            hiddenRoundNamesForLadder: hideLadderSettings.hiddenRoundNames,
          });
        }
      }
    }
  }

  onChangeLadderSetting = (value, index, key, subIndex, subKey) => {
    if (key === 'isAllDivision' && value) {
      // let ladders = this.props.ladderSettingState.ladders;
      // if (ladders.length > 1) {
      this.setState({ allDivisionVisible: true, ladderIndex: index });
      //} else {
      //     this.props.updateLadderSetting(value, index, key, subIndex, subKey);
      // }
    } else {
      this.props.updateLadderSetting(value, index, key, subIndex, subKey);
    }
  };

  initLadderCalcDivs = divisions => {
    let ladderCalcDivs = [];
    divisions.forEach((d, idx) => {
      if (d.ladderCalculationTypeId) {
        const div = {
          rowKey: 'assigned_' + idx + '_' + d.divisionId,
          divisionId: d.divisionId,
          divisionName: d.divisionName,
          ladderCalculationTypeId: d.ladderCalculationTypeId,
          ladderCalculationTypeDesc: d.ladderCalculationTypeDesc,
        };
        ladderCalcDivs.push(div);
      }
    });
    if (ladderCalcDivs.length > 0) {
      ladderCalcDivs.forEach(
        d =>
          (d.selectableDivs = this.getSelectableLadderCalcDivs(
            d.divisionId,
            ladderCalcDivs,
            divisions,
          )),
      );
      return ladderCalcDivs;
    } else {
      return [this.createNewLadderCalcDiv(ladderCalcDivs, divisions)];
    }
  };

  createNewLadderCalcDiv = () => {
    const { ladderCalcDivs } = this.state;
    const { divisions } = this.props.ladderSettingState;
    const { ladderCalculationTypeList } = this.props;
    if (!ladderCalcDivs || !divisions || !ladderCalculationTypeList) {
      return;
    }
    return {
      rowKey: 'new_' + Date.now(),
      divisionId: null,
      divisionName: null,
      ladderCalculationTypeId: null,
      ladderCalculationTypeDesc: null,
      selectableDivs: this.getSelectableLadderCalcDivs(null, ladderCalcDivs, divisions),
    };
  };

  getSelectableLadderCalcDivs = (exisitingDivId, ladderCalcDivs, divisions) => {
    if (!ladderCalcDivs || !divisions) {
      return [];
    }
    let usedDivIds = ladderCalcDivs
      .filter(d => d.divisionId !== exisitingDivId)
      .map(div => div.divisionId);
    return divisions.filter(div => !usedDivIds.includes(div.divisionId));
  };
  addNewLadderCalcDiv = () => {
    const { ladderCalcDivs } = this.state;
    if (!ladderCalcDivs) {
      return;
    }
    const div = this.createNewLadderCalcDiv();
    this.setState({ ladderCalcDivs: [...ladderCalcDivs, div] });
  };

  removeLadderCalcDiv = removedRowKey => {
    let { ladderCalcDivs } = this.state;
    const { divisions } = this.props.ladderSettingState;
    if (!ladderCalcDivs || !divisions) {
      return;
    }

    if (ladderCalcDivs.length === 1) {
      //clear fields if trying to delete the final row
      ladderCalcDivs[0].index = null;
      ladderCalcDivs[0].divisionName = null;
      ladderCalcDivs[0].ladderCalculationTypeId = null;
      ladderCalcDivs[0].ladderCalculationTypeDesc = null;
      ladderCalcDivs[0].selectableDivs = divisions;
      this.setState({ ladderCalcDivs: [...ladderCalcDivs] });
      return;
    }
    let remainingDivs = ladderCalcDivs.filter(d => d.rowKey !== removedRowKey);
    remainingDivs.forEach(
      d =>
        (d['selectableDivs'] = this.getSelectableLadderCalcDivs(
          d.divisionId,
          remainingDivs,
          divisions,
        )),
    );
    this.setState({
      ladderCalcDivs: [...remainingDivs],
    });
  };

  updateLadderCalcDiv = (value, rowKey, property) => {
    let { ladderCalcDivs } = this.state;
    const { divisions } = this.props.ladderSettingState;
    const { ladderCalculationTypeList } = this.props;
    if (!ladderCalcDivs || !divisions || !ladderCalculationTypeList) {
      return;
    }
    let div = ladderCalcDivs.find(d => d.rowKey === rowKey);
    if (div && property === 'divisionId') {
      let selectedDiv = divisions.find(d => d.divisionId === value);
      div.divisionId = selectedDiv.divisionId;
      div.divisionName = selectedDiv.divisionName;
      ladderCalcDivs.forEach(
        d =>
          (d['selectableDivs'] = this.getSelectableLadderCalcDivs(
            d.divisionId,
            ladderCalcDivs,
            divisions,
          )),
      );
    } else if ((property = 'ladderCalculationTypeId')) {
      let ladderCalculationTypeObj = ladderCalculationTypeList.find(l => l.id === value);
      div.ladderCalculationTypeId = ladderCalculationTypeObj.id;
      div.ladderCalculationTypeDesc = ladderCalculationTypeObj.description;
    }
    this.setState({ ladderCalcDivs: [...ladderCalcDivs] });
  };

  deleteModal = index => {
    this.setState({ deleteModalVisible: true, ladderIndex: index });
  };

  handleDeleteModal = key => {
    if (key === 'ok') {
      this.props.updateLadderSetting(null, this.state.ladderIndex, 'deleteLadder');
    }
    this.setState({ deleteModalVisible: false, ladderIndex: null });
  };

  handleAllDivisionModal = key => {
    if (key === 'ok') {
      this.props.updateLadderSetting(true, this.state.ladderIndex, 'isAllDivision');
    }
    this.setState({ allDivisionVisible: false, ladderIndex: null });
  };

  onSaveClick(canUpdatePastPoints) {
    const { ladders } = this.props.ladderSettingState;
    const {
      ladderCalculationType,
      ladderCalcDivs,
      regenLadderPointsForAllRounds,
      roundIdsForInclude,
    } = this.state;
    const {
      hideAllDivisions,
      hiddenDivisionIds,
      hideAllRounds,
      hiddenRoundNames,
      hideAllDivisionsForLadder,
      hiddenDivisionIdsForLadder,
      hideAllRoundsForLadder,
      hiddenRoundNamesForLadder,
    } = this.state;
    const reviewDrawSetting =
      (((hiddenDivisionIds.length > 0 && !hideAllDivisions) || hideAllDivisions) &&
        !hideAllRounds &&
        !hiddenRoundNames.length > 0) ||
      (((hiddenRoundNames.length > 0 && !hideAllRounds) || hideAllRounds) &&
        !hideAllDivisions &&
        !hiddenDivisionIds.length > 0);

    const reviewLadderSetting =
      (((hiddenDivisionIdsForLadder.length > 0 && !hideAllDivisionsForLadder) ||
        hideAllDivisionsForLadder) &&
        !hideAllRoundsForLadder &&
        !hiddenRoundNamesForLadder.length > 0) ||
      (((hiddenRoundNamesForLadder.length > 0 && !hideAllRoundsForLadder) ||
        hideAllRoundsForLadder) &&
        !hideAllDivisionsForLadder &&
        !hiddenDivisionIdsForLadder.length > 0);

    if (reviewDrawSetting || reviewLadderSetting) {
      message.error(AppConstants.pleaseReview);
      return;
    }

    const missingLadderCalcDivData = !!ladderCalcDivs.find(
      d =>
        (d.divisionId && !d.ladderCalculationTypeId) ||
        (!d.divisionId && d.ladderCalculationTypeId),
    );
    if (missingLadderCalcDivData) {
      message.error(AppConstants.pleaseReview);
      this.setState({ ladderCalcDivs: [...ladderCalcDivs], clickedSave: true });
      return;
    }

    ladders.forEach((item, index) => {
      if (item.ladderFormatId < 0) {
        item.ladderFormatId = 0;
      }
      item.isAllDivision = item.isAllDivision ? 1 : 0;
      delete item.divisions;
    });

    const drawSettings = {
      hideAllDivisions: !!hideAllDivisions,
      hiddenDivisionIds: hiddenDivisionIds,
      hideAllRounds: !!hideAllRounds,
      hiddenRoundNames: hiddenRoundNames,
    };

    const hideLadderSettings = {
      hideAllDivisions: !!hideAllDivisionsForLadder,
      hiddenDivisionIds: hiddenDivisionIdsForLadder,
      hideAllRounds: !!hideAllRoundsForLadder,
      hiddenRoundNames: hiddenRoundNamesForLadder,
    };

    const ladderCalculationDivisions = ladderCalcDivs
      .filter(l => !!l.divisionId && !!l.ladderCalculationTypeId)
      .map(l => {
        return {
          divisionId: l.divisionId,
          ladderCalculationTypeId: l.ladderCalculationTypeId,
        };
      });

    const postData = {
      drawSettings: drawSettings ?? null,
      hideLadderSettings: hideLadderSettings ?? null,
      ladders: ladders ?? [],
      ladderCalculationDivisions: ladderCalculationDivisions ?? [],
      ladderCalculationTypeId: ladderCalculationType,
      ladderEndRefId: this.state.ladderEndRefId,
      regenLadderPointsForAllRounds,
      roundIdsForInclude,
    };
    this.props.ladderSettingPostDATA(postData, canUpdatePastPoints);
    this.setState({ saveLoad: true });
  }

  handleChangeIncludedRounds = rounds => {
    this.setState({
      roundIdsForInclude: rounds,
    });
  };

  handleSaveModal = () => {
    const { ladders } = this.props.ladderSettingState;
    if (!ladders || ladders.length === 0) {
      message.error(ValidationConstants.createLadderSettings);
      return;
    }
    let ladderData = isArrayNotEmpty(ladders) ? ladders : [];
    let isAllDivision = ladderData.find(x => x.isAllDivision);
    let isAllDivisionChecked = isAllDivision != null;
    if (!isAllDivisionChecked) {
      this.openAllDivNotSelectedModal();
    } else {
      this.setState({
        showRegenLadderModal: true,
      });
    }
  };
  regenLadderModal = () => {
    const { onLoad } = this.props.ladderSettingState;
    const { excludedRoundList } = this.props.liveScoreRoundState;
    const {
      regenOptionValue,
      showRegenLadderModal,
      regenLadderPointsForAllRounds,
      roundIdsForInclude,
    } = this.state;

    const includeRounds = excludedRoundList && excludedRoundList.length && regenOptionValue === 1;
    const regenLadder = regenOptionValue === 1 ? true : false;
    return (
      <Modal
        width={'700px'}
        title={AppConstants.regenLadderPoints}
        visible={showRegenLadderModal}
        onOk={e =>
          this.setState(
            {
              showRegenLadderModal: false,
              regenLadderPointsForAllRounds: false,
              roundIdsForInclude: [],
              regenOptionValue: 2,
            },
            this.onSaveClick(regenLadder ? 1 : 0),
          )
        }
        okText={AppConstants.confirm}
        cancelText={AppConstants.cancel}
        onCancel={() =>
          this.setState({
            showRegenLadderModal: false,
            regenLadderPointsForAllRounds: false,
            roundIdsForInclude: [],
            regenOptionValue: 2,
          })
        }
      >
        <>
          <div>
            <div>{AppConstants.regenLadderPrompt}</div>
            <Radio.Group
              onChange={e => this.setState({ regenOptionValue: e.target.value })}
              value={regenOptionValue}
            >
              <Radio value={1}>{AppConstants.yes}</Radio>
              <Radio value={2}>{AppConstants.no}</Radio>
            </Radio.Group>
          </div>
          {!!includeRounds ? (
            <div className="mt-4">
              <div className="fluid-width">{AppConstants.includeRoundsPrompt}</div>
              <div>
                <Checkbox
                  className="single-checkbox"
                  checked={regenLadderPointsForAllRounds}
                  disabled={onLoad}
                  onChange={e => this.setState({ regenLadderPointsForAllRounds: e.target.checked })}
                >
                  {AppConstants.allRounds}
                </Checkbox>
              </div>
              <Select
                mode="multiple"
                placeholder={AppConstants.selectRounds}
                className="w-100"
                onChange={this.handleChangeIncludedRounds}
                value={!!roundIdsForInclude ? roundIdsForInclude : []}
                disabled={regenLadderPointsForAllRounds || onLoad}
              >
                {excludedRoundList.map(item => (
                  <Option key={item.id} value={item.id}>
                    {item.divisionName + ' - ' + item.name}
                  </Option>
                ))}
              </Select>
            </div>
          ) : null}
        </>
      </Modal>
    );
  };

  openAllDivNotSelectedModal = () => {
    const this_ = this;
    confirm({
      title: AppConstants.updateLadderPointsQuestion,
      okText: AppConstants.continue,
      okType: AppConstants.primary,
      cancelText: AppConstants.cancel,
      content: AppConstants.setPointsToZeroDesc,
      onOk() {
        this_.setState({ showRegenLadderModal: true });
      },
    });
  };

  onChangeLadderCalculationType = value => {
    this.setState({ ladderCalculationType: value });
  };

  onChangeHideAllDivs = e => {
    this.setState({ hideAllDivisions: !!e.target.checked });
  };

  onChangeHideAllRounds = e => {
    this.setState({ hideAllRounds: !!e.target.checked });
  };

  handleHiddenDivsChange = value => {
    this.setState({ hiddenDivisionIds: value });
  };

  handlehiddenRoundNamesChange = value => {
    this.setState({ hiddenRoundNames: value });
  };

  onChangeHideAllDivsForLadder = e => {
    this.setState({ hideAllDivisionsForLadder: !!e.target.checked });
  };

  onChangeHideAllRoundsForLadder = e => {
    this.setState({ hideAllRoundsForLadder: !!e.target.checked });
  };

  handleHiddenDivsChangeForLadder = value => {
    this.setState({ hiddenDivisionIdsForLadder: value });
  };

  handlehiddenRoundNamesChangeForLadder = value => {
    this.setState({ hiddenRoundNamesForLadder: value });
  };

  contentView = () => {
    const { ladders, divisions } = this.props.ladderSettingState;
    let ladderData = isArrayNotEmpty(ladders) ? ladders : [];
    let isAllDivision = ladderData.find(x => x.isAllDivision);
    let isAllDivisionChecked = isAllDivision != null;
    let allDivision = divisions.find(x => x.isDisabled == false);
    let allDivAdded = allDivision != null ? false : true;

    return (
      <div className="content-view pt-4">
        {(ladderData || []).map((ladder, index) => (
          <div className="inside-container-view" style={{ paddingTop: 25 }}>
            {ladderData.length > 1 && (
              <div className="d-flex float-right">
                <div
                  className="transfer-image-view pt-0 pointer ml-auto"
                  onClick={() => this.deleteModal(index)}
                >
                  <span className="user-remove-btn">
                    <i className="fa fa-trash-o" aria-hidden="true" />
                  </span>
                  <span className="user-remove-text">{AppConstants.remove}</span>
                </div>
              </div>
            )}
            <Checkbox
              className="single-checkbox pt-2 mt-0"
              checked={ladder.isAllDivision}
              onChange={e => this.onChangeLadderSetting(e.target.checked, index, 'isAllDivision')}
            >
              {AppConstants.allDivisions}
            </Checkbox>
            <div className="fluid-width">
              <div className="row d-block ml-0">
                <div className="col-sm pl-0" style={{ paddingTop: 5 }}>
                  <Select
                    mode="multiple"
                    className="w-100"
                    style={{ paddingRight: 1, minWidth: 182 }}
                    onChange={e => this.onChangeLadderSetting(e, index, 'selectedDivisions')}
                    value={ladder.selectedDivisions}
                  >
                    {(ladder.divisions || []).map(division => (
                      <Option
                        key={'division_' + division.divisionId}
                        value={division.divisionId}
                        disabled={division.isDisabled}
                      >
                        {division.divisionName}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
            <div className="inside-container-view">
              <div className="table-responsive">
                <div className="d-flex" style={{ paddingLeft: 10 }}>
                  <div style={{ width: '60%' }} className="ladder-points-heading">
                    <InputWithHead heading="Result type/Byes" />
                  </div>
                  <div style={{ width: '20%' }} className="ladder-points-heading">
                    <InputWithHead heading="Points" />
                  </div>
                  <div className="ladder-points-heading">
                    <InputWithHead heading={AppConstants.goalsAdjustment} />
                  </div>
                </div>
                {(ladder.settings || []).map((res, resIndex) => (
                  <div className="d-flex" style={{ paddingLeft: 10 }}>
                    <div style={{ width: '60%' }}>
                      <InputWithHead heading={res.name} />
                    </div>
                    <div style={{ marginTop: 5, width: '20%' }}>
                      <InputWithHead
                        className="input-inside-table-fees"
                        value={res.points}
                        placeholder="Points"
                        onChange={e =>
                          this.onChangeLadderSetting(
                            e.target.value,
                            index,
                            'resultTypes',
                            resIndex,
                            'points',
                          )
                        }
                      />
                    </div>
                    <div style={{ marginTop: 5 }}>
                      <InputWithHead
                        className="input-inside-table-fees"
                        value={res.goalsAdjustment}
                        placeholder={AppConstants.goalsAdjustment}
                        onChange={e =>
                          this.onChangeLadderSetting(
                            e.target.value,
                            index,
                            'resultTypes',
                            resIndex,
                            'goalsAdjustment',
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {isAllDivisionChecked == false && allDivAdded == false && (
          <div className="row">
            <div
              className="col-sm"
              onClick={e => this.onChangeLadderSetting(null, null, 'addLadder')}
            >
              <span className="input-heading-add-another pointer">
                + {AppConstants.addNewLadderScheme}
              </span>
            </div>
          </div>
        )}
        {this.deleteConfirmModalView()}
        {this.allDivisionModalView()}
      </div>
    );
  };

  deleteConfirmModalView = () => {
    return (
      <div>
        <Modal
          className="add-membership-type-modal"
          title={AppConstants.ladderFormat}
          visible={this.state.deleteModalVisible}
          onOk={() => this.handleDeleteModal('ok')}
          onCancel={() => this.handleDeleteModal('cancel')}
        >
          <p>{AppConstants.ladderRemoveMsg}</p>
        </Modal>
      </div>
    );
  };

  allDivisionModalView = () => {
    return (
      <div>
        <Modal
          className="add-membership-type-modal add-membership-type-modalLadder"
          title={AppConstants.ladderFormat}
          visible={this.state.allDivisionVisible}
          onOk={() => this.handleAllDivisionModal('ok')}
          onCancel={() => this.handleAllDivisionModal('cancel')}
        >
          <p>{AppConstants.ladderAllDivisionRmvMsg}</p>
        </Modal>
      </div>
    );
  };

  headerView = () => {
    return (
      <div className="header-view">
        <Header className="form-header-view d-flex bg-transparent align-items-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.ladderAndDrawSettings}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
      </div>
    );
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    // const { postData } = this.props.ladderSettingState

    return (
      <div className="fluid-width">
        <div className="footer-view">
          <div className="row">
            <div className="col-sm"></div>
            <div className="col-sm">
              <div className="comp-buttons-view">
                <Button onClick={this.handleSaveModal} className="publish-button" type="primary">
                  {AppConstants.save}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  calculationLadderSetting = () => {
    const { ladderCalculationTypeList } = this.props;

    return (
      <div className="mt-3">
        <div className="row">
          <div className="col-sm">
            <InputWithHead
              heading={AppConstants.defaultLadderCalculationType}
              conceptulHelp
              conceptulHelpMsg={AppConstants.ladderCalculationTypeMsg}
            />
            <div>
              <Select
                className="w-100"
                onChange={calculationTypeId =>
                  this.onChangeLadderCalculationType(calculationTypeId)
                }
                value={this.state.ladderCalculationType}
              >
                {ladderCalculationTypeList.map(item => (
                  <Option key={`calculationType_${item.id}`} value={item.id}>
                    {item.description}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  drawSettingsView = () => {
    let { hideAllDivisions, hideAllRounds, hiddenDivisionIds, hiddenRoundNames } = this.state;
    const { divisions, rounds } = this.props.ladderSettingState;

    const reviewDrawSetting =
      (((hiddenDivisionIds.length > 0 && !hideAllDivisions) || hideAllDivisions) &&
        !hideAllRounds &&
        !hiddenRoundNames.length > 0) ||
      (((hiddenRoundNames.length > 0 && !hideAllRounds) || hideAllRounds) &&
        !hideAllDivisions &&
        !hiddenDivisionIds.length > 0);

    return (
      <>
        <span className="row text-heading-large">{AppConstants.drawSettings}</span>
        <span className="text-heading-medium">{AppConstants.hideDraw}</span>
        <div>
          <Checkbox
            className="single-checkbox mt-0"
            checked={hideAllDivisions}
            onClick={this.onChangeHideAllDivs}
          >
            {AppConstants.allDivisions}
          </Checkbox>
        </div>
        <div>
          <Select
            className="w-100"
            mode="multiple"
            disabled={hideAllDivisions}
            placeholder={AppConstants.selectDivisions}
            value={hiddenDivisionIds}
            onChange={this.handleHiddenDivsChange}
          >
            {(divisions || []).map(division => (
              <Option key={'division_' + division.divisionId} value={division.divisionId}>
                {division.divisionName}
              </Option>
            ))}
          </Select>
        </div>
        <div>
          <Checkbox
            className="single-checkbox mt-15"
            checked={hideAllRounds}
            onClick={this.onChangeHideAllRounds}
          >
            {AppConstants.allRounds}
          </Checkbox>
        </div>
        <div>
          <Select
            className="w-100"
            mode="multiple"
            disabled={hideAllRounds}
            placeholder={AppConstants.selectRounds}
            value={hiddenRoundNames}
            onChange={this.handlehiddenRoundNamesChange}
          >
            {(rounds || []).map(round => (
              <Option key={'round_' + round.name} value={round.name}>
                {round.name}
              </Option>
            ))}
          </Select>
        </div>
        {reviewDrawSetting ? (
          <span className="warning-msg">{ValidationConstants.missingDrawSettingMsg}</span>
        ) : null}
      </>
    );
  };

  hideLadderView = () => {
    let {
      hideAllDivisionsForLadder,
      hideAllRoundsForLadder,
      hiddenDivisionIdsForLadder,
      hiddenRoundNamesForLadder,
    } = this.state;
    const { divisions, rounds } = this.props.ladderSettingState;

    const reviewLadderSetting =
      (((hiddenDivisionIdsForLadder.length > 0 && !hideAllDivisionsForLadder) ||
        hideAllDivisionsForLadder) &&
        !hideAllRoundsForLadder &&
        !hiddenRoundNamesForLadder.length > 0) ||
      (((hiddenRoundNamesForLadder.length > 0 && !hideAllRoundsForLadder) ||
        hideAllRoundsForLadder) &&
        !hideAllDivisionsForLadder &&
        !hiddenDivisionIdsForLadder.length > 0);

    return (
      <>
        <span className="text-heading-medium">{AppConstants.hideLadder}</span>
        <div>
          <Checkbox
            className="single-checkbox mt-0"
            checked={hideAllDivisionsForLadder}
            onClick={this.onChangeHideAllDivsForLadder}
          >
            {AppConstants.allDivisions}
          </Checkbox>
        </div>
        <div>
          <Select
            className="w-100"
            mode="multiple"
            disabled={hideAllDivisionsForLadder}
            placeholder={AppConstants.selectDivisions}
            value={hiddenDivisionIdsForLadder}
            onChange={this.handleHiddenDivsChangeForLadder}
          >
            {(divisions || []).map(division => (
              <Option key={'division_' + division.divisionId} value={division.divisionId}>
                {division.divisionName}
              </Option>
            ))}
          </Select>
        </div>
        <div>
          <Checkbox
            className="single-checkbox mt-15"
            checked={hideAllRoundsForLadder}
            onClick={this.onChangeHideAllRoundsForLadder}
          >
            {AppConstants.allRounds}
          </Checkbox>
        </div>
        <div>
          <Select
            className="w-100"
            mode="multiple"
            disabled={hideAllRoundsForLadder}
            placeholder={AppConstants.selectRounds}
            value={hiddenRoundNamesForLadder}
            onChange={this.handlehiddenRoundNamesChangeForLadder}
          >
            {(rounds || []).map(round => (
              <Option key={'round_' + round.name} value={round.name}>
                {round.name}
              </Option>
            ))}
          </Select>
        </div>
        {reviewLadderSetting ? (
          <span className="warning-msg">{ValidationConstants.missingLadderSettingMsg}</span>
        ) : null}
      </>
    );
  };

  ladderSettingsView = () => {
    return (
      <>
        <span className="row text-heading-large">{AppConstants.ladderSettings}</span>
        {this.calculationLadderSetting()}
        {this.ladderCalculationDivisionsView()}
        {this.ladderStopCalculatingPointsView()}
        {this.hideLadderView()}
      </>
    );
  };
  publicLink = (path, label) => {
    let { organisationUniqueKey } = getOrganisationData() || {};
    const yearRefId = getGlobalYear() ? getGlobalYear() : localStorage.getItem('yearId');
    const competition = getLiveScoreCompetition();
    let url =
      process.env.REACT_APP_URL_WEB_USER_REGISTRATION +
      `/${path}?organisationKey=${organisationUniqueKey}`;
    if (competition) {
      const { uniqueKey } = JSON.parse(getLiveScoreCompetition());
      url += `&competitionUniqueKey=${uniqueKey}&yearId=${yearRefId}`;
    }
    return (
      <div className="content-view mt-5 pt-3">
        {label === AppConstants.drawsLink ? this.drawSettingsView() : this.ladderSettingsView()}
        <div className="row">
          <div className="col-sm">
            <InputWithHead heading={label} />
            <div>
              <a className="user-reg-link" href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  ladderCalculationDivisionsView = () => {
    const { divisions } = this.props.ladderSettingState;
    const { ladderCalculationTypeList } = this.props;
    const { ladderCalcDivs, clickedSave } = this.state;
    const canAddMoreLadderCalculationDivs = ladderCalcDivs.length < divisions.length;
    const missingLadderCalcDivData = !!ladderCalcDivs.find(
      d =>
        (d.divisionId && !d.ladderCalculationTypeId) ||
        (!d.divisionId && d.ladderCalculationTypeId),
    );
    if (clickedSave && !missingLadderCalcDivData) {
      this.setState({ clickedSave: false });
    }
    if (!ladderCalcDivs || !divisions || !ladderCalculationTypeList) {
      return null;
    }
    return (
      <>
        <InputWithHead heading={AppConstants.ladderCalculationOverride} />
        <div className="flex-row inside-container-view d-flex flex-column mt-0">
          <div className="col-sm">
            <Table
              className="fees-table"
              columns={this.columns}
              rowKey={record => record.rowKey}
              dataSource={ladderCalcDivs}
              pagination={false}
              Divider="true"
              scroll={{ x: 'calc(100%)' }}
            />
          </div>
          <div className="col-sm mt-3">
            <a
              className={
                canAddMoreLadderCalculationDivs ? 'input-heading-add-another pointer' : 'disabled'
              }
              disabled={!canAddMoreLadderCalculationDivs}
              onClick={() => {
                if (canAddMoreLadderCalculationDivs) this.addNewLadderCalcDiv();
              }}
            >
              {'+ ' + AppConstants.addDivisions}
            </a>
          </div>
        </div>
        {clickedSave && missingLadderCalcDivData ? (
          <div>
            <span className="warning-msg pl-3">{ValidationConstants.requiredMessage}</span>
          </div>
        ) : null}
      </>
    );
  };

  ladderStopCalculatingPointsView = () => {
    const { ladderEndList } = this.props;
    return (
      <div className="mt-4 mb-4">
        <div className="row">
          <div className="col-sm">
            <div>{AppConstants.ladderStopCalculatingPoints}</div>
            <div className="mt-2 pl-2">
              <Radio.Group
                value={this.state.ladderEndRefId}
                onChange={e => this.setState({ ladderEndRefId: e.target.value })}
              >
                <Space direction="vertical" size={0} style={{ paddingLeft: 20 }}>
                  {ladderEndList.map(ref => (
                    <Radio key={`ladder_end_${ref.name}`} value={ref.id}>
                      {ref.description}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        {this.regenLadderModal()}
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="19" />
        <Loader
          visible={
            this.props.ladderSettingState.loader ||
            this.props.ladderSettingState.onLoad ||
            this.props.liveScoreRoundState.onLoad
          }
        />
        <Layout>
          {this.headerView()}
          {/* <Content> */}
          <Form onFinish={this.handleSubmit}>
            <div className="formView">{this.contentView()}</div>
            <div className="formView">
              {this.publicLink('liveScorePublicLadder', AppConstants.ladderLink)}
            </div>
            <div className="formView">
              {this.publicLink('livescoreSeasonFixture', AppConstants.drawsLink)}
            </div>
          </Form>

          <Footer>{this.footerView()}</Footer>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      ladderSettingGetMatchResultAction,
      ladderSettingGetDATA,
      updateLadderSetting,
      ladderSettingPostDATA,
      getLadderReferenceListAction,
      liveScoreExcludedRoundListAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    ladderSettingState: state.LadderSettingState,
    ladderCalculationTypeList: state.CommonReducerState.ladderCalculationTypeList,
    ladderEndList: state.CommonReducerState.ladderEndList,
    liveScoreRoundState: state.LiveScoreRoundState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreLadderSettings);
