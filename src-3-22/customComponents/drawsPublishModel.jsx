import React from 'react';
import { Modal, Select, Checkbox, Radio } from 'antd';
import AppConstants from '../themes/appConstants';
// import CustomToolTip from 'react-png-tooltip'
import AppUniqueId from '../themes/appUniqueId';

const { Option } = Select;

class DrawsPublishModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      modalPublish,
      modalDivisions,
      modalRounds,
      publishVisible,
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
      modalPublishPastMatchRadio,
      modalPublishPastMatch,
      isPastMatchAvailable,
    } = this.props;
    let filteredDivisions = divisionGradeNameList.filter(x => x.competitionDivisionGradeId != 0);
    let filteredRounds = getDrawsRoundsData.filter(x => x.roundId != 0);
    return (
      <Modal
        className="add-membership-type-modal"
        title={AppConstants.publish}
        visible={publishVisible}
        onOk={modalPublish}
        onCancel={modelCancel}
        okText={AppConstants.publish}
        cancelButtonProps={{ style: { position: 'absolute', left: 15 } }}
      >
        <div className="modal-publish-popup">
          <div className="d-flex">
            <div
              className="breadcrumb-add"
              style={{ fontSize: 15, fontWeight: 700, marginLeft: 10 }}
            >
              {AppConstants.whatDoYouWantToPublish}
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
                        mode="multiple"
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
          {isPastMatchAvailable == 1 && (
            <div>
              <div className="d-flex">
                <div
                  className="breadcrumb-add"
                  style={{ fontSize: 15, fontWeight: 700, marginLeft: 10 }}
                >
                  {AppConstants.publishPastMatches}
                </div>
              </div>
              <div>
                <Radio.Group
                  id={AppUniqueId.publish_Past_Matches}
                  onChange={modalPublishPastMatchRadio}
                  value={modalPublishPastMatch}
                  className="radio-model-popup"
                >
                  <Radio value={0}>{AppConstants.no}</Radio>
                  <Radio value={1}>{AppConstants.yes}</Radio>
                </Radio.Group>
              </div>
            </div>
          )}
        </div>
        { this.props.publishStatus > 0 && (
          <div className="modal-publish-warning">
            {AppConstants.ifYouAreUsingIntegratedUmpires}
          </div>
        )}
      </Modal>
    );
  }
}

export default DrawsPublishModel;
