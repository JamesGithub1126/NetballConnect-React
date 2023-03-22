import { DatePicker, Layout, Menu, Modal, Select } from 'antd';
import React, { Component, PureComponent } from 'react';
import { showOnlySelectedDivisions, showOnlySelectedOrganisations } from 'util/drawUtil';
import Swappable from '../../../customComponents/SwappableComponent';
import DrawConstant from '../../../themes/drawConstant';
import DrawActionMenu from './drawActionMenu';
//import '../draws.scss';

const { SubMenu } = Menu;

class MultiFieldDrawsCourtExpand extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(nextProps) {}

  componentDidMount() {}

  render() {
    let dateItem = this.props.dateItem;
    let index = this.props.index;
    let slotObject = this.props.slotObject;
    let slotIndex = this.props.slotIndex;
    let courtData = this.props.courtData;
    //let leftMargin = this.props.leftMargin;
    let slotTopMargin = this.props.slotTopMargin;
    let disabledStatus = this.props.competitionStatus == 1;
    let isAxisInverted = this.props.isAxisInverted;

    let topMargin = 0;

    let heightBase = 44;
    const allSubCourts = Object.keys(DrawConstant.subCourtHeightUnit);

    topMargin = slotTopMargin;
    //let isSameTimeSlot = false;
    let slotHeightUnit = 8;
    let slotHeight = heightBase - 14;
    let slotHasSubCourt = true;

    if (slotObject.subCourt && allSubCourts.includes(slotObject.subCourt)) {
      slotHeightUnit = DrawConstant.subCourtHeightUnit[slotObject.subCourt];
    }
    if (slotHasSubCourt) {
      slotHeight = heightBase * slotHeightUnit - 21; // minus box exception height and margin
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
    const duplicateClass = slotObject.duplicate
      ? slotObject.colorCode == '#EA0628'
        ? 'boxPink'
        : 'boxDuplicate'
      : '';
    const boxClass = isAxisInverted ? 'box-invert' : 'box';
    const textColor =
      this.props.checkColor(slotObject) === '#999999' ? '#FFFFFF' : slotObject.fontColor;
    let writingMode = isAxisInverted && slotHeightUnit === 1 ? 'tb' : 'unset';
    return (
      <div>
        <div
          onMouseDown={this.props.slotObjectMouseDown}
          onTouchStart={this.props.slotObjectMouseDown}
          onMouseUp={this.props.drawsFieldUp}
          onTouchEnd={this.props.drawsFieldUp}
          onDragEnd={this.props.drawsFieldUp}
          onMouseEnter={e => this.props.slotObjectMouseEnter(e, slotObject)}
          onMouseLeave={this.props.slotObjectMouseLeave}
          className={`purple-bg ${boxClass} ${duplicateClass}`}
          style={{
            backgroundColor: this.props.checkColor(slotObject),
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            cursor: disabledStatus && 'no-drop',
            ...(isAxisInverted
              ? { width: slotHeight, left: topMargin }
              : { height: slotHeight, top: topMargin }),
          }}
        >
          {this.props.firstTimeCompId == '-1' || this.props.filterDates ? (
            <Swappable
              // duplicateDropzoneId={slotObject.duplicate && "duplicateDropzoneId"}
              // duplicateDragableId={slotObject.duplicate && "duplicateDragableId"}
              // duplicateDropzoneId={"boxDuplicate"}
              duplicateDropzoneId={isAxisInverted ? 'w-100' : ''}
              duplicateDragableId={isAxisInverted ? 'w-100' : ''}
              id={index.toString() + ':' + slotIndex.toString() + ':' + '1'}
              content={1}
              swappable={this.props.checkSwap(slotObject)}
              onSwap={(source, target) => this.props.onSwap(source, target, dateItem, '1')}
              isCurrentSwappable={(source, target) =>
                this.props.checkCurrentSwapObjects(source, target, dateItem)
              }
            >
              {slotObject.drawsId != null ? (
                this.props.isDivisionNameShow ? (
                  <span
                    style={{
                      writingMode: writingMode,
                      color: textColor,
                    }}
                  >
                    {slotObject.divisionName + '-' + slotObject.gradeName}
                  </span>
                ) : (
                  <span
                    style={{
                      writingMode: writingMode,
                      color: textColor,
                    }}
                  >
                    {slotObject.homeTeamName} {slotHeightUnit > 1 ? <br /> : ' V '}
                    {slotObject.awayTeamName}
                  </span>
                )
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
              duplicateDropzoneId={`${isAxisInverted ? 'w-100' : ''} ${
                slotObject.duplicate ? 'duplicateDropzoneId' : ''
              }`}
              duplicateDragableId={`${isAxisInverted ? 'w-100' : ''} ${
                slotObject.duplicate ? 'duplicateDragableId' : ''
              }`}
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
              {slotObject.drawsId != null ? (
                this.props.isDivisionNameShow ? (
                  <span
                    style={{
                      writingMode: writingMode,
                      color: textColor,
                    }}
                  >
                    {slotObject.divisionName + '-' + slotObject.gradeName}
                  </span>
                ) : (
                  <span
                    style={{
                      writingMode: writingMode,
                      color: textColor,
                    }}
                  >
                    {slotObject.homeTeamName} {slotHeightUnit > 1 ? <br /> : ' V '}
                    {slotObject.awayTeamName}
                  </span>
                )
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
        <DrawActionMenu
          slotObject={slotObject}
          disabledStatus={disabledStatus}
          courtData={courtData}
          dateItem={dateItem}
          topMargin={topMargin + slotHeight + 2}
          menuMarginLeft={isAxisInverted ? topMargin + slotHeight + 2 : 0}
          isAxisInverted={isAxisInverted}
          {...this.props}
        ></DrawActionMenu>
      </div>
    );
  }
}

export default MultiFieldDrawsCourtExpand;
