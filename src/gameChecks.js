function testForNewTurn() {

  let isGameOver = getGameOver()
  if (isGameOver){
    console.log('Game Over')
    return
  }

  let allPlayerData = getAllLastMoves()


  // let isBreakAway = getBreakAwayStatus()
  // if (isBreakAway){

  // }
  
  // let playerData = getPlayerData()

  // // add turn data to each player
  // playerData.forEach(player => {
  //   let playerData = findLastMove(player.team)
  //   player.turn = playerData.turn
  // })

  let currentGameTurn = getCurrentGameTurn()

  // filter out players who have already positioned for the start
  let stillToPlay = allPlayerData.filter(x => x.turn == currentGameTurn)

  if(stillToPlay.length == 0){

    endOfTurn()
    initiateGameTurn()

  }else {
    console.log('still wating for players')
  }
}




function initiateGameTurn() {
  
  // add one to game turn
  increaseGameTurn()


  let playerData = getPlayerData()
  let nextGameTurn = getCurrentGameTurn() + 1

  // generate turn report to email to each player
  let turnReportObject = getLastSummaryLine()

  let turnReportArray =[]
  let addPlaces = false
  
  
  let isGameOver = checkForGameOver()

  turnReportObject.forEach(line => {
    
    let thisLine = [line.rider,line.move]

    if('reduction' in line){
      thisLine.push(line.reduction)
    }else thisLine.push('')

    if('draft' in line){
      thisLine.push(line.draft)
    }else thisLine.push('')

    if('exhaustion' in line){
      thisLine.push(line.exhaustion)
    }else thisLine.push('')

    if('place' in line){
      thisLine.push(line.place)
      addPlaces = true
    }else thisLine.push('')

    turnReportArray.push(thisLine)
  })

  // get variables for email
  let gameName = getGameName()
  let emailTitle = `${gameName} - Play turn ${nextGameTurn}` 

  let finishData = getFinishData()
  if (finishData.length > 0){

    emailTitle = `${gameName} - A Rider Has Crossed The Finish - Play turn ${nextGameTurn}`

  }

  if(isGameOver){
  
    emailTitle = `${gameName} - Game Over`
  
  }

  playerData.forEach(player => {

    let htmlTemplate = HtmlService.createTemplateFromFile('newTurn')

    htmlTemplate.player = player
    htmlTemplate.turnReport = turnReportArray
    htmlTemplate.gameApiLink = gameApiLink
    htmlTemplate.nextGameTurn = nextGameTurn
    htmlTemplate.isGameOver = isGameOver
    htmlTemplate.addPlaces = addPlaces
    htmlTemplate.finishData = finishData

    let htmlForEmail = htmlTemplate.evaluate().getContent()


    MailApp.sendEmail(
      player.email,
      emailTitle,
      '',
      {
        htmlBody: htmlForEmail
      }
    )
  })

  increaseTurnForFinishedTeams(playerData)

}


function initiatFirstGameTurn() {
  
  // add one to game turn
  increaseGameTurn()

  let gameName = getGameName()
  let playerData = getPlayerData()
  let nextGameTurn = getCurrentGameTurn() + 1

  

  playerData.forEach(player => {
    let body = `<h2>${player.team} Team Play Round ${nextGameTurn}</h2>

    
    Click below to play your cards.
    
    <a href="${gameApiLink}?color=${player.team}">Play Now</a>`
    

    MailApp.sendEmail(
      player.email,
      `${gameName} - Play turn ${nextGameTurn}`,
      '',
      {
        htmlBody: body
      })
  })
}

function testForLaggingPlayer() {
  
  let playerData = getPlayerData()

  // add turn data to each player
  playerData.forEach(player => {
    let playerData = findLastMove(player.team)
    player.turn = playerData.turn
  })

  let currentGameTurn = getCurrentGameTurn()
  let nextGameTurn = getCurrentGameTurn() + 1

  // filter out players who have already positioned for the start
  let stillToPlay = playerData.filter(x => x.turn == currentGameTurn)

  let gameName = getGameName()
  
  if(stillToPlay.length > 0){

    console.log('Still to play: ')

    
    stillToPlay.forEach(player => {

      console.log(player.team)

      let body = `<h2>${player.team} Team Play Round ${nextGameTurn}</h2>

      <b>Looks like everyone is waiting on you to play your turn.</b>

      Click below to play your cards.
      
      <a href="${gameApiLink}?color=${player.team}">Play Now</a>`
      

      MailApp.sendEmail(
        player.email,
        `${gameName} - Play turn ${nextGameTurn} reminder`,
        '',
        {
          htmlBody: body
        })
    })
  }
}


// [ { rider: 'GreenSprinter', move: 5, draft: 1 },
//   { rider: 'GreenRoller', move: 7, exhaustion: 1 },
//   { rider: 'BlueRoller', move: 6 },
//   { rider: 'BlueSprinter', move: 3, draft: 2 },
//   { rider: 'BlackRoller', move: 6, draft: 1 },
//   { rider: 'BlackSprinter', move: 4, draft: 2 } ]


function getFinishData(){

  let finishData = finish.getDataRange().getValues()
  finishData.shift() 
  return finishData

}

function increaseTurnForFinishedTeams(playerData){

  if(playerData === undefined){
    playerData = getPlayerData()
  }

  let dbData = getDbData()

  playerData.forEach(player => {

    let lastMove = findLastMove(player.team, dbData)

    if ( lastMove.special.length == 2){

      increasePlayerGameTurn(lastMove.team)

    }

  })

}




