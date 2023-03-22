import React from 'react';
import { Select, Modal, Checkbox, Radio, message, DatePicker } from 'antd';
import AppConstants from 'themes/appConstants';
import moment from 'moment';
const { Option } = Select;
const { RangePicker } = DatePicker;

const PublishType = {
  All: 1,
  Part: 2,
};
export default class PublishModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDivision: false,
      showRound: false,
      showDates: false,
      publishType: 1,
      selectedDivisions: [],
      selectedRounds: [],
      startDate: moment(new Date()).format('YYYY-MM-DD'),
      endDate: moment(new Date()).format('YYYY-MM-DD'),
    };
  }

  removeDuplicateValues = divisions => {
    const { roundList } = this.props;
    let rounds = !divisions.length
      ? roundList
      : roundList.filter(a => divisions.includes(a.divisionId));
    return rounds.filter(
      (obj, index, self) => index === self.findIndex(el => el['name'] === obj['name']),
    );
  };

  render() {
    const { divisionList } = this.props;
    const { showDivision, showRound, publishType, selectedDivisions, selectedRounds, showDates } = this.state;
    let filteredDivisions = divisionList.filter(x => x.competitionDivisionGradeId != 0);
    let filteredRounds = this.removeDuplicateValues(selectedDivisions); // roundList.filter(x => x.roundId != 0);
    return (
      <Modal
        className="add-membership-type-modal"
        title={AppConstants.publish}
        visible={true}
        maskClosable={false}
        closable={false}
        focusTriggerAfterClose={false}
        onOk={this.onSave}
        onCancel={this.props.onCancel}
        okText={AppConstants.publish}
        cancelButtonProps={{
          style: { position: 'absolute', left: 15 },
          disabled: this.props.onPublish,
        }}
        confirmLoading={this.props.onPublish}
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
              onChange={this.onPublishTypeChanged}
              value={publishType}
              className="radio-model-popup"
            >
              <Radio value={PublishType.All}>{AppConstants.allAllocations}</Radio>
              <Radio value={PublishType.Part}>{AppConstants.part}</Radio>
              {publishType == PublishType.Part && (
                <div className="d-grid">
                  <Checkbox
                    className="checkbox-model-popup"
                    checked={showDivision}
                    onChange={this.onCheckDivision}
                  >
                    {AppConstants.byDivision}
                  </Checkbox>
                  {showDivision && (
                    <div className="col-sm-3 division">
                      <Select
                        mode="multiple"
                        className="w-100"
                        style={{ minWidth: 370, marginLeft: 25 }}
                        filterOption={false}
                        value={selectedDivisions}
                        onChange={this.onDivisionChanged}
                      >
                        {(filteredDivisions || []).map(item => (
                          <Option key={'divisionGrade_' + item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  )}

                  <Checkbox
                    className="checkbox-model-popup"
                    checked={showRound}
                    onChange={this.onCheckRound}
                  >
                    {AppConstants.byRound}
                  </Checkbox>
                  {showRound && (
                    <div className="col-sm-3 division">
                      <Select
                        className="w-100"
                        mode="multiple"
                        style={{ minWidth: 370, marginLeft: 25 }}
                        filterOption={false}
                        value={selectedRounds}
                        onChange={this.onRoundChanged}
                      >
                        {(filteredRounds || []).map(item => (
                          <Option key={'round_' + item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  )}
                  <Checkbox
                    className="checkbox-model-popup"
                    checked={showDates}
                    onChange={this.onCheckDates}
                  >
                    {AppConstants.byDates}
                  </Checkbox>
                  {showDates && (
                    <div className="col-sm-3 division">
                      <RangePicker
                        className="w-100"
                        onChange={date => this.onChangeStartDate(date)}
                        format="DD-MM-YYYY"
                        style={{ minWidth: 370, marginLeft: 25 }}
                        value={[moment(this.state.startDate), moment(this.state.endDate)]}
                      />
                    </div>
                  )}
                </div>
              )}
            </Radio.Group>
          </div>
        </div>
      </Modal>
    );
  }

  onPublishTypeChanged = e => {
    this.setState({ publishType: e.target.value });
  };

  onSave = () => {
    let { showDivision, showRound, publishType, selectedDivisions, selectedRounds, startDate, endDate, showDates } = this.state;
    if (publishType == PublishType.Part) {
      if (!showDivision && !showRound && !showDates) {
        message.error(AppConstants.selectOneRoundOrDivisioin);
        return;
      }
      if (showDivision && !selectedDivisions.length) {
        message.error(AppConstants.selectOneDivision);
        return;
      }

      if (showRound && !selectedRounds.length) {
        message.error(AppConstants.selectOneRound);
        return;
      }
    } else {
      selectedDivisions = [];
      selectedRounds = [];
    }
    if (this.props.onSave) {
      this.props.onSave({ 
        divisionIds: selectedDivisions, 
        roundIds: selectedRounds, 
        startDate: showDates ? startDate : null, 
        endDate: showDates ? endDate : null 
      });
    }
  };

  onCheckDivision = e => {
    this.setState({ showDivision: e.target.checked });
  };

  onCheckRound = e => {
    this.setState({ showRound: e.target.checked });
  };

  onCheckDates = e => {
    this.setState({ showDates: e.target.checked });
  };

  onDivisionChanged = divisions => {
    // const { selectedRounds } = this.state;
    // let unDuplicatedRounds = this.removeDuplicateValues(e);
    //let resetRounds = unDuplicatedRounds.filter(r => selectedRounds.includes(r.divisionId));
    let roundIds = []; // resetRounds.map(r => r.id);

    this.setState({ selectedDivisions: divisions, selectedRounds: [] });
  };

  onRoundChanged = rounds => {
    this.setState({ selectedRounds: rounds });
  };

  onChangeStartDate = date => {
    if (date) {
      let startDate = moment(date[0]).format('YYYY-MM-DD');
      let endDate = moment(date[1]).format('YYYY-MM-DD');
      this.setState({
        startDate,
        endDate,
      });
    }
  };
}
