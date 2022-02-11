function initiateBreakaway() {
  
  let playerData = getPlayerData()

  let allLastMoves = getAllLastMoves()

  allLastMoves.forEach(turn => {

    turn.turn = 'B'
    updatePlayerTurn(turn.team, turn)

  })

  playerData.forEach(player => {

    let htmlForEmail =  `<h3>Time to choose your breakaway Rider</h3>
    
    <a href="${gameApiLink}?color=${player.team}">Click here to begin</a>`

    MailApp.sendEmail(
      player.email,
      `${player.team} Team - Choose Your Breakaway Rider`,
      '',
      {
        htmlBody: htmlForEmail
      }
    )

  })
}


function breakawayLoop(team = 'Pink'){

  let status = findLastMove(team);

  // check if first choice complete 
  if (status.phase[0] == 'first round complete'){

    // check if hand already choosen
    if (status.choice.length == 1 && JSON.stringify(status.hand) !== '{}'){
      return { 
            type: 'deckReturn', 
            hand: status.hand, 
            rider: status.hand.rider
          }
    }

    // check if breakaway rider needs a hand to pick from
    if (status.choice.length == 1 && JSON.stringify(status.hand) === '{}'){

      let breakawayRider = status.choice[0].rider

      let inPlayHand = returnHand(status.team, breakawayRider)

      console.log(inPlayHand.hand)

      return {
              type: 'deckReturn',
              hand: {
                      hand: inPlayHand.hand,
                      rider: inPlayHand.rider
                    },
              rider: inPlayHand.rider
          }

    }
  }

  // if rider has been choose and screen refreshed return previously selected hand
  if (JSON.stringify(status.hand) !== '{}'){
    return { 
            type: 'deckReturn', 
            hand: status.hand, 
            rider: status.hand.rider
          }
  }

  // check if rider hasn't choosen a rider yet
  if (status.choice.length == 0 && JSON.stringify(status.hand) === '{}'){
    return { type: "chooseDeck"};
  }

  
}

function returnBreakawayHand(color = 'Pink', rider = 'Roller') {
  let status = findLastMove(color)

  let energyDeck, hand, deckIndex 

  status['deck'].forEach((deck, i) =>{
    if (deck.name == rider){
      energyDeck = deck.energyDeck
      deckIndex = i
    }
  })

  // grab four cards 
  hand = {rider: rider, hand: energyDeck.splice(0,4).sort()}
  
  console.log("hand", hand)
  console.log('energyDeck', energyDeck)

  // update hand and energy deck
  status.hand = hand
  status.deck[deckIndex].energyDeck = energyDeck
    

  // return hand to page
  updatePlayerTurn(color, status)

  return hand // {rider: rider, hand: hand}
}

function sendBreakawayCardChoice(card = '3R', teamColor="Pink", rider='Roller'){

  let deckNumber, nextRider

  let data = findLastMove(teamColor)
  // console.log(data)

  // move card to choice and rest of hand to recycle
  let cardIndex = data.hand.hand.indexOf(card)
  data.hand.hand.splice(cardIndex,1)

  if (data.choice){
    data.choice.push({rider: rider, card: card})
  } else {
    data.choice = [{rider: rider, card: card}]
  }

  deckNumber = data.deck.findIndex(x => x.name == rider)

  data.deck[deckNumber].recycle = [ ...data.deck[deckNumber].recycle, ...data.hand.hand]
  data.hand = {}

  updatePlayerTurn(teamColor,data)

  checkForBreakawayCompletion()

  return 'this turn complete'

}

function checkForBreakawayCompletion(){

  let allTurnData = getAllLastMoves()

  let secondRound = false

  allTurnData.forEach(turn => {
    if (turn.phase[0] == 'first round complete'){
      secondRound = true
    }
  })

  if (secondRound) {

    let secondRoundCheck = allTurnData.filter(x => x.choice.length !== 2)

    if (secondRoundCheck.length !== 0){

      console.log('still waiting for players')
      
      return 

    } else {    

        console.log('process second round')
    } 

    return
  }



  let firstRoundCheck = allTurnData.filter(x => x.choice.length !== 1)

  if (firstRoundCheck.length !== 0){

    console.log('still waiting for players')
    return 

  } else {

    let breakawayResults = []

    allTurnData.forEach(line => {

      breakawayResults.push(
                            [
                              line.team,
                              line.choice[0].rider,
                              line.choice[0].card
                            ])
    })

    let allPlayerData = getPlayerData()

    allTurnData.forEach(turn => {

      turn.phase.push('first round complete')
      updatePlayerTurn(turn.team, turn)

      let thisPlayer = allPlayerData.find(x => x.team == turn.team)

      // notify players
      let htmlTemplate = HtmlService.createTemplateFromFile('breakawayEmail')

      htmlTemplate.player = turn
      htmlTemplate.turnReport = breakawayResults
      htmlTemplate.gameApiLink = gameApiLink
      htmlTemplate.nextGameTurn = 'Second Breakaway Bid'

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


  }
}










