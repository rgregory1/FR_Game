function getPlayerDeck(team) {
  let playerDate = getPlayerData(team);
}

/*
 *  returns team data from baseGameInfo sheet
 *  returns all the teams' data if you don't enter a team color
 *  returns only one team if you enter a color
 */
function getPlayerData(team) {
  let rawData = baseGameInfo.getRange(2, 1, 6, 4).getValues();

  let playerData = [];

  rawData.forEach((player) => {
    if (player[3] !== "") {
      playerData.push({
        line: player[0],
        team: player[1],
        teamName: player[2],
        email: player[3],
      });
    }
  });

  if (typeof team !== "undefined") {
    playerData = playerData.filter((x) => x.team == team);
  }
  console.log(playerData);
  return playerData;
  // return "two";
}

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

function findLastMove(team) {

  let dbData = getDbData()
  let reversedDbData =dbData.reverse();
  let lastMove = reversedDbData.find((each) => {
    return each[0] == team;
  });

  console.log(lastMove)

  let lastMoveObj ={
    team: lastMove[0],
    turn: lastMove[1],
    phase: lastMove[2],
    hand: lastMove[3],
    choice: lastMove[4],
    deck: JSON.parse(lastMove[5]),
  }
  return lastMoveObj
}

function getDbData() {
  let dbData = db.getDataRange().getValues()
  dbData.shift()

  return dbData
}

function increaseGameTurn(){
  let currentTurn = getCurrentGameTurn()
  baseGameInfo.getRange('B11').setValue(currentTurn + 1)
}

function getCurrentGameTurn(){
  return baseGameInfo.getRange('B11').getValue()
}




