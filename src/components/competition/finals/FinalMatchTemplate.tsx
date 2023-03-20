import type { FormListFieldData } from 'antd/es/form/FormList';
import React, { useEffect, useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select } from 'antd';
import ValidationConstants from '../../../themes/validationConstant';
import InputWithHead from '../../../customComponents/InputWithHead';
import { FinalMatch } from './FinalCompetitionSettings';

const { Option } = Select;

export default function FinalMatchTemplate({
  field,
  index,
  disabled,
  roundNames,
  allowDifferentGrades,
  numberOfTeams,
  onRemove,
  divisionGradeSelections,
  previousMatches,
  match,
}: {
  field: FormListFieldData;
  index: number;
  allowDifferentGrades: boolean;
  roundNames: string[];
  numberOfTeams: number;
  onRemove: Function;
  match: FinalMatch;
  disabled: boolean;
  divisionGradeSelections: { id: string; label: string }[];
  previousMatches: { id: string; round: number; matchName: string }[];
}) {
  const [team1, setTeam1] = useState<string | number>();
  const [team2, setTeam2] = useState<string | number>();

  useEffect(() => {
    if (match) {
      setTeam1(match.team1);
      setTeam2(match.team2);
    }
  }, [match]);
  const gradeField = ({
    label,
    name,
    selectedTeam,
  }: {
    label: string;
    name: string;
    selectedTeam: string | number;
  }) => (
    <div style={{ flex: 1 }}>
      {typeof selectedTeam === 'number' && (
        <>
          <InputWithHead heading={label} required="required-field" />
          <Form.Item
            name={[field.name, name]}
            initialValue={''}
            rules={[
              {
                required: true,
                message: ValidationConstants.field,
              },
            ]}
          >
            <Select disabled={disabled}>
              {divisionGradeSelections.map(({ label, id }) => (
                <Option key={id} value={id}>
                  {label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}
    </div>
  );
  const rankField = ({
    label,
    name,
    onChange,
  }: {
    label: string;
    name: string;
    onChange: (value: any) => void;
  }) => (
    <div style={{ flex: 1 }}>
      <InputWithHead heading={label} required="required-field" />
      <Form.Item
        name={[field.name, name]}
        rules={[
          {
            required: true,
            message: ValidationConstants.field,
          },
        ]}
        initialValue={''}
      >
        <Select disabled={disabled} style={{ minWidth: '300px' }} onChange={onChange}>
        {previousMatches.map(match => (
            <Option key={'wmatch_' + match.id} value={`W${match.id}`}>
              Winner of {match.matchName} ({roundNames[match.round]})
            </Option>
          ))}
          {previousMatches.map(match => (
            <Option key={'lmatch_' + match.id} value={`L${match.id}`}>
              Loser of {match.matchName} ({roundNames[match.round]})
            </Option>
          ))}
          {Array.from({ length: numberOfTeams }).map((_, rank) => (
            <Option key={'rank_' + rank} value={rank + 1}>
              {rank + 1}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </div>
  );
  return (
    <>
      <div className={'d-flex align-items-center justify-space-between'}>
        <div>
          <InputWithHead heading={`Match ${index + 1} name`} required="required-field" />
          <Form.Item
            name={[field.name, 'matchName']}
            required={true}
            initialValue={''}
            rules={[
              {
                required: true,
                message: ValidationConstants.nameisrequired,
              },
            ]}
          >
            <Input disabled={disabled} />
          </Form.Item>
        </div>
        <Button
          shape={'circle'}
          disabled={disabled}
          onClick={() => onRemove()}
          icon={<CloseOutlined />}
        />
      </div>
      <div className={'d-flex align-items-center justify-space-between'}>
        {rankField({ label: 'Team 1 Rank', name: 'team1', onChange: setTeam1 })}
        <div className={'mx-5'} style={{ marginTop: '50px' }}>
          v
        </div>
        {rankField({ label: 'Team 2 Rank', name: 'team2', onChange: setTeam2 })}
      </div>
      {allowDifferentGrades && (
        <div className={'d-flex align-items-center justify-space-between'}>
          {gradeField({ label: 'Team 1 Grade', name: 'team1Grade', selectedTeam: team1 })}
          <div className={'mx-5'}></div>
          {gradeField({ label: 'Team 2 Grade', name: 'team2Grade', selectedTeam: team2 })}
        </div>
      )}
    </>
  );
}
