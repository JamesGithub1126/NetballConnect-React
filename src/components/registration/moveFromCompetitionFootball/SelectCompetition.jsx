import React, { useMemo } from 'react';
import SelectCompetition from '../replicatePlayer/SelectCompetition';

const SelectCompetitionWrapper = React.memo(({ competitions, ...props }) => {
  const competitionList = useMemo(
    () =>
      competitions.map(c => ({
        uniqueKey: c.compUniqueKey,
        name: c.competitionName,
        organisationName: c.organiserName,
      })),
    [competitions],
  );

  return <SelectCompetition competitions={competitionList} {...props} />;
});

export default SelectCompetitionWrapper;
