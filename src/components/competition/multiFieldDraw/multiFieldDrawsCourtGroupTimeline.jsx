//import { Popover } from "antd";
import { DatePicker, Layout, Menu, Modal, Select } from 'antd';
import React, { Component } from 'react';
import moment from 'moment';
import Swappable from '../../../customComponents/SwappableComponentTimeline';
import {
  checkDate,
  getDate,
  getDiffBetweenStartAndEnd,
  getNextEventForSwap,
  showOnlySelectedDivisions,
  showOnlySelectedOrganisations,
} from '../../../util/drawUtil';
import { NavLink } from 'react-router-dom';
import DrawConstant from 'themes/drawConstant';
//import '../draws.scss';
const ONE_MIN_WIDTH = 2;
const ONE_HOUR_IN_MIN = 60;

class MultiFieldDrawsCourtGroupTimeline extends Component {
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
    let slotTopMargin = this.props.slotTopMargin;
    let disabledStatus = this.props.competitionStatus == 1;
    let groupSlots = this.props.groupSlots;

    let currentHeightBase = this.props.currentHeightBase;
    let isDayInPast = this.props.isDayInPast;
    let timeRestrictionsSchedule = this.props.timeRestrictionsSchedule;
    let isAxisInverted = this.props.isAxisInverted;
    let fieldItemDate = this.props.fieldItemDate;
    let startDayTime = this.props.startDayTime;

    let topMargin = 0;

    let heightBase = 30;

    topMargin = slotTopMargin;

    let slotHeight = heightBase;

    return groupSlots.map((slotObject, groupIndex) => {
      if (
        getDate(slotObject.matchDate) === fieldItemDate &&
        (slotObject.drawsId || slotObject.subCourt)
      ) {
        // for left margin the event start inside the day
        const startWorkingDayTime = moment(fieldItemDate + startDayTime);
        const startTimeEvent = moment(slotObject.matchDate);

        const diffTimeStartEvent =
          startTimeEvent.diff(startWorkingDayTime, 'minutes') * ONE_MIN_WIDTH;
        // for width of the event
        const endTimeEvent = moment(fieldItemDate + slotObject.endTime);
        const diffTimeEventDuration = endTimeEvent.diff(startTimeEvent, 'minutes') * ONE_MIN_WIDTH;

        let slotIndex = courtData.slotsArray.indexOf(slotObject);
        if (slotIndex !== 0) {
          leftMargin += 110;
        }
        if (slotIndex == 0) {
          leftMargin = 70;
        }
        let slotKey = ''; //"slot" + slotIndex;
        if (slotObject.slotId) {
          slotKey += slotObject.slotId;
        }
        var childArray = [0];
        // if (slotObject.childSlots && slotObject.childSlots.length > 4) {
        //     childArray.push(4);
        // }
        if (slotObject.childSlots) {
          let totalHeightUnit = slotObject.childSlots
            .map(s => DrawConstant.subCourtHeightUnit[s.subCourt])
            .reduce((a, b) => {
              return a + b;
            }, 0);
          if (totalHeightUnit > 4) {
            childArray.push(4);
          }
        }
        let barHeightClass = (isAxisInverted ? 'w' : 'h') + '-' + 100 / childArray.length;
        let barStartIndex = -1;
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
        return (
          <div
            key={slotKey}
            style={{
              position: 'absolute',
              ...(isAxisInverted
                ? {
                    left: 0,
                    top: diffTimeStartEvent,
                  }
                : {
                    left: diffTimeStartEvent,
                    top: 0,
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
              onMouseEnter={e => this.props.slotObjectMouseEnter(e, slotObject, true)}
              onMouseLeave={this.props.slotObjectMouseLeave}
              className={'box-draws purple-bg'}
              style={{
                backgroundColor: '#999999',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                cursor:
                  timeRestrictionsSchedule.isUnavailable || isDayInPast
                    ? 'not-allowed'
                    : disabledStatus && 'no-drop',
                opacity: isDayInPast ? 0.7 : 1,
                ...(isAxisInverted
                  ? {
                      width: currentHeightBase,
                      minWidth: currentHeightBase,
                      height: diffTimeEventDuration,
                    }
                  : {
                      width: diffTimeEventDuration,
                      minWidth: diffTimeEventDuration,
                      height: currentHeightBase,
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
                  <div
                    className={`d-flex align-items-center w-100 ${
                      isAxisInverted ? 'flex-row' : 'flex-column'
                    }`}
                  >
                    {childArray.map((columnindex, rindex) => {
                      let totalHeightUnit = 0;
                      let barRowClass = barHeightClass;
                      if (isAxisInverted) {
                        barRowClass += ' h-100 flex-column';
                      } else {
                        barRowClass += ' w-100';
                      }
                      return (
                        <div
                          key={'barRow' + rindex}
                          className={`d-flex justify-content-between align-items-center no-pointer ${barRowClass}`}
                        >
                          {slotObject.childSlots.map((childSlot, cindex) => {
                            if (totalHeightUnit < 4 && cindex > barStartIndex) {
                              barStartIndex = cindex;
                              let widthUnit = '100%';
                              let barBgClass = 'bg-white';
                              if (childSlot.subCourt) {
                                let slotHeightUnit =
                                  DrawConstant.subCourtHeightUnit[childSlot.subCourt];
                                totalHeightUnit += slotHeightUnit;
                                widthUnit = slotHeightUnit * 25 + '%';
                                if (!childSlot.drawsId) {
                                  barBgClass = 'bg-grey';
                                }
                              }
                              return (
                                <div
                                  className={`flex-col`}
                                  key={childSlot.homeTeamId + '' + cindex}
                                  style={{
                                    height: isAxisInverted ? 15 : 5,
                                    width: isAxisInverted ? 5 : 15,
                                    margin: 2.5,
                                    flexBasis: widthUnit,
                                    backgroundColor: this.props.checkColor(childSlot),
                                  }}
                                />
                              );
                            }
                          })}
                        </div>
                      );
                    })}
                  </div>
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
                  <div
                    className={`d-flex align-items-center w-100 ${
                      isAxisInverted ? 'flex-row' : 'flex-column'
                    }`}
                  >
                    {childArray.map((columnindex, rindex) => {
                      let totalHeightUnit = 0;
                      let barRowClass = barHeightClass;
                      if (isAxisInverted) {
                        barRowClass += ' h-100 flex-column';
                      } else {
                        barRowClass += ' w-100';
                      }
                      return (
                        <div
                          key={'barRow' + rindex}
                          className={`d-flex justify-content-between align-items-center no-pointer ${barRowClass}`}
                        >
                          {slotObject.childSlots.map((childSlot, cindex) => {
                            if (totalHeightUnit < 4 && cindex > barStartIndex) {
                              barStartIndex = cindex;
                              let widthUnit = '100%';
                              let barBgClass = 'bg-white';
                              if (childSlot.subCourt) {
                                let slotHeightUnit =
                                  DrawConstant.subCourtHeightUnit[childSlot.subCourt];
                                totalHeightUnit += slotHeightUnit;
                                widthUnit = slotHeightUnit * 25 + '%';
                                if (!childSlot.drawsId) {
                                  barBgClass = 'bg-grey';
                                }
                              }
                              return (
                                <div
                                  className={`flex-col`}
                                  key={childSlot.homeTeamId + '' + cindex}
                                  style={{
                                    height: isAxisInverted ? 15 : 5,
                                    width: isAxisInverted ? 5 : 15,
                                    margin: 2.5,
                                    flexBasis: widthUnit,
                                    backgroundColor: this.props.checkColor(childSlot),
                                  }}
                                />
                              );
                            }
                          })}
                        </div>
                      );
                    })}
                  </div>
                </Swappable>
              )}
            </div>
          </div>
        );
      }
    });
  }
}

export default MultiFieldDrawsCourtGroupTimeline;
