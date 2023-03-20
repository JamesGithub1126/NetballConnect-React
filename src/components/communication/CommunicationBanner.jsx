import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Form, InputNumber, Layout, message, Table, Tabs } from 'antd';

import AppConstants from 'themes/appConstants';
import ValidationConstants from 'themes/validationConstant';
import { getOrganisationData } from 'util/sessionStorage';
import { getBannerCnt, updateBannerAction } from 'store/actions/userAction/userAction';
import {
  getLiveScoreBanners,
  liveScoreRemoveBanner,
  liveScoreRemoveBannerImage,
} from 'store/actions/LiveScoreAction/liveScoreBannerAction';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';
import Loader from 'customComponents/loader';
import InputWithHead from 'customComponents/InputWithHead';
import ImageLoader from 'customComponents/ImageLoader';
import history from '../../util/history';
import { getOrganisationLevel } from '../../util/permissions';

import './style.scss';

const { Content } = Layout;
const { TabPane } = Tabs;

class CommunicationBanner extends Component {
  constructor(props) {
    super(props);

    this.state = {
      numCompBanner: -1,
      numStateBanner: -1,
      bannerLoad: false,
    };

    this.formRef = React.createRef();

    this.columns = [
      {
        dataIndex: 'bannerUrl',
        key: 'bannerUrl',
        render: (bannerUrl, record) => (
          <div>
            <div className="d-flex align-items-end justify-content-between">
              <div className="mb-3" style={{ width: '400px' }}>
                <InputWithHead
                  heading={AppConstants.sponsorName}
                  placeholder={AppConstants.sponsorName}
                  name={AppConstants.sponsorName}
                  disabled
                  value={record.sponsorName}
                />
              </div>
              {this.removeBtn(record)}
            </div>
            {this.imageView(bannerUrl, record, 0)}
            {this.imageView(bannerUrl, record, 1)}
          </div>
        ),
      },
    ];
  }

  componentDidMount() {
    if (getOrganisationData()) {
      const organisationLevel = getOrganisationLevel();
      if (organisationLevel !== AppConstants.state) {
        history.push('/homeDashboard');
      }
      const { organisationId } = getOrganisationData() || {};
      if (organisationId) {
        this.props.getBannerCnt(organisationId);
        this.props.getLiveScoreBanners(null, organisationId);
      }
    }

    this.setState({ bannerLoad: true });
  }

  componentDidUpdate() {
    if (!this.props.userState.onLoad && this.props.userState.status && this.state.bannerLoad) {
      const { bannerCount } = this.props.userState;
      if (bannerCount && (this.state.numStateBanner < 0 || this.state.numCompBanner < 0)) {
        this.setState({
          numStateBanner: bannerCount.numStateBanner,
          numCompBanner: bannerCount.numCompBanner,
          bannerLoad: false,
        });
      }
    }
  }

  onSaveClick = () => {
    const { numStateBanner, numCompBanner } = this.state;
    this.props.updateBannerAction({ numStateBanner, numCompBanner });
  };

  onChangeBannerCnt = (state, comp) => {
    this.setState({
      numStateBanner: parseInt(state, 10),
      numCompBanner: parseInt(comp, 10),
    });
  };

  removeImage = (bannerId, type) => {
    this.props.liveScoreRemoveBannerImage(bannerId, type);
  };

  headerView = () => (
    <div className="row">
      <div className="col-sm live-form-view-button-container d-flex justify-content-end">
        <NavLink to="/advertisingEditBanners">
          <Button type="primary" className="primary-add-comp-form">
            {`+ ${AppConstants.addBanners}`}
          </Button>
        </NavLink>
      </div>
    </div>
  );

  removeBanner = record => {
    const { organisationId } = getOrganisationData() ? getOrganisationData() : null;
    if (organisationId) {
      this.props.liveScoreRemoveBanner(record.id, organisationId);
    }
  };

  removeBtn = record => (
    <div className="mb-3">
      <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
        <NavLink
          to={{
            pathname: '/advertisingEditBanners',
            state: { isEdit: true, tableRecord: record },
          }}
        >
          <Button type="primary" className="primary-add-comp-form ml-5">
            {AppConstants.editBanner}
          </Button>
        </NavLink>
        <Button
          type="primary"
          className="primary-add-comp-form ml-5"
          onClick={() => this.removeBanner(record)}
        >
          {AppConstants.removeBanner}
        </Button>
      </div>
    </div>
  );

  imageView = (bannerUrl, record, type) => (
    <div className="flex-row d-flex" style={{ marginTop: '1em' }}>
      <ImageLoader
        // closeable
        // removeImage={() => this.removeImage(record.id, type)}
        className="banner-image"
        src={record[type === 0 ? 'horizontalBannerUrl' : 'squareBannerUrl']}
        width
        height
        borderRadius
        timeout={this.state.timeout}
      />

      {this.footerBannerView(record, type)}
    </div>
  );

  footerStateView = () => (
    <div className="fluid-width pt-3 pb-5">
      <div className="row">
        <div className="col-sm" />
        <div className="col-sm">
          <div className="comp-buttons-view">
            <Button type="primary" className="publish-button" onClick={this.onSaveClick}>
              {AppConstants.save}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  footerBannerView = (record, type) => {
    const link = type === 0 ? 'horizontalBannerLink' : 'squareBannerLink';
    return (
      <div className="row">
        <div className="col-sm">
          <InputWithHead
            required="pt-0 pb-2"
            heading={AppConstants[link]}
            placeholder={AppConstants[link]}
            name={link}
            disabled
            value={record[link] ? record[link] : 'http://'}
          />
        </div>
      </div>
    );
  };

  contentView = () => {
    const { bannerResult, onLoad } = this.props.liveScoreBannerState;
    return (
      <div className="content-view">
        <Table
          className="home-dashboard-table"
          loading={onLoad && true}
          columns={this.columns}
          dataSource={bannerResult}
          showHeader={false}
          pagination={false}
          rowKey={(record, index) => record.bannerUrl + index}
        />
      </div>
    );
  };

  render() {
    const { numStateBanner, numCompBanner } = this.state;

    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.advertising}
          menuName={AppConstants.advertising}
        />

        <InnerHorizontalMenu menu="advertising" userSelectedKey="2" />

        <Layout>
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.saveAffiliate}
            onFinishFailed={err => {
              this.formRef.current.scrollToField(err.errorFields[0].name);
              message.error(ValidationConstants.requiredMessage);
            }}
            noValidate="noValidate"
          >
            <Content>
              <div className="tab-view">
                <Tabs activeKey={this.state.organisationTabKey} onChange={this.tabCallBack}>
                  <TabPane tab={AppConstants.banners} key="1">
                    {this.headerView()}
                    <div className="tab-formView my-5" style={{ padding: '1em' }}>
                      {this.contentView()}
                    </div>
                  </TabPane>

                  <TabPane tab={AppConstants.settings} key="2">
                    <Loader visible={this.props.userState.onLoad} />

                    <div className="tab-formView mt-5" style={{ padding: '2em 2em 0' }}>
                      <h3 className="mb-3 font-weight-bold">
                        {AppConstants.numberOfAdvertisingBanners}
                      </h3>

                      <div className="row">
                        <div className="col-sm">
                          <h4>{AppConstants.stateBody}</h4>
                          <InputNumber
                            max={8}
                            min={0}
                            value={numStateBanner}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            onChange={number => this.onChangeBannerCnt(number, 8 - number)}
                            placeholder="0"
                            style={{ width: '8em' }}
                          />
                        </div>
                        <div className="col-sm">
                          <h4>{AppConstants.competitionOrganiser}</h4>
                          <InputNumber
                            max={8}
                            min={0}
                            value={numCompBanner}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            onChange={number => this.onChangeBannerCnt(8 - number, number)}
                            placeholder="0"
                            disabled
                            style={{ width: '8em' }}
                          />
                        </div>
                      </div>

                      {this.footerStateView()}
                    </div>
                  </TabPane>
                </Tabs>
              </div>
            </Content>
          </Form>
        </Layout>
      </div>
    );
  }
}

CommunicationBanner.propTypes = {
  liveScoreBannerState: PropTypes.object.isRequired,
  userState: PropTypes.object.isRequired,
  getLiveScoreBanners: PropTypes.func.isRequired,
  liveScoreRemoveBanner: PropTypes.func.isRequired,
  liveScoreRemoveBannerImage: PropTypes.func.isRequired,
  getBannerCnt: PropTypes.func.isRequired,
  updateBannerAction: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getLiveScoreBanners,
      liveScoreRemoveBanner,
      liveScoreRemoveBannerImage,
      getBannerCnt,
      updateBannerAction,
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

export default connect(mapStateToProps, mapDispatchToProps)(CommunicationBanner);
