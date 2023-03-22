import React, { useMemo } from 'react';
import { Radio, Space, InputNumber, Checkbox } from 'antd';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import AppConstants from 'themes/appConstants';
import { BFSettingType } from '../../../../util/enums';
import { getLiveScoreCompetition } from '../../../../util/sessionStorage';
import { checkLivScoreCompIsParent } from 'util/permissions';

const isBFAppEnable = process.env.REACT_APP_ENABLE_BF_APP === 'true';

const BestAndFairestPointSetting = ({ typeRefId, settingIsIntegrated, onFormChange }) => {
  const { otherSelected, bestAndFairestSettings, references } = useSelector(
    state => state.LiveScoreSetting,
  );

  const settings = useMemo(() => {
    const compStr = getLiveScoreCompetition();
    const competition = compStr ? JSON.parse(getLiveScoreCompetition()) : null;
    let competitionOrganisationId = competition?.competitionOrganisation?.id;
    if (!competitionOrganisationId) {
      competitionOrganisationId = 0;
    }

    if (typeRefId === BFSettingType.ORGANISATION_AWARD) {
      const item = bestAndFairestSettings.find(
        i =>
          i.bestAndFairestTypeRefId === typeRefId &&
          i.competitionOrganisationId === competitionOrganisationId,
      );
      if (item) {
        return item;
      }
    } else {
      const item = bestAndFairestSettings.find(i => i.bestAndFairestTypeRefId === typeRefId);
      if (item) {
        return item;
      }
    }

    if (typeRefId === BFSettingType.ORGANISATION_AWARD) {
      return {
        id: undefined,
        competitionId: undefined,
        enabled: false,
        preferenceSetByRefId: 2,
        awardWhichTeamRefId: 2,
        receivingBFPointsRefId: 1,
        receivePointPlayers: 1,
        receivePoints: [],
        competitionOrganisationId: competitionOrganisationId,
        enableMatchDayApp: false,
        awardWhichRoleRefId: 1,
      };
    }
    return {
      id: undefined,
      competitionId: undefined,
      enabled: false,
      preferenceSetByRefId: 1,
      awardWhichTeamRefId: 1,
      receivingBFPointsRefId: 2,
      receivePointPlayers: 1,
      receivePoints: [],
      enableMatchDayApp: false,
      awardWhichRoleRefId: 1,
    };
  }, [bestAndFairestSettings, typeRefId]);

  useEffect(() => {
    if (otherSelected === 5 && settings.preferenceSetByRefId !== 1) {
      setPreferenceSetByRefId(1);
    }
  }, [otherSelected, settings]);

  const counter = size => {
    return new Array(size).fill(0);
  };

  const updateFormValues = payload => {
    onFormChange({
      ...payload,
      bestAndFairestTypeRefId: typeRefId,
    });
  };

  const setEnabled = enabled => {
    updateFormValues({
      ...settings,
      enabled,
    });
  };

  const setPreferenceSetByRefId = value => {
    updateFormValues({
      ...settings,
      preferenceSetByRefId: value,
    });
  };

  const setAwardWhichTeamRefId = value => {
    const updated = {
      ...settings,
      awardWhichTeamRefId: value,
    };
    if (getPreferenceSetByName() === 'affiliate_to_set') {
      if (getAwardWhichTeamName(value) === 'own') {
        updated.receivingBFPointsRefId = 1;
        updated.awardWhichRoleRefId = 1;
      } else if (getAwardWhichTeamName(value) === 'both') {
        updated.awardWhichRoleRefId = 3;
      }
    }
    updateFormValues(updated);
  };

  const setReceivingBFPointsRefId = value => {
    updateFormValues({
      ...settings,
      receivingBFPointsRefId: value,
    });
  };

  const onChangeReceivePointPlayers = value => {
    const updated = {
      ...settings,
      receivePointPlayers: value,
    };
    while (updated.receivePoints.length < value) {
      updated.receivePoints.push(0);
    }
    updateFormValues(updated);
  };

  const onChangeReceivePoints = (index, value) => {
    const updated = { ...settings };
    updated.receivePoints[index] = value;
    updateFormValues(updated);
  };

  const getPreferenceSetByName = () => {
    const refId = settings.preferenceSetByRefId;
    return references?.PreferenceSetBy?.find(it => it.id === refId)?.name;
  };

  const getAwardWhichTeamName = id => {
    const refId = id !== null && id !== undefined ? id : settings.awardWhichTeamRefId;
    return references.AwardWhichTeam?.find(it => it.id === refId)?.name;
  };

  const getReceivingBFPointsName = () => {
    const refId = settings.receivingBFPointsRefId;
    return references.ReceivingBFPoints?.find(it => it.id === refId)?.name;
  };

  const setEnabledMatchDayApp = enableMatchDayApp => {
    updateFormValues({
      ...settings,
      enableMatchDayApp,
    });
  };

  const setAwardWhichRoleRefId = value => {
    updateFormValues({
      ...settings,
      awardWhichRoleRefId: value,
    });
  };

  const viewForMatchDayApp = () => {
    return (
      <div>
        <div>
          <Checkbox
            className="single-checkbox"
            onChange={e => setEnabledMatchDayApp(e.target.checked)}
            checked={settings.enableMatchDayApp}
          >
            {AppConstants.enableResultsForMatchDayApp}
          </Checkbox>
        </div>
        <div className="mt-4">
          <div>
            <div className="mb-2">{AppConstants.whichRoleCanEnterTheAwards}</div>
            {typeRefId === BFSettingType.MEDIA_REPORT && getReceivingBFPointsName() === 'match' ? (
              <Radio.Group
                value={settings.awardWhichRoleRefId}
                onChange={e => setAwardWhichRoleRefId(e.target.value)}
              >
                {getPreferenceSetByName() === 'affiliate_to_set' &&
                getAwardWhichTeamName() === 'both' ? (
                  <Space direction="vertical" size={0} style={{ paddingLeft: 20 }}>
                    <Radio value={1}>{AppConstants.managerAwardForOwnTeam}</Radio>
                    <Radio value={2}>{AppConstants.managerAwardForOppositionTeam}</Radio>
                    <Radio value={3}>{AppConstants.scorerToAward}</Radio>
                    {settingIsIntegrated && <Radio value={4}>{AppConstants.umpireToAward}</Radio>}
                  </Space>
                ) : (
                  <Space direction="vertical" size={0} style={{ paddingLeft: 20 }}>
                    <Radio value={3}>{AppConstants.scorerToAward}</Radio>
                    {settingIsIntegrated && <Radio value={4}>{AppConstants.umpireToAward}</Radio>}
                  </Space>
                )}
              </Radio.Group>
            ) : (
              <Radio.Group
                value={settings.awardWhichRoleRefId}
                onChange={e => setAwardWhichRoleRefId(e.target.value)}
              >
                {(getPreferenceSetByName() === 'affiliate_to_set' &&
                  getAwardWhichTeamName() === 'own') ||
                typeRefId === BFSettingType.ORGANISATION_AWARD ? (
                  <Radio value={1}>{AppConstants.managerAwardForOwnTeam}</Radio>
                ) : getPreferenceSetByName() === 'affiliate_to_set' &&
                  getAwardWhichTeamName() === 'both' ? (
                  <Space direction="vertical" size={0} style={{ paddingLeft: 20 }}>
                    <Radio value={3}>{AppConstants.scorerToAward}</Radio>
                    {settingIsIntegrated && <Radio value={4}>{AppConstants.umpireToAward}</Radio>}
                  </Space>
                ) : (
                  <Space direction="vertical" size={0} style={{ paddingLeft: 20 }}>
                    <Radio value={1}>{AppConstants.managerAwardForOwnTeam}</Radio>
                    <Radio value={2}>{AppConstants.managerAwardForOppositionTeam}</Radio>
                    <Radio value={3}>{AppConstants.scorerToAward}</Radio>
                    {settingIsIntegrated && <Radio value={4}>{AppConstants.umpireToAward}</Radio>}
                  </Space>
                )}
              </Radio.Group>
            )}
          </div>
        </div>
      </div>
    );
  };

  const liveScoreCompIsParent = checkLivScoreCompIsParent();

  return (
    <div className="inside-container-view">
      <div>
        <Radio.Group value={settings.enabled} onChange={e => setEnabled(e.target.value)}>
          <Space direction="vertical" size={0}>
            <Radio value={true}>{AppConstants.enable}</Radio>
            <Radio value={false}>{AppConstants.disable}</Radio>
          </Space>
        </Radio.Group>
      </div>

      {settings.enabled ? (
        <div className="mt-4 pl-4">
          {getPreferenceSetByName() === 'affiliate_to_set' && getAwardWhichTeamName() === 'own' ? (
            <></>
          ) : (
            <div>
              <div>{AppConstants.whoIsReceivingThePoints}</div>
              <Radio.Group
                value={settings.receivingBFPointsRefId}
                onChange={e => setReceivingBFPointsRefId(e.target.value)}
              >
                <Space direction="vertical" size={0} style={{ paddingLeft: 20 }}>
                  {references?.ReceivingBFPoints?.map(item => (
                    <Radio key={item.id} value={item.id}>
                      {item.description}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </div>
          )}

          {typeRefId !== BFSettingType.ORGANISATION_AWARD && (
            <div className="mt-4">
              <div>{AppConstants.whoAwardsThePoints}</div>
              <Radio.Group
                value={settings.preferenceSetByRefId}
                onChange={e => setPreferenceSetByRefId(e.target.value)}
              >
                <Space direction="vertical" size={0} style={{ paddingLeft: 20 }}>
                  <Radio value={1}>{AppConstants.competitionOrganiserToAward}</Radio>
                  {otherSelected !== 5 && <Radio value={2}>{AppConstants.affiliateToAward}</Radio>}
                </Space>
              </Radio.Group>
              {getPreferenceSetByName() === 'affiliate_to_set' && (
                <div className="ml-4 pl-4">
                  <Radio.Group
                    value={settings.awardWhichTeamRefId}
                    onChange={e => setAwardWhichTeamRefId(e.target.value)}
                  >
                    <Space direction="vertical" size={0} style={{ paddingLeft: 20 }}>
                      {references?.AwardWhichTeam?.filter(item =>
                        getReceivingBFPointsName() === 'match' ? item.name !== 'own' : true,
                      ).map(item => (
                        <Radio key={item.id} value={item.id}>
                          {item.description}
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                </div>
              )}
            </div>
          )}

          {isBFAppEnable && viewForMatchDayApp()}

          <div className="mt-4">
            <div className="mb-2">{AppConstants.howManyPlayersWillReceivePoints}</div>
            <div className="small-steper-style pl-4">
              <InputNumber
                min={1}
                value={settings.receivePointPlayers}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                onChange={onChangeReceivePointPlayers}
              />
            </div>
          </div>

          <div className="mt-4">
            <div>{AppConstants.howManyPointsWillEachPlayerReceive}</div>
            <div className="pl-4">
              {settings.receivePointPlayers > 0 &&
                counter(settings.receivePointPlayers).map((value, index) => (
                  <div key={index} className="d-flex mt-2" style={{ alignItems: 'end' }}>
                    <div>Player {index + 1}</div>
                    <div className="small-steper-style pl-4">
                      <InputNumber
                        min={0}
                        value={settings.receivePoints[index]}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        onChange={number => onChangeReceivePoints(index, Math.ceil(number))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

BestAndFairestPointSetting.defaultProps = {
  onFormChange: () => {},
};

export default BestAndFairestPointSetting;
