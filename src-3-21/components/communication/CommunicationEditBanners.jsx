import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Breadcrumb, Button, Form, Layout, message } from 'antd';

import AppConstants from 'themes/appConstants';
import ValidationConstants from 'themes/validationConstant';
import history from 'util/history';
import { getOrganisationData } from 'util/sessionStorage';
import {
  clearEditBannerAction,
  getLiveScoreBanners,
  liveScoreAddCommunicationBannerUpdate,
  liveScoreAddCommunicationBanner,
} from 'store/actions/LiveScoreAction/liveScoreBannerAction';
import { getBannerCnt } from 'store/actions/userAction/userAction';
import DashboardLayout from 'pages/dashboardLayout';
import InputWithHead from 'customComponents/InputWithHead';
import Loader from 'customComponents/loader';
import ImageLoader from 'customComponents/ImageLoader';

const { Header, Content, Footer } = Layout;

class CommunicationEditBanners extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageError: '',
      horizontalBannerImg: this.props.location.state
        ? this.props.location.state.tableRecord.horizontalBannerUrl
        : null,
      squareBannerImg: this.props.location.state
        ? this.props.location.state.tableRecord.squareBannerUrl
        : null,
      horizontalBannerImgSend: null,
      squareBannerImgSend: null,
      tableRecord: props.location.state ? props.location.state.tableRecord : null,
      isEdit: props.location.state ? props.location.state.isEdit : null,
      load: false,
      numStateBanner: -1,
    };

    props.clearEditBannerAction();

    this.formRef = React.createRef();
  }

  componentDidMount() {
    const { organisationId } = getOrganisationData() ? getOrganisationData() : null;
    this.props.getBannerCnt(organisationId);

    if (this.state.isEdit === true) {
      this.props.liveScoreAddCommunicationBannerUpdate(this.state.tableRecord, 'isEditBanner');
    } else {
      this.props.getLiveScoreBanners(null, organisationId);
      this.props.liveScoreAddCommunicationBannerUpdate('', 'isAddBanner');
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
        if (this.state.numStateBanner !== bannerCount.numStateBanner) {
          this.setState({ numStateBanner: bannerCount.numStateBanner });
        }
        if (!this.state.isEdit) {
          if (
            this.props.userState.bannerCount.numStateBanner >= 0 &&
            bannerResult.length >= this.props.userState.bannerCount.numStateBanner
          ) {
            this.goBack();
            message.warning('You are going to have more state banners than you can have.');
          }
        }
      }
    }
  }

  goBack = () => {
    history.push('/advertising');
  };

  selectImage = () => {
    const fileInput = document.getElementById('user-pic');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    if (fileInput) {
      fileInput.click();
    }
  };

  setImage = (data, isHoriz) => {
    if (data.files[0] !== undefined) {
      if (this.state.isEdit === true) {
        if (isHoriz) {
          this.props.location.state.tableRecord.horizontalBannerUrl = null;
        } else this.props.location.state.tableRecord.squareBannerUrl = null;
      }

      if (isHoriz) {
        this.setState({
          horizontalBannerImgSend: data.files[0],
          horizontalBannerImg: URL.createObjectURL(data.files[0]),
        });
      } else {
        this.setState({
          squareBannerImgSend: data.files[0],
          squareBannerImg: URL.createObjectURL(data.files[0]),
        });
      }
    }
  };

  delImage = isHoriz => {
    if (isHoriz) {
      this.setState({ horizontalBannerImgSend: null, horizontalBannerImg: null });
      this.formRef.current.resetFields(['horizontalBannerImage']);
    } else {
      this.setState({ squareBannerImgSend: null, squareBannerImg: null });
      this.formRef.current.resetFields(['squareBannerImage']);
    }
  };

  bannerLinkView = (link, type) => {
    const bannerLink = type === 0 ? 'horizontalBannerLink' : 'squareBannerLink';
    return (
      <div className="row">
        <div className="col-sm pt-1">
          <InputWithHead
            heading={AppConstants[bannerLink]}
            placeholder={AppConstants[bannerLink]}
            name={bannerLink}
            onChange={url => {
              this.props.liveScoreAddCommunicationBannerUpdate(url.target.value, bannerLink);
            }}
            value={link}
          />
        </div>
      </div>
    );
  };

  handleSubmit = (/* values */) => {
    this.onUploadButton();
  };

  onUploadButton = () => {
    const { organisationId } = getOrganisationData() ? getOrganisationData() : null;

    const bannerId = this.state.isEdit === true ? this.state.tableRecord.id : 0;
    this.props.liveScoreAddCommunicationBanner(
      organisationId,
      this.props.liveScoreBannerState.sponsorName,
      this.state.horizontalBannerImgSend,
      this.props.liveScoreBannerState.horizontalBannerLink,
      this.state.squareBannerImgSend,
      this.props.liveScoreBannerState.squareBannerLink,
      bannerId, 
      this.state.horizontalBannerImg,
      this.state.squareBannerImg
    );

    this.setState({ load: true });
  };

  /// /////form content view
  contentView = () => (
    <div>
      <div className="content-view pt-2">
        <InputWithHead
          heading={AppConstants.sponsorName}
          placeholder={AppConstants.sponsorName}
          name="sponsorName"
          onChange={url =>
            this.props.liveScoreAddCommunicationBannerUpdate(url.target.value, 'sponsorName')
          }
          value={this.props.liveScoreBannerState.sponsorName}
        />
      </div>
      <div className="content-view pt-2">
        {this.state.horizontalBannerImg && (
          <ImageLoader
            closeable
            removeImage={() => this.delImage(true)}
            className="banner-image"
            height
            width
            borderRadius
            src={this.state.horizontalBannerImg}
          />
        )}
        <div>
          <div className="row">
            <div className="col-sm">
              <span className="user-contact-heading">{AppConstants.uploadImage}</span>
              <Form.Item
                name="horizontalBannerImage"
                rules={[
                  {
                    required: !(this.state.squareBannerImg || this.state.horizontalBannerImg),
                    message: ValidationConstants.moreBannerImage,
                  },
                ]}
              >
                <input
                  required="pb-0"
                  type="file"
                  id="horizontal-banner-img"
                  onChange={evt => {
                    this.setImage(evt.target, true);
                  }}
                />
              </Form.Item>
              <span className="form-err">{this.state.imageError}</span>
            </div>
            <div className="col-sm pt-1">
              {this.bannerLinkView(
                this.props.liveScoreBannerState.horizontalBannerLink || 'https://',
                0,
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="content-view pt-2">
        {this.state.squareBannerImg && (
          <ImageLoader
            closeable
            removeImage={() => this.delImage(false)}
            className="banner-image"
            height
            width
            borderRadius
            src={this.state.squareBannerImg}
          />
        )}
        <div>
          <div className="row">
            <div className="col-sm">
              <span className="user-contact-heading">{AppConstants.uploadImage}</span>
              <Form.Item
                name="squareBannerImage"
                rules={[
                  {
                    required: !(this.state.squareBannerImg || this.state.horizontalBannerImg),
                    message: ValidationConstants.moreBannerImage,
                  },
                ]}
              >
                <input
                  required="pb-0"
                  type="file"
                  id="square-banner-img"
                  onChange={evt => {
                    this.setImage(evt.target, false);
                  }}
                />
              </Form.Item>
              <span className="form-err">{this.state.imageError}</span>
            </div>
            <div className="col-sm pt-1">
              {this.bannerLinkView(
                this.props.liveScoreBannerState.squareBannerLink || 'https://',
                1,
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  headerView = () => (
    <div className="header-view">
      <Header className="form-header-view d-flex align-items-center bg-transparent">
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

  onRemoveBtn = isHoriz => {
    if (isHoriz) {
      this.setState({ horizontalBannerImgSend: null, horizontalBannerImg: null });
    } else {
      this.setState({ horizontalBannerImgSend: null, horizontalBannerImg: null });
    }
  };

  removeBtn = isHoriz => (
    <div className="comp-player-grades-header-drop-down-view">
      <div className="col-sm">
        <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
          <Button
            onClick={() => this.onRemoveBtn(isHoriz)}
            className="primary-add-comp-form"
            type="primary"
          >
            {AppConstants.removeBanner}
          </Button>
        </div>
      </div>
    </div>
  );

  footerView = isSubmitting => (
    <div className="fluid-width">
      <div className="footer-view">
        <div className="row">
          <div className="col-sm">
            <div className="reg-add-save-button">
              <Button
                className="cancelBtnWidth"
                onClick={() => {
                  this.goBack();
                  localStorage.setItem('communication', '');
                }}
                type="cancel-button"
              >
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
          menuHeading={AppConstants.Communication}
          menuName={`${AppConstants.Communication} Banner Add/Edit`}
          onMenuHeadingClick={() => history.push('communication')}
        />

        <Loader visible={this.props.liveScoreBannerState.onLoad} />

        <Layout>
          {this.headerView()}
          <Form ref={this.formRef} onFinish={this.handleSubmit} noValidate="noValidate">
            <Content>
              <div className="formView pt-3">
                {this.state.horizontalBannerImg && this.removeBtn(true)}
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

CommunicationEditBanners.propTypes = {
  location: PropTypes.object.isRequired,
  liveScoreBannerState: PropTypes.object.isRequired,
  userState: PropTypes.object.isRequired,
  liveScoreAddCommunicationBanner: PropTypes.func.isRequired,
  liveScoreAddCommunicationBannerUpdate: PropTypes.func.isRequired,
  clearEditBannerAction: PropTypes.func.isRequired,
  getBannerCnt: PropTypes.func.isRequired,
  getLiveScoreBanners: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      liveScoreAddCommunicationBanner,
      liveScoreAddCommunicationBannerUpdate,
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

export default connect(mapStateToProps, mapDispatchToProps)(CommunicationEditBanners);
