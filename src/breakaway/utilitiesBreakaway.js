/**
 * this function removes the two winning bid cards and adds in exhaustion cards
 * @param {string} team - team to process
 * @param {string} rider - specific rider
 */
function processBreakAwayWinnerCards(team = "Black", rider = "Roller") {
  let status = getLastMove(team)

  // get deck index
  let di = status.deck.findIndex(x => x.name == rider)

  // console.log(turnData.deck[di].energyDeck)

  // add picked cards to discard
  let pickedCards = [status.choice[0].card, status.choice[1].card]
  status.deck[di].discard.push(...pickedCards)

  status.choice = [
    { rider: rider, card: "2E" },
    { rider: rider, card: "2E" },
  ]

  updatePlayerTurn(team, status)
}

/**
 * reset all decks by adding back in recycle and reshuffling
 */
function resetDecksAfterBreakaway() {
  let allLastMoves = getAllLastMoves()

  allLastMoves.forEach(status => {
    let breakAwayRider = status.choice[0].rider

    let di = status.deck.findIndex(x => x.name == breakAwayRider)

    // add back in exhaustion or failed bids
    let pickedCards = [status.choice[0].card, status.choice[1].card]

    // combine decks again
    status.deck[di].energyDeck.push(...status.deck[di].recycle, ...pickedCards)

    // reset recycle and choice
    status.deck[di].recycle = []
    status.choice = []
    status.phase = []
    status.turn = 0

    // shuffle decks
    status.deck[di].energyDeck = shuffleDeck(status.deck[di].energyDeck)

    updatePlayerTurn(status.team, status)

    console.log("all teams reshuffled")
  })
}

function getBreakAwayStatus() {
  let isBreakAway = baseGameInfo.getRange("B14").getValue()
  if (isBreakAway == "Yes") {
    return true
  } else {
    return false
  }
}

function getBreakAwaySpots() {
  let breakAwaySpaces = baseGameInfo.getRange("C14").getValue()
  return breakAwaySpaces
}

function setBreakawayCounterToZero() {
  // set breakaway to No
  baseGameInfo.getRange("B14").setValue("No")

  // set turn to zero
  baseGameInfo.getRange("B11").setValue(0)
}

/**
 * moves the breakaway winners on the track
 * @param {string} rider
 * @param {string} position
 * @param {string} trackData - optional parameter that can reduce DB calls
 */
function moveWinningBreakawayRider(rider, position, trackData) {
  if (trackData === undefined) {
    trackData = track.getDataRange().getValues()
  }

  let riderPosition = getRiderXY(rider, trackData)

  // remove rider
  track.getRange(riderPosition.y + 1, riderPosition.x + 1).setValue("S-")

  // find breakaway space
  let breakawayCell = {}
  trackData.forEach((line, i) => {
    let foundIt = line.findIndex(x => x.includes("A-" + position))
    if (foundIt !== -1) {
      // console.log("y: ", i);
      // console.log("x: ", foundIt);
      breakawayCell.x = foundIt
      breakawayCell.y = i
    }
  })

  // add rider to breakaway space
  track
    .getRange(breakawayCell.y + 1, breakawayCell.x + 1)
    .setValue("A-" + rider)
}
