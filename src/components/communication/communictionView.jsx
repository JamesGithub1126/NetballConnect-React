import React, { Component } from 'react';
import { Layout, Breadcrumb, Modal, Button, Checkbox, Form, message } from 'antd';
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
import {
  communicationPublishAction,
  deleteCommunicationAction,
} from '../../store/actions/communicationAction/communicationAction';
import { getOrganisationData } from '../../util/sessionStorage';
import CustomToolTip from 'react-png-tooltip';
import ValidationConstants from '../../themes/validationConstant';
import { getUserModulePersonalDetailsAction } from '../../store/actions/userAction/userAction';
import {
  createPostAction,
  getStrapiTokenAction,
} from '../../store/actions/strapiAction/strapiAction';
import { generatePostUrlFromTitle } from '../websites/news/utils';

const { Header, Footer, Content } = Layout;
const { confirm } = Modal;

class CommunicationView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isVideo: false,
      modalData: '',
      communicationItem: props.location.state?.item,
      screenKey: props.location
        ? props.location.state
          ? props.location.state.screenKey
            ? props.location.state.screenKey
            : null
          : null
        : null,
      editorState: EditorState.createEmpty(),
      isEmailPublished: false,
      showModal: false,
      email: '',
    };
    this.formRef = React.createRef();
  }

  componentDidMount() {
    const websiteId = getOrganisationData().websiteId;
    const communicationData = this.state.communicationItem;
    const html = communicationData && communicationData.body ? communicationData.body : '';
    const contentBlock = htmlToDraft(html);
    if (+communicationData.isEmail === 1 || +communicationData.prevCommunicationIsEmail === 1) {
      this.setState({ isEmailPublished: true });
    }
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      const editorState = EditorState.createWithContent(contentState);
      this.setState({
        editorState,
      });
    }

    const userId = localStorage.getItem('userId');
    this.props.getUserModulePersonalDetailsAction({
      userId: userId,
      organisationId: null,
    });

    // if websiteId exist - fetch strapi token for ongoing requests
    if (websiteId) {
      this.props.getStrapiTokenAction();
    }
  }

  componentDidUpdate(nextProps) {
    const { communicationState } = this.props;
    if (nextProps.communicationState !== communicationState) {
      if (
        nextProps.communicationState.deleteSuccess !== communicationState.deleteSuccess &&
        communicationState.deleteSuccess === true
      ) {
        history.push({
          pathname: '/communicationList',
          state: { screenKey: this.state.screenKey },
        });
      }

      if (
        nextProps.communicationState.publishSuccess !== communicationState.publishSuccess &&
        communicationState.publishSuccess === true
      ) {
        history.push({
          pathname: '/communicationList',
          state: { screenKey: this.state.screenKey },
        });
      }
    }

    if (nextProps.userState !== this.props.userState) {
      if (nextProps.userState.personalData !== this.props.userState.personalData) {
        this.setState({ email: this.props.userState.personalData.email });
        this.formRef.current.setFieldsValue({
          email: this.props.userState.personalData.email,
        });
      }
    }
  }

  // method to show modal view after click
  showModal = (data, isVideo) => {
    this.setState({
      visible: true,
      modalData: data,
      isVideo,
    });
  };

  // method to hide modal view after ok click
  handleOk = e => {
    this.setState({
      visible: false,
    });
  };

  // method to hide modal view after click on cancle button
  handleCancel = e => {
    this.setState({
      visible: false,
      modalData: '',
    });
  };

  deleteCommunication = () => {
    const { id } = this.state.communicationItem;
    this.props.deleteCommunicationAction(id);
  };

  // onclickDelete = () => {
  showDeleteConfirm = () => {
    const this_ = this;
    confirm({
      title: AppConstants.communicationDeleteConfirm,
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk() {
        this_.deleteCommunication();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  publishCommunication = action => {
    if (action !== 'cancel') {
      const { id, isNotification, isEmail, isApp, isWebsite } = this.state.communicationItem;
      this.props.communicationPublishAction({
        id,
        isNotification,
        isEmail,
        email: isEmail ? this.state.email : '',
        isApp,
        isWebsite,
        isDontSendEmail: action === 'no',
        organisationUniqueKey: getOrganisationData().organisationUniqueKey,
      });
    }
    this.setState({ showModal: false });
  };

  // view for breadcrumb
  headerView = () => (
    <Header className="comp-venue-courts-header-view live-form-view-button-header">
      <div className="row">
        <div className="col-sm" style={{ display: 'flex', alignContent: 'center' }}>
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.communicationDetails}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div
          className="col-sm live-form-view-button-container"
          style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <NavLink
            to={{
              pathname: 'addCommunication',
              state: {
                isEdit: true,
                item: this.state.communicationItem,
                screenKey: this.state.screenKey,
              },
            }}
          >
            <Button className="primary-add-comp-form mr-5" type="primary">
              {AppConstants.edit}
            </Button>
          </NavLink>
          <Button className="primary-add-comp-form" onClick={() => this.showDeleteConfirm()}>
            {AppConstants.delete}
          </Button>
        </div>
      </div>
    </Header>
  );

  // form content view
  contentView = () => {
    const communicationData = this.state.communicationItem;
    const { editorState } = this.state;
    return (
      <div className="content-view pt-4">
        <InputWithHead
          heading={communicationData ? communicationData.title : history.push('/communicationList')}
        />
        {communicationData && communicationData.imageUrl && (
          <img
            style={{ cursor: 'pointer' }}
            onClick={() => this.showModal(communicationData.imageUrl)}
            src={communicationData ? communicationData.imageUrl : ''}
            height="100"
            width="100"
          />
        )}

        <div style={{ marginTop: -10 }}>
          <Editor toolbarHidden editorState={editorState} onChange={null} readOnly />
        </div>

        {communicationData && communicationData.videoUrl && (
          <div className="video-view mt-5">
            <video
              style={{ cursor: 'pointer' }}
              onClick={() => this.showModal(communicationData.videoUrl, true)}
              src={communicationData ? communicationData.videoUrl : ''}
              height="100"
              width="150"
            />
          </div>
        )}
      </div>
    );
  };

  handleSubmitCommunicationPublish = () => {
    const { id, isNotification, isEmail, isApp, isWebsite } = this.state.communicationItem;

    if (this.state.isEmailPublished && isEmail) {
      this.setState({ showModal: true });
    } else {
      this.props.communicationPublishAction({
        id,
        isNotification,
        isEmail,
        email: isEmail ? this.state.email : '',
        isApp,
        isWebsite,
        organisationUniqueKey: getOrganisationData().organisationUniqueKey,
      });
    }
  };

  onSubmitCommunicationPublish = () => {
    const websiteId = getOrganisationData().websiteId;
    const { isWebsite, title } = this.state.communicationItem;
    const strapiJWTToken = this.props.strapiState.token;

    // if organisation websiteId exists and checkbox selected - create website news/post
    if (websiteId && isWebsite) {
      const payload = {
        strapi_auth_token: strapiJWTToken,
        title,
        site: websiteId,
        url: generatePostUrlFromTitle(title),
        is_active: true,
      };

      this.props.createPostAction(payload, this.handleSubmitCommunicationPublish);
    } else {
      this.handleSubmitCommunicationPublish();
    }
  };

  communicationView() {
    const { communicationItem: communicationData, showModal } = this.state;
    const websiteExists = getOrganisationData().websiteId;

    return (
      <div className="content-view pt-5">
        <div className="row">
          <div className="col-sm" style={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox
              className="single-checkbox"
              checked={communicationData?.isEmail}
              onClick={e => {
                this.setState({
                  communicationItem: {
                    ...communicationData,
                    isEmail: e.target.checked,
                  },
                });
              }}
            >
              {AppConstants.email}
              <CustomToolTip>
                <span>{AppConstants.emailContextual}</span>
              </CustomToolTip>
            </Checkbox>
          </div>
          <div className="col-sm" style={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox
              className="single-checkbox"
              checked={communicationData?.isNotification}
              onClick={e => {
                this.setState({
                  communicationItem: {
                    ...communicationData,
                    isNotification: e.target.checked,
                    isApp: e.target.checked,
                  },
                });
              }}
            >
              {AppConstants.notification}
              <CustomToolTip>
                <span>{AppConstants.notificationContextual}</span>
              </CustomToolTip>
            </Checkbox>
          </div>
          <div className="col-sm" style={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox
              className="single-checkbox"
              checked={communicationData?.isApp}
              onClick={e => {
                this.setState({
                  communicationItem: {
                    ...communicationData,
                    isApp: e.target.checked,
                  },
                });
              }}
              disabled={communicationData?.isNotification}
            >
              {AppConstants.app}
              <CustomToolTip>
                <span>{AppConstants.appContextual}</span>
              </CustomToolTip>
            </Checkbox>
          </div>
          {websiteExists ? (
            <div className="col-sm" style={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                className="single-checkbox"
                checked={communicationData?.isWebsite}
                onClick={e => {
                  this.setState({
                    communicationItem: {
                      ...communicationData,
                      isWebsite: e.target.checked,
                    },
                  });
                }}
                disabled={communicationData?.isNotification}
              >
                {AppConstants.website}
                <CustomToolTip>
                  <span>{AppConstants.websiteContextual}</span>
                </CustomToolTip>
              </Checkbox>
            </div>
          ) : null}
          <Modal
            title={AppConstants.publishCommunicationTitle}
            className="add-membership-type-modal"
            visible={showModal}
            onCancel={() => this.publishCommunication('cancel')}
            footer={[
              <Button onClick={() => this.publishCommunication('no')}>
                {AppConstants.no}
              </Button>,
              <Button type="primary" onClick={() => this.publishCommunication('yes')}>
                {AppConstants.yes}
            </Button>,
            ]}
          >
            <div>{AppConstants.publishCommunication}</div>
          </Modal>
        </div>
        {communicationData?.isEmail ? (
          <div className="row">
            <div className="col-sm" style={{ display: 'flex', alignItems: 'center' }}>
              <Form.Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: ValidationConstants.emailField[0],
                  },
                  {
                    type: 'email',
                    pattern: new RegExp(AppConstants.emailExp),
                    message: ValidationConstants.email_validation,
                  },
                ]}
                style={{ width: '400px' }}
              >
                <InputWithHead
                  required="required-field pb-0 pt-3"
                  heading={AppConstants.replyTo}
                  style={{ marginTop: '10px' }}
                  placeholder={AppConstants.replyTo}
                  name="email"
                  onChange={event => this.setState({ email: event.target.value })}
                  value={this.state.email}
                />
              </Form.Item>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  }

  // this method called inside modal view function to show content of the modal
  innerViewOfModal() {
    return (
      <div
        className="comp-dashboard-botton-view-mobile"
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        {this.state.isVideo ? (
          <ReactPlayer url={this.state.modalData} playing={this.state.visible} controls />
        ) : (
          <img src={this.state.modalData} height="250" width="250" />
        )}
      </div>
    );
  }

  // modal view
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

  // footer view containing all the buttons like submit and cancel
  footerView() {
    return (
      <div className="fluid-width">
        <div className="footer-view">
          <div className="row">
            <div className="col-sm">
              <div className="reg-add-save-button">
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => history.push('/communicationList')}
                  className="input-heading-add-another"
                >
                  {AppConstants.backToCommunication}
                </span>
              </div>
            </div>
            <div className="col-sm">
              <div
                className="comp-buttons-view"
                style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}
              >
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <Button className="open-reg-button mr-0" type="primary" htmlType="submit">
                    {AppConstants.publish}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  onFinishFailed = () => {
    message.config({ maxCount: 1, duration: 1.5 });
    message.error(ValidationConstants.plzReviewPage);
  };

  // main render function
  render() {
    return (
      <div className="fluid-width default-bg">
        <Loader
          visible={
            this.props.communicationState.onDeleteLoad ||
            this.props.communicationState.onPublishLoad ||
            this.props.strapiState.onLoad
          }
        />
        <DashboardLayout
          menuHeading={AppConstants.Communication}
          menuName={AppConstants.Communication}
        />
        <InnerHorizontalMenu menu="communication" userSelectedKey="1" />
        <Layout>
          {this.headerView()}
          <Form
            ref={this.formRef}
            autoComplete="off"
            noValidate="noValidate"
            onFinish={this.onSubmitCommunicationPublish}
            onFinishFailed={this.onFinishFailed}
          >
            <Content>
              <div className="formView">{this.contentView()}</div>

              <div className="formView mt-5">{this.communicationView()}</div>
              {this.ModalView()}
            </Content>
            <Footer>{this.footerView()}</Footer>
          </Form>
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
      deleteCommunicationAction,
      communicationPublishAction,
      getUserModulePersonalDetailsAction,
      getStrapiTokenAction,
      createPostAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    communicationState: state.CommunicationState,
    strapiState: state.StrapiReducerState,
    userState: state.UserState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CommunicationView);
