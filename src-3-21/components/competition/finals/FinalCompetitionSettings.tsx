import React, { useState } from 'react';
import AppConstants from '../../../themes/appConstants';
import InputWithHead from '../../../customComponents/InputWithHead';
import ValidationConstants from '../../../themes/validationConstant';
import { Checkbox, Form, Input, InputNumber } from 'antd';

export interface FinalMatch {
  matchName: string;
  team1: string | number;
  team2: string | number;
  team1Grade: number;
  team2Grade: number;
}

export interface FinalRound {
  matches: FinalMatch[];
}

export interface FinalFixtureTemplate {
  finalDivisionName: string;
  allowDifferentGrades: boolean;
  numberOfTeams: number;
  roundNames: any[];
  numberOfRounds: number;
  rounds: FinalRound[];
}

export default function FinalCompetitionSettings({
  prefix,
  customFormat,
  onChange,
  disabled,
}: {
  disabled: boolean;
  prefix: (string | number)[];
  customFormat: FinalFixtureTemplate;
  onChange: (customFormat: FinalFixtureTemplate) => void;
}) {
  return (
    <div>
      <div className={'row'}>
        <div className={'col-sm'}>
          <InputWithHead heading={AppConstants.numberOfRounds} required="required-field" />
          <Form.Item
            name={[...prefix, 'numberOfRounds']}
            rules={[
              {
                required: true,
                message: ValidationConstants.numberOfRoundsNameIsRequired,
              },
            ]}
            initialValue={customFormat.numberOfRounds}
          >
            <InputNumber
              min={1}
              disabled={disabled}
              onChange={value =>
                onChange({
                  ...customFormat,
                  numberOfRounds: value,
                })
              }
            />
          </Form.Item>
        </div>
        <div className={'col-sm'}>
          <InputWithHead heading={AppConstants.numberOfTeams} required="required-field" />
          <Form.Item
            name={[...prefix, 'numberOfTeams']}
            rules={[
              {
                required: true,
                message: ValidationConstants.SelectNumberTeam,
              },
            ]}
            initialValue={customFormat.numberOfTeams}
          >
            <InputNumber
              min={1}
              disabled={disabled}
              onChange={value =>
                onChange({
                  ...customFormat,
                  numberOfTeams: value,
                })
              }
            />
          </Form.Item>
        </div>
      </div>

      <div className={'row'}>
        {Array.from({ length: customFormat.numberOfRounds }).map((_, index) => (
          <div className={'col-sm'} key={index}>
            <InputWithHead heading={`Round ${index + 1} name`} required="required-field" />
            <Form.Item
              name={[...prefix, 'roundNames', index]}
              rules={[
                {
                  required: true,
                  message: ValidationConstants.nameisrequired,
                },
              ]}
              initialValue={customFormat.roundNames[index] ?? ''}
            >
              <Input
                disabled={disabled}
                onChange={event => {
                  customFormat.roundNames[index] = event.target.value;
                  onChange({
                    ...customFormat,
                    roundNames: customFormat.roundNames,
                  });
                }}
              />
            </Form.Item>
          </div>
        ))}
      </div>
      <div className={'row'}>
        <div className={'col-sm'}>
          <Form.Item
            name={[...prefix, 'allowDifferentGrades']}
            valuePropName={'checked'}
            initialValue={customFormat.allowDifferentGrades}
          >
            <Checkbox
              disabled={disabled}
              className="single-checkbox"
              onChange={e =>
                onChange({
                  ...customFormat,
                  allowDifferentGrades: e.target.checked,
                })
              }
            >
              {AppConstants.allowDifferentGrades}
            </Checkbox>
          </Form.Item>
        </div>
      </div>
      <div className={'row'}>
        {customFormat.allowDifferentGrades && (
          <div className={'col-sm-4'}>
            <InputWithHead heading={AppConstants.finalDivisionName} />
            <Form.Item
              name={[...prefix, 'finalDivisionName']}
              initialValue={customFormat.finalDivisionName ?? ''}
            >
              <Input
                disabled={disabled}
                onChange={event => {
                  onChange({
                    ...customFormat,
                    finalDivisionName: event.target.value,
                  });
                }}
              />
            </Form.Item>
          </div>
        )}
      </div>
    </div>
  );
}
