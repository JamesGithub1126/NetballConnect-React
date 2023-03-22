import { cloneDeep, debounce, get } from 'lodash';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import InputWithHead from 'customComponents/InputWithHead';
import AppConstants from 'themes/appConstants';
import { useState } from 'react';
import { Checkbox, Radio } from 'antd';

const colsQuarters = ['firstQuarter', 'secondQuarter', 'thirdQuarter', 'fourthQuarter'];
const colsHalves = ['firstHalf', 'secondHalf'];
const teamFouls = 'teamFouls';
const perInterval = 'perInterval';

const BonusFouls = ({ values, onChange }) => {
  const [currentValues, setCurrentValues] = useState({});
  const [bonusFoulsThreshold, setBonusFoulsThreshold] = useState(
    (currentValues[teamFouls] && currentValues[teamFouls].type) || '',
  );
  const [checked, setChecked] = useState(!!currentValues[teamFouls]);
  const saveChanges = debounce(onChange, 500);

  const handleChange = (optionName, index, value) => {
    if (/^\d+$/.test(value) || value === '') {
      if (currentValues[teamFouls].type !== optionName) return 0;
      currentValues[teamFouls][perInterval][index] = value === '' ? 0 : parseInt(value);
      setCurrentValues(currentValues);
      saveChanges(currentValues);
    }
  };

  useEffect(() => {
    if (Object.keys(currentValues).length) return;

    setCurrentValues(cloneDeep(values));
  }, [values]);

  useEffect(() => {
    setChecked(!!currentValues[teamFouls]);
    setBonusFoulsThreshold((currentValues[teamFouls] && currentValues[teamFouls].type) || '');
  }, [currentValues]);

  const getFieldValue = (optionName, index) => {
    if (currentValues[teamFouls]) {
      if (currentValues[teamFouls].type !== optionName) return 0;
      return currentValues[teamFouls][perInterval][index];
    } else {
      return 0;
    }
  };

  return (
    <>
      <Checkbox
        className={`single-checkbox w-100`}
        onChange={e => {
          let checked = e.target.checked;
          setChecked(checked);
          if (checked) {
            currentValues[teamFouls] = {};
            setBonusFoulsThreshold('');
          } else {
            currentValues[teamFouls] = undefined;
          }
          setCurrentValues(currentValues);
          saveChanges(currentValues);
        }}
        checked={checked}
      >
        {AppConstants.bonusFoulsThreshold}
      </Checkbox>

      {checked && (
        <div className="mt-0 ml-4 pt-4">
          <Radio.Group
            className="reg-competition-radio w-100"
            onChange={e => {
              const value = e.target.value;
              let perInterval = [];
              for (let i = 0; i < (value === AppConstants.fourQuarters ? 4 : 2); i++) {
                perInterval.push(0);
              }
              currentValues[teamFouls] = {
                type: value,
                perInterval,
              };
              setBonusFoulsThreshold(value);
              setCurrentValues(currentValues);
              saveChanges(currentValues);
            }}
            value={bonusFoulsThreshold}
          >
            <div className="row mt-0">
              <div className="col-sm-12">
                <Radio value={AppConstants.fourQuarters}>{AppConstants.applyToQuarters}</Radio>
                {bonusFoulsThreshold === AppConstants.fourQuarters && (
                  <div className="input-width d-flex align-items-end ml-4 row mb-4 mt-n15">
                    {colsQuarters.map((columnName, index) => {
                      const columnNameValue = AppConstants[columnName];
                      const fieldValue = getFieldValue(AppConstants.fourQuarters, index);

                      return (
                        <div key={columnName} className="col-sm">
                          <InputWithHead heading={columnNameValue} />
                          <InputWithHead
                            placeholder={columnNameValue}
                            name={columnName}
                            onChange={e =>
                              handleChange(AppConstants.fourQuarters, index, e.target.value)
                            }
                            value={fieldValue}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="col-sm-6">
                <Radio value={AppConstants.twoHalves}>{AppConstants.applyToHalves}</Radio>
                {bonusFoulsThreshold === AppConstants.twoHalves && (
                  <div className="input-width d-flex align-items-end ml-4 row mb-4 mt-n15">
                    {colsHalves.map((columnName, index) => {
                      const columnNameValue = AppConstants[columnName];
                      const fieldValue = getFieldValue(AppConstants.twoHalves, index);

                      return (
                        <div key={columnName} className="col-sm">
                          <InputWithHead heading={columnNameValue} />
                          <InputWithHead
                            placeholder={columnNameValue}
                            name={columnName}
                            onChange={e =>
                              handleChange(AppConstants.twoHalves, index, e.target.value)
                            }
                            value={fieldValue}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </Radio.Group>
        </div>
      )}
    </>
  );
};

BonusFouls.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default BonusFouls;
