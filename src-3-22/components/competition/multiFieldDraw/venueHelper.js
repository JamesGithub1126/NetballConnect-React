function isHomeCourt(drawsState, venueId, organisationId) {
  const { competitionVenues = [] } = drawsState;
  const venue = competitionVenues.find(venue => venue.id === venueId);
  if (!venue) {
    return false;
  }

  const { homeOrganisations = [] } = venue;
  return homeOrganisations.some(org => org.organisationId === organisationId);
}

export function swapHomeAndAwayTeam(movedFixture) {
  const copy = { ...movedFixture };
  movedFixture.homeTeamId = copy.awayTeamId;
  movedFixture.homeTeamName = copy.awayTeamName;
  movedFixture.homeTeamOrganisationId = copy.awayTeamOrganisationId;

  movedFixture.awayTeamId = copy.homeTeamId;
  movedFixture.awayTeamName = copy.homeTeamName;
  movedFixture.awayTeamOrganisationId = copy.homeTeamOrganisationId;

  return {
    ...movedFixture,
    homeTeamId: copy.awayTeamId,
    homeTeamName: copy.awayTeamName,
    homeTeamOrganisationId: copy.awayTeamOrganisationId,
    awayTeamId: copy.homeTeamId,
    awayTeamName: copy.homeTeamName,
    awayTeamOrganisationId: copy.homeTeamOrganisationId,
  };
}
export function checkTargetedVenueHomeForAwayTeam(drawState, targetVenueId, movedFixture) {
  return (
    !isHomeCourt(drawState, targetVenueId, movedFixture.homeTeamOrganisationId) &&
    isHomeCourt(drawState, targetVenueId, movedFixture.awayTeamOrganisationId)
  );
}
