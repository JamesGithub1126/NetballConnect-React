import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Breadcrumb, Button, Checkbox, Form, Layout, message, Radio, Spin } from 'antd';

import AppConstants from 'themes/appConstants';
import ValidationConstants from 'themes/validationConstant';
import history from 'util/history';
import { getLiveScoreCompetition, getOrganisationData } from 'util/sessionStorage';
import {
  clearEditBannerAction,
  getLiveScoreBanners,
  liveScoreAddBanner,
  liveScoreAddBannerUpdate,
} from 'store/actions/LiveScoreAction/liveScoreBannerAction';
import { getBannerCnt } from 'store/actions/userAction/userAction';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';
import InputWithHead from 'customComponents/InputWithHead';
import Loader from 'customComponents/loader';
import ImageLoader from 'customComponents/ImageLoader';
import { isImageFormatValid, isImageSizeValid } from '../../util/helpers';

import './liveScore.css';

const { Header, Content, Footer } = Layout;

class LiveScoreEditBanners extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageError: '',
      bannerImg: null,
      bannerImgSend: null,
      tableRecord: props.location.state ? props.location.state.tableRecord : null,
      isEdit: props.location.state ? props.location.state.isEdit : null,
      load: false,
      numCompBanner: -1,
    };

    props.clearEditBannerAction();

    this.formRef = React.createRef();
  }

  componentDidMount() {
    let bannerImgSend = this.state.tableRecord ? this.state.tableRecord.bannerUrl : null;
    this.setState({ bannerImgSend });
    const { organisationId } = getOrganisationData() ? getOrganisationData() : null;
    if (organisationId !== null) {
      this.props.getBannerCnt(organisationId);

      if (this.state.isEdit === true) {
        this.props.liveScoreAddBannerUpdate(this.state.tableRecord, 'isEditBanner');
        this.formRef.current.setFieldsValue({ format: this.state.tableRecord.format });
      } else {
        const { id } = JSON.parse(localStorage.getItem('LiveScoreCompetition'));
        this.props.getLiveScoreBanners(id);
        this.props.liveScoreAddBannerUpdate('', 'isAddBanner');
      }
    }
  }

  componentDidUpdate() {
    const { bannerResult } = this.props.liveScoreBannerState;

    if (this.state.load === true && this.props.liveScoreBannerState.onLoad === false) {
      this.goBack();
      this.setState({ load: false });
    }

    if (!this.props.userState.onLoad && this.props.userState.status) {
      const { bannerCount } = this.props.userState;
      if (bannerCount) {
        if (this.state.numCompBanner !== bannerCount.numCompBanner) {
          this.setState({ numCompBanner: bannerCount.numCompBanner });
        }
        if (!this.state.isEdit) {
          if (
            this.props.userState.bannerCount.numCompBanner >= 0 &&
            bannerResult.length >= this.props.userState.bannerCount.numCompBanner
          ) {
            this.goBack();
            message.warning(AppConstants.maxBannerCount);
          }
        }
      }
    }
  }

  goBack = () => {
    history.push('/matchDayBanners');
  };

  // Image picker
  selectImage = () => {
    const fileInput = document.getElementById('user-pic');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    if (fileInput) {
      fileInput.click();
    }
  };

  onSelectBanner = (/* data */) => {
    const fileInput = document.getElementById('user-pic');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    if (fileInput) {
      fileInput.click();
    }
  };

  setImage_1 = data => {
    if (data.files[0] !== undefined) {
      if (this.state.isEdit === true) {
        this.props.location.state.tableRecord.bannerUrl = null;
      }

      // this.setState({ bannerImgSend: data.files[0], bannerImg: URL.createObjectURL(data.files[0]) })
      this.setState({
        bannerImgSend: data.files[0],
        bannerImg: URL.createObjectURL(data.files[0]),
      });
    }
  };

  setImage = data => {
    if (data.files[0] !== undefined) {
      let file = data.files[0];
      let extension = file.name.split('.').pop().toLowerCase();
      let imageSizeValid = isImageSizeValid(file.size);
      let isSuccess = isImageFormatValid(extension);
      if (!isSuccess) {
        message.error(AppConstants.logo_Image_Format);
        return;
      } else if (!imageSizeValid) {
        message.error(AppConstants.logo_Image_Size);
        return;
      } else {
        if (this.state.isEdit === true) {
          this.props.location.state.tableRecord.bannerUrl = null;
        }
        this.setState({
          bannerImgSend: data.files[0],
          bannerImg: URL.createObjectURL(data.files[0]),
          timeout: 2000,
        });
        setTimeout(() => {
          this.setState({ timeout: null });
        }, 1000);
      }
    }
  };

  loaderView = () => (
    <div className="d-flex justify-content-center align-items-center">
      <Spin size="small" />
      <Spin />
      <Spin size="large" />
    </div>
  );

  loaderView2 = () => (
    <div className="d-flex justify-content-center align-items-center">
      {/* <Spin size="small" /> */}
      <Spin />
      {/* <Spin size="large" /> */}
    </div>
  );

  handleSubmit = (/* values */) => {
    this.onUploadButton();
  };

  onUploadButton = () => {
    const {
      // showOnHome,
      // showOnDraws,
      // showOnLadder,
      // showOnNews,
      // showOnChat,
      format,
      bannerLink,
      bannerUrl,
    } = this.props.liveScoreBannerState;
    const editBannerId = this.props.location.state
      ? this.props.location.state.tableRecord.id
      : null;

    let id = null;
    if (getLiveScoreCompetition()) {
      id = JSON.parse(getLiveScoreCompetition()).id;
    }
    const { organisationId } = getOrganisationData() || {};

    // const showOnhome = showOnHome === true ? 1 : 0;
    // const showOndraws = showOnDraws === true ? 1 : 0;
    // const showOnladder = showOnLadder === true ? 1 : 0;
    // const showOnnews = showOnNews === true ? 1 : 0;
    // const showOnchat = showOnChat === true ? 1 : 0;
    if (id !== null) {
      if (this.state.bannerImgSend === null && !bannerUrl) {
        message.error(ValidationConstants.bannerImage);
        message.config({
          duration: 1.5,
          maxCount: 1,
        });
        return;
      } else {
        const bannerId = this.state.isEdit === true ? editBannerId : 0;
        this.props.liveScoreAddBanner(
          organisationId,
          id,
          this.state.bannerImgSend,
          // showOnhome,
          // showOndraws,
          // showOnladder,
          // showOnnews,
          // showOnchat,
          format,
          bannerLink,
          bannerId,
        );
      }
    }

    this.setState({ load: true });
  };

  onChangeFormat = e => {
    this.props.liveScoreAddBannerUpdate(e.target.value, 'format');

    if (e.target.value === 'Square') {
      this.props.liveScoreAddBannerUpdate(0, 'showOnChat');
      this.props.liveScoreAddBannerUpdate(0, 'showOnDraws');
      this.props.liveScoreAddBannerUpdate(0, 'showOnLadder');
    }
  };

  /// /////form content view
  contentView = () => {
    const { bannerLink, format, bannerUrl } = this.props.liveScoreBannerState;
    const bannerImage = this.state.bannerImg || bannerUrl;

    return (
      <div className="content-view pt-2">
        {/* <img alt="" className="banner-image" src={bannerImage ? bannerImage : this.state.bannerImg} /> */}
        <ImageLoader
          className="banner-image"
          height
          width
          borderRadius
          timeout={this.state.timeout}
          src={bannerImage}
        />
        <div>
          <div className="row">
            <div className="col-sm">
              <span className="user-contact-heading">{AppConstants.uploadImage}</span>
              <div onClick={this.selectImage}>{/* <label></label> */}</div>
              <Form.Item
                name="bannerImage"
                rules={[
                  {
                    required: !bannerImage,
                    message: ValidationConstants.bannerImage,
                  },
                ]}
              >
                <input
                  required="pb-0"
                  type="file"
                  id="user-pic"
                  accept="image/*"
                  // style={{ display: 'none' }}
                  // onChange={(evt) => {
                  //     this.setImage(evt.target);
                  //     this.setState({ timeout: 1000 });
                  //     setTimeout(() => {
                  //         this.setState({ timeout: null });
                  //     }, 1000);
                  // }}
                  onChange={evt => this.setImage(evt.target)}
                  onClick={event => {
                    event.target.value = null;
                  }}
                />
              </Form.Item>
              <span className="image-size-format-text">{AppConstants.imageSizeFormatText}</span>
            </div>
            <div className="col-sm pt-1">
              <InputWithHead
                heading={AppConstants.bannerLink}
                placeholder={AppConstants.bannerLink}
                name="bannerLink"
                onChange={url =>
                  this.props.liveScoreAddBannerUpdate(url.target.value, 'bannerLink')
                }
                // value={bannerUrl ? bannerUrl.length > 0 ? `https://${bannerUrl}` : ""}
                // value={bannerUrl ? `https://${bannerUrl}` : ""}
                // prefix={"https://"}
                value={bannerLink}
              />

              <div className="mt-3">
                <div>
                  <span>{AppConstants.bannerFormat}</span>
                </div>
                <Form.Item
                  name="format"
                  rules={[
                    {
                      required: true,
                      message: ValidationConstants.pleaseSelectBannerFormat,
                    },
                  ]}
                >
                  <Radio.Group name="format" onChange={this.onChangeFormat} value={format}>
                    <Radio value={AppConstants.horizontal}>{AppConstants.horizontal}</Radio>
                    <Radio value={AppConstants.square}>{AppConstants.square}</Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
            </div>
          </div>
          {/* <div className="col-sm mt-10">
                        <div className="row">
                            <div className="reg-add-save-button">
                                <Button onClick={this.handleSubmit} className="primary-add-comp-form" type="primary">
                                    {AppConstants.upload}
                                </Button>
                            </div>
                        </div>
                    </div> */}
        </div>

        {/* {this.chekboxes()} */}
      </div>
    );
  };

  // check box
  chekboxes = () => {
    const {
      showOnHome,
      showOnDraws,
      showOnLadder,
      showOnNews,
      showOnChat,
      format,
    } = this.props.liveScoreBannerState;

    const isSquare = format === 'Square';

    return (
      <div className="pt-4">
        <Checkbox
          className="single-checkbox"
          checked={showOnHome}
          onChange={e => this.props.liveScoreAddBannerUpdate(e.target.checked, 'showOnHome')}
        >
          {AppConstants.showHomePage}
        </Checkbox>

        <div style={{ marginTop: 5 }}>
          <Checkbox
            className="single-checkbox"
            disabled={isSquare}
            checked={showOnDraws}
            onChange={e => this.props.liveScoreAddBannerUpdate(e.target.checked, 'showOnDraws')}
          >
            {AppConstants.showOnDrawsPage}
          </Checkbox>
        </div>

        <div style={{ marginTop: 5 }}>
          <Checkbox
            className="single-checkbox"
            disabled={isSquare}
            checked={showOnLadder}
            // onChange={(e) => this.setState({ showOnLadder: !this.state.showOnLadder })
            onChange={e => this.props.liveScoreAddBannerUpdate(e.target.checked, 'showOnLadder')}
          >
            {AppConstants.showOnLadderPage}
          </Checkbox>
        </div>

        <div style={{ marginTop: 5 }}>
          <Checkbox
            className="single-checkbox"
            checked={showOnNews}
            onChange={e => this.props.liveScoreAddBannerUpdate(e.target.checked, 'showOnNews')}
          >
            {AppConstants.showOnNewsPage}
          </Checkbox>
        </div>

        <div style={{ marginTop: 5 }}>
          <Checkbox
            className="single-checkbox"
            disabled={isSquare}
            checked={showOnChat}
            onChange={e => this.props.liveScoreAddBannerUpdate(e.target.checked, 'showOnChat')}
          >
            {AppConstants.showOnChatPage}
          </Checkbox>
        </div>
      </div>
    );
  };

  headerView = () => (
    <div className="header-view">
      <Header className="form-header-view bg-transparent d-flex align-items-center">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {this.state.isEdit === true ? AppConstants.editBanners : AppConstants.addBanners}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </Header>
    </div>
  );

  onRemoveBtn = () => {
    this.setState({ bannerImgSend: null, bannerImg: null });
  };

  // view for breadcrumb
  removeBtn = () => (
    <div className="comp-player-grades-header-drop-down-view">
      <div className="col-sm">
        <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
          <Button onClick={this.onRemoveBtn} className="primary-add-comp-form" type="primary">
            {AppConstants.removeBanner}
          </Button>
        </div>
      </div>
    </div>
  );

  /// ///footer view containing all the buttons like submit and cancel
  footerView = isSubmitting => (
    <div className="fluid-width">
      <div className="footer-view">
        <div className="row">
          <div className="col-sm">
            <div className="reg-add-save-button">
              <Button className="cancelBtnWidth" onClick={this.goBack} type="cancel-button">
                {AppConstants.cancel}
              </Button>
            </div>
          </div>
          <div className="col-sm">
            <div className="comp-buttons-view">
              <Button
                className="publish-button save-draft-text"
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

  render() {
    return (
      <div className="fluid-width default-bg" style={{ paddingBottom: 10 }}>
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />

        <Loader visible={this.props.liveScoreBannerState.onLoad} />

        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="20" />

        <Layout>
          {this.headerView()}
          <Form ref={this.formRef} onFinish={this.handleSubmit} noValidate="noValidate">
            <Content>
              <div className="formView pt-3">
                {this.state.bannerImg && this.removeBtn()}
                {this.contentView()}
              </div>
            </Content>

            <Footer>{this.footerView()}</Footer>
          </Form>
        </Layout>
      </div>
    );
  }
}

LiveScoreEditBanners.propTypes = {
  location: PropTypes.object.isRequired,
  liveScoreBannerState: PropTypes.object.isRequired,
  userState: PropTypes.object.isRequired,
  liveScoreAddBanner: PropTypes.func.isRequired,
  liveScoreAddBannerUpdate: PropTypes.func.isRequired,
  clearEditBannerAction: PropTypes.func.isRequired,
  getBannerCnt: PropTypes.func.isRequired,
  getLiveScoreBanners: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      liveScoreAddBanner,
      liveScoreAddBannerUpdate,
      clearEditBannerAction,
      getBannerCnt,
      getLiveScoreBanners,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreBannerState: state.LiveScoreBannerState,
    userState: state.UserState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreEditBanners);
