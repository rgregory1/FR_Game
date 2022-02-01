
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

function findLastMove(team='Blue') {

  let dbData = getDbData()
  let reversedDbData =dbData.reverse();
  let lastMove = reversedDbData.find((each) => {
    return each[0] == team;
  });

  // console.log(lastMove)

  let lastMoveObj ={
    team: lastMove[0],
    special: JSON.parse(lastMove[1]),
    turn: lastMove[2],
    phase: lastMove[3],
    hand: JSON.parse(lastMove[4]),
    choice: JSON.parse(lastMove[5]),
    deck: JSON.parse(lastMove[6]),
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

function getApiUrl(){
  let apiLink = ScriptApp.getService().getUrl()
  console.log(apiLink)
}

function getGameName(){
  let gameName = baseGameInfo.getRange('B12').getValue()
  return gameName
}


function getTrackName(){
  let trackName = baseGameInfo.getRange('B17').getValue()
  return trackName
}

function removeStartNumbers(){

  let trackData = getTrackData()

  trackData.forEach((line, i) => {

    line.forEach((cell, x) => {
      let cellData = cell.split("-")
      if (cellData[0] !== 'B' && cellData[1] !== ''){
        if(!isNaN(cellData[1])){
          console.log('ready for removal', cellData[1])
          track.getRange(i+1, x+1).setValue(cellData[0]+'-')
        } 
      } 

    })
  } )

}


function setGameOver(){
  baseGameInfo.getRange('B15').setValue('Yes')
}

function getGameOver(){
  let isGameOver = baseGameInfo.getRange('B15').getValue()
  if(isGameOver == 'Yes'){
    return true
  } else {
    return false
  }
  
}












