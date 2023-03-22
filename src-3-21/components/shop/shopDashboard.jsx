import React, { Component } from 'react';
import { Layout, Select } from 'antd';
import './shop.css';
// import { NavLink } from 'react-router-dom';
import DashboardLayout from '../../pages/dashboardLayout';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import AppConstants from '../../themes/appConstants';
// import AppImages from "../../themes/appImages";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import Loader from '../../customComponents/loader';
// import history from "../../util/history";
import Chart from 'chart.js';

const {
  // Header,
  Footer,
  Content,
} = Layout;
const { Option } = Select;

class ShopDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: AppConstants.all,
    };
    this.chartRefCompititions = React.createRef();
  }

  componentDidMount() {
    this.compititionChart();
  }

  compititionChart = () => {
    const compititionsChartRef = this.chartRefCompititions.current.getContext('2d');
    new Chart(compititionsChartRef, {
      type: 'doughnut',
      data: {
        labels: [
          'Sapphire Series',
          'Queensland Premier League',
          'Junior Queensland',
          'Walking Netball',
        ],
        datasets: [
          {
            data: [2199, 4849, 5255, 1221],
            backgroundColor: ['#9966ff', '#ad85ff', '#c2a3ff', '#d6c2ff'],
          },
        ],
      },
      options: {
        legend: {
          position: 'right',
        },
      },
    });
  };

  headerView = () => {
    // let product = [{
    //     id: 1, name: "T-Shirt"
    // }]
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4" style={{ paddingTop: '0px' }}>
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm-4 pt-1">
              <span className="form-heading">{AppConstants.shop}</span>
            </div>
            {/* <div className="col-sm pt-1">
                            <div className="row reg-filter-row">
                                <div className="reg-col">
                                    <div className="reg-filter-col-cont">
                                        <div className="year-select-heading pl-5">{AppConstants.year}</div>
                                        <Select
                                            style={{ minWidth: 160 }}
                                            value="2020"
                                            className="year-select shop-filter-select"
                                        >
                                            <Option key="year" value="year">2020</Option>
                                        </Select>
                                    </div>
                                </div>

                                <div className="reg-col">
                                    <div className="reg-filter-col-cont">
                                        <div className='year-select-heading pl-3 pr-4'>{AppConstants.productTypes}</div>
                                        <Select
                                            style={{ minWidth: 160 }}
                                            value="All"
                                            className="year-select shop-filter-select"
                                        >
                                            <Option key="all" value="all">All</Option>
                                        </Select>
                                    </div>
                                </div>

                                <div className="reg-col">
                                    <div className="reg-filter-col-cont">
                                        <div className='year-select-heading pl-3 pr-4'>{AppConstants.affiliate}</div>
                                        <Select
                                            style={{ minWidth: 160 }}
                                            value="All"
                                            className="year-select shop-filter-select"
                                        >
                                            <Option key="all" value="all">All</Option>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div> */}
          </div>
        </div>
      </div>
    );
  };

  dropdownView = () => {
    return (
      <div className="comp-player-grades-header-drop-down-view mt-1">
        <div className="fluid-width">
          <div className="row reg-filter-row ml-0">
            <div className="reg-col">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.year} :</div>
                <Select
                  style={{ minWidth: 160 }}
                  value="2020"
                  className="year-select shop-filter-select"
                >
                  <Option key="year" value="year">
                    2020
                  </Option>
                </Select>
              </div>
            </div>

            <div className="reg-col mr-5">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading" style={{ width: 200 }}>
                  {AppConstants.productType} :
                </div>
                <Select
                  style={{ minWidth: 115 }}
                  value="All"
                  className="year-select reg-filter-select1 ml-2"
                >
                  <Option key="all" value="all">
                    All
                  </Option>
                </Select>
              </div>
            </div>

            <div className="reg-col">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.affiliate} :</div>
                <Select
                  style={{ minWidth: 160 }}
                  value="All"
                  className="year-select reg-filter-select1 ml-2"
                >
                  <Option key="all" value="all">
                    All
                  </Option>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  contentView = () => {
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="row pt-4">
          <div className="col-sm-6">
            <div className="home-dash-white-box-view pt-3 pb-3">
              <div className="row">
                <div className="col-sm-6 d-flex align-items-center justify-content-center">
                  <span className="reg-payment-price-text">
                    {'$'} {'400.20'}
                  </span>
                </div>
                <div className="col-sm-6">
                  <span className="input-heading pb-0 pt-2" style={{ fontSize: 15 }}>
                    {'Today'}
                  </span>
                  <span className="input-heading pt-0" style={{ fontSize: 15 }}>
                    {'2 Orders'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="home-dash-white-box-view pt-3 pb-3">
              <div className="row">
                <div className="col-sm-6 d-flex align-items-center justify-content-center">
                  <span className="reg-payment-price-text">
                    {'$'} {'4,400.20'}
                  </span>
                </div>
                <div className="col-sm-6">
                  <span className="input-heading pb-0 pt-2" style={{ fontSize: 15 }}>
                    {'Past 7 days'}
                  </span>
                  <span className="input-heading pt-0" style={{ fontSize: 15 }}>
                    {'10 Orders'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row pt-4">
          <div className="col-sm-6">
            <div className="home-dash-white-box-view pt-3 pb-3">
              <div className="row">
                <div className="col-sm-6 d-flex align-items-center justify-content-center">
                  <span className="reg-payment-price-text">
                    {'$'} {'21,400.20'}
                  </span>
                </div>
                <div className="col-sm-6">
                  <span className="input-heading pb-0 pt-2" style={{ fontSize: 15 }}>
                    {'Past 30 days'}
                  </span>
                  <span className="input-heading pt-0" style={{ fontSize: 15 }}>
                    {'12 Orders'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-6">
            <div className="home-dash-white-box-view pt-3 pb-3">
              <div className="row">
                <div className="col-sm-6 d-flex align-items-center justify-content-center">
                  <span className="reg-payment-price-text">
                    {'$'} {'20,400.20'}
                  </span>
                </div>
                <div className="col-sm-6">
                  <span className="input-heading pb-0 pt-2" style={{ fontSize: 15 }}>
                    {'Past 90 days'}
                  </span>
                  <span className="input-heading pt-0" style={{ fontSize: 15 }}>
                    {'22 Orders'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm">
            <div className="chart-container-view">
              <div className="col-sm-9">
                <span style={{ fontSize: 15, fontWeight: 500 }}>{AppConstants.topSellers}</span>
                <canvas
                  className="d-block justify-content-center"
                  id="myChart"
                  ref={this.chartRefCompititions}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.shop} menuName={AppConstants.shop} />
        <InnerHorizontalMenu menu="shop" shopSelectedKey="1" />
        <Layout>
          <Content className="comp-dash-table-view">
            {this.headerView()}
            {this.dropdownView()}
            {this.contentView()}
            {/* <div className="formView">{this.productTypes()}</div> */}
          </Content>

          <Footer></Footer>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(ShopDashboard);
