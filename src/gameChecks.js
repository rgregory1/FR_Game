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

    turnReportArray.push(thisLine)
  })



  playerData.forEach(player => {

    let htmlTemplate = HtmlService.createTemplateFromFile('newTurn')

    htmlTemplate.player = player
    htmlTemplate.turnReport = turnReportArray
    htmlTemplate.gameApiLink = gameApiLink
    htmlTemplate.nextGameTurn = nextGameTurn
    htmlTemplate.table = 'placeholder'

    let htmlForEmail = htmlTemplate.evaluate().getContent()


    MailApp.sendEmail(
      player.email,
      `Play turn ${nextGameTurn}`,
      '',
      {
        htmlBody: htmlForEmail
      }
    )
  })
}


function initiatFirstGameTurn() {
  
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


// [ { rider: 'GreenSprinter', move: 5, draft: 1 },
//   { rider: 'GreenRoller', move: 7, exhaustion: 1 },
//   { rider: 'BlueRoller', move: 6 },
//   { rider: 'BlueSprinter', move: 3, draft: 2 },
//   { rider: 'BlackRoller', move: 6, draft: 1 },
//   { rider: 'BlackSprinter', move: 4, draft: 2 } ]








