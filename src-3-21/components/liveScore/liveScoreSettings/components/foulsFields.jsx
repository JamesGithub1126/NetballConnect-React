import React, { useEffect, useState } from 'react';
import { cloneDeep, debounce, get } from 'lodash';
import { Checkbox } from 'antd';
import PropTypes from 'prop-types';

import InputWithHead from 'customComponents/InputWithHead';
import AppConstants from 'themes/appConstants';
import { getOnlyNumbers } from 'components/liveScore/liveScoreSettings/liveScoreSettingsUtils';
import { isBasketball } from 'components/liveScore/liveScoreSettings/liveScoreSettingsUtils';

const columns = ['name', 'removedFromGame', 'sendoffReport', 'sinBin', 'includeInPersonalFouls'];

const rows = isBasketball
  ? [AppConstants.personal, AppConstants.technicalAndUnsportsmanlike, AppConstants.disqualifying]
  : [
      AppConstants.personal,
      AppConstants.technical,
      AppConstants.unsportsmanlike,
      AppConstants.disqualifying,
    ];

const combinationAddsRows = [
  AppConstants.technicalAndUnsportsmanlike,
  AppConstants.unsportsmanlike,
];

const FoulsFields = ({ onChange, values = {} }) => {
  const [currentValues, setCurrentValues] = useState({});

  const saveChanges = debounce(onChange, 1000);

  const handleFoulsChange = (rowName, target) => {
    // const fieldName = target.name;
    // const fieldValue = getOnlyNumbers(target.value);
    // const currentRow = currentValues.find((row) => row.name === rowName)
    // const currentRowValues = (currentRow?.values) || {};

    // const newRowValues = {
    //     ...currentRowValues,
    //     [fieldName]: fieldValue,
    // }

    // if (currentRow) {
    //     currentRow.values = newRowValues;
    // } else {
    //     currentValues.push({
    //         name: rowName,
    //         values: newRowValues,
    //     })
    // }

    // {
    //     "removedFromGame":[
    //     { "type":"P", "value":1 },
    //     { "type":"T", "value":1 },
    //     { "type":"D", "value":1 },
    //     { "type":"U", "value":1 }
    //     ],

    //     "sendOffReport":[
    //     { "type":"P", "value":1 },
    //     { "type":"T", "value":1 },
    //     { "type":"D", "value":1 },
    //     { "type":"U", "value":1 }
    //     ],

    //     "sinBin":[
    //     { "type":"P", "value":1 },
    //     { "type":"T", "value":1 },
    //     { "type":"D", "value":1 },
    //     { "type":"U", "value":1 }
    //     ],

    //     "includeInPersonalFouls":[
    //     { "type":"P", "value":1 },
    //     { "type":"T", "value":1 },
    //     { "type":"D", "value":1 },
    //     { "type":"U", "value":1 }
    //     ]

    //     }

    let fieldValue;
    if (
      isBasketball &&
      rowName === AppConstants.technicalAndUnsportsmanlike &&
      target.name === 'includeInPersonalFouls'
    ) {
      fieldValue = (+target.checked).toString();
    } else {
      fieldValue = getOnlyNumbers(target.value);
    }
    const firstLetterOfRowName = rowName === AppConstants.personal ? AppConstants.pf : rowName.charAt(0).toUpperCase();
    const fieldName = target.name;
    let currentRow = (currentValues[fieldName] || []).filter(
      row => row.type !== firstLetterOfRowName,
    );

    let newRowValues = currentRow;
    if (isBasketball && rowName === AppConstants.technicalAndUnsportsmanlike) {
      const firstLettersOfNames = combinationAddsRows.map(name => name.charAt(0).toUpperCase());
      currentRow = (currentValues[fieldName] || []).filter(
        row => !firstLettersOfNames.includes(row.type),
      );
      newRowValues = currentRow;
      if (fieldValue !== '0') {
        combinationAddsRows.forEach(name => {
          const firstLetter = name.charAt(0).toUpperCase();
          newRowValues = [...newRowValues, { type: firstLetter, value: fieldValue }];
        });
      }
    } else {
      if (fieldValue !== '0') {
        newRowValues = [...newRowValues, { type: firstLetterOfRowName, value: fieldValue }];
      }
    }

    let newValues = {
      ...currentValues,
      [fieldName]: newRowValues,
    };
    setCurrentValues(newValues);
    saveChanges(newValues);
  };

  const getFieldValuePath = (rowName, fieldName) => {
    const firstLetterOfRowName = rowName === AppConstants.personal ? AppConstants.pf : rowName.charAt(0).toUpperCase();
    const fieldValues = currentValues[fieldName] || [];
    if (fieldValues.length === 0) return '';

    const currentRowIndex = fieldValues?.findIndex(row => row.type === firstLetterOfRowName);
    if (currentRowIndex === -1) return '';

    return `[${fieldName}][${currentRowIndex}].value`;
  };

  const renderHeaders = () => (
    <div className="row">
      {columns.map(columnName => {
        const columnNameValue = AppConstants[columnName];

        return (
          <div key={columnName} className="col-sm input-width d-flex align-items-end">
            <InputWithHead heading={columnNameValue} />
          </div>
        );
      })}
    </div>
  );

  const renderRow = rowName => (
    <div key={rowName} className="row mt-4">
      <div className="col-sm input-width d-flex align-items-end">
        <InputWithHead
          heading={rowName}
          inputHeadingStyles={{
            fontWeight: 'bold',
          }}
        />
      </div>

      {columns.map(columnName => {
        const columnNameValue = AppConstants[columnName];
        const isNameColumn = columnNameValue === AppConstants.name;
        if (isNameColumn) return;

        const fieldValue = get(currentValues, getFieldValuePath(rowName, columnName), 0);

        if (columnName === 'includeInPersonalFouls' && isBasketball) {
          return (
            <div key={columnName} className="col-sm input-width d-flex align-items-end">
              {rowName === AppConstants.technicalAndUnsportsmanlike ? (
                <Checkbox
                  className={`table-checkbox justify-content-center w-100`}
                  onChange={e => handleFoulsChange(rowName, e.target)}
                  checked={!!fieldValue}
                  name={columnName}
                />
              ) : null}
            </div>
          );
        }

        return (
          <div key={columnName} className="col-sm input-width d-flex align-items-end">
            <InputWithHead
              placeholder=""
              name={columnName}
              onChange={e => handleFoulsChange(rowName, e.target)}
              value={fieldValue}
            />
          </div>
        );
      })}
    </div>
  );

  const renderFieldsTable = () => (
    <>
      {renderHeaders()}
      {rows.map(renderRow)}
    </>
  );

  useEffect(() => {
    if (Object.keys(currentValues).length) return;

    setCurrentValues(cloneDeep(values) || {});
  }, [values]);

  return renderFieldsTable();
};

FoulsFields.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default FoulsFields;
