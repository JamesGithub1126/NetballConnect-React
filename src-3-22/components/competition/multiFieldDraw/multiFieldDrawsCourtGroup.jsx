import { Popover } from 'antd';
import React, { Component, PureComponent } from 'react';
import DrawConstant from 'themes/drawConstant';
import { showOnlySelectedDivisions, showOnlySelectedOrganisations } from 'util/drawUtil';
import Swappable from '../../../customComponents/SwappableComponent';
//import '../draws.scss';

class MultiFieldDrawsCourtGroup extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(nextProps) {}

  componentDidMount() {}

  render() {
    let isAxisInverted = this.props.isAxisInverted;
    let dateItem = this.props.dateItem;
    let index = this.props.index;
    let slotObject = this.props.slotObject;
    let slotIndex = this.props.slotIndex;
    //let courtData = this.props.courtData;
    //let leftMargin = this.props.leftMargin;
    let slotTopMargin = this.props.slotTopMargin;
    let disabledStatus = this.props.competitionStatus == 1;

    let topMargin = 0;

    let heightBase = isAxisInverted ? 100 : 30;

    topMargin = slotTopMargin;

    let slotHeight = heightBase;

    // if (slotIndex == 0) {
    //   leftMargin = 70;
    // }
    var childArray = [0];
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
    const duplicateClass = slotObject.duplicate
      ? slotObject.colorCode == '#EA0628'
        ? 'boxPink'
        : 'boxDuplicate'
      : '';
    const boxClass = isAxisInverted ? 'box-invert' : 'box';
    let writingMode = isAxisInverted ? 'tb' : 'unset';
    return (
      <div>
        <div
          onMouseDown={this.props.slotObjectMouseDown}
          onTouchStart={this.props.slotObjectMouseDown}
          onMouseUp={this.props.drawsFieldUp}
          onTouchEnd={this.props.drawsFieldUp}
          onDragEnd={this.props.drawsFieldUp}
          onMouseEnter={e => this.props.slotObjectMouseEnter(e, slotObject, true)}
          onMouseLeave={this.props.slotObjectMouseLeave}
          className={`purple-bg ${boxClass} ${duplicateClass}`}
          style={{
            backgroundColor: '#999999',
            //left: leftMargin,
            //top: topMargin,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            cursor: disabledStatus && 'no-drop',
            height: slotHeight,
            width: isAxisInverted ? '30px' : '',
          }}
        >
          {this.props.firstTimeCompId == '-1' || this.props.filterDates ? (
            <Swappable
              // duplicateDropzoneId={slotObject.duplicate && "duplicateDropzoneId"}
              // duplicateDragableId={slotObject.duplicate && "duplicateDragableId"}
              duplicateDropzoneId={isAxisInverted && 'w-100'}
              duplicateDragableId={isAxisInverted && 'w-100'}
              id={index.toString() + ':' + slotIndex.toString() + ':' + '1'}
              content={1}
              swappable={this.props.checkSwap(slotObject)}
              onSwap={(source, target) => this.props.onSwap(source, target, dateItem, '1')}
              isCurrentSwappable={(source, target) =>
                this.props.checkCurrentSwapObjects(source, target, dateItem)
              }
            >
              {slotObject.drawsId != null || slotObject.subCourt ? (
                <div className="d-flex justify-content-between align-items-center w-100">
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
                        className={`d-flex justify-content-between align-items-center w-100 ${barRowClass}`}
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
                                className={`flex-col no-pointer`}
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
              ) : (
                <span
                  style={{
                    writingMode: writingMode,
                  }}
                >
                  Free
                </span>
              )}
            </Swappable>
          ) : (
            <Swappable
              duplicateDropzoneId={
                isAxisInverted ? 'w-100' : slotObject.duplicate ? 'duplicateDropzoneId' : ''
              }
              duplicateDragableId={
                isAxisInverted ? 'w-100' : slotObject.duplicate ? 'duplicateDragableId' : ''
              }
              id={index.toString() + ':' + slotIndex.toString() + ':' + dateItem.roundId.toString()}
              content={1}
              swappable={this.props.checkSwap(slotObject)}
              onSwap={(source, target) =>
                this.props.onSwap(source, target, dateItem, dateItem.roundId)
              }
              isCurrentSwappable={(source, target) =>
                this.props.checkCurrentSwapObjects(source, target, dateItem)
              }
            >
              {slotObject.drawsId != null || slotObject.subCourt ? (
                <div className="d-flex flex-column align-items-center w-100">
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
                        className={`d-flex justify-content-between align-items-center w-100 ${barRowClass}`}
                      >
                        {slotObject.childSlots.map((childSlot, cindex) => {
                          if (totalHeightUnit < 4 && cindex > barStartIndex) {
                            barStartIndex = cindex;
                            let widthUnit = '100%';
                            if (childSlot.subCourt) {
                              let slotHeightUnit =
                                DrawConstant.subCourtHeightUnit[childSlot.subCourt];
                              totalHeightUnit += slotHeightUnit;
                              widthUnit = slotHeightUnit * 25 + '%';
                            }
                            return (
                              <div
                                className={`flex-col no-pointer`}
                                key={childSlot.homeTeamId + '' + cindex}
                                style={{
                                  height: isAxisInverted ? 15 : 5,
                                  width: isAxisInverted ? 5 : 15,
                                  margin: 2.5,
                                  flexBasis: widthUnit,
                                  backgroundColor: childSlot.drawsId
                                    ? this.props.checkColor(childSlot)
                                    : '#fff',
                                }}
                              />
                            );
                          }
                        })}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span
                  style={{
                    writingMode: writingMode,
                  }}
                >
                  Free
                </span>
              )}
            </Swappable>
          )}
        </div>
      </div>
    );
  }
}

export default MultiFieldDrawsCourtGroup;
