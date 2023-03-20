import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AutoComplete, Spin } from 'antd';
import { debounce } from "lodash";
import moment from 'moment';
import InputWithHead from '../../customComponents/InputWithHead';
import AppConstants from '../../themes/appConstants';
import { ROLE } from '../../util/enums';
import { EntityType } from '../../enums/enums';
import {
  liveScoreClearOfficeList,
  getliveScoreAvailableScorerList,
} from '../../store/actions/LiveScoreAction/liveScoreAction';
import {
  liveScoreUpdateMatchAction,
  liveScoreGetMatchTeamOfficials,
} from '../../store/actions/LiveScoreAction/liveScoreMatchAction';
import { isNotNullOrEmptyString } from '../../util/helpers';

const LiveScoreMatchTeamOfficials = ({ competitionId, matchId, team1, team2 }) => {
  const dispatch = useDispatch();
  const liveScoreSetting = useSelector(state => state.LiveScoreSetting);
  const { enableMatchOfficialRecording, matchOfficialRecordRoles } = liveScoreSetting;
  const { loadScorers, availableOfficialList } = useSelector(state => state.LiveScoreState);
  const { matchData, matchTeamOfficials } = useSelector(state => state.LiveScoreMatchState);

  useEffect(() => {
    matchId && dispatch(liveScoreGetMatchTeamOfficials(matchId));
  }, [matchId]);

  const handleSearch = (search, roleId, teamId) => {
    dispatch(liveScoreClearOfficeList(roleId, roleId === ROLE.COACH ? teamId : undefined));

    let entityId = competitionId;
    let entityTypeId = undefined;
    if (roleId === ROLE.COACH) {
      entityId = teamId;
      entityTypeId = EntityType.Team;
    }

    if (matchData.startTime && matchData.matchDuration) {
      const startTime = moment(matchData.startTime);
      const endTime = moment(startTime).add(matchData.matchDuration, 'minutes');
      if (isNotNullOrEmptyString(search) && search.trim() !== '') {
        const payload = {
          competitionId,
          matchStartTime: startTime,
          matchEndTime: moment(endTime).utc().format(),
          matchId: matchId,
          roleId,
          entityId,
          entityTypeId,
          search,
        };
        dispatch(getliveScoreAvailableScorerList(payload));
      }
    }
  };

  const debouncedSearch = debounce(handleSearch, 300);

  const handleOfficialSelectChange = (teamId, officialRole, userId) => {
    const payload = {
      competitionId,
      matchId,
      teamId,
      teamOfficialRoleId: Number(officialRole.databaseId),
      userId,
    };
    dispatch(liveScoreUpdateMatchAction(payload, 'matchTeamOfficial'));
  };

  const handleOfficialClear = (teamId, officialRole) => {
    handleOfficialSelectChange(teamId, officialRole, 'delete');
    handleSearch('', officialRole.lookupRoleId, teamId);
  };

  const handleOfficialUserNameChange = (teamId, officialRole, userName) => {
    const payload = {
      competitionId,
      matchId,
      teamId,
      teamOfficialRoleId: Number(officialRole.databaseId),
      userName,
    };
    dispatch(liveScoreUpdateMatchAction(payload, 'matchTeamOfficial'));
  };

  /**
   * Get avaliable official list with roleId and teamId.
   */
  const getAvaliableOfficialList = (roleId, teamId) => {
    const officials = availableOfficialList[roleId] || [];
    if (roleId === ROLE.COACH) {
      // We have to check entityId if role is coache.
      return officials.filter(i => i.entityId === teamId);
    }
    return officials;
  };

  const getAvaliableOfficialOptions = (lookupRoleId, teamId) => {
    const officialUsers = getAvaliableOfficialList(lookupRoleId, teamId);
    return officialUsers.map(item => ({
      label: item.nameWithNumber,
      value: item.id,
    }));
  };

  const getOfficialName = (teamId, officialRole) => {
    const official = matchTeamOfficials.find(
      x => x.teamId === teamId && x.teamOfficialRoleId === Number(officialRole.databaseId),
    );
    if (!official) {
      return undefined;
    }

    if (official.userName) {
      return official.userName;
    } else if (official.userId) {
      const officialUsers = getAvaliableOfficialList(officialRole.lookupRoleId, teamId);
      return officialUsers.find(x => x.id === official.userId)?.nameWithNumber;
    }

    return undefined;
  };

  const getOfficialRoleName = officialRole => {
    return officialRole.roleName ? officialRole.roleName : officialRole.role?.description;
  };

  const teamOfficialView = team => (
    <>
      <div>
        <strong>{team?.name}</strong>
      </div>
      {matchOfficialRecordRoles.map((officialRole, index) => (
        <div key={index}>
          {!!officialRole.lookupRoleId ? (
            <div>
              <InputWithHead heading={getOfficialRoleName(officialRole)} />
              <AutoComplete
                className="w-100"
                style={{ paddingRight: 1, minWidth: 182 }}
                notFoundContent={loadScorers ? <Spin size="small" /> : null}
                value={getOfficialName(team.id, officialRole)}
                onSelect={value => handleOfficialSelectChange(team.id, officialRole, value)}
                onSearch={search => debouncedSearch(search, officialRole.lookupRoleId, team.id)}
                options={getAvaliableOfficialOptions(officialRole.lookupRoleId, team.id)}
                allowClear={true}
                onClear={() => handleOfficialClear(team.id, officialRole)}
              ></AutoComplete>
            </div>
          ) : (
            <div>
              <InputWithHead
                heading={getOfficialRoleName(officialRole)}
                value={getOfficialName(team.id, officialRole)}
                placeholder={' '}
                onChange={e => handleOfficialUserNameChange(team.id, officialRole, e.target.value)}
              />
            </div>
          )}
        </div>
      ))}
    </>
  );

  return (
    <>
      {enableMatchOfficialRecording && (
        <>
          <div className="text-heading-large pt-5">
            <h2>{AppConstants.teamOfficials}</h2>
          </div>
          <div className="row">
            <div className="col-lg-6">{team1 && teamOfficialView(team1)}</div>
            <div className="col-lg-6">{team2 && teamOfficialView(team2)}</div>
          </div>
        </>
      )}
    </>
  );
};

export default LiveScoreMatchTeamOfficials;
