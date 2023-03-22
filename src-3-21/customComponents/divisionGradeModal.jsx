import React from 'react';
import { Modal, InputNumber, Form, Button } from 'antd';

import AppConstants from '../themes/appConstants';
import AppImages from '../themes/appImages';
import ValidationConstants from '../themes/validationConstant';
import InputWithHead from './InputWithHead';

class DivisionGradeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      divisionState: true,
    };
    this.formRef = React.createRef();
  }

  componentDidUpdate() {
    if (this.props.visible === true && this.state.divisionState === true) {
      this.setState({ divisionState: false });
      this.valueupdate();
    }
    if (this.props.visible === false && this.state.divisionState === false) {
      this.setState({ divisionState: true });
    }
  }

  setFieldValues = () => {
    if (this.formRef.current) {
      let division = this.props.division;
      if (division.length > 0) {
        division.forEach((item, index) => {
          let division = `division${index}`;
          let matchDuration = `matchDuration${index}`;
          let timeBetweenGamesField = `timeBetweenGames${index}`;
          this.formRef.current.setFieldsValue({
            [division]: item.divisionName,
            [matchDuration]: item.matchDuration,
            [timeBetweenGamesField]: item.timeBetweenGames,
          });
          let grade = item.grades;
          if (grade.length > 0) {
            grade.forEach((gradeItem, gradeIndex) => {
              let grade = `grade${index}${gradeIndex}`;
              let team = `team${index}${gradeIndex}`;
              this.formRef.current.setFieldsValue({
                [grade]: gradeItem.gradeName,
                [team]: gradeItem.noOfTeams,
              });
            });
          }
        });
      }
    }
  };

  valueupdate = () => {
    setTimeout(() => {
      this.setFieldValues();
    }, 500);
  };

  onOKsubmit = e => {
    this.props.onOK(this.state.buttonClicked);
  };

  render() {
    const {
      // checkvalue,
      updateDivision,
      changeDivision,
      changeTeam,
      division,
      modalTitle,
      onDivisionBack,
      onCancel,
      addDivision,
      addGrade,
      removegrade,
      changegrade,
      removeDivision,
    } = this.props;
    return (
      <div className="bg-danger">
        <Modal
          {...this.props}
          className="add-membership-type-modal modalFooter"
          title={modalTitle}
          visible={this.props.visible}
          onCancel={onCancel}
          okText={AppConstants.save}
          cancelButtonProps={{ style: { position: 'absolute', left: 15 } }}
          footer={<div className="d-none" />}
          width={1000}
        >
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.onOKsubmit}
            onFinishFailed={({ errorFields }) =>
              this.formRef.current.scrollToField(errorFields[0].name)
            }
            noValidate="noValidate"
          >
            <div>
              <div className="inside-container-view mt-0">
                {division.map((item, index) => (
                  <div className="row" key={'divisionValue' + index}>
                    <div className="col-sm-2 pl-4 pb-2 division">
                      <Form.Item
                        name={`division${index}`}
                        rules={[{ required: true, message: ValidationConstants.divisionField }]}
                      >
                        <InputWithHead
                          heading={index == 0 ? AppConstants.division : ' '}
                          placeholder="Enter division"
                          // value={item.division}
                          onChange={e => changeDivision(index, e)}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-sm-5">
                      {item.grades.map((gradeItem, gradeIndex) => (
                        <div className="row" key={'gradeValue' + gradeIndex}>
                          <div className="col-sm pl-4 pb-2 division d-flex">
                            <Form.Item
                              name={`grade${index}${gradeIndex}`}
                              rules={[
                                {
                                  required: gradeIndex >= 1,
                                  message: ValidationConstants.gradeField,
                                },
                              ]}
                            >
                              <InputWithHead
                                heading={index == 0 && gradeIndex == 0 ? AppConstants.grade : ' '}
                                placeholder="Enter grade"
                                // value={gradeItem.grade}
                                onChange={e => changegrade(index, gradeIndex, e)}
                              />
                            </Form.Item>
                            {item.grades.length > 1 && (
                              <span
                                className="user-remove-btn pl-2 d-flex position-relative justify-content-center align-items-center"
                                role="button"
                                onClick={() => {
                                  removegrade(index, gradeIndex);
                                  this.valueupdate();
                                }}
                                style={{ paddingTop: 30, cursor: 'pointer' }}
                              >
                                <img
                                  className="dot-image"
                                  src={AppImages.redCross}
                                  alt=""
                                  width="16"
                                  height="16"
                                />
                              </span>
                            )}
                          </div>
                          <div className="col-sm pl-4 pb-2 pr-0">
                            <InputWithHead
                              heading={
                                index == 0 && gradeIndex == 0 ? AppConstants.numbersOfTeams : ' '
                              }
                            />
                            <Form.Item
                              name={`team${index}${gradeIndex}`}
                              rules={[
                                { required: true, message: ValidationConstants.SelectNumberTeam },
                              ]}
                            >
                              <InputNumber
                                className="quick_comp_ant_number"
                                type="number"
                                style={{ width: 100 }}
                                // value={gradeItem.team}
                                formatter={value =>
                                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                }
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                onChange={e => changeTeam(index, gradeIndex, e)}
                                placeholder="0"
                                min={2}
                              />
                            </Form.Item>
                          </div>
                        </div>
                      ))}
                      <span
                        className="input-heading-add-another pointer"
                        onClick={() => {
                          item.grades[0].gradeName.length > 0 && addGrade(index);
                          this.valueupdate();
                        }}
                      >
                        {' '}
                        + {AppConstants.addGrade}
                      </span>
                    </div>
                    <div className="col-sm-2 pl-4 pb-2">
                      <InputWithHead heading={index == 0 ? AppConstants.matchDuration : ' '} />
                      <Form.Item
                        name={`matchDuration${index}`}
                        rules={[{ required: true, message: ValidationConstants.matchDuration }]}
                      >
                        <InputNumber
                          className="quick_comp_ant_number"
                          type="number"
                          style={{ width: 100 }}
                          // value={gradeItem.team}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                          onChange={e => updateDivision('matchDuration', index, null, e)}
                          placeholder=""
                          min={1}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-sm-2 pl-4 pb-2">
                      <InputWithHead
                        heading={index == 0 ? AppConstants.timeBetweenMatchesShort : ' '}
                      />
                      <Form.Item
                        name={`timeBetweenGames${index}`}
                        rules={[{ required: true, message: ValidationConstants.timeBetweenGames }]}
                      >
                        <InputNumber
                          className="quick_comp_ant_number"
                          type="number"
                          style={{ width: 100 }}
                          // value={gradeItem.team}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                          onChange={e => updateDivision('timeBetweenGames', index, null, e)}
                          placeholder=""
                          min={0}
                        />
                      </Form.Item>
                    </div>
                    {division.length > 1 && (
                      <div
                        className="col-sm-1 delete-image-timeSlot-view"
                        onClick={() => {
                          removeDivision(index);
                          this.valueupdate();
                        }}
                      >
                        <a className="transfer-image-view">
                          <span className="user-remove-btn">
                            <i className="fa fa-trash-o" aria-hidden="true" />
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
                <span
                  className="input-heading-add-another pointer"
                  onClick={() => {
                    addDivision();
                    this.valueupdate();
                  }}
                >
                  {' '}
                  + {AppConstants.addDivisions}
                </span>
              </div>

              <div className="row">
                <div className="col-sm d-flex w-100" style={{ paddingTop: 10 }}>
                  <div className="col-sm-6 d-flex w-50 justify-content-start">
                    <Button
                      className="cancelBtnWidth"
                      type="cancel-button"
                      onClick={onDivisionBack}
                      style={{ marginRight: 20 }}
                    >
                      {AppConstants.back}
                    </Button>
                  </div>
                  <div className="col-sm-6 d-flex justify-content-end w-50">
                    <Button
                      className="publish-button save-draft-text"
                      type="primary"
                      htmlType="submit"
                      onClick={() => this.setState({ buttonClicked: 'save' })}
                    >
                      {AppConstants.save}
                    </Button>
                    <Button
                      className="publish-button"
                      type="primary"
                      htmlType="submit"
                      onClick={() => this.setState({ buttonClicked: 'next' })}
                    >
                      {AppConstants.next}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default DivisionGradeModal;
