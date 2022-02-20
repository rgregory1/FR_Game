// let allPlayerMoves = [
//   {rider: "GreenRoller", move: 4},
//   {rider: "GreenRoller", move: 4},
//   ]

/**
 * Begins the turn summary by starting with the riders and thier moves
 * @param {Array of Objects} allPlayerMoves - array of riders and thier moves
 */
function initialTurnSummary(allPlayerMoves) {
  let turnNumber = getCurrentGameTurn() + 1;

  // let turnSumData = turnSum.getDataRange().getValues()

  let playerMoveString = JSON.stringify(allPlayerMoves);

  turnSum.appendRow([turnNumber, playerMoveString]);
}

// let reductions = [
//   {rider: "GreenRoller", reduction: 1},
//   {rider: "GreenSprinter", reduction: 2}
// ]

function addReductionsToSummary(
  reductions = [{ rider: "BlackRoller", reduction: 1 }]
) {
  let turnSumData = turnSum.getDataRange().getValues();
  let thisTurnSum = turnSumData.pop();

  let riderData = JSON.parse(thisTurnSum[1]);

  reductions.forEach((redux) => {
    riderData.forEach((rider) => {
      if (redux.rider == rider.rider) {
        rider.reduction = redux.reduction;
      }
    });
  });

  console.log(riderData);
  let playerMoveString = JSON.stringify(riderData);

  turnSum.appendRow([thisTurnSum[0], playerMoveString]);
}

function addOccurancesToSummary(
  summary = ["BlackRoller", "BlackRoller"],
  type = "exhaustion"
) {
  let turnSumData = turnSum.getDataRange().getValues();
  let thisTurnSum = turnSumData.pop();

  let riderData = JSON.parse(thisTurnSum[1]);

  riderData.forEach((rider) => {
    let ocurrances = summary.filter((x) => x == rider.rider).length;

    if (ocurrances > 0) {
      rider[type] = ocurrances;
    }
  });

  console.log(riderData);

  let playerMoveString = JSON.stringify(riderData);

  turnSum.appendRow([thisTurnSum[0], playerMoveString]);
}

// placements = [{rider: 'PinkRoller', place:1},{rider: 'WhiteRoller', place:1} ]
function addPlaceToSummary(placements) {
  let turnSumData = turnSum.getDataRange().getValues();
  let thisTurnSum = turnSumData.pop();

  let riderData = JSON.parse(thisTurnSum[1]);

  placements.forEach((placement) => {
    riderData.forEach((rider) => {
      if (rider.rider == placement.rider) {
        rider.place = placement.place;
      }
    });
  });

  let playerMoveString = JSON.stringify(riderData);

  turnSum.appendRow([thisTurnSum[0], playerMoveString]);
}

function getLastSummaryLine() {
  let turnSumData = turnSum.getDataRange().getValues();
  let thisTurnSum = turnSumData.pop();

  let riderData = JSON.parse(thisTurnSum[1]);

  return riderData;
}
