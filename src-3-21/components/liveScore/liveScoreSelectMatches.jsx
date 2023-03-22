import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Select, Radio, Modal } from 'antd';
import { useOrganisation } from 'customHooks/hooks';
import moment from 'moment';
import AppConstants from '../../themes/appConstants';
import { SuspenedMatchStatusRefId } from 'enums/enums';
import {
  liveScoreSuspensionMatchesAction,
  liveScoreSetSuspendedMatchServedStateAction,
  liveScoreSetSuspensionSelectedMatchesAction,
  liveScoreUpdateSuspendedMatchesAction,
} from '../../store/actions/LiveScoreAction/liveScoreSuspensionAction';

const { Option } = Select;

const LiveScoreSelectMatches = ({ suspension, competitionList, ...props }) => {
  const dispatch = useDispatch();
  const { onLoadMatches, competitionMatchList, selectedMatchList } = useSelector(
    state => state.LiveScoreSuspensionState,
  );
  const { organisationUniqueKey } = useOrganisation();
  const [isAllCompetitions, setIsAllCompetitions] = useState(true);
  const [selectedCompetitions, setSelectedCompetitions] = useState([]);

  useEffect(() => {
    const payload = {
      organisationUniqueKey,
      userId: suspension.userId,
      isAllCompetitions,
      selectedCompetitions,
    };
    dispatch(liveScoreSuspensionMatchesAction(payload));
  }, [suspension, organisationUniqueKey, isAllCompetitions, selectedCompetitions]);

  const handleCompetitionsMode = e => {
    setIsAllCompetitions(e.target.value === 1);
    setSelectedCompetitions(e.target.value === 1 ? competitionList.map(comp => comp.id) : []);
  };

  const handleSelectCompetitions = value => {
    setSelectedCompetitions(value);
  };

  const handleCountServedSuspension = (record, checked) => {
    dispatch(liveScoreSetSuspendedMatchServedStateAction(record.matchId, checked));
  };

  const handleTableSelectionChanged = keys => {
    const updatedKeys = keys.slice(0, suspension.suspendedMatches);
    dispatch(liveScoreSetSuspensionSelectedMatchesAction(updatedKeys));
  };

  const handleSelectMatchesModal = () => {
    const matches = competitionMatchList
      .filter(i => selectedMatchList.indexOf(i.matchId) >= 0)
      .map(i => ({
        id: i.id,
        matchId: i.matchId,
        servedStatusRefId: i.servedStatusRefId
          ? i.servedStatusRefId
          : SuspenedMatchStatusRefId.Pending,
      }));

    if (matches.length > 0) {
      const payload = {
        suspensionId: suspension.id,
        matches,
      };
      dispatch(liveScoreUpdateSuspendedMatchesAction(payload));
    }

    props.onCancel();
  };

  const handleCancel = () => {
    // Reset selected matches;
    dispatch(liveScoreSetSuspensionSelectedMatchesAction([]));
    props.onCancel();
  }

  const columns = [
    {
      title: AppConstants.tableMatchID,
      dataIndex: 'matchId',
      key: 'matchId',
    },
    {
      title: AppConstants.date,
      dataIndex: 'date',
      key: 'date',
      render: date => <span>{moment(date).format('DD/MM/YYYY')}</span>,
    },
    {
      title: AppConstants.round,
      dataIndex: 'round',
      key: 'round',
    },
    {
      title: AppConstants.competition,
      dataIndex: 'competition',
      key: 'competition',
    },
    {
      title: AppConstants.tableMatch,
      key: 'match',
      render: record => <span>{`${record.team1} vs ${record.team2}`}</span>,
    },
    {
      title: AppConstants.division,
      dataIndex: 'division',
      key: 'division',
    },
    {
      title: AppConstants.countAsServedSuspension,
      key: 'served',
      render: record => {
        return (
          <Radio.Group
            value={record.servedStatusRefId === SuspenedMatchStatusRefId.ServedYes ? 1 : 0}
            onChange={e => handleCountServedSuspension(record, e.target.value)}
          >
            <Radio value={1}>{AppConstants.yes}</Radio>
            <Radio value={0}>{AppConstants.no}</Radio>
          </Radio.Group>
        );
      },
    },
  ];

  return (
    <Modal
      title={AppConstants.selectMatches}
      okText={AppConstants.confirm}
      onOk={() => handleSelectMatchesModal()}
      centered
      {...props}
      onCancel={() => handleCancel()}
    >
      <div className="row">
        <div className="col-sm">
          <span className="text-heading-large">{AppConstants.applyToWhichCompetition}</span>
          <div className="row">
            <div className="col-sm-3 d-flex align-items-center">
              <Radio.Group
                className="reg-competition-radio w-100 mt-4"
                name="selectRole"
                onChange={handleCompetitionsMode}
                value={isAllCompetitions ? 1 : 2}
              >
                <Radio className="p-0" value={1}>
                  {AppConstants.allCompetitions}
                </Radio>
                <Radio className="p-0" value={2}>
                  {AppConstants.selectedCompetitions}
                </Radio>
              </Radio.Group>
            </div>
          </div>
          {isAllCompetitions === false && (
            <div className="row pt-3">
              <div className="col-sm-3 d-flex align-items-center">
                <span className="">{AppConstants.competitions}</span>
              </div>
              <div className="col-sm-9">
                <Select
                  name="selectRole"
                  mode="multiple"
                  className="w-100"
                  onChange={handleSelectCompetitions}
                  value={selectedCompetitions}
                >
                  {competitionList.map(item => (
                    <Option key={`competition_${item.id}`} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="row">
        <div className="col-sm">
          <span className="text-heading-large mt-4">
            {AppConstants.selectMatchesSuspensionAppliesTo}
          </span>
        </div>
      </div>
      <div className="table-responsive home-dash-table-view">
        <Table
          rowSelection={{
            selectedRowKeys: selectedMatchList,
            onChange: keys => handleTableSelectionChanged(keys),
          }}
          className="home-dashboard-table"
          columns={columns}
          dataSource={competitionMatchList}
          rowKey={record => record.matchId}
          pagination={false}
          loading={onLoadMatches}
        />
      </div>
    </Modal>
  );
};

export default LiveScoreSelectMatches;
