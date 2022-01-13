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
    initiatGameTurn()
  }else {
    console.log('still wating for players')
  }
}


function initiatGameTurn() {
  
  // add one to game turn
  increaseGameTurn()


  let playerData = getPlayerData()
  let nextGameTurn = getCurrentGameTurn() + 1

  // generate turn report to email to each player
  let turnReport = getLastSummaryLine()

  let table = '<table><tbody><tr> <th>Rider</th><th>Card Played</th><th>Reduction</th><th>Draft</th><th>Exhaustion</th> </tr>'

  turnReport.forEach(line => {
    table += '<tr>'

    table += `<td>${line.rider}</td><td>${line.move}</td>`

    if('reduction' in line){
      table +=`<td>${line.reduction}</td>`
    }else table += '<td></td>'

    if('draft' in line){
      table +=`<td>${line.draft}</td>`
    }else table += '<td></td>'

    if('exhaustion' in line){
      table +=`<td>${line.exhaustion}</td>`
    }else table += '<td></td>'

    table += '</tr>'
  })

  table += '</tbody></table>'

  playerData.forEach(player => {
    let body = `<h2>${player.team} Team Play Round ${nextGameTurn}</h2>

    Last turn summary:
    ${table}
    
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








