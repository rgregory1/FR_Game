/**
 * the great grandady of them all function
 * this is executed after every player has choosen cards
 * all riders are moved, drafted, and exhausted
 * end of game and finisher checks are sprinkled in as well
 */
function endOfTurn() {
  // remove finished riders
  removeFinishedRiders();

  // initial moves
  moveAllRiders();

  // drafting
  draftPhase();

  // exaustion
  exhaustion();

  // check for finishers
  checkForFinishers();

  // check for game over
  checkForGameOver();
}

/**
 * Checks if any riders have passed the finish line, if so
 * records them to finish table, adds to turnSummary
 */
function checkForFinishers() {
  let placements = [];

  // get track data from spreadsheet
  let trackData = track.getDataRange().getValues();

  // find finish line
  let finishLine;
  trackData.forEach((line) => {
    let finishIndex = line.findIndex((x) => x.includes("F-"));
    if (finishIndex > -1) {
      finishLine = finishIndex - 1;
    }
  });

  let playerData = getPlayerData();

  // gather xy data for each rider
  let currentPositions = getCurrentPositions(
    playerData,
    trackData,
    "movephase"
  );

  // test each rider to see if they are in a 'finish' square, if so mark
  // mark thier finish position
  currentPositions.forEach((thisGuy) => {
    // test current square for Incline or Cobbles
    let thisCell = trackData[thisGuy.y][thisGuy.x];
    if (thisCell.split("-")[0] == "F") {
      let exhaustionCount;
      let nextAvailablePlace = finish.getLastRow();

      // update deck for placement
      let riderData = thisGuy.rider.split(/(?=[A-Z])/);

      let thisRiderStatus = getLastMove(riderData[0]);

      thisRiderStatus.deck.forEach((deck) => {
        if (deck.name == riderData[1]) {
          // add place to deck to flag rider as finished
          deck.place = nextAvailablePlace;

          // get total exhaustion at this point
          exhaustionCount = [...deck.energyDeck, ...deck.recycle].filter(
            (x) => x == "2E"
          ).length;
        }
      });

      // mark rider as finished in db
      thisRiderStatus.special.push({ finish: riderData[1] });

      // update player db
      updatePlayerTurn(riderData[0], thisRiderStatus);

      let pastFinish = thisGuy.x - finishLine;

      //update finish table
      addToPlaceTable(thisGuy.rider, pastFinish, exhaustionCount);

      // update turn summary list
      placements.push({ rider: thisGuy.rider, place: nextAvailablePlace });
    }
  });

  // update turn summary page
  if (placements.length !== 0) {
    addPlaceToSummary(placements);
  }
}

/**
 *
 * @param {string} rider
 * @param {string} pastFinish - spaces past the finish
 * @param {string} exhaustionCount - for residual exhaustion
 * @returns {number} lastRow - this is the last row in the place table
 */
function addToPlaceTable(rider, pastFinish, exhaustionCount) {
  let lastRow = finish.getLastRow();

  finish.appendRow([
    lastRow,
    rider,
    pastFinish,
    getCurrentGameTurn(),
    exhaustionCount,
  ]);

  return lastRow; // this is the finishing place
}

/**
 * checks to see if all riders have finished
 * @returns {boolean} - is the game over?
 */
function checkForGameOver() {
  let isGameOver = false;

  let totalFinishers = finish.getLastRow() - 1;

  let numberOfRiders = getPlayerData().length * 2;

  if (totalFinishers >= numberOfRiders) {
    setGameOver();
    console.log("game over");
    isGameOver = true;
  } else {
    console.log("still riders to finish: ", numberOfRiders - totalFinishers);
  }

  return isGameOver;
}

/**
 * at the beginning of the movement phase, remove riders past finish
 * from the track
 */
function removeFinishedRiders() {
  // get track data from spreadsheet
  let trackData = track.getDataRange().getValues();

  let playerData = getPlayerData();

  // gather xy data for each rider
  let currentPositions = getCurrentPositions(playerData, trackData);

  // test each rider to see if they are in a 'finish' square, if so
  // remove them
  currentPositions.forEach((thisGuy) => {
    // test current square for Incline or Cobbles
    let thisCell = trackData[thisGuy.y][thisGuy.x];
    if (thisCell.split("-")[0] == "F") {
      console.log("remove: ", thisGuy.rider);
      track.getRange(thisGuy.y + 1, thisGuy.x + 1).setValue("F-");
    }
  });
}
