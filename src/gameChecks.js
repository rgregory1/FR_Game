/**
 * this function can be set on a timer and will begin new turns
 * once eveyone has played
 */
function testForNewTurn() {
  let isGameOver = getGameOver()
  if (isGameOver) {
    console.log("Game Over")
    return
  }

  let allPlayerData = getAllLastMoves()

  let currentGameTurn = getCurrentGameTurn()

  // filter out players who have already positioned for the start
  let stillToPlay = allPlayerData.filter(x => x.turn == currentGameTurn)

  if (stillToPlay.length == 0) {
    endOfTurn()
    initiateGameTurn()
  } else {
    console.log("still wating for players")
  }
}

/**
 * begins a new game turn by incrementing the turn counter
 * and sending out emails to everone with a summary of the last turn
 * and a link to play the next one
 */
function initiateGameTurn() {
  // add one to game turn
  increaseGameTurn()

  let playerData = getPlayerData()
  let nextGameTurn = getCurrentGameTurn() + 1

  // generate turn report to email to each player
  let turnReportObject = getLastSummaryLine()

  let turnReportArray = []
  let addPlaces = false

  let isGameOver = checkForGameOver()

  turnReportObject.forEach(line => {
    let thisLine = [line.rider, line.move]

    if ("reduction" in line) {
      thisLine.push(line.reduction)
    } else thisLine.push("")

    if ("draft" in line) {
      thisLine.push(line.draft)
    } else thisLine.push("")

    if ("exhaustion" in line) {
      thisLine.push(line.exhaustion)
    } else thisLine.push("")

    if ("place" in line) {
      thisLine.push(line.place)
      addPlaces = true
    } else thisLine.push("")

    turnReportArray.push(thisLine)
  })

  // get variables for email
  let gameName = getGameName()
  let emailTitle = `${gameName} - Play turn ${nextGameTurn}`

  let finishData = getFinishData()
  if (finishData.length > 0) {
    emailTitle = `${gameName} - A Rider Has Crossed The Finish - Play turn ${nextGameTurn}`
  }

  if (isGameOver) {
    emailTitle = `${gameName} - Game Over`
  }

  playerData.forEach(player => {
    let htmlTemplate = HtmlService.createTemplateFromFile("newTurn")

    htmlTemplate.player = player
    htmlTemplate.turnReport = turnReportArray
    htmlTemplate.gameApiLink = gameApiLink
    htmlTemplate.nextGameTurn = nextGameTurn
    htmlTemplate.isGameOver = isGameOver
    htmlTemplate.addPlaces = addPlaces
    htmlTemplate.finishData = finishData

    let htmlForEmail = htmlTemplate.evaluate().getContent()

    MailApp.sendEmail(player.email, emailTitle, "", {
      htmlBody: htmlForEmail,
    })
  })

  increaseTurnForFinishedTeams(playerData)
}

/**
 * This is the initial email to start the game
 * only used once
 */
function initiateFirstGameTurn() {
  // TODO can this be incorporated into something else?
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
      "",
      {
        htmlBody: body,
      }
    )
  })
}

/**
 * this is a reminder email function, at a certain interval it should
 * track if a player has moved, then check again after time and send message if
 * a move has still not occured
 */
function testForLaggingPlayer() {
  // test for game over
  let isGameOver = getGameOver()
  if (isGameOver) {
    return
  }

  // TODO this function needs more help to be able to track effectively
  let playerData = getPlayerData()
  let allPlayerMoves = getAllLastMoves(playerData)

  // add turn data to each player
  allPlayerMoves.forEach(player => {
    let thisStatus = playerData.find(x => x.team == player.team)
    player.email = thisStatus.email
  })

  let currentGameTurn = getCurrentGameTurn()
  let nextGameTurn = getCurrentGameTurn() + 1

  // filter out players who have already positioned for the start
  let stillToPlay = allPlayerMoves.filter(x => x.turn == currentGameTurn)

  let gameName = getGameName()

  // process players still to play
  if (stillToPlay.length > 0) {
    console.log(
      "Still to play: ",
      stillToPlay.map(x => x.team)
    )

    stillToPlay.forEach(status => {
      if (JSON.stringify(status.lag) === "{}") {
        console.log("empty here")
        status.lag.timeStamp = Utilities.formatDate(
          new Date(),
          SpreadsheetApp.getActive().getSpreadsheetTimeZone(),
          "dd/mm/YYYY hh:mm a"
        )
        updatePlayerTurn(status.team, status)
      } else if ("reminder" in status.lag) {
        // make turn for the player
        console.log("make turn")
        console.log(status.team)

        autoplayTurn(status.team)

        let body = `<h2>${status.team} Team Autoplayed for ${nextGameTurn}</h2>

          <b>Your turn was played due to inactivity`

        MailApp.sendEmail(
          status.email,
          `${gameName} - Autoplay notification`,
          "",
          {
            htmlBody: body,
          }
        )
      } else {
        // add reminder and send email reminder
        console.log("need to add reminder")
        status.lag.reminder = "x"
        updatePlayerTurn(status.team, status)

        let body = `<h2>${status.team} Team Play Round ${nextGameTurn}</h2>

            <b>Looks like everyone is waiting on you to play your turn.</b>

            Click below to play your cards.
            
            <a href="${gameApiLink}?color=${status.team}">Play Now</a>`

        MailApp.sendEmail(
          status.email,
          `${gameName} - Play turn ${nextGameTurn} reminder`,
          "",
          {
            htmlBody: body,
          }
        )
      }
    })
  }

  // if (stillToPlay.length > 0) {

  //   stillToPlay.forEach((player) => {
  //     console.log(player.team);

  //     let body = `<h2>${player.team} Team Play Round ${nextGameTurn}</h2>

  //     <b>Looks like everyone is waiting on you to play your turn.</b>

  //     Click below to play your cards.

  //     <a href="${gameApiLink}?color=${player.team}">Play Now</a>`;

  //     MailApp.sendEmail(
  //       player.email,
  //       `${gameName} - Play turn ${nextGameTurn} reminder`,
  //       "",
  //       {
  //         htmlBody: body,
  //       }
  //     );
  //   });
  // }
}

// [ { rider: 'GreenSprinter', move: 5, draft: 1 },
//   { rider: 'GreenRoller', move: 7, exhaustion: 1 },
//   { rider: 'BlueRoller', move: 6 },
//   { rider: 'BlueSprinter', move: 3, draft: 2 },
//   { rider: 'BlackRoller', move: 6, draft: 1 },
//   { rider: 'BlackSprinter', move: 4, draft: 2 } ]

/**
 * auto-play players turn
 * @param {string} team - team to autoplay
 */
function autoplayTurn(team = "Black") {
  let status = getLastMove()

  let riders = [status.deck[0].name, status.deck[1].name]

  let firstRiderHand = returnHand(team, riders[0])

  let secondRiderHand = sendCardChoice(
    firstRiderHand.hand[0],
    team,
    firstRiderHand.rider
  )

  sendCardChoice(secondRiderHand[0], team, secondRiderHand.rider)

  console.log("the end")
}

/**
 * retrieves data from finish table
 * @returns {array of arrays} - finish data for processing
 */
function getFinishData() {
  let finishData = finish.getDataRange().getValues()
  finishData.shift()
  return finishData
}

/**
 * increments the turn number for each team that has two riders over the
 * finish line allowing turns to progress
 */
function increaseTurnForFinishedTeams() {
  let allLastMoves = getAllLastMoves()

  allLastMoves.forEach(status => {
    if (status.special.length == 2) {
      increasePlayerGameTurn(status.team)
    }
  })
}
