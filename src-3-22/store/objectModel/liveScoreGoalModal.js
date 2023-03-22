function getGoalListData(data, isBasketball, isFootball) {
  let goalArray = [];
  for (let i in data) {
    goalArray.push(this.getGoalListObject(data[i], isBasketball, isFootball));
  }
  return goalArray;
}

//// Goal Type Match

function getGoalListObject(data, isBasketball, isFootball) {
  if (isBasketball) {
    return basketballStatisticsObject(data);
  } else if (isFootball) {
    return footballStatisticsObject(data);
  }
  return {
    matchId: data.matchId,
    startTime: data.startTime,
    teamId: data.teamId,
    teamName: data.teamName,
    playerId: data.playerId,
    firstName: data.firstName,
    roundName: data.roundName,
    lastName: data.lastName,
    gamePositionName: data.gamePositionName,
    goal: data.goal,
    miss: data.miss,
    penalty_miss: data.penalty_miss,
    goal_percent: (data.goal_percent * 100).toFixed(2) + '%',
    attempts: Number(data.goal) + Number(data.miss),
    userId: data.playerId,
  };
}

function statisticsObject(data) {
  return {
    goal: data.goal,
    penalty: data.penalty,
    penaltyShootout: data.penaltyShootout,
    assist: data.assist,
    own_goal: data.own_goal,
    corner: data.corner,
    offside: data.offside,
    foul: data.foul,
    on_target: data.on_target,
    off_target: data.off_target,
    yd: data.yd,
    y1: data.y1,
    y2: data.y2,
    y3: data.y3,
    y4: data.y4,
    y5: data.y5,
    y6: data.y6,
    y7: data.y7,
    y8: data.y8,
    r1: data.r1,
    r2: data.r2,
    r3: data.r3,
    r4: data.r4,
    r5: data.r5,
    r6: data.r6,
    r7: data.r7,
    r8: data.r8,
    yellow_card_TD: data.yellow_card_TD,
    yellow_card: data.yellow_card,
    red_card: data.red_card,
  };
}
function footballStatisticsObject(data) {
  return {
    matchId: data.matchId,
    startTime: data.startTime,
    teamId: data.teamId,
    teamName: data.teamName,
    playerId: data.playerId,
    firstName: data.firstName,
    lastName: data.lastName,
    gamePositionName: data.gamePositionName,
    roundName: data.roundName,
    userId: data.userId,
    matchStatus: data.matchStatus,
    resultStatus: data.resultStatus,
    duration: data.duration ? data.duration / 60 : 0,
    ...statisticsObject(data),
  };
}

//// Goal Type All

function getGoalTypeAllData(data, isBasketball, isFootball) {
  let goalArray = [];
  for (let i in data) {
    goalArray.push(this.getGoalTypeAllObject(data[i], isBasketball, isFootball));
  }
  return goalArray;
}

function getGoalTypeAllObject(data, isBasketball, isFootball) {
  if (isBasketball) {
    return basketballStatisticsObject(data);
  } else if (isFootball) {
    return footballStatisticsAllObject(data);
  }
  return {
    teamId: data.teamId,
    teamName: data.teamName,
    playerId: data.playerId,
    firstName: data.firstName,
    lastName: data.lastName,
    gamePositionName: data.gamePositionName,
    goal: data.goal,
    miss: data.miss,
    penalty_miss: data.penalty_miss,
    goal_percent: (data.goal_percent * 100).toFixed(2) + '%',
    attempts: Number(data.goal) + Number(data.miss),
    userId: data.playerId,
  };
}

function footballStatisticsAllObject(data) {
  return {
    teamId: data.teamId,
    teamName: data.teamName,
    playerId: data.playerId,
    firstName: data.firstName,
    lastName: data.lastName,
    gamePositionName: data.gamePositionName,
    duration: data.duration ? data.duration / 60 : 0,
    userId: data.userId,
    matchStatus: data.matchStatus,
    resultStatus: data.resultStatus,
    ...statisticsObject(data),
  };
}

function basketballStatisticsObject(data) {
  return {
    ...data,
    'FG%': Number(data['FG%']).toFixed(2) + '%',
    '2P%': Number(data['2P%']).toFixed(2) + '%',
    '3P%': Number(data['3P%']).toFixed(2) + '%',
    'FT%': Number(data['FT%']).toFixed(2) + '%',
  };
}

export default { getGoalListData, getGoalListObject, getGoalTypeAllData, getGoalTypeAllObject };
