import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Breadcrumb, Button, Layout, Select, Table, message } from 'antd';

import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import { isArrayNotEmpty } from '../../util/helpers';
import { fixtureCompetitionListAction } from '../../store/actions/LiveScoreAction/LiveScoreFixtureAction';
import { getLiveScoreDivisionList } from '../../store/actions/LiveScoreAction/liveScoreDivisionAction';
import { getliveScoreTeams } from '../../store/actions/LiveScoreAction/liveScoreTeamAction';
import { getMatchPrintTemplateType } from '../../store/actions/commonAction/commonAction';
import { liveScoreMatchListAction } from '../../store/actions/LiveScoreAction/liveScoreMatchAction';
import {
  liveScoreGetMatchDetailInitiate,
  liveScoreClubListAction,
} from '../../store/actions/LiveScoreAction/liveScoreMatchAction';
import {
  liveScoreMatchSheetPrintAction,
  liveScoreMatchSheetDownloadsAction,
  liveScoreBlankMatchSheetTemplatePrintAction,
} from '../../store/actions/LiveScoreAction/liveScoreMatchSheetAction';
import Loader from '../../customComponents/loader';
import InputWithHead from '../../customComponents/InputWithHead';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import LiveScoreMatchSheetPreviewModal from './matchsheets/LiveScoreMatchSheetPreviewModal';
import { liveScore_MatchFormate } from '../../themes/dateformate';
import { getLiveScoreCompetition } from '../../util/sessionStorage';
import history from '../../util/history';
import { getLiveScoreSettingInitiate } from '../../store/actions/LiveScoreAction/LiveScoreSettingAction';
import { checkLivScoreCompIsParent } from '../../util/permissions';
import { getOrganisationData } from '../../util/sessionStorage';

import './liveScore.css';

const { Header, Content } = Layout;
const { Option } = Select;

const tableSort = (a, b, key) => {
  const stringA = JSON.stringify(a[key]);
  const stringB = JSON.stringify(b[key]);

  return stringA.localeCompare(stringB);
};

class LiveScoreMatchSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      competitionId: null,
      division: null,
      selectedTeam: null,
      selectedRound: null,
      venueId: null,
      homeCompetitionOrganisationId: null,
      homeCompetitionOrganisationName: null,
      onDivisionLoad: false,
      onTeamLoad: false,
      onMatchLoad: false,
      showPreview: false,
      organisation: null,
      selectedMatchId: null,
      selectedMatch: null,
      selectedTemplateId: null,
      templateType: null,
      competitionOrganisationId: null,
      rounds: [],
      isComParent: null,
    };
  }

  componentDidMount() {
    const isCompParent = checkLivScoreCompIsParent();
    this.setState({ isCompParent });

    const { organisationId, name } = getOrganisationData() ?? {};

    if (getLiveScoreCompetition()) {
      const { id, competitionOrganisation } = JSON.parse(getLiveScoreCompetition());
      if (competitionOrganisation && !isCompParent) {
        this.setState({
          organisationId,
          homeCompetitionOrganisationId: competitionOrganisation.id,
          homeCompetitionOrganisationName: name,
        });
      }

      let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
      if (id !== undefined) {
        this.props.getLiveScoreDivisionList(id);
        this.props.liveScoreClubListAction(id);
        this.props.getLiveScoreSettingInitiate(id);
        this.setState({
          onDivisionLoad: true,
          competitionId: id,
          competitionOrganisationId: compOrgId,
        });
        this.props.getMatchPrintTemplateType();
        this.refreshDownloads();
      }
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  componentDidUpdate(nextProps) {
    if (this.props.liveScoreMatchSheetState !== nextProps.liveScoreMatchSheetState) {
      if (
        this.props.liveScoreMatchSheetState.onDivisionLoad === false &&
        this.state.onDivisionLoad === true
      ) {
        let division = null;
        if (this.props.liveScoreMatchSheetState.liveScoreDivisionList.length > 0) {
          division = this.props.liveScoreMatchSheetState.liveScoreDivisionList[0].id;
        }
        this.setState({
          onDivisionLoad: false,
          onTeamLoad: true,
          division,
        });
        this.props.getliveScoreTeams(
          this.state.competitionId,
          division,
          this.state.competitionOrganisationId,
        );
      }

      if (
        this.props.liveScoreMatchSheetState.onTeamLoad === false &&
        this.state.onTeamLoad === true
      ) {
        this.setState({
          onDivisionLoad: false,
          onTeamLoad: false,
          onMatchLoad: true,
        });
        this.fetchMatchList(this.state.division, null);
      }
    }

    if (this.props.liveScoreMatchState !== nextProps.liveScoreMatchState) {
      if (this.props.liveScoreMatchState.isFetchingMatchList === false) {
        if (this.props.liveScoreMatchState.liveScoreMatchList.length > 0) {
          const rounds = [];
          this.props.liveScoreMatchState.liveScoreMatchList.forEach(match => {
            if (match.round?.name) {
              if (rounds.findIndex(round => round.name === match.round.name) < 0) {
                rounds.push(match.round);
              }
            }
          });
          this.setState({
            rounds,
          });
        }
      }
    }
  }

  onClickPreview = matchId => {
    this.setState({ selectedMatchId: matchId });
    const match = this.props.liveScoreMatchState.liveScoreMatchList.find(m => m.id === matchId);

    this.setState({ selectedMatch: match });
    this.showPreview(true);
    this.props.liveScoreGetMatchDetailInitiate(matchId, 1);
  };

  showPreview = show => {
    this.setState({ showPreview: show });
  };

  handleModalOk = () => {
    this.showPreview(false);
  };

  handleModalCancel = () => {
    this.showPreview(false);
    this.setState({ selectedMatchId: null });
  };

  printBlank = () => {
    if (this.state.templateType) {
      this.props.liveScoreBlankMatchSheetTemplatePrintAction(
        this.state.competitionId,
        this.state.templateType,
      );
    } else {
      message.config({
        maxCount: 1,
        duration: 0.9,
      });
      message.error(AppConstants.selectTemplateTypeError);
    }
  };

  printAll = () => {
    let filteredMatches = this.props.liveScoreMatchState
      ? this.props.liveScoreMatchState.liveScoreMatchList
      : [];
    if (this.state.selectedTeam !== null) {
      filteredMatches = filteredMatches.filter(
        match =>
          match?.team1Id === this.state.selectedTeam || match?.team2Id === this.state.selectedTeam,
      );
    }
    if (this.state.selectedRound !== null) {
      const selectedRound = this.state.rounds.find(round => round?.id === this.state.selectedRound);
      filteredMatches = filteredMatches.filter(match => match?.round?.name === selectedRound?.name);
    }

    if (this.state.selectedTemplateId !== null && filteredMatches.length > 0) {
      this.props.liveScoreMatchSheetPrintAction(
        this.state.competitionId,
        this.state.division === 'All' ? null : this.state.division,
        this.state.selectedTeam === 'All' ? null : this.state.selectedTeam,
        this.state.templateType,
        this.state.selectedRound
          ? this.state.rounds.find(round => round?.id === this.state.selectedRound)?.name
          : null,
        this.state.venueId,
        this.state.homeCompetitionOrganisationId,
        this.state.homeCompetitionOrganisationName,
      );
    } else if (filteredMatches.length === 0) {
      message.error(AppConstants.matchSheetsNoPrintError);
    } else {
      message.config({
        maxCount: 1,
        duration: 0.9,
      });
      message.error(AppConstants.selectTemplateTypeError);
    }
  };

  onChangeTemplate(selectedTemplateId) {
    const { commonReducerState } = this.props;
    const templateType = commonReducerState.matchPrintTemplateType.find(
      type => type.id === selectedTemplateId,
    );

    this.setState({
      selectedTemplateId,
      templateType: templateType.description,
    });
  }

  changeDivision(divisionId) {
    const { division } = divisionId;
    this.props.getliveScoreTeams(
      this.state.competitionId,
      division,
      this.state.competitionOrganisationId,
    );
    this.setState({
      division,
      teamLoad: true,
      selectedTeam: null,
      selectedRound: null,
      rounds: [],
    });
    this.fetchMatchList(division === 'All' ? null : division, null);
  }

  onChangeTeam(selectedTeam) {
    this.setState({ selectedTeam });
  }

  onChangeRound(selectedRound) {
    this.setState({ selectedRound });
  }

  onChangeVenue(selectedVenue) {
    this.setState({ venueId: selectedVenue });
  }

  onChangeAffiliate(selectedAffiliate, affiliates) {
    if (selectedAffiliate) {
      const affiliate = affiliates.find(item => item.id === selectedAffiliate);

      this.setState({
        homeCompetitionOrganisationId: selectedAffiliate,
        homeCompetitionOrganisationName: affiliate.name,
      });
    }
  }

  fetchMatchList(divisionId, teamId) {
    let { liveScoreMatchListPageSize } = this.props.liveScoreMatchState;
    liveScoreMatchListPageSize = liveScoreMatchListPageSize ? liveScoreMatchListPageSize : 10;
    this.props.liveScoreMatchListAction(
      this.state.competitionId,
      undefined,
      undefined,
      liveScoreMatchListPageSize,
      undefined,
      divisionId,
      undefined,
      teamId,
      undefined,
      undefined,
      this.state.competitionOrganisationId,
    );
  }

  refreshDownloads() {
    const { id } = JSON.parse(getLiveScoreCompetition());
    this.props.liveScoreMatchSheetDownloadsAction(id);
  }

  /// view for breadcrumb
  headerView = () => (
    <Header className="comp-venue-courts-header-view">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">{AppConstants.matchSheets}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
    </Header>
  );

  columns = [
    {
      title: AppConstants.tableMatchID,
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => tableSort(a, b, 'id'),
    },
    {
      title: AppConstants.startTime,
      dataIndex: 'startTime',
      key: 'startTime',
      sorter: (a, b) => tableSort(a, b, 'startTime'),
      render: startTime => <span>{startTime ? liveScore_MatchFormate(startTime) : ''}</span>,
    },
    {
      title: AppConstants.round,
      dataIndex: 'round',
      key: 'round',
      sorter: (a, b) => tableSort(a, b, 'round'),
      render: round => <span>{round.name}</span>,
    },
    {
      title: '',
      dataIndex: 'id',
      key: 'operation',
      render: id => (
        <div className="d-flex justify-content-end mr-4 mr-lg-4 mr-md-0">
          <Button
            className="primary-add-comp-form"
            type="primary"
            onClick={() => this.onClickPreview(id)}
          >
            {AppConstants.preview}
          </Button>
        </div>
      ),
    },
  ];

  sheetTableHeading = () => {
    return (
      <div className="pt-4 pb-4 d-flex align-items-center">
        <div className="col-sm d-flex align-items-center">
          <span className="home-dash-left-text">{AppConstants.previews}</span>
        </div>
      </div>
    );
  };

  // Match sheet table
  sheetTableView = () => {
    const { liveScoreMatchState } = this.props;
    let filteredMatches = liveScoreMatchState ? liveScoreMatchState.liveScoreMatchList : [];
    if (this.state.selectedTeam !== null) {
      filteredMatches = filteredMatches.filter(
        match =>
          match?.team1Id === this.state.selectedTeam || match?.team2Id === this.state.selectedTeam,
      );
    }
    if (this.state.selectedRound !== null) {
      const selectedRound = this.state.rounds.find(round => round?.id === this.state.selectedRound);
      filteredMatches = filteredMatches.filter(match => match?.round?.name === selectedRound?.name);
    }

    return (
      <div className="formView mt-4 mb-20">
        {this.sheetTableHeading()}
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={this.columns}
            dataSource={filteredMatches}
            rowKey={record => record.id}
          />
        </div>
      </div>
    );
  };

  downloadTableColumns = [
    {
      title: AppConstants.tableSheetID,
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => tableSort(a, b, 'id'),
      render: id => <div style={{ minWidth: 80 }}>{id}</div>,
    },
    {
      title: AppConstants.name,
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => tableSort(a, b, 'name'),
    },
    {
      title: AppConstants.createdAt,
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => tableSort(a, b, 'createdAt'),
      render: createdAt => <span>{createdAt ? liveScore_MatchFormate(createdAt) : ''}</span>,
    },
    {
      title: AppConstants.download,
      dataIndex: 'downloadUrl',
      key: 'downloadUrl',
      render: downloadUrl => (
        <a className="sheet-download-link" href={downloadUrl}>
          Download
        </a>
      ),
    },
  ];

  downloadTableHeading = () => {
    return (
      <div className="pt-4 pb-4 d-flex align-items-center">
        <div className="col-sm d-flex align-items-center">
          <span className="home-dash-left-text">{AppConstants.downloads}</span>
        </div>
        <div className="col-sm text-right">
          <Button
            className="primary-add-comp-form mr-4 mr-lg-4 mr-md-0"
            type="primary"
            onClick={() => this.refreshDownloads()}
          >
            {AppConstants.refreshDownloads}
          </Button>
        </div>
      </div>
    );
  };

  // Match sheet table
  downloadTableView = () => {
    let DATA = this.props.liveScoreMatchSheetState.matchSheetDownloads;

    return (
      <div className="formView mt-4 mb-4">
        {this.downloadTableHeading()}
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={this.downloadTableColumns}
            dataSource={DATA}
            rowKey={record => record.id}
          />
        </div>
      </div>
    );
  };

  /// form content view
  contentView = () => {
    const { liveScoreMatchSheetState, commonReducerState, LiveScoreSetting } = this.props;
    const division = isArrayNotEmpty(liveScoreMatchSheetState.allDivisionData)
      ? liveScoreMatchSheetState.allDivisionData
      : [];
    const teamList = isArrayNotEmpty(liveScoreMatchSheetState.allTeamData)
      ? liveScoreMatchSheetState.allTeamData
      : [];
    const templateList = isArrayNotEmpty(commonReducerState.matchPrintTemplateType)
      ? commonReducerState.matchPrintTemplateType
      : [];

    let filteredMatches = this.props.liveScoreMatchState
      ? this.props.liveScoreMatchState.liveScoreMatchList
      : [];
    let roundList = isArrayNotEmpty(filteredMatches) ? this.state.rounds : [];

    const venues = isArrayNotEmpty(LiveScoreSetting.form.allVenue)
      ? LiveScoreSetting.form.allVenue
      : [];

    const affiliates = isArrayNotEmpty(liveScoreMatchSheetState.allDivisionData)
      ? liveScoreMatchSheetState.allAffiliatesData
      : [];

    const { name } = getOrganisationData();
    const selectAffiliateValue = !this.state.isCompParent
      ? name
      : this.state.homeCompetitionOrganisationId;

    return (
      <div className="p-5">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <InputWithHead heading={AppConstants.division} />
            </div>
            <div className="col-sm">
              <Select
                className="w-100"
                style={{
                  paddingRight: 1,
                  minWidth: 182,
                }}
                onChange={division => this.changeDivision({ division })}
                value={this.state.division}
                placeholder={AppConstants.selectDivision}
              >
                {division.map(item => (
                  <Option value={item.id} key={'division_' + item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div className="fluid-width" style={{ marginTop: 15 }}>
          <div className="row">
            <div className="col-sm">
              <InputWithHead heading={AppConstants.teams} />
            </div>
            <div className="col-sm">
              <Select
                className="w-100"
                style={{
                  paddingRight: 1,
                  minWidth: 182,
                }}
                onChange={selectedTeam => this.onChangeTeam(selectedTeam)}
                value={this.state.selectedTeam}
                placeholder={AppConstants.selectTeam}
              >
                {teamList.map(item => (
                  <Option value={item.id} key={'team_' + item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="fluid-width" style={{ marginTop: 15 }}>
          <div className="row">
            <div className="col-sm">
              <InputWithHead heading={AppConstants.templateType} />
            </div>
            <div className="col-sm">
              <Select
                className="w-100"
                style={{
                  paddingRight: 1,
                  minWidth: 182,
                }}
                onChange={selectedTemplateId => this.onChangeTemplate(selectedTemplateId)}
                value={this.state.selectedTemplateId ?? AppConstants.selectTemplateType}
                placeholder={AppConstants.selectTemplateType}
              >
                {templateList.map(item => (
                  <Option value={item.id} key={'template_' + item.id}>
                    {item.description}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="fluid-width" style={{ marginTop: 15 }}>
          <div className="row">
            <div className="col-sm">
              <InputWithHead heading={AppConstants.round} />
            </div>
            <div className="col-sm">
              <Select
                className="w-100"
                style={{
                  paddingRight: 1,
                  minWidth: 182,
                }}
                onChange={selectedRoundId => this.onChangeRound(selectedRoundId)}
                value={this.state.selectedRound ?? AppConstants.selectRound}
                placeholder={AppConstants.selectTemplateType}
              >
                {roundList.map(item => (
                  <Option value={item.id} key={'round_' + item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="fluid-width" style={{ marginTop: 15 }}>
          <div className="row">
            <div className="col-sm">
              <InputWithHead heading={AppConstants.venue} />
            </div>
            <div className="col-sm">
              <Select
                className="w-100"
                style={{
                  paddingRight: 1,
                  minWidth: 182,
                }}
                onChange={selectedVenue => this.onChangeVenue(selectedVenue)}
                value={this.state.venueId ?? AppConstants.selectVenue}
                placeholder={AppConstants.selectVenue}
              >
                {venues.map(item => (
                  <Option value={item.venue.id} key={'venue_' + item.id}>
                    {item.venue.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="fluid-width" style={{ marginTop: 15 }}>
          <div className="row">
            <div className="col-sm">
              <InputWithHead heading={AppConstants.affiliate} />
            </div>
            <div className="col-sm">
              <Select
                className="w-100"
                style={{
                  paddingRight: 1,
                  minWidth: 182,
                }}
                disabled={!this.state.isCompParent}
                onChange={selectedAffiliate =>
                  this.onChangeAffiliate(selectedAffiliate, affiliates)
                }
                value={selectAffiliateValue ?? AppConstants.selectAffiliate}
                placeholder={AppConstants.selectAffiliate}
              >
                {affiliates.map(item => (
                  <Option value={item.id} key={'affiliate_' + item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="fluid-width" style={{ marginTop: 15 }}>
          <div className="row">
            <div className="col-sm">
              <Button className="open-reg-button" type="primary" onClick={() => this.printBlank()}>
                {AppConstants.printBlank}
              </Button>
            </div>
            <div className="col-sm printall-btn" style={{ textAlign: 'right' }}>
              <Button className="open-reg-button" type="primary" onClick={() => this.printAll()}>
                {AppConstants.printAll}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /// footer view containing all the buttons like submit and cancel
  footerView = () => (
    <div className="fluid-width">
      <div className="match-sheet-footer-view">
        <div className="d-flex justify-content-end" style={{ marginRight: 15 }}>
          <Button
            className="open-reg-button mr-3"
            type="primary"
            onClick={() => this.refreshDownloads()}
          >
            {AppConstants.refreshDownloads}
          </Button>
        </div>
      </div>
    </div>
  );

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.matchDay} menuName={AppConstants.liveScores} />
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="22" />
        <Loader
          visible={
            false
            // this.props.liveScoreMatchSheetState.onDivisionLoad
            // || this.props.liveScoreMatchSheetState.onTeamLoad
            // || this.props.liveScoreMatchSheetState.printLoad
            // || this.props.liveScoreMatchSheetState.onLoad
            // || this.props.liveScoreMatchState.onLoad
            // || this.props.liveScoreMatchState.isFetchingMatchList
          }
        />
        <Layout>
          {this.headerView()}
          <Content>
            <div className="formView">{this.contentView()}</div>
            {this.downloadTableView()}
          </Content>
        </Layout>
        <LiveScoreMatchSheetPreviewModal
          visible={this.state.showPreview && !this.props.liveScoreMatchState.onLoad}
          match={this.state.selectedMatch}
          matchDetails={this.props.liveScoreMatchState.matchDetails}
          matchTemplateTypes={this.props.commonReducerState.matchPrintTemplateType}
          modalTitle={AppConstants.liveScoreMatchSheetPreviewModalTitle}
          handleOK={this.handleModalOk}
          handleCancel={this.handleModalCancel}
        />
      </div>
    );
  }
}

// export default LiveScoreMatchSheet;
function mapDispatchtoprops(dispatch) {
  return bindActionCreators(
    {
      fixtureCompetitionListAction,
      getLiveScoreDivisionList,
      getliveScoreTeams,
      getMatchPrintTemplateType,
      liveScoreMatchListAction,
      liveScoreGetMatchDetailInitiate,
      liveScoreMatchSheetPrintAction,
      liveScoreMatchSheetDownloadsAction,
      getLiveScoreSettingInitiate,
      liveScoreClubListAction,
      liveScoreBlankMatchSheetTemplatePrintAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreMatchSheetState: state.LiveScoreMatchSheetState,
    commonReducerState: state.CommonReducerState,
    liveScoreMatchState: state.LiveScoreMatchState,
    LiveScoreSetting: state.LiveScoreSetting,
  };
}

export default connect(mapStateToProps, mapDispatchtoprops)(LiveScoreMatchSheet);
