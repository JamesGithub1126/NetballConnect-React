import { DatePicker, Layout, Menu, message, Modal, Select } from 'antd';
import moment from 'moment';
import React, { Component } from 'react';
import AppConstants from 'themes/appConstants';
import { getDraws_round, getGlobalYear, getOwn_competition } from 'util/sessionStorage';
import DrawConstant from '../../../themes/drawConstant';
import {
  getDate,
  getNextEventForSubCourtSwap,
  sortSlot,
  getAllowedSubcourtsForField,
} from '../../../util/drawUtil';
import '../draws.scss';
import MultiFieldDrawsCourtExpandTimeline from './multiFieldDrawsCourtExpandTimeline';
import MultiFieldDrawsCourtGroupTimeline from './multiFieldDrawsCourtGroupTimeline';

const { confirm } = Modal;

const ONE_MIN_WIDTH = 2;
const ONE_HOUR_IN_MIN = 60;

class MultiFieldDrawsSubCourtTimeline extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(nextProps) {}

  componentDidMount() {}

  checkCurrentSwapObjects = (source, target, drawData) => {
    const sourceIndexArray = source.split(':');
    const targetIndexArray = target.split(':');
    const sourceXIndex = sourceIndexArray[0];
    const sourceYIndex = sourceIndexArray[1];
    const targetXIndex = targetIndexArray[0];
    const targetYIndex = targetIndexArray[1];
    if (sourceXIndex === targetXIndex && sourceYIndex === targetYIndex) {
      return false;
    }

    if (!!drawData[sourceXIndex].isExpanded != !!drawData[targetXIndex].isExpanded) {
      return false;
    }
    const sourceObject = drawData[sourceXIndex].slotsArray[sourceYIndex];
    const targetObject = drawData[targetXIndex].slotsArray[targetYIndex];

    if (sourceObject.drawsId == null && targetObject.drawsId == null) {
      return false;
    }

    const sourceDraws = drawData[sourceXIndex];
    const targetDraws = drawData[targetXIndex];

    // for end time calculations
    const sourceObjectDate = getDate(sourceObject.matchDate);
    const diffTimeSource = sourceObject.minuteDuration;

    const targetObjectDate = getDate(targetObject.matchDate);
    const diffTimeTarget = targetObject.minuteDuration;

    if (diffTimeSource != diffTimeTarget) {
      // define next slots with data for the swappable objects days
      const nextSource = getNextEventForSubCourtSwap(
        drawData[sourceXIndex].slotsArray,
        sourceObjectDate,
        sourceYIndex,
      );
      const nextTarget = getNextEventForSubCourtSwap(
        drawData[targetXIndex].slotsArray,
        targetObjectDate,
        targetYIndex,
      );

      // define if the swappable event finishes before next event or end of the working day
      const targetObjectRestrictionEnd = this.props.getDayTimeRestrictions(
        targetDraws,
        targetObjectDate,
      ).endTime;
      const sourceObjectRestrictionEnd = this.props.getDayTimeRestrictions(
        sourceDraws,
        sourceObjectDate,
      ).endTime;

      const sourceEndNew = moment(targetObject.matchDate).add(diffTimeSource, 'minutes');
      const startTimeNextTarget = nextTarget
        ? moment(nextTarget.matchDate)
        : targetObjectRestrictionEnd;
      const isStartNextSourceLater = startTimeNextTarget.isSameOrAfter(sourceEndNew);

      const targetEndNew = moment(sourceObject.matchDate).add(diffTimeTarget, 'minutes');
      const startTimeNextSource = nextSource
        ? moment(nextSource.matchDate)
        : sourceObjectRestrictionEnd;
      const isStartNextTargetLater = startTimeNextSource.isSameOrAfter(targetEndNew);

      // for case when next events starts before end of swappable ones
      if (!isStartNextTargetLater || !isStartNextSourceLater) {
        return false;
      }
    }
    if (drawData[sourceXIndex].isExpanded && drawData[targetXIndex].isExpanded) {
      // different duration is allowed for sub court, but should have the same start time
      let sourceSlotHeightUnit = 8;
      let targetSlotHeightUnit = 8;
      if (sourceObject.subCourt) {
        sourceSlotHeightUnit = DrawConstant.subCourtHeightUnit[sourceObject.subCourt];
      }
      if (targetObject.subCourt) {
        targetSlotHeightUnit = DrawConstant.subCourtHeightUnit[targetObject.subCourt];
      }
      if (sourceObject.drawsId !== null && targetObject.drawsId !== null) {
        if (sourceSlotHeightUnit != targetSlotHeightUnit) {
          //only allow same size swap, can be changed to allow if there is enough empty space
          return false;
        }
      }

      if (
        sourceObject.subCourt &&
        targetObject.subCourt &&
        sourceSlotHeightUnit != targetSlotHeightUnit
      ) {
        //no enough space
        return false;
      }
      if (sourceSlotHeightUnit == 8 && targetSlotHeightUnit != 8) {
        //not from whole empty court to subcourt
        return false;
      }
    }
    return true;
  };

  onSwap = (source, target, drawData, round_Id) => {
    this.props.setDraggingState({
      isDragging: false,
      tooltipSwappableTime: null,
    });
    const sourceIndexArray = source.split(':');
    const targetIndexArray = target.split(':');
    const sourceXIndex = sourceIndexArray[0];
    const sourceYIndex = sourceIndexArray[1];
    const targetXIndex = targetIndexArray[0];
    const targetYIndex = targetIndexArray[1];
    if (sourceXIndex === targetXIndex && sourceYIndex === targetYIndex) {
      return;
    }

    const sourceObject = drawData[sourceXIndex].slotsArray[sourceYIndex];
    const targetObject = drawData[targetXIndex].slotsArray[targetYIndex];

    // events end time calculations

    const diffTimeSource = sourceObject.minuteDuration;
    const newEndTimeSource = moment(targetObject.matchDate)
      .add(diffTimeSource, 'minutes')
      .format('HH:mm');

    const diffTimeTarget = targetObject.minuteDuration;
    const newEndTimeTarget = moment(sourceObject.matchDate)
      .add(diffTimeTarget, 'minutes')
      .format('HH:mm');
    let isGroupSwap = !drawData[sourceXIndex].isExpanded && !drawData[sourceXIndex].isExpanded;

    if ((sourceObject.drawsId !== null && targetObject.drawsId !== null) || isGroupSwap) {
      this.updateCompetitionDraws(
        sourceObject,
        targetObject,
        sourceIndexArray,
        targetIndexArray,
        drawData,
        round_Id,
        newEndTimeSource,
        newEndTimeTarget,
      );
    }
  };
  updateCompetitionDraws = (
    sourceObject,
    targetObject,
    sourceIndexArray,
    targetIndexArray,
    drawData,
    round_Id,
    newEndTimeSource,
    newEndTimeTarget,
  ) => {
    //const key = this.state.firstTimeCompId === "-1" || this.state.filterDates ? "all" : "add";
    const sourceXIndex = sourceIndexArray[0];
    const sourceYIndex = sourceIndexArray[1];
    const targetXIndex = targetIndexArray[0];
    const targetYIndex = targetIndexArray[1];
    if (targetObject.drawsId) {
      let postData = {
        drawsId: targetObject.drawsId,
        venueCourtId: sourceObject.venueCourtId,
        matchDate: sourceObject.matchDate,
        startTime: sourceObject.startTime,
        endTime: newEndTimeTarget, //sourceObejct.endTime,
      };
      if (drawData[sourceXIndex].isExpanded) {
        postData.subCourt = sourceObject.subCourt;
      }
      this.updateEditDrawArray(postData);
    }
    if (sourceObject.drawsId) {
      let postData = {
        drawsId: sourceObject.drawsId,
        venueCourtId: targetObject.venueCourtId,
        matchDate: targetObject.matchDate,
        startTime: targetObject.startTime,
        endTime: newEndTimeSource, //targetObject.endTime,
      };
      if (drawData[sourceXIndex].isExpanded) {
        postData.subCourt = targetObject.subCourt;
      }
      this.updateEditDrawArray(postData);
    }
    const newSourceObj = JSON.parse(JSON.stringify(targetObject));
    const newTargetObj = JSON.parse(JSON.stringify(sourceObject));
    let switchDrawTimeFieldKeys = Object.keys(DrawConstant.switchDrawTimeFields);
    switchDrawTimeFieldKeys.forEach(key => (newSourceObj[key] = sourceObject[key]));
    switchDrawTimeFieldKeys.forEach(key => (newTargetObj[key] = targetObject[key]));

    drawData[sourceXIndex].slotsArray[sourceYIndex] = newSourceObj;
    drawData[targetXIndex].slotsArray[targetYIndex] = newTargetObj;

    if (drawData[sourceXIndex].isExpanded) {
      newSourceObj.subCourt = sourceObject.subCourt;
      newTargetObj.subCourt = targetObject.subCourt;
    } else {
      if (sourceObject.childSlots) {
        for (let childSlot of sourceObject.childSlots) {
          switchDrawTimeFieldKeys.forEach(key => (childSlot[key] = targetObject[key]));
          childSlot.endTime = newEndTimeSource;
          if (childSlot.drawsId) {
            let changedDraw = {
              drawsId: childSlot.drawsId,
              venueCourtId: childSlot.venueCourtId,
              matchDate: childSlot.matchDate,
              startTime: childSlot.startTime,
              endTime: childSlot.endTime,
            };
            this.updateEditDrawArray(changedDraw);
          }
        }
        if (
          sourceXIndex == targetXIndex &&
          (!targetObject.childSlots || targetObject.childSlots.length <= 1)
        ) {
          sortSlot(drawData[sourceXIndex].slotsArray);
        }
      }
      if (targetObject.childSlots) {
        for (let childSlot of targetObject.childSlots) {
          switchDrawTimeFieldKeys.forEach(key => (childSlot[key] = sourceObject[key]));
          childSlot.endTime = newEndTimeTarget;
          if (childSlot.drawsId) {
            let changedDraw = {
              drawsId: childSlot.drawsId,
              venueCourtId: childSlot.venueCourtId,
              matchDate: childSlot.matchDate,
              startTime: childSlot.startTime,
              endTime: childSlot.endTime,
            };
            this.updateEditDrawArray(changedDraw);
          }
        }
        if (sourceXIndex == targetXIndex) {
          sortSlot(drawData[targetXIndex].slotsArray);
        }
      }
      if (sourceXIndex != targetXIndex) {
        let sourceRemoveLength = 1;
        let targetRemoveLength = 1;
        let sourceToAdd = [newSourceObj];
        let targetToAdd = [newTargetObj];
        if (sourceObject.childSlots) {
          sourceRemoveLength = sourceObject.childSlots.length;
          targetToAdd = sourceObject.childSlots;
        }
        if (targetObject.childSlots) {
          targetRemoveLength = targetObject.childSlots.length;
          sourceToAdd = targetObject.childSlots;
        }
        if (sourceToAdd.length > 1 || sourceRemoveLength > 1) {
          drawData[sourceXIndex].slotsArray.splice(
            sourceYIndex,
            sourceRemoveLength,
            ...sourceToAdd,
          );
        }
        if (targetToAdd.length > 1 || targetRemoveLength > 1) {
          drawData[targetXIndex].slotsArray.splice(
            targetYIndex,
            targetRemoveLength,
            ...targetToAdd,
          );
        }
      }
    }
    this.setState({ redraw: true });
    //this.props.updateCourtTimingsDrawsDragSuccessAction();
  };

  updateEditDrawArray(draw) {
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
  }

  handleDragEnd = e => {
    if (e.dataTransfer.dropEffect === 'copy' && this.props.isDragging === false) {
      //should have been handled by onSwap
      return;
    }
    const targetCourtId = +e.currentTarget.id.split(':')[0];
    const stateVenueId = this.props.dragDayTarget?.id.split(':')[0];

    const { draggableEventObject, dragDayTimeRestrictions } = this.props;
    this.props.setDraggingState({
      isDragging: false,
    });

    if (!stateVenueId) {
      message.error(AppConstants.notAllowed);
      return;
    }

    if (targetCourtId && stateVenueId) {
      const refTimeFormatted = this.props.dragTimeRef.current.format(DrawConstant.dateFormat);
      const startTimeNew = moment(refTimeFormatted);

      if (startTimeNew.isBefore(dragDayTimeRestrictions.startTime)) {
        message.error(AppConstants.notAllowed);
        return;
      }

      const newTimeFormatted = startTimeNew.format('HH:mm');
      const newTimeWithDateFormatted = startTimeNew.format(DrawConstant.dateFormat);

      const endTimeNew = this.props.dragTimeEndRef.current;

      if (endTimeNew.isAfter(dragDayTimeRestrictions.endTime)) {
        message.error(AppConstants.notAllowed);
        return;
      }

      if (
        draggableEventObject.matchDate === newTimeWithDateFormatted &&
        targetCourtId.toString() === stateVenueId &&
        !draggableEventObject.subCourt
      ) {
        message.error(AppConstants.notAllowed);
        return;
      }

      const endTimeFormatted = endTimeNew.format('HH:mm');

      const notEmptyTargetDayCourtSlots = this.props.courtDataSlotsTarget.filter(
        slot => getDate(slot.matchDate) === getDate(newTimeWithDateFormatted) && slot.drawsId,
      );
      const allSubCourts = Object.keys(DrawConstant.subCourtHeightUnit);
      let existingSubCourts = [];
      let totalSubCourtHeightUnit = 0;
      const isCourtDataSlotBusy = notEmptyTargetDayCourtSlots.some((slot, slotIndex) => {
        const slotStart = moment(slot.matchDate);
        const slotEnd = moment(getDate(slot.matchDate) + slot.endTime);

        const isStartTimeCondition =
          startTimeNew.isSameOrBefore(slotEnd) && startTimeNew.isSameOrAfter(slotStart);
        const isEndTimeCondition =
          endTimeNew.isSameOrAfter(slotStart) && endTimeNew.isSameOrBefore(slotEnd);
        const isSlotEventInside =
          startTimeNew.isSameOrBefore(slotStart) && endTimeNew.isSameOrAfter(slotEnd);

        const isEventOverItself =
          slot.drawsId === draggableEventObject.drawsId &&
          (isStartTimeCondition || isEndTimeCondition);

        if (isStartTimeCondition || isEndTimeCondition || isSlotEventInside || isEventOverItself) {
          if (slot.subCourt) {
            existingSubCourts.push(slot.subCourt);
            let remainingSubCourt = allSubCourts.filter(
              c =>
                DrawConstant.subCourtHeightUnit[c] ===
                  DrawConstant.subCourtHeightUnit[slot.subCourt] && !existingSubCourts.includes(c),
            );
            totalSubCourtHeightUnit += DrawConstant.subCourtHeightUnit[slot.subCourt];
            if (remainingSubCourt.length > 0 && totalSubCourtHeightUnit < 8) {
              // subCourtAllowed=true;
              return false;
            }
          }
        }

        if (isEventOverItself) {
          const nextEvent = notEmptyTargetDayCourtSlots[slotIndex + 1];
          const prevEvent = notEmptyTargetDayCourtSlots[slotIndex - 1];

          const prevEventEnd = prevEvent && moment(getDate(slot.matchDate) + prevEvent?.endTime);
          const nextEventStart = nextEvent && moment(nextEvent?.matchDate);

          const isPrevEventEndBeforeSlotStart =
            prevEventEnd && prevEventEnd.isSameOrAfter(startTimeNew);
          const isPrevEventStartAfterSlotEnd =
            nextEventStart && nextEventStart.isSameOrBefore(endTimeNew);

          if (isPrevEventEndBeforeSlotStart || isPrevEventStartAfterSlotEnd) {
            return true;
          }

          return false;
        }

        if (isStartTimeCondition || isEndTimeCondition || isSlotEventInside) {
          return true;
        }
        return;
      });

      if (isCourtDataSlotBusy) {
        message.error(AppConstants.notAllowed);
        return;
      }

      const roundId = getDraws_round();
      const yearId = getGlobalYear();
      const storedCompetitionId = getOwn_competition();

      const apiData = {
        yearRefId: yearId,
        competitionId: storedCompetitionId,
        venueId: 0,
        roundId: this.props.firstTimeCompId == '-1' || this.props.filterDates ? 0 : roundId,
        orgId: null,
        startDate:
          this.props.firstTimeCompId == '-1' || this.props.filterDates
            ? this.props.startDate
            : null,
        endDate:
          this.props.firstTimeCompId == '-1' || this.props.filterDates ? this.props.endDate : null,
      };

      const postData = {
        drawsId: draggableEventObject.drawsId,
        venueCourtId: parseInt(stateVenueId),
        matchDate: newTimeWithDateFormatted,
        startTime: newTimeFormatted,
        endTime: endTimeFormatted,
      };
      const editdraw = this.props.editedDraw;
      editdraw.apiData = apiData;

      this.dragSuccess(targetCourtId, postData, draggableEventObject);
      this.updateEditDrawArray(postData);
      this.setState({ redraw: true });
    }
  };
  dragSuccess(targetCourtId, postData, sourceObject) {
    let drawData = this.props.dateItem.draws;
    let sourceVenueCourt = drawData.find(d => d.venueCourtId == targetCourtId);
    let destinationVenueCourt = drawData.find(d => d.venueCourtId == postData.venueCourtId);
    const allSubCourts = Object.keys(DrawConstant.subCourtHeightUnit);
    let switchDrawTimeFieldKeys = Object.keys(DrawConstant.switchDrawTimeFields);
    if (sourceVenueCourt.isExpanded) {
      let sourceCopy = JSON.parse(JSON.stringify(sourceObject));
      let remainingSubCourt = [];
      let sourceSubCourt = sourceObject.subCourt;
      if (sourceObject.subCourt) {
        // update subCourt
        let sourceDate = moment(postData.matchDate);
        let otherCourts = destinationVenueCourt.slotsArray.filter(slot => {
          if (slot.drawsId && slot.subCourt && slot.drawsId != sourceObject.drawsId) {
            let slotDate = moment(slot.matchDate);
            //near another sub court
            if (
              sourceDate.isSameOrAfter(slotDate) &&
              sourceDate.isSameOrBefore(moment(getDate(slot.matchDate) + slot.endTime))
            ) {
              return true;
            }
            if (
              slotDate.isSameOrAfter(sourceDate) &&
              slotDate.isSameOrBefore(moment(getDate(postData.matchDate) + postData.endTime))
            ) {
              return true;
            }
            return false;
          }
        });
        let newSubCourt = '';
        if (otherCourts.length > 0) {
          sortSlot(otherCourts);
          let otherCourt = otherCourts[0];
          remainingSubCourt = allSubCourts
            .filter(
              c =>
                DrawConstant.subCourtHeightUnit[c] ==
                  DrawConstant.subCourtHeightUnit[sourceObject.subCourt] &&
                !otherCourts.some(oc => oc.subCourt === c),
            )
            .sort();
          if (remainingSubCourt.length > 0) {
            postData.matchDate = otherCourt.matchDate;
            postData.startTime = otherCourt.startTime;
            postData.endTime = moment(postData.matchDate)
              .add(sourceObject.minuteDuration, 'minutes')
              .format('HH:mm');
            newSubCourt = remainingSubCourt[0];
            postData.subCourt = newSubCourt;
            sourceObject.subCourt = postData.subCourt;
          } else {
            //should not be allowed, no enough space
            console.log('no enough space');
          }
        } else {
          remainingSubCourt = allSubCourts
            .filter(
              c =>
                DrawConstant.subCourtHeightUnit[c] ==
                DrawConstant.subCourtHeightUnit[sourceObject.subCourt],
            )
            .sort();
          postData.subCourt = remainingSubCourt[0];
          sourceObject.subCourt = postData.subCourt;
        }
        let emptySlot = destinationVenueCourt.slotsArray.find(slot => {
          if (!slot.drawsId && slot.subCourt === postData.subCourt) {
            return true;
          }
          return false;
        });
        if (emptySlot) {
          emptySlot.subCourt = sourceSubCourt;
        }
      }
      sourceObject.matchDate = postData.matchDate;
      sourceObject.startTime = postData.startTime;
      sourceObject.endTime = postData.endTime;

      if (targetCourtId != postData.venueCourtId) {
        //move to different court
        if (sourceVenueCourt) {
          //remove from source court
          let drawindex = sourceVenueCourt.slotsArray.findIndex(d => d.drawsId == postData.drawsId);
          if (drawindex > -1) {
            sourceVenueCourt.slotsArray.splice(drawindex, 1);
          }
        }

        if (destinationVenueCourt) {
          Object.keys(DrawConstant.emptySlotVenueFieldUpdate).forEach(
            key => (sourceObject[key] = destinationVenueCourt[key]),
          );
          let emptySlotIndex = destinationVenueCourt.slotsArray.findIndex(
            slot => !slot.drawsId && slot.subCourt === postData.subCourt,
          );
          if (emptySlotIndex > -1) {
            let emptySlot = destinationVenueCourt.slotsArray[emptySlotIndex];
            destinationVenueCourt.slotsArray.splice(emptySlotIndex, 1);
            Object.keys(DrawConstant.emptySlotFieldUpdate).forEach(
              key => (emptySlot[key] = sourceCopy[key]),
            );
            emptySlot.subCourt = sourceCopy.subCourt;
            sourceVenueCourt.slotsArray.push(emptySlot);
            sortSlot(sourceVenueCourt.slotsArray);
          }
          destinationVenueCourt.slotsArray.push(sourceObject);
          sortSlot(destinationVenueCourt.slotsArray);
        }
      } else {
        //slot time updated
        sortSlot(sourceVenueCourt.slotsArray);
      }
    } else {
      //grouped fields
      sourceObject.matchDate = postData.matchDate;
      sourceObject.startTime = postData.startTime;
      sourceObject.endTime = postData.endTime;
      Object.keys(DrawConstant.emptySlotVenueFieldUpdate).forEach(
        key => (sourceObject[key] = destinationVenueCourt[key]),
      );
      if (sourceObject.childSlots) {
        for (let childSlot of sourceObject.childSlots) {
          switchDrawTimeFieldKeys.forEach(key => (childSlot[key] = sourceObject[key]));
          if (childSlot.drawsId) {
            let newEndTime = moment(childSlot.matchDate)
              .add(childSlot.minuteDuration, 'minutes')
              .format('HH:mm');
            let changedDraw = {
              drawsId: childSlot.drawsId,
              venueCourtId: childSlot.venueCourtId,
              matchDate: childSlot.matchDate,
              startTime: childSlot.startTime,
              endTime: newEndTime,
            };
            this.updateEditDrawArray(changedDraw);
          }
        }
        if (targetCourtId == postData.venueCourtId) {
          sortSlot(destinationVenueCourt.slotsArray);
        }
      }

      if (targetCourtId != postData.venueCourtId) {
        //move group to another court
        let sourceRemoveLength = 0;
        let sourceYIndex = sourceVenueCourt.slotsArray.indexOf(sourceObject);
        sourceVenueCourt.slotsArray.splice(sourceYIndex, 1);
        let targetToAdd = [];
        if (sourceObject.childSlots) {
          sourceRemoveLength = sourceObject.childSlots.length;
          targetToAdd = sourceObject.childSlots;
          for (let slot of sourceObject.childSlots) {
            let sourceYIndex = sourceVenueCourt.slotsArray.indexOf(slot);
            if (sourceYIndex > -1) {
              sourceVenueCourt.slotsArray.splice(sourceYIndex, 1);
            }
          }
        }

        if (targetToAdd.length > 0) {
          destinationVenueCourt.slotsArray.push(...targetToAdd);
          sortSlot(destinationVenueCourt.slotsArray);
        }
      }
    }
  }

  toggleCourt(courtData) {
    courtData.isExpanded = !courtData.isExpanded;
    this.setState({ redraw: true });
  }
  expandedView = (
    courtData,
    allSubCourts,
    leftMargin,
    slotTopMargin,
    index,
    currentHeightBase,
    isDayInPast,
    timeRestrictionsSchedule,
    isAxisInverted,
    fieldItemDate,
    startDayTime,
  ) => {
    let allprops = {
      ...this.props,
      courtData,
      allSubCourts: allSubCourts,
      leftMargin,
      slotTopMargin: slotTopMargin,
      index,
      currentHeightBase: currentHeightBase,
      isDayInPast: isDayInPast,
      timeRestrictionsSchedule: timeRestrictionsSchedule,
      isAxisInverted: isAxisInverted,
      fieldItemDate: fieldItemDate,
      startDayTime: startDayTime,
      onSwap: this.onSwap,
      checkCurrentSwapObjects: this.checkCurrentSwapObjects,
    };
    //key={slotKey}
    return <MultiFieldDrawsCourtExpandTimeline {...allprops}></MultiFieldDrawsCourtExpandTimeline>;
  };
  groupView = (
    courtData,
    groupSlots,
    allSubCourts,
    leftMargin,
    slotTopMargin,
    index,
    currentHeightBase,
    isDayInPast,
    timeRestrictionsSchedule,
    isAxisInverted,
    fieldItemDate,
    startDayTime,
  ) => {
    // key={slotKey}
    let allprops = {
      ...this.props,
      courtData,
      leftMargin,
      slotTopMargin,
      index,
      groupSlots,
      allSubCourts: allSubCourts,
      currentHeightBase: currentHeightBase,
      isDayInPast: isDayInPast,
      timeRestrictionsSchedule: timeRestrictionsSchedule,
      isAxisInverted: isAxisInverted,
      fieldItemDate: fieldItemDate,
      startDayTime: startDayTime,
      onSwap: this.onSwap,
      checkCurrentSwapObjects: this.checkCurrentSwapObjects,
    };
    return <MultiFieldDrawsCourtGroupTimeline {...allprops}></MultiFieldDrawsCourtGroupTimeline>;
  };

  render() {
    let dateItem = this.props.dateItem;
    let disabledStatus = this.props.competitionStatus == 1;
    let dayMargin = 25;
    const venueData = this.props.drawsState.competitionVenues;
    let globalTopMargin = 0;
    let heightBase = 30;
    const allSubCourts = Object.keys(DrawConstant.subCourtHeightUnit);

    //let topMargin = 2;
    const date = [];

    const { showOnlyFilters, isAxisInverted } = this.props;
    const isFilterSchedule = showOnlyFilters.includes(AppConstants.scheduledMatches);

    const { dateNewArray } = dateItem;

    dateNewArray.forEach(item => {
      const dateNew = getDate(item.date);

      if (dateNew !== date[date.length - 1]) {
        date.push(dateNew);
      }
    });

    const dayBgAvailable = this.props.defineDayBg();
    let containerWidth = dateItem.dateNewArray.length > 0 && dateItem.dateNewArray.length * 120;
    if (isAxisInverted) {
      containerWidth = dateItem.draws.length > 0 && dateItem.draws.length * 120;
    }
    let height = 600;
    return (
      <>
        <div
          className="scroll-bar"
          style={{
            width: 'fit-content',
          }}
        >
          {/* Horizontal head */}
          {isAxisInverted ? (
            this.props.courtHorizontalHeadView(dateItem)
          ) : (
            <div className="table-head-wrap">
              {this.props.dayHeadView(date, dateNewArray, dayMargin)}
            </div>
          )}
        </div>
        <div
          className={`main-canvas Draws draw-scroll-container ${isAxisInverted ? 'd-flex' : ''}`}
          style={{ width: containerWidth, minWidth: 1080, height: height }}
          id="draws-field"
          onDragOver={e => {
            if (!disabledStatus) this.props.drawsFieldMove(e);
          }}
          onMouseMove={e => this.props.drawsFieldMove(e)}
          onDragLeave={this.props.addDisplayNoneTooltip}
          onMouseLeave={this.props.addDisplayNoneTooltip}
          onMouseUp={this.props.drawsFieldUp}
          onTouchEnd={this.props.drawsFieldUp}
        >
          {isAxisInverted && this.props.dayHeadView(date, dateNewArray, dayMargin)}

          {dateItem.draws &&
            dateItem.draws.map((courtData, index) => {
              let currentHeightBase = heightBase;
              if (courtData.isExpanded) {
                currentHeightBase = 44;
              }
              if (isAxisInverted) {
                currentHeightBase = 56;
              }
              let leftMargin = 25;
              let slotTopMargin = 0;
              if (index !== 0) {
                slotTopMargin = globalTopMargin;
                //topMargin += 70;
              }
              //let subCourtTopMargin=slotTopMargin;
              globalTopMargin += currentHeightBase + 7;
              let height = currentHeightBase;
              let groupSlots = [];
              let unavailableHeight = currentHeightBase;
              let courtHeight = height;
              if (courtData.isExpanded) {
                height = currentHeightBase * 8;
                courtHeight = height;
                unavailableHeight = height;
                globalTopMargin += currentHeightBase * 7;
              } else {
                courtHeight = height + 14; //add margin for group view
              }
              const courtConfig = venueData
                .find(venue => venue.id === courtData.venueId)
                .courts.find(court => court.courtId === courtData.venueCourtId);
              let fieldConfigurationRefId = courtConfig.fieldConfigurationRefId;

              for (let i = 0; i < courtData.slotsArray.length; i++) {
                courtData.slotsArray[i].sortOrder = i + 1;
              }
              let hasCourtDifferentStartTime = false;

              for (let slotObject of courtData.slotsArray) {
                let hasDifferentStartTime = false;
                if (slotObject.subCourt && !slotObject.isUnavailable) {
                  let parentSlot = groupSlots.find(
                    s =>
                      s.subCourt &&
                      !s.isUnavailable &&
                      s.matchDate == slotObject.matchDate &&
                      s.outOfRoundDate == slotObject.outOfRoundDate,
                  );
                  if (!parentSlot && groupSlots.length > 0) {
                    if (
                      courtConfig.availableTimeslots &&
                      courtConfig.availableTimeslots.length > 0
                    ) {
                      const slotDayOfWeek = moment(slotObject.matchDate)
                        .format('dddd')
                        .toLowerCase();
                      let slotConfig = courtConfig.availableTimeslots.findLast(
                        s =>
                          s.timeslot.day === slotDayOfWeek &&
                          s.timeslot.startTime < slotObject.endTime &&
                          s.timeslot.endTime > slotObject.startTime,
                      );
                      if (slotConfig) {
                        fieldConfigurationRefId = slotConfig.timeslot.fieldConfigurationRefId;
                      }
                    }
                    let allowedSubCourt = [];
                    if (fieldConfigurationRefId > 1) {
                      allowedSubCourt = getAllowedSubcourtsForField(fieldConfigurationRefId);
                    }
                    let parentSlots = groupSlots.filter(
                      s =>
                        s.subCourt &&
                        !s.isUnavailable &&
                        s.divisionName != slotObject.divisionName &&
                        moment(s.matchDate)
                          .add(s.minuteDuration, 'minutes')
                          .isAfter(moment(slotObject.matchDate)) &&
                        allowedSubCourt.includes(slotObject.subCourt),
                    );
                    if (parentSlots.length > 0) {
                      parentSlot = parentSlots[parentSlots.length - 1];
                      let totalHeightUnit = parentSlot.childSlots
                        .map(s =>
                          s.subCourt && s.drawsId ? DrawConstant.subCourtHeightUnit[s.subCourt] : 0,
                        )
                        .reduce((a, b) => {
                          return a + b;
                        }, 0);
                      totalHeightUnit += DrawConstant.subCourtHeightUnit[slotObject.subCourt];
                      if (totalHeightUnit > 8) {
                        parentSlot = null;
                      } else {
                        hasDifferentStartTime = true;
                        hasCourtDifferentStartTime = true;
                      }
                    }
                  }
                  //check different start time for different division
                  if (parentSlot && parentSlot.childSlots && !slotObject.isUnavailable) {
                    if (hasDifferentStartTime) {
                      if (parentSlot.subCourt && parentSlot.subCourt > slotObject.subCourt) {
                        //switch parent slot to reorder
                        slotObject.childSlots = [];
                        let oldChildren = parentSlot.childSlots;
                        parentSlot.childSlots = [];
                        oldChildren[0] = parentSlot;
                        slotObject.childSlots = [{ ...slotObject }].concat(oldChildren);

                        let groupSlotIndex = groupSlots.indexOf(parentSlot);
                        groupSlots.splice(groupSlotIndex, 1);
                        groupSlots.push(slotObject);
                      } else {
                        parentSlot.childSlots.push(slotObject);
                      }
                    } else {
                      let subCourtExist = false;
                      if (!slotObject.drawsId) {
                        //duplicate empty slot
                        subCourtExist = parentSlot.childSlots.find(
                          s => s.subCourt === slotObject.subCourt,
                        );
                      }
                      if (!subCourtExist) {
                        parentSlot.childSlots.push(slotObject);
                      }
                    }
                    continue;
                  }
                }
                if (!slotObject.isUnavailable && (slotObject.drawsId || slotObject.subCourt)) {
                  slotObject.childSlots = []; //clear if exist
                  slotObject.childSlots = [{ ...slotObject }];
                  groupSlots.push(slotObject);
                }
              }

              if (hasCourtDifferentStartTime) {
                for (let groupSlot of groupSlots) {
                  groupSlot.childSlots.sort((a, b) =>
                    a.subCourt > b.subCourt ? 1 : a.subCourt < b.subCourt ? -1 : 0,
                  );
                  let minSortOrder = Math.min(...groupSlot.childSlots.map(s => s.sortOrder));
                  groupSlot.sortOrder = minSortOrder;
                  for (let i = 0; i < groupSlot.childSlots.length; i++) {
                    groupSlot.childSlots[i].sortOrder = minSortOrder + i;
                  }
                }
                courtData.slotsArray.sort((a, b) => a.sortOrder - b.sortOrder);
              }

              let prevDaysWidth = 0;
              let diffDayScheduleTime = 0;

              return (
                <div
                  key={'court' + index}
                  style={{
                    display: 'flex',
                    flexShrink: 0,
                    alignItems: 'center',
                    ...(isAxisInverted
                      ? {
                          position: 'relative',
                          left: 15,
                          width: courtHeight,
                        }
                      : {
                          height: courtHeight,
                        }),
                  }}
                >
                  {!isAxisInverted && (
                    <div
                      className="venueCourt-text-div text-center ml-n15 d-flex justify-content-center align-items-center"
                      style={{
                        width: 95,
                        height: currentHeightBase,
                      }}
                    >
                      <span
                        className="app-color pointer mr-2"
                        onClick={() => this.toggleCourt(courtData)}
                      >
                        {courtData.isExpanded ? '-' : '+'}
                      </span>
                      <span
                        className="venueCourt-text"
                        title={courtData.venueShortName + '-' + courtData.venueCourtName}
                      >
                        {courtData.venueShortName + '-' + courtData.venueCourtNumber}
                      </span>
                    </div>
                  )}

                  {date.map((fieldItemDate, fieldItemDateIndex) => {
                    // for check the schedule of the day
                    const { startDayTime, endDayTime } = this.props.getStartAndEndDayTime(
                      fieldItemDate,
                      dateNewArray,
                    );

                    const startDayDate = moment(fieldItemDate + startDayTime);
                    const endDayDate = moment(fieldItemDate + endDayTime);

                    const dateNow = moment();
                    const isDayInPast = dateNow.isAfter(endDayDate);

                    if (fieldItemDateIndex !== 0) {
                      prevDaysWidth += diffDayScheduleTime;
                    }
                    if (fieldItemDateIndex === 0) {
                      prevDaysWidth = 0;
                    }

                    if (fieldItemDateIndex === date.length - 1) {
                      // for the last day in schedule width and right dashed line in the end of the day
                      diffDayScheduleTime =
                        endDayDate.diff(startDayDate, 'minutes') * ONE_MIN_WIDTH + 1;
                    } else if (fieldItemDateIndex === date.length - 1 && isFilterSchedule) {
                      diffDayScheduleTime =
                        (endDayDate.diff(startDayDate, 'minutes') - ONE_HOUR_IN_MIN) *
                        ONE_MIN_WIDTH;
                    } else {
                      diffDayScheduleTime =
                        endDayDate.diff(startDayDate, 'minutes') * ONE_MIN_WIDTH;
                    }

                    const timeRestrictionsSchedule = this.props.getDayTimeRestrictions(
                      courtData,
                      fieldItemDate,
                    );

                    const unavailableWidth = this.props.checkUnavailableTimeWidth(
                      timeRestrictionsSchedule,
                      startDayDate,
                      endDayDate,
                    );

                    // render for the whole unavailable day for court based on venue schedule
                    if (!timeRestrictionsSchedule) {
                      return this.props.unavailableDayView(
                        courtData,
                        fieldItemDateIndex,
                        diffDayScheduleTime,
                        prevDaysWidth,
                        unavailableHeight,
                      );
                    }

                    const dayBg = timeRestrictionsSchedule.isUnavailable
                      ? {
                          background: `repeating-linear-gradient( -45deg, #ebf0f3, #ebf0f3 ${
                            ONE_HOUR_IN_MIN / 5
                          }px, #d9d9d9 ${ONE_HOUR_IN_MIN / 5}px, #d9d9d9 ${
                            (ONE_HOUR_IN_MIN / 5) * ONE_MIN_WIDTH
                          }px )`,
                        }
                      : dayBgAvailable;

                    return (
                      <div
                        key={'slot' + fieldItemDateIndex}
                        className={isAxisInverted ? 'position-absolute' : 'position-relative'}
                        style={{
                          width: `calc(100%) - ${prevDaysWidth}`,
                          height: '100%',
                          left: isAxisInverted ? '50%' : 75,
                        }}
                      >
                        <div
                          id={courtData.venueCourtId + ':' + fieldItemDateIndex}
                          className={`box-draws white-bg-timeline day-box ${
                            isAxisInverted ? 'position-absolute' : ''
                          }`}
                          style={{
                            minWidth: 'unset',
                            overflow: 'visible',
                            whiteSpace: 'nowrap',
                            cursor: disabledStatus && 'no-drop',
                            borderRadius: '0px',
                            left: 0,
                            ...dayBg,
                            ...(isAxisInverted
                              ? {
                                  top: prevDaysWidth,
                                  width: height,
                                  height: diffDayScheduleTime,
                                  transform: 'translateX(-50%)',
                                }
                              : {
                                  top: '50%',
                                  width: diffDayScheduleTime,
                                  height: height,
                                  transform: 'translateY(-50%)',
                                }),
                          }}
                          onDragOver={e => {
                            if (
                              !timeRestrictionsSchedule.isUnavailable &&
                              !isDayInPast &&
                              !disabledStatus
                            ) {
                              this.props.dayLineDragMove(
                                e,
                                startDayDate,
                                courtData.slotsArray,
                                timeRestrictionsSchedule,
                              );
                            }
                          }}
                          onDragEnd={e => {
                            if (
                              !timeRestrictionsSchedule.isUnavailable &&
                              !isDayInPast &&
                              !disabledStatus
                            )
                              this.handleDragEnd(e);
                          }}
                          onTouchMove={e => {
                            if (
                              !timeRestrictionsSchedule.isUnavailable &&
                              !isDayInPast &&
                              !disabledStatus
                            ) {
                              this.props.dayLineDragMove(
                                e,
                                startDayDate,
                                courtData.slotsArray,
                                timeRestrictionsSchedule,
                              );
                            }
                          }}
                          onTouchEnd={e => {
                            if (
                              !timeRestrictionsSchedule.isUnavailable &&
                              !isDayInPast &&
                              !disabledStatus
                            )
                              this.handleDragEnd(e);
                          }}
                        >
                          {timeRestrictionsSchedule.isUnavailable &&
                            this.props.unavailableTextView()}

                          {unavailableWidth.map((width, widthIndex) => {
                            if (width) {
                              return (
                                <div
                                  key={'unavailable' + widthIndex}
                                  className="box-draws unavailable-draws position-absolute align-items-center"
                                  style={{
                                    background: `repeating-linear-gradient( -45deg, #ebf0f3, #ebf0f3 ${
                                      ONE_HOUR_IN_MIN / 5
                                    }px, #d9d9d9 ${ONE_HOUR_IN_MIN / 5}px, #d9d9d9 ${
                                      (ONE_HOUR_IN_MIN / 5) * ONE_MIN_WIDTH
                                    }px )`,
                                    cursor: 'not-allowed',
                                    ...(isAxisInverted
                                      ? {
                                          bottom: widthIndex ? 0 : 'auto',
                                          top: widthIndex ? 'auto' : 0,
                                          left: 0,
                                          height: width,
                                          minHeight: width,
                                          width: '100%',
                                        }
                                      : {
                                          right: widthIndex ? 0 : 'auto',
                                          left: widthIndex ? 'auto' : 0,
                                          top: 0,
                                          width,
                                          minWidth: width,
                                          height: '100%',
                                        }),
                                  }}
                                >
                                  {this.props.unavailableTextView()}
                                </div>
                              );
                            }
                          })}
                          {courtData.isExpanded
                            ? this.expandedView(
                                courtData,
                                allSubCourts,
                                leftMargin,
                                slotTopMargin,
                                index,
                                currentHeightBase,
                                isDayInPast,
                                timeRestrictionsSchedule,
                                isAxisInverted,
                                fieldItemDate,
                                startDayTime,
                              )
                            : this.groupView(
                                courtData,
                                groupSlots,
                                allSubCourts,
                                leftMargin,
                                slotTopMargin,
                                index,
                                currentHeightBase,
                                isDayInPast,
                                timeRestrictionsSchedule,
                                isAxisInverted,
                                fieldItemDate,
                                startDayTime,
                              )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </div>
      </>
    );
  }
}

export default MultiFieldDrawsSubCourtTimeline;
