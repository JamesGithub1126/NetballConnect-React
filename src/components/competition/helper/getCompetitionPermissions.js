export default function getCompetitionPermissions(
  isNewComp = false,
  compId = null,
  hasRegistrations = false,
  isPublished = false,
  drawsPublished = false,
  isCompetitionOrganiser = false,
  isRegistrationDashboard = false,
) {
  let permissions = getDefaultPermissionsObject();

  if (isNewComp && !isPublished) {
    setAll(permissions, true);
    return permissions;
  }
  if (!compId && !isNewComp) {
    return permissions;
  }

  if (hasRegistrations && isCompetitionOrganiser && isPublished) {
    if (isRegistrationDashboard) {
      permissions.division.enabled = true;
      permissions.compDetails.enabled = true;
    } else {
      if (!drawsPublished) {
        permissions.compDetails.enabled = true;
      }
      permissions.division.enabled = true;
      permissions.division.delete.enabled = true;
    }
    permissions.compDetails.invitees.add.enabled = true;
    permissions.preference.enabled = true;
    permissions.payments.enabled = true;
    permissions.payments.installments.enabled = true;
    setAll(permissions.discounts, true);
  } else if (hasRegistrations && isCompetitionOrganiser && !isPublished) {
    //first
    setAll(permissions, true);
    //..then
    if (!isRegistrationDashboard && drawsPublished) {
      permissions.compDetails.enabled = false;
    }
  } else if (hasRegistrations && !isCompetitionOrganiser && isPublished) {
    permissions.discounts.enabled = true;
    permissions.payments.installments.enabled = true;
  } else if (hasRegistrations && !isCompetitionOrganiser && !isPublished) {
    permissions.discounts.enabled = true;
    permissions.payments.installments.enabled = true;
  } else if (!hasRegistrations && isCompetitionOrganiser && isPublished) {
    if (!isRegistrationDashboard && drawsPublished) {
      permissions.compDetails.enabled = false;
    } else {
      permissions.compDetails.enabled = true;
    }
    permissions.compDetails.invitees.add.enabled = true;
    permissions.division.enabled = true;
    permissions.division.delete.enabled = true;
    permissions.preference.enabled = true;
  } else if (!hasRegistrations && isCompetitionOrganiser && !isPublished) {
    //first
    setAll(permissions, true);
    //...then
    if (!isRegistrationDashboard && drawsPublished) {
      permissions.compDetails.enabled = false;
    } else {
      permissions.compDetails.enabled = true;
    }
  } else if (!hasRegistrations && !isCompetitionOrganiser && isPublished) {
    //default state
  } else {
    //default state
  }

  //special rules
  if (isCompetitionOrganiser) {
    permissions.compDetails.playerPublishOptions.enabled = true;
  }

  return permissions;
}

function getDefaultPermissionsObject() {
  return {
    //comp details view, tab 1, competitions -> N/A
    compDetails: {
      enabled: false,
      invitees: {
        enabled: false,
        add: {
          enabled: false,
        },
      },
      playerPublishOptions: {
        enabled: false,
      },
    },
    //memberships view, registrations -> tab 2, competitions -> N/A
    membership: {
      enabled: false,
    },
    //divisions view, registrations -> tab 3, competitions -> tab 2
    division: {
      enabled: false,
      delete: {
        enabled: false,
      },
    },
    //preference view, registrations -> N/A, competitions -> tab 3
    preference: {
      enabled: false,
    },
    //fees view, registrations -> tab 4, competitions -> N/A
    fees: {
      enabled: false,
    },
    //fees view, registrations -> tab 5, competitions -> N/A
    payments: {
      enabled: false,
      installments: {
        enabled: false,
      },
    },
    //fees view, registrations -> tab 6, competitions -> N/A
    discounts: {
      enabled: false,
      voucher: {
        enabled: false,
      },
    },
  };
}

function setAll(permissions, enabled) {
  for (let key in permissions) {
    if (key === 'enabled') {
      permissions[key] = enabled;
    } else if (typeof permissions[key] === 'object') {
      setAll(permissions[key], enabled);
    }
  }
}
