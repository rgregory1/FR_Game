

/**
 *  grabs available starting positions in the track based on the initial 
 *  letter all cells that start with 'S' and end in a number ar returned
 */
function returnPossiblePositions() {
  let rawStartPositions = track.getDataRange().getValues().flat();
  // let rawStartPositions = track.getRange(2, 1, 2, 5).getValues().flat();

  rawStartPositions = rawStartPositions.filter(x => x.charAt(0) == 'S')

  let startPositions = []

  rawStartPositions.forEach(x => {
    let available = x.split("-")
    startPositions.push(available[1])
    })

  let validStarts = startPositions.filter((x) =>  !isNaN(x));
  console.log(validStarts);

  // reverse options so they come out in ascending order when pushed
  validStarts.sort(function (a, b) {
    return b - a;
  });

  console.log(validStarts);

  return validStarts.reverse();
}

/**
 *  takes the parameters and adds the riders to the track
 */
function sendStartingPos(parameter = {sprinter: 8,roller: 5, teamColor: 'Black'}) {
  // console.log('from the app: ',parameter.roller)
  // console.log('from the app: ',parameter.sprinter)

  let startPositions = track.getDataRange().getValues();

  startPositions.forEach((line, index) => {

    var spIndex = line.indexOf('S-' + parameter.sprinter);

    if (spIndex !== -1) {
      track.getRange(index+1,spIndex+1).setValue('S-' + parameter.teamColor + 'Sprinter');
    }

    var roIndex = line.indexOf('S-' + parameter.roller);

    if (roIndex !== -1) {
      track.getRange(index+1,roIndex+1).setValue('S-' + parameter.teamColor + 'Roller');
    }
  });

  // track.getRange(2, 1, 2, 5).setValues(startPositions);
  SpreadsheetApp.flush();

  // increase turn count so they won't be choosing stating positions next time
  incrementPlayerTurn(parameter.teamColor)

  emailNextTeam()

  return;
}


function emailNextTeam(){

  let allPlayerData = getPlayerData()

  // add turn data to each player
  allPlayerData.forEach(player => {
    let playerData = findLastMove(player.team)
    player.turn = playerData.turn
  })

  // filter out players who have already positioned for the start
  let possiblePlayers = allPlayerData.filter(x => x.turn == -1)

  if(possiblePlayers.length !== 0){
    let random = Math.floor(Math.random() * possiblePlayers.length)

    // get random player
    let nextPlayer = possiblePlayers[random]

    let body = `<h2>Congratulations ${nextPlayer.team} Team!</h2>
    
    It's your turn to pick your starting positions
    
    <a href="${gameApiLink}?color=${nextPlayer.team}">Choose starting positions now</a>`
    console.log(nextPlayer)

    MailApp.sendEmail(
      nextPlayer.email,
      'Pick your starting positions',
      '',
      {
        htmlBody: body
      })
  } else {

    initiatNewTurn()
    console.log('begin the game')
  }




  // let currentTeam = allPlayerData.findIndex(x => x.team == team)

}


/**
 * incriments the turn number for current player
 */
function incrementPlayerTurn(team='Black'){

   let playerData = findLastMove(team)

   playerData.turn = playerData.turn + 1 
   console.log(playerData)

   db.appendRow([
     playerData.team,
     playerData.turn,
     playerData.phase,
     playerData.hand,
     playerData.choice,
     JSON.stringify(playerData.deck)
   ])


}











