import { Checkbox, Form, Radio, Select } from 'antd';
import React from 'react';

import InputWithHead from 'customComponents/InputWithHead';
import AppConstants from 'themes/appConstants';
import { getOnlyNumbers } from 'components/liveScore/liveScoreSettings/liveScoreSettingsUtils';
import {
  extraTimeTypes,
  extraTimeTypeValues,
} from 'components/liveScore/liveScoreSettings/constants/liveScoreSettingsConstants';

const { Option } = Select;

const ExtraTimeFields = ({ values, onInputChange }) => {
  const { extraTime, extraTimeType } = values;

  if (+process.env.REACT_APP_EXTRATIME_FIELDS_ENABLED === 0) return null;

  const handleExtraTimeFieldChange = e => {
    const numberValue = getOnlyNumbers(e.target.value);
    onInputChange({
      target: {
        name: e.target.name,
        value: numberValue,
      },
    });
  };

  return (
    <>
      <InputWithHead marginTop={0} heading={AppConstants.extraTimeLabel} />
      <div className="row mt-0 ml-1">
        <Checkbox
          className="single-checkbox w-100 mt-0"
          checked={extraTime}
          onChange={e =>
            onInputChange({
              target: {
                name: 'extraTime',
                value: e.target.checked,
              },
            })
          }
        >
          {AppConstants.extraTimeCheckboxTitle}
        </Checkbox>
      </div>

      {extraTime && (
        <>
          <Form.Item name="extraTimeFor">
            <Radio.Group
              name="extraTimeFor"
              className="reg-competition-radio"
              onChange={onInputChange}
              style={{
                overflowX: 'unset',
              }}
            >
              <div className="row mt-0">
                <div className="col-sm-12 d-flex align-items-center">
                  <Radio value="ONE">{AppConstants.oneExtraTimeForDraw}</Radio>
                </div>

                <div className="col-sm-12 d-flex align-items-center">
                  <Radio value="ALL">{AppConstants.extraTimeForAllDraws}</Radio>
                </div>
              </div>
            </Radio.Group>
          </Form.Item>

          <div className="inside-container-view" style={{ marginTop: 15 }}>
            <div className="row">
              <div className="col-sm-3">
                <Form.Item
                  name="extraTimeType"
                  rules={[
                    {
                      required: true,
                      message: [],
                    },
                  ]}
                >
                  <>
                    <InputWithHead
                      inputHeadingStyles={{
                        paddingTop: 0,
                      }}
                      heading={AppConstants.extraTimeType}
                    />
                    <Select
                      showSearch
                      className="w-100"
                      onChange={val =>
                        onInputChange({
                          target: {
                            name: 'extraTimeType',
                            value: val,
                          },
                        })
                      }
                      placeholder="Select type"
                      optionFilterProp="children"
                      value={extraTimeType && extraTimeType !== 'null' ? extraTimeType : ''}
                    >
                      {extraTimeTypes.map(item => (
                        <Option key={item.value} value={item.value}>
                          {item.label}
                        </Option>
                      ))}
                    </Select>
                  </>
                </Form.Item>
              </div>

              {extraTimeType && (
                <div className="col-sm-3">
                  <Form.Item
                    name="extraTimeDuration"
                    rules={[
                      {
                        required: true,
                        message: [],
                      },
                    ]}
                  >
                    <InputWithHead
                      required="pt-0"
                      heading={AppConstants.duration}
                      placeholder={AppConstants.duration}
                      name="extraTimeDuration"
                      onChange={handleExtraTimeFieldChange}
                    />
                  </Form.Item>
                </div>
              )}

              {(extraTimeType === extraTimeTypeValues.halves ||
                extraTimeType === extraTimeTypeValues.quarters) && (
                <div className="col-sm-3">
                  <Form.Item
                    name="extraTimeMainBreak"
                    rules={[
                      {
                        required: true,
                        message: [],
                      },
                    ]}
                  >
                    <InputWithHead
                      required="pt-0"
                      heading={AppConstants.mainBreak}
                      placeholder={AppConstants.mainBreak}
                      name="extraTimeMainBreak"
                      onChange={handleExtraTimeFieldChange}
                    />
                  </Form.Item>
                </div>
              )}

              {extraTimeType === extraTimeTypeValues.quarters && (
                <div className="col-sm-3">
                  <Form.Item
                    name="extraTimeQuarterBreak"
                    rules={[
                      {
                        required: true,
                        message: [],
                      },
                    ]}
                  >
                    <InputWithHead
                      required="pt-0"
                      heading={AppConstants.quarterBreak}
                      placeholder={AppConstants.quarterBreak}
                      name="extraTimeQuarterBreak"
                      onChange={handleExtraTimeFieldChange}
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ExtraTimeFields;
