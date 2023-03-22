import React, { Component } from 'react';
import { Layout, Breadcrumb, Select, Button, DatePicker, TimePicker, Form } from 'antd';
import InputWithHead from '../../customComponents/InputWithHead';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import './liveScore.css';
import moment from 'moment';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  liveScoreUpdateVenueChange,
  searchCourtList,
  clearFilter,
  onChangeVenueSaveAction,
} from '../../store/actions/LiveScoreAction/liveScoreVenueChamgeAction';
import { isArrayNotEmpty } from '../../util/helpers';
import { getLiveScoreCompetition } from '../../util/sessionStorage';
import { getCompetitionVenuesList } from '../../store/actions/LiveScoreAction/liveScoreMatchAction';
import history from '../../util/history';
import ValidationConstants from '../../themes/validationConstant';
import Loader from '../../customComponents/loader';
import Tooltip from 'react-png-tooltip';

const { Header, Footer, Content } = Layout;
const { Option } = Select;

class LiveScoreVenueChange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      comptitionId: null,
      saveLoad: false,
    };
    this.formRef = React.createRef();
  }

  componentDidMount() {
    if (getLiveScoreCompetition()) {
      const { id } = JSON.parse(getLiveScoreCompetition());
      this.setState({ comptitionId: id });
      if (id !== null) {
        this.props.getCompetitionVenuesList(id, this.state.search);
      } else {
        history.push('/matchDayCompetitions');
      }
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  componentDidUpdate(nextProps) {
    if (this.props.liveScoreVenueChangeState !== nextProps.liveScoreVenueChangeState) {
      if (this.props.liveScoreVenueChangeState.onLoad == false && this.state.saveLoad) {
        this.setState({ saveLoad: false });
        this.setInitialValues();
      }
    }
  }

  setInitialValues() {
    this.formRef.current.setFieldsValue({
      changeMatchDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      venues: [],
      courts: [],
      courtTo: [],
      venueTo: [],
    });
  }

  headerView = () => {
    return (
      <div className="header-view">
        <Header className="form-header-view d-flex bg-transparent align-items-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">{AppConstants.venueChange}</Breadcrumb.Item>
          </Breadcrumb>
        </Header>
      </div>
    );
  };

  contentView = () => {
    return (
      <div className="content-view pt-4">
        {/* <span className='text-heading-large' >{AppConstants.whatDoWantDO}</span> */}
        {this.venueChangeView()}
      </div>
    );
  };

  handleSearch = (value, data, key) => {
    const filteredData = data.filter(memo => {
      return memo.name.toLowerCase().indexOf(value.toLowerCase()) > -1;
    });
    this.props.searchCourtList(filteredData, key);
  };

  onSearchVenue(searchValue) {
    const { id } = JSON.parse(getLiveScoreCompetition());
    this.setState({ search: searchValue });
    this.props.getCompetitionVenuesList(id, searchValue);
  }

  onChangeVenue(venueId) {
    this.props.liveScoreUpdateVenueChange(venueId, 'venueId');
    this.formRef.current.setFieldsValue({
      courts: [],
    });
  }

  onChangeToVenue(venueId) {
    this.props.liveScoreUpdateVenueChange(venueId, 'changeToVenueId');
    this.formRef.current.setFieldsValue({
      courtTo: [],
    });
  }

  ////this method called after slecting Venue Change option from drop down
  venueChangeView() {
    const {
      // venueChangeData,
      venueData,
      courtData,
      mainCourtList,
    } = this.props.liveScoreVenueChangeState;
    let venueList = isArrayNotEmpty(venueData) ? venueData : [];
    let courtList = isArrayNotEmpty(courtData) ? courtData : [];
    return (
      <div>
        {/* start time date and time picker row */}
        <div className="d-flex align-items-center">
          <span className="text-heading-large mt-0 mb-0">{AppConstants.changeMatchCriteria}</span>
          <div className="mt-n10">
            <Tooltip>
              <span>{AppConstants.courtChangeMsg}</span>
            </Tooltip>
          </div>
        </div>

        <div className="fluid-width CornerView">
          <div className="row">
            <div className="col-sm" style={{ marginTop: 5 }}>
              <InputWithHead required="required-field pb-1" heading={AppConstants.startDate} />
              <Form.Item
                name="changeMatchDate"
                rules={[{ required: true, message: ValidationConstants.dateField }]}
              >
                <DatePicker
                  // size="large"
                  className="w-100"
                  format="DD-MM-YYYY"
                  placeholder="dd-mm-yyyy"
                  showTime={false}
                  onChange={startDate =>
                    this.props.liveScoreUpdateVenueChange(startDate, 'startDate')
                  }
                  // value={venueChangeData.startDate}
                />
              </Form.Item>
            </div>
            <div className="col-sm" style={{ marginTop: 5 }}>
              <InputWithHead required="required-field pb-1" heading={AppConstants.startTime} />
              <Form.Item
                name="startTime"
                rules={[{ required: true, message: ValidationConstants.timeField }]}
              >
                <TimePicker
                  className="comp-venue-time-timepicker w-100"
                  // defaultValue={moment("00:00", "hh:mm")}
                  format="hh:mm"
                  use12Hours={false}
                  placeholder="Select Time"
                  onChange={startTime =>
                    this.props.liveScoreUpdateVenueChange(startTime, 'startTime')
                  }
                  onBlur={e =>
                    this.props.liveScoreUpdateVenueChange(
                      e.target.value && moment(e.target.value, 'HH:mm'),
                      'startTime',
                    )
                  }
                  // value={venueChangeData.startTime}
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* end time date and time picker row */}

        <div className="fluid-width CornerView">
          <div className="row">
            <div className="col-sm" style={{ marginTop: 5 }}>
              <InputWithHead required="required-field pb-1" heading={AppConstants.endDate} />
              <Form.Item
                name="endDate"
                rules={[{ required: true, message: ValidationConstants.dateField }]}
              >
                <DatePicker
                  // size="large"
                  className="w-100"
                  format="DD-MM-YYYY"
                  placeholder="dd-mm-yyyy"
                  showTime={false}
                  name="registrationOepn"
                  onChange={endDate => this.props.liveScoreUpdateVenueChange(endDate, 'endDate')}
                  // value={venueChangeData.endDate}
                />
              </Form.Item>
            </div>
            <div className="col-sm" style={{ marginTop: 5 }}>
              <InputWithHead required="required-field pb-1" heading={AppConstants.endTime} />
              <Form.Item
                name="endTime"
                rules={[{ required: true, message: ValidationConstants.timeField }]}
              >
                <TimePicker
                  className="comp-venue-time-timepicker w-100"
                  // defaultValue={moment("00:00", "HH:mm")}
                  format="HH:mm"
                  placeholder="Select Time"
                  onChange={endTime => this.props.liveScoreUpdateVenueChange(endTime, 'endTime')}
                  onBlur={e =>
                    this.props.liveScoreUpdateVenueChange(
                      e.target.value && moment(e.target.value, 'HH:mm'),
                      'endTime',
                    )
                  }
                  // value={venueChangeData.endTime}
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* venue drop down view */}
        <InputWithHead required="required-field pb-1" heading={AppConstants.venue} />
        <div>
          <Form.Item
            name="venues"
            rules={[{ required: true, message: ValidationConstants.venueField }]}
          >
            <Select
              showSearch
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182 }}
              placeholder={AppConstants.selectVenue}
              onChange={venueId => this.onChangeVenue(venueId)}
              // value={venueChangeData.venueId}
              optionFilterProp="children"
              onSearch={e => this.onSearchVenue(e)}
            >
              {venueList.map(item => (
                <Option key={'venue_' + item.venueId} value={item.venueId}>
                  {item.venueName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* court drop down view */}
        <InputWithHead required="required-field pb-1" heading={AppConstants.court} />
        <Form.Item
          name="courts"
          rules={[{ required: true, message: ValidationConstants.court }]}
          className="form-conr space"
        >
          <Select
            showSearch
            mode="multiple"
            className="w-100"
            style={{ paddingRight: 1, minWidth: 182, paddingTop: 0, marginTop: 0 }}
            placeholder={AppConstants.selectCourt}
            onChange={courtId => {
              this.props.liveScoreUpdateVenueChange(courtId, 'courtId');
              this.props.clearFilter('court_1');
            }}
            // value={venueChangeData.courtId}
            onSearch={value => {
              this.handleSearch(value, mainCourtList, 'court_1');
            }}
            filterOption={false}
          >
            {courtList.map(item => (
              <Option key={'court_' + item.venueCourtId} value={item.venueCourtId}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </div>
    );
  }

  changeToView() {
    const {
      // venueChangeData,
      venueData,
      courtDataForChange,
      mainCourtList,
    } = this.props.liveScoreVenueChangeState;
    let venueList = isArrayNotEmpty(venueData) ? venueData : [];
    let courtList = isArrayNotEmpty(courtDataForChange) ? courtDataForChange : [];

    return (
      <div className="content-view mt-5">
        {/* venue drop down view */}
        <span className="text-heading-large">Change To</span>
        <InputWithHead required="required-field pb-1" heading={AppConstants.venue} />
        <div>
          <Form.Item
            name="venueTo"
            rules={[{ required: true, message: ValidationConstants.venueField }]}
          >
            <Select
              showSearch
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182 }}
              placeholder={AppConstants.selectVenue}
              onChange={venueId => this.onChangeToVenue(venueId)}
              // value={venueChangeData.changeToVenueId}
              optionFilterProp="children"
              onSearch={e => this.onSearchVenue(e)}
            >
              {venueList.map(item => (
                <Option key={'venue_' + item.venueId} value={item.venueId}>
                  {item.venueName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* court drop down view */}
        <InputWithHead required="required-field pb-1" heading={AppConstants.court} />
        <div>
          <Form.Item
            name="courtTo"
            rules={[{ required: true, message: ValidationConstants.court }]}
          >
            <Select
              // mode='multiple'
              showSearch
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182 }}
              placeholder={AppConstants.selectCourt}
              onChange={courtId => {
                this.props.liveScoreUpdateVenueChange(courtId, 'changeToCourtId');
                this.props.clearFilter('court_2');
              }}
              // value={venueChangeData.changeToCourtId}
              onSearch={value => {
                this.handleSearch(value, mainCourtList, 'court_2');
              }}
              filterOption={false}
            >
              {courtList.map(item => (
                <Option key={'court_' + item.venueCourtId} value={item.venueCourtId}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      </div>
    );
  }

  //////footer view containing all the buttons like submit and cancel
  footerView = isSubmitting => {
    return (
      <div className="fluid-width">
        <div className="footer-view bulk">
          <div className="row">
            <div className="col-sm">
              <div className="reg-add-save-button">
                <Button
                  className="cancelBtnWidth"
                  onClick={() => history.push('/matchDayDashboard')}
                  type="cancel-button"
                >
                  {AppConstants.cancel}
                </Button>
              </div>
            </div>
            <div className="col-sm">
              <div className="comp-buttons-view">
                <Button
                  className="publish-button save-draft-text mr-0"
                  type="primary"
                  htmlType="submit"
                  disabled={isSubmitting}
                >
                  {AppConstants.save}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  date_formate(date, time) {
    let startDate = moment(date).format('YYYY-MM-DD');
    let startTime = moment(time).format('HH:mm');
    let postStartDate = moment(startDate + ' ' + startTime);
    let formatedStartDate = new Date(postStartDate).toISOString();
    return formatedStartDate;
  }

  handleSubmit = e => {
    let details = this.props.liveScoreVenueChangeState.venueChangeData;
    let startDateTime = this.date_formate(details.startDate, details.startTime);
    let endDateTime = this.date_formate(details.endDate, details.endTime);
    this.props.onChangeVenueSaveAction(
      details,
      startDateTime,
      endDateTime,
      this.state.comptitionId,
    );
    this.setState({ saveLoad: true });
  };

  render() {
    return (
      <div className="fluid-width">
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="13" />
        <Layout>
          <Loader visible={this.props.liveScoreVenueChangeState.onLoad} />
          {this.headerView()}
          <Form ref={this.formRef} onFinish={this.handleSubmit} noValidate="noValidate">
            <Content>
              <div className="formView">{this.contentView()}</div>
              <div className="formView">{this.changeToView()}</div>
            </Content>
            <Footer>{this.footerView()}</Footer>
          </Form>
        </Layout>

        {/* <Layout>
                    <Content>
                        <div className="formView">{this.changeToView()}</div>
                    </Content>
                    <Footer >{this.footerView()}</Footer>
                </Layout> */}
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      liveScoreUpdateVenueChange,
      getCompetitionVenuesList,
      searchCourtList,
      clearFilter,
      onChangeVenueSaveAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreVenueChangeState: state.LiveScoreVenueChangeState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreVenueChange);
