import React from 'react';
import { Modal, Select, Checkbox, Radio } from 'antd';
import AppConstants from '../themes/appConstants';
// import CustomToolTip from 'react-png-tooltip'
import AppUniqueId from '../themes/appUniqueId';

const { Option } = Select;

class DrawsRegenerateModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      modalRegenerate,
      modalDivisions,
      modalRounds,
      regenerateVisible,
      modelCheckDivision,
      modelCheckRound,
      modelCancel,
      modelRadio,
      modalRadioValue,
      modalIsShowPart,
      modalIsShowDivision,
      modalIsShowRound,
      divisionGradeNameList,
      getDrawsRoundsData,
      modalRegeneratePastMatchRadio,
      modalRegeneratePastMatch,
      isPastMatchAvailable,
      competitionTypeRefId,
    } = this.props;
    let filteredDivisions = divisionGradeNameList.filter(x => x.competitionDivisionGradeId != 0);
    let filteredRounds = getDrawsRoundsData.filter(x => x.roundId != 0);
    let showUseRound1Template = false;
    let round1 = getDrawsRoundsData.find(x => x.name == 'Round 1');
    if (round1) {
      if (
        new Date(round1.startDateTime).getTime() > new Date().getTime() &&
        competitionTypeRefId == 1
      ) {
        showUseRound1Template = 1;
      }
    }
    return (
      <Modal
        className="add-membership-type-modal"
        title={AppConstants.drawsRegeneration}
        visible={regenerateVisible}
        onOk={modalRegenerate}
        onCancel={modelCancel}
      >
        <div className="modal-publish-popup">
          <div className="d-flex">
            <div
              className="breadcrumb-add"
              style={{ fontSize: 15, fontWeight: 700, marginLeft: 10 }}
            >
              {AppConstants.whatDoYouWantToRegenerate}
            </div>
          </div>
          <div>
            <Radio.Group
              id={AppUniqueId.publish_All_Or_PArt_radioBtn}
              onChange={modelRadio}
              value={modalRadioValue}
              className="radio-model-popup"
            >
              <Radio value={2}>{AppConstants.part}</Radio>
              {modalIsShowPart && (
                <div className="d-grid">
                  <Checkbox
                    className="checkbox-model-popup"
                    checked={modalIsShowDivision}
                    onChange={modelCheckDivision}
                  >
                    {AppConstants.byDivisionGrade}
                  </Checkbox>
                  {modalIsShowDivision && (
                    <div className="col-sm-3 division">
                      <Select
                        mode="multiple"
                        className="w-100"
                        style={{ minWidth: 370, marginLeft: 25 }}
                        onChange={modalDivisions}
                        filterOption={false}
                      >
                        {(filteredDivisions || []).map(item => (
                          <Option
                            key={'divisionGrade_' + item.competitionDivisionGradeId}
                            value={item.competitionDivisionGradeId}
                          >
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  )}
                  <Checkbox
                    className="checkbox-model-popup"
                    checked={modalIsShowRound}
                    onChange={modelCheckRound}
                  >
                    {AppConstants.byRound}
                  </Checkbox>
                  {modalIsShowRound && (
                    <div className="col-sm-3 division">
                      <Select
                        className="w-100"
                        style={{ minWidth: 370, marginLeft: 25 }}
                        onChange={modalRounds}
                        filterOption={false}
                        // onSearch={(value) => { this.handleSearch(value, appState.mainVenueList) }}
                      >
                        {(filteredRounds || []).map(item => (
                          <Option key={'round_' + item.roundId} value={item.roundId}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  )}
                </div>
              )}
              <Radio value={1} className="mt-3">
                {AppConstants.entireDraw}
              </Radio>
            </Radio.Group>
          </div>
          <div className="regenerateTitle mt-10">{AppConstants.wantYouRegenerateDraw}</div>
          <div>
            {' '}
            <Radio.Group
              className="radio-model-popup"
              value={this.props.regenerateExceptionRefId}
              onChange={e => this.props.setDrawState({ regenerateExceptionRefId: e.target.value })}
            >
              <Radio style={{ fontSize: '14px' }} value={2}>
                {AppConstants.useTeamRankings}
              </Radio>
              <Radio style={{ fontSize: '14px' }} value={1}>
                {AppConstants.retainExceptionAndWhoPlaysWho}
              </Radio>
              {showUseRound1Template && (
                <Radio style={{ fontSize: '14px' }} value={3}>
                  {AppConstants.useRound1Template}
                </Radio>
              )}
            </Radio.Group>
          </div>
          {isPastMatchAvailable == 1 && (
            <div>
              <div className="d-flex mt-10">
                <div
                  className="breadcrumb-add"
                  style={{ fontSize: 15, fontWeight: 700, marginLeft: 10 }}
                >
                  {AppConstants.RegeneratePastMatches}
                </div>
              </div>
              <div>
                <Radio.Group
                  id={AppUniqueId.publish_Past_Matches}
                  onChange={modalRegeneratePastMatchRadio}
                  value={modalRegeneratePastMatch}
                  className="radio-model-popup"
                >
                  <Radio value={0}>{AppConstants.no}</Radio>
                  <Radio value={1}>{AppConstants.yes}</Radio>
                </Radio.Group>
              </div>
            </div>
          )}
          {competitionTypeRefId == 2 && (
            <div>
              <div className="d-flex mt-10">
                <div
                  className="breadcrumb-add"
                  style={{ fontSize: 15, fontWeight: 700, marginLeft: 10 }}
                >
                  {AppConstants.compactMatches}
                </div>
              </div>
              <div>
                <Radio.Group
                  id={AppConstants.compactMatches}
                  onChange={e => this.props.setDrawState({ compactMatchesMode: e.target.value })}
                  value={this.props.compactMatchesMode}
                  className="radio-model-popup"
                >
                  <Radio value={0}>{AppConstants.none}</Radio>
                  <Radio value={1}>{AppConstants.auto}</Radio>
                  <Radio value={2}>{AppConstants.perGrade}</Radio>
                </Radio.Group>
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  }
}

export default DrawsRegenerateModal;
