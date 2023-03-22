import React, { Component } from 'react';
import { Layout, Button, DatePicker } from 'antd';
import ScheduleSelector from 'react-schedule-selector';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getUserRole } from 'store/actions/userAction/userAction';
import {
  getUmpireAvailabilityAction,
  saveUmpireAvailabilityAction,
} from 'store/actions/LiveScoreAction/livescoreUmpiresAction';
import AppConstants from 'themes/appConstants';
import { UMPIRE_SCHEDULE_STATUS } from 'util/enums';
import Loader from 'customComponents/loader';
import './umpire.css';

const { WeekPicker } = DatePicker;
const { Content } = Layout;

class MyUmpiringAvailability extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: 0,
      loading: false,
      schedule: null,
      scheduleStartDate: new Date(moment().startOf('week').format()),
      scheduleUnavailableStart: null,
      scheduleUnavailableEnd: null,
    };
  }

  async componentDidMount() {
    const userId = this.props.userId;
    this.apiCalls(userId);

    const scheduleUnavailableStart = moment().subtract(1, 'd').endOf('day');
    const scheduleUnavailableEnd = moment().add(3, 'M').subtract(1, 'd').endOf('day');

    this.setState({ userId, scheduleUnavailableStart, scheduleUnavailableEnd });
  }

  async componentDidUpdate(nextProps) {
    const { liveScoreUmpireState } = this.props;

    const scheduleArray = liveScoreUmpireState.umpireAvailabilitySchedule.map(item => {
      const utcDate = moment(item.startTime, moment.defaultFormat).toDate();
      return new Date(utcDate);
    });

    if (
      this.props.liveScoreUmpireState.umpireAvailabilitySchedule !=
      nextProps.liveScoreUmpireState.umpireAvailabilitySchedule
    ) {
      this.setState({ schedule: scheduleArray });
    }
  }

  apiCalls = userId => {
    this.props.getUserRole(userId);

    const { startDate, endDate } = this.getStartEndWeekDates(this.state.scheduleStartDate);

    this.props.getUmpireAvailabilityAction(userId, startDate, endDate);
  };

  getStartEndWeekDates = dateFrom => {
    const startDate = dateFrom.toISOString();
    const endDate = new Date(moment(dateFrom).add(7, 'days').format()).toISOString();

    return { startDate, endDate };
  };

  disabledDate = current => {
    const { scheduleUnavailableStart, scheduleUnavailableEnd } = this.state;

    return (
      (current && current < scheduleUnavailableStart) ||
      (current && current > scheduleUnavailableEnd)
    );
  };

  handleChangeDate = date => {
    const { userId } = this.state;

    if (date) {
      const { startDate, endDate } = this.getStartEndWeekDates(date.startOf('week'));

      this.props.getUmpireAvailabilityAction(userId, startDate, endDate);
      this.setState({ scheduleStartDate: date.startOf('week') });
    }
  };

  handleChangeSchedule = newSchedule => {
    this.setState({ schedule: newSchedule });
  };

  handleSaveAvailability = () => {
    const { schedule, userId } = this.state;

    const postData = schedule.map(item => ({
      id: null,
      userId,
      startTime: moment(item).format(),
      endTime: moment(item).clone().add(30, 'minutes').format(),
      type: 'UNAVAILABLE',
      created_by: userId,
    }));

    const { startDate, endDate } = this.getStartEndWeekDates(this.state.scheduleStartDate);
    this.props.saveUmpireAvailabilityAction(postData, userId, startDate, endDate);
  };

  noDataAvailable = () => (
    <div className="d-flex">
      <span className="inside-table-view mt-4">{AppConstants.noDataAvailable}</span>
    </div>
  );

  renderCell = (datetime, selected, refSetter) => {
    const { scheduleUnavailableStart, scheduleUnavailableEnd } = this.state;

    const isDateBeforeStart = moment(datetime).isBefore(scheduleUnavailableStart);
    const isDateAfterEnd = moment(datetime).isAfter(scheduleUnavailableEnd);

    return (
      <div className="availability-cell-wrapper">
        <div
          ref={refSetter}
          className="availability-cell"
          style={{
            background: `${
              isDateBeforeStart || isDateAfterEnd
                ? UMPIRE_SCHEDULE_STATUS.UnavailableDateRange
                : selected
                ? UMPIRE_SCHEDULE_STATUS.Unavailable
                : UMPIRE_SCHEDULE_STATUS.Available
            }`,
            cursor: `${isDateBeforeStart || isDateAfterEnd ? 'not-allowed' : 'default'}`,
          }}
        />
      </div>
    );
  };

  render() {
    const { isUmpireRole } = this.props.userState;
    const { schedule, scheduleStartDate } = this.state;

    return (
      <>
        <div className="fluid-width">
          <div className="row mx-0">
            <div className="col-sm-12">
              <div className="inside-table-view mt-4">
                {schedule && isUmpireRole && (
                  <>
                    <div className="row mb-4">
                      <div className="col-12 col-lg-6 inside-table-view d-flex justify-content-center">
                        <span className="umpireAvailablityMessage px-5 text-center">
                          {AppConstants.please_sel_umpire_unavailable_time}
                        </span>
                      </div>
                      <div className="col-12 col-sm-6 col-lg-3 d-flex align-items-center justify-content-center table-actions my-3">
                        <WeekPicker
                          onChange={this.handleChangeDate}
                          disabledDate={this.disabledDate}
                          format={`D/MM - ${moment(scheduleStartDate)
                            .endOf('week')
                            .format('D/MM')}`}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-lg-3 d-flex align-items-center justify-content-center my-3">
                        <Button
                          className="schedule-approval-button"
                          type="primary"
                          htmlType="submit"
                          onClick={this.handleSaveAvailability}
                          disabled={this.props.liveScoreUmpireState.onLoad}
                        >
                          {AppConstants.save}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <ScheduleSelector
                        selection={schedule}
                        numDays={7}
                        minTime={8}
                        maxTime={22}
                        hourlyChunks={2}
                        startDate={scheduleStartDate}
                        dateFormat="D/M"
                        timeFormat="HH:mm"
                        onChange={this.handleChangeSchedule}
                        renderDateCell={this.renderCell}
                      />
                    </div>
                  </>
                )}

                {((!schedule && !this.props.liveScoreUmpireState.onLoad) || !isUmpireRole) &&
                  this.noDataAvailable()}
              </div>
            </div>
          </div>
        </div>

        <Loader visible={this.props.liveScoreUmpireState.onLoad} />
      </>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getUserRole,
      getUmpireAvailabilityAction,
      saveUmpireAvailabilityAction,
    },
    dispatch,
  );
}

function mapStatetoProps(state) {
  return {
    userState: state.UserState,
    liveScoreUmpireState: state.LiveScoreUmpiresState,
  };
}

export default connect(mapStatetoProps, mapDispatchToProps)(MyUmpiringAvailability);
