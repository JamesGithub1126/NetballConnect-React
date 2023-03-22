import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppConstants from 'themes/appConstants';
import MatchPlayerPointCard from './matchPlayerPointCard';
import { liveScoreCompBestPlayerPointUpdateAction } from '../../../store/actions/LiveScoreAction/liveScoreCompetitionAction';

const MatchPlayerPoints = ({
  matchId,
  typeRefId,
  title,
  viewMode,
  borrowedTeam1Players,
  borrowedTeam2Players,
}) => {
  const dispatch = useDispatch();

  const matchDetails = useSelector(state => state.LiveScoreMatchState.matchDetails);
  const team1Players = useSelector(state => state.LiveScoreMatchState.team1Players);
  const team2Players = useSelector(state => state.LiveScoreMatchState.team2Players);
  const bestPlayerPoints = useSelector(state => state.LiveScoreMatchState.bestPlayerPoints);
  const bestAndFairestSettings = useSelector(
    state => state.LiveScoreSetting.bestAndFairestSettings,
  );

  const handlerPlayerPoint = (player, points, pointIndex) => {
    const updated = [...bestPlayerPoints];
    const exists =
      viewMode === 1
        ? updated.find(
            it =>
              it.points === points &&
              it.pointIndex === pointIndex &&
              it.bestAndFairestTypeRefId === typeRefId,
          )
        : updated.find(
            it =>
              it.points === points &&
              it.pointIndex === pointIndex &&
              it.teamId === player.teamId &&
              it.bestAndFairestTypeRefId === typeRefId,
          );
    if (exists) {
      exists.playerId = player.playerId;
      if (viewMode === 1) {
        exists.teamId = player.teamId;
      }
    } else {
      updated.push({
        playerId: player.playerId,
        teamId: player.teamId,
        bestAndFairestTypeRefId: typeRefId,
        points,
        pointIndex,
      });
    }

    dispatch(liveScoreCompBestPlayerPointUpdateAction(updated));
  };

  const getBFMediaTypeSetting = () => {
    return bestAndFairestSettings.find(i => i.bestAndFairestTypeRefId === typeRefId);
  };

  const playerPointSettingView = (title, teamPlayers, offset = false) => {
    const bestAndFairest = getBFMediaTypeSetting();
    const cardStyle = offset
      ? 'col-6 offset-6 col-md-6 offset-md-6 col-sm-12 align-content-center'
      : 'col-6 col-md-6 col-sm-12 align-content-center';

    return (
      <div className={cardStyle}>
        <div className="col-12">
          <MatchPlayerPointCard
            title={title}
            players={teamPlayers}
            playerPoints={bestPlayerPoints?.filter(
              point => point.bestAndFairestTypeRefId === typeRefId,
            )}
            bestAndFairest={bestAndFairest}
            handlerPlayerPoint={handlerPlayerPoint}
          ></MatchPlayerPointCard>
        </div>
      </div>
    );
  };

  const getCardView = () => {
    const match = matchDetails ? matchDetails.match : null;
    const team1PlayersData = team1Players
      .concat(borrowedTeam1Players)
      .filter(p => p.playerId !== 0)
      .map(p => {
        return { ...p, teamId: match?.team1Id };
      });
    const team2PlayersData = team2Players
      .concat(borrowedTeam2Players)
      .filter(p => p.playerId !== 0)
      .map(p => {
        return { ...p, teamId: match?.team2Id };
      });

    if (viewMode === 1) {
      return playerPointSettingView(
        AppConstants.allPlayersFromMatch,
        team1PlayersData.concat(team2PlayersData),
      );
    }
    if (viewMode === 2) {
      return (
        <>
          {playerPointSettingView(AppConstants.homeTeamPlayers, team1PlayersData)}
          {playerPointSettingView(AppConstants.awayTeamPlayers, team2PlayersData)}
        </>
      );
    }
    if (viewMode === 11) {
      return playerPointSettingView(AppConstants.homeTeamPlayers, team1PlayersData);
    }
    if (viewMode === 12) {
      return playerPointSettingView(AppConstants.awayTeamPlayers, team2PlayersData, true);
    }

    return <></>;
  };

  const renderView = () => {
    const settings = getBFMediaTypeSetting();
    if (!settings || !settings.enabled) {
      return <></>;
    }

    return (
      <>
        {viewMode !== 0 && (
          <div className="row ml-4 mr-0">
            <div className="col-12">
              <span className="home-dash-left-text">{title}</span>
            </div>
          </div>
        )}
        <div className="row ml-0 mr-0 mb-5">{getCardView()}</div>
      </>
    );
  };

  return renderView();
};

export default MatchPlayerPoints;
