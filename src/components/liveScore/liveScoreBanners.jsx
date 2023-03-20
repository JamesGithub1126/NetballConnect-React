import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Button, Checkbox, Breadcrumb, Spin, Table, Radio } from 'antd';

import AppConstants from 'themes/appConstants';
import history from 'util/history';
import { getLiveScoreCompetition } from 'util/sessionStorage';
import {
  getLiveScoreBanners,
  liveScoreRemoveBanner,
} from 'store/actions/LiveScoreAction/liveScoreBannerAction';
import InputWithHead from 'customComponents/InputWithHead';
import ImageLoader from 'customComponents/ImageLoader';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';

import './liveScore.css';

const { Header, Content } = Layout;
let _this = null;
const columns = [
  {
    dataIndex: 'bannerUrl',
    key: 'bannerUrl',
    render: (bannerUrl, record) => (
      <div>
        {_this.removeBtn(record)}
        {_this.imageView(record)}
        {_this.footerView(record)}
      </div>
    ),
  },
];

class LiveScoreBanners extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageError: '',
      bannerImg: null,
      timeout: false,
    };
    _this = this;
  }

  componentDidMount() {
    if (getLiveScoreCompetition()) {
      this.setState({ timeout: true });
      setTimeout(() => {
        this.setState({ timeout: false });
      }, 3000);
      const { id } = JSON.parse(getLiveScoreCompetition());
      if (id !== null) {
        this.props.getLiveScoreBanners(id);
      } else {
        history.push('/matchDayCompetitions');
      }
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  // Image picker
  selectImage = () => {
    const fileInput = document.getElementById('user-pic');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    if (fileInput) {
      fileInput.click();
    }
  };

  onSelectBanner = data => {
    const fileInput = document.getElementById('user-pic');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    if (fileInput) {
      fileInput.click();
    }
  };

  setImage = data => {
    if (data.files[0] !== undefined) {
      this.setState({ bannerImg: URL.createObjectURL(data.files[0]) });
    }
  };

  loaderView = () => (
    <div className="d-flex align-items-center justify-content-center">
      {/* <Spin size="small" /> */}
      <Spin />
      {/* <Spin size="large" /> */}
    </div>
  );

  imageView = record => {
    const bannerUrl =
      record.format === AppConstants.horizontal
        ? record.horizontalBannerUrl
        : record.squareBannerUrl;
    return (
      <div>
        <ImageLoader
          className="banner-image"
          height
          width
          borderRadius
          timeout={this.state.timeout}
          src={bannerUrl}
        />
        {/* <img thumbnail alt="" className="banner-image" src={bannerUrl} /> */}
      </div>
    );
  };

  /// /////form content view
  contentView = item => {
    const { bannerResult } = this.props.liveScoreBannerState;
    return (
      <div className="content-view">
        <Table
          className="home-dashboard-table"
          loading={this.props.liveScoreBannerState.onLoad && true}
          columns={columns}
          dataSource={bannerResult}
          showHeader={false}
          pagination={false}
          rowKey={record => 'banners' + record.id}
        />
      </div>
    );
  };

  footerView = record => {
    const bannerLink =
      record.format === AppConstants.horizontal
        ? record.horizontalBannerLink
        : record.squareBannerLink;
    return (
      <div>
        <div className="row">
          <div className="col-sm pt-1">
            <InputWithHead
              heading={AppConstants.bannerLink}
              placeholder={AppConstants.bannerLink}
              name="bannerLink"
              disabled
              value={bannerLink || 'http://'}
            />

            <div className="mt-3">
              <div>
                <span>{AppConstants.bannerFormat}</span>
              </div>
              <Radio.Group name="format" disabled value={record.format}>
                <Radio value={AppConstants.horizontal}>{AppConstants.horizontal}</Radio>
                <Radio value={AppConstants.square}>{AppConstants.square}</Radio>
              </Radio.Group>
            </div>
          </div>
        </div>

        {/* {this.chekboxes(record)} */}
      </div>
    );
  };

  // check box
  chekboxes = record => (
    <div className="pt-4">
      <Checkbox disabled className="single-checkbosx" checked={record.showOnHome === 1}>
        {AppConstants.showHomePage}
      </Checkbox>
      <div style={{ marginTop: 5 }}>
        <Checkbox disabled className="single-checkbox" checked={record.showOnDraws === 1}>
          {AppConstants.showOnDrawsPage}
        </Checkbox>
      </div>
      <div style={{ marginTop: 5 }}>
        <Checkbox disabled className="single-checkbox" checked={record.showOnLadder === 1}>
          {AppConstants.showOnLadderPage}
        </Checkbox>
      </div>
      <div style={{ marginTop: 5 }}>
        <Checkbox disabled className="single-checkbox" checked={record.showOnNews === 1}>
          {AppConstants.showOnNewsPage}
        </Checkbox>
      </div>
      <div style={{ marginTop: 5 }}>
        <Checkbox disabled className="single-checkbox" checked={record.showOnChat === 1}>
          {AppConstants.showOnChatPage}
        </Checkbox>
      </div>
    </div>
  );

  /// ////view for breadcrumb
  headerView = () => (
    <Header className="comp-venue-courts-header-view live-form-view-button-header">
      <div className="row">
        <div className="col-sm d-flex align-items-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">{AppConstants.banners}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="col-sm live-form-view-button-container d-flex justify-content-end">
          <NavLink to="/matchDayEditBanners">
            <Button
              className="primary-add-comp-form"
              type="primary"
            >{`+${AppConstants.addBanners}`}</Button>
          </NavLink>
        </div>
      </div>
    </Header>
  );

  removeBanner = record => {
    const { id } = JSON.parse(getLiveScoreCompetition()) || {};
    this.props.liveScoreRemoveBanner(record.id, null, id);
  };

  /// ////view for breadcrumb
  removeBtn = record => (
    <div className="mb-3">
      {/* <div className="col-sm"> */}
      <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
        <NavLink
          to={{
            pathname: '/matchDayEditBanners',
            state: { isEdit: true, tableRecord: record },
          }}
        >
          <Button
            onClick={() => this.setState({ bannerImg: null })}
            className="primary-add-comp-form ml-5"
            type="primary"
          >
            {AppConstants.editBanner}
          </Button>
        </NavLink>
        <Button
          onClick={() => this.removeBanner(record)}
          className="primary-add-comp-form ml-5"
          type="primary"
        >
          {AppConstants.removeBanner}
        </Button>
      </div>
      {/* </div> */}
    </div>
  );

  render() {
    // const { bannerResult } = this.props.liveScoreBannerState;
    return (
      <div className="fluid-width default-bg" style={{ paddingBottom: 10 }}>
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />

        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="20" />

        <Layout>
          {this.headerView()}

          <Content>
            <div className="formView pt-3">
              {/* {(this.state.bannerImg || bannerResult.length > 0) && this.removeBtn()} */}
              {this.contentView()}
            </div>
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getLiveScoreBanners, liveScoreRemoveBanner }, dispatch);
}

function mapStateToProps(state) {
  return {
    liveScoreBannerState: state.LiveScoreBannerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreBanners);
