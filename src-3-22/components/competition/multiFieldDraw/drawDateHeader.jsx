import React, { Component } from 'react';
import moment from 'moment';
import { DatePicker, TimePicker } from 'antd';
import { checkDate } from 'util/drawUtil';
import { getWeekDay } from 'themes/dateformate';
import DrawConstant from 'themes/drawConstant';

class DrawsDateHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.dateHeaderRef = React.createRef();
  }

  componentDidUpdate(nextProps) {}

  componentDidMount() {}
  onChangeDate(dateItem, item, index, time) {
    const updatedDate = item.updatedDate ? moment(item.updatedDate) : moment(item.date);
    if (time) {
      updatedDate.set({ year: time.year(), date: time.date(), month: time.month() });
    }
    const updatedDateString = updatedDate.format(DrawConstant.dateFormat);
    //this.props.updateMultiDrawsCourtTimings(dateItem.roundId, index, updatedDateString);
    this.updateDateTimeEditDrawsArray(dateItem, index, item, updatedDateString);
    this.setState({ updateUI: true });
  }

  onChangeTime(dateItem, item, index, time) {
    const updatedDate = item.updatedDate ? moment(item.updatedDate) : moment(item.date);
    updatedDate.set({ hour: time?.hour(), minute: time?.minute() });
    const updatedDateString = updatedDate.format(DrawConstant.dateFormat);
    //this.props.updateMultiDrawsCourtTimings(dateItem.roundId, index, updatedDateString);
    this.updateDateTimeEditDrawsArray(dateItem, index, item, updatedDateString);
    this.setState({ updateUI: true });
  }

  updateDateTimeEditDrawsArray(dateItem, index, dateHeader, updatedDateString) {
    let previousMatchDate = dateHeader.date;
    dateHeader.updatedDate = updatedDateString;
    dateHeader.date = updatedDateString;
    dateHeader.dayOfWeek = getWeekDay(dateHeader.date);
    let notInDraw = dateHeader.notInDraw ? 1 : 0;
    let newMatchDate = new Date(dateHeader.date);
    const startTime = moment(newMatchDate).format('HH:mm');
    dateHeader.startTime = startTime;
    const draws = dateItem.draws;
    if (draws) {
      for (let draw of draws) {
        if (process.env.REACT_APP_VENUE_CONFIGURATION_ENABLED === 'true') {
          let sameTimeSlots = draw.slotsArray.filter(
            x => x.matchDate == previousMatchDate && x.outOfRoundDate == notInDraw,
          );
          for (let timeslot of sameTimeSlots) {
            timeslot.matchDate = dateHeader.date;
            timeslot.startTime = dateHeader.startTime;
            timeslot.endTime = moment(newMatchDate)
              .add(timeslot.minuteDuration, 'minute')
              .format('HH:mm');
            let childSlots = timeslot.childSlots;
            if (childSlots && childSlots.length > 0) {
              for (let childSlot of childSlots) {
                childSlot.matchDate = dateHeader.date;
                childSlot.startTime = dateHeader.startTime;
                childSlot.endTime = moment(newMatchDate)
                  .add(childSlot.minuteDuration, 'minute')
                  .format('HH:mm');
              }
            }
            this.addToEditDrawArray(timeslot, updatedDateString);
          }
        } else {
          if (draw.slotsArray && draw.slotsArray.length > index) {
            let timeslot = draw.slotsArray[index];
            timeslot.matchDate = dateHeader.date;
            var date = moment(newMatchDate).add(timeslot.minuteDuration, 'minute');
            timeslot.startTime = startTime;
            timeslot.endTime = date.format('HH:mm');
            this.addToEditDrawArray(timeslot, updatedDateString);
          }
        }
      }
    }
  }
  addToEditDrawArray = (slotObj, updatedDateString) => {
    if (slotObj.drawsId) {
      const postData = {
        drawsId: slotObj.drawsId,
        venueCourtId: slotObj.venueCourtId,
        matchDate: updatedDateString,
        startTime: slotObj.startTime,
        endTime: slotObj.endTime,
      };

      this.props.updateEditDrawArray(postData);
    }
  };

  render() {
    let dateItem = this.props.dateItem;
    let dateTimeEditable = this.props.dateTimeEditable;
    let containerWidth = this.props.containerWidth;
    let firstColumnWidth = this.props.firstColumnWidth;
    let hasVerticalScrollbar = this.props.hasVerticalScrollbar;
    let isAxisInverted = this.props.isAxisInverted;
    let dateMargin = 25;
    let dayMargin = 25;
    let headerRowStyle = { display: 'inline-flex', height: '40px' };
    if (dateTimeEditable) {
      headerRowStyle = { display: 'inline-flex', marginBottom: '15px' };
    }
    let scrollWidth = containerWidth - firstColumnWidth;
    if (hasVerticalScrollbar) {
      scrollWidth = scrollWidth - 15;
    }
    return (
      <div className="draw-header" style={{ width: containerWidth, display: 'flex' }}>
        <div style={{ width: firstColumnWidth, height: 80 }}></div>
        <div
          className="table-head-wrap"
          style={{
            width: scrollWidth,
            overflowX: 'hidden',
            willChange: 'transform',
          }}
          ref={this.dateHeaderRef}
        >
          {/* Day name list */}
          <div>
            <div style={headerRowStyle}>
              {dateItem.dateNewArray.map((item, index) => {
                if (index !== 0) {
                  if (dateTimeEditable) {
                    dateMargin += 20;
                  } else {
                    dateMargin += 110;
                  }
                }
                if (index == 0) {
                  dateMargin = 0;
                }

                if (dateTimeEditable) {
                  return (
                    <DatePicker
                      format="DD-MM"
                      placeholder="dd-mm"
                      onChange={startDate => this.onChangeDate(dateItem, item, index, startDate)}
                      value={
                        item.updatedDate
                          ? moment(new Date(item.updatedDate))
                          : moment(new Date(item.date))
                      }
                      style={{ left: dateMargin, width: 90 }}
                      key={'day' + index}
                      allowClear={false}
                    />
                  );
                } else {
                  return (
                    <div
                      key={'day' + index}
                      style={{ width: 110 }}
                      className="nowrap draw-date-text"
                    >
                      {item.notInDraw == false
                        ? checkDate(item.date, index, dateItem.dateNewArray)
                        : ''}
                    </div>
                  );
                }
              })}
            </div>
          </div>
          {/* Times list */}
          <div>
            <div style={headerRowStyle}>
              {dateItem.dateNewArray.map((item, index) => {
                if (index !== 0) {
                  if (dateTimeEditable) {
                    dayMargin += 20;
                  } else {
                    dayMargin += 110;
                  }
                }
                if (index == 0) {
                  dayMargin = 0;
                }

                if (dateTimeEditable) {
                  return (
                    <TimePicker
                      format="HH:mm"
                      onChange={endTime => this.onChangeTime(dateItem, item, index, endTime)}
                      onBlur={e =>
                        this.onChangeTime(
                          dateItem,
                          item,
                          index,
                          e.target.value && moment(e.target.value, 'HH:mm'),
                        )
                      }
                      value={
                        item.updatedDate
                          ? moment(new Date(item.updatedDate))
                          : moment(new Date(item.date))
                      }
                      key={'time' + index}
                      style={{ left: dayMargin, width: 90 }}
                      allowClear={false}
                    />
                  );
                } else {
                  return (
                    <div
                      className="draw-date-text"
                      key={'time' + index}
                      style={{
                        fontSize: item.notInDraw != false && 11,
                        width: 110,
                      }}
                    >
                      {item.notInDraw == false ? item.startTime : 'Not in draw'}
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DrawsDateHeader;
