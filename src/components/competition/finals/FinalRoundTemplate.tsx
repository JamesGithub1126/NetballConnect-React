import InputWithHead from '../../../customComponents/InputWithHead';
import { Button, Divider, Form, FormInstance, Space } from 'antd';
import React, { Fragment, useEffect, useMemo } from 'react';
import FinalMatchTemplate from './FinalMatchTemplate';
import AppConstants from '../../../themes/appConstants';
import { FinalFixtureTemplate } from './FinalCompetitionSettings';

export default function FinalRoundTemplate({
  divisionGradeSelections,
  index: roundIndex,
  customFormat,
  prefix,
  active,
  disabled,
  form,
  allowNext,
  roundNames,
  allowCancel,
  onNext,
  allMatches,
  onCancel,
}: {
  allowNext: boolean;
  allowCancel?: boolean;
  customFormat: FinalFixtureTemplate;
  allMatches: { id: string; matchName: string; round: number }[];
  divisionGradeSelections: { id: string; label: string }[];
  index: number;
  active: boolean;
  disabled: boolean;
  prefix: (string | number)[];
  roundNames: string[];
  form?: FormInstance;
  onNext: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!active) {
      form?.setFields([
        {
          name: [...prefix, 'matches'],
          value: [],
        },
      ]);
    }
  }, [active, form]);
  const previousMatches = useMemo(
    () => allMatches.filter(match => match.round < roundIndex),
    [allMatches, roundIndex],
  );
  const { matches = [] } = customFormat.rounds[roundIndex] ?? {};
  const contentView = () => (
    <Form.List
      name={[...prefix, 'matches']}
      rules={[
        {
          validator: async (_, names) => {
            if (!names || names.length < 1) {
              return Promise.reject(new Error('At least 1 match is required'));
            }
            return Promise.resolve();
          },
        },
      ]}
    >
      {(fields, { add, remove }, { errors }) => (
        <div
          style={{
            overflowY: 'auto',
            maxHeight: 500,
            paddingRight: 30,
            borderRight: '1px dashed rgba(27, 27, 52, 0.07)',
          }}
        >
          {fields.map((field, matchIndex) => (
            <Fragment key={field.key}>
              {matchIndex !== 0 && <Divider />}
              <FinalMatchTemplate
                disabled={disabled}
                roundNames={roundNames}
                index={matchIndex}
                match={matches[matchIndex]}
                previousMatches={previousMatches}
                field={field}
                onRemove={() => {
                  remove(field.name);
                }}
                divisionGradeSelections={divisionGradeSelections}
                allowDifferentGrades={customFormat.allowDifferentGrades}
                numberOfTeams={customFormat.numberOfTeams}
              />
            </Fragment>
          ))}
          <Form.ErrorList errors={errors} />
          {active && (
            <>
              <Button
                disabled={disabled}
                type="text"
                className="orange-action-txt"
                style={{ marginTop: '10px' }}
                onClick={() => add()}
              >
                + {AppConstants.addMatch}
              </Button>
              <div className={'mt-10'}>
                {/* @ts-ignore */}
                <Space direction={'horizontal'} size={10}>
                  {allowCancel && (
                    <Button htmlType="submit" type="primary" onClick={onCancel} disabled={disabled}>
                      {AppConstants.cancel}
                    </Button>
                  )}
                  {allowNext && (
                    <Button
                      disabled={!!errors.length}
                      onClick={() => {

                        form
                          // @ts-ignore
                          .validateFields([...prefix, 'matches'], { recursive: true })
                          .then(onNext)
                          .catch(console.error);
                      }}
                      type={'primary'}
                    >
                      {AppConstants.next}
                    </Button>
                  )}
                </Space>
              </div>
            </>
          )}
        </div>
      )}
    </Form.List>
  );
  return (
    <div
      style={{
        marginRight: 30,
        flex: '1 0 450px',
      }}
    >
      <InputWithHead
        heading={customFormat.roundNames[roundIndex] || `Round ${roundIndex + 1}`}
        inputHeadingStyles={{ fontSize: 18 }}
      />
      {contentView()}
    </div>
  );
}
