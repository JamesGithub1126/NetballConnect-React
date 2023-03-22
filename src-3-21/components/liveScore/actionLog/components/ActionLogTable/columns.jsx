import { Form } from 'antd';
import moment from 'moment';
import React from 'react';
import AppConstants from 'themes/appConstants';
import ValidationConstants from 'themes/validationConstant';
import { FORM_ITEM_NAME, isPointType } from '../../api';
import {
  ActualTimeView,
  EventSubTypeView,
  EventTypeView,
  EventTimeView,
  EventTeamView,
  EventPlayerView,
  EventPositionView,
  EventRemoveView,
  EventGameTimeView,
} from '../columnViews';

export const getEventGameTimeColumn = startTime => {
  return {
    title: AppConstants.eventMinute,
    dataIndex: 'id',
    width: 16,
    align: 'center',
    shouldCellUpdate: (record, prevRecord) =>
      record.gameTime !== prevRecord.gameTime || record.timeUpdated !== prevRecord.timeUpdated,
    render: (_, record) => <EventGameTimeView matchEvent={record} />,
  };
};

export const getActualTimeColumn = startTime => {
  return {
    title: AppConstants.actualTime,
    dataIndex: 'id',
    width: 128,
    align: 'center',
    shouldCellUpdate: (record, prevRecord) =>
      moment(record.eventTimestamp)?.valueOf() !== moment(prevRecord.eventTimestamp)?.valueOf(),
    render: (_, record) => <ActualTimeView matchEvent={record} startTime={startTime} />,
  };
};

export const getEventTimeColumn = () => {
  return {
    title: AppConstants.timeFromPeriodStart,
    dataIndex: 'id',
    width: 192,
    shouldCellUpdate: (record, prevRecord) => record.diff !== prevRecord.diff,
    render: (_, record, idx) => {
      return (
        <Form.Item
          name={[record.id, FORM_ITEM_NAME.time]}
          //initialValue={record.diff}
          rules={[{ required: true, message: ValidationConstants.editActionLog.time }]}
        >
          <EventTimeView matchEvent={record} />
        </Form.Item>
      );
    },
  };
};

export const getEventTypeColumn = () => {
  return {
    title: AppConstants.eventType,
    dataIndex: 'id',
    shouldCellUpdate: (record, prevRecord) => record.type !== prevRecord.type,
    render: (_, record, idx) => {
      return (
        <Form.Item
          name={[record.id, FORM_ITEM_NAME.eventType]}
          //initialValue={record.type}
          rules={[{ required: true, message: ValidationConstants.editActionLog.type }]}
        >
          <EventTypeView matchEvent={record} />
        </Form.Item>
      );
    },
  };
};

export const getEventSubTypeColumn = () => {
  return {
    title: AppConstants.eventSubType,
    dataIndex: 'id',
    shouldCellUpdate: (record, prevRecord) =>
      record.type !== prevRecord.type || record.attribute1Value !== prevRecord.attribute1Value,
    render: (_, record, idx) => {
      const subType = isPointType(record.type) ? record.attribute1Value : record.type;
      return (
        <Form.Item
          name={[record.id, FORM_ITEM_NAME.eventSubType]}
          //initialValue={subType}
          rules={[{ required: true, message: ValidationConstants.editActionLog.subType }]}
        >
          <EventSubTypeView matchEvent={record} />
        </Form.Item>
      );
    },
  };
};

export const getTeamColumn = () => {
  return {
    title: AppConstants.team,
    dataIndex: 'id',
    shouldCellUpdate: (record, prevRecord) => record.teamId !== prevRecord.teamId,
    render: (_, record, idx) => {
      return (
        <Form.Item
          name={[record.id, FORM_ITEM_NAME.team]}
          //initialValue={record.teamId}
          rules={[{ required: true, message: ValidationConstants.editActionLog.team }]}
        >
          <EventTeamView matchEvent={record} />
        </Form.Item>
      );
    },
  };
};

export const getPlayerHeadingColumn = () => {
  return {
    title: AppConstants.playerHeading,
    dataIndex: 'id',
    shouldCellUpdate: (record, prevRecord) =>
      record.playerId !== prevRecord.playerId ||
      record.teamId !== prevRecord.teamId ||
      record.type !== prevRecord.type,
    render: (_, record, idx) => {
      return (
        <Form.Item
          name={[record.id, FORM_ITEM_NAME.player]}
          //initialValue={record.playerId}
          rules={[{ required: true, message: ValidationConstants.editActionLog.player }]}
        >
          <EventPlayerView matchEvent={record} />
        </Form.Item>
      );
    },
  };
};
export const getPositionColumn = () => {
  return {
    title: AppConstants.playerPositionHeading,
    dataIndex: 'id',
    shouldCellUpdate: (record, prevRecord) => record.positionId !== prevRecord.positionId,
    render: (_, record, idx) => {
      return (
        <Form.Item
          name={[record.id, FORM_ITEM_NAME.position]}
          //initialValue={record.positionId}
          rules={[{ required: true, message: ValidationConstants.editActionLog.position }]}
        >
          <EventPositionView matchEvent={record} />
        </Form.Item>
      );
    },
  };
};

export const getRemoveColumn = () => {
  return {
    title: AppConstants.remove,
    dataIndex: 'id',
    width: 32,
    align: 'center',
    shouldCellUpdate: (record, prevRecord) => false,
    render: (_, record) => {
      return <EventRemoveView matchEvent={record} />;
    },
  };
};
