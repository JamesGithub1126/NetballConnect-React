import { FormInstance } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import CompetitionAxiosApi from '../../../store/http/competitionHttp/competitionAxiosApi';
import FinalCompetitionSettings, { FinalFixtureTemplate } from './FinalCompetitionSettings';
import FinalRoundTemplate from './FinalRoundTemplate';

const { flatten } = require('lodash');

export default function CustomFinalFixtureTemplate({
  customTemplate,
  index,
  yearRefId,
  competitionId,
  disabled,
  form,
  divisions,
}: {
  customTemplate: FinalFixtureTemplate;
  index: number;
  form?: FormInstance;
  disabled: boolean;
  yearRefId: number;
  competitionId: string;
  divisions: any[];
}) {
  const prefix = ['customFinalTemplates', index];
  const [draft, setDraft] = useState<FinalFixtureTemplate>({
    numberOfRounds: 1,
    numberOfTeams: 1,
    roundNames: [],
    rounds: [],
    allowDifferentGrades: false,
    ...customTemplate,
  });
  const [divisionData, setDivisionData] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [allMatches, setAllMatches] = useState([]);

  useEffect(() => {
    if (customTemplate && form) {
      setDraft(customTemplate);
      form.setFields([
        {
          name: prefix,
          value: customTemplate,
        },
      ]);
      setCurrentRound(customTemplate.rounds.length - 1);
      setAllMatches(
        flatten(
          customTemplate.rounds.map((round, roundIndex) => round.matches.map((match) => ({ round: roundIndex, ...match }))),
        ),
      );
    }
  }, [customTemplate, form]);

  useEffect(() => {
    if (yearRefId && competitionId) {
      (async () => {
        const {
          result: { data },
        } = await CompetitionAxiosApi.getTeamGradingSummary(yearRefId, competitionId);
        setDivisionData(data);
      })();
    }
  }, [yearRefId, competitionId]);

  const divisionGradeSelections = useMemo(
    () => flatten(
      divisionData
        .filter(
          ({ divisionName }) => divisions == null
              || divisions.some((division) => division.divisionName === divisionName),
        )
        .map(({ grades, divisionName }) => grades.map((grade) => ({
          label: `${divisionName} ${grade.gradeName}`,
          id: grade.competitionDivisionGradeId,
        }))),
    ),
    [divisionData],
  );

  return (
    <div>
      <FinalCompetitionSettings
        prefix={prefix}
        customFormat={draft}
        onChange={setDraft}
        disabled={disabled}
      />
      <div className="d-flex mt-10 overflow-x-auto">
        {Array.from({ length: draft.numberOfRounds }).map((_, roundIndex) => (
          <FinalRoundTemplate
            key={roundIndex}
            roundNames={draft.roundNames}
            active={currentRound >= roundIndex}
            disabled={currentRound !== roundIndex || disabled}
            form={form}
            customFormat={draft}
            divisionGradeSelections={divisionGradeSelections}
            allMatches={allMatches}
            index={roundIndex}
            prefix={[...prefix, 'rounds', roundIndex]}
            allowNext={currentRound < draft.numberOfRounds - 1 && currentRound === roundIndex}
            allowCancel={currentRound > 0 && currentRound === roundIndex}
            onNext={() => {
              setCurrentRound(currentRound + 1);
              const { matches = [] } = form.getFieldValue([...prefix, 'rounds', currentRound]);
              setAllMatches([
                ...allMatches.filter((match) => match.round <= currentRound - 1),
                ...matches.map((match, matchIndex) => ({
                  ...match,
                  id: `${currentRound + 1}-${matchIndex + 1}`,
                  round: currentRound,
                })),
              ]);
            }}
            onCancel={() => {
              setCurrentRound(currentRound - 1);
              setAllMatches(allMatches.filter((match) => match.round <= currentRound - 1));
            }}
          />
        ))}
      </div>
    </div>
  );
}
