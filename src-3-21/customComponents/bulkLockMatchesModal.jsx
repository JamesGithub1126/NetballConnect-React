import React from 'react';
import { Select, Modal, Checkbox, Radio, message, DatePicker } from 'antd';
import { isArrayNotEmpty } from '../util/helpers';
import AppConstants from 'themes/appConstants';

export default class BulkLockMatchesModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAllVenue: false,
      showAllDivision: false,
      showAllTimeslot: false,
      allVenueChecked: false,
      allDivisionChecked: false,
      allTimeslotChecked: false,
      venues: this.props.venues.map(venue => {
        return { ...venue, checked: false };
      }),
      divisions: this.props.divisions.map(division => {
        return { ...division, checked: false };
      }),
      timeslotHourlyList: this.props.timeslotHourlyList.map(timeslot => {
        return { ...timeslot, checked: false };
      }),
    };
  }

  venueView = () => {
    let { showAllVenue, venues } = this.state;
    return (
      <>
        <div className="row d-flex align-items-center">
          <div className="col-sm d-flex justify-content-start">
            <span className="user-contact-heading">{AppConstants.venue}</span>
          </div>
        </div>
        <div id="venue-collapsable-div1" className="pt-2 collapse in division-collapsable-div">
          <Checkbox
            className="single-checkbox-radio-style"
            style={{ paddingTop: 8 }}
            checked={this.state.allVenueChecked}
            onChange={e => this.changeAllVenueStatus(e.target.checked)}
          >
            {AppConstants.all}
          </Checkbox>
          {isArrayNotEmpty(venues) &&
            venues.map((item, index) => {
              return (
                index < this.checkDisplayCountList(venues, showAllVenue) && (
                  <div key={'competitionVenue_' + item.id} className="column pl-5">
                    <Checkbox
                      className="single-checkbox-radio-style"
                      style={{ paddingTop: 8 }}
                      checked={item.checked}
                      onChange={e => this.checkBoxVenuesOnChange(e.target.checked, item, venues)}
                    >
                      {item.name}
                    </Checkbox>
                  </div>
                )
              );
            })}
          {(isArrayNotEmpty(venues) || venues.length > 5) && (
            <span
              className="input-heading-add-another pt-4"
              onClick={() => this.changeShowAllStatus('venue')}
            >
              {showAllVenue ? AppConstants.hide : AppConstants.showAll}
            </span>
          )}
        </div>
      </>
    );
  };

  divisionView = () => {
    let { showAllDivision, divisions } = this.state;
    return (
      <>
        <div className="row">
          <div className="col-sm d-flex justify-content-start ">
            <span className="user-contact-heading">{AppConstants.divisions}</span>
          </div>
        </div>

        <div id="division-collapsable-div1" className="pt-0 collapse in division-collapsable-div">
          <Checkbox
            className="single-checkbox-radio-style"
            style={{ paddingTop: 8 }}
            checked={this.state.allDivisionChecked}
            onChange={e => this.changeAllDivisionStatus(e.target.checked)}
          >
            {AppConstants.all}
          </Checkbox>
          {isArrayNotEmpty(divisions) &&
            divisions.map((item, index) => {
              return (
                index < this.checkDisplayCountList(divisions, showAllDivision) && (
                  <div
                    key={'divisionGrade_' + item.competitionDivisionGradeId}
                    className="column pl-5"
                  >
                    <Checkbox
                      className={`single-checkbox-radio-style`}
                      style={{ paddingTop: 8 }}
                      checked={item.checked}
                      onChange={e =>
                        this.checkBoxDivisionsOnChange(e.target.checked, item, divisions)
                      }
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div>{item.name}</div>
                      </div>
                    </Checkbox>
                  </div>
                )
              );
            })}

          {(isArrayNotEmpty(divisions) || divisions.length > 5) && (
            <span
              className="input-heading-add-another pt-4"
              onClick={() => this.changeShowAllStatus('division')}
            >
              {showAllDivision ? AppConstants.hide : AppConstants.showAll}
            </span>
          )}
        </div>
      </>
    );
  };

  timeslotLeftView = () => {
    let { showAllTimeslot, timeslotHourlyList } = this.state;
    return (
      <>
        <div className="row d-flex align-items-center">
          <div className="col-sm d-flex justify-content-start">
            <span className="user-contact-heading">{AppConstants.timeSlot}</span>
          </div>
        </div>
        <div id="timeslot-collapsable-div1" className="pt-3 collapse in division-collapsable-div">
          <Checkbox
            className="single-checkbox-radio-style"
            style={{ paddingTop: 8 }}
            checked={this.state.allTimeslotChecked}
            onChange={e => this.changeAllTimeslotStatus(e.target.checked)}
          >
            {AppConstants.all}
          </Checkbox>
          {isArrayNotEmpty(timeslotHourlyList) &&
            timeslotHourlyList.map((item, index) => {
              return (
                index < this.checkDisplayCountList(timeslotHourlyList, showAllTimeslot) && (
                  <div key={'competitionTimeslot_' + item.key} className="column pl-5">
                    <Checkbox
                      className="single-checkbox-radio-style"
                      style={{ paddingTop: 8 }}
                      checked={item.checked}
                      onChange={e =>
                        this.checkBoxTimeslotsOnChange(e.target.checked, item, timeslotHourlyList)
                      }
                    >
                      {item.label}
                    </Checkbox>
                  </div>
                )
              );
            })}
          {(isArrayNotEmpty(timeslotHourlyList) || timeslotHourlyList.length > 5) && (
            <span
              className="input-heading-add-another pt-4"
              onClick={() => this.changeShowAllStatus('timeslotHour')}
            >
              {showAllTimeslot ? AppConstants.hide : AppConstants.showAll}
            </span>
          )}
        </div>
      </>
    );
  };

  checkBoxVenuesOnChange = (value, item, array) => {
    item.checked = value;
    this.setState({ venues: array });
  };

  checkBoxDivisionsOnChange = (value, item, array) => {
    item.checked = value;
    this.setState({ divisions: array });
  };

  checkBoxTimeslotsOnChange = (value, item, array) => {
    item.checked = value;
    this.setState({ timeslotHourlyList: array });
  };

  changeAllVenueStatus = value => {
    let { venues } = this.state;
    this.setState({
      venues: venues.map(venue => {
        return { ...venue, checked: value };
      }),
      allVenueChecked: value,
    });
  };

  changeAllDivisionStatus = value => {
    let { divisions } = this.state;
    this.setState({
      divisions: divisions.map(division => {
        return { ...division, checked: value };
      }),
      allDivisionChecked: value,
    });
  };

  changeAllTimeslotStatus = value => {
    let { timeslotHourlyList } = this.state;
    this.setState({
      timeslotHourlyList: timeslotHourlyList.map(timeslot => {
        return { ...timeslot, checked: value };
      }),
      allTimeslotChecked: value,
    });
  };

  changeShowAllStatus = key => {
    if (key === 'venue') {
      this.setState({ showAllVenue: !this.state.showAllVenue });
    } else if (key === 'comp') {
      this.setState({ showAllComp: !this.state.showAllComp });
    } else if (key === 'division') {
      this.setState({ showAllDivision: !this.state.showAllDivision });
    } else if (key === 'org') {
      this.setState({ showAllOrg: !this.state.showAllOrg });
    } else if (key === 'timeslotHour') {
      this.setState({ showAllTimeslot: !this.state.showAllTimeslot });
    }
  };

  checkDisplayCountList = (array, showAllStatus) => {
    if (array.length >= 5 && showAllStatus) {
      return array.length;
    } else if (array.length > 0 && showAllStatus == false) {
      return 5;
    } else {
      return array.length;
    }
  };

  render() {
    return (
      <Modal
        className="add-membership-type-modal"
        title={AppConstants.bulkLockMatches}
        visible={true}
        maskClosable={false}
        closable={false}
        focusTriggerAfterClose={false}
        onOk={this.onLock}
        onCancel={this.props.onCancel}
        okText={AppConstants.lock}
        cancelButtonProps={{
          style: { position: 'absolute', left: 15 },
        }}
      >
        <div className="modal-publish-popup">
          {this.venueView()}
          {this.divisionView()}
          {this.timeslotLeftView()}
        </div>
      </Modal>
    );
  }

  onLock = () => {
    if (this.props.onSave) {
      const venueIds = this.state.venues
        .filter(venue => venue.checked === true)
        .map(venue => venue.id);
      const divisionIds = this.state.divisions
        .filter(division => division.checked === true)
        .map(division => division.divisionId);
      const timeslots = this.state.timeslotHourlyList
        .filter(timeslot => timeslot.checked === true)
        .map(timeslot => timeslot.key);
      if (!venueIds.length && !divisionIds.length && !timeslots.length) {
        message.error(AppConstants.selectOneVenue);
        return;
      }
      this.props.onSave({
        venueIds,
        divisionIds,
        timeslots,
      });
    }
  };
}
