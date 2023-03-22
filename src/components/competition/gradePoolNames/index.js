import React, { useEffect, useState } from 'react';
import AppConstants from '../../../themes/appConstants';
import { Checkbox, Form, Modal, Radio, Select } from 'antd';
import AppUniqueId from '../../../themes/appUniqueId';
import { useDispatch, useSelector } from 'react-redux';
import {
  gradesReferenceListAction,
  getGenericCommonReference,
} from '../../../store/actions/commonAction/commonAction';
import InputWithHead from '../../../customComponents/InputWithHead';
import { updateCompetitionGradePoolsAction } from '../../../store/actions/competitionModuleAction/competitionGradesPoolsAction';
import { isArrayNotEmpty } from '../../../util/helpers';
import { GradesOrPools } from 'enums/enums';

const { Option } = Select;

const GradePoolNames = ({ disabled = true }) => {
  const dispatch = useDispatch();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [allDivisionVisible, setAllDivisionVisible] = useState(false);
  const gradesPoolsData = useSelector(
    state => state.CompetitionFeesState.competitionGradePoolsData,
  );
  const isAllDivisionChecked = useSelector(
    state => state.CompetitionFeesState.isAllDivisionChecked,
  );
  const divisionsList = useSelector(
    state => state.CompetitionFeesState.competitionDivisionsListData,
  );
  const competitionDetail = useSelector(state => state.CompetitionFeesState.competitionDetailData);
  let finalTypeRefId = competitionDetail.finalTypeRefId;
  const typeOfGrades = useSelector(state => state.CompetitionGradesPoolReducer.typeOfGrades);
  const gradesList = useSelector(state => {
    if (finalTypeRefId == GradesOrPools.Pools) {
      return state.CommonReducerState.Pools;
    } else {
      return state.CommonReducerState.gradesReferenceData;
    }
  });

  useEffect(() => {
    if (finalTypeRefId == GradesOrPools.Pools) {
      dispatch(getGenericCommonReference({ Pools: 'Pools' }));
    } else {
      dispatch(gradesReferenceListAction());
    }
  }, []);

  const performAllDivisionOperation = (checkedVal, competitionGradeNamingDivisions, index) => {
    let allDivObj = { ...competitionGradeNamingDivisions[index] };
    allDivObj.selectedDivisions = [];
    for (let i in allDivObj.divisions) {
      allDivObj.divisions[i].isDisabled = false;
    }

    let arr = [];
    arr.push(allDivObj);

    dispatch(updateCompetitionGradePoolsAction(checkedVal, 'allDivision'));
    dispatch(updateCompetitionGradePoolsAction(arr, 'competitionGradePoolsData'));
  };

  const onChangeAllDivision = (e, competitionGradeNamingDivisions, index) => {
    setCurrentIndex(index);

    if (competitionGradeNamingDivisions.length > 1 && e.target.checked) {
      setAllDivisionVisible(true);
      return;
    }

    performAllDivisionOperation(e.target.checked, competitionGradeNamingDivisions, index);
  };

  const addCompetitionGradePool = () => {
    dispatch(updateCompetitionGradePoolsAction(null, 'addCompetitionGradePool'));
  };

  const deleteModal = index => {
    setCurrentIndex(index);
    setDeleteModalVisible(true);
  };

  const deleteCompetitionGradePool = index => {
    dispatch(updateCompetitionGradePoolsAction(index, 'deleteCompetitionGradePool'));
  };

  const handleDeleteModal = (flag, key, index) => {
    setDeleteModalVisible(flag);

    if (key === 'ok') {
      deleteCompetitionGradePool(index);
    }
  };

  const deleteConfirmModalView = () => {
    return (
      <div>
        <Modal
          className="add-membership-type-modal"
          title="Grade Pool"
          visible={deleteModalVisible}
          onOk={() => handleDeleteModal(false, 'ok', currentIndex)}
          onCancel={() => handleDeleteModal(false, 'cancel', currentIndex)}
        >
          <p>Are you sure you want to remove?</p>
        </Modal>
      </div>
    );
  };

  const gradesPoolData = () => {
    if (isArrayNotEmpty(gradesPoolsData)) {
      for (let gradeNamePool of gradesPoolsData) {
        let divisionsArray = [];

        for (let div of divisionsList) {
          let divisionsObj = {
            compGradeNamingTemplateId: 0,
            competitionDivisionId: div.competitionDivisionId,
            isChecked: false,
            isDisabled: false,
            divisionName: div.divisionName,
          };
          let itemDivisions = gradeNamePool.divisions;
          for (let compDivision of itemDivisions) {
            if (compDivision.competitionDivisionId === div.competitionDivisionId) {
              divisionsObj.competitionGradeNamingDivisionId =
                compDivision.competitionGradeNamingDivisionId;
              divisionsObj.competitionDivisionId = compDivision.competitionDivisionId;
              divisionsObj.isChecked = true;
            }
          }
          divisionsArray.push(divisionsObj);
        }
        gradeNamePool.divisions = divisionsArray;
      }
      for (let item of gradesPoolsData) {
        let itemDivisions = item.divisions;
        let compGradeNamingTemplateId = item.compGradeNamingTemplateId;
        let remainingFormatDiv = gradesPoolsData.filter(
          x => x.compGradeNamingTemplateId !== compGradeNamingTemplateId,
        );

        for (let remDiv of remainingFormatDiv) {
          let selectedDivisions = remDiv.selectedDivisions;
          for (let i in selectedDivisions) {
            for (let j in itemDivisions) {
              if (itemDivisions[j].competitionDivisionId === selectedDivisions[i]) {
                itemDivisions[j].isDisabled = true;
              }
            }
          }
        }
      }
    }

    return gradesPoolsData;
  };

  const handleAllDivisionModal = (flag, key, index, competitionGradeNamingDivisions) => {
    setAllDivisionVisible(flag);

    if (key === 'ok') {
      performAllDivisionOperation(true, competitionGradeNamingDivisions, index);
    }
  };

  const allDivisionModalView = () => {
    const competitionGradeNamingDivisions = gradesPoolData();
    return (
      <div>
        <Modal
          className="add-membership-type-modal"
          title="Competition Grade Naming Divisions"
          visible={allDivisionVisible}
          onOk={() =>
            handleAllDivisionModal(false, 'ok', currentIndex, competitionGradeNamingDivisions)
          }
          onCancel={() =>
            handleAllDivisionModal(false, 'cancel', currentIndex, competitionGradeNamingDivisions)
          }
        >
          <p>This will remove the other grade naming formats.</p>
        </Modal>
      </div>
    );
  };

  const onDivisionChange = (e, index) => {
    let removedDivisions = [];
    let selectDivs = gradesPoolsData[index].selectedDivisions;
    for (let k in selectDivs) {
      if (e.indexOf(selectDivs[k]) === -1) {
        removedDivisions.push(selectDivs[k]);
        break;
      }
    }

    gradesPoolsData[index].selectedDivisions = e;
    let compGradeNamingTemplateId = gradesPoolsData[index].compGradeNamingTemplateId;
    let remainingFormatDiv = gradesPoolsData.filter(
      x => x.compGradeNamingTemplateId !== compGradeNamingTemplateId,
    );

    for (let remDiv in remainingFormatDiv) {
      let itemDivisions = remainingFormatDiv[remDiv].divisions;
      // disable true
      for (let i in e) {
        for (let j in itemDivisions) {
          if (itemDivisions[j].competitionDivisionId === e[i]) {
            itemDivisions[j].isDisabled = true;
          }
        }
      }

      for (let i in removedDivisions) {
        for (let j in itemDivisions) {
          if (itemDivisions[j].competitionDivisionId === removedDivisions[i]) {
            itemDivisions[j].isDisabled = false;
          }
        }
      }
    }

    dispatch(updateCompetitionGradePoolsAction(gradesPoolsData, 'competitionGradePoolsData'));
  };

  const handleChangeGradeInput = (gradePoolId, gradeRefId) => e => {
    dispatch(
      updateCompetitionGradePoolsAction(
        {
          name: e.target.value,
          gradeRefId,
        },
        'customTeamGrades',
        gradePoolId,
      ),
    );
  };

  const gradesInputList = gradePoolItem => {
    return gradesList.map(grade => {
      const customTeamGrade =
        gradePoolItem.customTeamGrades && isArrayNotEmpty(gradePoolItem.customTeamGrades)
          ? gradePoolItem.customTeamGrades.find(
              teamGrade => parseInt(teamGrade.gradeRefId) === parseInt(grade.id),
            )
          : null;
      const inputValue = customTeamGrade ? customTeamGrade.name : '';

      return (
        <div
          className="row mb-2 d-flex flex-row align-items-center"
          key={`customName${gradePoolItem.compGradeNamingTemplateId + '_' + grade.id}`}
        >
          <div className="col-sm-1">
            <span>{grade.description}</span>
          </div>
          <div className="col-sm-3 ">
            <Form.Item
              name={`customName${gradePoolItem.compGradeNamingTemplateId + '_' + grade.id}`}
              initialValue={inputValue}
            >
              <InputWithHead
                placeholder="Custom Name"
                onChange={handleChangeGradeInput(gradePoolItem.compGradeNamingTemplateId, grade.id)}
              />
            </Form.Item>
          </div>
        </div>
      );
    });
  };

  const gradePoolsList = () => {
    return gradesPoolData().map((item, index) => (
      <div className="inside-container-view" key={'compGradeNaming_' + index}>
        <div className="fluid-width">
          <div className="d-flex">
            <div className="applicable-to-heading pt-0">{AppConstants.gradePoolNames}</div>
            {disabled ? null : (
              <div
                className="transfer-image-view pt-0 pointer ml-auto"
                style={{ cursor: disabled && 'no-drop' }}
                onClick={() => disabled === false && deleteModal(item.compGradeNamingTemplateId)}
              >
                <span className="user-remove-btn">
                  <i className="fa fa-trash-o" aria-hidden="true" />
                </span>
                <span className="user-remove-text">{AppConstants.remove}</span>
              </div>
            )}
          </div>
          <Checkbox
            id={AppUniqueId.apply_match_format_All_divisions_Checkbox}
            disabled={disabled}
            className="single-checkbox pt-2"
            checked={isAllDivisionChecked}
            onChange={e => onChangeAllDivision(e, gradesPoolsData, index)}
          >
            {AppConstants.allDivisions}
          </Checkbox>
          {!isAllDivisionChecked && (
            <div className="fluid-width">
              <div className="row">
                <div className="col-sm">
                  <Select
                    disabled={disabled}
                    mode="multiple"
                    className="w-100"
                    style={{ paddingRight: 1, minWidth: 182 }}
                    onChange={e => onDivisionChange(e, index)}
                    value={item.selectedDivisions}
                  >
                    {item.divisions.map(division => (
                      <Option
                        key={'compMemProdDiv_' + division.competitionDivisionId}
                        disabled={division.isDisabled}
                        value={division.competitionDivisionId}
                      >
                        {division.divisionName}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              {allDivisionModalView()}
            </div>
          )}
        </div>
        <Form.Item
          name={`gradeTypeRefId-${item.compGradeNamingTemplateId}`}
          initialValue={item.gradeTypeRefId}
        >
          <Radio.Group
            className="reg-competition-radio"
            disabled={disabled}
            onChange={e =>
              dispatch(
                updateCompetitionGradePoolsAction(
                  e.target.value,
                  'gradeTypeRefId',
                  item.compGradeNamingTemplateId,
                ),
              )
            }
            value={item.gradeTypeRefId}
          >
            {typeOfGrades.map(item => (
              <Radio key={'gradeType_' + item.id} value={item.id}>
                {item.description}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        {item.gradeTypeRefId === 3 ? gradesInputList(item) : null}
      </div>
    ));
  };

  return (
    <div>
      {gradePoolsList()}
      {deleteConfirmModalView()}
      {!isAllDivisionChecked && !disabled && (
        <span className="input-heading-add-another pointer" onClick={addCompetitionGradePool}>
          + {AppConstants.addDivision}
        </span>
      )}
    </div>
  );
};

export default GradePoolNames;
