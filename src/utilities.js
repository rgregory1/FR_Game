/**
 *  retrieves player data
 *  @param {String} team - optional parameter if you want to return a single team
 *  @return {Array of Objects} team data from baseGameInfo sheet
 */
function getPlayerData(team) {
  let baseGameData = baseGameInfo.getRange(2, 1, 6, 7).getValues();

  let playerData = [];

  baseGameData.forEach((player) => {
    if (player[3] !== "") {
      playerData.push({
        line: player[0],
        team: player[1],
        teamName: player[2],
        email: player[3],
        tourPoints: player[4] == "" ? 0 : player[4],
        deck1Ex: player[5] == "" ? 0 : player[5],
        deck2Ex: player[6] == "" ? 0 : player[6],
      });
    }
  });

  if (typeof team !== "undefined") {
    playerData = playerData.filter((x) => x.team == team);
  }
  console.log(playerData);
  return playerData;
}

/**
 * shuffles a specific deck
 * @param {Array<strings>} deck - enter deck to be shuffled
 * @return {[string,string,string]} deck - randomized deck
 */
function shuffleDeck(deck) {
  // shuffle the cards
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    let temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }

  return deck;
}

/**
 * find last move off single team
 * @param {string} team - team name
 * @param {Array of Arrays} dbData - optional, the entire database data
 * @return {Object} lastMoveObj - ann object containing all the data from the teams last move
 */
function getLastMove(team = "Black", dbData) {
  if (typeof dbData == "undefined") {
    dbData = getDbData();
  }

  let lastMove;

  for (var i = dbData.length - 1; i >= 0; i--) {
    console.log(i);
    if (dbData[i][0] == team) {
      lastMove = dbData[i];
      break;
    }
  }

  // console.log(lastMove);

  let lastMoveObj = {
    team: lastMove[0],
    special: JSON.parse(lastMove[1]),
    turn: lastMove[2],
    phase: JSON.parse(lastMove[3]),
    hand: JSON.parse(lastMove[4]),
    choice: JSON.parse(lastMove[5]),
    deck: JSON.parse(lastMove[6]),
  };
  return lastMoveObj;
}

/**
 * get all last moves of each team
 * @return {Array of Objects} allMoves - each players turn object in a list
 */
function getAllLastMoves() {
  let dbData = getDbData();
  let playerData = getPlayerData();
  let allMoves = [];

  // let reversedDbData = dbData.reverse();

  playerData.forEach((player) => {
    let status = getLastMove(player.team, dbData);

    allMoves.push(status);
  });

  return allMoves;
}

/**
 * updates the data for current player
 * @param {String} team - team name
 * @param {Object} status - object with one teams current turn
 */
function updatePlayerTurn(team = "Black", status) {
  db.appendRow([
    status.team,
    JSON.stringify(status.special),
    status.turn,
    JSON.stringify(status.phase),
    JSON.stringify(status.hand),
    JSON.stringify(status.choice),
    JSON.stringify(status.deck),
  ]);
}

/**
 * returns each riders exhaustion and play status to webpage for display
 * @return {Object} object - exhaustion and which players have played
 */
function getExhaustionCounts() {
  let playerExhaustionCounts = [];
  let playersPlayed = [];
  let currentGameTurn = getCurrentGameTurn();

  let allLastMoves = getAllLastMoves();

  allLastMoves.forEach((lastMove) => {
    lastMove.deck.forEach((singleDeck) => {
      let exhaustionCount = [
        ...singleDeck.energyDeck,
        ...singleDeck.recycle,
      ].filter((x) => x == "2E").length;

      // test for exhaustion card in choice
      lastMove.choice.forEach((choiceObj) => {
        if (choiceObj.rider == singleDeck.name && choiceObj.card == "2E") {
          ++exhaustionCount;
        }
      });

      playerExhaustionCounts.push({
        rider: lastMove.team + singleDeck.name,
        exhaustCount: exhaustionCount,
      });
    });

    if (lastMove.turn > currentGameTurn) {
      playersPlayed.push(lastMove.team);
    }
  });

  return { exhaustion: playerExhaustionCounts, playersPlayed: playersPlayed };
}

/**
 * returns the contents of the DB
 * @return {Array of Arrays} dbData - returns all DB data
 */
function getDbData() {
  let dbData = db.getDataRange().getValues();
  dbData.shift();

  return dbData;
}

function increaseGameTurn() {
  let currentTurn = getCurrentGameTurn();
  baseGameInfo.getRange("B11").setValue(currentTurn + 1);
}

function getCurrentGameTurn() {
  return baseGameInfo.getRange("B11").getValue();
}

function getGameName() {
  let gameName = baseGameInfo.getRange("B12").getValue();
  return gameName;
}

function getTrackName() {
  let trackName = baseGameInfo.getRange("B17").getValue();
  let raceName = baseGameInfo.getRange("B12").getValue();
  return { trackName: trackName, raceName: raceName };
}

/**
 * removes the numbers from the track after setup is complete
 */
function removeStartNumbers() {
  let trackData = getTrackData();

  trackData.forEach((line, i) => {
    line.forEach((cell, x) => {
      let cellData = cell.split("-");
      if (cellData[0] !== "B" && cellData[1] !== "") {
        if (!isNaN(cellData[1])) {
          console.log("ready for removal", cellData[1]);
          track.getRange(i + 1, x + 1).setValue(cellData[0] + "-");
        }
      }
    });
  });
}

function setGameOver() {
  baseGameInfo.getRange("B15").setValue("Yes");
}

function getGameOver() {
  let isGameOver = baseGameInfo.getRange("B15").getValue();
  if (isGameOver == "Yes") {
    return true;
  } else {
    return false;
  }
}
