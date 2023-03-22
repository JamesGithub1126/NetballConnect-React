function refRoleTypes(refRoleName) {
  let refRoleArray = [
    {
      id: 1,
      name: 'super_admin',
      description: 'Super Admin',
      applicableToWeb: 0,
    },
    {
      id: 2,
      name: 'admin',
      description: 'Admin',
      applicableToWeb: 1,
    },
    {
      id: 3,
      name: 'manager',
      description: 'Manager',
      applicableToWeb: 0,
    },
    {
      id: 4,
      name: 'scorer',
      description: 'Scorer',
      applicableToWeb: 0,
    },
    {
      id: 5,
      name: 'member',
      description: 'Spectator',
      applicableToWeb: 0,
    },
    {
      id: 6,
      name: 'spectator',
      description: 'Spectator',
      applicableToWeb: 0,
    },
    {
      id: 7,
      name: 'attendance_recorder',
      description: 'Attendance Recorder',
      applicableToWeb: 0,
    },
    {
      id: 8,
      name: 'player',
      description: 'Player',
      applicableToWeb: 0,
    },
    {
      id: 9,
      name: 'parent',
      description: 'Parent',
      applicableToWeb: 0,
    },
    {
      id: 10,
      name: 'web_communications_admin',
      description: 'Communications Admin',
      applicableToWeb: 1,
    },
    {
      id: 11,
      name: 'web_umpires_admin',
      description: 'Umpires Admin',
      applicableToWeb: 1,
    },
    {
      id: 12,
      name: 'web_results_admin',
      description: 'Results Admin',
      applicableToWeb: 1,
    },
    {
      id: 13,
      name: 'web_finance_admin',
      description: 'Finance Admin',
      applicableToWeb: 1,
    },
    {
      id: 14,
      name: 'event_invitee',
      description: 'Event invitee',
      applicableToWeb: 0,
    },
    {
      id: 15,
      name: 'umpire',
      description: 'Umpire',
      applicableToWeb: 0,
    },
    {
      id: 16,
      name: 'non_player',
      description: 'Non Player',
      applicableToWeb: 0,
    },
    {
      id: 17,
      name: 'coach',
      description: 'Coach',
      applicableToWeb: 0,
    },
    {
      id: 31,
      name: 'other_official',
      description: 'Other Official',
      applicableToWeb: 0,
    },
  ];

  let refRoleId = [];
  for (let i in refRoleArray) {
    if (refRoleName.includes(refRoleArray[i].name)) {
      refRoleId.push(refRoleArray[i].id);
    }
  }
  return refRoleId;
}

module.exports = { refRoleTypes };
