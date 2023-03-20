import React, { Component } from 'react';
import { Layout, Breadcrumb, Select, Button } from 'antd';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import { NavLink } from 'react-router-dom';
import loadjs from 'loadjs';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';

const { Header, Footer, Content } = Layout;
const { Option } = Select;

class CompetitionDraws extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: '2019',
      competition: '2019winter',
      venue: 'abbott',
      round: '01',
    };
  }

  componentDidMount() {
    loadjs('assets/js/custom.js');
  }

  onChange = e => {
    this.setState({
      value: e.target.value,
    });
  };

  headerView = () => (
    <Header className="comp-draws-header-view mt-4">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb className="d-flex align-items-center align-self-center" separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add"> {AppConstants.draws}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
    </Header>
  );

  dropdownView = () => {
    return (
      <div className="row">
        <div className="col-sm-3">
          <div className="year-select-heading-view">
            <span className="year-select-heading">{AppConstants.draws}:</span>
            <Select
              className="year-select"
              // style={{ width: 75 }}
              onChange={year => this.setState({ year })}
              value={this.state.year}
            >
              <Option value="2019">2019</Option>
              <Option value="2018">2018</Option>
              <Option value="2017">2017</Option>
              <Option value="2016">2016</Option>
            </Select>
          </div>
        </div>
        <div className="col-sm-3">
          <div className="d-flex flex-row w-100 align-items-center" style={{ marginRight: 50 }}>
            <span className="year-select-heading">{AppConstants.competition}:</span>
            <Select
              className="year-select"
              // style={{ width: 140 }}
              onChange={competition => this.setState({ competition })}
              value={this.state.competition}
            >
              <Option value="2019winter">{AppConstants.deprecated}</Option>
              <Option value="sapphire">Sapphire Series</Option>
              <Option value="junior">Junior Premier</Option>
            </Select>
          </div>
        </div>
      </div>
    );
  };

  contentView = () => {
    return (
      <div className="comp-draw-content-view">
        <div className="row comp-draw-list-top-head">
          <div className="col-sm-10">
            <span className="form-heading">{AppConstants.draws}</span>
            <div className="row">
              <div className="col-sm-5 mr-0">
                <div className="w-100 d-flex flex-row align-items-center">
                  <span className="year-select-heading">{AppConstants.venue}:</span>
                  <Select
                    className="year-select"
                    // style={{ width: 75 }}
                    onChange={venue => this.setState({ venue })}
                    value={this.state.venue}
                  >
                    <Option value="abbott">{AppConstants.deprecated}</Option>
                  </Select>
                </div>
              </div>
              <div className="col-sm-7 pl-0">
                <div className="col-sm-4">
                  <div className="w-100 d-flex flex-row align-items-center">
                    <span className="year-select-heading">{AppConstants.round}:</span>
                    <Select
                      className="year-select"
                      // style={{ width: 140 }}
                      onChange={round => this.setState({ round })}
                      value={this.state.round}
                    >
                      <Option value="01">01</Option>
                    </Select>
                  </div>
                </div>
                <div className="col-sm-8">
                  <div className="w-100 d-flex flex-row align-items-center">
                    <span className="year-select-heading pt-2">{AppConstants.deprecated}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-2 comp-draw-edit-btn-view">
            <NavLink to="/competitionDrawEdit">
              <Button className="live-score-edit" type="primary">
                {AppConstants.edit}
              </Button>
            </NavLink>
          </div>
        </div>
        {this.dragableView()}
      </div>
    );
  };

  //////the gragable content view inside the container
  dragableView = () => {
    return (
      <div className="draggable-wrap draw-data-table">
        <div className="scroll-bar pb-4">
          <div className="table-head-wrap">
            <div className="tablehead-row">
              <div className="sr-no empty-bx" />
              <span className="left-25">Sat</span>
              <span className="left-135">Sat</span>
              <span className="left-245">Sat</span>
              <span className="left-355">Sat</span>
              <span className="left-465">Sat</span>
              <span className="left-575">Sat</span>
              <span className="left-685">Sat</span>
              <span className="left-795">Sat</span>
              <span className="left-905">Sat</span>
            </div>
            <div className="tablehead-row">
              <div className="sr-no empty-bx" />
              <span className="left-25">7:45</span>
              <span className="left-135">8:45</span>
              <span className="left-245">9:45</span>
              <span className="left-355">10:45</span>
              <span className="left-465">11:45</span>
              <span className="left-575">12:45</span>
              <span className="left-685">1:55</span>
              <span className="left-795">3:05</span>
              <span className="left-905">4:15</span>
            </div>
          </div>

          <div className="main-canvas Draws">
            <div className="sr-no">1</div>
            <span className="border left-25" />
            <div className="box left-25 grey--bg">
              <span>Na</span>
            </div>
            <span className="border left-135" />
            <div className="box left-135 purple-bg">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>

            <span className="border left-245" />
            <div className="box left-245 green-bg">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border left-355" />
            <div className="box left-355 yellow-bg black-text">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border left-465" />
            <div className="box left-465 blue-bg">
              <span>
                Newport 10 <br />
                Collaroy 9
              </span>
            </div>
            <span className="border left-575" />
            <div className="box left-575 red-bg">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border left-685" />
            <div className="box left-685 red-bg">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border left-795" />
            <div className="box left-795 blue-bg">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border left-905" />
            <div className="box left-905 blue-bg">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>

            <div className="sr-no">2</div>
            <span className="border top-55 left-25" />
            <div className="box left-25 grey--bg top-55">
              <span>na</span>
            </div>
            <span className="border top-55 left-135" />
            <div className="box left-135 purple-bg top-55">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border top-55 left-245" />
            <div className="box left-245 green-bg top-55">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border top-55 left-355" />
            <div className="box left-355 yellow-bg black-text top-55">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border top-55 left-465" />
            <div className="box left-465 blue-bg top-55">
              <span>
                Newport 10 <br />
                Collaroy 9
              </span>
            </div>
            <span className="border top-55 left-575" />
            <div className="box left-575 red-bg top-55">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border top-55 left-685" />
            <div className="box left-685 red-bg top-55">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border top-55 left-795" />
            <div className="box left-795 blue-bg top-55">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border top-55 left-905" />
            <div className="box left-905 blue-bg top-55">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>

            <div className="sr-no">3</div>
            <span className="border top-110 left-25" />
            <div className="box left-25 green-bg top-110">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border top-110 left-135" />
            <div className="box left-135 yellow-bg black-text top-110">
              <span>
                Queenscliff 10 <br />
                Mona Vale 9
              </span>
            </div>
            <span className="border top-110 left-245" />
            <div className="box left-245 red-bg top-110">
              <span>
                Newport 10 <br />
                Collaroy 9
              </span>
            </div>
            <span className="border top-110 left-355" />
            <div className="box left-355 yellow-bg black-text top-110">
              <span>
                Mona Vale 8 <br />
                Collaroy 8
              </span>
            </div>
            <span className="border top-110 left-465" />
            <div className="box left-465 orange-bg top-110">
              <span>
                Newport 10 <br />
                Collaroy 9
              </span>
            </div>
            <span className="border top-110 left-575" />
            <div className="box left-575 red-bg top-110">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border top-110 left-685" />
            <div className="box left-685 red-bg top-110">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border top-110 left-795" />
            <div className="box left-795 blue-bg top-110">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border top-110 left-905" />
            <div className="box left-905 blue-bg top-110">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>

            <div className="sr-no">4</div>
            <span className="border top-165 left-25" />
            <div className="box left-25 green-bg top-165">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border top-165 left-135" />
            <div className="box left-135 red-bg top-165">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border top-165 left-245" />
            <div className="box left-245 green-bg top-165">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border top-165 left-355" />
            <div className="box left-355 yellow-bg black-text top-165">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border top-165 left-465" />
            <div className="box left-465 blue-bg top-165">
              <span>
                Newport 10 <br />
                Collaroy 9
              </span>
            </div>
            <span className="border top-165 left-575" />
            <div className="box left-575 red-bg top-165">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border top-165 left-685" />
            <div className="box left-685 red-bg top-165">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border top-165 left-795" />
            <div className="box left-795 blue-bg top-165">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border top-165 left-905" />
            <div className="box left-905 blue-bg top-165">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>

            <div className="sr-no">5</div>
            <span className="border top-220 left-25" />
            <div className="box left-25 green-bg top-220">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border top-220 left-135" />
            <div className="box left-135 purple-bg top-220">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border top-220 left-245" />
            <div className="box left-245 green-bg top-220">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border top-220 left-355" />
            <div className="box left-355 yellow-bg black-text top-220">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border top-220 left-465" />
            <div className="box left-465 blue-bg top-220">
              <span>
                Newport 10 <br />
                Collaroy 9
              </span>
            </div>
            <span className="border top-220 left-575" />
            <div className="box left-575 red-bg top-220">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border top-220 left-685" />
            <div className="box left-685 red-bg top-220">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border top-220 left-795" />
            <div className="box left-795 blue-bg top-220">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border top-220 left-905" />
            <div className="box left-905 blue-bg top-220">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>

            <div className="sr-no">6</div>
            <span className="border top-275 left-25" />
            <div className="box left-25 green-bg top-275">
              <span>
                Queenscliff 10 <br />
                Mona Vale 9
              </span>
            </div>
            <span className="border top-275 left-135" />
            <div className="box left-135 purple-bg top-275">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border top-275 left-245" />
            <div className="box left-245 green-bg top-275">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border top-275 left-355" />
            <div className="box left-355 yellow-bg black-text top-275">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border top-275 left-465" />
            <div className="box left-465 blue-bg top-275">
              <span>
                Newport 10 <br />
                Collaroy 9
              </span>
            </div>
            <span className="border top-275 left-575" />
            <div className="box left-575 red-bg top-275">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border top-275 left-685" />
            <div className="box left-685 red-bg top-275">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border top-275 left-795" />
            <div className="box left-795 blue-bg top-275">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border top-275 left-905" />
            <div className="box left-905 blue-bg top-275">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>

            <div className="sr-no">7</div>
            <span className="border top-330 left-25" />
            <div className="box left-25 green-bg top-330">
              <span>
                Queenscliff 10 <br />
                Mona Vale 9
              </span>
            </div>
            <span className="border top-330 left-135" />
            <div className="box left-135 purple-bg top-330">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border top-330 left-245" />
            <div className="box left-245 green-bg top-330">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border top-330 left-355" />
            <div className="box left-355 yellow-bg black-text top-330">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border top-330 left-465" />
            <div className="box left-465 blue-bg top-330">
              <span>
                Newport 10 <br />
                Collaroy 9
              </span>
            </div>
            <span className="border top-330 left-575" />
            <div className="box left-575 red-bg top-330">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border top-330 left-685" />
            <div className="box left-685 red-bg top-330">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border top-330 left-795" />
            <div className="box left-795 blue-bg top-330">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border top-330 left-905" />
            <div className="box left-905 blue-bg top-330">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>

            <div className="sr-no">8</div>
            <span className="border top-385 left-25" />
            <div className="box left-25 green-bg top-385">
              <span>
                Queenscliff 10 <br />
                Mona Vale 9
              </span>
            </div>
            <span className="border top-385 left-135" />
            <div className="box left-135 purple-bg top-385">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border top-385 left-245" />
            <div className="box left-245 green-bg top-385">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border top-385 left-355" />
            <div className="box left-355 yellow-bg black-text top-385">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border top-385 left-465" />
            <div className="box left-465 blue-bg top-385">
              <span>
                Newport 10 <br />
                Collaroy 9
              </span>
            </div>
            <span className="border top-385 left-575" />
            <div className="box left-575 red-bg top-385">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border top-385 left-685" />
            <div className="box left-685 red-bg top-385">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border top-385 left-795" />
            <div className="box left-795 blue-bg top-385">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border top-385 left-905" />
            <div className="box left-905 blue-bg top-385">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    return (
      <div className="fluid-width">
        <div className="footer-view">
          <div className="row">
            <div className="col-sm-3">
              <div className="reg-add-save-button">
                <Button type="cancel-button">{AppConstants.cancel}</Button>
              </div>
            </div>
            <div className="col-sm-9">
              <div className="comp-buttons-view">
                <Button className="save-draft-text" type="save-draft-text">
                  {AppConstants.saveAsDraft}
                </Button>
                <Button className="open-reg-button" type="primary">
                  {AppConstants.publish}
                </Button>
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
        <DashboardLayout
          menuHeading={AppConstants.competitions}
          menuName={AppConstants.competitions}
        />
        <InnerHorizontalMenu menu="competition" compSelectedKey="18" />
        <Layout className="container">
          <div className="comp-draw-head-content-view">
            {this.headerView()}
            {this.dropdownView()}
            <Content>{this.contentView()}</Content>
          </div>
          <Footer>{this.footerView()}</Footer>
        </Layout>
      </div>
    );
  }
}

export default CompetitionDraws;
