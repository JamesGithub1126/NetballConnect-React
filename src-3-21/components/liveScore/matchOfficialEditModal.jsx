import React, { useEffect, useState } from "react";
import AppConstants from "../../themes/appConstants";
import { Button, message, Modal } from "antd";
import { getUmpireAllocationSettings } from "../../store/actions/umpireAction/umpireSettingAction";
import { useDispatch, useSelector } from "react-redux";
import {
  clearMatchAction,
  liveScoreAddEditMatchAction,
  liveScoreClubListAction,
  liveScoreGetMatchDetailInitiate,
  liveScoreUpdateMatchAction,
  otherOfficialListAction
} from "../../store/actions/LiveScoreAction/liveScoreMatchAction";
import { getLiveScoreSettingInitiate } from "../../store/actions/LiveScoreAction/LiveScoreSettingAction";
import { MatchOfficialEdit } from "./matchOfficialEdit";
import * as _ from "lodash";
import { RECORDUMPIRETYPE } from "../../util/enums";
import { getRoleFromSequence } from "../../store/reducer/liveScoreReducer/helpers/matchUmpires/umpireHelpers";
import { getCompetitionData } from "../../util/sessionStorage";
import { newUmpireListAction, umpireListAction } from "../../store/actions/umpireAction/umpireAction";
import moment from "moment/moment";
import LiveScoreAxiosApi from "../../store/http/liveScoreHttp/liveScoreAxiosApi";
import { RegistrationUserRoles } from "../../enums/registrationEnums";

export const MatchOfficialEditModal = ({ matchId, competitionId, isCompParent, onClose }) => {
  const umpireSettingState = useSelector(state => state.UmpireSettingState.allocationSettingsData);
  const liveScoreSettingState = useSelector(state => state.LiveScoreSetting.competitionSettings);
  const liveScoreMatchState = useSelector(state => state.LiveScoreMatchState);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearMatchAction());
    if (competitionId) {
      dispatch(getUmpireAllocationSettings(competitionId));
      dispatch(getLiveScoreSettingInitiate(competitionId));
      dispatch(liveScoreClubListAction(competitionId));
    }
    if (matchId)
      dispatch(liveScoreGetMatchDetailInitiate(matchId, 0));
      dispatch(liveScoreAddEditMatchAction(matchId));
      dispatch(liveScoreUpdateMatchAction('', 'clearData'));
  }, [competitionId, matchId]);

  useEffect(() => {
    if (liveScoreSettingState && !liveScoreSettingState.AnyoneCanBeUmpire && liveScoreMatchState.matchData.id) {
      const { competitionOrganisation } = getCompetitionData();
      const compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
      const matchData = liveScoreMatchState.matchData;
      const startTime = moment(matchData.startTime);
      const endTime = moment(startTime).add(matchData.matchDuration, 'minutes');

      if (liveScoreSettingState.sourceId) {
        dispatch(otherOfficialListAction(liveScoreSettingState.sourceId));
      }

      dispatch(umpireListAction({
        refRoleId: JSON.stringify([15, 20]),
        entityTypes: isCompParent ? 1 : 6,
        compId: competitionId,
        compOrgId: compOrgId,
        matchId: matchId,
        onlyUniqueUsers: true,
      }));
      dispatch(newUmpireListAction({
        entityTypes: isCompParent ? 1 : 6,
        compId: competitionId,
        compOrgId: compOrgId,
        isCompParent: isCompParent,
        matchStartTime: matchData.startTime,
        matchEndTime: moment(endTime).utc().format(),
        matchId,
        onlyUniqueUsers: true,
      }));
    }
  }, [liveScoreSettingState, liveScoreMatchState.matchData.id, competitionId]);

  const buildUmpireData = () => {
    const {
      umpireSelectionDict,
    } = liveScoreMatchState;
    const { recordUmpireType } = liveScoreSettingState;

    const umpireData = [];
    let umpireObj;

    if (recordUmpireType === RECORDUMPIRETYPE.Names) {
      for (let key in umpireSelectionDict) {
        if (!umpireSelectionDict[key]) {
          continue;
        }
        umpireObj = {
          ...umpireSelectionDict[key],
          matchId,
          roleId: getRoleFromSequence(Number(key)),
          umpireType: recordUmpireType,
          sequence: Number(key),
        };
        umpireData.push(umpireObj);
      }
      //putting both scorer and umpire in umpireData
    } else if (recordUmpireType === RECORDUMPIRETYPE.Users) {
      for (let key in umpireSelectionDict) {
        if (!umpireSelectionDict[key]) {
          continue;
        }
        umpireObj = {
          ...umpireSelectionDict[key],
          matchId,
          roleId: getRoleFromSequence(Number(key)),
          umpireType: recordUmpireType,
          sequence: Number(key),
        };
        umpireData.push(umpireObj);
      }
    }

    //handle missing data
    for (let umpire of umpireData) {
      if (!umpire.competitionOrganisationId) {
        message.error(AppConstants.umpireOrgMissingWarning);
        return null;
      }
      if (!umpire.umpireName || _.trim(umpire.umpireName) === '') {
        message.error(AppConstants.umpireNameMissingWarning);
        return null;
      }
    }

    return umpireData;
  }

  const buildOfficialData = () => {
    const {
      officialSelectionDict,
    } = liveScoreMatchState;

    const { competitionOrganisationId } = getCompetitionData() ?? {};
    return Object.entries(officialSelectionDict).map(([key, user]) => {
      if (!user) {
        return null;
      }
      return {
        userId: user.id,
        name: [user.firstName, user.lastName].filter(Boolean).join(' '),
        matchId,
        competitionOrganisationId,
        sequence: Number(key),
        roleId: RegistrationUserRoles.OtherOfficial,
      }
    }).filter(Boolean);
  }
  const saveOfficialRosters = async () => {
    const umpireData = buildUmpireData();
    if (!umpireData) {
      return;
    }

    const officialData = buildOfficialData();

    const recordUmpireType = liveScoreSettingState.recordUmpireType;
    const payload = {
      matchId,
      competitionId,
      ...(recordUmpireType === 'NAMES' ? {
        matchUmpires: umpireData,
      } : {
        rosters: umpireData,
      }),
      officials: officialData,
    }
    await LiveScoreAxiosApi.updateUmpireRosters(payload);
    onClose(true);
    await message.success(AppConstants.umpireEditedMessage);
  }

  return (
    <Modal
      title={AppConstants.editOfficials}
      className="edit-modal"
      visible={true}
      onCancel={() => onClose()}
      footer={[
        <Button onClick={() => onClose()}>
          {AppConstants.cancel}
        </Button>,
        <Button type="primary" disabled={!saveEnabled} onClick={async () => {
          await saveOfficialRosters();
        }}>
          {AppConstants.save}
        </Button>,
      ]}
    >
      <MatchOfficialEdit
        matchId={matchId}
        onOfficialChanged={() => {
          if (!saveEnabled) setSaveEnabled(true);
        }}
        competitionId={competitionId}
        isCompParent={isCompParent}
        settings={{
          matchSettings: liveScoreMatchState,
          umpireAllocationSettings: umpireSettingState,
          competitionSettings: liveScoreSettingState,
        }}
      />
    </Modal>
  );
}
