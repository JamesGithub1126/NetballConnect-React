import React, { Component } from 'react';
import { Layout, Breadcrumb, Modal, Button } from 'antd';
import './liveScore.css';
import ReactPlayer from 'react-player';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Tooltip from 'react-png-tooltip';
import { EditorState, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import htmlToDraft from 'html-to-draftjs';
import InputWithHead from '../../customComponents/InputWithHead';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import history from '../../util/history';
import {
  newsNotificationAction,
  liveScoreDeleteNewsAction,
} from '../../store/actions/LiveScoreAction/liveScoreNewsAction';
import Loader from '../../customComponents/loader';
import { getKeyForStateWideMessage } from '../../util/sessionStorage';

const { Header, Footer, Content } = Layout;
const { confirm } = Modal;

class LiveScoreNewsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isVideo: false,
      modaldata: '',
      newsItem: props.location.state ? props.location.state.item : null,
      id: props.location.state ? (props.location.state.id ? props.location.state.id : null) : null,
      getDataLoading: false,
      deleteLoading: false,
      screenKey: props.location
        ? props.location.state
          ? props.location.state.screenKey
            ? props.location.state.screenKey
            : null
          : null
        : null,
      editorState: EditorState.createEmpty(),
    };
  }

  /// /method to show modal view after click
  showModal = (data, isVideo) => {
    this.setState({
      visible: true,
      modaldata: data,
      isVideo,
    });
  };

  /// /method to hide modal view after ok click
  handleOk = e => {
    this.setState({
      visible: false,
    });
  };

  /// /method to hide modal view after click on cancle button
  handleCancel = e => {
    this.setState({
      visible: false,
      modaldata: '',
    });
  };

  componentDidMount() {
    const newsData = this.state.newsItem;

    // let finalBody = newsData ? newsData.body ? JSON.parse(newsData.body) : "" : ""
    // const contentState = convertFromRaw({ "entityMap": {}, "blocks": finalBody });
    // const editorState = EditorState.createWithContent(contentState);
    // this.setState({
    //     editorState
    // })

    const html = newsData && newsData.body ? newsData.body : '';
    const contentBlock = htmlToDraft(html === 'null' ? '' : html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      const editorState = EditorState.createWithContent(contentState);
      this.setState({
        editorState,
      });
    }
  }

  componentDidUpdate(nextProps) {
    const newsState = this.props.liveScoreNewsState.notificationResult;
    const onLoad_2Data = this.props.liveScoreNewsState;
    if (nextProps.newsState !== newsState) {
      if (onLoad_2Data.notifyLoad == false && this.state.getDataLoading) {
        if (newsState !== []) {
          history.push(this.state.id === 'dashboard' ? '/matchDayDashboard' : './matchDayNewsList');
          // history.push(this.state.id === "dashboard" && "/matchDayDashboard")
        }
      }
      if (onLoad_2Data.onLoad_2 == false && this.state.deleteLoading) {
        if (this.props.liveScoreNewsState.deleteNews !== []) {
          history.push({
            pathname: '/matchDayNewsList',
            state: { screenKey: this.state.screenKey },
          });
        }
      }
    }
  }

  deleteTeam = newsId => {
    this.props.liveScoreDeleteNewsAction(newsId);
    this.setState({ deleteLoading: true });
  };

  // onclickDelete = () => {
  showDeleteConfirm = newsId => {
    const this_ = this;
    confirm({
      title: AppConstants.newsDeleteConfirm,
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk() {
        this_.deleteTeam(newsId);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  // }

  /// ////view for breadcrumb
  headerView = () => {
    const newsData = this.state.newsItem;
    return (
      <Header className="comp-venue-courts-header-view live-form-view-button-header">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.newsDetail}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="col-sm live-form-view-button-container d-flex justify-content-end">
            <NavLink
              to={{
                pathname: 'matchDayAddNews',
                state: { isEdit: true, item: this.state.newsItem, screenKey: this.state.screenKey },
              }}
            >
              <Button className="primary-add-comp-form mr-5" type="primary">
                {AppConstants.edit}
              </Button>
            </NavLink>
            <Button
              className="primary-add-comp-form "
              onClick={() => this.showDeleteConfirm(newsData.id)}
              type="primary"
            >
              {AppConstants.delete}
            </Button>
          </div>
        </div>
      </Header>
    );
  };

  /// /////form content view
  contentView = () => {
    const newsData = this.state.newsItem;
    const { editorState } = this.state;
    return (
      <div className="content-view pt-4">
        <InputWithHead heading={newsData ? newsData.title : history.push('/matchDayNewsList')} />
        {newsData && newsData.newsImage && (
          <img
            style={{ cursor: 'pointer' }}
            onClick={() => this.showModal(newsData.newsImage)}
            src={newsData ? newsData.newsImage : ''}
            height="100"
            width="100"
            alt=""
          />
        )}

        {/* <span className="input-heading">{newsData.body}</span> */}
        {/* <div className="input-heading" dangerouslySetInnerHTML={{ __html: newsData.body }} /> */}

        <div style={{ marginTop: -10 }}>
          <Editor toolbarHidden editorState={editorState} onChange={null} readOnly />
        </div>

        {newsData && newsData.newsVideo && (
          <div className="video-view mt-5">
            <video
              style={{ cursor: 'pointer' }}
              onClick={() => this.showModal(newsData.newsVideo, true)}
              src={newsData ? newsData.newsVideo : ''}
              height="100"
              width="150"
            />
          </div>
        )}
      </div>
    );
  };

  /// / this method called inside modal view function to show content of the modal
  innerViewOfModal() {
    return (
      <div className="comp-dashboard-botton-view-mobile d-flex justify-content-center">
        {this.state.isVideo ? (
          <ReactPlayer url={this.state.modaldata} playing={this.state.visible} controls />
        ) : (
          <img src={this.state.modaldata} height="250" width="250" alt="" />
        )}
      </div>
    );
  }

  /// /modal view
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
        footer={null}
      >
        {this.innerViewOfModal()}
      </Modal>
    );
  }

  /// ///footer view containing all the buttons like submit and cancel
  footerView() {
    const newsDataArr = this.state.newsItem;
    return (
      <div className="fluid-width">
        <div className="footer-view">
          <div className="row">
            <div className="col-sm">
              <div className="reg-add-save-button">
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => history.push('/matchDayNewsList')}
                  className="input-heading-add-another"
                >
                  {AppConstants.backToNews}
                </span>
              </div>
            </div>
            <div className="col-sm">
              <div className="comp-buttons-view d-flex flex-row justify-content-end">
                {
                  newsDataArr && !newsDataArr.published_at && (
                    // <div className="d-flex flex-row" style={{ paddingHorizontal: 50 }}>
                    <div className="d-flex flex-row">
                      <Button
                        className="open-reg-button mr-0"
                        type="primary"
                        onClick={() => this.onSubmitNewsPublish(newsDataArr, true)}
                      >
                        {AppConstants.publish}
                      </Button>
                      <div
                        className="align-items-center justify-content-center"
                        style={{ paddingRight: 20 }}
                      >
                        <Tooltip>
                          <span>{AppConstants.newsPublishMsg}</span>
                        </Tooltip>
                      </div>
                    </div>
                  )
                  // </div>
                }
                <div className="d-flex flex-row">
                  <Button
                    className="open-reg-button"
                    type="primary"
                    onClick={() => this.onSubmitNewsPublish(newsDataArr, false)}
                  >
                    {newsDataArr && !newsDataArr.published_at
                      ? AppConstants.publish_notify
                      : newsDataArr && newsDataArr.isActive == 1 && newsDataArr.isNotification == 1
                      ? AppConstants.notifyAgain
                      : AppConstants.notify}
                  </Button>
                  <div>
                    <Tooltip>
                      <span>{AppConstants.newsPublishNotifyMsg}</span>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  onSubmitNewsPublish = (data, value) => {
    this.props.newsNotificationAction(data, value, this.state.screenKey);
    this.setState({ getDataLoading: true });
  };

  /// /main render function
  render() {
    const stateWideMsg = getKeyForStateWideMessage();
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayNewsList')}
        />
        {stateWideMsg ? (
          <InnerHorizontalMenu menu="liveScoreNews" liveScoreNewsSelectedKey="21" />
        ) : (
          <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="21" />
        )}
        <Loader visible={this.props.liveScoreNewsState.notifyLoad} />
        <Layout>
          {this.headerView()}
          <Content>
            <div className="formView">{this.contentView()}</div>
            {this.ModalView()}
          </Content>
          <Footer>{this.footerView()}</Footer>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      newsNotificationAction,
      liveScoreDeleteNewsAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreNewsState: state.LiveScoreNewsState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreNewsView);
