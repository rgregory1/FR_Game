// let allPlayerMoves = [
//   {rider: "GreenRoller", move: 4},
//   {rider: "GreenRoller", move: 4},
//   ]

/**
 * Begins the turn summary by starting with the riders and thier moves
 * @param {Array of Objects} allPlayerMoves - array of riders and thier moves
 */
function initialTurnSummary(allPlayerMoves) {
  // TODO include rider initial positions in this for eventual animation
  let turnNumber = getCurrentGameTurn() + 1

  let playerMoveString = JSON.stringify(allPlayerMoves)

  turnSum.appendRow([turnNumber, playerMoveString])
}

// let reductions = [
//   {rider: "GreenRoller", reduction: 1},
//   {rider: "GreenSprinter", reduction: 2}
// ]

/**
 * adds reductions for being blocked out or inclines and declines to summary
 * @param {object} reductions - object of riders and recuction totals
 */
function addReductionsToSummary(
  reductions = [{ rider: "BlackRoller", reduction: 1 }]
) {
  let turnSumData = turnSum.getDataRange().getValues()
  let thisTurnSum = turnSumData.pop()

  let riderData = JSON.parse(thisTurnSum[1])

  reductions.forEach(redux => {
    riderData.forEach(rider => {
      if (redux.rider == rider.rider) {
        rider.reduction = redux.reduction
      }
    })
  })

  // console.log(riderData);
  let playerMoveString = JSON.stringify(riderData)

  turnSum.appendRow([thisTurnSum[0], playerMoveString])
}

/**
 * add exhaustion and drafting data to summary
 * @param {array of strings} summary - list of riders to add to particular occuance
 * @param {string} type - type of occurance to enter
 */
function addOccurancesToSummary(
  summary = ["BlackRoller", "BlackRoller"],
  type = "exhaustion"
) {
  let turnSumData = turnSum.getDataRange().getValues()
  let thisTurnSum = turnSumData.pop()

  let riderData = JSON.parse(thisTurnSum[1])

  riderData.forEach(rider => {
    let ocurrances = summary.filter(x => x == rider.rider).length

    if (ocurrances > 0) {
      rider[type] = ocurrances
    }
  })

  console.log(riderData)

  let playerMoveString = JSON.stringify(riderData)

  turnSum.appendRow([thisTurnSum[0], playerMoveString])
}

// placements = [{rider: 'PinkRoller', place:1},{rider: 'WhiteRoller', place:1} ]

/**
 * as riders finish, add that data to summary
 * @param {array of objects} placements - list of riders and placements
 */
function addPlaceToSummary(placements) {
  let turnSumData = turnSum.getDataRange().getValues()
  let thisTurnSum = turnSumData.pop()

  let riderData = JSON.parse(thisTurnSum[1])

  placements.forEach(placement => {
    riderData.forEach(rider => {
      if (rider.rider == placement.rider) {
        rider.place = placement.place
      }
    })
  })

  let playerMoveString = JSON.stringify(riderData)

  turnSum.appendRow([thisTurnSum[0], playerMoveString])
}

/**
 * utility function to get last line of summary for augmenting
 * @returns {array of objects} - object for each rider
 */
function getLastSummaryLine() {
  let turnSumData = turnSum.getDataRange().getValues()
  let thisTurnSum = turnSumData.pop()

  let riderData = JSON.parse(thisTurnSum[1])

  return riderData
}
