import React, { Component } from 'react';
import {
  Layout,
  Button,
  Tooltip,
  Menu,
  Select,
  DatePicker,
  TimePicker,
  Checkbox,
  message,
  Spin,
  Modal,
  Radio,
} from 'antd';

import DrawConstant from 'themes/drawConstant';
import {
  checkDate,
  getDate,
  sortSlot,
  getEndTime,
  isVenueFieldConfigurationEnabled,
  showOnlySelectedOrganisations,
  showOnlySelectedDivisions,
} from 'util/drawUtil';
import { randomKeyGen } from 'util/helpers';
import Swappable from 'customComponents/SwappableComponent';
import DrawsDateHeader from './drawDateHeader';
import { VariableSizeGrid } from 'react-window';
import '../draws.scss';
import AppConstants from 'themes/appConstants';
import DrawActionMenu from './drawActionMenu';
import NotInDrawFullCourt from './notInDrawFullCourt';
import { checkTargetedVenueHomeForAwayTeam, swapHomeAndAwayTeam } from "./venueHelper";

class MultiFieldDrawsFullCourt extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.gridRef = React.createRef();
    this.childHeaderRef = React.createRef();
    this.stickyColumnRef = React.createRef();
    this.dateHeaderRef = React.createRef();
  }

  componentDidUpdate(nextProps) {}

  componentDidMount() {
    this.props.childGridRefs.push(this.gridRef);
  }
  checkCurrentSwapObjects = (source, target, drawData) => {
    let sourceIndexArray = source.split(':');
    let targetIndexArray = target.split(':');
    let sourceXIndex = sourceIndexArray[0];
    let sourceYIndex = sourceIndexArray[1];
    let targetXIndex = targetIndexArray[0];
    let targetYIndex = targetIndexArray[1];
    let targetObject = drawData[targetXIndex].slotsArray[targetYIndex];
    if (sourceYIndex == 'notindraw') {
      if (targetObject.drawsId || targetObject.isUnavailable) {
        //can only move not in draw to empty slot
        return false;
      }
    } else {
      if (sourceXIndex === targetXIndex && sourceYIndex === targetYIndex) {
        //can not move same slot
        return false;
      }
      let sourceObject = drawData[sourceXIndex].slotsArray[sourceYIndex];
      if (sourceObject.drawsId == null && targetObject.drawsId == null) {
        //can not move if both empty
        return false;
      }
      if ((sourceObject.isUnavailable && !sourceObject.drawsId) || targetObject.isUnavailable) {
        //can not move if either is unavailable
        return false;
      }
    }
    return true;
  };
  onSwap(source, target, roundData, round_Id) {
    let drawData = roundData.draws;
    let sourceIndexArray = source.split(':');
    let targetIndexArray = target.split(':');
    let sourceXIndex = sourceIndexArray[0];
    let sourceYIndex = sourceIndexArray[1];
    let targetXIndex = targetIndexArray[0];
    let targetYIndex = targetIndexArray[1];
    let targetObject = drawData[targetXIndex].slotsArray[targetYIndex];
    if (sourceYIndex == 'notindraw') {
      let notInDraws = roundData.notInDraws;
      let sourceObejct = notInDraws[sourceXIndex];
      this.moveNotInDrawToEmptySlot(
        sourceObejct,
        targetObject,
        sourceIndexArray,
        targetIndexArray,
        roundData,
        round_Id,
      );
    } else {
      if (sourceXIndex === targetXIndex && sourceYIndex === targetYIndex) {
        return;
      }
      // let drawData = this.props.drawsState.getStaticDrawsData;
      let sourceObject = drawData[sourceXIndex].slotsArray[sourceYIndex];
      if (sourceObject.drawsId !== null && targetObject.drawsId !== null) {
        this.updateCompetitionDraws(
          sourceObject,
          targetObject,
          sourceIndexArray,
          targetIndexArray,
          drawData,
        );
      } else if (sourceObject.drawsId == null && targetObject.drawsId == null) {
      } else {
        this.updateCompetitionNullDraws(
          sourceObject,
          targetObject,
          sourceIndexArray,
          targetIndexArray,
          drawData,
          round_Id,
        );
      }
    }
  }
  ///////update the competition draws on  swapping and hitting update Apis if both has value
  updateCompetitionDraws = (
    sourceObject,
    targetObject,
    sourceIndexArray,
    targetIndexArray,
    drawData,
  ) => {
    let customSourceObject = {
      drawsId: targetObject.drawsId,
      venueId: targetObject.venueId,
      originalHomeTeamId: sourceObject.originalHomeTeamId ?? sourceObject.homeTeamId,
      originalAwayTeamId: sourceObject.originalAwayTeamId ?? sourceObject.awayTeamId,
      homeTeamId: sourceObject.homeTeamId,
      homeTeamName: sourceObject.homeTeamName,
      homeTeamOrganisationId: sourceObject.homeTeamOrganisationId,
      awayTeamId: sourceObject.awayTeamId,
      awayTeamName: sourceObject.awayTeamName,
      awayTeamOrganisationId: sourceObject.awayTeamOrganisationId,
      competitionDivisionGradeId: sourceObject.competitionDivisionGradeId,
      isLocked: 1,
    };
    let customTargetObject = {
      drawsId: sourceObject.drawsId,
      venueId: sourceObject.venueId,
      originalHomeTeamId: targetObject.originalHomeTeamId ?? targetObject.homeTeamId,
      originalAwayTeamId: targetObject.originalAwayTeamId ?? targetObject.awayTeamId,
      homeTeamId: targetObject.homeTeamId,
      homeTeamOrganisationId: targetObject.homeTeamOrganisationId,
      homeTeamName: targetObject.homeTeamName,
      awayTeamId: targetObject.awayTeamId,
      awayTeamName: targetObject.awayTeamName,
      awayTeamOrganisationId: targetObject.awayTeamOrganisationId,
      competitionDivisionGradeId: targetObject.competitionDivisionGradeId,
      isLocked: 1,
    };

    if(checkTargetedVenueHomeForAwayTeam(
      this.props.drawsState,
      customTargetObject.venueId,
      customTargetObject,
    )) {
      customTargetObject = swapHomeAndAwayTeam(customTargetObject);
    }

    if(checkTargetedVenueHomeForAwayTeam(
      this.props.drawsState,
      customSourceObject.venueId,
      customSourceObject,
    )) {
      customSourceObject = swapHomeAndAwayTeam(customSourceObject);
    }

    const newSourceObject = { ...sourceObject, ...customTargetObject };
    const newTargetObject = { ...targetObject, ...customSourceObject };

    this.updateEditDrawArray(customSourceObject);
    this.updateEditDrawArray(customTargetObject);

    const sourceXIndex = sourceIndexArray[0];
    const sourceYIndex = sourceIndexArray[1];
    const targetXIndex = targetIndexArray[0];
    const targetYIndex = targetIndexArray[1];

    Object.keys(DrawConstant.switchDrawNameFields).forEach(
      key => (newSourceObject[key] = customTargetObject[key] ?? targetObject[key]),
    );

    Object.keys(DrawConstant.switchDrawNameFields).forEach(
      key => (newTargetObject[key] = customSourceObject[key] ?? sourceObject[key]),
    );

    drawData[sourceXIndex].slotsArray[sourceYIndex] = newSourceObject;
    drawData[targetXIndex].slotsArray[targetYIndex] = newTargetObject;
    //this.props.updateCompetitionDrawsSwapLoadAction();
    this.setState({ redraw: true });
  };

  ///////update the competition draws on  swapping and hitting update Apis if one has N/A(null)
  updateCompetitionNullDraws = (
    sourceObject,
    targetObject,
    sourceIndexArray,
    targetIndexArray,
    drawData,
    round_Id,
  ) => {
    let updatedKey = this.props.firstTimeCompId === '-1' || this.props.filterDates ? 'all' : 'add';
    let postData = null;
    let movedFixture;

    const newSourceObject = JSON.parse(JSON.stringify({
      ...targetObject,
      originalHomeTeamId: targetObject.originalHomeTeamId ?? targetObject.homeTeamId,
      originalAwayTeamId: targetObject.originalAwayTeamId ?? targetObject.awayTeamId,
    }));
    let newTargetObject = JSON.parse(JSON.stringify({
      ...sourceObject,
      originalHomeTeamId: sourceObject.originalHomeTeamId ?? sourceObject.homeTeamId,
      originalAwayTeamId: sourceObject.originalAwayTeamId ?? sourceObject.awayTeamId,
    }));

    if (sourceObject.drawsId == null) {
      movedFixture = newSourceObject;
      postData = {
        drawsId: targetObject.drawsId,
        originalHomeTeamId: newSourceObject.originalHomeTeamId,
        originalAwayTeamId: newSourceObject.originalAwayTeamId,
        venueCourtId: sourceObject.venueCourtId,
        venueId: sourceObject.venueId,
        matchDate: sourceObject.matchDate,
        startTime: sourceObject.startTime,
        endTime: getEndTime(sourceObject.matchDate, targetObject.minuteDuration),
      };
      if (targetObject.outOfRoundDate === 1 || targetObject.outOfCompetitionDate === 1) {
        postData.outOfRoundDate = sourceObject.outOfRoundDate;
        postData.outOfCompetitionDate = sourceObject.outOfCompetitionDate;
      }
    } else {
      movedFixture = newTargetObject;
      postData = {
        drawsId: sourceObject.drawsId,
        originalHomeTeamId: newTargetObject.originalHomeTeamId,
        originalAwayTeamId: newTargetObject.originalAwayTeamId,
        venueCourtId: targetObject.venueCourtId,
        venueId: targetObject.venueId,
        matchDate: targetObject.matchDate,
        startTime: targetObject.startTime,
        endTime: getEndTime(targetObject.matchDate, sourceObject.minuteDuration),
      };
      if (sourceObject.outOfRoundDate === 1 || sourceObject.outOfCompetitionDate === 1) {
        postData.outOfRoundDate = targetObject.outOfRoundDate;
        postData.outOfCompetitionDate = targetObject.outOfCompetitionDate;
      }
    }

    const targetVenueId = postData.venueId;

    const isTargetedVenueHomeForAwayTeam = checkTargetedVenueHomeForAwayTeam(
      this.props.drawsState,
      targetVenueId,
      movedFixture,
    );
    const sourceXIndex = sourceIndexArray[0];
    const sourceYIndex = sourceIndexArray[1];
    const targetXIndex = targetIndexArray[0];
    const targetYIndex = targetIndexArray[1];

    if (isTargetedVenueHomeForAwayTeam) {
      Object.assign(movedFixture, swapHomeAndAwayTeam(movedFixture));

      postData.homeTeamId = movedFixture.homeTeamId;
      postData.awayTeamId = movedFixture.awayTeamId;
    }

    this.updateEditDrawArray(postData);

    Object.keys(DrawConstant.switchDrawTimeFields).forEach(
      key => (newSourceObject[key] = sourceObject[key]),
    );
    Object.keys(DrawConstant.switchDrawTimeFields).forEach(
      key => (newTargetObject[key] = targetObject[key]),
    );

    drawData[sourceXIndex].slotsArray[sourceYIndex] = newSourceObject;
    drawData[targetXIndex].slotsArray[targetYIndex] = newTargetObject;

    this.setState({ redraw: true });
  };

  moveNotInDrawToEmptySlot = (
    sourceObject,
    targetObject,
    sourceIndexArray,
    targetIndexArray,
    roundData,
    roundId,
  ) => {
    let drawData = roundData.draws;
    let notInDraws = roundData.notInDraws;
    let postData = {
      drawsId: sourceObject.drawsId,
      venueCourtId: targetObject.venueCourtId,
      matchDate: targetObject.matchDate,
      startTime: targetObject.startTime,
      endTime: getEndTime(targetObject.matchDate, sourceObject.minuteDuration),
      outOfRoundDate: 0,
      outOfCompetitionDate: 0,
    };

    this.updateEditDrawArray(postData);

    const sourceXIndex = sourceIndexArray[0];
    const targetXIndex = targetIndexArray[0];
    const targetYIndex = targetIndexArray[1];
    const newTargetObj = JSON.parse(JSON.stringify(sourceObject));
    Object.keys(DrawConstant.switchDrawTimeFields).forEach(
      key => (newTargetObj[key] = targetObject[key]),
    );
    notInDraws.splice(sourceXIndex, 1);
    drawData[targetXIndex].slotsArray[targetYIndex] = newTargetObj;
    this.updateOriginalRoundsArray(roundId, newTargetObj);
    this.setState({ redraw: true });
  };
  updateOriginalRoundsArray = (roundId, slotObject) => {
    //remove not in draw from array after moved
    let roundsData = this.props.drawsState.getRoundsDrawsdata;
    let roundIndex = 0;
    if (this.props.drawsState.isCompByRound) {
      roundIndex = roundsData.findIndex(x => x.roundId === roundId);
    }
    const notInDraws = roundsData[roundIndex].notInDraws;
    let slotIndex = notInDraws.findIndex(x => x.drawsId == slotObject.drawsId);
    if (slotIndex > -1) {
      notInDraws.splice(slotIndex, 1);
    }
  };
  updateEditDrawArray = draw => {
    const editdraw = this.props.editedDraw;
    const drawExistsIndex = editdraw.draws.findIndex(d => d.drawsId == draw.drawsId);
    if (drawExistsIndex > -1) {
      editdraw.draws[drawExistsIndex] = { ...editdraw.draws[drawExistsIndex], ...draw };
    } else {
      editdraw.draws.push(draw);
    }
    if (this.props.onDrawUpdated) {
      this.props.onDrawUpdated();
    }
  };
  // getColumnData = (indexArray, drawData) => {
  //     let xIndex=indexArray[0];
  //     let yIndex = indexArray[1];
  //     let object = null;

  //     for (let i in drawData) {
  //         let slot = drawData[i].slotsArray[yIndex];
  //         if (slot.drawsId !== null) {
  //             object = slot;
  //             break;
  //         }
  //     }
  //     if(!object){
  //         //empty slot has incorrect start time
  //         object=drawData[xIndex].slotsArray[yIndex];
  //         this.correctWrongDate(object,yIndex);

  //     }
  //     return object;
  // };
  // correctWrongDate=(slot,slotIndex)=>{
  //     const slotDate = moment(slot.matchDate);
  //     const slotEnd = moment(getDate(slot.matchDate) + slot.endTime);
  //     const isCorrectStart = slotEnd.isAfter(slotDate);
  //     if(!isCorrectStart){
  //         if(this.props.drawsState.getRoundsDrawsdata.length>0){
  //             const dateAxis=this.props.drawsState.getRoundsDrawsdata[0].dateNewArray[slotIndex];
  //             slot.matchDate=dateAxis.date;
  //             slot.startTime=moment(slot.matchDate).format('HH:mm');
  //             slot.endTime=dateAxis.endTime;
  //         }
  //     }
  // }

  slotCell = ({ columnIndex, rowIndex, style }) => {
    let dateItem = this.props.dateItem;
    let isAxisInverted = this.props.isAxisInverted;
    let disabledStatus = this.props.competitionStatus == 1;
    let topMargin = 0;
    let index = rowIndex;
    let slotIndex = columnIndex;
    if (isAxisInverted) {
      index = columnIndex;
      slotIndex = rowIndex;
    }
    let courtData = dateItem.draws[index]; //courts
    if (!courtData) return null;

    let slotObject = courtData.slotsArray[slotIndex];
    if (
      !showOnlySelectedOrganisations(
        slotObject,
        this.props.showOnlyFilters,
        this.props.notCheckedOrganisations,
      )
    ) {
      return null;
    }
    if (
      !showOnlySelectedDivisions(
        slotObject,
        this.props.showOnlyFilters,
        this.props.drawsState.unCheckedGradeIds,
      )
    ) {
      return null;
    }
    const textColor =
      this.props.checkColor(slotObject) === '#999999' ? '#FFFFFF' : slotObject.fontColor;
    let freeText = slotObject.isUnavailable ? AppConstants.unavailable : AppConstants.free;
    disabledStatus = disabledStatus || slotObject.isUnavailable;
    let hasSubCourtDivision = this.props.drawsState.hasSubCourtDivision;
    return (
      <div style={style}>
        <span
          //style={{ left: leftMargin, top: topMargin }}
          className={slotObject.duplicate ? 'borderDuplicate' : 'border'}
        />
        <div
          onMouseDown={this.props.slotObjectMouseDown}
          onTouchStart={this.props.slotObjectMouseDown}
          onMouseUp={this.props.drawsFieldUp}
          onTouchEnd={this.props.drawsFieldUp}
          onDragEnd={this.props.drawsFieldUp}
          onMouseEnter={e => this.props.slotObjectMouseEnter(e, slotObject)}
          onMouseLeave={this.props.slotObjectMouseLeave}
          className={`box purple-bg ${slotObject.duplicate ? 'boxDuplicate' : ''} ${
            slotObject.colorCode == '#EA0628' ? 'boxPink' : ''
          }`}
          style={{
            backgroundColor: this.props.checkColor(slotObject),
            //left: leftMargin,
            top: topMargin,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            cursor: disabledStatus && 'no-drop',
          }}
        >
          {this.props.firstTimeCompId == '-1' || this.props.filterDates ? (
            <Swappable
              // duplicateDropzoneId={slotObject.duplicate && "duplicateDropzoneId"}
              // duplicateDragableId={slotObject.duplicate && "duplicateDragableId"}
              // duplicateDropzoneId={"boxDuplicate"}
              id={index.toString() + ':' + slotIndex.toString() + ':' + '1'}
              content={1}
              swappable={this.props.checkSwap(slotObject)}
              onSwap={(source, target) => this.onSwap(source, target, dateItem, '1')}
              isCurrentSwappable={(source, target) =>
                this.checkCurrentSwapObjects(source, target, dateItem.draws)
              }
            >
              {slotObject.drawsId != null ? (
                this.props.isDivisionNameShow ? (
                  <span className={'no-pointer'} style={{ color: textColor }}>
                    {slotObject.divisionName + '-' + slotObject.gradeName}
                  </span>
                ) : (
                  <span className={'no-pointer'} style={{ color: textColor }}>
                    {slotObject.homeTeamName} <br />
                    {slotObject.awayTeamName}
                  </span>
                )
              ) : (
                <span>{freeText}</span>
              )}
            </Swappable>
          ) : (
            <Swappable
              duplicateDropzoneId={slotObject.duplicate && 'duplicateDropzoneId'}
              duplicateDragableId={slotObject.duplicate && 'duplicateDragableId'}
              id={index.toString() + ':' + slotIndex.toString() + ':' + dateItem.roundId.toString()}
              content={1}
              swappable={this.props.checkSwap(slotObject)}
              onSwap={(source, target) => this.onSwap(source, target, dateItem, dateItem.roundId)}
              isCurrentSwappable={(source, target) =>
                this.checkCurrentSwapObjects(source, target, dateItem.draws)
              }
            >
              {slotObject.drawsId != null ? (
                this.props.isDivisionNameShow ? (
                  <span className={'no-pointer'} style={{ color: textColor }}>
                    {slotObject.divisionName + '-' + slotObject.gradeName}
                  </span>
                ) : (
                  <span className={'no-pointer'} style={{ color: textColor }}>
                    {slotObject.homeTeamName} <br />
                    {slotObject.awayTeamName}
                  </span>
                )
              ) : (
                <span>{freeText}</span>
              )}
            </Swappable>
          )}
        </div>

        <DrawActionMenu
          {...this.props}
          slotObject={slotObject}
          disabledStatus={disabledStatus}
          courtData={courtData}
          dateItem={dateItem}
          topMargin={topMargin + 50}
          menuMarginLeft={0}
          isAxisInverted={isAxisInverted && isVenueFieldConfigurationEnabled && hasSubCourtDivision}
        ></DrawActionMenu>
      </div>
    );
  };
  onScroll = ({
    horizontalScrollDirection,
    scrollLeft,
    scrollTop,
    scrollUpdateWasRequested,
    verticalScrollDirection,
  }) => {
    // horizontalDirection and verticalDirection are either "forward" or "backward".
    // scrollLeft and scrollTop are numbers.
    if (this.gridRef.current) {
      if (!this.props.isAxisInverted && this.childHeaderRef.current.dateHeaderRef) {
        this.childHeaderRef.current.dateHeaderRef.current.scrollLeft = scrollLeft;
      } else if (this.props.isAxisInverted && this.dateHeaderRef.current) {
        this.dateHeaderRef.current.scrollLeft = scrollLeft;
      }
      if (this.stickyColumnRef.current) {
        this.stickyColumnRef.current.scrollTop = scrollTop;
      }
    }
  };
  render() {
    let dateItem = this.props.dateItem;
    //let dateTimeEditable = this.props.dateTimeEditable;
    let drawListExpanded = this.props.drawListExpanded;
    let filterEnable = this.props.filterEnable;
    let isAxisInverted = this.props.isAxisInverted;
    let minWidth = 1070;
    let notInDrawWidth = 125;
    let containerWidth = Math.round(window.screen.width * 0.75) - 95;
    if (containerWidth < minWidth) {
      containerWidth = minWidth;
    }
    let gridHeight = 600;
    if (!isAxisInverted && drawListExpanded) {
      gridHeight = dateItem.draws.length * 70;
      let zoomLevel = (window.outerWidth - 10) / window.innerWidth;
      containerWidth = Math.floor(window.screen.width / zoomLevel) * 0.75 - 95;
      if (!filterEnable) {
        containerWidth = Math.floor(window.screen.width / zoomLevel) - 300;
      }
    }

    let fixedColumnsArray = dateItem.draws;
    let firstColumnWidth = 70;
    let columnCount = dateItem.dateNewArray.length;
    let rowCount = dateItem.draws.length;
    if (isAxisInverted) {
      fixedColumnsArray = dateItem.dateNewArray;
      firstColumnWidth = 140;
      columnCount = dateItem.draws.length;
      rowCount = dateItem.dateNewArray.length;
    }
    let hasVerticalScrollbar = rowCount * 70 > gridHeight;
    let hasNotInDraw = dateItem.notInDraws.length > 0;
    if (hasNotInDraw) {
      containerWidth = containerWidth - notInDrawWidth;
    }
    let gridWidth = containerWidth - firstColumnWidth;
    let hasHorizontalScrollbar = columnCount * 110 > gridWidth;
    let stickyColumnHeight = gridHeight;
    if (hasHorizontalScrollbar) {
      stickyColumnHeight = stickyColumnHeight - 15;
    }
    let scrollWidth = gridWidth;
    if (hasVerticalScrollbar) {
      scrollWidth = scrollWidth - 15;
    }
    return (
      <div className="d-flex">
        <NotInDrawFullCourt {...this.props}></NotInDrawFullCourt>
        <div>
          {isAxisInverted ? (
            <div
              className="draw-header"
              style={{
                width: containerWidth,
              }}
            >
              <div
                className="position-relative"
                style={{
                  left: 140,
                  width: scrollWidth,
                  overflowX: 'hidden',
                  willChange: 'transform',
                }}
                ref={this.dateHeaderRef}
              >
                <div className="d-inline-flex ">
                  {dateItem.draws &&
                    dateItem.draws.map((courtData, index) => {
                      let width = 110;

                      return (
                        <div
                          className="draw-date-text"
                          key={'court' + index}
                          style={{ width: width }}
                          title={courtData.venueShortName + '-' + courtData.venueCourtName}
                        >
                          {courtData.venueShortName + '-' + courtData.venueCourtNumber}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <DrawsDateHeader
              dateItem={this.props.dateItem}
              dateTimeEditable={this.props.dateTimeEditable}
              ref={this.childHeaderRef}
              updateMultiDrawsCourtTimings={this.props.updateMultiDrawsCourtTimings}
              updateEditDrawArray={this.updateEditDrawArray}
              containerWidth={containerWidth}
              firstColumnWidth={firstColumnWidth}
              hasVerticalScrollbar={hasVerticalScrollbar}
            ></DrawsDateHeader>
          )}
          <div
            className="main-canvas Draws draw-scroll-container"
            style={{
              width: containerWidth,
              minWidth: minWidth,
              height: gridHeight,
              display: 'flex',
            }}
          >
            <div
              style={{ height: stickyColumnHeight, width: firstColumnWidth, overflowY: 'hidden' }}
              ref={this.stickyColumnRef}
            >
              {fixedColumnsArray.map((columnValue, fRowIndex) => {
                let rowHeight = 70;
                if (isAxisInverted) {
                  let slotIndex = fRowIndex;
                  let matchDate = columnValue.date;
                  let notInDraw = columnValue.notInDraw;
                  let startTime = columnValue.startTime;
                  return (
                    <div style={{ height: rowHeight, width: firstColumnWidth }}>
                      <div
                        className="sr-no align-items-end"
                        style={{
                          height: rowHeight - 7,
                          lineHeight: rowHeight - 7 + 'px',
                          width: 'fit-content',
                          top: -10,
                        }}
                      >
                        <span className="venueCourt-text">
                          {notInDraw == false
                            ? checkDate(matchDate, slotIndex, dateItem.dateNewArray) +
                              ' ' +
                              startTime
                            : 'Not in draw'}
                        </span>
                      </div>
                    </div>
                  );
                } else {
                  let courtData = columnValue; //courts
                  if (!courtData) return null;
                  return (
                    <div style={{ height: rowHeight, width: firstColumnWidth }}>
                      <div className="sr-no" style={{ height: 63 }}>
                        <div className="venueCourt-text-div">
                          <span
                            className="venueCourt-text"
                            title={courtData.venueShortName + '-' + courtData.venueCourtName}
                          >
                            {courtData.venueShortName + '-' + courtData.venueCourtNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
            <VariableSizeGrid
              ref={this.gridRef}
              columnCount={columnCount}
              columnWidth={index => {
                return 110;
              }}
              height={gridHeight}
              rowCount={rowCount}
              rowHeight={index => {
                return 70;
              }}
              width={gridWidth}
              onScroll={this.onScroll}
            >
              {this.slotCell}
            </VariableSizeGrid>
          </div>
        </div>
      </div>
    );
  }
}

export default MultiFieldDrawsFullCourt;
