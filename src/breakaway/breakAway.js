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
      
        let breakawayResults = []
        let breakawayResultsUnsorted = []

        allTurnData.forEach(line => {

          // TODO sort this array with winners at top
          breakawayResultsUnsorted.push(
                                [
                                  line.team,
                                  line.choice[0].rider,
                                  line.choice[0].card.charAt(0),
                                  line.choice[1].card.charAt(0),
                                  Number(line.choice[0].card.charAt(0)) + Number(line.choice[1].card.charAt(0))
                                ])
        })

        let allPlayerData = getPlayerData()
        let trackData = getTrackData()

        // incase of tie arrange riders in order from back left to front right 
        let currentPositions = getCurrentPositions(allPlayerData, trackData, 'breakaway')

        // create new array so when sorted by value back to front order is maintained
        currentPositions.forEach(position => {
          let thisRider = breakawayResultsUnsorted.find(x => x[0] + x[1] == position.rider)
          if(thisRider){
            breakawayResults.push(thisRider)
          }
          
        })

        // arrange so top bids are first
        breakawayResults.sort((firstItem, secondItem) => secondItem[4] - firstItem[4])
 
        // get number of winning riders
        let winningSpots = getBreakAwaySpots()
        let winners = breakawayResults.slice(0,winningSpots)
        let winnerList = []
        
        winners.forEach(winner => {
          winnerList.push(winner[0] + winner[1])
        })

        winners.forEach((winner, i) => {
          
          // TODO update rider deck
          processBreakAwayWinnerCards(winner[0], winner[1])

          // TODO move rider
          moveWinningBreakawayRider(winner[0]+winner[1], i + 1, trackData)

        })
        
        // put cards back in, combine, and shufffle decks
        resetDecksAfterBreakaway()

        allTurnData.forEach(turn => {

          let thisPlayer = allPlayerData.find(x => x.team == turn.team)

          // notify players
          let emailTitle = `${turn.team} - Second Round Breakaway Bid Results`
      
          let htmlTemplate = HtmlService.createTemplateFromFile('breakawayEmail')

          htmlTemplate.player = turn
          htmlTemplate.turnReport = breakawayResults
          htmlTemplate.gameApiLink = gameApiLink
          htmlTemplate.message = 'Breakaway Bidding Has Finished'
          htmlTemplate.isFirstRound = false
          htmlTemplate.winnerList = winnerList

          let htmlForEmail = htmlTemplate.evaluate().getContent()


          MailApp.sendEmail(
            thisPlayer.email,
            emailTitle,
            '',
            {
              htmlBody: htmlForEmail
            }
          )
      })

    setBreakawayCounterToZero()

    return
  
    } 

    
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
                              line.choice[0].card.charAt(0)
                            ])
    })

    let allPlayerData = getPlayerData()

    allTurnData.forEach(turn => {

      turn.phase.push('first round complete')
      updatePlayerTurn(turn.team, turn)

      let thisPlayer = allPlayerData.find(x => x.team == turn.team)

      // notify players
      let emailTitle = `${turn.team} - First Round Breakaway Bid Results`
  
      let htmlTemplate = HtmlService.createTemplateFromFile('breakawayEmail')

      htmlTemplate.player = turn
      htmlTemplate.turnReport = breakawayResults
      htmlTemplate.gameApiLink = gameApiLink
      htmlTemplate.message = 'Choose Your Second Breakaway Bid'
      htmlTemplate.isFirstRound = true
      htmlTemplate.winnerList = []

      let htmlForEmail = htmlTemplate.evaluate().getContent()


      MailApp.sendEmail(
        thisPlayer.email,
        emailTitle,
        '',
        {
          htmlBody: htmlForEmail
        }
      )
  })


  }
}



// nutty comment






