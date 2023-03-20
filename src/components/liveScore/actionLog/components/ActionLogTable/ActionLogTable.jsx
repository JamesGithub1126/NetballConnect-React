import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Form, Table } from 'antd';
import styles from '../actionLog.module.scss';
import createColumns from './helper';
import AppConstants from 'themes/appConstants';
import { isBasketball, isFootball } from 'util/registrationHelper';

const ActionLogTable = ({ form, period }) => {
  const matchEvents = useSelector(state => state.LiveScoreMatchLogState?.matchEvents) || [];
  const isPremierCompetition =
    useSelector(state => state.LiveScoreMatchLogState?.isPremierCompetition) || false;
  const postitionTracking =
    useSelector(state => state.LiveScoreMatchLogState?.postitionTracking) || false;

  const statMatchEvents = useMemo(() => {
    return matchEvents?.filter(
      event =>
        Number(event.period) === period &&
        (event.eventCategory === 'stat' || ['pause', 'resume'].includes(event.type)),
    );
  }, [period, matchEvents]);

  const columns = useMemo(() => {
    const showSubEvents = isPremierCompetition || isFootball || isBasketball;
    const showPositions = !!postitionTracking;
    return createColumns(showSubEvents, showPositions);
  }, [isPremierCompetition, postitionTracking]);

  return (
    <Form form={form} className={'w-100'}>
      <Table
        scroll={{ x: true }}
        pagination={false}
        columns={columns}
        dataSource={statMatchEvents}
        locale={{ emptyText: <div className={styles.emptyData}>{AppConstants.noData}</div> }}
        rowKey={record => record.id + ''}
        className={`w-100 home-dashboard-table`}
      />
    </Form>
  );
};

export default ActionLogTable;
