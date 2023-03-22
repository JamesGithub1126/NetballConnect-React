import React from 'react';
import AppConstants from 'themes/appConstants';
import DrawActionMenu from './drawActionMenu';
import Swappable from 'customComponents/SwappableComponent';
import { VariableSizeGrid } from 'react-window';
import { getSubCourtSize } from 'util/drawUtil';

const NotInDrawFullCourt = props => {
  let disabledStatus = props.disabledStatus;
  let dateItem = props.dateItem;
  let notInDraws = dateItem.notInDraws || [];
  //slotObject.drawsId !== null &&
  let isByRound = !(props.firstTimeCompId == '-1' || props.filterDates);

  const slotCell = ({ columnIndex, rowIndex, style }) => {
    //let isAxisInverted = props.isAxisInverted;

    let index = rowIndex;
    let slotObject = notInDraws[index];
    let courtData = slotObject;

    let hasSubCourtDivision = props.drawsState.hasSubCourtDivision;
    const textColor = slotObject.colorCode === '#999999' ? '#FFFFFF' : slotObject.fontColor;
    return (
      <div style={style}>
        <div
          onMouseDown={props.slotObjectMouseDown}
          onTouchStart={props.slotObjectMouseDown}
          onMouseUp={props.drawsFieldUp}
          onTouchEnd={props.drawsFieldUp}
          onDragEnd={props.drawsFieldUp}
          onMouseEnter={e => props.slotObjectMouseEnter(e, slotObject)}
          onMouseLeave={props.slotObjectMouseLeave}
          className={`box box-size-full-court ${
            slotObject.colorCode == '#EA0628' ? 'boxPink' : ''
          }`}
          style={{
            backgroundColor: slotObject.colorCode,
            top: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            cursor: disabledStatus && 'no-drop',
          }}
        >
          <Swappable
            id={index.toString() + ':notindraw:' + (isByRound ? dateItem.roundId.toString() : '1')}
            content={1}
            swappable={props.checkSwap(slotObject)}
            onSwap={(source, target) => 0}
            isCurrentSwappable={(source, target) => 0}
          >
            {hasSubCourtDivision && (
              <div style={{ color: textColor }}>
                <span>{getSubCourtSize(slotObject.subCourt)}</span>
              </div>
            )}
            {slotObject.drawsId != null &&
              (props.isDivisionNameShow ? (
                <span className={'no-pointer'} style={{ color: textColor }}>
                  {slotObject.divisionName + '-' + slotObject.gradeName}
                </span>
              ) : (
                <span className={'no-pointer'} style={{ color: textColor }}>
                  {slotObject.homeTeamName} <br />
                  {slotObject.awayTeamName}
                </span>
              ))}
          </Swappable>
        </div>

        <DrawActionMenu
          {...props}
          slotObject={slotObject}
          disabledStatus={disabledStatus}
          courtData={courtData}
          dateItem={dateItem}
          topMargin={50}
          menuMarginLeft={0}
          isAxisInverted={false}
        ></DrawActionMenu>
      </div>
    );
  };

  if (notInDraws.length == 0) {
    return null;
  }
  let gridHeight = 600;
  let rowCount = notInDraws.length;

  return (
    <div style={{ marginLeft: '10px' }}>
      <div className="not-in-draw-header">{AppConstants.notInDrawHeader}</div>
      <VariableSizeGrid
        // ref={this.gridRef}
        columnCount={1}
        columnWidth={index => {
          return 100;
        }}
        height={gridHeight}
        rowCount={rowCount}
        rowHeight={index => {
          return 70;
        }}
        width={115}
        // onScroll={this.onScroll}
      >
        {slotCell}
      </VariableSizeGrid>
    </div>
  );
};

export default NotInDrawFullCourt;
