import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, message, Popover, Tabs } from 'antd';
import AppConstants from 'themes/appConstants';
import LiveScorePeriodLog from '../LivescorePeriodLog/liveScorePeriodLog';
import LiveScoreExtraTimeLog from '../liveScoreExtraTimeLog/liveScoreExtraTimeLog';
import {
  liveScoreActionLogSetFields,
  liveScoreActionLogSetTeamListing,
  liveScoreClearEventLogData,
  liveScoreGetMatchEventsAction,
  liveScoreSaveNewMatchEventAction,
} from 'store/actions/LiveScoreAction/liveScoreMatchLogAction';
import Loader from 'customComponents/loader';
import RegenerateLadderPointsModal from 'customComponents/RegenerateLadderPointsModal';
import { ConfirmModal } from 'customComponents/confirmModal';
import { liveScoreGetMatchDetailInitiate } from 'store/actions/LiveScoreAction/liveScoreMatchAction';
import { useForm } from 'antd/lib/form/Form';
import { createUpdateEvents, getEventTypeOptions, getFormNames } from '../../api';
import { isBasketball, isFootball } from 'util/registrationHelper';
import ValidationConstants from 'themes/validationConstant';
import { numberOfPeriods } from 'components/liveScore/livescoreUtils';
import styles from '../actionLog.module.scss';

const { TabPane } = Tabs;

const LiveScoreEditActionLogView = React.memo(() => {
  const dispatch = useDispatch();
  const { matchDetails } = useSelector(state => state.LiveScoreMatchState);
  const [tabKey, setTabKey] = useState('1');
  const [form] = useForm();
  const {
    matchEvents,
    periodStartTimes,
    onSaveMatchEvents: saving,
    lastUpdated,
    deletedMatchEvents,
    eventsHaveBeenUpdated,
    onLoadMatchEvents,
    updatedNamePaths,
  } = useSelector(state => state.LiveScoreMatchLogState);

  const gameStatList = useSelector(state => state.liveScoreGamePositionState?.gameStatList) || [];
  const [showRegenLadderPointsModal, setShowRegenLadderPointsModal] = useState(false);
  const [showSaveAsFinalConfirmModal, setShowSaveAsFinalConfirmModal] = useState(false);
  const [canRegenLadderPoints, setCanRegenLadderPoints] = useState(true);

  const liveScoreCompetition = JSON.parse(localStorage.getItem('LiveScoreCompetition'));
  const isPremierCompetition =
    liveScoreCompetition.scoringType === 'PREMIER_NETBALL' ? true : false;
  const postitionTracking =
    liveScoreCompetition.positionTracking === 1 || liveScoreCompetition.positionTracking === true
      ? true
      : false;
  const pointScheme = liveScoreCompetition.pointScheme ?? [];

  const match = matchDetails?.match;
  const matchId = match?.id ?? null;
  const matchPeriods = [...Array(numberOfPeriods(match?.type)).keys()].map(k => Number(k) + 1);
  const initRef = useRef(false); //used to load match events on initial load only
  useEffect(() => {
    if (!lastUpdated) {
      return;
    }
    const lineupOnByDefault = isBasketball || isFootball;
    dispatch(
      liveScoreGetMatchDetailInitiate(
        match.id,
        liveScoreCompetition?.lineupSelectionEnabled || lineupOnByDefault ? 1 : 0,
      ),
    );
    dispatch(liveScoreGetMatchEventsAction({ matchId }));
  }, [lastUpdated]);

  useEffect(() => {
    if (!matchId || initRef.current) {
      return;
    }
    initRef.current = true;
    dispatch(liveScoreClearEventLogData());
    dispatch(liveScoreGetMatchEventsAction({ matchId }));
  }, [initRef.current]);

  useEffect(() => {
    const teamListing = match
      ? [
          { teamId: match.team1?.id, teamName: match.team1?.name },
          { teamId: match.team2?.id, teamName: match.team2?.name },
        ]
      : [];

    dispatch(
      liveScoreActionLogSetFields({
        isPremierCompetition,
        postitionTracking,
        pointScheme,
      }),
    );
    dispatch(liveScoreActionLogSetTeamListing(teamListing));
  }, [match]);

  useEffect(() => {
    const showPointTypes = isPremierCompetition || isBasketball;
    const eventTypeOptions = getEventTypeOptions(showPointTypes, gameStatList);
    const showSubEvents = isPremierCompetition || isFootball || isBasketball;
    const showPositions = !!postitionTracking;

    const formNames = getFormNames(showSubEvents, showPositions);

    dispatch(liveScoreActionLogSetFields({ eventTypeOptions, formNames }));
  }, [isPremierCompetition, isBasketball, gameStatList]);

  useEffect(() => {
    if (!form) {
      return;
    }
    const setAndValidateFormField = (namePath, value) => {
      let fieldValue = form.getFieldValue(namePath) || {};
      form.setFieldsValue({ [namePath[0]]: { ...fieldValue, [namePath[1]]: value } });
      form.validateFields([namePath]);
    };
    dispatch(liveScoreActionLogSetFields({ form, setAndValidateFormField }));
  }, [form]);

  const formattedMatchEvents = useMemo(() => {
    if (!match) {
      return;
    }
    return matchEvents
      ?.filter(event => event.type !== null)
      .map(event => ({
        ...event,
        id: event.id > 0 ? event.id : null,
        matchId: match.id,
        player: null,
      }));
  }, [match, matchEvents]);

  const handleValidateAndSave = async saveAsFinal => {
    try {
      await form.validateFields(updatedNamePaths);
      handleSave(saveAsFinal ? 1 : 0);
    } catch (e) {
      if (!!e.errorFields) {
        message.error(ValidationConstants.editActionLog.missingFields, 5);
      } else {
        message.error(ValidationConstants.somethingWentWrong);
      }
      handleSave(-1);
    }
  };

  const handleSave = (step, options = {}) => {
    switch (step) {
      case 0: {
        save(false);
        return;
      }
      case 1: {
        if (match && match.excludeFromLadder) {
          setShowRegenLadderPointsModal(true);
        } else {
          setCanRegenLadderPoints(true);
          handleSave(2, { canRegenLadderPoints: true });
        }
        return;
      }
      case 2: {
        setCanRegenLadderPoints(!!options.canRegenLadderPoints);
        setShowRegenLadderPointsModal(false);
        setShowSaveAsFinalConfirmModal(true);
        return;
      }
      case 3: {
        save(true);
        return;
      }
      case -1: {
        setShowRegenLadderPointsModal(false);
        setShowSaveAsFinalConfirmModal(false);
        setCanRegenLadderPoints(false);
        return;
      }
      default: {
        //do nothing...for now
        return;
      }
    }
  };

  const save = useCallback(
    saveAsFinal => {
      const insertEvents = formattedMatchEvents.filter(e => !e.id && e !== null);
      const filteredMatchEvents = matchEvents.filter(e => e.id >= 0);
      const tempMatchEvents = new Set([
        ...filteredMatchEvents,
        ...deletedMatchEvents,
        ...insertEvents,
      ]); //add the deleted match events and check.

      const sortedMatchEventsByTime = [...tempMatchEvents].sort((e1, e2) =>
        e1.eventTimestamp > e2.eventTimestamp ? 1 : e1.eventTimestamp < e2.eventTimestamp ? -1 : 0,
      );
      const { teamOneScore, teamTwoScore, updateEvents } = createUpdateEvents(
        match,
        sortedMatchEventsByTime,
        gameStatList,
        eventsHaveBeenUpdated,
      );
      let payload = {
        matchId: match.id,
        matchEvents: updateEvents,
        team1Score: teamOneScore,
        team2Score: teamTwoScore,
        saveAsFinal,
        canRegenLadderPoints: canRegenLadderPoints,
        create: false,
      };
      dispatch(liveScoreSaveNewMatchEventAction(payload));
      handleSave(-1);
    },
    [dispatch, matchEvents, formattedMatchEvents, canRegenLadderPoints],
  );

  return (
    <div className="mb-5">
      <Loader visible={saving || onLoadMatchEvents || !match?.id} />
      <RegenerateLadderPointsModal
        visible={showRegenLadderPointsModal}
        onOk={() => handleSave(2, { canRegenLadderPoints: true })}
        onCancel={() => handleSave(2, { canRegenLadderPoints: false })}
        matches={[match]}
      />
      <ConfirmModal
        visible={showSaveAsFinalConfirmModal}
        title={AppConstants.confirmSave}
        confirmText={AppConstants.confirm}
        content={AppConstants.saveAsFinalActionLogConfirmContent}
        onOk={() => handleSave(3)}
        onCancel={() => handleSave(-1)}
        okText={AppConstants.ok}
      />
      <>
        <Tabs activeKey={tabKey} style={{ width: '100%' }} onChange={key => setTabKey(key)}>
          {matchPeriods.map(period => {
            const periodStartTime = periodStartTimes.find(
              i => i.period === period && i.type === 'periodStart',
            );
            return (
              <TabPane tab={`${AppConstants.editLogPeriod} ${period}`} key={period}>
                <LiveScorePeriodLog
                  title={AppConstants.editLogPeriod + ' ' + period}
                  form={form}
                  period={period}
                  startTime={periodStartTime?.eventTimestamp}
                />
              </TabPane>
            );
          })}
          <TabPane
            tab={AppConstants.editLogExtraTime}
            key="extra"
            disabled={!match?.isExtraTimeEnabled}
          >
            <LiveScoreExtraTimeLog form={form} match={match} periodStartTimes={periodStartTimes} />
          </TabPane>
        </Tabs>
      </>
      <div className="d-flex mt-5 justify-content-end">
        <>
          <Popover
            placement={'top'}
            content={<div className={`${styles.popover}`}>{AppConstants.saveActionLogPopover}</div>}
          >
            <Button
              disabled={!eventsHaveBeenUpdated}
              onClick={() => handleValidateAndSave(false)}
              className="primary-add-comp-form mr-4"
              type="primary"
            >
              {AppConstants.save}
            </Button>
          </Popover>
        </>
        <>
          <Popover
            placement={'topRight'}
            content={
              <div className={`${styles.popover}`}>{AppConstants.saveAsFinalActionLogPopover}</div>
            }
          >
            <Button
              onClick={() => handleValidateAndSave(true)}
              className="primary-add-comp-form"
              type="primary"
            >
              {AppConstants.saveAsFinal}
            </Button>
          </Popover>
        </>
      </div>
    </div>
  );
});

export default LiveScoreEditActionLogView;
