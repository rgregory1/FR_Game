function gameLoop(team = "Pink") {

  // check for game end
  let isGameOver = getGameOver()
  if (isGameOver){
    return { type: 'gameOver'}
  }

  let status = findLastMove(team);
  let isBreakAway = getBreakAwayStatus()

  // check if turn has been played
  if ( status.choice.length == 2){

    let gameTurn = getCurrentGameTurn() + 1

    return { type: 'turnPlayed', gameTurn: gameTurn}

  }

  // check if player has two riders past finish
  if ( status.special.length == 2){

    let gameTurn = getCurrentGameTurn() + 1

    return { type: 'finishedPlaying', gameTurn: gameTurn}

  }

  // check if it's time to choose starting positions
  if (status.turn == -1) {
    console.log("choose starting position");

    let possiblePositions = returnPossiblePositions();

    return { type: "startingPositions", positions: possiblePositions };
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

    

  if (status.special.length == 1){

    let finishedRider = status.special[0].finish

    let inPlayRiderDeck = status.deck.findIndex(x => x.name !== finishedRider)

    let inPlayHand = returnHand(status.team, status.deck[inPlayRiderDeck].name)

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


function sendCardChoice(card = '3S', teamColor="White", rider='Sprinter'){

  let deckNumber, nextRider

  let data = findLastMove(teamColor)
  console.log(data)

  // move card to choice and rest of hand to recycle
  let cardIndex = data.hand.hand.indexOf(card)
  data.hand.hand.splice(cardIndex,1)

  if (data.choice){
    data.choice.push({rider: rider, card: card})
  } else {
    data.choice = [{rider: rider, card: card}]
  }

  // if (rider == 'Roller'){
  //   deckNumber = 0
  // } else deckNumber = 1

  deckNumber = data.deck.findIndex(x => x.name == rider)

  data.deck[deckNumber].recycle = [ ...data.deck[deckNumber].recycle, ...data.hand.hand]
  data.hand = {}

  // check for finished rider
  if (data.special.length > 0){

    data.choice.push({rider: data.special[0].finish, card: 'F'})

  }

  if(data.choice.length == 2){
    data.turn = data.turn + 1
  }

  console.log(data)
  updatePlayerTurn(teamColor, data)

  if(data.choice.length == 1){
    console.log('one')
    if(rider == 'Sprinter'){
      nextRider = 'Roller'
    } else {
      nextRider = 'Sprinter'
    }
    let newHand = returnHand(teamColor, nextRider)

    console.log('new hand returned: ', newHand)

    return newHand

  } else {

    console.log('length of choice is 2')
    return 'this turn complete'
  }


}



function increasePlayerGameTurn(team = 'White'){

  let playerData = findLastMove(team)
  playerData.turn = playerData.turn + 1

  updatePlayerTurn(team, playerData)

}







