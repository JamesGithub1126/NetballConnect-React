import {
  getActualTimeColumn,
  getEventTimeColumn,
  getEventTypeColumn,
  getEventSubTypeColumn,
  getTeamColumn,
  getPlayerHeadingColumn,
  getPositionColumn,
  getRemoveColumn,
  getEventGameTimeColumn,
} from './columns';

export default function createColumns(showSubEvents, showPositions) {
  let columns = [
    getEventGameTimeColumn(),
    getActualTimeColumn(),
    getEventTimeColumn(),
    getEventTypeColumn(),
    getTeamColumn(),
    getPlayerHeadingColumn(),
  ];
  if (showSubEvents) {
    const eventSubTypeColumn = getEventSubTypeColumn();
    columns.splice(3, 0, eventSubTypeColumn);
  }
  if (showPositions) {
    const positionColumn = getPositionColumn();
    columns.push(positionColumn);
  }
  columns.push(getRemoveColumn());
  return columns;
}
