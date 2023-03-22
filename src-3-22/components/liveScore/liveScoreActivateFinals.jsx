import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Select, Modal, Checkbox, message } from 'antd';
import './liveScore.css';
import AppConstants from '../../themes/appConstants';
import { liveScoreActivateFinals } from '../../store/actions/LiveScoreAction/liveScoreMatchAction';

const { Option } = Select;

const LiveScoreActivateFinals = ({
  competitionId,
  disabled,
  divisionList,
  matchData,
  useButtonStyle,
}) => {
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState(false);
  const [allDivisions, setAllDivisions] = useState(true);
  const [selectedDivisions, setSelectedDivisions] = useState([]);

  const showMessage = useCallback(
    text => {
      message.config({ duration: 3, maxCount: 1 });
      message.error(text);
    },
    [message],
  );

  const handleSubmit = () => {
    setOpenModal(false);

    if (!competitionId) {
      showMessage('Invalid competition unique key');
      return;
    }

    const filtered = allDivisions
      ? divisionList
      : divisionList.filter(div => !!selectedDivisions.find(id => id === div.id));

    if (filtered.length > 0) {
      const divisionIds = filtered.map(it => it.id);
      dispatch(liveScoreActivateFinals(competitionId, divisionIds));
    }
  };

  const handleSelectDivision = e => {
    setSelectedDivisions([...e]);
  };
  const isDisabled = disabled || openModal;
  return (
    <>
      {useButtonStyle ? (
        <span
          key="activateFinals"
          disabled={isDisabled}
          onClick={() => (isDisabled ? void 0 : setOpenModal(true))}
          className={isDisabled ? 'ant-menu-item-disabled' : ''}
        >
          {AppConstants.activateFinals}
        </span>
      ) : (
        <div className="col-sm">
          <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
            <Button
              type="primary"
              className="primary-add-comp-form"
              disabled={isDisabled}
              onClick={() => setOpenModal(true)}
            >
              {AppConstants.activateFinals}
            </Button>
          </div>
        </div>
      )}

      <Modal
        className="add-membership-type-modal"
        title={AppConstants.activateFinals}
        visible={openModal}
        onOk={handleSubmit}
        onCancel={() => setOpenModal(false)}
      >
        <div className="d-flex align-items-center">
          <Checkbox
            className="single-checkbox"
            style={{ marginTop: '-15px', marginBottom: '15px' }}
            onChange={e => setAllDivisions(e.target.checked)}
            checked={allDivisions}
          >
            {AppConstants.allDivisions}
          </Checkbox>
        </div>
        <Select
          className="w-100 reg-filter-select-competition"
          onChange={handleSelectDivision}
          placeholder="Divisions"
          showSearch
          optionFilterProp="children"
          mode="multiple"
          disabled={allDivisions}
        >
          {(divisionList || []).map(item => (
            <Option key={`division_${item.id}`} value={item.id}>
              {item.name}
            </Option>
          ))}
        </Select>
      </Modal>
    </>
  );
};

export default LiveScoreActivateFinals;
