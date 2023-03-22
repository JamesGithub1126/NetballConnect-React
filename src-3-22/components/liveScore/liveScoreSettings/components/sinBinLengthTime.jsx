import { cloneDeep, debounce, get } from 'lodash';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import InputWithHead from 'customComponents/InputWithHead';
import AppConstants from 'themes/appConstants';
import { useState } from 'react';

const SinBinLengthOfTime = ({ values, onChange }) => {
  const [currentValues, setCurrentValues] = useState({});

  const handleTimeChange = e => {
    let lengthTime = e.target.value;
    if (/^\d+$/.test(lengthTime) || lengthTime === '') {
      currentValues[AppConstants.sinBinLengthOfTimeKey] = parseInt(lengthTime) || 0;
      onChange(currentValues);
    }
  };

  useEffect(() => {
    if (Object.keys(currentValues).length) return;

    setCurrentValues(cloneDeep(values));
  }, [values]);

  return (
    <div className="input-width d-flex pt-4 align-items-end">
      <InputWithHead
        heading={AppConstants.sinBinLengthOfTimeLabel}
        inputHeadingStyles={{
          fontWeight: 'bold',
        }}
      />
      <div className="ml-10">
        <InputWithHead
          placeholder=""
          onChange={handleTimeChange}
          value={currentValues[AppConstants.sinBinLengthOfTimeKey] || ''}
          inputHeadingStyles={{
            fontWeight: 'bold',
          }}
        />
      </div>
      <div className="ml-10">
        <InputWithHead heading={AppConstants._minutes} />
      </div>
    </div>
  );
};

SinBinLengthOfTime.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default SinBinLengthOfTime;
