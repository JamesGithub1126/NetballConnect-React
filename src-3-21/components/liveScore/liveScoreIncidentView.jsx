import React, { Component } from 'react';
import { Layout, Breadcrumb, Modal, Button } from 'antd';
import './liveScore.css';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import ReactPlayer from 'react-player';
import { get } from 'lodash';
import {
  // liveScore_formateDateTime,
  liveScore_formateDate,
  getTime,
} from '../../themes/dateformate';
import {
  isArrayNotEmpty,
  // isNotNullOrEmptyString
} from '../../util/helpers';
import history from '../../util/history';
import { NavLink } from 'react-router-dom';

const { Header, Content } = Layout;

class LiveScoreIncidentView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      modaldata: '',
      isVideo: false,
      incidentItem: props.location.state ? props.location.state.item : null,
      screenName: props.location.state
        ? props.location.state.screenName
          ? props.location.state.screenName
          : null
        : null,
      umpireKey: this.props.location
        ? this.props.location.state
          ? this.props.location.state.umpireKey
          : null
        : null,
    };
  }

  componentDidMount() {
    let incidentData = this.props.location.state ? this.props.location.state.item : null;
    if (!incidentData) {
      history.push('/matchDayIncidentList');
    }
  }

  ////method to show modal view after click
  showModal = (data, isVideo) => {
    this.setState({
      visible: true,
      modaldata: data,
      isVideo: isVideo,
    });
  };

  ////method to hide modal view after ok click
  handleOk = e => {
    this.setState({
      visible: false,
      modaldata: '',
    });
  };

  ////method to hide modal view after click on cancle button
  handleCancel = e => {
    this.setState({
      visible: false,
      modaldata: '',
    });
  };

  headerView = () => {
    return (
      <Header className="comp-venue-courts-header-view live-form-view-button-header">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.incidentDetails}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="col-sm live-form-view-button-container d-flex justify-content-end">
            <NavLink
              to={{
                pathname: '/matchDayAddIncident',
                state: {
                  isEdit: true,
                  tableRecord: this.state.incidentItem,
                  umpireKey: this.state.umpireKey,
                },
              }}
            >
              <Button className="primary-add-comp-form" type="primary">
                {AppConstants.edit}
              </Button>
            </NavLink>
          </div>
        </div>
      </Header>
    );
  };

  //// this method called inside modal view function to show content of the modal
  innerViewOfModal() {
    return (
      <div className="comp-dashboard-botton-view-mobile d-flex justify-content-center">
        {this.state.isVideo ? (
          <ReactPlayer playing={this.state.visible} url={this.state.modaldata} controls />
        ) : (
          <img src={this.state.modaldata} height="250" width="250" alt="" />
        )}
      </div>
    );
  }

  ////modal view
  ModalView() {
    return (
      <Modal
        // title="WSA 1"
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { display: 'none' } }}
        centered
        // footer={null}
      >
        {this.innerViewOfModal()}
      </Modal>
    );
  }

  // Detail List
  detailsView = () => {
    let DATA = this.state.incidentItem;
    return (
      <div className="row p-4">
        <div className="col-sm">
          <div>
            <span className="year-select-heading">Incident Date</span>
          </div>
          <div className="pt-2">
            <span className="side-bar-profile-data">
              {DATA && liveScore_formateDate(DATA.incidentTime)}
            </span>
          </div>
        </div>

        <div className="col-sm">
          <div>
            <span className="year-select-heading">Time</span>
          </div>
          <div className="pt-2">
            <span className="side-bar-profile-data">{DATA && getTime(DATA.incidentTime)}</span>
          </div>
        </div>
        <div className="col-sm">
          <div>
            <span className="year-select-heading">Match Id</span>
          </div>
          <div className="pt-2">
            <span className="side-bar-profile-data">{DATA && DATA.matchId}</span>
          </div>
        </div>
        <div className="col-sm">
          <div>
            <span className="year-select-heading">Incident Type</span>
          </div>
          <div className="pt-2">
            <span className="side-bar-profile-data">{DATA && DATA.incidentType.name}</span>
          </div>
        </div>
      </div>
    );
  };

  getWitnessesTemplateList = () => {
    const witnessList = get(this.state, 'incidentItem.witnesses') || [];

    return witnessList.length > 0 ? (
      <div className="row mb-4">
        <div className="col-sm-2">
          <div className="year-select-heading">
            <span>{AppConstants.witnesses}</span>
          </div>
        </div>
        <div className="col-sm-10">
          {witnessList.map(item => (
            <div className="side-bar-profile-data" key={item.name + item.phone}>
              <span className="mr-4">
                <i>Name: </i>
                {item.name}
              </span>
              <span>
                <i>Phone: </i>
                {item.phone}
              </span>
            </div>
          ))}
        </div>
      </div>
    ) : null;
  };

  getOffencesTemplateList = () => {
    const offencesList = get(this.state, 'incidentItem.offences') || [];

    return offencesList.length > 0 ? (
      <div className="row mb-4">
        <div className="col-sm-2">
          <div className="year-select-heading">
            <span>{AppConstants.offences}</span>
          </div>
        </div>
        <div className="col-sm-10">
          {offencesList.map(item => (
            <div className="side-bar-profile-data" key={item.name}>
              {item.description}
            </div>
          ))}
        </div>
      </div>
    ) : null;
  };

  getClarifyingQuestionsTemplateList = () => {
    const clarifyingQuestionsList = get(this.state, 'incidentItem.clarifyingQuestions') || [];

    return clarifyingQuestionsList.length > 0 ? (
      <div className="row mb-4">
        <div className="col-sm-2">
          <div className="year-select-heading">
            <span>{AppConstants.clarifyingQuestions}</span>
          </div>
        </div>
        <div className="col-sm-10">
          {clarifyingQuestionsList.map((item, index) => (
            <ul key={item.question.substring(0, 16) + index}>
              <li className="side-bar-profile-data">
                <i>{item.question}</i>
                <div>- {item.answer}</div>
              </li>
            </ul>
          ))}
        </div>
      </div>
    ) : null;
  };

  getReportRefereeTemplate = () => {
    const {
      userId,
      competitionId,
      foulPlayer,
      foulPlayerRole,
      suspension = {},
    } = this.state.incidentItem;
    if (!foulPlayer) return null;

    const rowsData = [
      { titleKey: 'userId', value: userId },
      { titleKey: 'competitionId', value: competitionId },
      {
        titleKey: 'foulPlayerName',
        value: foulPlayer ? foulPlayer.firstName + ' ' + foulPlayer.lastName : '',
      },
      { titleKey: 'foulPlayerRole', value: foulPlayerRole },
      { titleKey: 'suspendedFrom', value: liveScore_formateDate(suspension.suspendedFrom) },
      { titleKey: 'suspendedTo', value: liveScore_formateDate(suspension.suspendedTo) },
    ];
    return (
      <>
        {rowsData.map(row => {
          if (!row.value) return null;

          return (
            <div className="row mb-2" key={row.titleKey}>
              <div className="col-sm-2">
                <div className="year-select-heading">
                  <span>{AppConstants[row.titleKey]}</span>
                </div>
              </div>

              <div className="col-sm-10">
                <div className="side-bar-profile-data">
                  <span>{row.value}</span>
                </div>
              </div>
            </div>
          );
        })}

        {this.getWitnessesTemplateList()}
        {this.getOffencesTemplateList()}
        {this.getClarifyingQuestionsTemplateList()}
      </>
    );
  };

  mediaView = () => {
    let array = this.state.incidentItem ? this.state.incidentItem.incidentPlayers : [];
    let mediaPlayer = this.state.incidentItem
      ? isArrayNotEmpty(this.state.incidentItem.incidentMediaList)
        ? this.state.incidentItem.incidentMediaList
        : []
      : [];

    return (
      <div className="col-sm pt-3 pb-3 mt-5">
        <div className="row">
          <div className="col-sm-2">
            <div className="year-select-heading">
              <span>{AppConstants.playerHeading}</span>
            </div>
          </div>

          <div className="col-sm-10">
            {array.map((item, index) => (
              <div className="side-bar-profile-data" key={item.player.id + index}>
                <span>
                  {item.player.firstName} {item.player.lastName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {this.getReportRefereeTemplate()}

        <div className="row mt-2">
          <div className="col-sm-2">
            <div className="year-select-heading">
              <span>{AppConstants.description}</span>
            </div>
          </div>

          <div className="col-sm-10">
            {/* {array.map((item) => ( */}
            <div className="side-bar-profile-data">
              <span>{this.state.incidentItem.description}</span>
            </div>
            {/* ))} */}
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-sm-2">
            <div className="year-select-heading">
              <span>{AppConstants.photos}</span>
            </div>
          </div>

          <div className="col-sm-10">
            <div className="row pl-3">
              {mediaPlayer.map(item => {
                var str = item.mediaType;
                var res = str.split('/', 1);
                return (
                  <div className="side-bar-profile-data" key={'media' + item.id}>
                    {res[0] === 'video' ? (
                      <video
                        className="col-sum m-2 "
                        style={{ cursor: 'pointer' }}
                        onClick={() => this.showModal(item.mediaUrl, true)}
                        src={item.mediaUrl ? item.mediaUrl : ''}
                        height="70"
                        width="70"
                      />
                    ) : (
                      <img
                        className="col-sum m-2 "
                        style={{ cursor: 'pointer' }}
                        onClick={() => this.showModal(item.mediaUrl, false)}
                        src={item.mediaUrl ? item.mediaUrl : ''}
                        height="70"
                        width="70"
                        alt=""
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    let screen = this.props.location.state
      ? this.props.location.state.screenName
        ? this.props.location.state.screenName
        : null
      : null;
    return (
      <div className="fluid-width default-bg">
        {this.state.umpireKey ? (
          <DashboardLayout menuHeading={AppConstants.umpires} menuName={AppConstants.umpires} />
        ) : (
          <DashboardLayout
            menuHeading={AppConstants.matchDay}
            menuName={AppConstants.liveScores}
            onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
          />
        )}

        {this.state.umpireKey ? (
          <InnerHorizontalMenu
            menu={'umpire'}
            umpireSelectedKey={screen === 'umpireList' ? '2' : '1'}
          />
        ) : (
          <InnerHorizontalMenu
            menu={'liveScore'}
            liveScoreSelectedKey={this.state.screenName === 'dashboard' ? '1' : '17'}
          />
        )}
        <Layout>
          {this.headerView()}
          <Content>
            <div className="formView">{this.detailsView()}</div>
            <div className="formView">{this.mediaView()}</div>
            {this.ModalView()}
          </Content>
        </Layout>
      </div>
    );
  }
}

export default LiveScoreIncidentView;
