import React from 'react';
import { Form, Radio } from 'antd';
import { get } from 'lodash';

import {
  getArrayFromLength,
  getOnlyNumbers,
  timeoutsModes,
  timeoutsOptions,
} from 'components/liveScore/liveScoreSettings/liveScoreSettingsUtils';
import InputWithHead from 'customComponents/InputWithHead';
import AppConstants from 'themes/appConstants';
import { isBasketball } from 'components/liveScore/liveScoreSettings/liveScoreSettingsUtils';

const LiveScoreSettingsTimeoutsFields = ({ isVisible = true, values, onFormChange, formRef }) => {
  if (!isVisible) return null;
  const { timeouts } = values;

  const getTimeoutsValue = fieldKey => {
    const value = get(values, `timeouts.perInterval[${fieldKey}]`, 0);
    return value;
  };

  const getExtraTimeValue = () => {
    const value = get(values, `timeouts.extraTime`, 1);
    return value;
  };

  const handleTimeoutsChange = value => {
    let perInterval = [];
    for (let i = 0; i < (value === timeoutsModes.FOUR_QUARTERS ? 4 : 2); i++) {
      perInterval.push(0);
    }
    let setValue = {
      type: value,
      perInterval,
      extraTime: 1,
    };

    onFormChange({
      key: 'timeouts',
      data: setValue,
    });
  };

  const handleTimeoutInputChange = (e, timeoutFieldKey, fieldOptionsIndex) => {
    let value = e.target.value;
    if (/^\d+$/.test(value) || value === '') {
      const { perInterval } = timeouts;
      const num = parseInt(value);
      perInterval[fieldOptionsIndex] = isNaN(num) ? '' : num;

      onFormChange({
        key: 'timeouts',
        data: timeouts,
      });
      formRef.setFieldsValue({
        [`${timeoutFieldKey}${fieldOptionsIndex}`]: value,
      });
    }
  };

  const handleExtraTimeInputChange = e => {
    let value = e.target.value;
    if (/^\d+$/.test(value) || value === '') {
      const num = parseInt(value);
      timeouts.extraTime = isNaN(num) ? '' : num;
      onFormChange({
        key: 'timeouts',
        data: timeouts,
      });
    }
  };

  return (
    <>
      <Form.Item name="timeouts">
        {timeoutsOptions.map(timeoutOption => (
          <div key={timeoutOption.key} className="row mr-0" style={{ marginLeft: '20px' }}>
            <div className="col-12 p-0">
              <Radio
                key={timeoutOption.key}
                value={timeoutOption.key}
                onChange={e => handleTimeoutsChange(e.target.value)}
                checked={timeouts && timeouts.type === timeoutOption.key}
              >
                {timeoutOption.radioTitle}
              </Radio>
            </div>

            {timeouts && timeouts.type === timeoutOption.key && (
              <div className="col-12 p-0">
                <div className="row" style={{ marginLeft: '20px' }}>
                  {getArrayFromLength(timeoutOption.fieldsLength).map((i, index) => {
                    const humanIndex = index + 1;
                    const suffixes = ['st', 'nd', 'rd', 'th'];
                    const suffix = index < 3 ? suffixes[index] : suffixes[3];
                    const title = `${humanIndex}${suffix} ${timeoutOption.optionTitle}`;
                    const value = getTimeoutsValue(index);

                    return (
                      <div key={timeoutOption.key + index} className="col-auto">
                        <InputWithHead
                          required="pt-0"
                          heading={title}
                          placeholder={title}
                          name={`${timeoutOption.stateKey}.${index}`}
                          value={value}
                          style={{
                            width: '60px',
                          }}
                          onChange={e => handleTimeoutInputChange(e, timeoutOption.stateKey, index)}
                        />
                      </div>
                    );
                  })}
                  {isBasketball && (
                    <div key={timeoutOption.key + 'extraTimePerPeriod'} className="col-auto">
                      <InputWithHead
                        required="pt-0"
                        heading={AppConstants.extraTimePerPeriod}
                        placeholder={AppConstants.extraTimePerPeriod}
                        name="extraTime"
                        value={getExtraTimeValue()}
                        style={{
                          width: '145px',
                        }}
                        onChange={e => handleExtraTimeInputChange(e, timeoutOption.stateKey)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </Form.Item>
    </>
  );
};

export default LiveScoreSettingsTimeoutsFields;
