import moment from 'moment';
import React, { Component } from 'react';
import { DatePicker, TimePicker } from 'antd';
import {
  // getDayName,
  getTime,
  getWeekDay,
} from '../../../themes/dateformate';
import DrawConstant from '../../../themes/drawConstant';
import {
  checkDate,
  getDate,
  sortSlot,
  getEndTime,
  getAllowedSubCourtsForDraw,
  isVenueFieldConfigurationEnabled,
} from '../../../util/drawUtil';
import { randomKeyGen } from '../../../util/helpers';
import '../draws.scss';
import MultiFieldDrawsCourtExpand from './multiFieldDrawsCourtExpand';
import MultiFieldDrawsCourtGroup from './multiFieldDrawsCourtGroup';
import { VariableSizeGrid } from 'react-window';
import DrawsDateHeader from './drawDateHeader';
import NotInDrawFullCourt from './notInDrawFullCourt';
import { checkTargetedVenueHomeForAwayTeam, swapHomeAndAwayTeam } from "./venueHelper";
class MultiFieldDrawsSubCourt extends Component {
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

  checkCurrentSwapObjects = (source, target, roundData) => {
    let drawData = roundData.draws;
    let sourceIndexArray = source.split(':');
    let targetIndexArray = target.split(':');
    let sourceXIndex = sourceIndexArray[0];
    let sourceYIndex = sourceIndexArray[1];
    let targetXIndex = targetIndexArray[0];
    let targetYIndex = targetIndexArray[1];
    let targetObject = drawData[targetXIndex].slotsArray[targetYIndex];
    let isTargetExpanded = drawData[targetXIndex].isExpanded;

    if (sourceYIndex == 'notindraw') {
      if (
        (targetObject.drawsId &&
          (isTargetExpanded || !targetObject.subCourt || !targetObject.childSlots)) ||
        targetObject.isUnavailable
      ) {
        //can only move not in draw to empty slot
        return false;
      }
      let sourceObject = roundData.notInDraws[sourceXIndex];

      if (drawData[sourceXIndex].isExpanded) {
        let isAllowed = this.checkAllowedSubcourt(
          sourceObject,
          targetObject,
          drawData,
          targetXIndex,
        );
        if (!isAllowed) {
          return false;
        }
      }
    } else {
      if (sourceXIndex === targetXIndex && sourceYIndex === targetYIndex) {
        return false;
      }
      let sourceObject = drawData[sourceXIndex].slotsArray[sourceYIndex];

      if (sourceObject.drawsId == null && targetObject.drawsId == null) {
        return false;
      }
      if (!!drawData[sourceXIndex].isExpanded != !!drawData[targetXIndex].isExpanded) {
        return false;
      }
      if (drawData[sourceXIndex].isExpanded && drawData[targetXIndex].isExpanded) {
        let isAllowed = this.checkAllowedSubcourt(
          sourceObject,
          targetObject,
          drawData,
          targetXIndex,
        );
        if (!isAllowed) {
          return false;
        }
      }
    }
    return true;
  };
  checkAllowedSubcourt = (sourceObject, targetObject, drawData, targetXIndex) => {
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
    let subCourt = targetObject.subCourt || sourceObject.subCourt;
    const venueData = this.props.drawsState.competitionVenues;
    let fieldIds = getAllowedSubCourtsForDraw(targetObject, venueData);
    if (subCourt) {
      if (!fieldIds.includes(subCourt)) {
        return false;
      }
      let notInDraw = sourceObject.outOfRoundDate === 1 || sourceObject.outOfCompetitionDate === 1;
      if (notInDraw && !drawData[targetXIndex].isExpanded && targetObject.childSlots) {
        //check same size free slot
        let freeSlot = targetObject.childSlots.find(
          x =>
            x.subCourt &&
            !x.drawsId &&
            DrawConstant.subCourtHeightUnit[x.subCourt] == sourceSlotHeightUnit,
        );
        if (!freeSlot) {
          return false;
        }
      }
    } else if (fieldIds.length > 0) {
      //can not move full court to sub court
      return false;
    }
    return true;
  };
  onSwap = (source, target, roundData, round_Id) => {
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
          round_Id,
          sourceObject.duplicate,
          targetObject.duplicate,
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
  };

  ///////update the competition draws on  swapping and hitting update Apis if both has value
  updateCompetitionDraws = (
    sourceObject,
    targetObject,
    sourceIndexArray,
    targetIndexArray,
    drawData,
    round_Id,
    sourceDuplicate,
    targetDuplicate,
  ) => {
    const sourceXIndex = sourceIndexArray[0];
    const sourceYIndex = sourceIndexArray[1];
    const targetXIndex = targetIndexArray[0];
    const targetYIndex = targetIndexArray[1];
    let newSourceObj = JSON.parse(JSON.stringify({
      ...targetObject,
      originalHomeTeamId: targetObject.originalHomeTeamId ?? targetObject.homeTeamId,
      originalAwayTeamId: targetObject.originalAwayTeamId ?? targetObject.awayTeamId,
    }));
    let newTargetObj = JSON.parse(JSON.stringify({
      ...sourceObject,
      originalHomeTeamId: sourceObject.originalHomeTeamId ?? sourceObject.homeTeamId,
      originalAwayTeamId: sourceObject.originalAwayTeamId ?? sourceObject.awayTeamId,
    }));
    let switchDrawTimeFieldKeys = Object.keys(DrawConstant.switchDrawTimeFields);
    switchDrawTimeFieldKeys.forEach(key => (newSourceObj[key] = sourceObject[key]));
    switchDrawTimeFieldKeys.forEach(key => (newTargetObj[key] = targetObject[key]));

    if(checkTargetedVenueHomeForAwayTeam(
      this.props.drawsState,
      newSourceObj.venueId,
      newSourceObj,
    )) {
      newSourceObj = swapHomeAndAwayTeam(newSourceObj);
    }

    if(checkTargetedVenueHomeForAwayTeam(
      this.props.drawsState,
      newTargetObj.venueId,
      newTargetObj,
    )) {
      newTargetObj = swapHomeAndAwayTeam(newTargetObj);
    }

    let postData = null;

    postData = {
      drawsId: targetObject.drawsId,
      originalHomeTeamId: newSourceObj.originalHomeTeamId,
      originalAwayTeamId: newSourceObj.originalAwayTeamId,
      homeTeamId: newSourceObj.homeTeamId,
      awayTeamId: newSourceObj.awayTeamId,
      venueCourtId: sourceObject.venueCourtId,
      matchDate: sourceObject.matchDate,
      startTime: sourceObject.startTime,
      endTime: getEndTime(sourceObject.matchDate, targetObject.minuteDuration), //keep slot duration
    };
    if (drawData[sourceXIndex].isExpanded) {
      postData.subCourt = sourceObject.subCourt;
    }
    newSourceObj.endTime = postData.endTime;
    this.updateEditDrawArray(postData);

    postData = {
      drawsId: sourceObject.drawsId,
      originalHomeTeamId: newTargetObj.originalHomeTeamId,
      originalAwayTeamId: newTargetObj.originalAwayTeamId,
      homeTeamId: newTargetObj.homeTeamId,
      awayTeamId: newTargetObj.awayTeamId,
      venueCourtId: targetObject.venueCourtId,
      matchDate: targetObject.matchDate,
      startTime: targetObject.startTime,
      endTime: getEndTime(targetObject.matchDate, sourceObject.minuteDuration),
    };
    if (drawData[sourceXIndex].isExpanded) {
      postData.subCourt = targetObject.subCourt;
    }
    newTargetObj.endTime = postData.endTime;
    this.updateEditDrawArray(postData);

    //newSourceObj.slotId = randomKeyGen(5); //update key to update ui
    //newTargetObj.slotId = randomKeyGen(5);
    drawData[sourceXIndex].slotsArray[sourceYIndex] = newSourceObj;
    drawData[targetXIndex].slotsArray[targetYIndex] = newTargetObj;
    if (drawData[sourceXIndex].isExpanded) {
      newSourceObj.subCourt = sourceObject.subCourt;
      newTargetObj.subCourt = targetObject.subCourt;
    } else {
      if (sourceObject.childSlots) {
        for (let childSlot of sourceObject.childSlots) {
          switchDrawTimeFieldKeys.forEach(key => (childSlot[key] = targetObject[key]));
          if (childSlot.drawsId) {
            let changedDraw = {
              drawsId: childSlot.drawsId,
              venueCourtId: childSlot.venueCourtId,
              matchDate: childSlot.matchDate,
              startTime: childSlot.startTime,
              endTime: getEndTime(childSlot.matchDate, childSlot.minuteDuration),
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
          if (childSlot.drawsId) {
            let changedDraw = {
              drawsId: childSlot.drawsId,
              venueCourtId: childSlot.venueCourtId,
              matchDate: childSlot.matchDate,
              startTime: childSlot.startTime,
              endTime: getEndTime(childSlot.matchDate, childSlot.minuteDuration),
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
    const sourceXIndex = sourceIndexArray[0];
    const sourceYIndex = sourceIndexArray[1];
    const targetXIndex = targetIndexArray[0];
    const targetYIndex = parseInt(targetIndexArray[1]);
    const newSourceObj = JSON.parse(JSON.stringify({
      ...targetObject,
      originalHomeTeamId: targetObject.originalHomeTeamId ?? targetObject.homeTeamId,
      originalAwayTeamId: targetObject.originalAwayTeamId ?? targetObject.awayTeamId,
    }));
    const newTargetObj = JSON.parse(JSON.stringify({
      ...sourceObject,
      originalHomeTeamId: sourceObject.originalHomeTeamId ?? sourceObject.homeTeamId,
      originalAwayTeamId: sourceObject.originalAwayTeamId ?? sourceObject.awayTeamId,
    }));
    let switchDrawTimeFieldKeys = Object.keys(DrawConstant.switchDrawTimeFields);
    switchDrawTimeFieldKeys.forEach(key => (newSourceObj[key] = sourceObject[key]));
    switchDrawTimeFieldKeys.forEach(key => (newTargetObj[key] = targetObject[key]));

    let postData = null;
    let movedFixture;
    if (sourceObject.drawsId == null) {
      movedFixture = newSourceObj;
      postData = {
        drawsId: targetObject.drawsId,
        venueId: sourceObject.venueId,
        venueCourtId: sourceObject.venueCourtId,
        originalHomeTeamId: newSourceObj.originalHomeTeamId,
        originalAwayTeamId: newSourceObj.originalAwayTeamId,
        matchDate: sourceObject.matchDate,
        startTime: sourceObject.startTime,
        endTime: getEndTime(sourceObject.matchDate, targetObject.minuteDuration), //keep slot duration,
      };
      if (targetObject.outOfRoundDate === 1 || targetObject.outOfCompetitionDate === 1) {
        postData.outOfRoundDate = sourceObject.outOfRoundDate;
        postData.outOfCompetitionDate = sourceObject.outOfCompetitionDate;
      }
      newSourceObj.endTime = postData.endTime;
    } else {
      movedFixture = newTargetObj;
      postData = {
        drawsId: sourceObject.drawsId,
        venueId: targetObject.venueId,
        originalHomeTeamId: newTargetObj.originalHomeTeamId,
        originalAwayTeamId: newTargetObj.originalAwayTeamId,
        venueCourtId: targetObject.venueCourtId,
        matchDate: targetObject.matchDate,
        startTime: targetObject.startTime,
        endTime: getEndTime(targetObject.matchDate, sourceObject.minuteDuration), //targetObject.endTime,
      };
      if (sourceObject.outOfRoundDate === 1 || sourceObject.outOfCompetitionDate === 1) {
        postData.outOfRoundDate = targetObject.outOfRoundDate;
        postData.outOfCompetitionDate = targetObject.outOfCompetitionDate;
      }
      newTargetObj.endTime = postData.endTime;
    }

    const targetVenueId = postData.venueId;

    const isTargetedVenueHomeForAwayTeam = checkTargetedVenueHomeForAwayTeam(
      this.props.drawsState,
      targetVenueId,
      movedFixture,
    );

    if (isTargetedVenueHomeForAwayTeam) {
      Object.assign(movedFixture, swapHomeAndAwayTeam(movedFixture));

      postData.homeTeamId = movedFixture.homeTeamId;
      postData.awayTeamId = movedFixture.awayTeamId;
    }

    this.updateEditDrawArray(postData);

    //newSourceObj.slotId = randomKeyGen(5); //update key to update ui
    //newTargetObj.slotId = randomKeyGen(5);
    drawData[sourceXIndex].slotsArray[sourceYIndex] = newSourceObj;
    drawData[targetXIndex].slotsArray[targetYIndex] = newTargetObj;

    if (drawData[sourceXIndex].isExpanded) {
      newSourceObj.subCourt = sourceObject.subCourt;
      if (sourceObject.drawsId == null && newSourceObj.subCourt) {
        postData.subCourt = newSourceObj.subCourt;
        this.updateEditDrawArray(postData);
      }
      this.updateExpandedEmptySlot(
        drawData,
        sourceObject,
        targetObject,
        newTargetObj,
        targetXIndex,
        targetYIndex,
        postData,
      );

      let sameCourtFields = drawData[sourceXIndex].slotsArray.filter(
        s =>
          s.matchDate == sourceObject.matchDate && s.outOfRoundDate == sourceObject.outOfRoundDate,
      );
      if (sameCourtFields.length > 0 && !sameCourtFields.some(s => s.drawsId)) {
        //combine empty fields
        for (let i = 0; i < sameCourtFields.length; i++) {
          let fieldIndex = drawData[sourceXIndex].slotsArray.indexOf(sameCourtFields[i]);
          if (i == 0) {
            drawData[sourceXIndex].slotsArray[fieldIndex].subCourt = null;
          } else {
            drawData[sourceXIndex].slotsArray.splice(fieldIndex, 1);
          }
        }
      }
      for (let slot of drawData[sourceXIndex].slotsArray) {
        slot.childSlots = null;
      }
    } else {
      //grouped fields
      //drawData[sourceXIndex].slotsArray.splice(sourceYIndex,1, newSourceObj);
      //drawData[targetXIndex].slotsArray.splice(targetYIndex,1, newTargetObj);
      if (sourceObject.childSlots) {
        for (let childSlot of sourceObject.childSlots) {
          let notInDraw = childSlot.outOfRoundDate === 1 || childSlot.outOfCompetitionDate === 1;
          switchDrawTimeFieldKeys.forEach(key => (childSlot[key] = targetObject[key]));
          if (childSlot.drawsId) {
            let changedDraw = {
              drawsId: childSlot.drawsId,
              venueCourtId: childSlot.venueCourtId,
              matchDate: childSlot.matchDate,
              startTime: childSlot.startTime,
              endTime: getEndTime(childSlot.matchDate, childSlot.minuteDuration),
            };
            if (notInDraw) {
              changedDraw.outOfRoundDate = targetObject.outOfRoundDate;
              changedDraw.outOfCompetitionDate = targetObject.outOfCompetitionDate;
            }
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
          let notInDraw = childSlot.outOfRoundDate === 1 || childSlot.outOfCompetitionDate === 1;
          switchDrawTimeFieldKeys.forEach(key => (childSlot[key] = sourceObject[key]));
          if (childSlot.drawsId) {
            let changedDraw = {
              drawsId: childSlot.drawsId,
              venueCourtId: childSlot.venueCourtId,
              matchDate: childSlot.matchDate,
              startTime: childSlot.startTime,
              endTime: getEndTime(childSlot.matchDate, childSlot.minuteDuration),
            };
            if (notInDraw) {
              changedDraw.outOfRoundDate = sourceObject.outOfRoundDate;
              changedDraw.outOfCompetitionDate = sourceObject.outOfCompetitionDate;
            }
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

    //this.props.updateCompetitionDrawsSwapLoadAction();
    this.setState({ redraw: true });
  };
  updateExpandedEmptySlot = (
    drawData,
    sourceObject,
    targetObject,
    newTargetObj,
    targetXIndex,
    targetYIndex,
    postData,
  ) => {
    let targetSlotHeightUnit = 8;

    //  Object.keys(DrawConstant.subCourtHeightUnit).filter(
    //   f => DrawConstant.subCourtHeightUnit[f] == sourceSlotHeightUnit,
    // );
    const venueData = this.props.drawsState.competitionVenues;
    let fieldIds = getAllowedSubCourtsForDraw(targetObject, venueData);

    if (targetObject.subCourt) {
      targetSlotHeightUnit = DrawConstant.subCourtHeightUnit[targetObject.subCourt];
      newTargetObj.subCourt = targetObject.subCourt;
    } else if (sourceObject.subCourt) {
      newTargetObj.subCourt = sourceObject.subCourt;
    } else if (fieldIds.length > 0) {
      newTargetObj.subCourt = fieldIds[0];
    }
    if (sourceObject.drawsId != null) {
      postData.subCourt = newTargetObj.subCourt;
      this.updateEditDrawArray(postData);
    }
    this.fillEmptySubCourtToEmptyCourt(
      drawData,
      targetXIndex,
      targetYIndex,
      targetSlotHeightUnit,
      sourceObject,
      newTargetObj,
      fieldIds,
    );
  };
  fillEmptySubCourtToEmptyCourt = (
    drawData,
    targetXIndex,
    targetYIndex,
    targetSlotHeightUnit,
    sourceObject,
    newTargetObj,
    fieldIds,
  ) => {
    let sourceSlotHeightUnit = 8;
    if (sourceObject.subCourt) {
      sourceSlotHeightUnit = DrawConstant.subCourtHeightUnit[sourceObject.subCourt];
    }
    let insertIndex = targetYIndex + 1;
    let targetRemainingHeightUnit = targetSlotHeightUnit - sourceSlotHeightUnit;
    if (targetRemainingHeightUnit > 0) {
      fieldIds = fieldIds.filter(f => f != newTargetObj.subCourt);
      //fill up remaining empty space, A,B

      if (fieldIds.length > 0) {
        for (let fId of fieldIds) {
          if (targetRemainingHeightUnit >= sourceSlotHeightUnit) {
            let emptyDraw = { ...DrawConstant.emptySlot };
            emptyDraw.slotId = randomKeyGen(5);
            let remainingFieldId = fId;
            emptyDraw.subCourt = remainingFieldId;
            Object.keys(DrawConstant.emptySlotFieldUpdate).forEach(
              key => (emptyDraw[key] = newTargetObj[key]),
            );
            drawData[targetXIndex].slotsArray.splice(insertIndex, 0, emptyDraw);
            targetRemainingHeightUnit -= sourceSlotHeightUnit;
            insertIndex++;
          }
        }
      }
    }
    for (let slot of drawData[targetXIndex].slotsArray) {
      slot.childSlots = null;
    }
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

    const sourceXIndex = sourceIndexArray[0];
    const targetXIndex = targetIndexArray[0];
    const targetYIndex = targetIndexArray[1];
    //const newSourceObj = JSON.parse(JSON.stringify(targetObject));
    const newTargetObj = JSON.parse(JSON.stringify(sourceObject));
    newTargetObj.endTime = postData.endTime;

    this.updateEditDrawArray(postData);

    Object.keys(DrawConstant.switchDrawTimeFields).forEach(
      key => (newTargetObj[key] = targetObject[key]),
    );
    notInDraws.splice(sourceXIndex, 1);
    if (drawData[targetXIndex].isExpanded) {
      //move to empty slot in expand mode
      drawData[targetXIndex].slotsArray[targetYIndex] = newTargetObj;
      this.updateExpandedEmptySlot(
        drawData,
        sourceObject,
        targetObject,
        newTargetObj,
        targetXIndex,
        targetYIndex,
        postData,
      );
    } else if (targetObject.childSlots) {
      //move to empty child slot in group mode
      let sourceSlotHeightUnit = 8;
      if (sourceObject.subCourt) {
        sourceSlotHeightUnit = DrawConstant.subCourtHeightUnit[sourceObject.subCourt];
      }
      let freeSlotIndex = targetObject.childSlots.findIndex(
        x =>
          x.subCourt &&
          !x.drawsId &&
          DrawConstant.subCourtHeightUnit[x.subCourt] == sourceSlotHeightUnit,
      );
      if (freeSlotIndex > -1) {
        let oldEmptySlot = targetObject.childSlots[freeSlotIndex];
        newTargetObj.subCourt = oldEmptySlot.subCourt;
        postData.subCourt = newTargetObj.subCourt;
        this.updateEditDrawArray(postData);
        let slotIndex = drawData[targetXIndex].slotsArray.findIndex(
          x => x.slotId == oldEmptySlot.slotId,
        );
        if (slotIndex > -1) {
          drawData[targetXIndex].slotsArray[slotIndex] = newTargetObj;
          targetObject.childSlots = null;
          targetObject.slotId = randomKeyGen(5);
        }
      }
    } else if (!targetObject.subCourt) {
      //moved to full empty slot in group mode
      drawData[targetXIndex].slotsArray[targetYIndex] = newTargetObj;
      let targetSlotHeightUnit = 8;
      const venueData = this.props.drawsState.competitionVenues;
      let fieldIds = getAllowedSubCourtsForDraw(targetObject, venueData);
      this.fillEmptySubCourtToEmptyCourt(
        drawData,
        targetXIndex,
        targetYIndex,
        targetSlotHeightUnit,
        sourceObject,
        newTargetObj,
        fieldIds,
      );
    }
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
  toggleCourt(courtData, index) {
    courtData.isExpanded = !courtData.isExpanded;
    this.gridRef.current.resetAfterRowIndex(index);
    this.setState({ redraw: true });
  }

  toggleCourtForInvertAxis(courtData, index) {
    courtData.isExpanded = !courtData.isExpanded;
    //this.forceUpdate();
    this.gridRef.current.resetAfterColumnIndex(index);
    this.setState({ redraw: true });
  }

  slotCell = ({ columnIndex, rowIndex, style }) => {
    let dateItem = this.props.dateItem;
    let isAxisInverted = this.props.isAxisInverted;
    let index = rowIndex;
    let timeslotIndex = columnIndex;
    if (isAxisInverted) {
      index = columnIndex;
      timeslotIndex = rowIndex;
    }

    let courtData = dateItem.draws[index]; //courts
    if (!courtData) return null;

    let matchDate = dateItem.dateNewArray[timeslotIndex].date;
    //let startTime = dateItem.dateNewArray[timeslotIndex].startTime;
    let notInDraw = dateItem.dateNewArray[timeslotIndex].notInDraw;
    const allSubCourts = Object.keys(DrawConstant.subCourtHeightUnit);
    let globalTopMargin = 0;
    let heightBase = 30;
    let currentHeightBase = heightBase;
    if (courtData.isExpanded) {
      currentHeightBase = 44;
    }
    let leftMargin = 25;
    let slotTopMargin = 0;
    let subCourtTopMargin = slotTopMargin;

    globalTopMargin += currentHeightBase + 7;
    let height = currentHeightBase;

    let groupSlots = [];
    let subCourtSlots = [];
    if (courtData.isExpanded) {
      height = currentHeightBase * 8;
      globalTopMargin += currentHeightBase * 7;
      subCourtSlots = courtData.slotsArray.filter(
        x => x.matchDate == matchDate && x.outOfRoundDate == notInDraw,
      );
    } else {
      for (let slotObject of courtData.slotsArray) {
        if (slotObject.subCourt) {
          let parentSlot = groupSlots.find(
            s => s.subCourt && s.matchDate == slotObject.matchDate && s.outOfRoundDate == notInDraw,
          );
          if (parentSlot && parentSlot.childSlots) {
            let childExist = parentSlot.childSlots.some(x => x.slotId == slotObject.slotId);
            if (!childExist) {
              parentSlot.childSlots.push(slotObject);
            }
            continue;
          }
        }

        if (!slotObject.childSlots && (slotObject.drawsId || slotObject.subCourt)) {
          slotObject.childSlots = [{ ...slotObject }];
        }

        groupSlots.push(slotObject);
      }
    }
    if (courtData.isExpanded) {
      return (
        <div style={style}>
          {subCourtSlots.map((slotObject, subIndex) => {
            let isSameTimeSlot = false;
            if (subIndex !== 0) {
              if (slotObject.subCourt && allSubCourts.includes(slotObject.subCourt)) {
                let previousSlot = subCourtSlots[subIndex - 1];
                if (
                  previousSlot.matchDate == slotObject.matchDate &&
                  previousSlot.outOfRoundDate == slotObject.outOfRoundDate
                ) {
                  isSameTimeSlot = true;
                  subCourtTopMargin +=
                    currentHeightBase * DrawConstant.subCourtHeightUnit[previousSlot.subCourt];
                }
              }
              if (!isSameTimeSlot) {
                leftMargin += 110;
                subCourtTopMargin = slotTopMargin;
              }
            }
            if (subIndex == 0) {
              leftMargin = 70;
            }
            let slotIndex = courtData.slotsArray.indexOf(slotObject);

            let allprops = {
              ...this.props,
              slotObject,
              slotIndex,
              courtData,
              leftMargin,
              slotTopMargin: subCourtTopMargin,
              index,
              onSwap: this.onSwap,
              checkCurrentSwapObjects: this.checkCurrentSwapObjects,
            };
            let slotKey = ''; //"slot" + slotIndex;
            if (slotObject.slotId) {
              slotKey += slotObject.slotId;
            }
            return (
              <MultiFieldDrawsCourtExpand key={slotKey} {...allprops}></MultiFieldDrawsCourtExpand>
            );
          })}
        </div>
      );
    } else {
      let slotObject = groupSlots[timeslotIndex];
      let slotIndex = courtData.slotsArray.indexOf(slotObject);
      if (slotIndex > 0) {
        leftMargin += 110;
      }
      if (slotIndex == 0) {
        leftMargin = 70;
      }
      let allprops = {
        ...this.props,
        slotObject,
        slotIndex,
        courtData,
        leftMargin,
        slotTopMargin,
        index,
        onSwap: this.onSwap,
        checkCurrentSwapObjects: this.checkCurrentSwapObjects,
      };
      let slotKey = ''; //"slot" + slotIndex;
      if (slotObject.slotId) {
        slotKey += slotObject.slotId;
      }
      return (
        <div style={style}>
          <MultiFieldDrawsCourtGroup key={slotKey} {...allprops}></MultiFieldDrawsCourtGroup>
        </div>
      );
    }
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
  getRowHeight = (dateItem, index, isAxisInverted) => {
    let height = 37;
    let courtData = dateItem.draws[index];
    if (!isAxisInverted && courtData.isExpanded) {
      height = 359;
    }
    if (isAxisInverted) {
      height = 120;
    }
    return height;
  };
  render() {
    let dateItem = this.props.dateItem;
    let drawListExpanded = this.props.drawListExpanded;
    let filterEnable = this.props.filterEnable;
    let isAxisInverted = this.props.isAxisInverted;
    //let dateTimeEditable = this.props.dateTimeEditable;
    //let disabledStatus = this.props.competitionStatus == 1;
    let minWidth = 1070;
    let notInDrawWidth = 125;
    let containerWidth = Math.round(window.screen.width * 0.75) - 95;
    if (containerWidth < minWidth) {
      containerWidth = minWidth;
    }
    let gridHeight = 600;
    if (!isAxisInverted && drawListExpanded) {
      gridHeight = dateItem.draws.length * 37;
      let zoomLevel = (window.outerWidth - 10) / window.innerWidth;
      containerWidth = Math.floor(window.screen.width / zoomLevel) * 0.75 - 95;
      if (!filterEnable) {
        containerWidth = Math.floor(window.screen.width / zoomLevel) - 300;
      }
    }
    // if (isAxisInverted && dateItem.draws.length > 0) {
    //   const expandedCount = dateItem.draws.filter(x => x.isExpanded === true).length;
    //   const totalCount = dateItem.draws.length;
    //   containerWidth = 140 + expandedCount * 450 + (totalCount - expandedCount) * 70;
    //   if (containerWidth < 1180) {
    //     containerWidth = 1180;
    //   }
    // }
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
    let hasVerticalScrollbar = rowCount * 35 > gridHeight;
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
                      let width = 70;
                      if (isVenueFieldConfigurationEnabled) {
                        if (courtData.isExpanded) {
                          width = 359;
                        }
                      }

                      return (
                        <div
                          key={'court' + index}
                          className="draw-date-text"
                          style={{ width: width }}
                        >
                          {isVenueFieldConfigurationEnabled && (
                            <span
                              className="app-color pointer f-13"
                              onClick={() => this.toggleCourtForInvertAxis(courtData, index)}
                            >
                              {courtData.isExpanded ? '-' : '+'}
                            </span>
                          )}
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
                let rowHeight = this.getRowHeight(dateItem, fRowIndex, isAxisInverted);
                let slotIndex = fRowIndex;
                if (isAxisInverted) {
                  let matchDate = columnValue.date;
                  let notInDraw = columnValue.notInDraw;
                  let startTime = columnValue.startTime;

                  return (
                    <div key={fRowIndex} style={{ height: rowHeight, width: firstColumnWidth }}>
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
                    <div key={fRowIndex} style={{ height: rowHeight, width: firstColumnWidth }}>
                      <div
                        className="sr-no"
                        style={{ height: rowHeight - 7, lineHeight: rowHeight - 7 + 'px' }}
                      >
                        <div className="venueCourt-text-div">
                          <span
                            className="app-color pointer mr-2"
                            onClick={() => this.toggleCourt(courtData, slotIndex)}
                          >
                            {courtData.isExpanded ? '-' : '+'}
                          </span>
                          <span className="venueCourt-text">
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
                let width = 110;
                if (isAxisInverted) {
                  width = 70;
                  let courtData = dateItem.draws[index];
                  if (courtData && courtData.isExpanded) {
                    width = 359;
                  }
                } else {
                  width = 110;
                }
                return width;
              }}
              height={gridHeight}
              rowCount={rowCount}
              rowHeight={index => this.getRowHeight(dateItem, index, isAxisInverted)}
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

export default MultiFieldDrawsSubCourt;
