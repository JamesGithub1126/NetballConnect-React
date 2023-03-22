import React, { Component } from 'react';
import { Layout, Breadcrumb, Input, Button, Table, Select, Tag } from 'antd';
import { NavLink } from 'react-router-dom';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';

const { Footer, Content } = Layout;
const { Option } = Select;

const columns = [
  {
    title: AppConstants.rank,
    dataIndex: 'rank',
    key: 'rank',
    sorter: (a, b) => a.rank.length - b.rank.length,
  },
  {
    title: AppConstants.teamName,
    dataIndex: 'teamName',
    key: 'teamName',
    sorter: (a, b) => a.teamName.length - b.teamName.length,
  },
  {
    title: AppConstants.seasonResults,
    dataIndex: 'seasonResults',
    key: 'seasonResults',
    render: seasonResults => (
      <span>
        {seasonResults.map(seasonResults => (
          <Tag className="comp-player-table-tag" key={seasonResults}>
            {seasonResults}
          </Tag>
        ))}
      </span>
    ),
    sorter: (a, b) => a.seasonResults.length - b.seasonResults.length,
  },
  {
    title: AppConstants.currentGrade,
    dataIndex: 'currentGrade',
    key: 'currentGrade',
    sorter: (a, b) => a.currentGrade.length - b.currentGrade.length,
  },
  {
    title: AppConstants.newGrade,
    dataIndex: 'newGrade',
    key: 'newGrade',
    render: newGrade => (
      <Input className="input-inside-player-grades-table-for-grade" value={newGrade} />
    ),
    sorter: (a, b) => a.newGrade.length - b.newGrade.length,
  },
];

const data = [
  {
    key: '1',
    rank: '12-1',
    teamName: 'Hawks 35',
    seasonResults: [
      'Rnd15-25',
      'Rnd24-45',
      'Rnd12-50',
      'Rnd15-25',
      'Rnd24-45',
      'Rnd12-50',
      'Rnd35-25',
      'Rnd15-55',
    ],
    currentGrade: '12A',
    newGrade: '12D',
  },
  {
    key: '2',
    rank: '12-2',
    teamName: 'Hawks 36',
    seasonResults: [
      'Rnd15-25',
      'Rnd24-45',
      'Rnd12-50',
      'Rnd15-25',
      'Rnd24-45',
      'Rnd12-50',
      'Rnd35-25',
      'Rnd15-55',
    ],
    currentGrade: '12A',
    newGrade: '12B',
  },
];

class CompetitionReGrading extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: '2019',
      value: 'playingMember',
      competition: '2019winters',
      division: '12',
      grade: 'all',
    };
  }

  onChange = e => {
    this.setState({
      value: e.target.value,
    });
  };

  headerView = () => {
    return (
      <div className="comp-player-grades-header-view-design">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              {/* <Breadcrumb.Item className="breadcrumb-product">Draw</Breadcrumb.Item> */}
              <Breadcrumb.Item className="breadcrumb-product">
                {AppConstants.re_grading}
              </Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-add">{AppConstants.step1}</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </div>
    );
  };

  dropdownView = () => {
    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <div className="com-year-select-heading-view">
                <span className="year-select-heading">{AppConstants.year}:</span>
                <Select
                  className="year-select"
                  // style={{ width: 75 }}
                  onChange={year => this.setState({ year })}
                  value={this.state.year}
                >
                  <Option value="2019">{AppConstants.year2019}</Option>
                </Select>
              </div>
            </div>
            <div className="col-sm">
              <div className="w-100 d-flex flex-row align-items-center" style={{ marginRight: 50 }}>
                <span className="year-select-heading">{AppConstants.competition}:</span>
                <Select
                  className="year-select"
                  // style={{ width: 140 }}
                  onChange={competition => this.setState({ competition })}
                  value={this.state.competition}
                >
                  <Option value="2019winters">{AppConstants.deprecated}</Option>
                </Select>
              </div>
            </div>
            <div className="col-sm">
              <div className="w-100 d-flex flex-row align-items-center">
                <span className="year-select-heading">{AppConstants.division}:</span>
                <Select
                  className="year-select"
                  // style={{ width: 105 }}
                  onChange={division => this.setState({ division })}
                  value={this.state.division}
                >
                  <Option value="12">12</Option>
                </Select>
              </div>
            </div>
            <div className="col-sm">
              <div className="w-100 d-flex flex-row align-items-center">
                <span className="year-select-heading">{AppConstants.grade}:</span>
                <Select
                  className="year-select"
                  // style={{ width: 105 }}
                  onChange={grade => this.setState({ grade })}
                  value={this.state.grade}
                >
                  <Option value="all">{AppConstants.all}</Option>
                </Select>
              </div>
            </div>
            <div className="col-sm d-flex justify-content-end">
              <span className="year-select-heading">{AppConstants.gradetoggle}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  contentView = () => {
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={data}
            pagination={false}
          />
        </div>

        <div className="d-flex justify-content-end" style={{ marginTop: 15, paddingRight: 5 }}>
          <Button className="open-reg-button" type="primary">
            {AppConstants.save}
          </Button>
        </div>
      </div>
    );
  };

  footerView = () => {
    return (
      <div className="fluid-width">
        <div className="comp-player-grades-footer-view">
          <div className="row">
            <div className="col-sm">
              <div className="d-flex justify-content-end">
                <Button className="save-draft-text" type="save-draft-text">
                  {AppConstants.saveDraft}
                </Button>
                <NavLink to="/competitionReGradingStep2">
                  <Button className="open-reg-button" type="primary">
                    {AppConstants.next}
                  </Button>
                </NavLink>
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
        <InnerHorizontalMenu menu="competition" compSelectedKey={'13'} />
        <Layout>
          {this.headerView()}
          <Content>
            {this.dropdownView()}

            {this.contentView()}
          </Content>

          <Footer>{this.footerView()}</Footer>
        </Layout>
      </div>
    );
  }
}

export default CompetitionReGrading;
