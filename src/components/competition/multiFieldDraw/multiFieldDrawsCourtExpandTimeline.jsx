import { DatePicker, Layout, Menu, Modal, Select } from 'antd';
import moment from 'moment';
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import Swappable from '../../../customComponents/SwappableComponentTimeline';
import AppImages from '../../../themes/appImages';
import DrawConstant from '../../../themes/drawConstant';
import {
  checkDate,
  getDate,
  getDiffBetweenStartAndEnd,
  getNextEventForSwap,
  showOnlySelectedDivisions,
  showOnlySelectedOrganisations,
} from '../../../util/drawUtil';
import DrawActionMenuTimeline from './drawActionMenuTimeline';
//import '../draws.scss';
const ONE_MIN_WIDTH = 2;
const ONE_HOUR_IN_MIN = 60;
const { SubMenu } = Menu;

class MultiFieldDrawsCourtExpandTimeline extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(nextProps) {}

  componentDidMount() {}

  render() {
    let dateItem = this.props.dateItem;
    let index = this.props.index;
    let courtData = this.props.courtData;
    let leftMargin = this.props.leftMargin;
    let slotTopMargin = 0;
    let subCourtTopMargin = slotTopMargin;
    let currentHeightBase = this.props.currentHeightBase;
    let isDayInPast = this.props.isDayInPast;
    let timeRestrictionsSchedule = this.props.timeRestrictionsSchedule;
    let disabledStatus = this.props.competitionStatus == 1;
    let isAxisInverted = this.props.isAxisInverted;
    let fieldItemDate = this.props.fieldItemDate;
    let allSubCourts = this.props.allSubCourts;
    let startDayTime = this.props.startDayTime;
    let groupStartSlot = null;

    return courtData.slotsArray.map((slotObject, slotIndex) => {
      if (getDate(slotObject.matchDate) === fieldItemDate && slotObject.drawsId) {
        // for left margin the event start inside the day
        const startWorkingDayTime = moment(fieldItemDate + startDayTime);
        const startTimeEvent = moment(slotObject.matchDate);

        const diffTimeStartEvent =
          startTimeEvent.diff(startWorkingDayTime, 'minutes') * ONE_MIN_WIDTH;
        // for width of the event
        const endTimeEvent = moment(fieldItemDate + slotObject.endTime);
        const diffTimeEventDuration = endTimeEvent.diff(startTimeEvent, 'minutes') * ONE_MIN_WIDTH;

        let isSameTimeSlot = false;
        let slotHeightUnit = 8;
        if (slotIndex !== 0) {
          if (slotObject.subCourt && allSubCourts.includes(slotObject.subCourt)) {
            slotHeightUnit = DrawConstant.subCourtHeightUnit[slotObject.subCourt];
            let previousSlot = courtData.slotsArray[slotIndex - 1];
            isSameTimeSlot =
              previousSlot.drawsId &&
              previousSlot.matchDate == slotObject.matchDate &&
              previousSlot.outOfRoundDate == slotObject.outOfRoundDate;
            if (!isSameTimeSlot && groupStartSlot && slotObject.drawsId) {
              if (
                previousSlot.subCourt &&
                !previousSlot.drawsId &&
                !previousSlot.isUnavailable &&
                previousSlot.childSlots &&
                previousSlot.childSlots.length > 0
              ) {
                //previousslot is empty, reset position
                groupStartSlot = previousSlot;
                leftMargin += 110;
                subCourtTopMargin = slotTopMargin;
              }
              //check parent for different start time for different divisions
              let childIndex = groupStartSlot.childSlots.findIndex(
                s => s.drawsId == slotObject.drawsId,
              );
              if (childIndex > 0) {
                isSameTimeSlot = true;
                previousSlot = groupStartSlot.childSlots[childIndex - 1];
              }
            }
            if (isSameTimeSlot) {
              subCourtTopMargin +=
                currentHeightBase * DrawConstant.subCourtHeightUnit[previousSlot.subCourt];
            }
            if (slotObject.childSlots && slotObject.childSlots.length > 0) {
              groupStartSlot = slotObject;
            }
          }
          if (!isSameTimeSlot) {
            leftMargin += 110;
            subCourtTopMargin = slotTopMargin;
          }
        }
        if (slotIndex == 0) {
          leftMargin = 70;
          if (slotObject.subCourt && allSubCourts.includes(slotObject.subCourt)) {
            slotHeightUnit = DrawConstant.subCourtHeightUnit[slotObject.subCourt];
          }
        }
        let slotKey = ''; //"slot" + slotIndex;
        if (slotObject.slotId) {
          slotKey += slotObject.slotId;
        }

        let topMargin = subCourtTopMargin;

        let slotHeight = currentHeightBase - 14;
        let slotHasSubCourt = true;
        if (slotHasSubCourt) {
          slotHeight = currentHeightBase * slotHeightUnit - 21; // minus box exception height and margin
        }
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
        return (
          <div
            key={slotKey}
            style={{
              position: 'absolute',
              ...(isAxisInverted
                ? {
                    left: topMargin,
                    top: diffTimeStartEvent,
                  }
                : {
                    left: diffTimeStartEvent,
                    top: topMargin,
                  }),
            }}
          >
            <div
              id={slotObject.drawsId}
              onMouseDown={this.props.slotObjectMouseDown}
              onTouchStart={this.props.slotObjectMouseDown}
              onDragOver={() => this.props.slotObjectDragOver(slotObject)}
              onTouchMove={() => this.props.slotObjectDragOver(slotObject)}
              onDragLeave={() => {
                this.props.setTooltipSwappableTime();
              }}
              onMouseEnter={e => this.props.slotObjectMouseEnter(e, slotObject)}
              onMouseLeave={this.props.slotObjectMouseLeave}
              className={'box-draws purple-bg'}
              style={{
                backgroundColor: this.props.checkColor(slotObject),
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                cursor:
                  timeRestrictionsSchedule.isUnavailable || isDayInPast
                    ? 'not-allowed'
                    : disabledStatus && 'no-drop',
                opacity: isDayInPast ? 0.7 : 1,
                ...(isAxisInverted
                  ? {
                      width: slotHeight,
                      minWidth: slotHeight,
                      height: diffTimeEventDuration,
                    }
                  : {
                      width: diffTimeEventDuration,
                      minWidth: diffTimeEventDuration,
                      height: slotHeight,
                    }),
              }}
            >
              {this.props.firstTimeCompId == '-1' || this.props.filterDates ? (
                <Swappable
                  id={index.toString() + ':' + slotIndex.toString() + ':' + '1'}
                  content={1}
                  swappable={
                    timeRestrictionsSchedule.isUnavailable || isDayInPast || disabledStatus
                      ? false
                      : this.props.checkSwap(slotObject)
                  }
                  onSwap={(source, target) =>
                    this.props.onSwap(source, target, dateItem.draws, dateItem.roundId)
                  }
                  isCurrentSwappable={(source, target) =>
                    isDayInPast || disabledStatus
                      ? false
                      : this.props.checkCurrentSwapObjects(source, target, dateItem.draws)
                  }
                >
                  {this.props.isDivisionNameShow ? (
                    <span
                      className="text-overflow"
                      style={{
                        writingMode: isAxisInverted && slotHeightUnit === 1 ? 'tb' : 'unset',
                        color: textColor,
                      }}
                    >
                      {slotObject.divisionName + '-' + slotObject.gradeName}
                    </span>
                  ) : (
                    <span
                      className="text-overflow"
                      style={{
                        writingMode: isAxisInverted && slotHeightUnit === 1 ? 'tb' : 'unset',
                        color: textColor,
                      }}
                    >
                      {slotObject.homeTeamName} {slotHeightUnit > 1 ? <br /> : ' V '}
                      {slotObject.awayTeamName}
                    </span>
                  )}
                </Swappable>
              ) : (
                <Swappable
                  id={
                    index.toString() +
                    ':' +
                    slotIndex.toString() +
                    ':' +
                    dateItem.roundId.toString()
                  }
                  content={1}
                  swappable={
                    timeRestrictionsSchedule.isUnavailable || isDayInPast || disabledStatus
                      ? false
                      : this.props.checkSwap(slotObject)
                  }
                  onSwap={(source, target) =>
                    this.props.onSwap(source, target, dateItem.draws, dateItem.roundId)
                  }
                  isCurrentSwappable={(source, target) =>
                    isDayInPast || disabledStatus
                      ? false
                      : this.props.checkCurrentSwapObjects(source, target, dateItem.draws)
                  }
                >
                  {this.props.isDivisionNameShow ? (
                    <span
                      className="text-overflow"
                      style={{
                        writingMode: isAxisInverted && slotHeightUnit === 1 ? 'tb' : 'unset',
                        color: textColor,
                      }}
                    >
                      {slotObject.divisionName + '-' + slotObject.gradeName}
                    </span>
                  ) : (
                    <span
                      className="text-overflow"
                      style={{
                        writingMode: isAxisInverted && slotHeightUnit === 1 ? 'tb' : 'unset',
                        color: textColor,
                      }}
                    >
                      {slotObject.homeTeamName} {slotHeightUnit > 1 ? <br /> : ' V '}
                      {slotObject.awayTeamName}
                    </span>
                  )}
                </Swappable>
              )}
            </div>
            <DrawActionMenuTimeline
              slotObject={slotObject}
              disabledStatus={disabledStatus}
              courtData={courtData}
              dateItem={dateItem}
              timeRestrictionsSchedule={timeRestrictionsSchedule}
              isDayInPast={isDayInPast}
              isAxisInverted={isAxisInverted}
              menuMarginLeft={slotHeight}
              {...this.props}
            ></DrawActionMenuTimeline>
          </div>
        );
      }
    });
  }
}

export default MultiFieldDrawsCourtExpandTimeline;
