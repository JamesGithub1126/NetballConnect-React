import { RECORDUMPIRETYPE } from "../../util/enums";
import React, { Fragment, useCallback, useMemo, useState } from "react";
import AppConstants from "../../themes/appConstants";
import { Alert, AutoComplete, Select, Spin } from "antd";
import { getUmpireSequencesFromSettings } from "../../util/umpireHelper";
import { liveScoreUpdateMatchAction } from "../../store/actions/LiveScoreAction/liveScoreMatchAction";
import { captializedString, isArrayNotEmpty, isNullOrUndefinedOrEmptyString } from "../../util/helpers";
import { EntityType, UmpireSequence } from "../../enums/enums";
import {
  getUmpireField,
  umpireSearchRoleIds
} from "../../store/reducer/liveScoreReducer/helpers/matchUmpires/umpireHelpers";
import InputWithHead from "../../customComponents/InputWithHead";
import { getOrganisationData } from "../../util/sessionStorage";
import moment from "moment/moment";
import { newUmpireListAction } from "../../store/actions/umpireAction/umpireAction";
import { debounce, uniqBy, sortBy } from "lodash";
import { useDispatch } from "react-redux";

const { Option } = Select;

export const MatchOfficialEdit = ({ matchId, competitionId, isCompParent, settings, onOfficialChanged = () => {} }) => {
  const { competitionSettings, umpireAllocationSettings, matchSettings: liveScoreSetting } = settings;
  const [umpireChanged, setUmpireChanged] = useState(false);

  const umpireSequences = useMemo(() => getUmpireSequencesFromSettings(competitionSettings?.umpireSequenceSettings, true), [competitionSettings]);
  const officialSequences = useMemo(() => Array.from({ length: competitionSettings?.umpireSequenceSettings?.NumberOfOfficials ?? 0 }).map((_, index) => index + 1), [competitionSettings]);

  const dispatch = useDispatch();
  const handleUmpireSearch = (name, sequence) => {
    handleUmpireSelect(null, sequence);
    if (!name || name.length < 2) {
      return;
    }

    if (isNullOrUndefinedOrEmptyString(name)) {
      //clear umpire list
      return null;
    }
    let matchData =  liveScoreSetting.matchData;
    let startTime = moment(matchData.startTime);
    let endTime = moment(startTime).add(matchData.matchDuration, 'minutes');
    matchData.type === AppConstants.twoHalves || matchData.type === AppConstants.single
      ? endTime.add(matchData.breakDuration, 'minutes')
      : endTime
        .add(matchData.qtrBreak || matchData.breakDuration, 'minutes')
        .add(matchData.qtrBreak || matchData.breakDuration, 'minutes')
        .add(matchData.mainBreakDuration, 'minutes');

    dispatch(newUmpireListAction({
      entityTypes: isCompParent ? EntityType.Competition : EntityType.CompetitionOrganisation,
      compId: competitionId,
      compOrgId: competitionSettings.competitionOrganisationId,
      isCompParent,
      matchStartTime: matchData.startTime,
      matchEndTime: moment(endTime).utc().format(),
      matchId,
      name,
      sequence,
      onlyUniqueUsers: true,
      anyoneCanBeUmpire: AnyoneCanBeUmpire,
      roleIds: umpireSearchRoleIds,
    }));
  }

  const handleDelayedUmpireSearch = useCallback(
    debounce(handleUmpireSearch, 300)
    , [isCompParent, competitionId, competitionSettings, liveScoreSetting.matchData]);

  const AnyoneCanBeUmpire = competitionSettings?.recordUmpireType === RECORDUMPIRETYPE.Users && competitionSettings?.umpireSequenceSettings?.AnyoneCanBeUmpire;

  const checkIfUmpireIsDisabled = sequence => {
    const { staticMatchData, addEditMatch } = liveScoreSetting;

    let isUmpireDisabled = addEditMatch.matchStatus === 'ENDED';
    let teamOrgansationId = null;
    if (UmpireSequence.Umpire1 === sequence) {
      teamOrgansationId = staticMatchData.team1?.competitionOrganisationId;
    } else if (UmpireSequence.Umpire2 === sequence) {
      teamOrgansationId = staticMatchData.team2?.competitionOrganisationId;
    }
    if (!isCompParent) {
      const { organisationId } = getOrganisationData() || {};
      let competitionOrganisationId = null;
      if (
        competitionSettings.competitionOrganisation &&
        competitionSettings.competitionOrganisation.orgId === organisationId
      ) {
        competitionOrganisationId = competitionSettings.competitionOrganisation.id;
      }
      if (competitionSettings.officialOrganisationId !== organisationId && (!teamOrgansationId || teamOrgansationId !== competitionOrganisationId)) {
        isUmpireDisabled = true;
      }
    }
    return isUmpireDisabled;
  };

  const shouldShowUmpireSelectionView = () => {
    const { addEditMatch } = liveScoreSetting ?? {};
    let showUmpireSelectionView =
      competitionSettings.recordUmpireType === RECORDUMPIRETYPE.Users && addEditMatch?.divisionId > 0;
    if (
      umpireAllocationSettings &&
      umpireAllocationSettings.noUmpiresUmpireAllocationSetting &&
      showUmpireSelectionView
    ) {
      if (umpireAllocationSettings.noUmpiresUmpireAllocationSetting.allDivisions) {
        showUmpireSelectionView = false;
      } else if (umpireAllocationSettings.noUmpiresUmpireAllocationSetting.divisions) {
        let noUmpire = umpireAllocationSettings.noUmpiresUmpireAllocationSetting.divisions.some(
          x => x.id == addEditMatch?.divisionId,
        );
        if (noUmpire) {
          showUmpireSelectionView = false;
        }
      }
    }
    return showUmpireSelectionView;
  }

  const handleUmpireSelect = (option, sequence) => {
    const { umpireSelectionDict } = liveScoreSetting;
    const oldKey = umpireSelectionDict[sequence]?.key ?? null;
    const newKey = option?.umpire?.key ?? null;

    dispatch(liveScoreUpdateMatchAction(
      { umpire: option?.umpire, sequence: sequence },
      'umpireSelect',
    ));

    if (oldKey !== newKey) {
      setUmpireChanged(true);
      onOfficialChanged();
    }
  };

  const getUmpireSelectionView = sequence => {
    let value = null;

    const {
      coachList,
      umpireList,
      umpireSelectionDict,
      umpireSearchDict,
      umpireLoad,
    } = liveScoreSetting;

    const isUmpireDisabled = checkIfUmpireIsDisabled(sequence);
    const coachListResult = isArrayNotEmpty(coachList) ? coachList : [];
    let datasource = [];

    if (AnyoneCanBeUmpire) {
      datasource = umpireSearchDict[sequence] ? umpireSearchDict[sequence] : [];
    } else {
      datasource = sequence == UmpireSequence.UmpireCoach ? coachListResult : umpireList;
    }
    datasource = uniqBy(datasource, 'key');
    datasource = sortBy(datasource, (item) => item.selectionName)
    const umpireField = getUmpireField(sequence);

    value = umpireSelectionDict[sequence]?.key ? umpireSelectionDict[sequence].key : null;
    if (!umpireField) return <></>;

    let umpireName = umpireSelectionDict[sequence]?.umpireName;
    return (
      <>
        <InputWithHead heading={umpireField.heading} />
        {AnyoneCanBeUmpire ? (
          <AutoComplete
            className="w-100"
            style={{ paddingRight: 1, minWidth: 182 }}
            placeholder={umpireField.searchPlaceholder}
            notFoundContent={umpireLoad ? <Spin size="small" /> : null}
            onSelect={(val, option) => {
              handleUmpireSelect(option, sequence);
            }}
            value={umpireName}
            disabled={isUmpireDisabled}
            onSearch={search => {
              handleUmpireSelect(null, sequence);
              dispatch(liveScoreUpdateMatchAction(sequence, 'clearUmpireDict'));
              handleDelayedUmpireSearch(search, sequence);
            }}
            allowClear={true}
            onClear={() => {
              dispatch(liveScoreUpdateMatchAction(sequence, 'clearUmpireDict'));
              onOfficialChanged();
            }}
          >
            {datasource.map(item => (
              <Option
                className={item.key === value ? `selected-borrow-player` : ''}
                key={`${item.key}_${sequence}`}
                value={item.key}
                umpire={item}
                disabled={item.disabled}
              >
                {item.selectionName}
              </Option>
            ))}
          </AutoComplete>
        ) : (
          <Select
            className="w-100"
            style={{ paddingRight: 1, minWidth: 182 }}
            placeholder={umpireField.selectPlaceholder}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => 
              (option?.umpire?.selectionName ?? '').toLowerCase().includes(input.toLowerCase())
            }
            onSelect={(val, option) => {
              dispatch(liveScoreUpdateMatchAction(
                { umpire: option.umpire, sequence: sequence },
                'umpireSelect',
              ));
              onOfficialChanged();
            }}
            value={umpireName}
            disabled={isUmpireDisabled}
            allowClear={true}
            onClear={() => {
              dispatch(liveScoreUpdateMatchAction(sequence, 'clearUmpireDict'));
              onOfficialChanged();
            }}
          >
            {datasource.map(item => (
              <Option
                key={`${item.key}_${sequence}`}
                value={item.key}
                umpire={item}
                disabled={item.disabled}
              >
                {item.selectionName}
              </Option>
            ))}
          </Select>
        )}
      </>
    );
  };

  const getOfficialSelectionView = sequence => {
    const { otherOfficialsList = [], officialSelectionDict } = liveScoreSetting;

    const label = `${AppConstants.officialStatisticians} ${sequence}`;
    return (
      <>
        <InputWithHead heading={`${AppConstants.officialStatisticians} ${sequence}`} />
        <Select
          className="w-100"
          style={{ paddingRight: 1, minWidth: 182 }}
          placeholder={label}
          onSelect={(val, option) => {
            dispatch(liveScoreUpdateMatchAction(
              { official: option.official, sequence: sequence },
              'officialSelect',
            ));
            onOfficialChanged();
          }}
          value={officialSelectionDict[sequence]?.id ?? null}
          allowClear={true}
          onClear={() => {
            dispatch(liveScoreUpdateMatchAction(sequence, 'clearOfficialDict'));
            onOfficialChanged();
          }}
        >
          {otherOfficialsList.map(item => (
            <Option
              key={`${item.id}_${sequence}`}
              value={item.id}
              official={item}
            >
              {[item.firstName, item.lastName].join(' ')}
            </Option>
          ))}
        </Select>
      </>
    );
  };

  const getUmpireTextInputView = sequence => {
    const { umpireSelectionDict } = liveScoreSetting;
    const umpireField = getUmpireField(sequence);
    const isUmpireDisabled = checkIfUmpireIsDisabled(sequence);
    const value = umpireSelectionDict[sequence]?.umpireName
      ? umpireSelectionDict[sequence].umpireName
      : null;

    if (!umpireField) return <></>;
    return (
      <>
        <InputWithHead
          type="text"
          heading={umpireField.heading}
          disabled={isUmpireDisabled}
          onChange={e => {
            dispatch(liveScoreUpdateMatchAction(
              { sequence: sequence, key: 'umpireName', value: captializedString(e.target.value) },
              'umpireEdit',
            ));
            onOfficialChanged();
          }}
          value={value}
          placeholder={umpireField.inputPlaceholder}
        />
      </>
    );
  };

  const getReselectAtCourtUmpiresMsg = () => {
    const { atCourtUmpires } = liveScoreSetting;
    if (!atCourtUmpires?.length) {
      return '';
    }
    return (
      <>
        <span className="">{AppConstants.reselectAtCourtUmpiresMsg1}</span>
        <ul className="mt-1 pl-2">
          {atCourtUmpires.map(u => {
            const umpireField = getUmpireField(u.sequence);
            return (
              <li
                key={`${u.umpireName}${umpireField.sequence}`}
              >{`${umpireField.name}: ${u.umpireName}`}</li>
            );
          })}
        </ul>
        <span className="mt-3">{AppConstants.reselectAtCourtUmpiresMsg2}</span>
      </>
    );
  };

  const getOrganizationSelectionView = sequence => {
    let value = null;

    const { clubListData, umpireSelectionDict } = liveScoreSetting;
    const { AnyoneCanBeUmpire } = competitionSettings.umpireSequenceSettings;
    const isUmpireDisabled = checkIfUmpireIsDisabled(sequence);
    const disableSelection =
      (!!AnyoneCanBeUmpire && !umpireSelectionDict[sequence]?.key) || isUmpireDisabled;
    let datasource = clubListData;

    const umpireField = getUmpireField(sequence);
    value = umpireSelectionDict[sequence]?.competitionOrganisationId;

    if (!umpireField) return <></>;
    return (
      <>
        <InputWithHead heading={umpireField.orgHeading} />
        <Select
          disabled={disableSelection}
          className="w-100"
          style={{ paddingRight: 1, minWidth: 182 }}
          onChange={val => {
            dispatch(liveScoreUpdateMatchAction(
              { sequence: sequence, key: 'competitionOrganisationId', value: val },
              'umpireEdit',
            ));
            onOfficialChanged();
          }}
          value={value}
          placeholder={umpireField.orgPlaceholder}
        >
          {datasource.map(item => (
            <Option key={`umpire${sequence}Org_${item.id}`} value={item.id}>
              {item.name}
            </Option>
          ))}
        </Select>
      </>
    );
  };

  if (!(competitionSettings && umpireAllocationSettings && liveScoreSetting)) {
    return null;
  }

  if (competitionSettings.recordUmpireType === RECORDUMPIRETYPE.None) {
    return null;
  }

  const umpireView = () => {
    if (shouldShowUmpireSelectionView()) {
      const { atCourtUmpires } = liveScoreSetting;
      return (
        <div>
          <div className="mt-3 mb-3">
            {umpireChanged && (
              <Alert
                description={AppConstants.umpireChangedMatchDayMessage}
                type="warning"
                style={{ borderRadius: '10px' }}
                showIcon
              />
            )}
          </div>
          {!!atCourtUmpires?.length && (
            <div className="mt-3 mb-3">
              <Alert
                description={getReselectAtCourtUmpiresMsg()}
                type="warning"
                style={{ borderRadius: '10px' }}
                showIcon
              />
            </div>
          )}
          <div className="row">
            {umpireSequences.map((us, idx) => {
              //umpire search
              if (AnyoneCanBeUmpire) {
                return (
                  <Fragment key={`umpireseledtion_${idx}`}>
                    <div className="col-sm-6" span={12}>
                      {getUmpireSelectionView(us)}
                    </div>

                    <div className="col-sm-6" span={12}>
                      {getOrganizationSelectionView(us)}
                    </div>
                  </Fragment>
                );
              } else {
                //umpire select
                return (
                  <div key={`umpireseledtion_${idx}`} className="col-sm-6" span={12}>
                    {getUmpireSelectionView(us)}
                  </div>
                );
              }
            })}
          </div>
        </div>
      );
    }

    if (competitionSettings.recordUmpireType === RECORDUMPIRETYPE.Names) {
      return (<div>
        <div className="row">
          {umpireSequences
            .filter(
              us => us != UmpireSequence.UmpireReserve && us != UmpireSequence.UmpireCoach,
            )
            .map((us, idx) => {
              return (
                <Fragment key={`umpireinput_${idx}`}>
                  <div className="col-sm-6" span={12}>
                    {getUmpireTextInputView(us)}
                  </div>

                  <div className="col-sm-6" span={12}>
                    {getOrganizationSelectionView(us)}
                  </div>
                </Fragment>
              );
            })}
        </div>
      </div>)
    }

    return null;
  }

  const officialView = () => {
    return (<div className="row">
      {
        officialSequences.map((sequence) => {
          //official select
          return (
            <div key={`official_selection_${sequence}`} className="col-sm-6" span={12}>
              {getOfficialSelectionView(sequence)}
            </div>
          );
        })
      }
    </div>);
  }

  return <>
    {umpireView()}
    {officialView()}
  </>;
}
