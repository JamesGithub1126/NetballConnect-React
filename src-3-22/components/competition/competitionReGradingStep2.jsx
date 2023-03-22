import React, { Component } from 'react';
import { Layout, Breadcrumb, Input, Button, Table, Select } from 'antd';
import './competition.css';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';

const { Footer, Content } = Layout;
const { Option } = Select;

const columns = [
  {
    title: AppConstants.summary,
    dataIndex: 'summary',
    key: 'summary',
    sorter: (a, b) => a.summary.length - b.summary.length,
  },
  {
    title: AppConstants.teamNumbers,
    dataIndex: 'teamNumbers',
    key: 'teamNumbers',
    render: teamNumbers => (
      <Input className="input-inside-player-grades-table-for-grade" value={teamNumbers} />
    ),
    sorter: (a, b) => a.teamNumbers.length - b.teamNumbers.length,
  },
  {
    title: AppConstants.minTeamsGradeOrDivision,
    dataIndex: 'minTeamsPerGarde',
    key: 'minTeamsPerGarde',
    render: minTeamsPerGarde => (
      <Input className="input-inside-player-grades-table-for-grade" value={minTeamsPerGarde} />
    ),
    width: '30%',
    sorter: (a, b) => a.minTeamsPerGarde.length - b.minTeamsPerGarde.length,
  },
  {
    title: AppConstants.divisionAge,
    dataIndex: 'divisionGrades',
    key: 'divisionGrades',
    render: divisionGrades => (
      <Input className="input-inside-player-grades-table-for-grade" value={divisionGrades} />
    ),
    sorter: (a, b) => a.divisionGrades.length - b.divisionGrades.length,
  },
];

const data = [
  {
    key: '1',
    summary: 'Net Set Go',
    teamNumbers: '23',
    minTeamsPerGarde: '7',
    divisionGrades: '3',
  },
  {
    key: '2',
    summary: '10 years',
    teamNumbers: '23',
    minTeamsPerGarde: '7',
    divisionGrades: '3',
  },
  {
    key: '3',
    summary: '11 years',
    teamNumbers: '40',
    minTeamsPerGarde: '7',
    divisionGrades: '3',
  },
  {
    key: '4',
    summary: '16 years',
    teamNumbers: '34',
    minTeamsPerGarde: '7',
    divisionGrades: '5',
  },
  {
    key: '5',
    summary: 'AR 1',
    teamNumbers: '30',
    minTeamsPerGarde: '7',
    divisionGrades: '5',
  },
  {
    key: '6',
    summary: 'AR 2',
    teamNumbers: '23',
    minTeamsPerGarde: '7',
    divisionGrades: '6',
  },
];

class CompetitionReGradingStep2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: '2019',
      value: 'playingMember',
      competition: '2019winters',
      division: '12years',
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
              <Breadcrumb.Item className="breadcrumb-product">
                {AppConstants.finalisedDraw}
              </Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-add">{AppConstants.step2}</Breadcrumb.Item>
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
            <div className="col-sm-2">
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
            <div className="col-sm-8">
              <div className="w-100 d-flex flex-row align-items-center" style={{ marginRight: 50 }}>
                <span className="year-select-heading">{AppConstants.competitionName}:</span>
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
                <Button className="open-reg-button" type="primary">
                  {AppConstants.confirm}
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

export default CompetitionReGradingStep2;
