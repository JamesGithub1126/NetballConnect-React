import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout } from 'antd';
import {
  liveScoreActionLogReset,
  liveScoreGetMatchEventsAction,
} from 'store/actions/LiveScoreAction/liveScoreMatchLogAction';
import AppConstants from 'themes/appConstants';
import DashboardLayout from 'pages/dashboardLayout';
import LiveScoreEditActionLogView from '../LiveScoreEditActionLogView/liveScoreEditActionLogView';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import { liveScoreGetMatchDetailInitiate } from 'store/actions/LiveScoreAction/liveScoreMatchAction';
import history from 'util/history';
import { getLiveScoreCompetition } from 'util/sessionStorage';
import { Footer } from 'antd/lib/layout/layout';
import styles from '../actionLog.module.scss';
import { isBasketball, isFootball } from 'util/registrationHelper';

const { Content } = Layout;

const LiveScoreActionLog = ({ location }) => {
  const dispatch = useDispatch();
  const matchDetails = useSelector(state => state.LiveScoreMatchState?.matchDetails) || {};
  const { match = null } = matchDetails;

  useEffect(() => {
    liveScoreActionLogReset();
  }, []);

  useEffect(() => {
    const matchId = location?.state?.matchId;
    if (!matchId) {
      history.push('/matchDayMatches');
    } else {
      const comp = JSON.parse(getLiveScoreCompetition());
      const lineupOnByDefault = isBasketball || isFootball;
      dispatch(
        liveScoreGetMatchDetailInitiate(
          matchId,
          comp?.lineupSelectionEnabled || lineupOnByDefault ? 1 : 0,
        ),
      );
      dispatch(liveScoreGetMatchEventsAction({ matchId: matchId }));
    }
  }, [location?.state?.matchId]);

  return (
    <>
      <DashboardLayout menuHeading={AppConstants.liveScores} menuName={AppConstants.liveScores} />
      <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey={'2'} />
      <Layout>
        <Header match={match} />
        <Content>
          <div className="comp-dash-table-view mt-4">
            <LiveScoreEditActionLogView />
          </div>
        </Content>
        <Footer />
      </Layout>
    </>
  );
};

export default LiveScoreActionLog;

function Header({ match }) {
  if (!match) {
    return null;
  }
  return (
    <div className="comp-dash-table-view mt-4">
      <div className="form-heading">{AppConstants.editActionLog}</div>
      <div className="d-flex flex-column">
        <div className={`${styles.teamHeading} d-flex`}>
          <span>{match.team1.name}</span>
          <span className="ml-2 mr-2 app-color">{AppConstants.vs}</span>
          <span>{match.team2.name}</span>
        </div>
        <span className={styles.matchId}>{'#' + match.id}</span>
      </div>
    </div>
  );
}
