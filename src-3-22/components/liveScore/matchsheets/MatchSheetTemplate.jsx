import React from 'react';
import PropTypes from 'prop-types';
import { Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import moment from 'moment';
import AppConstants from 'themes/appConstants';

const styles = StyleSheet.create({
  page: {
    padding: 16,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  document: {
    width: '100%',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  associationName: {
    fontSize: 14,
    fontWeight: 'bold',
    padding: '8px 0',
  },
  templateType: {
    fontSize: 12,
  },
  title: {
    width: '50%',
  },
  logo: {
    width: 50,
    height: 50,
  },
  matchInfo: {
    padding: 8,
    flexDirection: 'row',
  },
  infoContentLeft: {
    width: '50%',
    paddingRight: 16,
    paddingLeft: 8,
  },
  infoContentRight: {
    width: '50%',
    paddingRight: 16,
    paddingLeft: 12,
  },
  infoText: {
    fontSize: 9,
    marginBottom: 4,
  },
  tableContent: {
    width: '100%',
    flexDirection: 'row',
    paddingLeft: 8,
  },
  signTable: {
    width: '50%',
    padding: 8,
    paddingRight: 16,
  },
  table: {
    border: '1px solid black',
    borderRight: 0,
    borderBottom: 0,
  },
  row: {
    width: '100%',
    height: 10,
    flexDirection: 'row',
    fontSize: 8,
    borderBottom: '1px solid black',
  },
  cell: {
    width: '8%',
    borderRight: '1px solid black',
    textAlign: 'center',
  },
  largeCell: {
    width: '30%',
    borderRight: '1px solid black',
    textAlign: 'center',
  },
  subTitle: {
    padding: 9,
    paddingLeft: 16,
    fontSize: 9,
  },
  passCell: {
    width: '2.5%',
    borderRight: '1px solid black',
    textAlign: 'center',
  },
  passTable: {
    width: '100%',
    padding: 8,
    paddingRight: 16,
  },
  passRow: {
    width: '100%',
    height: 16,
    flexDirection: 'row',
    fontSize: 9,
    borderBottom: '1px solid black',
  },
  scoreTableRight: {
    width: '50%',
    padding: 8,
    paddingRight: 16,
  },
  scoreTableLeft: {
    width: '50%',
    padding: 8,
    paddingRight: 16,
    borderRight: '1px solid black',
  },
  scoreCell: {
    width: '5%',
    textAlign: 'center',
  },
  scoreRow: {
    width: '100%',
    height: 12,
    flexDirection: 'row',
    fontSize: 9,
  },
  tableTitle: {
    fontSize: 9,
    marginBottom: 12,
  },
  summaryTable: {
    width: '100%',
    padding: 8,
    paddingRight: 16,
  },
  summaryRow: {
    width: '100%',
    height: 15,
    flexDirection: 'row',
    fontSize: 9,
    borderBottom: '1px solid black',
  },
  summaryCell: {
    width: '28%',
    paddingLeft: 12,
    paddingTop: 2,
  },
  gapCell: {
    width: '4%',
    borderRight: '1px solid black',
    textAlign: 'center',
  },
  signatureCell: {
    width: '20%',
    paddingTop: 2,
    borderRight: '1px solid black',
  },
  voteCell: {
    width: '20%',
    paddingLeft: 12,
    paddingTop: 2,
    borderRight: '1px solid black',
  },
  teamCell: {
    width: '40%',
    paddingLeft: 12,
    paddingTop: 2,
    borderRight: '1px solid black',
  },
  goalTable: {
    width: '100%',
    padding: 8,
    paddingRight: 16,
  },
  goalRow: {
    width: '100%',
    height: 24,
    flexDirection: 'row',
    fontSize: 8,
    borderBottom: '1px solid black',
  },
  goalCell: {
    width: '6%',
    borderRight: '1px solid black',
    textAlign: 'center',
  },
  goalCheckCell: {
    width: '29%',
    borderRight: '1px solid black',
  },
  goalSubCell: {
    height: 12,
    textAlign: 'center',
    padding: 1,
    borderBottom: '1px solid black',
  },
});

const MatchSheetTemplate = props => {
  const { templateType, matchDetails, match } = props;

  const {
    team1players,
    team2players,
    // umpires,
    organisation,
  } = matchDetails;

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.title}>
          <Text style={styles.associationName}>{organisation.name || 'Association'}</Text>
          <Text style={styles.templateType}>{templateType} Scoresheet</Text>
        </View>
        <Image
          style={styles.logo}
          src={organisation.logoUrl || 'https://img.icons8.com/color/myspace'}
        />
      </View>
      <View style={styles.matchInfo}>
        <View style={styles.infoContentLeft}>
          <Text style={styles.infoText}>{match.round ? match.round.name : ''}</Text>
          <Text style={styles.infoText}>
            {match.venueCourt && match.venueCourt.venue ? match.venueCourt.venue.name : ''}
          </Text>
          <Text style={styles.infoText}>{match.team1 ? match.team1.name : ''}</Text>
        </View>
        <View style={styles.infoContentRight}>
          <Text style={styles.infoText}>
            Date: {moment(new Date(match.startTime)).format('DD/MM/YYYY')}
          </Text>
          <Text style={styles.infoText}>
            Time: {moment(new Date(match.startTime)).format('HH:MM a')}
          </Text>
          <Text style={styles.infoText}>{match.team2 ? match.team2.name : ''}</Text>
        </View>
      </View>
      {templateType !== 'Carnival' && (
        <View style={styles.tableContent}>
          <View style={styles.signTable}>
            <View style={styles.table}>
              <View style={styles.row}>
                <Text style={styles.cell}>#</Text>
                <Text style={styles.largeCell}>{AppConstants.playerName}</Text>
                <Text style={styles.largeCell}>{AppConstants.signature}</Text>
                <Text style={styles.cell}>1</Text>
                <Text style={styles.cell}>2</Text>
                <Text style={styles.cell}>3</Text>
                <Text style={styles.cell}>4</Text>
              </View>
              {team1players.map((player, index) => (
                <View style={styles.row} key={`row_${index}`}>
                  <Text style={styles.cell}>{player.playerId}</Text>
                  <Text style={styles.largeCell}>{`${player.firstName} ${player.lastName}`}</Text>
                  <Text style={styles.largeCell} />
                  <Text style={styles.cell} />
                  <Text style={styles.cell} />
                  <Text style={styles.cell} />
                  <Text style={styles.cell} />
                </View>
              ))}
            </View>
          </View>
          <View style={styles.signTable}>
            <View style={styles.table}>
              <View style={styles.row}>
                <Text style={styles.cell}>#</Text>
                <Text style={styles.largeCell}>{AppConstants.playerName}</Text>
                <Text style={styles.largeCell}>{AppConstants.signature}</Text>
                <Text style={styles.cell}>1</Text>
                <Text style={styles.cell}>2</Text>
                <Text style={styles.cell}>3</Text>
                <Text style={styles.cell}>4</Text>
              </View>
              {team2players.map((player, index) => (
                <View style={styles.row} key={`row_${index}`}>
                  <Text style={styles.cell}>{player.playerId}</Text>
                  <Text style={styles.largeCell}>{`${player.firstName} ${player.lastName}`}</Text>
                  <Text style={styles.largeCell} />
                  <Text style={styles.cell} />
                  <Text style={styles.cell} />
                  <Text style={styles.cell} />
                  <Text style={styles.cell} />
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
      <Text style={styles.subTitle}>{AppConstants.centrePass}</Text>
      <View style={styles.tableContent}>
        <View style={styles.passTable}>
          <View style={styles.table}>
            {[...Array(4).keys()].map(rowIndex => (
              <View style={styles.passRow} key={`row_${rowIndex}`}>
                {[...Array(40).keys()].map(cellIndex => (
                  <Text style={styles.passCell} key={`cell_${cellIndex}`} />
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.subTitle}>{AppConstants.progressiveScore}</Text>
      <View style={styles.tableContent}>
        <View style={styles.scoreTableLeft}>
          <Text style={styles.tableTitle}>{AppConstants.team1}</Text>
          {[...Array(4).keys()].map(rowIndex => (
            <View style={styles.scoreRow} key={`row_${rowIndex}`}>
              {[...Array(20).keys()].map(cellIndex => (
                <Text style={styles.scoreCell} key={`cell_${cellIndex}`}>
                  {cellIndex + 1 + 20 * rowIndex}
                </Text>
              ))}
            </View>
          ))}
        </View>
        <View style={styles.scoreTableRight}>
          <Text style={styles.tableTitle}>{AppConstants.team2}</Text>
          {[...Array(4).keys()].map(rowIndex => (
            <View style={styles.scoreRow} key={`row_${rowIndex}`}>
              {[...Array(20).keys()].map(cellIndex => (
                <Text style={styles.scoreCell} key={`cell_${cellIndex}`}>
                  {cellIndex + 1 + 20 * rowIndex}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </View>
      {templateType !== 'Social' && (
        <>
          <Text style={styles.subTitle}>{AppConstants.goalState}</Text>
          <View style={styles.tableContent}>
            <View style={styles.goalTable}>
              <View style={styles.table}>
                {[...Array(4).keys()].map(rowIndex => (
                  <View style={styles.goalRow} key={`row_${rowIndex}`}>
                    <View style={styles.goalCell}>
                      <Text style={styles.goalSubCell}>Q {rowIndex + 1}</Text>
                      <Text />
                    </View>
                    <View style={styles.goalCell}>
                      <Text style={styles.goalSubCell}>{AppConstants.gs}</Text>
                      <Text>{AppConstants.ga}</Text>
                    </View>
                    <View style={styles.goalCheckCell}>
                      <Text style={styles.goalSubCell} />
                      <Text />
                    </View>
                    <View style={styles.goalCell}>
                      <Text style={styles.goalSubCell} />
                      <Text />
                    </View>
                    <Text style={styles.goalCell} />
                    <View style={styles.goalCell}>
                      <Text style={styles.goalSubCell}>{AppConstants.gs}</Text>
                      <Text>{AppConstants.ga}</Text>
                    </View>
                    <View style={styles.goalCheckCell}>
                      <Text style={styles.goalSubCell} />
                      <Text />
                    </View>
                    <View style={styles.goalCell}>
                      <Text style={styles.goalSubCell} />
                      <Text />
                    </View>
                    <Text style={styles.goalCell} />
                  </View>
                ))}
              </View>
            </View>
          </View>
          <Text style={styles.subTitle}>{AppConstants.mvp}</Text>
          <View style={styles.tableContent}>
            <View style={styles.summaryTable}>
              <View style={styles.table}>
                <View style={styles.summaryRow}>
                  <Text style={styles.voteCell}>{AppConstants.threeVotes}</Text>
                  <Text style={styles.teamCell}>{AppConstants.name}</Text>
                  <Text style={styles.teamCell}>{AppConstants.team}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.voteCell}>{AppConstants.twoVotes}</Text>
                  <Text style={styles.teamCell}>{AppConstants.name}</Text>
                  <Text style={styles.teamCell}>{AppConstants.team}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.voteCell}>{AppConstants.oneVote}</Text>
                  <Text style={styles.teamCell}>{AppConstants.name}</Text>
                  <Text style={styles.teamCell}>{AppConstants.team}</Text>
                </View>
              </View>
            </View>
          </View>
        </>
      )}
      <View style={styles.tableContent}>
        <View style={styles.summaryTable}>
          <View style={styles.table}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryCell}>
                {AppConstants.scorer1}
                {/*Scorer 1 {matchDetail.scorer1 ? `${matchDetail.scorer1.firstName} ${matchDetail.scorer1.lastName}` : ''}*/}
              </Text>
              <Text style={styles.signatureCell}>{AppConstants.signature}</Text>
              <Text style={styles.gapCell} />
              <Text style={styles.summaryCell}>{AppConstants.scorer2}</Text>
              <Text style={styles.signatureCell}>{AppConstants.signature}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryCell}>{AppConstants.umpire}</Text>
              <Text style={styles.signatureCell}>{AppConstants.signature}</Text>
              <Text style={styles.gapCell} />
              <Text style={styles.summaryCell}>{AppConstants.umpire}</Text>
              <Text style={styles.signatureCell}>{AppConstants.signature}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryCell}>{AppConstants.captain}</Text>
              <Text style={styles.signatureCell}>{AppConstants.signature}</Text>
              <Text style={styles.gapCell} />
              <Text style={styles.summaryCell}>{AppConstants.captain}</Text>
              <Text style={styles.signatureCell}>{AppConstants.signature}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

MatchSheetTemplate.propTypes = {
  templateType: PropTypes.string,
  matchDetails: PropTypes.object,
  match: PropTypes.object,
};

MatchSheetTemplate.defaultProps = {
  templateType: 'Fixtures',
  matchDetails: null,
  match: null,
};

export default MatchSheetTemplate;
