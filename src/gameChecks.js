function testForNewTurn() {
  
  let playerData = getPlayerData()

  // add turn data to each player
  playerData.forEach(player => {
    let playerData = findLastMove(player.team)
    player.turn = playerData.turn
  })

  let currentGameTurn = getCurrentGameTurn()
  let newTurnNeeded = false

  // filter out players who have already positioned for the start
  let stillToPlay = playerData.filter(x => x.turn == currentGameTurn)

  if(stillToPlay.length == 0){
    initiatNewTurn()
  }else {
    console.log('still wating for players')
  }
}


function initiatNewTurn() {
  
  // add one to game turn
  increaseGameTurn()


  let playerData = getPlayerData()
  let nextGameTurn = getCurrentGameTurn() + 1

  playerData.forEach(player => {
    let body = `<h2>${player.team} Team Play Round ${nextGameTurn}</h2>
    
    Click below to play your cards.
    
    <a href="${gameApiLink}?color=${player.team}">Play Now</a>`
    

    MailApp.sendEmail(
      player.email,
      `Play turn ${nextGameTurn}`,
      '',
      {
        htmlBody: body
      })
  })
}











