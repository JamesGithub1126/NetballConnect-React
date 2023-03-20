import React, { Component } from 'react';
import { Layout, Breadcrumb, Select, Button } from 'antd';
import './umpire.css';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import loadjs from 'loadjs';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';

const { Header, Footer, Content } = Layout;
const { Option } = Select;

class UmpireAllocation extends Component {
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

  headerView = () => {
    return (
      <Header className="comp-draws-header-view mt-5">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.umpireAllocation}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </Header>
    );
  };

  dropdownView = () => {
    return (
      <div className="row">
        <div className="col-sm-3">
          <div className="w-100 d-flex flex-row align-items-center">
            <span className="year-select-heading">{AppConstants.year}:</span>
            <Select
              className="year-select"
              // style={{ width: 75 }}
              onChange={year => this.setState({ year })}
              value={this.state.year}
            >
              <Option value="2019">{AppConstants.year2019}</Option>
              <Option value="2018">{AppConstants.year2018}</Option>
              <Option value="2017">{AppConstants.year2017}</Option>
              <Option value="2016">{AppConstants.year2016}</Option>
            </Select>
          </div>
        </div>
        <div className="col-sm-3">
          <div className="w-100 d-flex flex-row align-items-center" style={{ marginRight: 50 }}>
            <span className="year-select-heading">{AppConstants.year}:</span>
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
          <div className="col-sm-8">
            <span className="form-heading">{AppConstants.winter_2019}</span>
            <div className="row">
              <div className="col-sm">
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
              <div className="col-sm">
                <div
                  className="w-100 d-flex flex-row align-items-center"
                  style={{ marginRight: 50 }}
                >
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
            </div>
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
        <div className="scroll-bar">
          <div className="table-head-wrap">
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
            <div className="sr-no big-sr">1</div>
            <span className="border big-border left-25" />
            <div className="big-undraggble-box big-box left-25 grey--bg">
              <span>N/a</span>
            </div>
            <span className="border left-135" />
            <div className="undragable-box left-135 purple-bg">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border left-135 top-48 border-36" />
            <div className="only-box purple-box left-135 top-48 box-36 purple-dark">
              <span>Joyce Hayes</span>
            </div>
            <span className="border left-135 top-84 border-36" />
            <div className="only-box purple-box left-135 top-84 box-36 purple-dark">
              <span>Rose Gordon</span>
            </div>
            <span className="border left-245" />
            <div className="undragable-box left-245 green-bg">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border left-245 top-48 border-36" />
            <div className="only-box green-box left-245 top-48 box-36 green-dark">
              <span>Cynthia Reed</span>
            </div>
            <span className="border left-245 top-84 border-36" />
            <div className="only-box green-box left-245 top-84 box-36 green-dark">
              <span>Marilyn Henry</span>
            </div>
            <span className="border left-355" />
            <div className="undragable-box left-355 yellow-bg black-text">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border left-355 top-48 border-36" />
            <div className="only-box yellow-box left-355 top-48 box-36 yellow-dark black-text">
              <span>Hannah John...</span>
            </div>
            <span className="border left-355 top-84 border-36" />
            <div className="only-box yellow-box left-355 top-84 box-36 yellow-dark black-text">
              <span>Pamela Mor...</span>
            </div>
            <span className="border left-465" />
            <div className="undragable-box left-465 blue-bg">
              <span>
                Newport 10 <br />
                Collaroy 9
              </span>
            </div>
            <span className="border left-465 top-48 border-36" />
            <div className="only-box blue-box left-465 top-48 box-36 blue-dark">
              <span>Jacqueline A...</span>
            </div>
            <span className="border left-465 top-84 border-36" />
            <div className="only-box blue-box left-465 top-84 box-36 blue-dark">
              <span>Carolyn Davi...</span>
            </div>
            <span className="border left-575" />
            <div className="undragable-box left-575 red-bg">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border left-575 top-48 border-36" />
            <div className="only-box red-box left-575 top-48 box-36 red-dark">
              <span>Rose Sullivan</span>
            </div>
            <span className="border left-575 top-84 border-36" />
            <div className="only-box red-box left-575 top-84 box-36 red-dark">
              <span>Sara McDon...</span>
            </div>
            <span className="border left-685" />
            <div className="undragable-box left-685 blue-bg">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border left-685 top-48 border-36" />
            <div className="only-box blue-box left-685 top-48 box-36 blue-dark">
              <span>Jean Wheeler</span>
            </div>
            <span className="border left-685 top-84 border-36" />
            <div className="only-box blue-box left-685 top-84 box-36 blue-dark">
              <span>Sarah Holmes</span>
            </div>
            <span className="border left-795" />
            <div className="undragable-box left-795 blue-bg">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border left-795 top-48 border-36" />
            <div className="only-box blue-box left-795 top-48 box-36 blue-dark">
              <span>Cynthia Reed</span>
            </div>
            <span className="border left-795 top-84 border-36" />
            <div className="only-box blue-box left-795 top-84 box-36 blue-dark">
              <span>Marilyn Henry</span>
            </div>
            <span className="border left-905" />
            <div className="undragable-box left-905 blue-bg">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border left-905 top-48 border-36" />
            <div className="only-box blue-box left-905 top-48 box-36 blue-dark">
              <span>Cynthia Reed</span>
            </div>
            <span className="border left-905 top-84 border-36" />
            <div className="only-box blue-box left-905 top-84 box-36 blue-dark">
              <span>Marilyn Henry</span>
            </div>

            <div className="sr-no big-sr">2</div>
            <span className="border big-border top-144 left-25" />
            <div className="big-undraggble-box big-box left-25 top-144 grey--bg">
              <span>N/a</span>
            </div>
            <span className="border left-135 top-144" />
            <div className="undragable-box left-135 top-144 purple-bg">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border left-135 top-192 border-36" />
            <div className="only-box purple-box left-135 top-192 box-36 purple-dark">
              <span>Sara Cole</span>
            </div>
            <span className="border left-135 top-228 border-36" />
            <div className="only-box purple-box left-135 top-228 box-36 purple-dark">
              <span>Evelyn Keller</span>
            </div>
            <span className="border left-245 top-144" />
            <div className="undragable-box left-245 top-144 green-bg">
              <span>
                Queenscliff 10 <br />
                Mona Vale 9
              </span>
            </div>
            <span className="border left-245 top-192 border-36" />
            <div className="only-box green-box left-245 top-192 box-36 green-dark">
              <span>Julia Carr</span>
            </div>
            <span className="border left-245 top-228 border-36" />
            <div className="only-box green-box left-245 top-228 box-36 green-dark">
              <span>Debra Peters</span>
            </div>
            <span className="border left-355 top-144" />
            <div className="undragable-box left-355 top-144 yellow-bg black-text">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border left-355 top-192 border-36" />
            <div className="only-box yellow-box left-355 top-192 box-36 yellow-dark black-text">
              <span>Jessica Sim...</span>
            </div>
            <span className="border left-355 top-228 border-36" />
            <div className="only-box yellow-box left-355 top-228 box-36 yellow-dark black-text">
              <span>Linda Martinez</span>
            </div>
            <span className="border left-465 top-144" />
            <div className="undragable-box left-465 top-144 blue-bg">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border left-465 top-192 border-36" />
            <div className="only-box blue-box left-465 top-192 box-36 blue-dark">
              <span>Carol McDo...</span>
            </div>
            <span className="border left-465 top-228 border-36" />
            <div className="only-box blue-box left-465 top-228 box-36 blue-dark">
              <span>Helen Rivera</span>
            </div>
            <span className="border left-575 top-144" />
            <div className="undragable-box left-575 top-144 red-bg">
              <span>
                Mona Vale 8 <br />
                Collaroy 8
              </span>
            </div>
            <span className="border left-575 top-192 border-36" />
            <div className="only-box red-box left-575 top-192 box-36 red-dark">
              <span>Shirley Martin</span>
            </div>
            <span className="border left-575 top-228 border-36" />
            <div className="only-box red-box left-575 top-228 box-36 red-dark">
              <span>Betty Medina</span>
            </div>
            <span className="border left-685 top-144" />
            <div className="undragable-box left-685 top-144 red-bg">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border left-685 top-192 border-36" />
            <div className="only-box red-box left-685 top-192 box-36 red-dark">
              <span>Sharon Collins</span>
            </div>
            <span className="border left-685 top-228 border-36" />
            <div className="only-box red-box left-685 top-228 box-36 red-dark">
              <span>Tammy Torres</span>
            </div>
            <span className="border left-795 top-144" />
            <div className="undragable-box left-795 top-144 blue-bg">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border left-795 top-192 border-36" />
            <div className="only-box blue-box left-795 top-192 box-36 blue-dark">
              <span>Cynthia Reed</span>
            </div>
            <span className="border left-795 top-228 border-36" />
            <div className="only-box blue-box left-795 top-228 box-36 blue-dark">
              <span>Marilyn Henry</span>
            </div>
            <span className="border left-905 top-144" />
            <div className="undragable-box left-905 top-144 blue-bg">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border left-905 top-192 border-36" />
            <div className="only-box blue-box left-905 top-192 box-36 blue-dark">
              <span>Cynthia Reed</span>
            </div>
            <span className="border left-905 top-228 border-36" />
            <div className="only-box blue-box left-905 top-228 box-36 blue-dark">
              <span>Marilyn Henry</span>
            </div>

            <div className="sr-no big-sr">3</div>
            <span className="border left-25 top-288" />
            <div className="undragable-box left-25 top-288 green-bg">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border left-25 top-336 border-36" />
            <div className="only-box green-box left-25 top-336 box-36 green-dark">
              <span>Marilyn Miller</span>
            </div>
            <span className="border left-25 top-372 border-36" />
            <div className="only-box green-box left-25 top-372 box-36 green-dark">
              <span>Heather Jen...</span>
            </div>
            <span className="border left-135 top-288" />
            <div className="undragable-box left-135 top-288 yellow-bg black-text">
              <span>
                Queenscliff 10 <br />
                Mona Vale 9
              </span>
            </div>
            <span className="border left-135 top-336 border-36" />
            <div className="only-box yellow-box left-135 top-336 box-36 yellow-dark black-text">
              <span>Jean Roberts</span>
            </div>
            <span className="border left-135 top-372 border-36" />
            <div className="only-box yellow-box left-135 top-372 box-36 yellow-dark black-text">
              <span>Joyce Hayes</span>
            </div>
            <span className="border left-245 top-288" />
            <div className="undragable-box left-245 top-288 red-bg">
              <span>
                Newport 10 <br />
                Collaroy 9
              </span>
            </div>
            <span className="border left-245 top-336 border-36" />
            <div className="only-box red-box left-245 top-336 box-36 red-dark">
              <span>Maria Ford</span>
            </div>
            <span className="border left-245 top-372 border-36" />
            <div className="box left-245 top-372 box-36 red-dark">
              <span>Beverly Curtis</span>
            </div>
            <span className="border left-355 top-288" />
            <div className="undragable-box left-355 top-288 yellow-bg black-text">
              <span>
                Mona Vale 8 <br />
                Collaroy 8
              </span>
            </div>
            <span className="border left-355 top-336 border-36" />
            <div className="only-box yellow-box left-355 top-336 box-36 yellow-dark black-text">
              <span>Ann Graham</span>
            </div>
            <span className="border left-355 top-372 border-36" />
            <div className="only-box yellow-box left-355 top-372 box-36 yellow-dark black-text">
              <span>Gloria Hill</span>
            </div>
            <span className="border left-465 top-288" />
            <div className="undragable-box left-465 top-288 red-bg">
              <span>
                Mona Vale 8 <br />
                Collaroy 8
              </span>
            </div>
            <span className="border left-465 top-336 border-36" />
            <div className="only-box red-box left-465 top-336 box-36 red-dark">
              <span>Brenda Ortega</span>
            </div>
            <span className="border left-465 top-372 border-36" />
            <div className="only-box red-box left-465 top-372 box-36 red-dark">
              <span>Brenda Ortega</span>
            </div>
            <span className="border left-575 top-288" />
            <div className="undragable-box left-575 top-288 orange-bg">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border left-575 top-336 border-36" />
            <div className="only-box orange-box left-575 top-336 box-36 orange-dark">
              <span>Megan Baker</span>
            </div>
            <span className="border left-575 top-372 border-36" />
            <div className="only-box orange-box left-575 top-372 box-36 orange-dark">
              <span>Donna Jones</span>
            </div>
            <span className="border left-685 top-288" />
            <div className="undragable-box left-685 top-288 skyblue-bg">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border left-685 top-336 border-36" />
            <div className="only-box skyblue-box left-685 top-336 box-36 skyblue-dark">
              <span>Cynthia Reed</span>
            </div>
            <span className="border left-685 top-372 border-36" />
            <div className="only-box skyblue-box left-685 top-372 box-36 skyblue-dark">
              <span>Marilyn Henry</span>
            </div>
            <span className="border left-795 top-288" />
            <div className="undragable-box left-795 top-288 blue-bg">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border left-795 top-336 border-36" />
            <div className="only-box blue-box left-795 top-336 box-36 blue-dark">
              <span>Cynthia Reed</span>
            </div>
            <span className="border left-795 top-372 border-36" />
            <div className="only-box blue-box left-795 top-372 box-36 blue-dark">
              <span>Marilyn Henry</span>
            </div>
            <span className="border left-905 top-288" />
            <div className="undragable-box left-905 top-288 blue-bg">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border left-905 top-336 border-36" />
            <div className="only-box blue-box left-905 top-336 box-36 blue-dark">
              <span>Cynthia Reed</span>
            </div>
            <span className="border left-905 top-372 border-36" />
            <div className="only-box blue-box left-905 top-372 box-36 blue-dark">
              <span>Marilyn Henry</span>
            </div>

            <div className="sr-no big-sr">4</div>
            <span className="border left-25 top-432" />
            <div className="undragable-box left-25 top-432 green-bg">
              <span>
                Beacon Hill 10 <br />
                Mona Vale 10
              </span>
            </div>
            <span className="border left-25 top-480 border-36" />
            <div className="only-box green-box left-25 top-480 box-36 green-dark">
              <span>Emily Wade</span>
            </div>
            <span className="border left-25 top-516 border-36" />
            <div className="only-box green-box left-25 top-516 box-36 green-dark">
              <span>Megan Reyn...</span>
            </div>
            <span className="border left-135 top-432" />
            <div className="undragable-box left-135 top-432 yellow-bg black-text">
              <span>
                Newport 10 <br />
                Collaroy 9
              </span>
            </div>
            <span className="border left-135 top-480 border-36" />
            <div className="only-box yellow-box left-135 top-480 box-36 yellow-dark black-text">
              <span>Lori Carter</span>
            </div>
            <span className="border left-135 top-516 border-36" />
            <div className="only-box yellow-box left-135 top-516 box-36 yellow-dark black-text">
              <span>Rachel Romero</span>
            </div>
            <span className="border left-245 top-432" />
            <div className="undragable-box left-245 top-432 red-bg">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border left-245 top-480 border-36" />
            <div className="only-box red-box left-245 top-480 box-36 red-dark">
              <span>Mary Knight</span>
            </div>
            <span className="border left-245 top-516 border-36" />
            <div className="only-box red-box left-245 top-516 box-36 red-dark">
              <span>Carolyn Peters</span>
            </div>
            <span className="border left-355 top-432" />
            <div className="undragable-box left-355 top-432 yellow-bg black-text">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border left-355 top-480 border-36" />
            <div className="only-box yellow-box left-355 top-480 box-36 yellow-dark black-text">
              <span>Betty Wells</span>
            </div>
            <span className="border left-355 top-516 border-36" />
            <div className="only-box yellow-box left-355 top-516 box-36 yellow-dark black-text">
              <span>Deborah Ro...</span>
            </div>
            <span className="border left-465 top-432" />
            <div className="undragable-box left-465 top-432 red-bg">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border left-465 top-480 border-36" />
            <div className="only-box red-box left-465 top-480 box-36 red-dark">
              <span>Joan Warren</span>
            </div>
            <span className="border left-465 top-516 border-36" />
            <div className="only-box red-box left-465 top-516 box-36 red-dark">
              <span>Mary Wilson</span>
            </div>
            <span className="border left-575 top-432" />
            <div className="undragable-box left-575 top-432 orange-bg">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border left-575 top-480 border-36" />
            <div className="only-box orange-box left-575 top-480 box-36 orange-dark">
              <span>Theresa Pena</span>
            </div>
            <span className="border left-575 top-516 border-36" />
            <div className="only-box orange-box left-575 top-516 box-36 orange-dark">
              <span>Dorothy Diaz</span>
            </div>
            <span className="border left-685 top-432" />
            <div className="undragable-box left-685 top-432 skyblue-bg">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border left-685 top-480 border-36" />
            <div className="only-box skyblue-box left-685 top-480 box-36 skyblue-dark">
              <span>Cynthia Reed</span>
            </div>
            <span className="border left-685 top-516 border-36" />
            <div className="only-box skyblue-box left-685 top-516 box-36 skyblue-dark">
              <span>Marilyn Henry</span>
            </div>
            <span className="border left-795 top-432" />
            <div className="undragable-box left-795 top-432 blue-bg">
              <span>
                Peninsula 15 <br />
                Cromer 5
              </span>
            </div>
            <span className="border left-795 top-480 border-36" />
            <div className="only-box blue-box left-795 top-480 box-36 blue-dark">
              <span>Cynthia Reed</span>
            </div>
            <span className="border left-795 top-516 border-36" />
            <div className="only-box blue-box left-795 top-516 box-36 blue-dark">
              <span>Marilyn Henry</span>
            </div>
            <span className="border left-905 top-432" />
            <div className="undragable-box left-905 top-432 blue-bg">
              <span>
                Newport 8 <br />
                Curl Curl 8
              </span>
            </div>
            <span className="border left-905 top-480 border-36" />
            <div className="only-box blue-box left-905 top-480 box-36 blue-dark">
              <span>Cynthia Reed</span>
            </div>
            <span className="border left-905 top-516 border-36" />
            <div className="only-box blue-box left-905 top-516 box-36 blue-dark">
              <span>Marilyn Henry</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  //////footer view containing all the buttons like back and save
  footerView = () => {
    return (
      <div className="fluid-width">
        <div className="footer-view">
          <div className="row">
            <div className="col-sm-3">
              <div className="reg-add-save-button">
                <Button type="cancel-button">{AppConstants.back}</Button>
              </div>
            </div>
            <div className="col-sm-9">
              <div className="comp-buttons-view">
                <Button className="open-reg-button" type="primary">
                  {AppConstants.save_publish}
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
        <DashboardLayout menuHeading={AppConstants.umpires} menuName={AppConstants.umpires} />
        <InnerHorizontalMenu menu="umpire" umpireSelectedKey="4" />
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

export default UmpireAllocation;
